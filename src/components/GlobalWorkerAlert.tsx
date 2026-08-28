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
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-nb-ink/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg rounded-nb-2xl border-[4px] border-nb-ink bg-nb-surface p-6 sm:p-8 shadow-nb-xl overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-nb-ink/20">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-nb-accent-blue opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-nb-accent-blue border border-nb-ink" />
                </span>
                <span className="text-xs font-mono font-black tracking-wider text-nb-ink uppercase">
                  HIGH-PRIORITY JOB DISPATCH
                </span>
              </div>
              <button
                onClick={dismissJob}
                className="text-nb-text-muted hover:text-nb-ink transition-colors rounded-nb-sm border border-nb-ink/20 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="text-center my-4">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-nb-lg bg-nb-accent-blue/20 border-[2px] border-nb-ink text-nb-ink shadow-nb-md">
                <Bell size={32} className="animate-bounce" />
              </div>
              <h2 className="text-2xl font-extrabold text-nb-ink">New Service Request!</h2>
              <p className="text-sm font-medium text-nb-text-muted mt-1">A customer has requested your expertise on CoLabour.</p>
            </div>

            {/* Job Details Box */}
            <div className="rounded-nb-lg border-[2px] border-nb-ink bg-nb-surface-muted/50 p-4 space-y-2.5 my-5 text-sm shadow-nb-sm">
              <div className="flex justify-between items-center pb-2 border-b border-nb-ink/10">
                <span className="text-nb-text-muted font-medium">Customer:</span>
                <span className="font-bold text-nb-ink">{incomingJob.customer?.name ?? 'Verified Customer'}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-nb-ink/10">
                <span className="text-nb-text-muted font-medium">Category / Skill:</span>
                <span className="font-bold text-nb-accent-orange">{incomingJob.category}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-nb-text-muted flex items-center gap-1.5 font-medium"><Wallet size={14} /> Total Value:</span>
                <span className="text-lg font-black text-nb-accent-green">₹{Number(incomingJob.total_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-nb-text-muted flex items-center gap-1.5 font-medium"><Calendar size={14} /> Scheduled At:</span>
                <span className="font-medium text-nb-ink">{new Date(incomingJob.scheduled_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-start pt-1">
                <span className="text-nb-text-muted flex items-center gap-1.5 font-medium"><MapPin size={14} /> Location:</span>
                <span className="text-nb-ink text-right max-w-[220px] font-bold">{incomingJob.address}</span>
              </div>
              {incomingJob.notes && (
                <div className="mt-2 text-xs bg-nb-surface border border-nb-ink/20 p-2.5 rounded-nb-md text-nb-ink font-medium">
                  <span className="text-nb-text-muted font-bold block mb-0.5">Customer Note:</span>
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
                className="py-3 px-4 rounded-nb-md border-[2px] border-nb-ink bg-nb-accent-red/10 hover:bg-nb-accent-red/20 text-nb-accent-red font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-nb-sm hover:shadow-nb-md active:shadow-nb-pressed active:translate-x-[3px] active:translate-y-[3px]"
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
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-nb-ink/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg rounded-nb-2xl border-[4px] border-nb-ink bg-nb-surface p-6 sm:p-8 shadow-nb-xl overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-nb-ink/20">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-nb-accent-green opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-nb-accent-green border border-nb-ink" />
                </span>
                <span className="text-xs font-mono font-black tracking-wider text-nb-ink uppercase">
                  PAYMENT VERIFICATION REQUIRED
                </span>
              </div>
              <button
                onClick={dismissPayment}
                className="text-nb-text-muted hover:text-nb-ink transition-colors rounded-nb-sm border border-nb-ink/20 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="text-center my-3">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-nb-lg bg-nb-accent-green/20 border-[2px] border-nb-ink text-nb-ink shadow-nb-md">
                <Wallet size={32} className="animate-pulse" />
              </div>
              <h2 className="text-2xl font-extrabold text-nb-ink">Payment Received Alert</h2>
              <p className="text-sm font-medium text-nb-text-muted mt-1">Customer submitted UPI confirmation for this job.</p>
            </div>

            {/* Payment & UTR Summary Box */}
            <div className="rounded-nb-lg border-[3px] border-nb-accent-green bg-nb-accent-green/5 p-5 my-5 space-y-3 shadow-nb-md">
              <div className="text-center pb-3 border-b border-nb-ink/10">
                <p className="text-xs font-bold uppercase tracking-wider text-nb-text-muted">Total Amount Claimed</p>
                <p className="text-4xl font-black text-nb-accent-green mt-1">
                  ₹{Number(paymentAlert.amount).toFixed(2)}
                </p>
              </div>

              <div className="space-y-2 text-sm pt-1">
                <div className="flex justify-between items-center bg-nb-surface border-[2px] border-nb-ink p-2.5 rounded-nb-md shadow-nb-sm">
                  <span className="text-nb-text-muted text-xs uppercase font-mono font-bold">12-Digit Bank UTR:</span>
                  <span className="font-mono font-black text-nb-accent-orange tracking-wider text-base">
                    {paymentAlert.utr_number || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-nb-text-muted px-1 font-medium">
                  <span>Timestamp:</span>
                  <span>{new Date(paymentAlert.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-nb-text-muted text-center mb-6 font-medium">
              Please check your UPI app / SMS alert for this transaction. Did you receive this payment?
            </p>

            {/* Confirm / Reject Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleRejectPayment}
                disabled={processing}
                className="py-3 px-4 rounded-nb-md border-[2px] border-nb-ink bg-nb-accent-red/10 hover:bg-nb-accent-red/20 text-nb-accent-red font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-nb-sm hover:shadow-nb-md active:shadow-nb-pressed active:translate-x-[3px] active:translate-y-[3px]"
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