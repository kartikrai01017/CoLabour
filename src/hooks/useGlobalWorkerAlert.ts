import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  fetchWorkerDashboardData,
  updateBookingStatus,
  confirmPaymentAsReceived,
  rejectPaymentDispute,
} from '@/lib/dataService';
import type { Booking, Payment } from '@/lib/supabase';

interface PendingBookingItem extends Booking {
  customer?: { name: string; phone: string } | null;
}

interface PaymentItem extends Payment {
  bookings?: { customer_id: string; address: string; category?: string } | null;
}

export function useGlobalWorkerAlert() {
  const { user } = useAuth();
  const [incomingJob, setIncomingJob] = useState<PendingBookingItem | null>(null);
  const [paymentAlert, setPaymentAlert] = useState<PaymentItem | null>(null);
  const [processing, setProcessing] = useState(false);
  const [dismissedJobs, setDismissedJobs] = useState<Set<string>>(new Set());
  const [dismissedPayments, setDismissedPayments] = useState<Set<string>>(new Set());

  const checkAlerts = useCallback(async () => {
    if (!user || user.role !== 'worker') return;

    try {
      const data = await fetchWorkerDashboardData(user.id);

      const pendingJobs = (data.bookings || []).filter(
        (b) => b.status === 'pending' && !dismissedJobs.has(b.id)
      ) as PendingBookingItem[];

      if (pendingJobs.length > 0) {
        setIncomingJob(pendingJobs[0]);
      } else {
        setIncomingJob(null);
      }

      const pendingPayments = (data.payments || []).filter(
        (p) => p.status === 'payment_submitted' && !dismissedPayments.has(p.id)
      ) as PaymentItem[];

      if (pendingPayments.length > 0) {
        setPaymentAlert(pendingPayments[0]);
      } else {
        setPaymentAlert(null);
      }
    } catch {
      // ignore
    }
  }, [user, dismissedJobs, dismissedPayments]);

  useEffect(() => {
    if (!user || user.role !== 'worker') return;
    checkAlerts();
    const interval = setInterval(checkAlerts, 2500);
    return () => clearInterval(interval);
  }, [user, checkAlerts]);

  const handleAcceptJob = useCallback(async () => {
    if (!incomingJob) return;
    setProcessing(true);
    try {
      await updateBookingStatus(incomingJob.id, 'confirmed');
      setDismissedJobs((prev) => new Set(prev).add(incomingJob.id));
      setIncomingJob(null);
      await checkAlerts();
    } catch {
      alert('Failed to accept booking');
    } finally {
      setProcessing(false);
    }
  }, [incomingJob, checkAlerts]);

  const handleDeclineJob = useCallback(async () => {
    if (!incomingJob) return;
    setProcessing(true);
    try {
      await updateBookingStatus(incomingJob.id, 'cancelled');
      setDismissedJobs((prev) => new Set(prev).add(incomingJob.id));
      setIncomingJob(null);
      await checkAlerts();
    } catch {
      alert('Failed to decline booking');
    } finally {
      setProcessing(false);
    }
  }, [incomingJob, checkAlerts]);

  const handleConfirmPayment = useCallback(async () => {
    if (!paymentAlert) return;
    setProcessing(true);
    try {
      await confirmPaymentAsReceived(paymentAlert.id);
      setDismissedPayments((prev) => new Set(prev).add(paymentAlert.id));
      setPaymentAlert(null);
      await checkAlerts();
    } catch {
      alert('Failed to confirm payment');
    } finally {
      setProcessing(false);
    }
  }, [paymentAlert, checkAlerts]);

  const handleRejectPayment = useCallback(async () => {
    if (!paymentAlert) return;
    setProcessing(true);
    try {
      await rejectPaymentDispute(paymentAlert.id);
      setDismissedPayments((prev) => new Set(prev).add(paymentAlert.id));
      setPaymentAlert(null);
      await checkAlerts();
    } catch {
      alert('Failed to reject payment');
    } finally {
      setProcessing(false);
    }
  }, [paymentAlert, checkAlerts]);

  const dismissJob = useCallback(() => {
    if (!incomingJob) return;
    setDismissedJobs((prev) => new Set(prev).add(incomingJob.id));
    setIncomingJob(null);
  }, [incomingJob]);

  const dismissPayment = useCallback(() => {
    if (!paymentAlert) return;
    setDismissedPayments((prev) => new Set(prev).add(paymentAlert.id));
    setPaymentAlert(null);
  }, [paymentAlert]);

  const shouldShow = user?.role === 'worker';

  return {
    shouldShow,
    incomingJob,
    paymentAlert,
    processing,
    handleAcceptJob,
    handleDeclineJob,
    handleConfirmPayment,
    handleRejectPayment,
    dismissJob,
    dismissPayment,
  };
}
