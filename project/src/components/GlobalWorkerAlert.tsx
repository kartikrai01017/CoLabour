import { useState, useEffect } from 'react';
import { Radio, Check, X, MapPin, Wallet } from 'lucide-react';
import { supabase, type Booking } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface BookingWithCustomer extends Booking {
  customer?: { name: string; phone: string } | null;
}

export function GlobalWorkerAlert() {
  const { workerProfile } = useAuth();
  const [incomingJob, setIncomingJob] = useState<BookingWithCustomer | null>(null);
  const [incomingPayment, setIncomingPayment] = useState<{
    bookingId: string;
    paymentId: string;
    customerName: string;
    amount: number;
    utr: string;
  } | null>(null);

  useEffect(() => {
    if (!workerProfile) return;

    // Supabase Realtime Channel: Listen for new bookings & payment submissions
    const channel = supabase
      .channel('global-worker-alerts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bookings', filter: `worker_id=eq.${workerProfile.id}` },
        async (payload) => {
          if (payload.new && payload.new.status === 'pending') {
            const { data } = await supabase
              .from('bookings')
              .select('*, customer:users!bookings_customer_id_fkey(name, phone)')
              .eq('id', payload.new.id)
              .maybeSingle();

            if (data) setIncomingJob(data as BookingWithCustomer);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `worker_id=eq.${workerProfile.id}` },
        async (payload) => {
          if (payload.new && payload.new.status === 'payment_submitted') {
            const { data: pay } = await supabase
              .from('payments')
              .select('*')
              .eq('booking_id', payload.new.id)
              .maybeSingle();

            const { data: cust } = await supabase
              .from('users')
              .select('name')
              .eq('id', payload.new.customer_id)
              .maybeSingle();

            if (pay) {
              setIncomingPayment({
                bookingId: payload.new.id,
                paymentId: pay.id,
                customerName: cust?.name || 'Customer',
                amount: Number(pay.amount),
                utr: pay.utr_number || 'Submitted via UPI',
              });
            }
          }
        }
      )
      .subscribe();

    // Fallback active poller for instant catch
    const poller = setInterval(async () => {
      // 1. Check Pending Job
      const { data: job } = await supabase
        .from('bookings')
        .select('*, customer:users!bookings_customer_id_fkey(name, phone)')
        .eq('worker_id', workerProfile.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (job && !incomingJob) setIncomingJob(job as BookingWithCustomer);

      // 2. Check Submitted Payment
      const { data: payBooking } = await supabase
        .from('bookings')
        .select('id, customer_id')
        .eq('worker_id', workerProfile.id)
        .eq('status', 'payment_submitted')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (payBooking && !incomingPayment) {
        const { data: pay } = await supabase
          .from('payments')
          .select('*')
          .eq('booking_id', payBooking.id)
          .eq('status', 'payment_submitted')
          .maybeSingle();

        const { data: cust } = await supabase
          .from('users')
          .select('name')
          .eq('id', payBooking.customer_id)
          .maybeSingle();

        if (pay) {
          setIncomingPayment({
            bookingId: payBooking.id,
            paymentId: pay.id,
            customerName: cust?.name || 'Customer',
            amount: Number(pay.amount),
            utr: pay.utr_number || 'Submitted',
          });
        }
      }
    }, 1500);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(poller);
    };
  }, [workerProfile, incomingJob, incomingPayment]);

  // Actions for Job
  const handleAcceptJob = async () => {
    if (!incomingJob) return;
    await supabase.from('bookings').update({ status: 'confirmed' }).eq('id', incomingJob.id);
    setIncomingJob(null);
  };

  const handleDeclineJob = async () => {
    if (!incomingJob) return;
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', incomingJob.id);
    setIncomingJob(null);
  };

  // Actions for Payment
  const handleConfirmPayment = async () => {
    if (!incomingPayment) return;
    await supabase
      .from('payments')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', incomingPayment.paymentId);
    await supabase
      .from('bookings')
      .update({ status: 'paid' })
      .eq('id', incomingPayment.bookingId);
    setIncomingPayment(null);
  };

  const handleRejectPayment = async () => {
    if (!incomingPayment) return;
    await supabase
      .from('payments')
      .update({ status: 'pending', utr_number: null })
      .eq('id', incomingPayment.paymentId);
    await supabase
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', incomingPayment.bookingId);
    setIncomingPayment(null);
  };

  if (!incomingJob && !incomingPayment) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4 animate-scale-in">
      
      {/* 1. FRONT SCREEN POPUP: WORK REQUEST (ACCEPT / DECLINE) */}
      {incomingJob && (
        <div className="relative w-full max-w-lg rounded-[38px] border-2 border-emerald-400 bg-gradient-to-b from-slate-900 via-slate-950 to-black p-8 text-center shadow-[0_0_90px_rgba(16,185,129,0.5)]">
          <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-400 text-black shadow-[0_0_35px_#10B981]">
              <Radio size={40} className="animate-pulse" />
            </div>
          </div>

          <span className="inline-block rounded-full bg-emerald-500/10 border border-emerald-500/30 px-4 py-1 text-xs font-mono font-bold text-emerald-400 uppercase mb-2">
            🚨 NEW INSTANT SERVICE REQUEST
          </span>

          <h2 className="text-3xl font-black text-white">{incomingJob.customer?.name || 'Customer'}</h2>
          <p className="text-sm text-cyan-400 font-semibold mt-0.5">{incomingJob.category} Service Requested</p>

          <div className="my-5 rounded-2xl bg-white/[0.04] p-4 border border-white/10 text-left space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Total Payout:</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">₹{Number(incomingJob.total_amount).toFixed(2)}</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-gray-300 border-t border-white/5 pt-2">
              <MapPin size={15} className="text-neon-emerald shrink-0 mt-0.5" />
              <span>{incomingJob.address}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDeclineJob}
              className="w-full rounded-2xl bg-slate-800 hover:bg-slate-700 py-4 text-sm font-bold text-gray-300 transition-all cursor-pointer"
            >
              Decline
            </button>
            <button
              onClick={handleAcceptJob}
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 py-4 text-sm font-black text-black shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check size={20} /> ACCEPT JOB
            </button>
          </div>
        </div>
      )}

      {/* 2. FRONT SCREEN POPUP: PAYMENT RECEIVED CONFIRMATION */}
      {incomingPayment && (
        <div className="relative w-full max-w-lg rounded-[38px] border-2 border-amber-400 bg-gradient-to-b from-slate-900 via-slate-950 to-black p-8 text-center shadow-[0_0_90px_rgba(245,158,11,0.4)]">
          <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-amber-500/30 animate-ping" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 text-black shadow-[0_0_35px_#F59E0B]">
              <Wallet size={36} />
            </div>
          </div>

          <span className="inline-block rounded-full bg-amber-500/10 border border-amber-500/30 px-4 py-1 text-xs font-mono font-bold text-amber-400 uppercase mb-2">
            💰 CUSTOMER PAID - VERIFY PAYMENT
          </span>

          <h2 className="text-3xl font-black text-white">{incomingPayment.customerName}</h2>
          <p className="text-xs text-gray-400 mt-1">Has submitted payment confirmation</p>

          <div className="my-5 rounded-2xl bg-white/[0.04] p-4 border border-white/10 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Claimed Amount:</span>
              <span className="text-3xl font-black text-emerald-400 font-mono">₹{incomingPayment.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center border-t border-white/5 pt-2 text-xs">
              <span className="text-gray-400">Transaction UTR:</span>
              <span className="font-mono text-white font-bold bg-black/50 px-2.5 py-1 rounded border border-white/10">{incomingPayment.utr}</span>
            </div>
          </div>

          <p className="text-xs text-amber-300 font-medium mb-5">Did you receive ₹{incomingPayment.amount.toFixed(2)} in your UPI account?</p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleRejectPayment}
              className="w-full rounded-2xl bg-red-600/80 hover:bg-red-600 py-4 text-sm font-bold text-white transition-all cursor-pointer"
            >
              No, Not Received
            </button>
            <button
              onClick={handleConfirmPayment}
              className="w-full rounded-2xl bg-emerald-500 hover:bg-emerald-400 py-4 text-sm font-black text-black shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check size={20} /> YES, RECEIVED
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
