import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import {
  ArrowLeft, Loader2, AlertCircle, Copy, Check, Smartphone, ShieldCheck, Clock,
  ArrowRight, RefreshCw, Lock, Hourglass, CheckCircle2
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { GlowOrb } from '@/components/ui/Shared';
import { type Booking, type Payment, type WorkerWithUser } from '@/lib/supabase';
import { fetchBookingById, fetchWorkerProfile, fetchPaymentByBookingId, submitPaymentRecord } from '@/lib/dataService';
import { CoLabourPrinterEngine } from '@/components/CoLabourPrinterEngine';

const UPI_APPS = [
  { name: 'GPay', scheme: 'tez', color: 'bg-nb-accent-blue/20', text: 'text-nb-ink', border: 'border-nb-ink' },
  { name: 'PhonePe', scheme: 'phonepe', color: 'bg-nb-accent-pink/20', text: 'text-nb-ink', border: 'border-nb-ink' },
  { name: 'Paytm', scheme: 'paytmmp', color: 'bg-nb-accent-blue/10', text: 'text-nb-ink', border: 'border-nb-ink' },
  { name: 'BHIM', scheme: 'bhim', color: 'bg-nb-accent-yellow/20', text: 'text-nb-ink', border: 'border-nb-ink' },
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
  const [testReceiptMode, setTestReceiptMode] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchBookingData = useCallback(async () => {
    if (!id) return;
    try {
      const bookingData = await fetchBookingById(id);
      if (!bookingData) { 
        setLoading(false); 
        return; 
      }
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
    } catch (err) {
      console.error('Error fetching context:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBookingData();
  }, [fetchBookingData]);

  // Status Polling Engine
  useEffect(() => {
    if (!id || testReceiptMode) return;

    const poll = async () => {
      try {
        const updatedBooking = await fetchBookingById(id);
        if (updatedBooking) {
          setBooking(updatedBooking);
        }

        const updated = await fetchPaymentByBookingId(id);
        if (updated) {
          setPayment(updated);
          if (updated.status === 'paid' || updated.status === 'completed') {
            if (pollingRef.current) clearInterval(pollingRef.current);
          }
        }
      } catch {
        // fail silently
      }
    };

    pollingRef.current = setInterval(poll, 1500);
    return () => { 
      if (pollingRef.current) clearInterval(pollingRef.current); 
    };
  }, [id, testReceiptMode]);

  const handleConfirmPayment = async () => {
    if (!utrNumber || utrNumber.length < 8) {
      setError('Please enter a valid 12-digit UTR / Reference number');
      return;
    }
    if (!payment || !booking || !worker || submitting) return;

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
    if (payment?.upi_uri) {
      window.location.href = `intent://${payment.upi_uri.replace('upi://', '')}#Intent;scheme=${scheme};package=com.google.android.apps.nbu.paisa.user;S.browser_fallback_url=https://play.google.com/store/apps/details?id=com.google.android.apps.nbu.paisa.user;end;`;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-16">
        <Loader2 size={32} className="animate-spin text-nb-ink" />
      </div>
    );
  }

  if (!booking || !payment || !worker) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center pt-16 gap-4">
        <p className="text-nb-text-muted font-medium">Booking or payment record not found.</p>
        <Link to="/customer/dashboard"><NeonButton variant="ghost">Go to Dashboard</NeonButton></Link>
      </div>
    );
  }

  const isPaid = testReceiptMode || payment.status === 'paid' || payment.status === 'completed' || booking.status === 'paid' || booking.status === 'completed';
  const isSubmitted = payment.status === 'payment_submitted' || booking.status === 'payment_submitted';
  const isWorkerAccepted = booking.status !== 'pending';

  // 1. Agar payment complete ho chuka hai, toh DIRECT Slip Machine Engine dikhao
  if (isPaid) {
    return (
      <div className="relative min-h-screen overflow-hidden pt-20 pb-12 px-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link to="/customer/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-nb-text-muted hover:text-nb-accent-orange transition-colors">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <button
            type="button"
            onClick={() => setTestReceiptMode(false)}
            className="text-xs px-3 py-1.5 rounded-nb-sm border-[2px] border-nb-ink bg-nb-accent-pink/20 text-nb-ink font-bold hover:bg-nb-accent-pink/30 transition-all"
          >
            ✕ Close Slip View
          </button>
        </div>

        <div className="text-center mb-6">
          <Badge variant="emerald" className="px-4 py-1.5 text-xs font-bold">
            SETTLEMENT COMPLETED
          </Badge>
        </div>

        {/* The 3D Sound & POS Slip Machine Component */}
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
    );
  }

  // 2. Agar payment complete nahi hua hai, tabhi scan/pay gateway dikhao
  return (
    <div className="relative min-h-screen overflow-hidden pt-20 pb-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <Link to="/customer/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-nb-text-muted hover:text-nb-accent-orange transition-colors">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <button
            type="button"
            onClick={() => setTestReceiptMode(!testReceiptMode)}
            className="text-xs px-3 py-1.5 rounded-nb-sm border-[2px] border-nb-ink bg-nb-accent-pink/20 text-nb-ink font-bold hover:bg-nb-accent-pink/30 transition-all"
          >
            ⚡ Quick Test Slip
          </button>
        </div>

        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-3xl font-extrabold text-nb-ink">Payment Gateway</h1>
          <p className="mt-2 text-nb-text-muted">Direct Worker Settlement powered by UPI</p>
        </div>

        {/* Amount & Status Banner */}
        <GlassCard className="mb-6 p-6 text-center border-[4px] shadow-nb-xl">
          <p className="text-xs font-bold uppercase tracking-wider text-nb-text-muted mb-1">Total Payable Amount</p>
          <p className="text-5xl font-extrabold text-nb-accent-orange">₹{payment.amount.toFixed(2)}</p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <Badge variant={isSubmitted ? 'amber' : isWorkerAccepted ? 'cyan' : 'amber'}>
              {isSubmitted ? (
                <><Clock size={12} /> Worker Verifying UTR</>
              ) : isWorkerAccepted ? (
                <><CheckCircle2 size={12} /> Worker Accepted & Ready</>
              ) : (
                <><Hourglass size={12} className="animate-spin" /> Awaiting Worker Acceptance</>
              )}
            </Badge>
          </div>
        </GlassCard>

        {/* STATE: LOCKED - Waiting for Worker Acceptance */}
        {!isWorkerAccepted && (
          <GlassCard className="mb-6 p-8 text-center border-[4px] border-nb-accent-yellow shadow-nb-xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-nb-lg bg-nb-accent-yellow/20 border-[2px] border-nb-ink text-nb-ink shadow-nb-sm">
              <Lock size={32} />
            </div>
            <h2 className="text-xl font-extrabold text-nb-ink mb-2">QR Code Locked</h2>
            <p className="text-sm font-medium text-nb-text-muted max-w-md mx-auto mb-4">
              Waiting for <span className="text-nb-ink font-bold">{worker.users?.name ?? 'the professional'}</span> to accept this job request.
            </p>
            <p className="text-xs text-nb-text-muted max-w-sm mx-auto mb-6">
              The UPI QR code and payment details will automatically unlock instantly once the worker clicks Accept on their dashboard.
            </p>
            <div className="inline-flex items-center gap-2 rounded-nb-sm border-[2px] border-nb-ink bg-nb-accent-yellow/20 px-4 py-1.5 text-xs font-bold text-nb-ink">
              <RefreshCw size={14} className="animate-spin" /> Live polling worker dispatch status...
            </div>
          </GlassCard>
        )}

        {/* STATE: UNLOCKED - Worker Accepted, Reveal QR Code and Payment Form */}
        {isWorkerAccepted && (
          <>
            <GlassCard className="mb-6 p-8 animate-slide-up">
              <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-nb-ink/10">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-nb-accent-green animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-wider text-nb-ink">
                    Job Confirmed by {worker.users?.name ?? 'Worker'}
                  </span>
                </div>
                <Badge variant="emerald">Live UPI Channel</Badge>
              </div>

              <h2 className="mb-4 text-center text-lg font-bold text-nb-ink">Scan to Pay via UPI</h2>
              <div className="flex justify-center mb-4">
                <div className="rounded-nb-lg border-[3px] border-nb-ink bg-white p-4 inline-block shadow-nb-lg">
                  {payment.upi_uri && <QRCodeCanvas value={payment.upi_uri} size={210} level="H" includeMargin={false} />}
                </div>
              </div>
              <p className="text-center text-sm font-medium text-nb-text-muted mb-2">Scan with GPay, PhonePe, Paytm, or BHIM</p>

              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="rounded-nb-md border-[2px] border-nb-ink bg-nb-surface px-4 py-2.5 text-sm flex items-center gap-2 shadow-nb-sm">
                  <span className="text-nb-text-muted text-xs font-mono font-bold">WORKER UPI: </span>
                  <span className="font-mono font-bold text-nb-accent-orange">{worker.upi_id}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyUpiId}
                  className="rounded-nb-md border-[2px] border-nb-ink bg-nb-surface p-2.5 text-nb-text-muted hover:text-nb-accent-green shadow-nb-sm hover:shadow-nb-md active:shadow-nb-pressed active:translate-x-[3px] active:translate-y-[3px] transition-all flex items-center gap-1.5 text-xs font-bold"
                >
                  {copied ? <Check size={16} className="text-nb-accent-green" /> : <Copy size={16} />}
                  <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <div className="mt-6">
                <p className="mb-3 text-center text-xs font-bold uppercase tracking-wider text-nb-text-muted">Or Open App Directly:</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {UPI_APPS.map((app) => (
                    <button
                      key={app.name}
                      type="button"
                      onClick={() => handleUpiApp(app.scheme)}
                      className={`flex flex-col items-center gap-2 rounded-nb-md border-[2px] border-nb-ink ${app.color} p-3 transition-all shadow-nb-sm hover:shadow-nb-md active:shadow-nb-pressed active:translate-x-[3px] active:translate-y-[3px]`}
                    >
                      <Smartphone size={22} className={app.text} />
                      <span className={`text-xs font-bold ${app.text}`}>{app.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </GlassCard>

            <GlassCard className="mb-6 p-6 animate-slide-up">
              <h2 className="mb-2 flex items-center gap-2 text-lg font-bold text-nb-ink">
                <ShieldCheck size={20} /> Submit UPI Reference (UTR)
              </h2>
              <p className="mb-4 text-sm font-medium text-nb-text-muted">
                After paying in your UPI app, enter the 12-digit transaction UTR number to submit for worker confirmation.
              </p>

              {isSubmitted ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-nb-md border-[2px] border-nb-accent-yellow bg-nb-accent-yellow/20 px-5 py-4 shadow-nb-sm">
                    <Clock size={24} className="text-nb-accent-yellow animate-pulse flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-nb-ink">Payment Submitted - Awaiting Worker Confirmation</p>
                      <p className="text-xs font-mono text-nb-ink mt-1">Submitted UTR: {payment.utr_number}</p>
                      <p className="text-xs text-nb-text-muted mt-1">
                        An instant alert has been dispatched to {worker.users?.name ?? 'the worker'}. The slip will automatically print once verified.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-xs text-nb-text-muted py-1 font-medium">
                    <RefreshCw size={14} className="animate-spin text-nb-accent-orange" /> Polling worker confirmation status...
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-nb-text-muted">
                      12-Digit Bank UTR / Transaction Reference <span className="text-nb-accent-red">*</span>
                    </label>
                    <input
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                      placeholder="e.g. 483920194821"
                      className="w-full rounded-nb-md border-[2px] border-nb-ink bg-nb-surface px-4 py-3.5 text-center font-mono text-xl tracking-widest text-nb-ink outline-none transition-all shadow-nb-md focus:shadow-nb-lg"
                      maxLength={12}
                    />
                  </div>

                  {error && (
                    <div className="mb-4 flex items-center gap-2 rounded-nb-md border-[2px] border-nb-accent-red bg-nb-accent-red/10 px-4 py-3 text-sm font-medium text-nb-accent-red">
                      <AlertCircle size={16} /> {error}
                    </div>
                  )}

                  <NeonButton fullWidth size="lg" variant="amber" onClick={handleConfirmPayment} disabled={submitting}>
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

        <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-nb-text-muted text-center">
          <ShieldCheck size={14} className="text-nb-accent-green flex-shrink-0" />
          <span>CoLabour Direct-to-Worker UPI Protocol guarantees 0% commission deductions.</span>
        </div>
      </div>
    </div>
  );
}