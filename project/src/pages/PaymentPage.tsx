import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import {
  ArrowLeft, Loader2, AlertCircle, Copy, Check, Smartphone, ShieldCheck, Clock,
  Zap, PartyPopper, ArrowRight, RefreshCw,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { FloatingShape } from '@/components/ui/Shared';
import { supabase, type Booking, type Payment, type WorkerWithUser } from '@/lib/supabase';

const UPI_APPS = [
  { name: 'GPay', scheme: 'tez', color: 'bg-white/[0.04]', text: 'text-blue-400', border: 'border-white/8' },
  { name: 'PhonePe', scheme: 'phonepe', color: 'bg-white/[0.04]', text: 'text-purple-400', border: 'border-white/8' },
  { name: 'Paytm', scheme: 'paytmmp', color: 'bg-white/[0.04]', text: 'text-cyan-400', border: 'border-white/8' },
  { name: 'BHIM', scheme: 'bhim', color: 'bg-white/[0.04]', text: 'text-orange-400', border: 'border-white/8' },
];

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
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchBookingData = useCallback(async () => {
    if (!id) return;
    const { data: bookingData } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (!bookingData) { setLoading(false); return; }
    setBooking(bookingData as Booking);

    const { data: workerData } = await supabase
      .from('worker_profiles')
      .select('*, users!inner(name, email, phone)')
      .eq('id', (bookingData as Booking).worker_id)
      .maybeSingle();
    setWorker(workerData as unknown as WorkerWithUser | null);

    const { data: existingPayment } = await supabase
      .from('payments')
      .select('*')
      .eq('booking_id', id)
      .maybeSingle();

    if (existingPayment) {
      setPayment(existingPayment as Payment);
    } else if (workerData && bookingData) {
      const wp = workerData as unknown as WorkerWithUser;
      const amount = (bookingData as Booking).total_amount;
      const bookingId = (bookingData as Booking).id;
      const workerName = encodeURIComponent(wp.users?.name ?? 'Worker');
      const upiUri = `upi://pay?pa=${encodeURIComponent(wp.upi_id)}&pn=${workerName}&am=${Number(amount).toFixed(2)}&cu=INR&tn=CoLaber_${bookingId.slice(0, 8)}`;
      const token = crypto.randomUUID();

      const { data: newPayment, error: payError } = await supabase
        .from('payments')
        .insert({
          booking_id: bookingId,
          worker_id: wp.id,
          customer_id: (bookingData as Booking).customer_id,
          amount,
          upi_uri: upiUri,
          verification_token: token,
          status: 'pending',
        })
        .select()
        .single();

      if (!payError && newPayment) {
        setPayment(newPayment as Payment);
      }
    }

    setLoading(false);
  }, [id]);

  useEffect(() => { fetchBookingData(); }, [fetchBookingData]);

  useEffect(() => {
    if (!payment || payment.status === 'paid') return;
    const poll = async () => {
      const { data } = await supabase.from('payments').select('*').eq('id', payment.id).maybeSingle();
      if (data) {
        const updated = data as Payment;
        setPayment(updated);
        if (updated.status === 'paid') {
          setShowSuccess(true);
          if (pollingRef.current) clearInterval(pollingRef.current);
          setTimeout(() => navigate(`/customer/dashboard`), 4000);
        }
      }
    };
    pollingRef.current = setInterval(poll, 2500);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [payment, navigate]);

  const handleConfirmPayment = async () => {
    if (!utrNumber || utrNumber.length < 8) { setError('Please enter a valid UTR / Reference number'); return; }
    if (!payment) return;
    setSubmitting(true); setError('');
    try {
      const { data, error: updateError } = await supabase
        .from('payments')
        .update({ utr_number: utrNumber, status: 'payment_submitted' })
        .eq('id', payment.id).select().single();
      if (updateError) throw updateError;
      setPayment(data as Payment);
      await supabase.from('bookings').update({ status: 'payment_submitted' }).eq('id', booking?.id);
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to confirm payment'); }
    finally { setSubmitting(false); }
  };

  const handleCopyUpiId = () => {
    if (worker?.upi_id) { navigator.clipboard.writeText(worker.upi_id); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  const handleUpiApp = (scheme: string) => {
    if (payment?.upi_uri) {
      window.location.href = `intent://${payment.upi_uri.replace('upi://', '')}#Intent;scheme=${scheme};package=com.google.android.apps.nbu.paisa.user;S.browser_fallback_url=https://play.google.com/store/apps/details?id=com.google.android.apps.nbu.paisa.user;end;`;
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center pt-16"><Loader2 size={28} className="animate-spin text-brass" /></div>;
  if (!booking || !payment || !worker) return (
    <div className="flex min-h-screen flex-col items-center justify-center pt-16 gap-4">
      <p className="text-muted">Booking or payment not found.</p>
      <Link to="/customer/dashboard"><NeonButton variant="ghost">Go to Dashboard</NeonButton></Link>
    </div>
  );

  const isPaid = payment.status === 'paid';
  const isSubmitted = payment.status === 'payment_submitted';

  return (
    <div className="relative min-h-screen overflow-hidden pt-20 pb-12 atmosphere">
      <FloatingShape className="top-20 -left-20 h-[350px] w-[350px] animate-drift-slow" color="neon-cyan" />
      <FloatingShape className="bottom-0 -right-20 h-[300px] w-[300px] animate-drift" color="neon-purple" delay={2} />

      {showSuccess && <SuccessModal amount={payment.amount} />}

      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 relative z-10">
        <Link to="/customer/dashboard" className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted hover:text-brass transition-colors duration-300">
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>

        <div className="mb-7 text-center animate-fade-in">
          <h1 className="text-2xl font-bold gradient-text">Payment Gateway</h1>
          <p className="mt-1.5 text-muted">Complete your payment securely via UPI</p>
        </div>

        <GlassCard className="mb-5 p-5 text-center">
          <p className="text-xs text-muted mb-1">Amount to Pay</p>
          <p className="text-4xl font-bold gradient-text">₹{payment.amount.toFixed(2)}</p>
          <div className="mt-2.5 flex items-center justify-center gap-2">
            <Badge variant={isPaid ? 'emerald' : isSubmitted ? 'amber' : 'gray'}>
              {isPaid ? <><Check size={11} /> Paid</> : isSubmitted ? <><Clock size={11} /> Awaiting Confirmation</> : <><Clock size={11} /> Pending</>}
            </Badge>
          </div>
        </GlassCard>

        {!isPaid && (
          <GlassCard className="mb-5 p-7">
            <h2 className="mb-3.5 text-center text-base font-semibold text-white">Scan to Pay</h2>
            <div className="flex justify-center mb-3.5">
              <div className="rounded-xl bg-white p-3.5 inline-block shadow-depth">
                {payment.upi_uri && <QRCodeCanvas value={payment.upi_uri} size={180} level="H" includeMargin={false} />}
              </div>
            </div>
            <p className="text-center text-xs text-muted mb-2">Scan with any UPI app to pay</p>
            <div className="flex items-center justify-center gap-1.5 mt-3.5">
              <div className="rounded-lg border border-white/[0.06] bg-base-800 px-3 py-1.5 text-xs">
                <span className="text-muted">UPI ID: </span>
                <span className="font-mono text-brass text-shadow-neon">{worker.upi_id}</span>
              </div>
              <button onClick={handleCopyUpiId} className="rounded-lg border border-white/[0.06] p-1.5 text-muted hover:text-brass hover:border-brass/20 transition-all duration-300">
                {copied ? <Check size={14} className="text-brass" /> : <Copy size={14} />}
              </button>
            </div>
            <div className="mt-5">
              <p className="mb-2.5 text-center text-xs text-muted-dark">Or pay directly via:</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {UPI_APPS.map((app) => (
                  <button key={app.name} onClick={() => handleUpiApp(app.scheme)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border ${app.color} ${app.border} p-2.5 transition-all duration-300 hover:bg-white/[0.06] hover:shadow-lg`}>
                    <Smartphone size={20} className={app.text} />
                    <span className={`text-[11px] font-medium ${app.text}`}>{app.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>
        )}

        {!isPaid && (
          <GlassCard className="mb-5 p-5">
            <h2 className="mb-1.5 flex items-center gap-2 text-base font-semibold text-white">
              <ShieldCheck size={16} className="text-brass" /> Confirm Payment
            </h2>
            <p className="mb-3.5 text-xs text-muted">
              After paying in your UPI app, enter the 12-digit UPI Reference / UTR number from your payment confirmation and click below.
            </p>

            {isSubmitted ? (
              <div className="space-y-3.5">
                <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/15 bg-amber-500/5 px-3.5 py-2.5">
                  <Clock size={18} className="text-amber-400 animate-pulse" />
                  <div>
                    <p className="text-xs font-medium text-amber-400">Payment Submitted - Awaiting Confirmation</p>
                    <p className="text-[11px] text-muted mt-0.5">UTR: {payment.utr_number}</p>
                    <p className="text-[11px] text-muted-dark mt-0.5">The worker will confirm receipt shortly. This page will update automatically.</p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-xs text-muted">
                  <RefreshCw size={12} className="animate-spin" /> Polling for confirmation...
                </div>
              </div>
            ) : (
              <>
                <div className="mb-3.5">
                  <label className="mb-1 block text-sm font-medium text-muted-light">UPI Reference / UTR Number</label>
                  <input value={utrNumber} onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    placeholder="Enter 12-digit UTR" className="utr-input" maxLength={12} />
                </div>
                {error && (
                  <div className="mb-3.5 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/8 px-3.5 py-2.5 text-sm text-red-400">
                    <AlertCircle size={14} /> {error}
                  </div>
                )}
                <NeonButton fullWidth size="lg" onClick={handleConfirmPayment} disabled={submitting}>
                  {submitting ? <><Loader2 size={16} className="animate-spin" /> Confirming...</> : <>Confirm Payment <ArrowRight size={16} /></>}
                </NeonButton>
              </>
            )}
          </GlassCard>
        )}

        {isPaid && (
          <GlassCard className="p-7 text-center">
            <div className="mx-auto mb-3.5 flex h-16 w-16 items-center justify-center rounded-full bg-brass/15 shadow-brass">
              <Check size={32} className="text-brass" />
            </div>
            <h2 className="text-xl font-bold text-white">Payment Complete</h2>
            <p className="mt-1.5 text-sm text-muted">Your booking has been confirmed and paid.</p>
            <Link to="/customer/dashboard" className="mt-5 inline-block">
              <NeonButton variant="emerald">Go to My Bookings <ArrowRight size={16} /></NeonButton>
            </Link>
          </GlassCard>
        )}

        <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-muted-dark">
          <ShieldCheck size={12} className="text-brass/60" />
          CoLabour never asks for your UPI PIN, password, or card details.
        </div>
      </div>

      <style>{`
        .utr-input {
          width: 100%; border-radius: 0.75rem; border: 1px solid rgba(255,255,255,0.04);
          background: rgba(5,5,8,0.8); padding: 0.625rem 0.875rem; text-align: center;
          font-family: 'JetBrains Mono', monospace; font-size: 1rem; letter-spacing: 0.1em;
          color: #c4c4d4; outline: none; transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .utr-input:focus {
          border-color: rgba(0,240,255,0.3);
          box-shadow: 0 0 0 3px rgba(0,240,255,0.06), 0 0 20px rgba(0,240,255,0.05);
        }
        .utr-input::placeholder { color: #5a5a70; letter-spacing: 0; font-size: 0.875rem; }
      `}</style>
    </div>
  );
}

function SuccessModal({ amount }: { amount: number }) {
  const [pieces, setPieces] = useState<{ left: number; delay: number; color: string; duration: number }[]>([]);

  useEffect(() => {
    const colors = ['#c5a059', '#7c9a6b', '#7589b0', '#c27a6e', '#d4a574'];
    setPieces(Array.from({ length: 40 }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      color: colors[i % colors.length],
      duration: 1 + Math.random() * 1.5,
    })));
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-base/90 backdrop-blur-md animate-fade-in">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {pieces.map((p, i) => (
          <div key={i} className="absolute top-0 h-2 w-2 rounded-sm"
            style={{ left: `${p.left}%`, backgroundColor: p.color, animation: `confetti ${p.duration}s ease-out ${p.delay}s forwards` }} />
        ))}
      </div>
      <div className="relative z-10 text-center animate-scale-in">
        <div className="relative mx-auto mb-6 perspective-1000">
          <div className="relative h-24 w-24">
            <div className="absolute inset-0 rounded-full bg-brass/10 animate-ping" />
            <div className="absolute inset-0 rounded-full bg-brass/20 animate-pulse-glow" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-brass to-sage shadow-brass">
              <svg viewBox="0 0 52 52" className="h-12 w-12 text-white" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 27 L22 35 L38 18" className="animate-[fadeIn_0.5s_ease-out_0.2s_both]" />
              </svg>
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-bold gradient-text mb-1.5">Payment Successful!</h2>
        <p className="text-base text-muted-light mb-1.5">₹{amount.toFixed(2)} has been paid</p>
        <p className="text-xs text-muted-dark mb-5 flex items-center justify-center gap-1.5">
          <PartyPopper size={14} className="text-sage" /> Redirecting to your bookings...
        </p>
        <div className="flex items-center justify-center gap-1.5 text-xs text-brass text-shadow-neon">
          <Zap size={14} className="animate-pulse" /> Booking Confirmed
        </div>
      </div>
    </div>
  );
}
