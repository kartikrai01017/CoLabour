import { motion, AnimatePresence } from 'motion/react';
import {
  Bell, CheckCircle2, XCircle, MapPin, Calendar, Wallet,
  Loader2, X
} from 'lucide-react';
import { NeonButton } from '@/components/ui/NeonButton';
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-base-950/85 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg rounded-3xl border border-neon-cyan/40 bg-gradient-to-b from-base-900 to-base-950 p-6 sm:p-8 shadow-[0_0_60px_rgba(6,182,212,0.3)] overflow-hidden"
          >
            {/* Pulsing ring banner */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-neon-cyan/20 rounded-full blur-2xl animate-pulse" />
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-neon-emerald/20 rounded-full blur-2xl animate-pulse" />

            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-neon-cyan" />
                </span>
                <span className="text-xs font-mono font-bold tracking-wider text-neon-cyan uppercase">
                  HIGH-PRIORITY JOB DISPATCH
                </span>
              </div>
              <button
                onClick={dismissJob}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="text-center my-4">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-neon-cyan/15 border border-neon-cyan/30 text-neon-cyan shadow-[0_0_30px_rgba(6,182,212,0.25)]">
                <Bell size={32} className="animate-bounce" />
              </div>
              <h2 className="text-2xl font-bold text-white">New Service Request!</h2>
              <p className="text-sm text-gray-400 mt-1">A customer has requested your expertise on CoLabour.</p>
            </div>

            {/* Job Details Box */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2.5 my-5 text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-white/10">
                <span className="text-gray-400">Customer:</span>
                <span className="font-semibold text-white">{incomingJob.customer?.name ?? 'Verified Customer'}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/10">
                <span className="text-gray-400">Category / Skill:</span>
                <span className="font-semibold text-neon-cyan">{incomingJob.category}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 flex items-center gap-1.5"><Wallet size={14} /> Total Value:</span>
                <span className="text-lg font-bold text-neon-emerald">₹{Number(incomingJob.total_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 flex items-center gap-1.5"><Calendar size={14} /> Scheduled At:</span>
                <span className="text-gray-200">{new Date(incomingJob.scheduled_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-start pt-1">
                <span className="text-gray-400 flex items-center gap-1.5"><MapPin size={14} /> Location:</span>
                <span className="text-gray-200 text-right max-w-[220px] font-medium">{incomingJob.address}</span>
              </div>
              {incomingJob.notes && (
                <div className="mt-2 text-xs bg-black/40 p-2.5 rounded-xl border border-white/5 text-gray-300">
                  <span className="text-gray-500 font-semibold block mb-0.5">Customer Note:</span>
                  {incomingJob.notes}
                </div>
              )}
            </div>

            {/* Accept / Decline CTA Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleDeclineJob}
                disabled={processing}
                className="py-3 px-4 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold text-sm transition-all flex items-center justify-center gap-2"
              >
                <XCircle size={18} /> Decline
              </button>
              <NeonButton
                size="lg"
                variant="emerald"
                onClick={handleAcceptJob}
                disabled={processing}
                className="flex items-center justify-center gap-2"
              >
                {processing ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle2 size={18} /> Accept Job</>}
              </NeonButton>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* 2. Full-Screen Payment Verification Alert Modal */}
      {paymentAlert && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-base-950/90 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg rounded-3xl border border-neon-emerald/50 bg-gradient-to-b from-base-900 to-base-950 p-6 sm:p-8 shadow-[0_0_80px_rgba(16,185,129,0.35)] overflow-hidden"
          >
            {/* Glowing orb animations */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-neon-emerald/25 rounded-full blur-2xl animate-pulse" />
            <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl animate-pulse" />

            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-emerald opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-neon-emerald" />
                </span>
                <span className="text-xs font-mono font-bold tracking-wider text-neon-emerald uppercase">
                  PAYMENT VERIFICATION REQUIRED
                </span>
              </div>
              <button
                onClick={dismissPayment}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="text-center my-3">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-neon-emerald/15 border border-neon-emerald/30 text-neon-emerald shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <Wallet size={32} className="animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-white">Payment Received Alert</h2>
              <p className="text-sm text-gray-400 mt-1">Customer submitted UPI confirmation for this job.</p>
            </div>

            {/* Payment & UTR Summary Box */}
            <div className="rounded-2xl border border-neon-emerald/30 bg-neon-emerald/5 p-5 my-5 space-y-3">
              <div className="text-center pb-3 border-b border-white/10">
                <p className="text-xs text-gray-400">Total Amount Claimed</p>
                <p className="text-4xl font-extrabold text-neon-emerald mt-1">
                  ₹{Number(paymentAlert.amount).toFixed(2)}
                </p>
              </div>

              <div className="space-y-2 text-sm pt-1">
                <div className="flex justify-between items-center bg-base-900/80 p-2.5 rounded-xl border border-white/10">
                  <span className="text-gray-400 text-xs uppercase font-mono">12-Digit Bank UTR:</span>
                  <span className="font-mono font-bold text-neon-cyan tracking-wider text-base">
                    {paymentAlert.utr_number || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-400 px-1">
                  <span>Timestamp:</span>
                  <span>{new Date(paymentAlert.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center mb-6">
              Please check your UPI app / SMS alert for this transaction. Did you receive this payment?
            </p>

            {/* Confirm / Reject Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleRejectPayment}
                disabled={processing}
                className="py-3 px-4 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold text-sm transition-all flex items-center justify-center gap-2"
              >
                <XCircle size={18} /> No, Not Received
              </button>
              <NeonButton
                size="lg"
                variant="emerald"
                onClick={handleConfirmPayment}
                disabled={processing}
                className="flex items-center justify-center gap-2"
              >
                {processing ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle2 size={18} /> Yes, Received</>}
              </NeonButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
