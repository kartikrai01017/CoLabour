import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, MapPin, Wallet, Clock, Loader2, ArrowRight, Briefcase, CheckCircle,
  Receipt, AlertCircle, Eye, X
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { GlowOrb, AnimatedCounter } from '@/components/ui/Shared';
import { type Booking, type Payment } from '@/lib/supabase';
import { CATEGORY_ICONS, getCategoryStyle } from '@/lib/categories';
import { useAuth } from '@/context/AuthContext';
import { fetchCustomerDashboardData } from '@/lib/dataService';
import { CoLabourPrinterEngine } from '@/components/CoLabourPrinterEngine';

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

  // Poll for status updates
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [user, fetchData]);

  const activeBookings = bookings.filter((b) => ['pending', 'confirmed', 'in_progress', 'payment_submitted'].includes(b.status));
  const completedBookings = bookings.filter((b) => b.status === 'paid' || b.status === 'completed');
  const totalSpent = payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0);
  const pendingPayments = payments.filter((p) => p.status === 'pending' || p.status === 'payment_submitted');

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
            <h1 className="text-2xl font-bold text-white">My Customer Dashboard</h1>
            <p className="text-sm text-gray-400">Welcome back, {user?.name}</p>
          </div>
          <Link to="/workers">
            <NeonButton variant="emerald"><Briefcase size={16} /> Book a Worker</NeonButton>
          </Link>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={Calendar} label="Active Bookings" value={activeBookings.length} color="cyan" />
          <StatCard icon={CheckCircle} label="Completed & Paid" value={completedBookings.length} color="emerald" />
          <StatCard icon={Wallet} label="Total Spent" value={`₹${totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} color="violet" />
          <StatCard icon={Clock} label="Pending Payments" value={pendingPayments.length} color="amber" />
        </div>

        {/* Pending payments alert */}
        {pendingPayments.length > 0 && (
          <GlassCard className="mb-6 border-amber-500/30 p-4 animate-slide-up">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-amber-400 animate-pulse" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-400">You have {pendingPayments.length} pending payment action(s)</p>
                <p className="text-xs text-gray-400">Complete or track your UPI payment to settle your booking</p>
              </div>
              {pendingPayments[0] && (
                <Link to={`/payment/${pendingPayments[0].booking_id}`}>
                  <NeonButton size="sm" variant="emerald">Open Payment Gateway <ArrowRight size={14} /></NeonButton>
                </Link>
              )}
            </div>
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
              <Receipt size={18} className="text-neon-emerald" /> History & Official POS Slips
            </h2>
            <div className="space-y-4">
              {completedBookings.length === 0 ? (
                <GlassCard className="p-8 text-center text-gray-500">No completed bookings yet</GlassCard>
              ) : (
                completedBookings.map((booking) => {
                  const p = payments.find((pay) => pay.booking_id === booking.id);
                  return (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      showReceipt
                      onViewSlip={() => setSelectedSlip({ booking, payment: p })}
                    />
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Slip Modal */}
      {selectedSlip && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-base-950/85 backdrop-blur-md overflow-y-auto"
          onClick={() => setSelectedSlip(null)}
        >
          <div className="relative w-full max-w-md my-8" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedSlip(null)}
              className="absolute top-2 right-2 z-20 rounded-full bg-base-800 p-2 text-gray-400 hover:text-white border border-white/10"
            >
              <X size={18} />
            </button>
            <CoLabourPrinterEngine
              bookingId={selectedSlip.booking.id}
              workerName={selectedSlip.booking.worker?.users?.name ?? 'Professional Worker'}
              workerSkill={selectedSlip.booking.category}
              customerName={user?.name ?? 'Verified Customer'}
              date={selectedSlip.payment?.paid_at || selectedSlip.booking.scheduled_at}
              utrNumber={selectedSlip.payment?.utr_number || 'UPI-OFFICIAL-UTR'}
              totalAmount={Number(selectedSlip.booking.total_amount)}
              onDone={() => setSelectedSlip(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Wallet; label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = {
    emerald: 'text-neon-emerald bg-neon-emerald/10 border-neon-emerald/30',
    cyan: 'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/30',
    violet: 'text-neon-violet bg-neon-violet/10 border-neon-violet/30',
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

function BookingCard({
  booking,
  showReceipt,
  onViewSlip,
}: {
  booking: BookingWithWorker;
  showReceipt?: boolean;
  onViewSlip?: () => void;
}) {
  const statusColors: Record<string, 'amber' | 'cyan' | 'violet' | 'emerald' | 'gray'> = {
    pending: 'amber',
    confirmed: 'cyan',
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
        <Badge variant={variant}>{booking.status === 'confirmed' ? 'Accepted' : booking.status.replace('_', ' ')}</Badge>
      </div>
      <div className="space-y-1.5 text-sm text-gray-400 mb-3">
        <div className="flex items-center gap-2"><Calendar size={14} /> {new Date(booking.scheduled_at).toLocaleString()}</div>
        <div className="flex items-center gap-2"><MapPin size={14} /> {booking.address}</div>
        <div className="flex items-center gap-2"><Wallet size={14} /> ₹{Number(booking.total_amount).toFixed(2)}</div>
      </div>
      <div className="flex gap-2">
        {booking.status === 'pending' && (
          <Link to={`/payment/${booking.id}`}>
            <NeonButton size="sm" variant="amber">Waiting for Acceptance <ArrowRight size={14} /></NeonButton>
          </Link>
        )}
        {booking.status === 'confirmed' && (
          <Link to={`/payment/${booking.id}`}>
            <NeonButton size="sm" variant="emerald">Pay Worker via UPI <ArrowRight size={14} /></NeonButton>
          </Link>
        )}
        {booking.status === 'payment_submitted' && (
          <Link to={`/payment/${booking.id}`}>
            <NeonButton size="sm" variant="cyan">Track Verification <ArrowRight size={14} /></NeonButton>
          </Link>
        )}
        {showReceipt && (booking.status === 'paid' || booking.status === 'completed') && (
          <div className="flex items-center justify-between w-full">
            <span className="flex items-center gap-1.5 text-xs text-neon-emerald font-medium">
              <CheckCircle size={14} /> Payment Settled
            </span>
            {onViewSlip && (
              <NeonButton size="sm" variant="ghost" onClick={onViewSlip} className="text-xs">
                <Eye size={14} /> View CoLabour Slip
              </NeonButton>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
