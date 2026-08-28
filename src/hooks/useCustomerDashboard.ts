import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchCustomerDashboardData } from '@/lib/dataService';
import type { Booking, Payment } from '@/lib/supabase';

interface BookingWithWorker extends Booking {
  worker?: { id: string; category: string; hourly_rate: number; users?: { name: string } | null } | null;
}

interface PaymentWithBooking extends Payment {
  bookings?: { id: string; category: string } | null;
}

export function useCustomerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<BookingWithWorker[]>([]);
  const [payments, setPayments] = useState<PaymentWithBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlip, setSelectedSlip] = useState<{ booking: BookingWithWorker; payment?: PaymentWithBooking } | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const data = await fetchCustomerDashboardData(user.id);
      setBookings(data.bookings as BookingWithWorker[]);
      setPayments(data.payments as PaymentWithBooking[]);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (user) fetchData();
    else setLoading(false);
  }, [user, authLoading, fetchData]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [user, fetchData]);

  const activeBookings = bookings.filter((b) => ['pending', 'confirmed', 'in_progress', 'payment_submitted'].includes(b.status));
  const completedBookings = bookings.filter((b) => b.status === 'paid' || b.status === 'completed');
  const totalSpent = payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0);
  const pendingPayments = payments.filter((p) => p.status === 'pending' || p.status === 'payment_submitted');

  return {
    user,
    authLoading,
    loading,
    bookings,
    payments,
    selectedSlip,
    setSelectedSlip,
    activeBookings,
    completedBookings,
    totalSpent,
    pendingPayments,
  };
}
