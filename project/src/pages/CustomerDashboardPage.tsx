import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, MapPin, Wallet, Clock, Loader2, ArrowRight, Briefcase, CheckCircle,
  Receipt, TrendingUp, AlertCircle, Hourglass, XCircle
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { GlowOrb, AnimatedCounter } from '@/components/ui/Shared';
import { supabase, type Booking, type Payment } from '@/lib/supabase';
import { CATEGORY_ICONS, getCategoryStyle } from '@/lib/categories';
import { useAuth } from '@/context/AuthContext';

interface BookingWithWorker extends Booking {
  worker?: { id: string; category: string; hourly_rate: number; users?: { name: string } | null } | null;
}

interface PaymentWithBooking extends Payment {
  bookings?: { id: string; category: string } | null;
}

export function CustomerDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<BookingWithWorker[]>([]);
  const [payments, setPayments] = useState<PaymentWithBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;

    const { data: bookingData } = await supabase
      .from('bookings')
      .select('*, worker:worker_profiles!bookings_worker_id_fkey(id, category, hourly_rate, users:user_id(name))')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false });

    setBookings((bookingData as unknown as BookingWithWorker[]) ?? []);

    const { data: paymentData } = await supabase
      .from('payments')
      .select('*, bookings(id, category)')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false });

    setPayments((paymentData as unknown as PaymentWithBooking[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (user) fetchData();
  }, [user, authLoading, fetchData]);

  // Poll for status updates
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [user, fetchData]);

  const activeBookings = bookings.filter((b) => ['pending', 'confirmed', 'in_progress', 'payment_submitted'].includes(b.status));
  const completedBookings = bookings.filter((b) => b.status === 'paid' || b.status === 'completed');
  const totalSpent = payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0);
  // Only payments that actually need action: confirmed bookings with pending payment, or submitted awaiting verification
  const needsPayment = payments.filter((p) => p.status === 'pending' && bookings.find((b) => b.id === p.booking_id && b.status === 'confirmed'));
  const awaitingVerification = payments.filter((p) => p.status === 'payment_submitted');
  const pendingPayments = payments.filter((p) => p.status === 'pending' || p.status === 'payment_submitted'); // for stats
  // For Pay Now banner, prioritize confirmed -> pending payment
  const actionablePayment = needsPayment[0] ?? awaitingVerification[0] ?? null;

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-16">
        <Loader2 size={32} className="animate-spin text-neon-emerald" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden pt-20 pb-12">
      <GlowOrb className="top-20 -left-20 h-80 w-80 bg-neon-emerald/10" />
      <GlowOrb className="bottom-0 right-0 h-80 w-80 bg-neon-cyan/10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-white">My Dashboard</h1>
            <p className="text-sm text-gray-400">Welcome back, {user?.name}</p>
          </div>
          <Link to="/workers">
            <NeonButton variant="emerald"><Briefcase size={16} /> Book a Worker</NeonButton>
          </Link>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={Calendar} label="Active Bookings" value={activeBookings.length} color="cyan" />
          <StatCard icon={CheckCircle} label="Completed" value={completedBookings.length} color="emerald" />
          <StatCard icon={Wallet} label="Total Spent" value={`₹${totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} color="violet" />
          <StatCard icon={Clock} label="Pending Payments" value={pendingPayments.length} color="amber" />
        </div>

        {/* Pending payments alert - only actionable */}
        {actionablePayment && (
          <GlassCard className="mb-6 border-amber-500/30 p-4 animate-slide-up">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-amber-400 animate-pulse" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-400">
                  {actionablePayment.status === 'payment_submitted'
                    ? `Payment submitted - awaiting worker verification`
                    : `You have ${needsPayment.length} booking(s) ready for payment`}
                </p>
                <p className="text-xs text-gray-400">
                  {actionablePayment.status === 'payment_submitted' ? 'Worker will confirm receipt shortly' : 'Complete your payment to proceed with the booking'}
                </p>
              </div>
              <Link to={`/payment/${actionablePayment.booking_id}`}>
                <NeonButton size="sm" variant={actionablePayment.status === 'payment_submitted' ? 'cyan' : 'emerald'}>
                  {actionablePayment.status === 'payment_submitted' ? 'Track Payment' : 'Pay Now'} <ArrowRight size={14} />
                </NeonButton>
              </Link>
            </div>
          </GlassCard>
        )}
        {awaitingVerification.length > 0 && needsPayment.length === 0 && null}
        {pendingPayments.length > 0 && !actionablePayment && (
          <GlassCard className="mb-6 border-amber-500/20 p-3 text-xs text-gray-400">
            {pendingPayments.length} payment(s) in {pendingPayments[0].status} state waiting for booking confirmation.
          </GlassCard>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Active bookings */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-200">
              <Clock size={18} className="text-neon-cyan" /> Active Bookings
            </h2>
            <div className="space-y-4">
              {activeBookings.length === 0 ? (
                <GlassCard className="p-8 text-center">
                  <p className="text-gray-500 mb-4">No active bookings</p>
                  <Link to="/workers"><NeonButton variant="ghost" size="sm">Browse Workers</NeonButton></Link>
                </GlassCard>
              ) : (
                activeBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              )}
            </div>
          </div>

          {/* Completed & receipts */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-200">
              <Receipt size={18} className="text-neon-emerald" /> History & Receipts
            </h2>
            <div className="space-y-4">
              {completedBookings.length === 0 ? (
                <GlassCard className="p-8 text-center text-gray-500">No completed bookings yet</GlassCard>
              ) : (
                completedBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} showReceipt />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Wallet; label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = {
    emerald: 'text-neon-emeraldGlow bg-neon-emerald/10 border-neon-emerald/30',
    cyan: 'text-neon-cyanGlow bg-neon-cyan/10 border-neon-cyan/30',
    violet: 'text-neon-violetGlow bg-neon-violet/10 border-neon-violet/30',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  };
  return (
    <GlassCard className="p-5">
      <div className={`mb-3 inline-flex rounded-xl border p-2.5 ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-bold text-white">{typeof value === 'number' ? <AnimatedCounter value={value} /> : value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </GlassCard>
  );
}

