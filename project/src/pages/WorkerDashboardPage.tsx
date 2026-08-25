import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet, Clock, CheckCircle, XCircle, Bell, TrendingUp, Briefcase, Star,
  Check, Loader2, MapPin, Calendar, AlertCircle, Settings, ShieldCheck,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { GlowOrb, StarRating, AnimatedCounter } from '@/components/ui/Shared';
import { supabase, type Booking, type Payment } from '@/lib/supabase';
import { CATEGORY_ICONS, getCategoryStyle } from '@/lib/categories';
import { useAuth } from '@/context/AuthContext';

interface BookingWithCustomer extends Booking {
  customer?: { name: string; phone: string } | null;
}

interface PaymentWithBooking extends Payment {
  bookings?: { customer_id: string; address: string } | null;
}

export function WorkerDashboardPage() {
  const { user, workerProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingWithCustomer[]>([]);
  const [payments, setPayments] = useState<PaymentWithBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState('');

  const fetchData = useCallback(async () => {
    if (!workerProfile) return;

    const { data: bookingData } = await supabase
      .from('bookings')
      .select('*, customer:users!bookings_customer_id_fkey(name, phone)')
      .eq('worker_id', workerProfile.id)
      .order('created_at', { ascending: false });

    setBookings((bookingData as unknown as BookingWithCustomer[]) ?? []);

    const { data: paymentData } = await supabase
      .from('payments')
      .select('*, bookings(customer_id, address)')
      .eq('worker_id', workerProfile.id)
      .order('created_at', { ascending: false });

    setPayments((paymentData as unknown as PaymentWithBooking[]) ?? []);
    setLoading(false);
  }, [workerProfile]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'worker') { navigate('/customer/dashboard'); return; }
    if (workerProfile) {
      setUpiId(workerProfile.upi_id);
      setHourlyRate(String(workerProfile.hourly_rate));
      fetchData();
    }
  }, [user, workerProfile, authLoading, navigate, fetchData]);

  // Poll for new bookings/payments
  useEffect(() => {
    if (!workerProfile) return;
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [workerProfile, fetchData]);

  const handleConfirmPayment = async (paymentId: string) => {
    if (!user) return;
    setConfirmingId(paymentId);
    try {
      const { data, error } = await supabase.rpc('confirm_payment_received', {
        p_payment_id: paymentId,
        p_worker_user_id: user.id,
      });
      if (error) throw error;
      if (data && !data.success) throw new Error(data.message);
      await fetchData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to confirm payment';
      alert(msg);
    } finally {
      setConfirmingId(null);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
    try {
      await supabase.from('bookings').update({ status }).eq('id', bookingId);
      await fetchData();
    } catch (err) {
      alert('Failed to update booking status');
    }
  };

  const handleSaveSettings = async () => {
    if (!workerProfile) return;
    setSavingSettings(true);
    setSettingsMsg('');
    try {
      const { error } = await supabase
        .from('worker_profiles')
        .update({ upi_id: upiId, hourly_rate: parseFloat(hourlyRate) || 0 })
        .eq('id', workerProfile.id);
      if (error) throw error;
      setSettingsMsg('Settings saved successfully');
      setTimeout(() => setShowSettings(false), 1500);
    } catch {
      setSettingsMsg('Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const totalEarnings = payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0);
  const pendingPayments = payments.filter((p) => p.status === 'payment_submitted');
  const activeBookings = bookings.filter((b) => ['pending', 'confirmed', 'in_progress', 'payment_submitted'].includes(b.status));
  const completedJobs = bookings.filter((b) => b.status === 'paid' || b.status === 'completed').length;

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-16">
        <Loader2 size={32} className="animate-spin text-neon-emerald" />
      </div>
    );
  }

  if (!workerProfile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center pt-16 gap-4">
        <AlertCircle className="text-amber-400" size={32} />
        <p className="text-gray-400">Worker profile not found. Please complete your registration.</p>
        <NeonButton onClick={() => navigate('/signup')}>Complete Registration</NeonButton>
      </div>
    );
  }

  const Icon = CATEGORY_ICONS[workerProfile.category] ?? Briefcase;
  const style = getCategoryStyle(workerProfile.category);

  return (
    <div className="relative min-h-screen overflow-hidden pt-20 pb-12">
      <GlowOrb className="top-20 -left-20 h-80 w-80 bg-neon-emerald/10" />
      <GlowOrb className="bottom-0 right-0 h-80 w-80 bg-neon-cyan/10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div className="flex items-center gap-4">
            <div className={`h-16 w-16 rounded-2xl border ${style.bg} ${style.border} flex items-center justify-center`}>
              <Icon className={style.text} size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{user?.name}'s Dashboard</h1>
              <p className="text-sm text-gray-400">{workerProfile.category} • Worker ID: {workerProfile.id.slice(0, 8)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="emerald"><ShieldCheck size={12} /> {workerProfile.is_verified ? 'Verified' : 'Pending'}</Badge>
            <NeonButton variant="ghost" size="sm" onClick={() => setShowSettings(true)}>
              <Settings size={16} /> Settings
            </NeonButton>
          </div>
        </div>

        {/* Stats grid */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={Wallet} label="Total Earnings" value={`₹${totalEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} color="emerald" />
          <StatCard icon={Briefcase} label="Active Bookings" value={activeBookings.length} color="cyan" />
          <StatCard icon={CheckCircle} label="Jobs Completed" value={completedJobs} color="violet" />
          <StatCard icon={Star} label="Rating" value={workerProfile.rating.toFixed(1)} color="amber" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Incoming booking requests */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-200">
              <Bell size={18} className="text-neon-cyan" /> Incoming Requests
              {activeBookings.length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neon-emerald text-xs font-bold text-base-900">
                  {activeBookings.length}
                </span>
              )}
            </h2>
            <div className="space-y-4">
              {activeBookings.length === 0 ? (
                <GlassCard className="p-8 text-center text-gray-500">No active booking requests</GlassCard>
              ) : (
                activeBookings.map((booking) => (
                  <BookingRequestCard
                    key={booking.id}
                    booking={booking}
                    onAccept={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                    onDecline={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                    onComplete={() => handleUpdateBookingStatus(booking.id, 'completed')}
                  />
                ))
              )}
            </div>
          </div>

          {/* Payment confirmations */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-200">
              <Wallet size={18} className="text-neon-emerald" /> Payment Confirmations
              {pendingPayments.length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-base-900 animate-pulse">
                  {pendingPayments.length}
                </span>
              )}
            </h2>
            <div className="space-y-4">
              {pendingPayments.length === 0 ? (
                <GlassCard className="p-8 text-center text-gray-500">No pending payment confirmations</GlassCard>
              ) : (
                pendingPayments.map((payment) => (
                  <PaymentConfirmCard
                    key={payment.id}
                    payment={payment}
                    onConfirm={() => handleConfirmPayment(payment.id)}
                    loading={confirmingId === payment.id}
                  />
                ))
              )}
            </div>

            {/* Recent earnings */}
            <h3 className="mb-4 mt-6 text-sm font-semibold text-gray-400">Recent Earnings</h3>
            <GlassCard className="p-4">
              {payments.filter((p) => p.status === 'paid').length === 0 ? (
                <p className="text-center text-sm text-gray-500 py-4">No earnings yet</p>
              ) : (
                <div className="space-y-2">
                  {payments.filter((p) => p.status === 'paid').slice(0, 5).map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-sm border-b border-white/5 pb-2 last:border-0">
                      <span className="text-gray-400">₹{Number(p.amount).toFixed(2)}</span>
                      <span className="text-xs text-gray-500">{new Date(p.paid_at ?? p.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-900/80 backdrop-blur-sm animate-fade-in" onClick={() => setShowSettings(false)}>
          <GlassCard className="w-full max-w-md p-6 m-4" >
            <div onClick={(e) => e.stopPropagation()}>
              <h2 className="mb-4 text-lg font-semibold text-gray-200">Worker Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300">UPI ID</label>
                  <input value={upiId} onChange={(e) => setUpiId(e.target.value)} className="w-full rounded-xl border border-white/10 bg-base-800/60 px-4 py-3 text-sm text-gray-200 outline-none focus:border-neon-emerald/40" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300">Hourly Rate (₹)</label>
                  <input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} className="w-full rounded-xl border border-white/10 bg-base-800/60 px-4 py-3 text-sm text-gray-200 outline-none focus:border-neon-emerald/40" />
                </div>
                {settingsMsg && <p className={`text-sm ${settingsMsg.includes('success') ? 'text-neon-emerald' : 'text-red-400'}`}>{settingsMsg}</p>}
                <div className="flex gap-3">
                  <NeonButton fullWidth onClick={handleSaveSettings} disabled={savingSettings}>
                    {savingSettings ? <Loader2 size={16} className="animate-spin" /> : 'Save'}
                  </NeonButton>
                  <NeonButton variant="ghost" onClick={() => setShowSettings(false)}>Cancel</NeonButton>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
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

function BookingRequestCard({ booking, onAccept, onDecline, onComplete }: {
  booking: BookingWithCustomer;
  onAccept: () => void;
  onDecline: () => void;
  onComplete: () => void;
}) {
  const statusColors: Record<string, string> = {
    pending: 'amber',
    confirmed: 'cyan',
    in_progress: 'violet',
    payment_submitted: 'cyan',
  };
  const variant = (statusColors[booking.status] ?? 'gray') as 'amber' | 'cyan' | 'violet' | 'gray';

  return (
    <GlassCard className="p-5 animate-slide-up">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-white">{booking.customer?.name ?? 'Customer'}</h3>
          <p className="text-xs text-gray-400">{booking.category}</p>
        </div>
        <Badge variant={variant}>{booking.status.replace('_', ' ')}</Badge>
      </div>
      <div className="space-y-1.5 text-sm text-gray-400 mb-4">
        <div className="flex items-center gap-2"><Calendar size={14} /> {new Date(booking.scheduled_at).toLocaleString()}</div>
        <div className="flex items-center gap-2"><MapPin size={14} /> {booking.address}</div>
        <div className="flex items-center gap-2"><Wallet size={14} /> ₹{Number(booking.total_amount).toFixed(2)}</div>
      </div>
      <div className="flex gap-2">
        {booking.status === 'pending' && (
          <>
            <NeonButton size="sm" variant="emerald" onClick={onAccept}><Check size={14} /> Accept</NeonButton>
            <NeonButton size="sm" variant="danger" onClick={onDecline}><XCircle size={14} /> Decline</NeonButton>
          </>
        )}
        {booking.status === 'confirmed' && (
          <NeonButton size="sm" variant="cyan" onClick={onComplete}><CheckCircle size={14} /> Mark Complete</NeonButton>
        )}
      </div>
    </GlassCard>
  );
}

function PaymentConfirmCard({ payment, onConfirm, loading }: {
  payment: PaymentWithBooking;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <GlassCard className="border-neon-emerald/20 p-5 animate-slide-up">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-white">Payment Confirmation</h3>
          <p className="text-xs text-gray-400">UTR: {payment.utr_number}</p>
        </div>
        <Badge variant="amber">Awaiting</Badge>
      </div>
      <div className="mb-4 space-y-1.5 text-sm text-gray-400">
        <div className="flex items-center gap-2"><Wallet size={14} /> ₹{Number(payment.amount).toFixed(2)}</div>
        <div className="flex items-center gap-2"><Clock size={14} /> {new Date(payment.created_at).toLocaleString()}</div>
      </div>
      <NeonButton size="sm" fullWidth variant="emerald" onClick={onConfirm} disabled={loading}>
        {loading ? <Loader2 size={14} className="animate-spin" /> : <><Check size={14} /> Confirm Received</>}
      </NeonButton>
    </GlassCard>
  );
}
