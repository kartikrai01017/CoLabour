import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet, Clock, CheckCircle, XCircle, Bell, Briefcase, Star,
  Check, Loader2, MapPin, Calendar, AlertCircle, Settings, ShieldCheck,
  CheckCircle2, FileText, Printer, Award, ThumbsDown, Sparkles, ArrowRight
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { GlowOrb, AnimatedCounter } from '@/components/ui/Shared';
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
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState('');

  const [selectedReceipt, setSelectedReceipt] = useState<{
    show: boolean;
    paymentId: string;
    amount: number;
    utrNumber?: string;
    date: string;
  } | null>(null);

  const fetchData = useCallback(async () => {
    if (!workerProfile) return;

    try {
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [workerProfile]);

  useEffect(() => {
    if (authLoading) return;
    if (workerProfile) {
      setUpiId(workerProfile.upi_id || '');
      setHourlyRate(String(workerProfile.hourly_rate || 0));
      fetchData();
    }
  }, [workerProfile, authLoading, fetchData]);

  useEffect(() => {
    if (!workerProfile) return;
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, [workerProfile, fetchData]);

  const handleAcceptWork = async (bookingId: string) => {
    try {
      await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', bookingId);
      await fetchData();
    } catch {
      alert('Work request accept karne me dikkat aayi');
    }
  };

  const handleDeclineWork = async (bookingId: string) => {
    try {
      await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);
      await fetchData();
    } catch {
      alert('Booking decline nahi ho payi');
    }
  };

  const handleCompleteWork = async (bookingId: string) => {
    try {
      await supabase.from('bookings').update({ status: 'completed' }).eq('id', bookingId);
      await fetchData();
    } catch {
      alert('Status update fail hua');
    }
  };

  const handleConfirmPaymentReceived = async (bookingId: string, paymentId?: string, amount?: number, utrNumber?: string) => {
    setConfirmingId(paymentId || bookingId);
    try {
      if (paymentId) {
        await supabase
          .from('payments')
          .update({ status: 'paid', paid_at: new Date().toISOString() })
          .eq('id', paymentId);
      }

      await supabase
        .from('bookings')
        .update({ status: 'paid' })
        .eq('id', bookingId);

      setSelectedReceipt({
        show: true,
        paymentId: paymentId || bookingId,
        amount: Number(amount || 0),
        utrNumber: utrNumber || 'Verified',
        date: new Date().toLocaleDateString('en-IN'),
      });

      await fetchData();
    } catch {
      alert('Payment confirmation fail hui');
    } finally {
      setConfirmingId(null);
    }
  };

  const handleRejectPayment = async (bookingId: string, paymentId?: string) => {
    setRejectingId(paymentId || bookingId);
    try {
      if (paymentId) {
        await supabase
          .from('payments')
          .update({ status: 'pending', utr_number: null })
          .eq('id', paymentId);
      }

      await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', bookingId);

      await fetchData();
    } catch {
      alert('Update fail hua');
    } finally {
      setRejectingId(null);
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
      setSettingsMsg('Settings save ho gayi!');
      setTimeout(() => setShowSettings(false), 1200);
    } catch {
      setSettingsMsg('Save nahi ho paya');
    } finally {
      setSavingSettings(false);
    }
  };

  const totalEarnings = payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0);
  const pendingPayments = payments.filter((p) => p.status === 'payment_submitted' || (p.utr_number && p.status !== 'paid'));
  const activeBookings = bookings.filter((b) => ['pending', 'confirmed', 'in_progress', 'payment_submitted', 'paid'].includes(b.status));
  const completedJobs = bookings.filter((b) => b.status === 'completed').length;

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-16 bg-[#070b14]">
        <Loader2 size={32} className="animate-spin text-neon-emerald" />
      </div>
    );
  }

  if (!workerProfile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center pt-16 gap-4 bg-[#070b14] text-slate-100">
        <AlertCircle className="text-amber-400" size={32} />
        <p className="text-gray-400">Worker profile nahi mila.</p>
        <NeonButton onClick={() => navigate('/signup')}>Registration Pura Karein</NeonButton>
      </div>
    );
  }

  const Icon = CATEGORY_ICONS[workerProfile.category] ?? Briefcase;
  const style = getCategoryStyle(workerProfile.category);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070b14] pt-20 pb-12 text-slate-100">
      <GlowOrb className="top-20 -left-20 h-80 w-80 bg-neon-emerald/10 blur-[120px]" />
      <GlowOrb className="bottom-0 right-0 h-80 w-80 bg-neon-cyan/10 blur-[120px]" />

      {selectedReceipt?.show && (
        <WorkerReceiptModal
          amount={selectedReceipt.amount}
          paymentId={selectedReceipt.paymentId}
          workerName={user?.name || 'Worker'}
          category={workerProfile.category}
          utrNumber={selectedReceipt.utrNumber}
          date={selectedReceipt.date}
          onClose={() => setSelectedReceipt(null)}
        />
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div className="flex items-center gap-4">
            <div className={`h-16 w-16 rounded-2xl border ${style.bg} ${style.border} flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)]`}>
              <Icon className={style.text} size={32} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{user?.name}'s Dashboard</h1>
              <p className="text-sm text-gray-400">{workerProfile.category} • Rate: ₹{workerProfile.hourly_rate}/hr</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="emerald"><ShieldCheck size={12} /> {workerProfile.is_verified ? 'Verified' : 'Active'}</Badge>
            <NeonButton variant="ghost" size="sm" onClick={() => setShowSettings(true)}>
              <Settings size={16} /> Settings
            </NeonButton>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={Wallet} label="Total Earnings" value={`₹${totalEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} color="emerald" />
          <StatCard icon={Briefcase} label="Active Bookings" value={activeBookings.length} color="cyan" />
          <StatCard icon={CheckCircle} label="Jobs Completed" value={completedJobs} color="violet" />
          <StatCard icon={Star} label="Rating" value={workerProfile.rating.toFixed(1)} color="amber" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Active Bookings List */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-200">
              <Bell size={18} className="text-neon-cyan" /> Bookings & Actions
              {activeBookings.length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neon-emerald text-xs font-bold text-base-900 animate-pulse">
                  {activeBookings.length}
                </span>
              )}
            </h2>

            <div className="space-y-4">
              {activeBookings.length === 0 ? (
                <GlassCard className="p-8 text-center text-gray-500">No active requests</GlassCard>
              ) : (
                activeBookings.map((b) => {
                  const matchingPayment = payments.find(p => p.booking_id === b.id);
                  const isPaymentDone = matchingPayment?.status === 'paid' || b.status === 'paid';
                  const hasSubmittedUtr = (!isPaymentDone) && (
                    (matchingPayment && Boolean(matchingPayment.utr_number)) || 
                    b.status === 'payment_submitted' || 
                    matchingPayment?.status === 'payment_submitted'
                  );

                  return (
                    <GlassCard key={b.id} className="p-5 border-white/10 hover:border-neon-emerald/30 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-white text-base">{b.customer?.name ?? 'Customer'}</h3>
                          <p className="text-xs text-neon-cyan">{b.category}</p>
                        </div>
                        <Badge variant={isPaymentDone ? 'emerald' : hasSubmittedUtr ? 'amber' : b.status === 'confirmed' ? 'cyan' : 'amber'}>
                          {isPaymentDone ? 'PAID' : hasSubmittedUtr ? 'UTR SUBMITTED' : b.status.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm text-gray-300 mb-4 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2"><Calendar size={14} className="text-neon-cyan" /> {new Date(b.scheduled_at).toLocaleString()}</div>
                        <div className="flex items-center gap-2"><MapPin size={14} className="text-neon-emerald" /> {b.address}</div>
                        <div className="flex items-center gap-2"><Wallet size={14} className="text-amber-400" /> ₹{Number(b.total_amount).toFixed(2)}</div>
                      </div>

                      {/* Action Controls */}
                      <div className="space-y-3">
                        {/* 1. Pending: Accept / Decline */}
                        {b.status === 'pending' && (
                          <div className="flex gap-2">
                            <NeonButton size="sm" variant="emerald" onClick={() => handleAcceptWork(b.id)}>
                              <Check size={14} /> Accept Work
                            </NeonButton>
                            <NeonButton size="sm" variant="danger" onClick={() => handleDeclineWork(b.id)}>
                              <XCircle size={14} /> Decline
                            </NeonButton>
                          </div>
                        )}

                        {/* 2. Paid / UTR Submitted: Show Confirmation Buttons */}
                        {hasSubmittedUtr && !isPaymentDone && (
                          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-amber-300 font-semibold">Payment Received from Customer:</span>
                              <span className="font-mono text-xs text-white bg-black/40 px-2 py-0.5 rounded border border-white/10 font-bold">
                                UTR: {matchingPayment?.utr_number || 'Submitted via App'}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-300">Did you receive ₹{Number(b.total_amount).toFixed(2)} in your UPI?</p>
                            <div className="flex gap-2 pt-1">
                              <button
                                onClick={() => handleConfirmPaymentReceived(b.id, matchingPayment?.id, Number(b.total_amount), matchingPayment?.utr_number)}
                                disabled={confirmingId === (matchingPayment?.id || b.id)}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                              >
                                {confirmingId === (matchingPayment?.id || b.id) ? <Loader2 size={13} className="animate-spin" /> : <><Check size={14} /> Yes, Received</>}
                              </button>
                              <button
                                onClick={() => handleRejectPayment(b.id, matchingPayment?.id)}
                                disabled={rejectingId === (matchingPayment?.id || b.id)}
                                className="flex-1 bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                              >
                                {rejectingId === (matchingPayment?.id || b.id) ? <Loader2 size={13} className="animate-spin" /> : <><ThumbsDown size={14} /> No, Not Received</>}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* 3. Confirmed & NOT yet paid: Only then show waiting message */}
                        {b.status === 'confirmed' && !hasSubmittedUtr && !isPaymentDone && (
                          <div className="flex items-center justify-between bg-cyan-500/10 border border-cyan-500/20 px-3 py-2 rounded-xl text-xs text-neon-cyan">
                            <span className="flex items-center gap-1.5"><Clock size={14} className="animate-spin" /> Waiting for customer payment</span>
                          </div>
                        )}

                        {/* 4. Fully Paid: Show Slip and Complete Button */}
                        {isPaymentDone && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedReceipt({
                                show: true,
                                paymentId: matchingPayment?.id || b.id,
                                amount: Number(b.total_amount),
                                utrNumber: matchingPayment?.utr_number || 'Direct UPI',
                                date: new Date().toLocaleDateString('en-IN'),
                              })}
                              className="flex-1 rounded-xl border border-neon-cyan/40 bg-neon-cyan/10 py-2 text-xs font-bold text-neon-cyan hover:bg-neon-cyan hover:text-black transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <FileText size={14} /> View CoLabour Slip
                            </button>
                            <NeonButton size="sm" variant="emerald" onClick={() => handleCompleteWork(b.id)}>
                              <CheckCircle size={14} /> Complete Job
                            </NeonButton>
                          </div>
                        )}
                      </div>
                    </GlassCard>
                  );
                })
              )}
            </div>
          </div>

          {/* Pending Payment Checks Column */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-200">
              <Wallet size={18} className="text-neon-emerald" /> Pending Payment Checks
            </h2>

            <div className="space-y-4">
              {pendingPayments.length === 0 ? (
                <GlassCard className="p-8 text-center text-gray-500">No pending verification</GlassCard>
              ) : (
                pendingPayments.map((p) => (
                  <GlassCard key={p.id} className="border-amber-500/40 bg-gradient-to-b from-amber-500/10 to-transparent p-5 shadow-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-white">Payment Claim</h3>
                        <p className="text-xs font-mono text-neon-cyan font-bold mt-1">UTR: {p.utr_number}</p>
                      </div>
                      <Badge variant="amber">Pending</Badge>
                    </div>

                    <div className="mb-4 space-y-1.5 text-sm text-gray-300 bg-black/30 p-3 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2"><Wallet size={14} className="text-neon-emerald" /> Claimed: <strong className="text-white text-base">₹{Number(p.amount).toFixed(2)}</strong></div>
                    </div>

                    <div className="flex gap-2">
                      <NeonButton
                        size="sm"
                        fullWidth
                        variant="emerald"
                        onClick={() => handleConfirmPaymentReceived(p.booking_id, p.id, p.amount, p.utr_number)}
                        disabled={confirmingId === p.id || rejectingId === p.id}
                      >
                        {confirmingId === p.id ? <Loader2 size={14} className="animate-spin" /> : <><Check size={14} /> Yes, Received</>}
                      </NeonButton>

                      <NeonButton
                        size="sm"
                        fullWidth
                        variant="danger"
                        onClick={() => handleRejectPayment(p.booking_id, p.id)}
                        disabled={confirmingId === p.id || rejectingId === p.id}
                      >
                        {rejectingId === p.id ? <Loader2 size={14} className="animate-spin" /> : <><ThumbsDown size={14} /> No, Not Received</>}
                      </NeonButton>
                    </div>
                  </GlassCard>
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

function WorkerReceiptModal({ amount, paymentId, workerName, category, utrNumber, date, onClose }: {
  amount: number;
  paymentId: string;
  workerName: string;
  category: string;
  utrNumber?: string;
  date: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 animate-fade-in">
      <div className="relative w-full max-w-[370px] rounded-[42px] bg-gradient-to-b from-slate-100 via-slate-200 to-slate-300 p-6 sm:p-7 shadow-2xl border-2 border-slate-300">
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-3.5 rounded-full bg-emerald-500 shadow-[0_0_12px_#10B981] animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-slate-600 tracking-wider">SETTLED</span>
          </div>
          <span className="text-xs font-black tracking-widest text-slate-400 uppercase font-mono">COLABOUR SLIP</span>
        </div>

        <div className="relative z-20 mx-auto h-4.5 w-[94%] rounded-full bg-slate-900 shadow-[inset_0_3px_6px_rgba(0,0,0,0.95)] border-b border-slate-400/40 flex items-center justify-center overflow-hidden">
          <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
        </div>

        <div className="relative z-10 w-full overflow-hidden flex justify-center -mt-2">
          <div className="w-[94%] my-2 rounded-2xl bg-gradient-to-b from-[#0e804f] via-[#095f3a] to-[#043c24] p-5 text-white shadow-[0_20px_45px_rgba(0,0,0,0.6)] border border-emerald-400/40">
            <div className="text-center pt-2">
              <span className="inline-block rounded-full bg-white/15 px-3 py-0.5 text-[9px] font-black tracking-widest uppercase mb-2 border border-white/25">
                <Sparkles size={10} className="inline mr-1 text-amber-300" /> OFFICIAL EARNING VOUCHER
              </span>
              <h3 className="text-2xl font-black tracking-tight text-white">Payment Received</h3>
              <p className="text-[11px] text-emerald-200 font-mono mt-0.5">Slip #{paymentId.slice(0, 8).toUpperCase()}</p>
            </div>

            <div className="my-3.5 rounded-xl bg-black/30 p-3 text-center border border-white/10 shadow-inner backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-wider text-emerald-300 font-medium">Credited to Earnings</p>
              <p className="text-3xl font-black text-white tracking-tight">₹{amount.toFixed(2)}</p>
              <div className="text-[11px] text-emerald-300 font-medium mt-1 flex items-center justify-center gap-1">
                <CheckCircle2 size={13} /> Verified by You
              </div>
            </div>

            <div className="space-y-1.5 text-xs border-t border-emerald-500/40 pt-3 text-emerald-100">
              <div className="flex justify-between"><span>Professional:</span><strong className="text-white">{workerName}</strong></div>
              <div className="flex justify-between"><span>Category:</span><strong className="text-white">{category}</strong></div>
              <div className="flex justify-between"><span>Date:</span><span className="font-mono text-white">{date}</span></div>
              <div className="flex justify-between"><span>UTR / Ref:</span><span className="font-mono text-amber-300 font-bold">{utrNumber}</span></div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-1 text-[10px] text-emerald-200 font-mono">
              <Award size={12} className="text-amber-300" /> EARNINGS CONFIRMED
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button onClick={() => window.print()} className="flex-1 rounded-xl bg-slate-800 py-3 text-xs font-bold text-white shadow-md hover:bg-slate-900 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
            <Printer size={14} /> Print Slip
          </button>
          <button onClick={onClose} className="flex-1 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
            Close <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
