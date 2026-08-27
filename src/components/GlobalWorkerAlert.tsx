import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell, CheckCircle2, XCircle, MapPin, Calendar, Wallet,
  Loader2, X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  fetchWorkerDashboardData,
  updateBookingStatus,
  confirmPaymentAsReceived,
  rejectPaymentDispute
} from '@/lib/dataService';
import { type Booking, type Payment } from '@/lib/supabase';
<<<<<<< HEAD
=======
import { NeonButton } from '@/components/ui/NeonButton';
>>>>>>> origin/main

interface PendingBookingItem extends Booking {
  customer?: { name: string; phone: string } | null;
}

interface PaymentItem extends Payment {
  bookings?: { customer_id: string; address: string; category?: string } | null;
}

export function GlobalWorkerAlert() {
  const { user } = useAuth();
  const [incomingJob, setIncomingJob] = useState<PendingBookingItem | null>(null);
  const [paymentAlert, setPaymentAlert] = useState<PaymentItem | null>(null);
  const [processing, setProcessing] = useState(false);
  const [dismissedJobs, setDismissedJobs] = useState<Set<string>>(new Set());
  const [dismissedPayments, setDismissedPayments] = useState<Set<string>>(new Set());

  const checkAlerts = useCallback(async () => {
    if (!user || user.role !== 'worker') return;

    try {
      const data = await fetchWorkerDashboardData(user.id);
      
      // 1. Check for pending booking requests
      const pendingJobs = (data.bookings || []).filter(
        (b) => b.status === 'pending' && !dismissedJobs.has(b.id)
      ) as PendingBookingItem[];

      if (pendingJobs.length > 0) {
        setIncomingJob(pendingJobs[0]);
      } else {
        setIncomingJob(null);
      }

      // 2. Check for payment_submitted alerts
      const pendingPayments = (data.payments || []).filter(
        (p) => p.status === 'payment_submitted' && !dismissedPayments.has(p.id)
      ) as PaymentItem[];

      if (pendingPayments.length > 0) {
        setPaymentAlert(pendingPayments[0]);
      } else {
        setPaymentAlert(null);
      }
    } catch {
      // ignore
    }
  }, [user, dismissedJobs, dismissedPayments]);

  useEffect(() => {
    if (!user || user.role !== 'worker') return;
    checkAlerts();
    const interval = setInterval(checkAlerts, 2500);
    return () => clearInterval(interval);
  }, [user, checkAlerts]);

  // Actions for Incoming Job
  const handleAcceptJob = async () => {
    if (!incomingJob) return;
    setProcessing(true);
    try {
      await updateBookingStatus(incomingJob.id, 'confirmed');
      setDismissedJobs((prev) => new Set(prev).add(incomingJob.id));
      setIncomingJob(null);
      await checkAlerts();
    } catch {
      alert('Failed to accept booking');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeclineJob = async () => {
    if (!incomingJob) return;
    setProcessing(true);
    try {
      await updateBookingStatus(incomingJob.id, 'cancelled');
      setDismissedJobs((prev) => new Set(prev).add(incomingJob.id));
      setIncomingJob(null);
      await checkAlerts();
    } catch {
      alert('Failed to decline booking');
    } finally {
      setProcessing(false);
    }
  };

  // Actions for Payment Confirmation
  const handleConfirmPayment = async () => {
    if (!paymentAlert) return;
    setProcessing(true);
    try {
      await confirmPaymentAsReceived(paymentAlert.id);
      setDismissedPayments((prev) => new Set(prev).add(paymentAlert.id));
      setPaymentAlert(null);
      await checkAlerts();
    } catch {
      alert('Failed to confirm payment');
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!paymentAlert) return;
    setProcessing(true);
    try {
      await rejectPaymentDispute(paymentAlert.id);
      setDismissedPayments((prev) => new Set(prev).add(paymentAlert.id));
      setPaymentAlert(null);
      await checkAlerts();
    } catch {
      alert('Failed to reject payment');
    } finally {
      setProcessing(false);
    }
  };

  if (!user || user.role !== 'worker') return null;

  return (
    <AnimatePresence>
      {/* 1. Full-Screen Incoming Job Alert Modal */}
      {incomingJob && !paymentAlert && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
<<<<<<< HEAD
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
=======
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-base-950/85 backdrop-blur-md"
>>>>>>> origin/main
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
<<<<<<< HEAD
            className="relative w-full max-w-lg rounded-2xl border-2 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000] overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-black">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-black" />
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-200 border-2 border-black text-xs font-black tracking-wider text-black uppercase shadow-[1px_1px_0px_0px_#000]">
=======
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
>>>>>>> origin/main
                  HIGH-PRIORITY JOB DISPATCH
                </span>
              </div>
              <button
                onClick={() => {
                  setDismissedJobs((prev) => new Set(prev).add(incomingJob.id));
                  setIncomingJob(null);
                }}
<<<<<<< HEAD
                className="h-8 w-8 rounded-lg border-2 border-black bg-gray-100 flex items-center justify-center text-black hover:bg-red-200 transition-colors shadow-[2px_2px_0px_0px_#000]"
              >
                <X size={16} />
=======
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={18} />
>>>>>>> origin/main
              </button>
            </div>

            <div className="text-center my-4">
<<<<<<< HEAD
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-300 border-2 border-black text-black shadow-[4px_4px_0px_0px_#000]">
                <Bell size={32} className="animate-bounce" />
              </div>
              <h2 className="text-2xl font-black text-black">New Service Request!</h2>
              <p className="text-xs font-bold text-gray-700 mt-1">A customer has requested your expertise on CoLabour.</p>
            </div>

            {/* Job Details Box */}
            <div className="rounded-xl border-2 border-black bg-yellow-50 p-4 space-y-2.5 my-5 text-xs sm:text-sm shadow-[3px_3px_0px_0px_#000]">
              <div className="flex justify-between items-center pb-2 border-b-2 border-black/10">
                <span className="font-bold text-gray-600">Customer:</span>
                <span className="font-black text-black">{incomingJob.customer?.name ?? 'Verified Customer'}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b-2 border-black/10">
                <span className="font-bold text-gray-600">Category / Skill:</span>
                <span className="font-black text-black px-2 py-0.5 rounded bg-emerald-200 border border-black">{incomingJob.category}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-600 flex items-center gap-1.5"><Wallet size={14} /> Total Value:</span>
                <span className="text-lg font-black text-black">₹{Number(incomingJob.total_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-600 flex items-center gap-1.5"><Calendar size={14} /> Scheduled At:</span>
                <span className="font-bold text-black">{new Date(incomingJob.scheduled_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-start pt-1">
                <span className="font-bold text-gray-600 flex items-center gap-1.5"><MapPin size={14} /> Location:</span>
                <span className="text-black text-right max-w-[220px] font-bold">{incomingJob.address}</span>
              </div>
              {incomingJob.notes && (
                <div className="mt-2 text-xs bg-white p-2.5 rounded-lg border-2 border-black text-gray-800 font-medium">
                  <span className="text-gray-900 font-black block mb-0.5">Customer Note:</span>
=======
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
>>>>>>> origin/main
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
<<<<<<< HEAD
                className="py-3 px-4 rounded-xl border-2 border-black bg-red-200 hover:bg-red-300 text-black font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <XCircle size={16} /> Decline
              </button>
              <button
                type="button"
                onClick={handleAcceptJob}
                disabled={processing}
                className="py-3 px-4 rounded-xl border-2 border-black bg-emerald-400 hover:bg-emerald-500 text-black font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {processing ? <Loader2 size={16} className="animate-spin" /> : <><CheckCircle2 size={16} /> Accept Job</>}
              </button>
=======
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
>>>>>>> origin/main
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
<<<<<<< HEAD
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
=======
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-base-950/90 backdrop-blur-md"
>>>>>>> origin/main
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
<<<<<<< HEAD
            className="relative w-full max-w-lg rounded-2xl border-2 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000] overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-black">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-black" />
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-300 border-2 border-black text-xs font-black tracking-wider text-black uppercase shadow-[1px_1px_0px_0px_#000]">
=======
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
>>>>>>> origin/main
                  PAYMENT VERIFICATION REQUIRED
                </span>
              </div>
              <button
                onClick={() => {
                  setDismissedPayments((prev) => new Set(prev).add(paymentAlert.id));
                  setPaymentAlert(null);
                }}
<<<<<<< HEAD
                className="h-8 w-8 rounded-lg border-2 border-black bg-gray-100 flex items-center justify-center text-black hover:bg-red-200 transition-colors shadow-[2px_2px_0px_0px_#000]"
              >
                <X size={16} />
=======
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={18} />
>>>>>>> origin/main
              </button>
            </div>

            <div className="text-center my-3">
<<<<<<< HEAD
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-300 border-2 border-black text-black shadow-[4px_4px_0px_0px_#000]">
                <Wallet size={32} className="animate-pulse" />
              </div>
              <h2 className="text-2xl font-black text-black">Payment Received Alert</h2>
              <p className="text-xs font-bold text-gray-700 mt-1">Customer submitted UPI confirmation for this job.</p>
            </div>

            {/* Payment & UTR Summary Box */}
            <div className="rounded-xl border-2 border-black bg-emerald-100 p-5 my-5 space-y-3 shadow-[3px_3px_0px_0px_#000]">
              <div className="text-center pb-3 border-b-2 border-black">
                <p className="text-xs font-black uppercase tracking-wider text-gray-700">Total Amount Claimed</p>
                <p className="text-4xl font-black text-black mt-1">
=======
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
>>>>>>> origin/main
                  ₹{Number(paymentAlert.amount).toFixed(2)}
                </p>
              </div>

<<<<<<< HEAD
              <div className="space-y-2 text-xs pt-1">
                <div className="flex justify-between items-center bg-white p-3 rounded-lg border-2 border-black">
                  <span className="text-gray-700 text-xs uppercase font-black">12-Digit Bank UTR:</span>
                  <span className="font-mono font-black text-black text-base">
                    {paymentAlert.utr_number || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-gray-700 px-1">
=======
              <div className="space-y-2 text-sm pt-1">
                <div className="flex justify-between items-center bg-base-900/80 p-2.5 rounded-xl border border-white/10">
                  <span className="text-gray-400 text-xs uppercase font-mono">12-Digit Bank UTR:</span>
                  <span className="font-mono font-bold text-neon-cyan tracking-wider text-base">
                    {paymentAlert.utr_number || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-400 px-1">
>>>>>>> origin/main
                  <span>Timestamp:</span>
                  <span>{new Date(paymentAlert.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>

<<<<<<< HEAD
            <p className="text-xs font-bold text-gray-700 text-center mb-6">
=======
            <p className="text-xs text-gray-400 text-center mb-6">
>>>>>>> origin/main
              Please check your UPI app / SMS alert for this transaction. Did you receive this payment?
            </p>

            {/* Confirm / Reject Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleRejectPayment}
                disabled={processing}
<<<<<<< HEAD
                className="py-3 px-4 rounded-xl border-2 border-black bg-red-200 hover:bg-red-300 text-black font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <XCircle size={16} /> No, Not Received
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={processing}
                className="py-3 px-4 rounded-xl border-2 border-black bg-emerald-400 hover:bg-emerald-500 text-black font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {processing ? <Loader2 size={16} className="animate-spin" /> : <><CheckCircle2 size={16} /> Yes, Received</>}
              </button>
=======
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
>>>>>>> origin/main
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
