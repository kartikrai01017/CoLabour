import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet, Clock, CheckCircle, XCircle, Bell, Briefcase, Star,
  Check, Loader2, MapPin, Calendar, AlertCircle, Settings, ShieldCheck, Printer, Receipt,
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
  const [showSettings, setShowSettings] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState('');

  // Receipt / Bill Popup State
  const [recentPaidPayment, setRecentPaidPayment] = useState<PaymentWithBooking | null>(null);
  const [showBillModal, setShowBillModal] = useState(false);

  // Selected receipt for printing anytime from history
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentWithBooking | null>(null);

  // Audio synthesis for "Toing" sound box effect
  const playSoundBoxTone = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      console.log('Audio not supported', e);
    }
  };

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
    if (workerProfile) {
      setUpiId(workerProfile.upi_id);
      setHourlyRate(String(workerProfile.hourly_rate));
      fetchData();
    }
  }, [workerProfile, authLoading, fetchData]);

  useEffect(() => {
    if (!workerProfile) return;
    const interval = setInterval(fetchData, 2500);
    return () => clearInterval(interval);
  }, [workerProfile, fetchData]);

  const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
    try {
      await supabase.from('bookings').update({ status }).eq('id', bookingId);
      await fetchData();
    } catch {
      alert('Status update failed');
    }
  };

  const handleConfirmPayment = async (paymentId: string) => {
    if (!user) return;
    setConfirmingId(paymentId);
    try {
      const { error } = await supabase
        .from('payments')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('id', paymentId);
      if (error) throw error;

      const cur = payments.find((p) => p.id === paymentId);
      if (cur?.booking_id) {
        await supabase.from('bookings').update({ status: 'paid' }).eq('id', cur.booking_id);
      }

      playSoundBoxTone();
      if (cur) setRecentPaidPayment(cur);
      setShowBillModal(true);

      await fetchData();
    } catch {
      alert('Payment confirmation failed');
    } finally {
      setConfirmingId(null);
    }
  };

  const handleRejectPayment = async (paymentId: string, bookingId?: string) => {
    setConfirmingId(paymentId);
    try {
      await supabase
        .from('payments')
        .update({ status: 'pending', utr_number: null })
        .eq('id', paymentId);

      if (bookingId) {
        await supabase.from('bookings').update({ status: 'confirmed' }).eq('id', bookingId);
      }

      await fetchData();
      alert('Payment rejected and sent back to customer for re-verification.');
    } catch {
      alert('Failed to reject payment');
    } finally {
      setConfirmingId(null);
    }
  };

  // Trigger browser print dialog for thermal receipt
  const handlePrintReceipt = (payment: PaymentWithBooking) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print receipt');
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>CoLabour Receipt - ${payment.id.slice(0, 8)}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; width: 300px; margin: 0 auto; padding: 20px; color: #000; }
            .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 15px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
            .footer { text-align: center; border-top: 2px dashed #000; padding-top: 10px; margin-top: 15px; font-size: 11px; }
            .total { font-weight: bold; font-size: 16px; border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 6px 0; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h3>COLABOUR SERVICES</h3>
            <p>Official Payment Receipt</p>
          </div>
          <div class="row"><span>Receipt ID:</span><span>#${payment.id.slice(0, 8)}</span></div>
          <div class="row"><span>Date:</span><span>${new Date(payment.paid_at || payment.created_at).toLocaleString()}</span></div>
          <div class="row"><span>UTR / Ref:</span><span>${payment.utr_number || 'N/A'}</span></div>
          <div class="row"><span>Status:</span><span>PAID & VERIFIED</span></div>
          <div class="total row"><span>TOTAL PAID:</span><span>₹${Number(payment.amount).toFixed(2)}</span></div>
          <div class="footer">
            <p>Thank you for using CoLabour!</p>
            <p>This is a computer generated digital receipt.</p>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
  const paidPayments = payments.filter((p) => p.status === 'paid');
  const activeBookings = bookings.filter((b) => ['pending', 'confirmed', 'in_progress', 'payment_submitted'].includes(b.status));
  
  const latestPendingRequest = bookings.find((b) => b.status === 'pending');
  const latestIncomingPayment = pendingPayments[0];
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
        <p className="text-gray-400">Worker profile not found.</p>
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

      {/* 1. DIGITAL BILL / RECEIPT PRINTER POPUP MODAL */}
      {showBillModal && recentPaidPayment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fade-in">
          <GlassCard className="w-full max-w-sm border-2 border-neon-emerald/60 p-6 bg-base-900 shadow-[0_0_60px_rgba(16,185,129,0.4)] animate-scale-in text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-neon-emerald via-neon-cyan to-neon-violet" />
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-neon-emerald/20 text-neon-emerald border border-neon-emerald">
              <Printer size={32} className="animate-bounce" />
            </div>

            <h3 className="text-xl font-bold text-white mb-1">Payment Received!</h3>
            <p className="text-xs text-neon-emerald font-mono mb-4">SOUNDBOX: "₹{Number(recentPaidPayment.amount).toFixed(2)} praapt hue"</p>

            <div className="rounded-xl border border-dashed border-white/20 bg-base-800/80 p-4 text-left font-mono text-xs space-y-2 mb-6 text-gray-300">
              <div className="text-center font-bold text-white border-b border-white/10 pb-2">
                COLABOUR DIGITAL RECEIPT
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment ID:</span>
                <span className="text-neon-cyan">{recentPaidPayment.id.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">UTR / Ref:</span>
                <span>{recentPaidPayment.utr_number || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date:</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2 font-bold text-white text-sm">
                <span>Total Paid:</span>
                <span className="text-neon-emerald">₹{Number(recentPaidPayment.amount).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <NeonButton variant="emerald" fullWidth onClick={() => { handlePrintReceipt(recentPaidPayment); setShowBillModal(false); }}>
                <Printer size={16} /> Print Receipt
              </NeonButton>
              <NeonButton variant="ghost" onClick={() => setShowBillModal(false)}>Close</NeonButton>
            </div>
          </GlassCard>
        </div>
      )}

      {/* 2. INCOMING BOOKING REQUEST POPUP */}
      {latestPendingRequest && !showBillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fade-in">
          <GlassCard className="w-full max-w-lg border-2 border-neon-cyan/50 p-6 shadow-[0_0_50px_rgba(6,182,212,0.3)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-4 w-4 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-neon-cyan"></span>
                </span>
                <h2 className="text-xl font-bold text-white">New Booking Request!</h2>
              </div>
              <Badge variant="cyan">Instant</Badge>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center bg-base-800/60 p-3 rounded-xl">
                <span className="text-gray-400 text-sm">Customer</span>
                <span className="text-white font-semibold">{latestPendingRequest.customer?.name ?? 'Customer'}</span>
              </div>
              <div className="flex justify-between items-center bg-base-800/60 p-3 rounded-xl">
                <span className="text-gray-400 text-sm">Fare</span>
                <span className="text-neon-emerald font-bold text-lg">₹{Number(latestPendingRequest.total_amount).toFixed(2)}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <NeonButton variant="danger" size="lg" onClick={() => handleUpdateBookingStatus(latestPendingRequest.id, 'cancelled')}>
                <XCircle size={18} /> Reject
              </NeonButton>
              <NeonButton variant="emerald" size="lg" onClick={() => handleUpdateBookingStatus(latestPendingRequest.id, 'confirmed')}>
                <Check size={18} /> Accept
              </NeonButton>
            </div>
          </GlassCard>
        </div>
      )}

      {/* 3. INCOMING PAYMENT VERIFICATION POPUP */}
      {latestIncomingPayment && !latestPendingRequest && !showBillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fade-in">
          <GlassCard className="w-full max-w-lg border-2 border-neon-emerald/60 p-6 shadow-[0_0_60px_rgba(16,185,129,0.35)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-emerald/20 text-neon-emerald border border-neon-emerald/40">
                  <Wallet size={24} className="animate-bounce" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Payment Verification</h2>
                  <p className="text-xs text-gray-400">Kya aapko payment mil gaya?</p>
                </div>
              </div>
              <Badge variant="emerald">Verify</Badge>
            </div>

            <div className="space-y-3 mb-6">
              <div className="bg-base-800/60 p-4 rounded-xl text-center border border-white/5">
                <p className="text-xs text-gray-400 mb-1">Amount</p>
                <p className="text-4xl font-bold gradient-text-emerald-cyan">₹{Number(latestIncomingPayment.amount).toFixed(2)}</p>
              </div>
              <div className="flex justify-between items-center bg-base-800/60 p-3 rounded-xl">
                <span className="text-gray-400 text-sm">UTR / Ref No:</span>
                <span className="font-mono text-neon-cyan font-bold">{latestIncomingPayment.utr_number}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <NeonButton
                variant="danger"
                size="lg"
                disabled={confirmingId === latestIncomingPayment.id}
                onClick={() => handleRejectPayment(latestIncomingPayment.id, latestIncomingPayment.booking_id ?? undefined)}
              >
                <XCircle size={18} /> No (Not Received)
              </NeonButton>
              <NeonButton
                variant="emerald"
                size="lg"
                disabled={confirmingId === latestIncomingPayment.id}
                onClick={() => handleConfirmPayment(latestIncomingPayment.id)}
              >
                {confirmingId === latestIncomingPayment.id ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <><Check size={18} /> Yes (Received)</>
                )}
              </NeonButton>
            </div>
          </GlassCard>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className={`h-16 w-16 rounded-2xl border ${style.bg} ${style.border} flex items-center justify-center`}>
              <Icon className={style.text} size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{user?.name}'s Dashboard</h1>
              <p className="text-sm text-gray-400">{workerProfile.category} • UPI: <span className="font-mono text-neon-cyan">{workerProfile.upi_id}</span></p>
            </div>
          </div>
          <NeonButton variant="ghost" size="sm" onClick={() => setShowSettings(true)}>
            <Settings size={16} /> Settings
          </NeonButton>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={Wallet} label="Total Earnings" value={`₹${totalEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} color="emerald" />
          <StatCard icon={Briefcase} label="Active Bookings" value={activeBookings.length} color="cyan" />
          <StatCard icon={CheckCircle} label="Jobs Completed" value={completedJobs} color="violet" />
          <StatCard icon={Star} label="Rating" value={workerProfile.rating.toFixed(1)} color="amber" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Active Jobs */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-200">
              <Bell size={18} className="text-neon-cyan" /> Active Jobs
            </h2>
            <div className="space-y-4">
              {activeBookings.length === 0 ? (
                <GlassCard className="p-8 text-center text-gray-500">No active bookings</GlassCard>
              ) : (
                activeBookings.map((booking) => (
                  <GlassCard key={booking.id} className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-white">{booking.customer?.name ?? 'Customer'}</h3>
                        <p className="text-xs text-gray-400">{booking.address}</p>
                      </div>
                      <Badge variant={booking.status === 'confirmed' ? 'emerald' : 'amber'}>{booking.status}</Badge>
                    </div>
                    {booking.status === 'confirmed' && (
                      <NeonButton size="sm" variant="cyan" onClick={() => handleUpdateBookingStatus(booking.id, 'completed')}>
                        <CheckCircle size={14} /> Mark Completed
                      </NeonButton>
                    )}
                  </GlassCard>
                ))
              )}
            </div>
          </div>

          {/* Payment History & Print Bill */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-200">
              <Receipt size={18} className="text-neon-emerald" /> Payment Received History & Bills
            </h2>
            <div className="space-y-4">
              {paidPayments.length === 0 ? (
                <GlassCard className="p-8 text-center text-gray-500">No confirmed payments yet</GlassCard>
              ) : (
                paidPayments.map((payment) => (
                  <GlassCard key={payment.id} className="border-neon-emerald/20 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white text-base">₹{Number(payment.amount).toFixed(2)}</p>
                        <p className="text-xs text-gray-400 font-mono">UTR: {payment.utr_number || 'Verified'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="emerald"><Check size={10} /> Received</Badge>
                        <button
                          onClick={() => handlePrintReceipt(payment)}
                          className="flex items-center gap-1.5 rounded-lg border border-neon-cyan/30 bg-neon-cyan/10 px-3 py-1.5 text-xs font-medium text-neon-cyan hover:bg-neon-cyan/20 transition-all"
                        >
                          <Printer size={14} /> Print Bill
                        </button>
                      </div>
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
