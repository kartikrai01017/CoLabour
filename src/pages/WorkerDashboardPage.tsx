import {
  Wallet, Clock, CheckCircle, XCircle, Bell, Briefcase, Star,
  Check, Loader2, MapPin, Calendar, AlertCircle, Settings, ShieldCheck,
  Receipt, Eye, X
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { GlowOrb } from '@/components/ui/Shared';
import { StatCard } from '@/components/ui/StatCard';
import { Toast } from '@/components/ui/Toast';
import { CATEGORY_ICONS, getCategoryStyle } from '@/lib/categories';
import { useWorkerDashboard } from '@/hooks/useWorkerDashboard';
import { CoLabourPrinterEngine } from '@/components/CoLabourPrinterEngine';
import type { Booking, Payment } from '@/lib/supabase';

interface BookingWithCustomer extends Booking {
  customer?: { name: string; phone: string } | null;
}

interface PaymentWithBooking extends Payment {
  bookings?: { customer_id: string; address: string } | null;
}

export function WorkerDashboardPage() {
  const {
    user, workerProfile, authLoading, loading, navigate,
    confirmingId, showSettings, setShowSettings,
    selectedSlip, setSelectedSlip,
    upiId, setUpiId, hourlyRate, setHourlyRate,
    savingSettings, settingsMsg, toastMsg,
    totalEarnings, pendingPayments, activeBookings, completedJobs,
    handleConfirmPayment, handleUpdateBookingStatus, handleSaveSettings,
  } = useWorkerDashboard();

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-16">
        <Loader2 size={32} className="animate-spin text-nb-ink" />
      </div>
    );
  }

  if (!workerProfile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center pt-16 gap-4">
        <AlertCircle className="text-nb-accent-yellow" size={32} />
        <p className="text-nb-text-muted font-medium">Worker profile not found. Please complete your registration.</p>
        <NeonButton onClick={() => navigate('/signup')}>Complete Registration</NeonButton>
      </div>
    );
  }

  const Icon = CATEGORY_ICONS[workerProfile.category] ?? Briefcase;
  const style = getCategoryStyle(workerProfile.category);

  return (
    <div className="relative min-h-screen overflow-hidden pt-20 pb-12">
      <Toast message={toastMsg} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div className="flex items-center gap-4">
            <div className={`h-16 w-16 rounded-nb-lg border-[3px] border-nb-ink bg-nb-surface flex items-center justify-center shadow-nb-md`}>
              <Icon className="text-nb-ink" size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-nb-ink">{user?.name}'s Dashboard</h1>
              <p className="text-sm font-medium text-nb-text-muted">{workerProfile.category} • Worker ID: {workerProfile.id.slice(0, 8)} • UPI: {workerProfile.upi_id}</p>
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
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-nb-ink">
              <Bell size={18} /> Job Dispatches & Requests
              {activeBookings.length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-nb-sm bg-nb-accent-green text-[10px] font-black text-nb-ink border border-nb-ink">
                  {activeBookings.length}
                </span>
              )}
            </h2>
            <div className="space-y-4">
              {activeBookings.length === 0 ? (
                <GlassCard className="p-8 text-center text-nb-text-muted font-medium">No active job requests right now</GlassCard>
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
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-nb-ink">
              <Wallet size={18} /> Payment Confirmations
              {pendingPayments.length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-nb-sm bg-nb-accent-yellow text-[10px] font-black text-nb-ink border border-nb-ink animate-pulse">
                  {pendingPayments.length}
                </span>
              )}
            </h2>
            <div className="space-y-4">
              {pendingPayments.length === 0 ? (
                <GlassCard className="p-8 text-center text-nb-text-muted font-medium">
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
            <h3 className="mb-4 mt-6 text-sm font-bold text-nb-ink flex items-center gap-2 uppercase tracking-wider">
              <Receipt size={16} /> Settled Jobs & CoLabour Slips
            </h3>
            <div className="space-y-3">
              {completedJobs.length === 0 ? (
                <GlassCard className="p-4 text-center text-sm text-nb-text-muted font-medium">No completed jobs yet</GlassCard>
              ) : (
                completedJobs.slice(0, 5).map((job) => (
                    <GlassCard key={job.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-nb-ink text-sm">{job.customer?.name ?? 'Customer Booking'}</p>
                        <p className="text-xs font-medium text-nb-text-muted">
                          {job.category} • ₹{Number(job.total_amount).toFixed(2)}
                        </p>
                      </div>
                      <NeonButton
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedSlip({ booking: job })}
                        className="text-xs"
                      >
                        <Eye size={14} /> View Slip
                      </NeonButton>
                    </GlassCard>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Slip Modal */}
      {selectedSlip && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-nb-ink/50 backdrop-blur-sm overflow-y-auto"
          onClick={() => setSelectedSlip(null)}
        >
          <div className="relative w-full max-w-md my-8" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedSlip(null)}
              className="absolute top-2 right-2 z-20 rounded-nb-md bg-nb-surface border-[2px] border-nb-ink p-2 text-nb-ink font-bold shadow-nb-sm"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-nb-ink/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowSettings(false)}>
          <GlassCard className="w-full max-w-md p-6 m-4 border-[4px] shadow-nb-xl">
            <div onClick={(e) => e.stopPropagation()}>
              <h2 className="mb-4 text-lg font-bold text-nb-ink">Worker Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-nb-text-muted">UPI ID</label>
                  <input value={upiId} onChange={(e) => setUpiId(e.target.value)} className="w-full rounded-nb-md border-[2px] border-nb-ink bg-nb-surface px-4 py-3 text-sm font-medium text-nb-ink outline-none focus:shadow-nb-md" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-nb-text-muted">Hourly Rate (₹)</label>
                  <input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} className="w-full rounded-nb-md border-[2px] border-nb-ink bg-nb-surface px-4 py-3 text-sm font-medium text-nb-ink outline-none focus:shadow-nb-md" />
                </div>
                {settingsMsg && <p className={`text-sm font-bold ${settingsMsg.includes('success') ? 'text-nb-accent-green' : 'text-nb-accent-red'}`}>{settingsMsg}</p>}
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
          <h3 className="font-bold text-nb-ink">{booking.customer?.name ?? 'Customer'}</h3>
          <p className="text-xs font-medium text-nb-text-muted">{booking.category}</p>
        </div>
        <Badge variant={variant}>{booking.status === 'confirmed' ? 'Accepted' : booking.status.replace('_', ' ')}</Badge>
      </div>
      <div className="space-y-1.5 text-sm font-medium text-nb-text-muted mb-4">
        <div className="flex items-center gap-2"><Calendar size={14} /> {new Date(booking.scheduled_at).toLocaleString()}</div>
        <div className="flex items-center gap-2"><MapPin size={14} /> {booking.address}</div>
        <div className="flex items-center gap-2"><Wallet size={14} /> ₹{Number(booking.total_amount).toFixed(2)}</div>
        {booking.notes && <div className="text-xs text-nb-text-muted bg-nb-surface-muted border border-nb-ink/10 p-2 rounded-nb-sm mt-2 font-medium">Note: {booking.notes}</div>}
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
            <span className="text-xs text-nb-accent-green font-bold">Job Accepted • Customer paying via UPI</span>
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
    <GlassCard className="border-[3px] border-nb-accent-green bg-nb-accent-green/5 p-5 animate-slide-up shadow-nb-md">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-nb-ink">Payment Received Alert</h3>
          <p className="text-xs font-mono font-bold text-nb-accent-orange">UTR: {payment.utr_number}</p>
        </div>
        <Badge variant="amber">Awaiting Receipt</Badge>
      </div>
      <div className="mb-4 space-y-1.5 text-sm font-medium text-nb-text-muted">
        <div className="flex items-center gap-2"><Wallet size={14} /> ₹{Number(payment.amount).toFixed(2)}</div>
        <div className="flex items-center gap-2"><Clock size={14} /> {new Date(payment.created_at).toLocaleString()}</div>
      </div>
      <NeonButton size="sm" fullWidth variant="emerald" onClick={onConfirm} disabled={loading}>
        {loading ? <Loader2 size={14} className="animate-spin" /> : <><Check size={14} /> Yes, Received (Confirm)</>}
      </NeonButton>
    </GlassCard>
  );
}