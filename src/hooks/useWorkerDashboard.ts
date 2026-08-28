import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { fetchWorkerDashboardData, updateBookingStatus, confirmPaymentAsReceived } from '@/lib/dataService';
import type { Booking, Payment } from '@/lib/supabase';

interface BookingWithCustomer extends Booking {
  customer?: { name: string; phone: string } | null;
}

interface PaymentWithBooking extends Payment {
  bookings?: { customer_id: string; address: string } | null;
}

export function useWorkerDashboard() {
  const { user, workerProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingWithCustomer[]>([]);
  const [payments, setPayments] = useState<PaymentWithBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState<{ booking: BookingWithCustomer; payment?: PaymentWithBooking } | null>(null);
  const [upiId, setUpiId] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  }, []);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const data = await fetchWorkerDashboardData(user.id);
      setBookings(data.bookings as BookingWithCustomer[]);
      setPayments(data.payments as PaymentWithBooking[]);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (workerProfile) {
      setUpiId(workerProfile.upi_id);
      setHourlyRate(String(workerProfile.hourly_rate));
      fetchData();
    } else {
      setLoading(false);
    }
  }, [workerProfile, authLoading, fetchData]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [user, fetchData]);

  const handleConfirmPayment = useCallback(async (paymentId: string) => {
    setConfirmingId(paymentId);
    setPayments((prev) =>
      prev.map((p) => (p.id === paymentId ? { ...p, status: 'paid', paid_at: new Date().toISOString() } : p))
    );
    showToast('Payment confirmed as received!');
    try {
      await confirmPaymentAsReceived(paymentId);
      await fetchData();
    } catch {
      alert('Failed to confirm payment');
      await fetchData();
    } finally {
      setConfirmingId(null);
    }
  }, [fetchData, showToast]);

  const handleUpdateBookingStatus = useCallback(async (bookingId: string, status: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
    );

    if (status === 'confirmed') {
      showToast('🎉 Job Accepted successfully! Customer notified to pay via UPI.');
    } else if (status === 'cancelled') {
      showToast('Job Declined and removed from active queue.');
    } else if (status === 'completed' || status === 'paid') {
      showToast('Job marked as Completed.');
    }

    try {
      await updateBookingStatus(bookingId, status);
      await fetchData();
    } catch {
      alert('Failed to update booking status');
      await fetchData();
    }
  }, [fetchData, showToast]);

  const handleSaveSettings = useCallback(async () => {
    if (!workerProfile) return;
    setSavingSettings(true);
    setSettingsMsg('');
    try {
      workerProfile.upi_id = upiId;
      workerProfile.hourly_rate = parseFloat(hourlyRate) || workerProfile.hourly_rate;
      setSettingsMsg('Settings saved successfully');
      setTimeout(() => setShowSettings(false), 1200);
    } catch {
      setSettingsMsg('Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  }, [workerProfile, upiId, hourlyRate]);

  const totalEarnings = payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0);
  const pendingPayments = payments.filter((p) => p.status === 'payment_submitted');
  const activeBookings = bookings.filter((b) => ['pending', 'confirmed', 'in_progress'].includes(b.status));
  const completedJobs = bookings.filter((b) => b.status === 'paid' || b.status === 'completed');

  return {
    user,
    workerProfile,
    authLoading,
    loading,
    navigate,
    bookings,
    payments,
    confirmingId,
    showSettings,
    setShowSettings,
    selectedSlip,
    setSelectedSlip,
    upiId,
    setUpiId,
    hourlyRate,
    setHourlyRate,
    savingSettings,
    settingsMsg,
    toastMsg,
    totalEarnings,
    pendingPayments,
    activeBookings,
    completedJobs,
    handleConfirmPayment,
    handleUpdateBookingStatus,
    handleSaveSettings,
  };
}
