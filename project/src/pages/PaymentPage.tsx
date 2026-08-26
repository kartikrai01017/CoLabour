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
import { GlowOrb } from '@/components/ui/Shared';
import { PaymentModal } from '@/components/ui/PaymentModal';
import { supabase, type Booking, type Payment, type WorkerWithUser } from '@/lib/supabase';

const UPI_APPS = [
  { name: 'GPay', scheme: 'tez', color: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  { name: 'PhonePe', scheme: 'phonepe', color: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  { name: 'Paytm', scheme: 'paytmmp', color: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  { name: 'BHIM', scheme: 'bhim', color: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
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
  
  // Popup Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [modalMessage, setModalMessage] = useState('');

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

    // Check for existing payment
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

  useEffect(() => {
    fetchBookingData();
  }, [fetchBookingData]);

  // Polling engine for payment status
  useEffect(() => {
    if (!payment || payment.status === 'paid') return;

    const poll = async () => {
      const { data } = await supabase
        .from('payments')
        .select('*')
        .eq('id', payment.id)
        .maybeSingle();

      if (data) {
        const updated = data as Payment;
        setPayment(updated);
        if (updated.status === 'paid') {
          setShowSuccess(true);
          if (pollingRef.current) clearInterval(pollingRef.current);
          setTimeout(() => navigate(`/customer-dashboard`), 4000);
        }
      }
    };

    pollingRef.current = setInterval(poll, 2500);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [payment, navigate]);

  const handleConfirmPayment = async () => {
    if (!utrNumber || utrNumber.length < 8) {
      setError('Please enter a valid 12-digit UTR / Reference number');
      return;
    }
    if (!payment) return;

    setSubmitting(true);
    setError('');
    setModalStatus('loading');
    setModalOpen(true);

    try {
      const { data, error: updateError } = await supabase
        .from('payments')
        .update({ utr_number: utrNumber, status: 'payment_submitted' })
        .eq('id', payment.id)
        .select()
        .single();

      if (updateError) throw updateError;
      setPayment(data as Payment);

      await supabase.from('bookings').update({ status: 'payment_submitted' }).eq('id', booking?.id);

      setModalStatus('success');
      setModalMessage('Payment confirmation request worker ko bhej di gayi hai.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to confirm payment';
      setError(msg);
      setModalStatus('failed');
      setModalMessage(msg);
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
    if (payment?.upi_uri) {
      window.location.href = `intent://${payment.upi_uri.replace('upi://', '')}#Intent;scheme=${scheme};package=com.google.android.apps.nbu.paisa.user;S.browser_fallback_url=https://play.google.com/store/apps/details?id=com.google.android.apps.nbu.paisa.user;end;`;
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
        <p className="text-gray-400">Booking or payment not found.</p>
        <Link to="/customer-dashboard"><NeonButton variant="ghost">Go to Dashboard</NeonButton></Link>
      </div>
    );
  }

  const isPaid = payment.status === 'paid';
  const isSubmitted = payment.status === 'payment_submitted';

  return (
    <div className="relative min-h-screen overflow-hidden pt-20 pb-12">
      <GlowOrb className="top-20 -left-20 h-80 w-80 bg-neon-emerald/15" />
      <GlowOrb className="bottom-0 right-0 h-80 w-80 bg-neon-cyan/10" />

      <PaymentModal
        isOpen={modalOpen}
        status={modalStatus}
        amount={payment.amount}
        utrNumber={utrNumber}
        message={modalMessage}
        onClose={() => setModalOpen(false)}
        onAction={() => {
          setModalOpen(false);
          navigate('/customer-dashboard');
        }}
      />

      {showSuccess && <SuccessModal amount={payment.amount} />}

      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <Link to="/customer-dashboard" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-neon-emeraldGlow transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-3xl font-bold gradient-text-emerald-cyan">Payment Gateway</h1>
          <p className="mt-2 text-gray-400">Complete your payment securely via UPI</p>
        </div>

        {/* Amount card */}
        <GlassCard className="mb-6 p-6 text-center">
          <p className="text-sm text-gray-400 mb-1">Amount to Pay</p>
          <p className="text-5xl font-bold gradient-text-emerald-cyan">₹{payment.amount.toFixed(2)}</p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <Badge variant={isPaid ? 'emerald' : isSubmitted ? 'amber' : 'cyan'}>
              {isPaid ? <><Check size={12} /> Paid</> : isSubmitted ? <><Clock size={12} /> Awaiting Confirmation</> : <><Clock size={12} /> Pending</>}
            </Badge>
          </div>
        </GlassCard>

        {/* QR Code Section */}
        {!isPaid && (
          <GlassCard className="mb-6 p-8">
            <h2 className="mb-4 text-center text-lg font-semibold text-gray-200">Scan to Pay</h2>
            <div className="flex justify-center mb-4">
              <div className="rounded-2xl bg-white p-4 inline-block shadow-lg">
                {payment.upi_uri && <QRCodeCanvas value={payment.upi_uri} size={200} level="H" includeMargin={false} />}
              </div>
            </div>
            <p className="text-center text-sm text-gray-400 mb-2">Scan with any UPI app to pay</p>

            {/* UPI ID display */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="rounded-xl border border-white/10 bg-base-800 px-4 py-2 text-sm">
                <span className="text-gray-400">UPI ID: </span>
                <span className="font-mono text-neon-cyanGlow">{worker.upi_id}</span>
              </div>
              <button onClick={handleCopyUpiId} className="rounded-lg border border-white/10 p-2 text-gray-400 hover:text-neon-emerald hover:border-neon-emerald/30 transition-all">
                {copied ? <Check size={16} className="text-neon-emerald" /> : <Copy size={16} />}
              </button>
            </div>

            {/* UPI App deep links */}
            <div className="mt-6">
              <p className="mb-3 text-center text-sm text-gray-400">Or pay directly via:</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {UPI_APPS.map((app) => (
                  <button
                    key={app.name}
                    onClick={() => handleUpiApp(app.scheme)}
                    className={`flex flex-col items-center gap-2 rounded-xl border ${app.color} ${app.border} p-3 transition-all hover:scale-105`}
                  >
                    <Smartphone size={24} className={app.text} />
                    <span className={`text-xs font-medium ${app.text}`}>{app.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>
        )}

        {/* UTR Confirmation */}
        {!isPaid && (
          <GlassCard className="mb-6 p-6">
            <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-gray-200">
              <ShieldCheck size={18} className="text-neon-emerald" /> Confirm Payment
            </h2>
            <p className="mb-4 text-sm text-gray-400">
              After paying in your UPI app, enter the 12-digit UPI Reference / UTR number from your payment confirmation and click below.
            </p>

            {isSubmitted ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
                  <div className="relative">
                    <Clock size={20} className="text-amber-400 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-400">Payment Submitted - Awaiting Confirmation</p>
                    <p className="text-xs text-gray-400 mt-1">UTR: {payment.utr_number}</p>
                    <p className="text-xs text-gray-500 mt-1">The worker will confirm receipt shortly.</p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                  <RefreshCw size={14} className="animate-spin" /> Polling for confirmation...
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="mb-1.5 block text-sm font-medium text-gray-300">UPI Reference / UTR Number</label>
                  <input
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    placeholder="Enter 12-digit UTR"
                    className="w-full rounded-xl border border-white/10 bg-base-800/60 px-4 py-3 text-center font-mono text-lg tracking-wider text-gray-200 outline-none transition-all focus:border-neon-emerald/40"
                    maxLength={12}
                  />
                </div>

                {error && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    <AlertCircle size={16} /> {error}
                  </div>
                )}

                <NeonButton fullWidth size="lg" onClick={handleConfirmPayment} disabled={submitting}>
                  {submitting ? <><Loader2 size={18} className="animate-spin" /> Confirming...</> : <>Confirm Payment <ArrowRight size={18} /></>}
                </NeonButton>
              </>
            )}
          </GlassCard>
        )}

        {isPaid && (
          <GlassCard className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-neon-emerald/20">
              <Check size={40} className="text-neon-emeraldGlow" />
            </div>
            <h2 className="text-2xl font-bold text-white">Payment Complete</h2>
            <p className="mt-2 text-gray-400">Your booking has been confirmed and paid.</p>
            <Link to="/customer-dashboard" className="mt-6 inline-block">
              <NeonButton variant="emerald">Go to My Bookings <ArrowRight size={18} /></NeonButton>
            </Link>
          </GlassCard>
        )}
      </div>
    </div>
  );
}

function SuccessModal({ amount }: { amount: number }) {
  const [pieces, setPieces] = useState<{ left: number; delay: number; color: string; duration: number }[]>([]);

  useEffect(() => {
    const colors = ['#10B981', '#06B6D4', '#8B5CF6', '#F59E0B', '#EF4444', '#22D3EE'];
    const newPieces = Array.from({ length: 60 }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      color: colors[i % colors.length],
      duration: 1 + Math.random() * 1.5,
    }));
    setPieces(newPieces);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-base-900/80 backdrop-blur-md animate-fade-in">
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
        <h2 className="text-4xl font-bold gradient-text-emerald-cyan mb-2">Payment Successful!</h2>
        <p className="text-xl text-gray-300 mb-2">₹{amount.toFixed(2)} has been paid</p>
        <div className="flex items-center justify-center gap-2 text-sm text-neon-emerald">
          <Zap size={16} className="animate-pulse" /> Booking Confirmed
        </div>
      </div>
    </div>
  );
}
