import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import {
  ArrowLeft, Loader2, AlertCircle, Copy, Check, Smartphone, ShieldCheck, Clock,
  PartyPopper, ArrowRight, RefreshCw, Lock, Hourglass, CheckCircle2
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { GlowOrb } from '@/components/ui/Shared';
import { type Booking, type Payment, type WorkerWithUser } from '@/lib/supabase';
import { fetchBookingById, fetchWorkerProfile, fetchPaymentByBookingId, submitPaymentRecord } from '@/lib/dataService';
import { CoLabourPrinterEngine } from '@/components/CoLabourPrinterEngine';

const UPI_APPS = [
  { name: 'GPay', scheme: 'tez', pkg: 'com.google.android.apps.nbu.paisa.user', color: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  { name: 'PhonePe', scheme: 'phonepe', pkg: 'com.phonepe.app', color: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  { name: 'Paytm', scheme: 'paytmmp', pkg: 'net.one97.paytm', color: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  { name: 'BHIM', scheme: 'bhim', pkg: 'in.org.npci.upiapp', color: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
];

const UTR_REGEX = /^[0-9]{12}$/;

export function PaymentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [worker, setWorker] = useState<WorkerWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [utrNumber, setUtrNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [testReceiptMode, setTestReceiptMode] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchBookingData = useCallback(async () => {
    if (!id) return;
    try {
      const bookingData = await fetchBookingById(id);
      if (!bookingData) { setLoading(false); return; }
      setBooking(bookingData);

      const workerData = await fetchWorkerProfile(bookingData.worker_id);
      setWorker(workerData);

      const existingPayment = await fetchPaymentByBookingId(id);

      if (existingPayment) {
        setPayment(existingPayment);
      } else if (workerData && bookingData) {
        const wp = workerData;
        const amount = bookingData.total_amount;
        const bookingId = bookingData.id;
        const workerName = encodeURIComponent(wp.users?.name ?? 'Worker');
        const upiUri = `upi://pay?pa=${encodeURIComponent(wp.upi_id)}&pn=${workerName}&am=${Number(amount).toFixed(2)}&cu=INR&tn=CoLabour_${bookingId.slice(0, 8)}`;
        
        const newPayment: Payment = {
          id: `pay-${Date.now()}`,
          booking_id: bookingId,
          worker_id: wp.id,
          customer_id: bookingData.customer_id,
          amount,
          upi_uri: upiUri,
          verification_token: `tok-${Date.now()}`,
          status: 'pending',
          utr_number: null,
          paid_at: null,
          created_at: new Date().toISOString(),
        };
        setPayment(newPayment);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBookingData();
  }, [fetchBookingData]);

  // Polling engine for live status changes (booking confirmation by worker + payment acceptance)
  useEffect(() => {
    if (!id) return;

    const poll = async () => {
      try {
        const updatedBooking = await fetchBookingById(id);
        if (updatedBooking) {
          setBooking((prev) => (prev?.status !== updatedBooking.status ? updatedBooking : prev));
        }

        const updated = await fetchPaymentByBookingId(id);
        if (updated) {
          setPayment(updated);
          if (updated.status === 'paid' && !showSuccess) {
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3500);
          }
        }
      } catch {
        // ignore
      }
    };

    pollingRef.current = setInterval(poll, 1000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [id, showSuccess]);

  const handleConfirmPayment = async () => {
    if (!UTR_REGEX.test(utrNumber)) {
      setError('Please enter a valid 12-digit UTR / Reference number (only digits, exactly 12)');
      return;
    }
    if (!payment || !booking || !worker) return;
    if (payment.status === 'paid' || payment.status === 'payment_submitted') return;

    setSubmitting(true);
    setError('');

    try {
      const updatedPayment = await submitPaymentRecord({
        booking_id: booking.id,
        worker_id: worker.id,
        customer_id: booking.customer_id,
        amount: payment.amount,
        upi_uri: payment.upi_uri || undefined,
        utr_number: utrNumber,
      });

      setPayment(updatedPayment);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to confirm payment';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyUpiId = () => {
    if (worker?.upi_id) {
      navigator.clipboard.writeText(worker.upi_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUpiApp = (scheme: string) => {
    if (!payment?.upi_uri) return;
    const app = UPI_APPS.find((a) => a.scheme === scheme);
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!isMobile) {
      window.open(payment.upi_uri, '_blank');
      return;
    }
    if (isAndroid && app) {
      window.location.href = `intent://${payment.upi_uri.replace('upi://', '')}#Intent;scheme=${scheme};package=${app.pkg};S.browser_fallback_url=https://play.google.com/store/apps/details?id=${app.pkg};end;`;
    } else {
      window.location.href = payment.upi_uri!;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-16">
        <Loader2 size={32} className="animate-spin text-neon-emerald" />
      </div>
    );
  }

  if (!booking || !payment || !worker) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center pt-16 gap-4">
        <p className="text-gray-400">Booking or payment record not found.</p>
        <Link to="/customer/dashboard"><NeonButton variant="ghost">Go to Dashboard</NeonButton></Link>
      </div>
    );
  }

  const isPaid = testReceiptMode || payment.status === 'paid' || booking.status === 'paid' || booking.status === 'completed';
  const isSubmitted = payment.status === 'payment_submitted' || booking.status === 'payment_submitted';
  // Check if worker has accepted/confirmed the booking
  const isWorkerAccepted = booking.status !== 'pending';

  return (
    <div className="relative min-h-screen overflow-hidden pt-20 pb-12">
      <GlowOrb className="top-20 -left-20 h-80 w-80 bg-neon-emerald/15" />
      <GlowOrb className="bottom-0 right-0 h-80 w-80 bg-neon-cyan/10" />

      {showSuccess && <SuccessModal amount={payment.amount} />}

      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <Link to="/customer/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-neon-emerald transition-colors">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <button
            type="button"
            onClick={() => setTestReceiptMode(!testReceiptMode)}
            className="text-xs px-3 py-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-300 hover:bg-pink-500/20 transition-all font-mono"
          >
            {testReceiptMode ? '✕ Exit Test Receipt' : '⚡ Quick Test Receipt'}
          </button>
        </div>

        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-3xl font-bold gradient-text-emerald-cyan">Payment Gateway</h1>
          <p className="mt-2 text-gray-400">Direct Worker Settlement powered by UPI</p>
        </div>

        {/* Amount & Status Banner */}
        <GlassCard className="mb-6 p-6 text-center">
          <p className="text-sm text-gray-400 mb-1">Total Payable Amount</p>
          <p className="text-5xl font-bold gradient-text-emerald-cyan">₹{payment.amount.toFixed(2)}</p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <Badge variant={isPaid ? 'emerald' : isSubmitted ? 'amber' : isWorkerAccepted ? 'cyan' : 'amber'}>
              {isPaid ? (
                <><Check size={12} /> Payment Confirmed</>
              ) : isSubmitted ? (
                <><Clock size={12} /> Worker Verifying UTR</>
              ) : isWorkerAccepted ? (
                <><CheckCircle2 size={12} /> Worker Accepted & Ready</>
              ) : (
                <><Hourglass size={12} className="animate-spin" /> Awaiting Worker Acceptance</>
              )}
            </Badge>
          </div>
        </GlassCard>

        {/* 1. STATE: LOCKED - Waiting for Worker Acceptance */}
        {!isWorkerAccepted && !isPaid && (
          <GlassCard className="mb-6 p-8 text-center border-amber-500/30 bg-amber-500/5 animate-pulse-glow">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Lock size={32} className="animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">QR Code Locked</h2>
            <p className="text-sm text-amber-300/90 font-medium max-w-md mx-auto mb-4">
              Waiting for <span className="text-white font-bold">{worker.users?.name ?? 'the professional'}</span> to accept this job request.
            </p>
            <p className="text-xs text-gray-400 max-w-sm mx-auto mb-6">
              The UPI QR code and payment details will automatically unlock instantly once the worker clicks Accept on their dashboard.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs text-amber-400">
              <RefreshCw size={14} className="animate-spin" /> Live polling worker dispatch status...
            </div>
          </GlassCard>
        )}

        {/* 2. STATE: UNLOCKED - Worker Accepted, Reveal QR Code and Payment Form */}
        {isWorkerAccepted && !isPaid && (
          <>
            {/* QR Code Card */}
            <GlassCard className="mb-6 p-8 animate-slide-up">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-neon-emerald animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-wider text-neon-emerald">
                    Job Confirmed by {worker.users?.name ?? 'Worker'}
                  </span>
                </div>
                <Badge variant="emerald">Live UPI Channel</Badge>
              </div>

              <h2 className="mb-4 text-center text-lg font-semibold text-gray-200">Scan to Pay via UPI</h2>
              <div className="flex justify-center mb-4">
                <div className="rounded-2xl bg-white p-4 inline-block shadow-[0_0_40px_rgba(255,255,255,0.15)]">
                  {payment.upi_uri && <QRCodeCanvas value={payment.upi_uri} size={210} level="H" includeMargin={false} />}
                </div>
              </div>
              <p className="text-center text-sm text-gray-400 mb-2">Scan with GPay, PhonePe, Paytm, or BHIM</p>

              {/* UPI ID display with Copy Button */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="rounded-xl border border-white/10 bg-base-800 px-4 py-2.5 text-sm flex items-center gap-2">
                  <span className="text-gray-400 text-xs font-mono">WORKER UPI: </span>
                  <span className="font-mono font-bold text-neon-cyan">{worker.upi_id}</span>
                </div>
                <button
                  onClick={handleCopyUpiId}
                  className="rounded-xl border border-white/10 bg-base-800/80 p-2.5 text-gray-400 hover:text-neon-emerald hover:border-neon-emerald/40 transition-all flex items-center gap-1.5 text-xs"
                  title="Copy UPI ID"
                >
                  {copied ? <Check size={16} className="text-neon-emerald" /> : <Copy size={16} />}
                  <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              {/* UPI App deep links */}
              <div className="mt-6">
                <p className="mb-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Or Launch Installed App Directly:</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {UPI_APPS.map((app) => (
                    <button
                      key={app.name}
                      onClick={() => handleUpiApp(app.scheme)}
                      className={`flex flex-col items-center gap-2 rounded-xl border ${app.color} ${app.border} p-3 transition-all hover:scale-105`}
                    >
                      <Smartphone size={22} className={app.text} />
                      <span className={`text-xs font-semibold ${app.text}`}>{app.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </GlassCard>

            {/* UTR Confirmation Card */}
            <GlassCard className="mb-6 p-6 animate-slide-up">
              <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-gray-200">
                <ShieldCheck size={20} className="text-neon-emerald" /> Submit UPI Reference (UTR)
              </h2>
              <p className="mb-4 text-sm text-gray-400">
                After paying in your UPI app, enter the 12-digit transaction UTR number to submit for worker confirmation.
              </p>

              {isSubmitted ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-5 py-4">
                    <Clock size={24} className="text-amber-400 animate-pulse flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-amber-400">Payment Submitted - Awaiting Worker Confirmation</p>
                      <p className="text-xs font-mono text-gray-300 mt-1">Submitted UTR: {payment.utr_number}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        An instant alert has been dispatched to {worker.users?.name ?? 'the worker'}. This screen will generate your official slip as soon as confirmed.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-400 py-1">
                    <RefreshCw size={14} className="animate-spin text-neon-cyan" /> Polling worker confirmation status...
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-300">
                      12-Digit Bank UTR / Transaction Reference <span className="text-neon-emerald">*</span>
                    </label>
                    <input
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                      placeholder="e.g. 483920194821"
                      className="w-full rounded-xl border border-white/10 bg-base-800/80 px-4 py-3.5 text-center font-mono text-xl tracking-widest text-neon-cyan outline-none transition-all focus:border-neon-emerald/50 focus:shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                      maxLength={12}
                    />
                    <p className="text-[11px] text-gray-500 text-center mt-1.5">
                      Found in your UPI App payment details (GPay, PhonePe, Paytm, etc.)
                    </p>
                  </div>

                  {error && (
                    <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                      <AlertCircle size={16} /> {error}
                    </div>
                  )}

                  <NeonButton fullWidth size="lg" variant="emerald" onClick={handleConfirmPayment} disabled={submitting}>
                    {submitting ? (
                      <><Loader2 size={18} className="animate-spin" /> Submitting to Worker...</>
                    ) : (
                      <>Submit for Worker Confirmation <ArrowRight size={18} /></>
                    )}
                  </NeonButton>
                </>
              )}
            </GlassCard>
          </>
        )}

        {/* 3. STATE: PAID - 3D CoLabour Thermal POS Slip Machine Engine */}
        {isPaid && (
          <div className="animate-fade-in">
            <CoLabourPrinterEngine
              bookingId={booking.id}
              workerName={worker.users?.name ?? 'Professional Worker'}
              workerSkill={booking.category}
              workerUpiId={worker.upi_id}
              customerName="Verified Customer"
              date={payment.paid_at || new Date().toISOString()}
              utrNumber={payment.utr_number || 'UPI-REF-SUCCESS'}
              totalAmount={Number(payment.amount)}
              onDone={() => navigate('/customer/dashboard')}
            />
          </div>
        )}

        {/* Security Assurance Guarantee */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500 text-center">
          <ShieldCheck size={14} className="text-neon-emerald flex-shrink-0" />
          <span>CoLabour Direct-to-Worker UPI Protocol guarantees 0% commission deductions. Payments go straight to the professional.</span>
        </div>
      </div>
    </div>
  );
}

function SuccessModal({ amount }: { amount: number }) {
  const [pieces, setPieces] = useState<{ left: number; delay: number; color: string; duration: number }[]>([]);

  useEffect(() => {
    const colors = ['#10B981', '#06B6D4', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'];
    const newPieces = Array.from({ length: 60 }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.4,
      color: colors[i % colors.length],
      duration: 1 + Math.random() * 1.5,
    }));
    setPieces(newPieces);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-base-900/80 backdrop-blur-md animate-fade-in pointer-events-none">
      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {pieces.map((p, i) => (
          <div
            key={i}
            className="absolute top-0 h-3 w-3 rounded-sm"
            style={{
              left: `${p.left}%`,
              backgroundColor: p.color,
              animation: `confetti ${p.duration}s ease-out ${p.delay}s forwards`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center animate-scale-in">
        <div className="relative mx-auto mb-6">
          <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-neon-emerald to-neon-cyan shadow-[0_0_60px_rgba(16,185,129,0.5)] mx-auto">
            <Check size={52} className="text-white" />
          </div>
        </div>

        <h2 className="text-3xl font-bold gradient-text-emerald-cyan mb-2">Payment Confirmed!</h2>
        <p className="text-lg text-gray-300 mb-2">₹{amount.toFixed(2)} received by worker</p>
        <p className="text-xs text-neon-cyan font-mono flex items-center justify-center gap-1.5">
          <PartyPopper size={16} className="text-pink-400" /> Generating official thermal receipt slip...
        </p>
      </div>
    </div>
  );
}
