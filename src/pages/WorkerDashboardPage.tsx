import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet, Clock, CheckCircle, XCircle, Bell, Briefcase, Star,
  Check, Loader2, MapPin, Calendar, AlertCircle, Settings, ShieldCheck,
  Receipt, Eye, X
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { GlowOrb, AnimatedCounter } from '@/components/ui/Shared';
import { type Booking, type Payment } from '@/lib/supabase';
import { CATEGORY_ICONS, getCategoryStyle } from '@/lib/categories';
import { useAuth } from '@/context/AuthContext';
import { fetchWorkerDashboardData, updateBookingStatus, confirmPaymentAsReceived } from '@/lib/dataService';
import { CoLabourPrinterEngine } from '@/components/CoLabourPrinterEngine';

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
  const [selectedSlip, setSelectedSlip] = useState<{ booking: BookingWithCustomer; payment?: PaymentWithBooking } | null>(null);
  const [upiId, setUpiId] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState('');

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

  // Poll for new bookings/payments every 3 seconds for instant synchronization
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [user, fetchData]);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleConfirmPayment = async (paymentId: string) => {
    setConfirmingId(paymentId);
    // Optimistic payment status update
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
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
    // Optimistic UI updates
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
  };

  const handleSaveSettings = async () => {
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
  };

  const totalEarnings = payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0);
  const pendingPayments = payments.filter((p) => p.status === 'payment_submitted');
  // Active bookings includes pending and confirmed
  const activeBookings = bookings.filter((b) => ['pending', 'confirmed', 'in_progress'].includes(b.status));
  const completedJobs = bookings.filter((b) => b.status === 'paid' || b.status === 'completed');

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

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-2xl border border-neon-emerald/40 bg-base-900/90 px-4 py-3 text-sm font-semibold text-neon-emerald shadow-[0_0_30px_rgba(16,185,129,0.3)] backdrop-blur-xl animate-slide-down">
          <CheckCircle size={18} className="text-neon-emerald" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div className="flex items-center gap-4">
            <div className={`h-16 w-16 rounded-2xl border ${style.bg} ${style.border} flex items-center justify-center`}>
              <Icon className={style.text} size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{user?.name}'s Dashboard</h1>
              <p className="text-sm text-gray-400">{workerProfile.category} • Worker ID: {workerProfile.id.slice(0, 8)} • UPI: {workerProfile.upi_id}</p>
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
          <StatCard icon={Briefcase} label="Active Requests" value={activeBookings.length} color="cyan" />
          <StatCard icon={CheckCircle} label="Jobs Settled" value={completedJobs.length} color="violet" />
          <StatCard icon={Star} label="Rating" value={workerProfile.rating.toFixed(1)} color="amber" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Incoming booking requests */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-200">
              <Bell size={18} className="text-neon-cyan" /> Job Dispatches & Requests
              {activeBookings.length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neon-emerald text-xs font-bold text-base-900">
                  {activeBookings.length}
                </span>
              )}
            </h2>
            <div className="space-y-4">
              {activeBookings.length === 0 ? (
                <GlassCard className="p-8 text-center text-gray-500">No active job requests right now</GlassCard>
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

          {/* Payment confirmations & Earnings */}
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
                <GlassCard className="p-8 text-center text-gray-500">
                  No customer payments waiting for your verification
                </GlassCard>
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

            {/* Completed & Paid Jobs with View CoLabour Slip */}
            <h3 className="mb-4 mt-6 text-sm font-semibold text-gray-300 flex items-center gap-2">
              <Receipt size={16} className="text-neon-cyan" /> Settled Jobs & CoLabour Slips
            </h3>
            <div className="space-y-3">
              {completedJobs.length === 0 ? (
                <GlassCard className="p-4 text-center text-sm text-gray-500">No completed jobs yet</GlassCard>
              ) : (
                completedJobs.slice(0, 5).map((job) => {
                  const jobPayment = payments.find((p) => p.booking_id === job.id);
                  return (
                    <GlassCard key={job.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white text-sm">{job.customer?.name ?? 'Customer Booking'}</p>
                        <p className="text-xs text-gray-400">
                          {job.category} • ₹{Number(job.total_amount).toFixed(2)}
                          {jobPayment?.utr_number && <span className="font-mono text-neon-cyan ml-2">UTR: {jobPayment.utr_number}</span>}
                        </p>
                      </div>
                      <NeonButton
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedSlip({ booking: job, payment: jobPayment })}
                        className="text-xs"
                      >
                        <Eye size={14} /> View CoLabour Slip
                      </NeonButton>
                    </GlassCard>
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
              workerName={user?.name ?? 'Professional'}
              workerSkill={selectedSlip.booking.category}
              workerUpiId={workerProfile.upi_id}
              customerName={selectedSlip.booking.customer?.name ?? 'Verified Customer'}
              date={selectedSlip.payment?.paid_at || selectedSlip.booking.scheduled_at}
              utrNumber={selectedSlip.payment?.utr_number || 'OFFICIAL-PAID-UTR'}
              totalAmount={Number(selectedSlip.booking.total_amount)}
              onDone={() => setSelectedSlip(null)}
            />
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-900/80 backdrop-blur-sm animate-fade-in" onClick={() => setShowSettings(false)}>
          <GlassCard className="w-full max-w-md p-6 m-4">
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
    completed: 'emerald',
    paid: 'emerald',
  };
  const variant = (statusColors[booking.status] ?? 'gray') as 'amber' | 'cyan' | 'violet' | 'emerald' | 'gray';

  return (
    <GlassCard className="p-5 animate-slide-up">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-white">{booking.customer?.name ?? 'Customer'}</h3>
          <p className="text-xs text-gray-400">{booking.category}</p>
        </div>
        <Badge variant={variant}>{booking.status === 'confirmed' ? 'Accepted' : booking.status.replace('_', ' ')}</Badge>
      </div>
      <div className="space-y-1.5 text-sm text-gray-400 mb-4">
        <div className="flex items-center gap-2"><Calendar size={14} /> {new Date(booking.scheduled_at).toLocaleString()}</div>
        <div className="flex items-center gap-2"><MapPin size={14} /> {booking.address}</div>
        <div className="flex items-center gap-2"><Wallet size={14} /> ₹{Number(booking.total_amount).toFixed(2)}</div>
        {booking.notes && <div className="text-xs text-gray-400 bg-white/5 p-2 rounded-lg mt-2">Note: {booking.notes}</div>}
      </div>
      <div className="flex gap-2">
        {booking.status === 'pending' && (
          <>
            <NeonButton size="sm" variant="emerald" onClick={onAccept}><Check size={14} /> Accept Job</NeonButton>
            <NeonButton size="sm" variant="danger" onClick={onDecline}><XCircle size={14} /> Decline</NeonButton>
          </>
        )}
        {booking.status === 'confirmed' && (
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-neon-emerald font-medium">Job Accepted • Customer paying via UPI</span>
            <NeonButton size="sm" variant="cyan" onClick={onComplete}><CheckCircle size={14} /> Mark Complete</NeonButton>
          </div>
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
    <GlassCard className="border-neon-emerald/30 bg-neon-emerald/5 p-5 animate-slide-up">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-white">Payment Received Alert</h3>
          <p className="text-xs font-mono text-neon-cyan">UTR: {payment.utr_number}</p>
        </div>
        <Badge variant="amber">Awaiting Receipt</Badge>
      </div>
      <div className="mb-4 space-y-1.5 text-sm text-gray-400">
        <div className="flex items-center gap-2"><Wallet size={14} /> ₹{Number(payment.amount).toFixed(2)}</div>
        <div className="flex items-center gap-2"><Clock size={14} /> {new Date(payment.created_at).toLocaleString()}</div>
      </div>
      <NeonButton size="sm" fullWidth variant="emerald" onClick={onConfirm} disabled={loading}>
        {loading ? <Loader2 size={14} className="animate-spin" /> : <><Check size={14} /> Yes, Received (Confirm)</>}
      </NeonButton>
    </GlassCard>
  );
}
