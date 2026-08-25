import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet, Clock, CheckCircle, XCircle, Bell, TrendingUp, Briefcase, Star,
  Check, Loader2, MapPin, Calendar, AlertCircle, Settings, ShieldCheck,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { GlowOrb, FloatingShape, StarRating, AnimatedCounter } from '@/components/ui/Shared';
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
    const { data: bookingData } = await supabase.from('bookings').select('*, customer:users!bookings_customer_id_fkey(name, phone)').eq('worker_id', workerProfile.id).order('created_at', { ascending: false });
    setBookings((bookingData as unknown as BookingWithCustomer[]) ?? []);
    const { data: paymentData } = await supabase.from('payments').select('*, bookings(customer_id, address)').eq('worker_id', workerProfile.id).order('created_at', { ascending: false });
    setPayments((paymentData as unknown as PaymentWithBooking[]) ?? []);
    setLoading(false);
  }, [workerProfile]);

  useEffect(() => {
    if (authLoading) return;
    if (workerProfile) { setUpiId(workerProfile.upi_id); setHourlyRate(String(workerProfile.hourly_rate)); fetchData(); }
  }, [workerProfile, authLoading, fetchData]);

  useEffect(() => {
    if (!workerProfile) return;
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [workerProfile, fetchData]);

  const handleConfirmPayment = async (paymentId: string) => {
    if (!user) return;
    setConfirmingId(paymentId);
    try {
      const { data, error } = await supabase.rpc('confirm_payment_received', { p_payment_id: paymentId, p_worker_user_id: user.id });
      if (error) throw error;
      if (data && !data.success) throw new Error(data.message);
      await fetchData();
    } catch (err) { alert(err instanceof Error ? err.message : 'Failed to confirm payment'); }
    finally { setConfirmingId(null); }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
    try { await supabase.from('bookings').update({ status }).eq('id', bookingId); await fetchData(); }
    catch { alert('Failed to update booking status'); }
  };

  const handleSaveSettings = async () => {
    if (!workerProfile) return;
    setSavingSettings(true); setSettingsMsg('');
    try {
      const { error } = await supabase.from('worker_profiles').update({ upi_id: upiId, hourly_rate: parseFloat(hourlyRate) || 0 }).eq('id', workerProfile.id);
      if (error) throw error;
      setSettingsMsg('Settings saved successfully');
      setTimeout(() => setShowSettings(false), 1500);
    } catch { setSettingsMsg('Failed to save settings'); }
    finally { setSavingSettings(false); }
  };

  const totalEarnings = payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0);
  const pendingPayments = payments.filter((p) => p.status === 'payment_submitted');
  const activeBookings = bookings.filter((b) => ['pending', 'confirmed', 'in_progress', 'payment_submitted'].includes(b.status));
  const completedJobs = bookings.filter((b) => b.status === 'paid' || b.status === 'completed').length;

  if (authLoading || loading) return <div className="flex min-h-screen items-center justify-center pt-16"><Loader2 size={28} className="animate-spin text-brass" /></div>;
  if (!workerProfile) return (
    <div className="flex min-h-screen flex-col items-center justify-center pt-16 gap-4">
      <AlertCircle className="text-muted" size={28} /><p className="text-muted">Worker profile not found. Please complete your registration.</p>
      <NeonButton onClick={() => navigate('/signup')}>Complete Registration</NeonButton>
    </div>
  );

  const Icon = CATEGORY_ICONS[workerProfile.category] ?? Briefcase;
  const style = getCategoryStyle(workerProfile.category);

  return (
    <div className="relative min-h-screen overflow-hidden pt-20 pb-12 atmosphere">
      <FloatingShape className="top-20 -left-20 h-[350px] w-[350px] animate-drift-slow" color="neon-cyan" />
      <FloatingShape className="bottom-0 -right-20 h-[300px] w-[300px] animate-drift" color="neon-purple" delay={2} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div className="flex items-center gap-3.5">
            <div className={`h-14 w-14 rounded-xl border ${style.bg} ${style.border} flex items-center justify-center shadow-lg`}>
              <Icon className={style.text} size={28} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{user?.name}'s Dashboard</h1>
              <p className="text-xs text-muted">{workerProfile.category} · Worker ID: {workerProfile.id.slice(0, 8)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="emerald"><ShieldCheck size={11} /> {workerProfile.is_verified ? 'Verified' : 'Pending'}</Badge>
            <NeonButton variant="ghost" size="sm" onClick={() => setShowSettings(true)}><Settings size={14} /> Settings</NeonButton>
          </div>
        </div>

        <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard icon={Wallet} label="Total Earnings" value={`₹${totalEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} color="cyan" />
          <StatCard icon={Briefcase} label="Active Bookings" value={activeBookings.length} color="purple" />
          <StatCard icon={CheckCircle} label="Jobs Completed" value={completedJobs} color="pink" />
          <StatCard icon={Star} label="Rating" value={workerProfile.rating.toFixed(1)} color="amber" />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <h2 className="mb-3.5 flex items-center gap-2 text-base font-semibold text-white">
              <Bell size={16} className="text-brass" /> Incoming Requests
              {activeBookings.length > 0 && <span className="flex items-center justify-center rounded-full bg-brass text-[10px] font-bold text-base-900 min-w-[18px] h-[18px]">{activeBookings.length}</span>}
            </h2>
            <div className="space-y-3">
              {activeBookings.length === 0 ? (
                <GlassCard className="p-7 text-center text-muted-dark text-sm">No active booking requests</GlassCard>
              ) : activeBookings.map((booking) => (
                <BookingRequestCard key={booking.id} booking={booking}
                  onAccept={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                  onDecline={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                  onComplete={() => handleUpdateBookingStatus(booking.id, 'completed')} />
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-3.5 flex items-center gap-2 text-base font-semibold text-white">
              <Wallet size={16} className="text-sage" /> Payment Confirmations
              {pendingPayments.length > 0 && <span className="flex items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white min-w-[18px] h-[18px] animate-pulse">{pendingPayments.length}</span>}
            </h2>
            <div className="space-y-3">
              {pendingPayments.length === 0 ? (
                <GlassCard className="p-7 text-center text-muted-dark text-sm">No pending payment confirmations</GlassCard>
              ) : pendingPayments.map((payment) => (
                <PaymentConfirmCard key={payment.id} payment={payment} onConfirm={() => handleConfirmPayment(payment.id)} loading={confirmingId === payment.id} />
              ))}
            </div>
            <h3 className="mb-3 mt-5 text-[11px] font-semibold text-muted-dark uppercase tracking-wider">Recent Earnings</h3>
            <GlassCard className="p-3.5">
              {payments.filter((p) => p.status === 'paid').length === 0 ? (
                <p className="text-center text-xs text-muted-dark py-3">No earnings yet</p>
              ) : (
                <div className="space-y-1.5">
                  {payments.filter((p) => p.status === 'paid').slice(0, 5).map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-sm border-b border-white/[0.04] pb-1.5 last:border-0">
                      <span className="text-muted">₹{Number(p.amount).toFixed(2)}</span>
                      <span className="text-[11px] text-muted-dark">{new Date(p.paid_at ?? p.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </div>

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-base/80 backdrop-blur-sm animate-fade-in" onClick={() => setShowSettings(false)}>
          <GlassCard className="w-full max-w-sm p-5 m-4" >
            <div onClick={(e) => e.stopPropagation()}>
              <h2 className="mb-3.5 text-base font-semibold text-white">Worker Settings</h2>
              <div className="space-y-3.5">
                <div>
                  <label className="mb-1 block text-sm font-medium text-muted-light">UPI ID</label>
                  <input value={upiId} onChange={(e) => setUpiId(e.target.value)} className="w-full rounded-xl border border-white/[0.06] bg-base-800/80 px-3 py-2.5 text-sm text-muted-light outline-none focus:border-brass/30 focus:shadow-brass transition-all duration-300" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-muted-light">Hourly Rate (₹)</label>
                  <input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} className="w-full rounded-xl border border-white/[0.06] bg-base-800/80 px-3 py-2.5 text-sm text-muted-light outline-none focus:border-brass/30 focus:shadow-brass transition-all duration-300" />
                </div>
                {settingsMsg && <p className={`text-xs ${settingsMsg.includes('success') ? 'text-brass text-shadow-neon' : 'text-red-400'}`}>{settingsMsg}</p>}
                <div className="flex gap-2.5">
                  <NeonButton fullWidth onClick={handleSaveSettings} disabled={savingSettings}>
                    {savingSettings ? <Loader2 size={14} className="animate-spin" /> : 'Save'}
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

function BookingRequestCard({ booking, onAccept, onDecline, onComplete }: {
  booking: BookingWithCustomer; onAccept: () => void; onDecline: () => void; onComplete: () => void;
}) {
  const sc: Record<string, string> = { pending: 'amber', confirmed: 'cyan', in_progress: 'violet', payment_submitted: 'cyan' };
  const variant = (sc[booking.status] ?? 'gray') as 'amber' | 'cyan' | 'violet' | 'gray';
  return (
    <GlassCard className="p-4 animate-slide-up">
      <div className="flex items-start justify-between mb-2.5">
        <div>
          <h3 className="font-semibold text-white text-sm">{booking.customer?.name ?? 'Customer'}</h3>
          <p className="text-[11px] text-muted-dark">{booking.category}</p>
        </div>
        <Badge variant={variant}>{booking.status.replace('_', ' ')}</Badge>
      </div>
      <div className="space-y-1 text-xs text-muted mb-3">
        <div className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(booking.scheduled_at).toLocaleString()}</div>
        <div className="flex items-center gap-1.5"><MapPin size={12} /> {booking.address}</div>
        <div className="flex items-center gap-1.5"><Wallet size={12} /> ₹{Number(booking.total_amount).toFixed(2)}</div>
      </div>
      <div className="flex gap-2">
        {booking.status === 'pending' && (
          <><NeonButton size="sm" variant="emerald" onClick={onAccept}><Check size={12} /> Accept</NeonButton>
          <NeonButton size="sm" variant="danger" onClick={onDecline}><XCircle size={12} /> Decline</NeonButton></>
        )}
        {booking.status === 'confirmed' && <NeonButton size="sm" variant="cyan" onClick={onComplete}><CheckCircle size={12} /> Mark Complete</NeonButton>}
      </div>
    </GlassCard>
  );
}

function PaymentConfirmCard({ payment, onConfirm, loading }: { payment: PaymentWithBooking; onConfirm: () => void; loading: boolean }) {
  return (
    <GlassCard className="p-4 animate-slide-up">
      <div className="flex items-start justify-between mb-2.5">
        <div>
          <h3 className="font-semibold text-white text-sm">Payment Confirmation</h3>
          <p className="text-[11px] text-muted-dark">UTR: {payment.utr_number}</p>
        </div>
        <Badge variant="amber">Awaiting</Badge>
      </div>
      <div className="mb-3 space-y-1 text-xs text-muted">
        <div className="flex items-center gap-1.5"><Wallet size={12} /> ₹{Number(payment.amount).toFixed(2)}</div>
        <div className="flex items-center gap-1.5"><Clock size={12} /> {new Date(payment.created_at).toLocaleString()}</div>
      </div>
      <NeonButton size="sm" fullWidth variant="emerald" onClick={onConfirm} disabled={loading}>
        {loading ? <Loader2 size={12} className="animate-spin" /> : <><Check size={12} /> Confirm Received</>}
      </NeonButton>
    </GlassCard>
  );
}
