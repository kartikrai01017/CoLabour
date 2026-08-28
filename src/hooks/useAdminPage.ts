import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchAdminData, toggleWorkerVerification, resolvePaymentDispute } from '@/lib/dataService';
import type { WorkerProfile, Booking, Payment } from '@/lib/supabase';

interface WorkerWithUser extends WorkerProfile {
  users?: { name: string; email: string } | null;
}

export function useAdminPage() {
  const { loading: authLoading } = useAuth();
  const [workers, setWorkers] = useState<WorkerWithUser[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [disputes, setDisputes] = useState<Payment[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const data = await fetchAdminData();
      setWorkers(data.workers as unknown as WorkerWithUser[]);
      setBookings(data.bookings);
      setPayments(data.payments);
      setDisputes(data.payments.filter((p) => p.status === 'payment_submitted'));
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    fetchData();
  }, [authLoading, fetchData]);

  const handleToggleVerify = useCallback(async (workerId: string, current: boolean) => {
    try {
      await toggleWorkerVerification(workerId, current);
      await fetchData();
    } catch {
      alert('Failed to update verification');
    }
  }, [fetchData]);

  const handleResolveDispute = useCallback(async (paymentId: string) => {
    try {
      await resolvePaymentDispute(paymentId);
      await fetchData();
    } catch {
      alert('Failed to resolve dispute');
    }
  }, [fetchData]);

  const totalRevenue = payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0);
  const verifiedWorkers = workers.filter((w) => w.is_verified).length;
  const pendingVerifications = workers.filter((w) => !w.is_verified).length;
  const activeBookings = bookings.filter((b) => ['pending', 'confirmed', 'in_progress', 'payment_submitted'].includes(b.status)).length;

  return {
    authLoading,
    loading,
    workers,
    bookings,
    payments,
    disputes,
    totalRevenue,
    verifiedWorkers,
    pendingVerifications,
    activeBookings,
    handleToggleVerify,
    handleResolveDispute,
  };
}
