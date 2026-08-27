import { motion, AnimatePresence } from 'motion/react';
import {
  Bell, CheckCircle2, XCircle, MapPin, Calendar, Wallet,
  Loader2, X, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { useGlobalWorkerAlert } from '@/hooks/useGlobalWorkerAlert';

export function GlobalWorkerAlert() {
  const {
    shouldShow, incomingJob, paymentAlert, processing,
    handleAcceptJob, handleDeclineJob, handleConfirmPayment, handleRejectPayment,
    dismissJob, dismissPayment,
  } = useGlobalWorkerAlert();

  if (!shouldShow) return null;

  return (
    <AnimatePresence>
      {/* 1. Full-Screen Incoming Job Alert Modal */}
      {incomingJob && !paymentAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm selection:bg-[#F59E0B] selection:text-black">
          <motion.div
            initial={{ scale: 0.92, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-lg rounded-3xl border-2 sm:border-[2.5px] border-black bg-[#FAF7F2] p-5 sm:p-7 shadow-[10px_10px_0px_#000000] overflow-hidden"
          >
            {/* Header banner */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-black">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F59E0B] opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#F59E0B]" />
                </span>
                <span className="text-[11px] font-mono font-black tracking-wider text-neutral-900 uppercase">
                  HIGH-PRIORITY JOB DISPATCH
                </span>
              </div>
              <button
                type="button"
                onClick={dismissJob}
                className="rounded-xl border border-black bg-white p-1 text-black hover:bg-neutral-100 shadow-[1px_1px_0px_#000000] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="text-center my-3">
              <div className="mx-auto mb-2.5 flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-black bg-[#FEF3C7] text-neutral-900 shadow-[3px_3px_0px_#000000]">
                <Bell size={28} className="animate-bounce" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase text-neutral-900">New Service Request!</h2>
              <p className="text-xs font-semibold text-neutral-600 mt-0.5">A nearby customer is requesting your direct service.</p>
            </div>

            {/* Job Details Box */}
            <div className="rounded-2xl border-2 border-black bg-white p-4 space-y-2 my-4 text-xs font-bold text-neutral-700 shadow-[3px_3px_0px_#000000]">
              <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
                <span className="text-neutral-500 font-bold uppercase text-[10px]">Customer:</span>
                <span className="font-black text-neutral-900 text-sm">{incomingJob.customer?.name ?? 'Verified Customer'}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
                <span className="text-neutral-500 font-bold uppercase text-[10px]">Category / Trade:</span>
                <span className="rounded border border-black bg-[#FEF3C7] px-2 py-0.5 font-black text-black text-[11px]">
                  {incomingJob.category}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
                <span className="text-neutral-500 font-bold uppercase text-[10px] flex items-center gap-1">
                  <Wallet size={13} /> Total Value:
                </span>
                <span className="text-base font-black text-[#15803D] font-mono">
                  ₹{Number(incomingJob.total_amount).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
                <span className="text-neutral-500 font-bold uppercase text-[10px] flex items-center gap-1">
                  <Calendar size={13} /> Scheduled At:
                </span>
                <span className="text-neutral-900 font-bold">{new Date(incomingJob.scheduled_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-start pt-1">
                <span className="text-neutral-500 font-bold uppercase text-[10px] flex items-center gap-1">
                  <MapPin size={13} /> Location:
                </span>
                <span className="text-neutral-900 text-right max-w-[220px] font-black">{incomingJob.address}</span>
              </div>
              {incomingJob.notes && (
                <div className="mt-2 text-xs bg-[#FAF7F2] p-2.5 rounded-xl border border-neutral-300 text-neutral-800">
                  <span className="text-neutral-500 font-black uppercase text-[9px] block mb-0.5">Customer Note:</span>
                  {incomingJob.notes}
                </div>
              )}
            </div>

            {/* Accept / Decline CTA Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={handleDeclineJob}
                disabled={processing}
                className="py-3 px-4 rounded-xl border-2 border-black bg-[#FEE2E2] hover:bg-[#FECACA] text-red-800 font-black text-xs sm:text-sm uppercase shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <XCircle size={16} />
                <span>Decline</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={handleAcceptJob}
                disabled={processing}
                className="py-3 px-4 rounded-xl border-2 border-black bg-[#F59E0B] hover:bg-[#E68A00] text-black font-black text-xs sm:text-sm uppercase shadow-[3px_3px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-black" />
                    <span>Accepting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} className="text-black stroke-[2.5]" />
                    <span>Accept Job</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 2. Full-Screen Payment Verification Alert Modal */}
      {paymentAlert && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm selection:bg-[#F59E0B] selection:text-black">
          <motion.div
            initial={{ scale: 0.92, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-lg rounded-3xl border-2 sm:border-[2.5px] border-black bg-[#FAF7F2] p-5 sm:p-7 shadow-[10px_10px_0px_#000000] overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-black">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#15803D] opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#15803D]" />
                </span>
                <span className="text-[11px] font-mono font-black tracking-wider text-neutral-900 uppercase">
                  PAYMENT VERIFICATION REQUIRED
                </span>
              </div>
              <button
                type="button"
                onClick={dismissPayment}
                className="rounded-xl border border-black bg-white p-1 text-black hover:bg-neutral-100 shadow-[1px_1px_0px_#000000] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="text-center my-3">
              <div className="mx-auto mb-2.5 flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-black bg-[#DCFCE7] text-[#15803D] shadow-[3px_3px_0px_#000000]">
                <Wallet size={28} className="animate-pulse stroke-[2.5]" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase text-neutral-900">Payment Received Alert</h2>
              <p className="text-xs font-semibold text-neutral-600 mt-0.5">A customer has submitted UPI confirmation for this job.</p>
            </div>

            {/* Payment & UTR Summary Box */}
            <div className="rounded-2xl border-2 border-black bg-white p-4 my-4 space-y-3 shadow-[3px_3px_0px_#000000]">
              <div className="text-center pb-3 border-b-2 border-dashed border-neutral-300">
                <p className="text-[10px] font-black uppercase text-neutral-500">Total Amount Claimed</p>
                <p className="text-3xl sm:text-4xl font-black text-neutral-900 font-mono mt-0.5">
                  ₹{Number(paymentAlert.amount).toFixed(2)}
                </p>
              </div>

              <div className="space-y-2 text-xs pt-1">
                <div className="flex justify-between items-center bg-[#FAF7F2] p-2.5 rounded-xl border border-black">
                  <span className="text-neutral-500 text-[10px] font-black uppercase font-mono">12-Digit Bank UTR:</span>
                  <span className="font-mono font-black text-neutral-900 tracking-wider text-sm">
                    {paymentAlert.utr_number || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold text-neutral-500 px-1">
                  <span>Timestamp:</span>
                  <span>{new Date(paymentAlert.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] font-semibold text-neutral-600 text-center mb-5">
              Please check your UPI app or bank SMS alert for this reference number. Did you receive this payment?
            </p>

            {/* Confirm / Reject Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={handleRejectPayment}
                disabled={processing}
                className="py-3 px-4 rounded-xl border-2 border-black bg-[#FEE2E2] hover:bg-[#FECACA] text-red-800 font-black text-xs sm:text-sm uppercase shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <XCircle size={16} />
                <span>No, Not Received</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={handleConfirmPayment}
                disabled={processing}
                className="py-3 px-4 rounded-xl border-2 border-black bg-[#BBF7D0] hover:bg-[#86EFAC] text-[#15803D] font-black text-xs sm:text-sm uppercase shadow-[3px_3px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Confirming...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} className="stroke-[2.5]" />
                    <span>Yes, Received</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

