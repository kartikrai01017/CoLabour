import { useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Loader2, AlertCircle, Copy, Check, Smartphone, ShieldCheck, Clock,
  ArrowRight, RefreshCw, Lock, Hourglass, CheckCircle2, Star, Calendar,
  Receipt, Wallet, Zap, Sparkles, MapPin
} from 'lucide-react';
import { usePaymentPage } from '@/hooks/usePaymentPage';
import { CoLabourPrinterEngine } from '@/components/CoLabourPrinterEngine';
import { CATEGORY_ICONS, getCategoryStyle } from '@/lib/categories';

const UPI_APPS = [
  { name: 'GPay', scheme: 'tez', bg: 'bg-white', text: 'text-neutral-900' },
  { name: 'PhonePe', scheme: 'phonepe', bg: 'bg-[#EDE9FE]', text: 'text-[#6D28D9]' },
  { name: 'Paytm', scheme: 'paytmmp', bg: 'bg-[#E0F2FE]', text: 'text-[#0369A1]' },
  { name: 'BHIM', scheme: 'bhim', bg: 'bg-[#DCFCE7]', text: 'text-[#15803D]' },
];

export function PaymentPage() {
  const {
    navigate, booking, payment, worker, loading,
    utrNumber, setUtrNumber, submitting, error, copied,
    testReceiptMode, setTestReceiptMode,
    isPaid, isSubmitted, isWorkerAccepted,
    handleConfirmPayment, handleCopyUpiId, handleUpiApp,
  } = usePaymentPage();

  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'gpay' | 'phonepe' | 'paytm'>('upi');

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4EFE6] pt-16">
        <div className="rounded-2xl border-2 border-black bg-white p-6 shadow-[4px_4px_0px_#000000] flex items-center gap-3">
          <Loader2 size={24} className="animate-spin text-[#F59E0B]" />
          <span className="font-black text-sm uppercase">Loading Secure Gateway...</span>
        </div>
      </div>
    );
  }

  if (!booking || !payment || !worker) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F4EFE6] pt-16 gap-4 p-4 text-center">
        <div className="rounded-3xl border-2 border-black bg-white p-8 shadow-[6px_6px_0px_#000000] max-w-md">
          <AlertCircle className="text-[#F59E0B] mx-auto mb-3" size={40} />
          <h2 className="text-xl font-black uppercase text-neutral-900">Record Not Found</h2>
          <p className="text-xs text-neutral-600 font-medium my-3">
            Booking or payment record could not be loaded.
          </p>
          <Link to="/customer/dashboard">
            <button
              type="button"
              className="rounded-xl border-2 border-black bg-[#F59E0B] px-6 py-2.5 text-xs font-black uppercase shadow-[2px_2px_0px_#000000] cursor-pointer"
            >
              Go to Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const Icon = CATEGORY_ICONS[booking.category] ?? Zap;
  const style = getCategoryStyle(booking.category);

  // When paid or in receipt test mode, show CoLabour Printer Engine
  if (isPaid || testReceiptMode) {
    return (
      <div className="min-h-screen bg-[#F4EFE6] text-neutral-900 font-sans pt-20 pb-16 px-4 selection:bg-[#F59E0B] selection:text-black">
        <div className="mx-auto max-w-xl">
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/customer/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-white px-4 py-2 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000] hover:bg-neutral-100 transition-all"
            >
              <ArrowLeft size={14} /> Back to Dashboard
            </Link>
            <button
              type="button"
              onClick={() => setTestReceiptMode(false)}
              className="text-xs font-bold text-neutral-600 hover:text-black underline"
            >
              ✕ Close Slip View
            </button>
          </div>

          <div className="text-center mb-6">
            <span className="inline-block rounded-xl border-2 border-black bg-[#BBF7D0] px-4 py-1 text-xs font-black uppercase text-[#15803D] shadow-[2px_2px_0px_#000000]">
              ✔ SETTLEMENT COMPLETED • 0% COMMISSION
            </span>
          </div>

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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-neutral-900 font-sans pt-20 pb-16 px-3 sm:px-6 lg:px-8 selection:bg-[#F59E0B] selection:text-black">
      <div className="mx-auto max-w-5xl">
        
        {/* Top Header Row */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/customer/dashboard"
            className="inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-white px-4 py-2 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000] hover:bg-neutral-100 transition-all"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>

          <button
            type="button"
            onClick={() => setTestReceiptMode(!testReceiptMode)}
            className="rounded-xl border border-black bg-[#FEF3C7] px-3 py-1.5 text-[11px] font-black uppercase text-neutral-800 shadow-[1px_1px_0px_#000000] hover:bg-[#FDE68A]"
          >
            ⚡ Test Slip Engine
          </button>
        </div>

        {/* 2-Column Split: Payment Summary (Left) & Price Breakdown + Methods (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* ========================================================================= */}
          {/* 1. LEFT COLUMN: PAYMENT SUMMARY CARD (Matching Screenshot) */}
          {/* ========================================================================= */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-6 rounded-3xl border-2 sm:border-[2.5px] border-black bg-white p-6 sm:p-7 shadow-[6px_6px_0px_#000000] space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <h2 className="text-xl sm:text-2xl font-black uppercase text-neutral-900">
                Payment Summary
              </h2>
              <span className="rounded-md border border-black bg-[#FED7AA] px-2 py-0.5 text-[10px] font-black text-[#C2410C] uppercase shadow-[1px_1px_0px_#000000]">
                ACCAL
              </span>
            </div>

            {/* Worker Mini Profile Frame */}
            <div className="rounded-2xl border-2 border-black bg-[#FAF7F2] p-4 shadow-[3px_3px_0px_#000000] flex items-center gap-3.5">
              <div className={`h-14 w-14 rounded-2xl border-2 border-black ${style.bg} flex items-center justify-center shadow-[2px_2px_0px_#000000] flex-shrink-0`}>
                <Icon className={style.text} size={28} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-base text-neutral-900">
                    {worker.users?.name ?? 'Professional Worker'}
                  </h3>
                  <span className="rounded-md border border-black bg-[#BBF7D0] px-1.5 py-0.5 text-[9px] font-black text-[#15803D] uppercase">
                    VERIFIED
                  </span>
                </div>
                <p className="text-xs font-black uppercase text-neutral-500 mt-0.5">
                  {booking.category}
                </p>
                <div className="flex items-center gap-1 text-xs font-bold text-neutral-800 mt-1">
                  <Star size={12} className="fill-[#F59E0B] text-[#F59E0B]" />
                  <span>{Number(worker.rating ?? 5.0).toFixed(1)} Stars</span>
                  <span className="text-[10px] text-neutral-400">({worker.total_ratings ?? 12} reviews)</span>
                </div>
              </div>
            </div>

            {/* Booked Service Box */}
            <div className="rounded-2xl border-2 border-black bg-[#FAF7F2] p-4 shadow-[2px_2px_0px_#000000]">
              <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block mb-1">
                Booked Service
              </span>
              <p className="text-base sm:text-lg font-black text-neutral-900">
                {booking.category} Job Service
              </p>
              {booking.notes && (
                <p className="text-xs text-neutral-600 mt-1 italic">"{booking.notes}"</p>
              )}
            </div>

            {/* Appointment Box */}
            <div className="rounded-2xl border-2 border-black bg-[#FAF7F2] p-4 shadow-[2px_2px_0px_#000000]">
              <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block mb-1">
                Appointment Scheduled
              </span>
              <p className="text-base font-black text-neutral-900 flex items-center gap-2">
                <Calendar size={16} className="text-[#B45309]" />
                <span>{new Date(booking.scheduled_at).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </p>
            </div>

            {/* Location Box */}
            <div className="rounded-2xl border-2 border-black bg-[#FAF7F2] p-4 shadow-[2px_2px_0px_#000000]">
              <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block mb-1">
                Service Address
              </span>
              <p className="text-xs font-semibold text-neutral-800 flex items-center gap-2">
                <MapPin size={14} className="text-neutral-500 flex-shrink-0" />
                <span className="truncate">{booking.address}</span>
              </p>
            </div>

          </motion.div>

          {/* ========================================================================= */}
          {/* 2. RIGHT COLUMN: PRICE BREAKDOWN & PAYMENT METHOD (Matching Screenshot) */}
          {/* ========================================================================= */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-6 space-y-6"
          >
            
            {/* Price Breakdown Card */}
            <div className="rounded-3xl border-2 sm:border-[2.5px] border-black bg-white p-6 shadow-[6px_6px_0px_#000000] space-y-3.5">
              <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                <h2 className="text-xl font-black uppercase text-neutral-900">
                  Price Breakdown
                </h2>
                <span className="rounded-md border border-black bg-[#D4E7D0] px-2 py-0.5 text-[10px] font-black uppercase shadow-[1px_1px_0px_#000000]">
                  DIRECT P2P
                </span>
              </div>

              <div className="space-y-2.5 text-xs font-bold text-neutral-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span>Service Hourly Fee:</span>
                    <span className="rounded bg-neutral-200 px-1.5 py-0.5 text-[9px] font-mono">HOURLY</span>
                  </div>
                  <span className="font-mono text-sm text-neutral-900">₹{(Number(payment.amount) * 0.85).toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span>Materials & Travel:</span>
                    <span className="rounded bg-neutral-200 px-1.5 py-0.5 text-[9px] font-mono">ESTIMATE</span>
                  </div>
                  <span className="font-mono text-sm text-neutral-900">₹{(Number(payment.amount) * 0.15).toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between text-[#15803D]">
                  <div className="flex items-center gap-1.5">
                    <span>Platform Commission:</span>
                    <span className="rounded bg-[#DCFCE7] border border-black px-1.5 py-0.5 text-[9px] font-black">0% FEE</span>
                  </div>
                  <span className="font-mono text-sm font-black">₹0.00</span>
                </div>
              </div>

              <div className="pt-3 border-t-2 border-black flex items-center justify-between">
                <span className="text-base font-black uppercase text-neutral-900">Total Amount:</span>
                <span className="text-3xl font-black text-neutral-900 font-mono">
                  ₹{Number(payment.amount).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Select Payment Method Container (Matching Screenshot) */}
            <div className="rounded-3xl border-2 sm:border-[2.5px] border-black bg-white p-6 shadow-[6px_6px_0px_#000000] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b-2 border-dashed border-neutral-300">
                <h3 className="text-sm font-black uppercase text-neutral-900">
                  Select Payment Method
                </h3>
                <span className="rounded border border-black bg-[#BBF7D0] px-2 py-0.5 text-[9px] font-black text-[#15803D]">
                  SELECTED ✔
                </span>
              </div>

              {/* State 1: Locked waiting for worker */}
              {!isWorkerAccepted && (
                <div className="rounded-2xl border-2 border-black bg-[#FEF3C7] p-5 text-center shadow-[3px_3px_0px_#000000]">
                  <Lock size={28} className="mx-auto mb-2 text-[#B45309]" />
                  <h4 className="font-black text-sm uppercase text-neutral-900">QR Code Locked</h4>
                  <p className="text-xs text-neutral-700 font-medium my-2">
                    Waiting for <span className="font-black text-black">{worker.users?.name}</span> to accept the booking request.
                  </p>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#B45309]">
                    <RefreshCw size={13} className="animate-spin" /> Live polling worker acceptance...
                  </div>
                </div>
              )}

              {/* State 2: Unlocked QR Canvas & Direct UPI Form */}
              {isWorkerAccepted && (
                <>
                  {/* Quick App Selectors */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {UPI_APPS.map((app) => (
                      <button
                        key={app.name}
                        type="button"
                        onClick={() => handleUpiApp(app.scheme)}
                        className={`p-2.5 rounded-xl border-2 border-black ${app.bg} font-black text-xs uppercase shadow-[2px_2px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all flex flex-col items-center gap-1 cursor-pointer`}
                      >
                        <Smartphone size={16} className={app.text} />
                        <span className={app.text}>{app.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* QR Canvas */}
                  <div className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-black bg-[#FAF7F2] shadow-inner">
                    <div className="rounded-xl bg-white p-3 border-2 border-black shadow-[3px_3px_0px_#000000] mb-3">
                      {payment.upi_uri && (
                        <QRCodeCanvas value={payment.upi_uri} size={170} level="H" includeMargin={false} />
                      )}
                    </div>
                    
                    {/* Worker UPI Copy Stamp */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-black text-neutral-900 bg-white border border-black px-3 py-1 rounded-lg">
                        {worker.upi_id}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyUpiId}
                        className="rounded-lg border border-black bg-[#F59E0B] px-2.5 py-1 text-xs font-black text-black shadow-[1px_1px_0px_#000000] hover:bg-[#E68A00] cursor-pointer flex items-center gap-1"
                      >
                        {copied ? <Check size={13} className="stroke-[3]" /> : <Copy size={13} />}
                        <span>{copied ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* UTR Input Form & Pay CTA */}
                  {isSubmitted ? (
                    <div className="rounded-2xl border-2 border-black bg-[#FEF3C7] p-4 text-center shadow-[3px_3px_0px_#000000]">
                      <Clock size={24} className="mx-auto mb-1 text-[#B45309] animate-pulse" />
                      <p className="font-black text-xs uppercase text-neutral-900">UTR Submitted: {payment.utr_number}</p>
                      <p className="text-xs text-neutral-600 mt-1">Awaiting worker's confirmation on their dashboard.</p>
                      <div className="mt-2 text-[11px] font-bold text-neutral-500 flex items-center justify-center gap-1">
                        <RefreshCw size={12} className="animate-spin" /> Verifying live receipt...
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-black uppercase text-neutral-800 mb-1">
                          Enter 12-Digit Bank UTR Reference <span className="text-red-500">*</span>
                        </label>
                        <input
                          value={utrNumber}
                          onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                          placeholder="e.g. 483920194821"
                          maxLength={12}
                          className="w-full rounded-xl border-2 border-black bg-[#FAF7F2] py-2.5 px-3 text-center font-mono text-lg font-black tracking-widest text-neutral-900 outline-none shadow-[2px_2px_0px_#000000] focus:bg-white transition-all"
                        />
                      </div>

                      {error && (
                        <div className="flex items-center gap-2 rounded-xl border border-red-600 bg-[#FEE2E2] p-2.5 text-xs font-bold text-red-700">
                          <AlertCircle size={14} className="shrink-0" />
                          <span>{error}</span>
                        </div>
                      )}

                      {/* PAY & CONFIRM Big Button (Matching Screenshot) */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        onClick={handleConfirmPayment}
                        disabled={submitting}
                        className="w-full rounded-2xl border-2 border-black bg-[#F59E0B] hover:bg-[#E68A00] py-3.5 px-6 text-sm sm:text-base font-black uppercase tracking-wider text-black shadow-[4px_4px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                      >
                        {submitting ? (
                          <>
                            <Loader2 size={16} className="animate-spin text-black" />
                            <span>Submitting Settlement...</span>
                          </>
                        ) : (
                          <>
                            <span>PAY & CONFIRM</span>
                            <ArrowRight size={16} className="stroke-[3]" />
                          </>
                        )}
                      </motion.button>
                    </div>
                  )}
                </>
              )}

              <div className="pt-2 text-center text-[10px] font-bold text-neutral-500 flex items-center justify-center gap-1">
                <ShieldCheck size={13} className="text-[#15803D]" />
                <span>Zero commission • 100% Direct P2P UPI</span>
              </div>
            </div>

          </motion.div>

        </div>

      </div>
    </div>
  );
}

