import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, MapPin, Wallet, Clock, Loader2, ArrowRight, Briefcase, CheckCircle,
  Receipt, AlertCircle,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { FloatingShape, AnimatedCounter } from '@/components/ui/Shared';
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
    const { data: bookingData } = await supabase.from('bookings').select('*, worker:worker_profiles!bookings_worker_id_fkey(id, category, hourly_rate, users:user_id(name))').eq('customer_id', user.id).order('created_at', { ascending: false });
    setBookings((bookingData as unknown as BookingWithWorker[]) ?? []);
    const { data: paymentData } = await supabase.from('payments').select('*, bookings(id, category)').eq('customer_id', user.id).order('created_at', { ascending: false });
    setPayments((paymentData as unknown as PaymentWithBooking[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { if (authLoading) return; if (user) fetchData(); }, [user, authLoading, fetchData]);
  useEffect(() => { if (!user) return; const interval = setInterval(fetchData, 5000); return () => clearInterval(interval); }, [user, fetchData]);

  const activeBookings = bookings.filter((b) => ['pending', 'confirmed', 'in_progress', 'payment_submitted'].includes(b.status));
  const completedBookings = bookings.filter((b) => b.status === 'paid' || b.status === 'completed');
  const totalSpent = payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0);
  const pendingPayments = payments.filter((p) => p.status === 'pending' || p.status === 'payment_submitted');

  if (authLoading || loading) return <div className="flex min-h-screen items-center justify-center pt-16"><Loader2 size={28} className="animate-spin text-brass" /></div>;

  return (
    <div className="relative min-h-screen overflow-hidden pt-20 pb-12 atmosphere">
      <FloatingShape className="top-20 -left-20 h-[350px] w-[350px] animate-drift-slow" color="neon-cyan" />
      <FloatingShape className="bottom-0 -right-20 h-[300px] w-[300px] animate-drift" color="neon-purple" delay={2} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div>
            <h1 className="text-xl font-bold text-white">My Dashboard</h1>
            <p className="text-xs text-muted">Welcome back, {user?.name}</p>
          </div>
          <Link to="/workers"><NeonButton variant="emerald"><Briefcase size={14} /> Book a Worker</NeonButton></Link>
        </div>

        <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard icon={Calendar} label="Active Bookings" value={activeBookings.length} color="cyan" />
          <StatCard icon={CheckCircle} label="Completed" value={completedBookings.length} color="purple" />
          <StatCard icon={Wallet} label="Total Spent" value={`₹${totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} color="pink" />
          <StatCard icon={Clock} label="Pending Payments" value={pendingPayments.length} color="amber" />
        </div>

        {pendingPayments.length > 0 && (
          <GlassCard className="mb-5 p-3.5 animate-slide-up">
            <div className="flex items-center gap-2.5">
              <AlertCircle size={18} className="text-amber-400 animate-pulse" />
              <div className="flex-1">
                <p className="text-xs font-medium text-amber-400">You have {pendingPayments.length} pending payment(s)</p>
                <p className="text-[11px] text-muted-dark">Complete your payment to confirm your booking</p>
              </div>
              {pendingPayments[0] && (
                <Link to={`/payment/${pendingPayments[0].booking_id}`}>
                  <NeonButton size="sm" variant="emerald">Pay Now <ArrowRight size={12} /></NeonButton>
                </Link>
              )}
            </div>
          </GlassCard>
        )}

        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <h2 className="mb-3.5 flex items-center gap-2 text-base font-semibold text-white">
              <Clock size={16} className="text-brass" /> Active Bookings
            </h2>
            <div className="space-y-3">
              {activeBookings.length === 0 ? (
                <GlassCard className="p-7 text-center"><p className="text-muted-dark mb-3 text-sm">No active bookings</p>
                  <Link to="/workers"><NeonButton variant="ghost" size="sm">Browse Workers</NeonButton></Link></GlassCard>
              ) : activeBookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)}
            </div>
          </div>
          <div>
            <h2 className="mb-3.5 flex items-center gap-2 text-base font-semibold text-white">
              <Receipt size={16} className="text-sage" /> History & Receipts
            </h2>
            <div className="space-y-3">
              {completedBookings.length === 0 ? (
                <GlassCard className="p-7 text-center text-muted-dark text-sm">No completed bookings yet</GlassCard>
              ) : completedBookings.map((booking) => <BookingCard key={booking.id} booking={booking} showReceipt />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Wallet; label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = {
    cyan: 'text-brass bg-brass/[0.08] border-brass/15 shadow-brass',
    purple: 'text-sage bg-sage/[0.08] border-sage/15 shadow-sage',
    pink: 'text-[#c27a6e] bg-[#c27a6e]/[0.08] border-[#c27a6e]/15 shadow-brass',
    amber: 'text-amber-400 bg-amber-500/[0.08] border-amber-500/15',
  };
  return (
    <GlassCard className="p-4">
      <div className={`mb-2.5 inline-flex rounded-xl border p-2 ${colors[color]}`}>
        <Icon size={18} />
      </div>
      <p className="text-xl font-bold text-white">{typeof value === 'number' ? <AnimatedCounter value={value} /> : value}</p>
      <p className="text-[11px] text-muted-dark mt-0.5">{label}</p>
    </GlassCard>
  );
}

function BookingCard({ booking, showReceipt }: { booking: BookingWithWorker; showReceipt?: boolean }) {
  const sc: Record<string, 'amber' | 'cyan' | 'violet' | 'emerald' | 'gray'> = {
    pending: 'amber', confirmed: 'cyan', in_progress: 'violet', payment_submitted: 'cyan', completed: 'emerald', paid: 'emerald', cancelled: 'gray',
  };
  const variant = sc[booking.status] ?? 'gray';
  const Icon = CATEGORY_ICONS[booking.category] ?? Briefcase;
  const style = getCategoryStyle(booking.category);

  return (
    <GlassCard hover className="p-4 animate-slide-up">
      <div className="flex items-start justify-between mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className={`h-10 w-10 rounded-xl border ${style.bg} ${style.border} flex items-center justify-center shadow-lg`}>
            <Icon className={style.text} size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">{booking.worker?.users?.name ?? 'Worker'}</h3>
            <p className="text-[11px] text-muted-dark">{booking.category}</p>
          </div>
        </div>
        <Badge variant={variant}>{booking.status.replace('_', ' ')}</Badge>
      </div>
      <div className="space-y-1 text-xs text-muted mb-2.5">
        <div className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(booking.scheduled_at).toLocaleString()}</div>
        <div className="flex items-center gap-1.5"><MapPin size={12} /> {booking.address}</div>
        <div className="flex items-center gap-1.5"><Wallet size={12} /> ₹{Number(booking.total_amount).toFixed(2)}</div>
      </div>
      <div className="flex gap-2">
        {booking.status === 'pending' && <Link to={`/payment/${booking.id}`}><NeonButton size="sm" variant="emerald">Pay Now <ArrowRight size={12} /></NeonButton></Link>}
        {booking.status === 'payment_submitted' && <Link to={`/payment/${booking.id}`}><NeonButton size="sm" variant="cyan">Track Payment <ArrowRight size={12} /></NeonButton></Link>}
        {showReceipt && (booking.status === 'paid' || booking.status === 'completed') && (
          <div className="flex items-center gap-1.5 text-xs text-brass text-shadow-neon"><CheckCircle size={12} /> Payment confirmed</div>
        )}
      </div>
    </GlassCard>
  );
}
