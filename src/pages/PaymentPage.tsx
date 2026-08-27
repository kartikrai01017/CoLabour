import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import {
  ArrowLeft, Loader2, AlertCircle, Copy, Check, Smartphone, ShieldCheck, Clock,
  ArrowRight, RefreshCw, Lock, Hourglass, CheckCircle2
} from 'lucide-react';
<<<<<<< HEAD
=======
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { GlowOrb } from '@/components/ui/Shared';
>>>>>>> origin/main
import { type Booking, type Payment, type WorkerWithUser } from '@/lib/supabase';
import { fetchBookingById, fetchWorkerProfile, fetchPaymentByBookingId, submitPaymentRecord } from '@/lib/dataService';
import { CoLabourPrinterEngine } from '@/components/CoLabourPrinterEngine';

const UPI_APPS = [
<<<<<<< HEAD
  { name: 'GPay', scheme: 'tez', color: 'bg-blue-100', text: 'text-blue-900', border: 'border-2 border-black' },
  { name: 'PhonePe', scheme: 'phonepe', color: 'bg-purple-100', text: 'text-purple-900', border: 'border-2 border-black' },
  { name: 'Paytm', scheme: 'paytmmp', color: 'bg-cyan-100', text: 'text-cyan-900', border: 'border-2 border-black' },
  { name: 'BHIM', scheme: 'bhim', color: 'bg-orange-100', text: 'text-orange-900', border: 'border-2 border-black' },
=======
  { name: 'GPay', scheme: 'tez', color: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  { name: 'PhonePe', scheme: 'phonepe', color: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  { name: 'Paytm', scheme: 'paytmmp', color: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  { name: 'BHIM', scheme: 'bhim', color: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
>>>>>>> origin/main
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
<<<<<<< HEAD
      <div className="flex min-h-screen items-center justify-center pt-16 bg-[#F6F4EE]">
        <Loader2 size={36} className="animate-spin text-black" />
=======
      <div className="flex min-h-screen items-center justify-center pt-16">
        <Loader2 size={32} className="animate-spin text-emerald-400" />
>>>>>>> origin/main
      </div>
    );
  }

  if (!booking || !payment || !worker) {
    return (
<<<<<<< HEAD
      <div className="flex min-h-screen flex-col items-center justify-center pt-16 gap-4 bg-[#F6F4EE]">
        <p className="text-base font-bold text-gray-700">Booking or payment record not found.</p>
        <Link to="/customer/dashboard">
          <button className="px-5 py-2.5 rounded-xl border-2 border-black bg-amber-300 font-black text-black shadow-[3px_3px_0px_0px_#000]">
            Go to Dashboard
          </button>
        </Link>
=======
      <div className="flex min-h-screen flex-col items-center justify-center pt-16 gap-4">
        <p className="text-gray-400">Booking or payment record not found.</p>
        <Link to="/customer/dashboard"><NeonButton variant="ghost">Go to Dashboard</NeonButton></Link>
>>>>>>> origin/main
      </div>
    );
  }

  const isPaid = testReceiptMode || payment.status === 'paid' || payment.status === 'completed' || booking.status === 'paid' || booking.status === 'completed';
  const isSubmitted = payment.status === 'payment_submitted' || booking.status === 'payment_submitted';
  const isWorkerAccepted = booking.status !== 'pending';

<<<<<<< HEAD
  // 1. If payment is done, show the 3D Printer Engine
  if (isPaid) {
    return (
      <div className="relative min-h-screen bg-[#F6F4EE] text-black pt-20 pb-16 px-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link to="/customer/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-gray-800 hover:text-emerald-800 transition-colors">
=======
  // 1. Agar payment complete ho chuka hai, toh DIRECT Slip Machine Engine dikhao
  if (isPaid) {
    return (
      <div className="relative min-h-screen overflow-hidden pt-20 pb-12 px-4 max-w-2xl mx-auto">
        <GlowOrb className="top-20 -left-20 h-80 w-80 bg-emerald-500/15" />
        <GlowOrb className="bottom-0 right-0 h-80 w-80 bg-cyan-500/10" />

        <div className="flex items-center justify-between mb-6">
          <Link to="/customer/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-emerald-400 transition-colors">
>>>>>>> origin/main
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <button
            type="button"
            onClick={() => setTestReceiptMode(false)}
<<<<<<< HEAD
            className="text-xs px-3.5 py-1.5 rounded-xl border-2 border-black bg-pink-200 text-black font-black shadow-[2px_2px_0px_0px_#000] cursor-pointer"
=======
            className="text-xs px-3 py-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-300 hover:bg-pink-500/20 transition-all font-mono"
>>>>>>> origin/main
          >
            ✕ Close Slip View
          </button>
        </div>

        <div className="text-center mb-6">
<<<<<<< HEAD
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-300 border-2 border-black text-xs font-black text-black shadow-[2px_2px_0px_0px_#000] tracking-wider uppercase">
            ⚡ Direct Settlement Completed
          </span>
=======
          <Badge variant="emerald" className="px-4 py-1.5 text-xs font-mono">
            SETTLEMENT COMPLETED
          </Badge>
>>>>>>> origin/main
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

<<<<<<< HEAD
  // 2. Scan & Pay Gateway
  return (
    <div className="relative min-h-screen bg-[#F6F4EE] text-black pt-20 pb-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <Link to="/customer/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-gray-800 hover:text-emerald-800 transition-colors">
=======
  // 2. Agar payment complete nahi hua hai, tabhi scan/pay gateway dikhao
  return (
    <div className="relative min-h-screen overflow-hidden pt-20 pb-12">
      <GlowOrb className="top-20 -left-20 h-80 w-80 bg-emerald-500/15" />
      <GlowOrb className="bottom-0 right-0 h-80 w-80 bg-cyan-500/10" />

      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <Link to="/customer/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-emerald-400 transition-colors">
>>>>>>> origin/main
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <button
            type="button"
            onClick={() => setTestReceiptMode(!testReceiptMode)}
<<<<<<< HEAD
            className="text-xs px-3.5 py-1.5 rounded-xl border-2 border-black bg-pink-300 text-black font-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer"
          >
            ⚡ Quick Test Slip / POS
          </button>
        </div>

        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-200 border-2 border-black font-black text-xs uppercase tracking-wider mb-2 shadow-[2px_2px_0px_0px_#000]">
            ⚡ Direct-to-Worker UPI Gateway
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-black">Payment Gateway</h1>
          <p className="mt-1 text-sm font-semibold text-gray-700">0% Commission • 100% Direct Settlement</p>
        </div>

        {/* Amount & Status Banner */}
        <div className="rounded-2xl border-2 border-black bg-white mb-6 p-6 text-center shadow-[5px_5px_0px_0px_#000]">
          <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Total Payable Amount</p>
          <p className="text-5xl font-black text-black">₹{payment.amount.toFixed(2)}</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border-2 border-black text-xs font-black text-black shadow-[2px_2px_0px_0px_#000] ${
              isSubmitted ? 'bg-amber-200' : isWorkerAccepted ? 'bg-emerald-200' : 'bg-amber-100'
            }`}>
              {isSubmitted ? (
                <><Clock size={14} /> Worker Verifying UTR</>
              ) : isWorkerAccepted ? (
                <><CheckCircle2 size={14} /> Worker Accepted & Ready</>
              ) : (
                <><Hourglass size={14} className="animate-spin" /> Awaiting Worker Acceptance</>
              )}
            </span>
          </div>
        </div>

        {/* STATE: LOCKED - Waiting for Worker Acceptance */}
        {!isWorkerAccepted && (
          <div className="rounded-2xl border-2 border-black bg-amber-100 mb-6 p-8 text-center shadow-[5px_5px_0px_0px_#000]">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-300 border-2 border-black text-black shadow-[3px_3px_0px_0px_#000]">
              <Lock size={32} />
            </div>
            <h2 className="text-xl font-black text-black mb-2">QR Code Locked</h2>
            <p className="text-sm font-bold text-gray-900 max-w-md mx-auto mb-4">
              Waiting for <span className="underline decoration-2">{worker.users?.name ?? 'the professional'}</span> to accept this job request.
            </p>
            <p className="text-xs font-semibold text-gray-700 max-w-sm mx-auto mb-6">
              The UPI QR code and payment details will automatically unlock instantly once the worker clicks Accept on their dashboard.
            </p>
            <div className="inline-flex items-center gap-2 rounded-xl border-2 border-black bg-white px-4 py-2 text-xs font-black text-black shadow-[2px_2px_0px_0px_#000]">
              <RefreshCw size={14} className="animate-spin text-black" /> Live polling worker dispatch status...
            </div>
          </div>
=======
            className="text-xs px-3 py-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-300 hover:bg-pink-500/20 transition-all font-mono"
          >
            ⚡ Quick Test Slip / Toing
          </button>
        </div>

        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-3xl font-bold text-white">Payment Gateway</h1>
          <p className="mt-2 text-gray-400">Direct Worker Settlement powered by UPI</p>
        </div>

        {/* Amount & Status Banner */}
        <GlassCard className="mb-6 p-6 text-center">
          <p className="text-sm text-gray-400 mb-1">Total Payable Amount</p>
          <p className="text-5xl font-bold text-emerald-400 font-mono">₹{payment.amount.toFixed(2)}</p>
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
          <GlassCard className="mb-6 p-8 text-center border-amber-500/30 bg-amber-500/5">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Lock size={32} />
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
>>>>>>> origin/main
        )}

        {/* STATE: UNLOCKED - Worker Accepted, Reveal QR Code and Payment Form */}
        {isWorkerAccepted && (
          <>
<<<<<<< HEAD
            <div className="rounded-2xl border-2 border-black bg-white mb-6 p-6 sm:p-8 shadow-[6px_6px_0px_0px_#000]">
              <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-black/10">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
                    Job Confirmed by {worker.users?.name ?? 'Worker'}
                  </span>
                </div>
                <span className="rounded-lg bg-emerald-200 border-2 border-black px-2.5 py-0.5 text-xs font-black text-black shadow-[1px_1px_0px_0px_#000]">
                  Live UPI
                </span>
              </div>

              <h2 className="mb-4 text-center text-lg font-black text-black uppercase tracking-wider">Scan to Pay via UPI</h2>
              <div className="flex justify-center mb-4">
                <div className="rounded-2xl bg-white p-4 inline-block border-2 border-black shadow-[4px_4px_0px_0px_#000]">
                  {payment.upi_uri && <QRCodeCanvas value={payment.upi_uri} size={210} level="H" includeMargin={false} />}
                </div>
              </div>
              <p className="text-center text-xs font-bold text-gray-700 mb-2">Scan with GPay, PhonePe, Paytm, or BHIM</p>

              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="rounded-xl border-2 border-black bg-gray-100 px-4 py-2.5 text-sm flex items-center gap-2 shadow-[2px_2px_0px_0px_#000]">
                  <span className="text-gray-600 text-xs font-black">WORKER UPI: </span>
                  <span className="font-mono font-black text-black">{worker.upi_id}</span>
=======
            <GlassCard className="mb-6 p-8 animate-slide-up">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Job Confirmed by {worker.users?.name ?? 'Worker'}
                  </span>
                </div>
                <Badge variant="emerald">Live UPI Channel</Badge>
              </div>

              <h2 className="mb-4 text-center text-lg font-semibold text-gray-200">Scan to Pay via UPI</h2>
              <div className="flex justify-center mb-4">
                <div className="rounded-2xl bg-white p-4 inline-block shadow-2xl">
                  {payment.upi_uri && <QRCodeCanvas value={payment.upi_uri} size={210} level="H" includeMargin={false} />}
                </div>
              </div>
              <p className="text-center text-sm text-gray-400 mb-2">Scan with GPay, PhonePe, Paytm, or BHIM</p>

              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm flex items-center gap-2">
                  <span className="text-gray-400 text-xs font-mono">WORKER UPI: </span>
                  <span className="font-mono font-bold text-cyan-400">{worker.upi_id}</span>
>>>>>>> origin/main
                </div>
                <button
                  type="button"
                  onClick={handleCopyUpiId}
<<<<<<< HEAD
                  className="rounded-xl border-2 border-black bg-amber-300 p-2.5 text-black font-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center gap-1.5 text-xs cursor-pointer"
                >
                  {copied ? <Check size={16} strokeWidth={3} /> : <Copy size={16} />}
=======
                  className="rounded-xl border border-white/10 bg-slate-900/80 p-2.5 text-gray-400 hover:text-emerald-400 hover:border-emerald-500/40 transition-all flex items-center gap-1.5 text-xs"
                >
                  {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
>>>>>>> origin/main
                  <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <div className="mt-6">
<<<<<<< HEAD
                <p className="mb-3 text-center text-xs font-black text-gray-800 uppercase tracking-wider">Or Launch Installed App Directly:</p>
=======
                <p className="mb-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Or Launch Installed App Directly:</p>
>>>>>>> origin/main
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {UPI_APPS.map((app) => (
                    <button
                      key={app.name}
                      type="button"
                      onClick={() => handleUpiApp(app.scheme)}
<<<<<<< HEAD
                      className={`flex flex-col items-center gap-2 rounded-xl ${app.border} ${app.color} p-3 transition-all hover:translate-x-[1px] hover:translate-y-[1px] shadow-[3px_3px_0px_0px_#000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none cursor-pointer`}
                    >
                      <Smartphone size={22} className={app.text} />
                      <span className={`text-xs font-black ${app.text}`}>{app.name}</span>
=======
                      className={`flex flex-col items-center gap-2 rounded-xl border ${app.color} ${app.border} p-3 transition-all hover:scale-105`}
                    >
                      <Smartphone size={22} className={app.text} />
                      <span className={`text-xs font-semibold ${app.text}`}>{app.name}</span>
>>>>>>> origin/main
                    </button>
                  ))}
                </div>
              </div>
<<<<<<< HEAD
            </div>

            <div className="rounded-2xl border-2 border-black bg-white mb-6 p-6 shadow-[5px_5px_0px_0px_#000]">
              <h2 className="mb-2 flex items-center gap-2 text-base font-black text-black uppercase tracking-wider">
                <ShieldCheck size={20} className="text-emerald-800" /> Submit UPI Reference (UTR)
              </h2>
              <p className="mb-4 text-xs font-semibold text-gray-700">
=======
            </GlassCard>

            <GlassCard className="mb-6 p-6 animate-slide-up">
              <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-gray-200">
                <ShieldCheck size={20} className="text-emerald-400" /> Submit UPI Reference (UTR)
              </h2>
              <p className="mb-4 text-sm text-gray-400">
>>>>>>> origin/main
                After paying in your UPI app, enter the 12-digit transaction UTR number to submit for worker confirmation.
              </p>

              {isSubmitted ? (
                <div className="space-y-4">
<<<<<<< HEAD
                  <div className="flex items-center gap-3 rounded-xl border-2 border-black bg-amber-100 px-5 py-4 shadow-[3px_3px_0px_0px_#000]">
                    <Clock size={24} className="text-amber-800 animate-pulse shrink-0" />
                    <div>
                      <p className="text-sm font-black text-black">Payment Submitted - Awaiting Worker Confirmation</p>
                      <p className="text-xs font-mono font-bold text-gray-800 mt-1">Submitted UTR: {payment.utr_number}</p>
                      <p className="text-xs font-semibold text-gray-700 mt-1">
=======
                  <div className="flex items-center gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-5 py-4">
                    <Clock size={24} className="text-amber-400 animate-pulse flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-amber-400">Payment Submitted - Awaiting Worker Confirmation</p>
                      <p className="text-xs font-mono text-gray-300 mt-1">Submitted UTR: {payment.utr_number}</p>
                      <p className="text-xs text-gray-400 mt-1">
>>>>>>> origin/main
                        An instant alert has been dispatched to {worker.users?.name ?? 'the worker'}. The slip will automatically print once verified.
                      </p>
                    </div>
                  </div>
<<<<<<< HEAD
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-700 py-1">
                    <RefreshCw size={14} className="animate-spin text-black" /> Polling worker confirmation status...
=======
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-400 py-1">
                    <RefreshCw size={14} className="animate-spin text-cyan-400" /> Polling worker confirmation status...
>>>>>>> origin/main
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-4">
<<<<<<< HEAD
                    <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-gray-800">
                      12-Digit Bank UTR / Transaction Reference <span className="text-emerald-700">*</span>
=======
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-300">
                      12-Digit Bank UTR / Transaction Reference <span className="text-emerald-400">*</span>
>>>>>>> origin/main
                    </label>
                    <input
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                      placeholder="e.g. 483920194821"
<<<<<<< HEAD
                      className="w-full rounded-xl border-2 border-black bg-white px-4 py-3 text-center font-mono font-black text-xl tracking-widest text-black shadow-[3px_3px_0px_0px_#000] focus:shadow-[5px_5px_0px_0px_#000] outline-none"
=======
                      className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3.5 text-center font-mono text-xl tracking-widest text-cyan-400 outline-none transition-all focus:border-emerald-400"
>>>>>>> origin/main
                      maxLength={12}
                    />
                  </div>

                  {error && (
<<<<<<< HEAD
                    <div className="mb-4 flex items-center gap-2 rounded-xl border-2 border-black bg-red-100 px-4 py-3 text-xs font-bold text-red-900 shadow-[2px_2px_0px_0px_#000]">
                      <AlertCircle size={16} className="text-red-700 shrink-0" /> {error}
                    </div>
                  )}

                  <button
                    onClick={handleConfirmPayment}
                    disabled={submitting}
                    className="w-full py-3.5 px-6 rounded-xl border-2 border-black bg-emerald-400 text-black font-black text-sm shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider disabled:opacity-50"
                  >
                    {submitting ? (
                      <><Loader2 size={18} className="animate-spin text-black" /> Submitting to Worker...</>
                    ) : (
                      <>Submit for Worker Confirmation <ArrowRight size={18} /></>
                    )}
                  </button>
                </>
              )}
            </div>
          </>
        )}

        <div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-gray-700 text-center">
          <ShieldCheck size={16} className="text-emerald-800 shrink-0" />
=======
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

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500 text-center">
          <ShieldCheck size={14} className="text-emerald-400 flex-shrink-0" />
>>>>>>> origin/main
          <span>CoLabour Direct-to-Worker UPI Protocol guarantees 0% commission deductions.</span>
        </div>
      </div>
    </div>
  );
}