function BookingCard({ booking, showReceipt }: { booking: BookingWithWorker; showReceipt?: boolean }) {
  const statusColors: Record<string, 'amber' | 'cyan' | 'violet' | 'emerald' | 'gray'> = {
    pending: 'amber',
    confirmed: 'emerald',
    in_progress: 'violet',
    payment_submitted: 'cyan',
    completed: 'emerald',
    paid: 'emerald',
    cancelled: 'gray',
  };
  const variant = statusColors[booking.status] ?? 'gray';
  const Icon = CATEGORY_ICONS[booking.category] ?? Briefcase;
  const style = getCategoryStyle(booking.category);

  return (
    <GlassCard hover className="p-5 animate-slide-up">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`h-12 w-12 rounded-xl border ${style.bg} ${style.border} flex items-center justify-center`}>
            <Icon className={style.text} size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-white">{booking.worker?.users?.name ?? 'Worker'}</h3>
            <p className="text-xs text-gray-400">{booking.category}</p>
          </div>
        </div>
        <Badge variant={variant}>
          {booking.status === 'pending' ? 'Pending Approval' : booking.status.replace('_', ' ')}
        </Badge>
      </div>

      <div className="space-y-1.5 text-sm text-gray-400 mb-4">
        <div className="flex items-center gap-2"><Calendar size={14} /> {new Date(booking.scheduled_at).toLocaleString()}</div>
        <div className="flex items-center gap-2"><MapPin size={14} /> {booking.address}</div>
        <div className="flex items-center gap-2"><Wallet size={14} /> ₹{Number(booking.total_amount).toFixed(2)}</div>
      </div>

      <div className="flex gap-2">
        {/* Pending: Worker has not accepted yet */}
        {booking.status === 'pending' && (
          <div className="flex items-center gap-2 text-xs font-medium text-amber-400 bg-amber-500/10 px-3 py-2 rounded-lg border border-amber-500/20">
            <Hourglass size={14} className="animate-spin" /> Worker approval pending...
          </div>
        )}

        {/* Confirmed: Worker accepted, customer can now pay */}
        {booking.status === 'confirmed' && (
          <Link to={`/payment/${booking.id}`}>
            <NeonButton size="sm" variant="emerald">Pay Now <ArrowRight size={14} /></NeonButton>
          </Link>
        )}

        {booking.status === 'payment_submitted' && (
          <Link to={`/payment/${booking.id}`}>
            <NeonButton size="sm" variant="cyan">Track Payment <ArrowRight size={14} /></NeonButton>
          </Link>
        )}

        {booking.status === 'cancelled' && (
          <div className="flex items-center gap-2 text-xs font-medium text-red-400">
            <XCircle size={14} /> Request Declined
          </div>
        )}

        {showReceipt && (booking.status === 'paid' || booking.status === 'completed') && (
          <div className="flex items-center gap-2 text-sm text-neon-emerald">
            <CheckCircle size={14} /> Payment confirmed
          </div>
        )}
      </div>
    </GlassCard>
  );
}
