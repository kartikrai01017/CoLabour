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
import { useLanguage } from '@/context/LanguageContext';

interface BookingWithCustomer extends Booking {
  customer?: { name: string; phone: string } | null;
}

interface PaymentWithBooking extends Payment {
  bookings?: { customer_id: string; address: string } | null;
}

export function WorkerDashboardPage() {
  const { user, workerProfile, loading: authLoading } = useAuth();
  const { t, categoryName, locale } = useLanguage();
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
    showToast(t('workerDashboard.paymentConfirmed'));
    try {
      await confirmPaymentAsReceived(paymentId);
      await fetchData();
    } catch {
      alert(t('workerDashboard.confirmPaymentFailed'));
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
      showToast(t('workerDashboard.jobAccepted'));
    } else if (status === 'cancelled') {
      showToast(t('workerDashboard.jobDeclined'));
    } else if (status === 'completed' || status === 'paid') {
      showToast(t('workerDashboard.jobCompleted'));
    }

    try {
      await updateBookingStatus(bookingId, status);
      await fetchData();
    } catch {
      alert(t('workerDashboard.updateFailed'));
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
      setSettingsMsg(t('workerDashboard.settingsSaved'));
      setTimeout(() => setShowSettings(false), 1200);
    } catch {
      setSettingsMsg(t('workerDashboard.settingsFailed'));
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
        <p className="text-gray-400">{t('workerDashboard.profileNotFound')}</p>
        <NeonButton onClick={() => navigate('/signup')}>{t('workerDashboard.completeRegistration')}</NeonButton>
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
               <h1 className="text-2xl font-bold text-white">{t('workerDashboard.dashboard', { name: user?.name ?? '' })}</h1>
               <p className="text-sm text-gray-400">{categoryName(workerProfile.category)} • {t('workerDashboard.workerId', { id: workerProfile.id?.slice(0, 8) ?? '' })} • {t('workerDashboard.upi', { upi: workerProfile.upi_id })}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <Badge variant="emerald"><ShieldCheck size={12} /> {workerProfile.is_verified ? t('workerDashboard.verified') : t('workerDashboard.pending')}</Badge>
            <NeonButton variant="ghost" size="sm" onClick={() => setShowSettings(true)}>
              <Settings size={16} /> {t('workerDashboard.settings')}
            </NeonButton>
          </div>
        </div>

        {/* Stats grid */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
           <StatCard icon={Wallet} label={t('workerDashboard.totalEarnings')} value={`₹${totalEarnings.toLocaleString(locale, { minimumFractionDigits: 2 })}`} color="emerald" />
           <StatCard icon={Briefcase} label={t('workerDashboard.activeRequests')} value={activeBookings.length} color="cyan" />
           <StatCard icon={CheckCircle} label={t('workerDashboard.jobsSettled')} value={completedJobs.length} color="violet" />
           <StatCard icon={Star} label={t('workerDashboard.rating')} value={(workerProfile.rating ?? 0).toFixed(1)} color="amber" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Incoming booking requests */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-200">
               <Bell size={18} className="text-neon-cyan" /> {t('workerDashboard.jobDispatches')}
              {activeBookings.length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neon-emerald text-xs font-bold text-base-900">
                  {activeBookings.length}
                </span>
              )}
            </h2>
            <div className="space-y-4">
              {activeBookings.length === 0 ? (
                 <GlassCard className="p-8 text-center text-gray-500">{t('workerDashboard.noActiveRequests')}</GlassCard>
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
               <Wallet size={18} className="text-neon-emerald" /> {t('workerDashboard.paymentConfirmations')}
              {pendingPayments.length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-base-900 animate-pulse">
                  {pendingPayments.length}
                </span>
              )}
            </h2>
            <div className="space-y-4">
              {pendingPayments.length === 0 ? (
                <GlassCard className="p-8 text-center text-gray-500">
                   {t('workerDashboard.noPayments')}
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
               <Receipt size={16} className="text-neon-cyan" /> {t('workerDashboard.settledJobs')}
            </h3>
            <div className="space-y-3">
              {completedJobs.length === 0 ? (
                 <GlassCard className="p-4 text-center text-sm text-gray-500">{t('workerDashboard.noCompletedJobs')}</GlassCard>
              ) : (
                completedJobs.slice(0, 5).map((job) => {
                  const jobPayment = payments.find((p) => p.booking_id === job.id);
                  return (
                    <GlassCard key={job.id} className="p-4 flex items-center justify-between">
                      <div>
                         <p className="font-semibold text-white text-sm">{job.customer?.name ?? t('workerDashboard.customerBooking')}</p>
                        <p className="text-xs text-gray-400">
                           {categoryName(job.category)} • ₹{Number(job.total_amount).toFixed(2)}
                           {jobPayment?.utr_number && <span className="font-mono text-neon-cyan ml-2">{t('workerDashboard.utr', { utr: jobPayment.utr_number })}</span>}
                        </p>
                      </div>
                      <NeonButton
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedSlip({ booking: job, payment: jobPayment })}
                        className="text-xs"
                      >
                         <Eye size={14} /> {t('workerDashboard.viewSlip')}
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
               workerName={user?.name ?? t('workerDashboard.professional')}
               workerSkill={categoryName(selectedSlip.booking.category)}
               workerUpiId={workerProfile.upi_id}
               customerName={selectedSlip.booking.customer?.name ?? t('workerDashboard.verifiedCustomer')}
               date={selectedSlip.payment?.paid_at || selectedSlip.booking.scheduled_at}
               utrNumber={selectedSlip.payment?.utr_number || t('workerDashboard.officialUtr')}
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
               <h2 className="mb-4 text-lg font-semibold text-gray-200">{t('workerDashboard.workerSettings')}</h2>
              <div className="space-y-4">
                <div>
                   <label className="mb-1.5 block text-sm font-medium text-gray-300">{t('workerDashboard.upiId')}</label>
                  <input value={upiId} onChange={(e) => setUpiId(e.target.value)} className="w-full rounded-xl border border-white/10 bg-base-800/60 px-4 py-3 text-sm text-gray-200 outline-none focus:border-neon-emerald/40" />
                </div>
                <div>
                   <label className="mb-1.5 block text-sm font-medium text-gray-300">{t('workerDashboard.hourlyRate')}</label>
                  <input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} className="w-full rounded-xl border border-white/10 bg-base-800/60 px-4 py-3 text-sm text-gray-200 outline-none focus:border-neon-emerald/40" />
                </div>
                 {settingsMsg && <p className={`text-sm ${settingsMsg === t('workerDashboard.settingsSaved') ? 'text-neon-emerald' : 'text-red-400'}`}>{settingsMsg}</p>}
                <div className="flex gap-3">
                  <NeonButton fullWidth onClick={handleSaveSettings} disabled={savingSettings}>
                     {savingSettings ? <Loader2 size={16} className="animate-spin" /> : t('workerDashboard.save')}
                  </NeonButton>
                  <NeonButton variant="ghost" onClick={() => setShowSettings(false)}>{t('workerDashboard.cancel')}</NeonButton>
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
  const { t, categoryName, locale } = useLanguage();
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
           <h3 className="font-semibold text-white">{booking.customer?.name ?? t('workerDashboard.customer')}</h3>
           <p className="text-xs text-gray-400">{categoryName(booking.category)}</p>
        </div>
        <Badge variant={variant}>{getWorkerStatusLabel(booking.status, t)}</Badge>
      </div>
      <div className="space-y-1.5 text-sm text-gray-400 mb-4">
        <div className="flex items-center gap-2"><Calendar size={14} /> {new Date(booking.scheduled_at).toLocaleString(locale)}</div>
        <div className="flex items-center gap-2"><MapPin size={14} /> {booking.address}</div>
        <div className="flex items-center gap-2"><Wallet size={14} /> ₹{Number(booking.total_amount).toFixed(2)}</div>
        {booking.notes && <div className="text-xs text-gray-400 bg-white/5 p-2 rounded-lg mt-2">{t('workerDashboard.note', { note: booking.notes })}</div>}
      </div>
      <div className="flex gap-2">
        {booking.status === 'pending' && (
          <>
             <NeonButton size="sm" variant="emerald" onClick={onAccept}><Check size={14} /> {t('workerDashboard.acceptJob')}</NeonButton>
             <NeonButton size="sm" variant="danger" onClick={onDecline}><XCircle size={14} /> {t('workerDashboard.decline')}</NeonButton>
          </>
        )}
        {booking.status === 'confirmed' && (
          <div className="flex items-center justify-between w-full">
             <span className="text-xs text-neon-emerald font-medium">{t('workerDashboard.acceptedPaying')}</span>
             <NeonButton size="sm" variant="cyan" onClick={onComplete}><CheckCircle size={14} /> {t('workerDashboard.markComplete')}</NeonButton>
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
  const { t, locale } = useLanguage();

  return (
    <GlassCard className="border-neon-emerald/30 bg-neon-emerald/5 p-5 animate-slide-up">
      <div className="flex items-start justify-between mb-3">
        <div>
           <h3 className="font-semibold text-white">{t('workerDashboard.paymentAlert')}</h3>
           <p className="text-xs font-mono text-neon-cyan">{t('workerDashboard.utr', { utr: payment.utr_number ?? '' })}</p>
         </div>
         <Badge variant="amber">{t('workerDashboard.awaitingReceipt')}</Badge>
      </div>
      <div className="mb-4 space-y-1.5 text-sm text-gray-400">
        <div className="flex items-center gap-2"><Wallet size={14} /> ₹{Number(payment.amount).toFixed(2)}</div>
         <div className="flex items-center gap-2"><Clock size={14} /> {new Date(payment.created_at).toLocaleString(locale)}</div>
      </div>
      <NeonButton size="sm" fullWidth variant="emerald" onClick={onConfirm} disabled={loading}>
         {loading ? <Loader2 size={14} className="animate-spin" /> : <><Check size={14} /> {t('workerDashboard.yesReceived')}</>}
      </NeonButton>
    </GlassCard>
  );
}

function getWorkerStatusLabel(status: string | undefined, t: (key: string) => string): string {
  switch (status) {
    case 'confirmed': return t('workerDashboard.accepted');
    case 'pending': return t('workerDashboard.pending');
    case 'in_progress': return t('common.inProgress');
    case 'payment_submitted': return t('common.paymentSubmitted');
    case 'completed': return t('common.completed');
    case 'paid': return t('common.paid');
    case 'cancelled': return t('common.cancelled');
    default: return status ?? t('workerDashboard.pending');
  }
}
