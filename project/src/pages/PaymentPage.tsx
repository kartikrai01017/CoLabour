import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import {
  ArrowLeft, Loader2, AlertCircle, Copy, Check, Smartphone, ShieldCheck, Clock,
  Zap, ArrowRight, CheckCircle2, XCircle, Sparkles, Download, Award, RefreshCw, Printer
} from 'lucide-react';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { GlowOrb } from '@/components/ui/Shared';
import { supabase, type Booking, type Payment, type WorkerWithUser } from '@/lib/supabase';

const UPI_APPS = [
  { name: 'Google Pay', scheme: 'tez', color: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/40', text: 'text-blue-400' },
  { name: 'PhonePe', scheme: 'phonepe', color: 'from-purple-500/20 to-purple-600/5', border: 'border-purple-500/40', text: 'text-purple-400' },
  { name: 'Paytm UPI', scheme: 'paytmmp', color: 'from-cyan-500/20 to-cyan-600/5', border: 'border-cyan-500/40', text: 'text-cyan-400' },
  { name: 'BHIM UPI', scheme: 'bhim', color: 'from-orange-500/20 to-orange-600/5', border: 'border-orange-500/40', text: 'text-orange-400' },
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
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchBookingData = useCallback(async () => {
    if (!id) return;
    try {
      const { data: bookingData } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!bookingData) { setLoading(false); return; }
      setBooking(bookingData as Booking);

      const { data: workerData } = await supabase
        .from('worker_profiles')
        .select('*, users(name, email, phone)')
        .eq('id', bookingData.worker_id)
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
        const amount = Number(bookingData.total_amount) || 0;
        const workerName = encodeURIComponent(wp.users?.name ?? 'Worker');
        const upiUri = `upi://pay?pa=${encodeURIComponent(wp.upi_id || 'colabour@upi')}&pn=${workerName}&am=${amount.toFixed(2)}&cu=INR&tn=CoLabour_${bookingData.id.slice(0, 8)}`;
        const token = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now());

        const { data: newPayment } = await supabase
          .from('payments')
          .insert({
            booking_id: bookingData.id,
            worker_id: wp.id,
            customer_id: bookingData.customer_id,
            amount,
            upi_uri: upiUri,
            verification_token: token,
            status: 'pending',
          })
          .select()
          .single();

        if (newPayment) setPayment(newPayment as Payment);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBookingData();
  }, [fetchBookingData]);

  useEffect(() => {
    if (payment?.status === 'paid' || booking?.status === 'paid') return;

    const poll = async () => {
      if (!id) return;
      const { data: bData } = await supabase.from('bookings').select('*').eq('id', id).maybeSingle();
      if (bData) setBooking(bData as Booking);

      if (payment?.id) {
        const { data: pData } = await supabase.from('payments').select('*').eq('id', payment.id).maybeSingle();
        if (pData) setPayment(pData as Payment);
      }
    };

    pollingRef.current = setInterval(poll, 1500);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [id, payment?.id, payment?.status, booking?.status]);

  const handleConfirmPayment = async () => {
    if (!utrNumber || utrNumber.length < 6) {
      setError('Please enter a valid UPI UTR / Reference number (min 6 digits)');
      return;
    }
    if (!payment || !booking) return;

    setSubmitting(true);
    setError('');

    try {
      const { data, error: updateError } = await supabase
        .from('payments')
        .update({ utr_number: utrNumber, status: 'payment_submitted' })
        .eq('id', payment.id)
        .select()
        .single();

      if (updateError) throw updateError;
      setPayment(data as Payment);

      await supabase
        .from('bookings')
        .update({ status: 'payment_submitted' })
        .eq('id', booking.id);

      await fetchBookingData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to submit payment';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyUpiId = () => {
    const upi = worker?.upi_id || 'colabour@upi';
    navigator.clipboard.writeText(upi);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-16 bg-[#070b14]">
        <Loader2 size={32} className="animate-spin text-neon-emerald" />
      </div>
    );
  }

  if (!booking || !payment || !worker) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center pt-16 gap-4 bg-[#070b14]">
        <p className="text-gray-400">Booking details not found.</p>
        <Link to="/customer/dashboard"><NeonButton variant="ghost">Go to Dashboard</NeonButton></Link>
      </div>
    );
  }

  const isPaid = payment.status === 'paid' || booking.status === 'paid';
  const isSubmitted = payment.status === 'payment_submitted' || booking.status === 'payment_submitted' || (payment.utr_number && !isPaid);
  const isWorkerAccepted = booking.status === 'confirmed' || booking.status === 'accepted';
  const isDeclined = booking.status === 'cancelled' || booking.status === 'declined';
  const isWaitingWorker = booking.status === 'pending';

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070b14] pt-20 pb-16 text-slate-100">
      <GlowOrb className="top-10 -left-20 h-96 w-96 bg-neon-emerald/15 blur-[120px] pointer-events-none" />
      <GlowOrb className="bottom-10 right-0 h-96 w-96 bg-neon-cyan/15 blur-[130px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <Link
          to="/customer/dashboard"
          className="group mb-6 inline-flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-2 text-sm text-gray-400 backdrop-blur-md hover:border-neon-emerald/40 hover:text-white"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        {isPaid ? (
          <div className="animate-scale-in text-center">
            <div className="mb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-4 py-1.5 text-xs font-semibold text-emerald-400 mb-2">
                <CheckCircle2 size={14} /> WORKER CONFIRMED PAYMENT RECEIVED
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-white">Your Receipt is Ready!</h1>
              <p className="text-sm text-gray-400 mt-1">Tap below to dispense your official CoLabour receipt</p>
            </div>

            <CoLabourPrinterEngine
              amount={payment.amount}
              bookingId={booking.id}
              workerName={worker.users?.name || 'Professional'}
              category={worker.category}
              utrNumber={payment.utr_number || utrNumber || 'Verified UPI'}
              onDashboard={() => navigate('/customer/dashboard')}
            />
          </div>
        ) : (
          <>
            <div className="mb-8 text-center animate-fade-in">
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Payment & Verification
              </h1>
              <p className="mt-2 text-sm text-gray-400">Worker request confirmation & instant UPI gateway</p>
            </div>

            <div className="relative mb-8 rounded-3xl border border-white/15 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-8 text-center backdrop-blur-2xl shadow-2xl">
              <div className="text-xs font-mono uppercase tracking-widest text-emerald-400/80 mb-2">
                Total Amount Due
              </div>
              <div className="text-5xl font-black tracking-tight text-white drop-shadow-[0_0_35px_rgba(16,185,129,0.35)]">
                <span className="text-3xl text-emerald-400 font-bold mr-1">₹</span>
                {payment.amount.toFixed(2)}
              </div>
              <div className="mt-4 flex items-center justify-center gap-2">
                <Badge variant={isDeclined ? 'coral' : isSubmitted ? 'amber' : isWorkerAccepted ? 'cyan' : 'amber'}>
                  {isDeclined ? <><XCircle size={12} /> Request Declined</> :
                   isSubmitted ? <><Clock size={12} className="animate-spin" /> Waiting for Worker Confirmation</> :
                   isWorkerAccepted ? <><CheckCircle2 size={12} /> Work Accepted - Scan & Pay</> :
                   <><Clock size={12} className="animate-spin" /> Waiting for Worker Acceptance</>}
                </Badge>
              </div>
            </div>

            {isWaitingWorker && (
              <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-8 text-center backdrop-blur-xl">
                <Clock size={32} className="text-amber-400 mx-auto mb-3 animate-spin" />
                <h2 className="text-xl font-bold text-white mb-2">Worker Acceptance Pending</h2>
                <p className="text-sm text-gray-400 mb-6">
                  Jaise hi worker dashboard se "Accept Work" karega, UPI QR code unlock ho jayega.
                </p>
                <NeonButton variant="ghost" onClick={fetchBookingData}>Check Status</NeonButton>
              </div>
            )}

            {isWorkerAccepted && !isSubmitted && (
              <>
                <div className="mb-8 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.01] p-8 backdrop-blur-2xl shadow-2xl">
                  <div className="mb-4 text-center">
                    <span className="text-xs font-semibold text-neon-emerald bg-neon-emerald/10 border border-neon-emerald/30 px-3 py-1 rounded-full">
                      Step 1: Scan & Pay
                    </span>
                    <h2 className="text-xl font-bold text-white mt-3 flex items-center justify-center gap-2">
                      <Zap size={20} className="text-neon-cyan" /> Pay to {worker.users?.name}
                    </h2>
                  </div>

                  <div className="relative mx-auto my-6 w-fit p-4 rounded-3xl bg-white/[0.04] border border-white/20 shadow-[0_0_40px_rgba(16,185,129,0.15)]">
                    <div className="rounded-2xl bg-white p-4 shadow-2xl">
                      {payment.upi_uri && <QRCodeCanvas value={payment.upi_uri} size={200} level="H" />}
                    </div>
                  </div>

                  <div className="mx-auto flex max-w-md items-center justify-between rounded-2xl border border-white/10 bg-base-900/80 p-2 pl-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-mono text-gray-400">Worker UPI ID</span>
                      <span className="font-mono text-sm font-semibold text-emerald-400">{worker.upi_id || 'colabour@upi'}</span>
                    </div>
                    <button
                      onClick={handleCopyUpiId}
                      className="flex items-center gap-1.5 rounded-xl border border-neon-emerald/30 bg-neon-emerald/10 px-4 py-2 text-xs font-semibold text-neon-emerald hover:bg-neon-emerald hover:text-black transition-all cursor-pointer"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.01] p-8 backdrop-blur-2xl shadow-2xl">
                  <h2 className="mb-2 flex items-center gap-2 text-lg font-bold text-white">
                    <ShieldCheck size={20} className="text-neon-emerald" /> Step 2: Submit UTR Number
                  </h2>
                  <p className="mb-4 text-xs text-gray-400">Pay karne ke baad Google Pay/PhonePe se 12-digit UTR yahan enter karein:</p>

                  <div className="mb-4">
                    <input
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                      placeholder="e.g. 439201928374"
                      className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3.5 text-center font-mono text-xl tracking-[0.2em] text-neon-cyan outline-none focus:border-neon-emerald"
                      maxLength={12}
                    />
                  </div>

                  {error && (
                    <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-400">
                      <AlertCircle size={16} /> {error}
                    </div>
                  )}

                  <NeonButton fullWidth size="lg" onClick={handleConfirmPayment} disabled={submitting}>
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Submit for Worker Confirmation'}
                  </NeonButton>
                </div>
              </>
            )}

            {isSubmitted && !isPaid && (
              <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-b from-amber-500/10 to-transparent p-8 text-center backdrop-blur-xl shadow-2xl animate-fade-in">
                <Clock size={32} className="text-amber-400 mx-auto mb-3 animate-spin" />
                <h2 className="text-2xl font-bold text-white mb-2">Awaiting Worker Confirmation</h2>
                <p className="text-sm text-gray-300 max-w-md mx-auto mb-4">
                  Aapka UTR: <span className="font-mono font-bold text-white text-base">{payment.utr_number || utrNumber}</span> worker ko bhej diya gaya hai.
                </p>
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/30 px-4 py-2 text-xs font-mono text-amber-400 mb-4">
                  <RefreshCw size={14} className="animate-spin" /> Worker account check kar raha hai...
                </div>
                <p className="text-xs text-gray-400">Worker ke "Yes, Received" dabate hi screen receipt me badal jayegi.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function CoLabourPrinterEngine({ amount, bookingId, workerName, category, utrNumber, onDashboard }: {
  amount: number;
  bookingId: string;
  workerName: string;
  category: string;
  utrNumber: string;
  onDashboard: () => void;
}) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDispensed, setIsDispensed] = useState(false);

  const handlePrintClick = () => {
    if (isPrinting || isDispensed) return;
    setIsPrinting(true);
    setTimeout(() => {
      setIsPrinting(false);
      setIsDispensed(true);
    }, 1200);
  };

  return (
    <div className="flex flex-col items-center justify-center my-4">
      <div className="relative w-full max-w-[360px] rounded-[42px] bg-gradient-to-b from-slate-100 via-slate-200 to-slate-300 p-6 sm:p-7 shadow-[0_30px_90px_rgba(0,0,0,0.9),inset_0_2px_4px_rgba(255,255,255,0.9),inset_0_-4px_8px_rgba(0,0,0,0.2)] border-2 border-slate-300">
        
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-3.5 rounded-full bg-emerald-500 shadow-[0_0_12px_#10B981] animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-slate-600 tracking-wider">POS READY</span>
          </div>
          <span className="text-xs font-black tracking-widest text-slate-400 uppercase font-mono">COLABOUR RECEIPTS</span>
        </div>

        {/* Paper Dispense Slot */}
        <div className="relative z-20 mx-auto h-4.5 w-[94%] rounded-full bg-slate-900 shadow-[inset_0_3px_6px_rgba(0,0,0,0.95)] border-b border-slate-400/40 flex items-center justify-center overflow-hidden">
          <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
        </div>

        {/* Sliding Slip Paper */}
        <div className="relative z-10 w-full overflow-hidden flex justify-center -mt-2">
          <div
            className={`w-[94%] transition-all duration-1000 ease-out origin-top ${
              isDispensed || isPrinting
                ? 'max-h-[600px] translate-y-0 opacity-100 scale-100'
                : 'max-h-0 -translate-y-12 opacity-0 scale-90'
            }`}
          >
            <div className="relative my-2 rounded-2xl bg-gradient-to-b from-[#0e804f] via-[#095f3a] to-[#043c24] p-5 text-white shadow-[0_20px_45px_rgba(0,0,0,0.6)] border border-emerald-400/40">
              
              <div className="absolute -top-1.5 left-0 right-0 h-3 bg-repeat-x bg-[radial-gradient(circle,transparent_4px,#0e804f_4px)] bg-[length:12px_12px]" />

              <div className="text-center pt-2">
                <span className="inline-block rounded-full bg-white/15 px-3 py-0.5 text-[9px] font-black tracking-widest uppercase mb-2 border border-white/25">
                  <Sparkles size={10} className="inline mr-1 text-amber-300" /> OFFICIAL RECEIPT
                </span>
                <h3 className="text-2xl font-black tracking-tight text-white drop-shadow-sm">CoLabour Pay</h3>
                <p className="text-[11px] text-emerald-200 font-mono mt-0.5">Booking #{bookingId.slice(0, 8).toUpperCase()}</p>
              </div>

              <div className="my-3.5 rounded-xl bg-black/30 p-3 text-center border border-white/10 shadow-inner backdrop-blur-sm">
                <p className="text-[10px] uppercase tracking-wider text-emerald-300 font-medium">Total Paid</p>
                <p className="text-3xl font-black text-white tracking-tight">₹{amount.toFixed(2)}</p>
                <div className="text-[11px] text-emerald-300 font-medium mt-1 flex items-center justify-center gap-1">
                  <CheckCircle2 size={13} /> Confirmed by Worker
                </div>
              </div>

              <div className="space-y-1.5 text-xs border-t border-emerald-500/40 pt-3 text-emerald-100">
                <div className="flex justify-between"><span>Professional:</span><strong className="text-white">{workerName}</strong></div>
                <div className="flex justify-between"><span>Skill:</span><strong className="text-white">{category}</strong></div>
                <div className="flex justify-between"><span>Date:</span><span className="font-mono text-white">{new Date().toLocaleDateString('en-IN')}</span></div>
                <div className="flex justify-between"><span>UTR / Ref:</span><span className="font-mono text-amber-300 font-bold">{utrNumber}</span></div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-1 text-[10px] text-emerald-200 font-mono">
                <Award size={12} className="text-amber-300" /> SECURE COLABOUR TRANSACTION
              </div>

              <div className="absolute -bottom-1.5 left-0 right-0 h-3 bg-repeat-x bg-[radial-gradient(circle,transparent_4px,#043c24_4px)] bg-[length:12px_12px]" />
            </div>
          </div>
        </div>

        {/* Dispense Trigger Button */}
        {!isDispensed && (
          <div className="relative mt-6 flex flex-col items-center justify-center">
            <button
              onClick={handlePrintClick}
              disabled={isPrinting}
              className={`group relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-b from-pink-400 via-pink-500 to-rose-600 shadow-[0_12px_25px_rgba(244,63,94,0.5),inset_0_3px_5px_rgba(255,255,255,0.6),inset_0_-4px_6px_rgba(0,0,0,0.3)] border-4 border-slate-200 transition-all active:scale-95 cursor-pointer ${
                isPrinting ? 'animate-pulse scale-95' : 'hover:scale-105'
              }`}
            >
              <div className="absolute inset-2 rounded-full border border-white/30 pointer-events-none" />
              {isPrinting ? (
                <div className="flex flex-col items-center text-white">
                  <Printer size={30} className="animate-bounce" />
                  <span className="text-[9px] font-black font-mono mt-1">DISPENSING...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-white">
                  <svg className="h-12 w-12 text-white/95 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
              )}
            </button>
            <span className="mt-3 text-xs font-black tracking-widest text-pink-600 uppercase font-mono">
              {isPrinting ? 'PRINTING RECEIPT...' : 'TAP TO DISPENSE SLIP'}
            </span>
          </div>
        )}

        {isDispensed && (
          <div className="mt-5 flex flex-col gap-2">
            <button
              onClick={() => window.print()}
              className="w-full rounded-xl bg-slate-800 py-3 text-xs font-bold text-white shadow-md hover:bg-slate-900 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download size={14} /> Download / Print Slip
            </button>
            <button
              onClick={onDashboard}
              className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Go to Dashboard <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
