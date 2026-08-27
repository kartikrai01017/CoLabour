import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet, Clock, CheckCircle, XCircle, Bell, Briefcase, Star,
  Check, Loader2, MapPin, Calendar, AlertCircle, Settings, ShieldCheck,
  Receipt, Eye, X, Navigation, Radio, ArrowRight, RefreshCw, Zap
} from 'lucide-react';
import { Toast } from '@/components/ui/Toast';
import { CATEGORY_ICONS, getCategoryStyle } from '@/lib/categories';
import { useWorkerDashboard } from '@/hooks/useWorkerDashboard';
import { CoLabourPrinterEngine } from '@/components/CoLabourPrinterEngine';
import type { Booking, Payment } from '@/lib/supabase';

interface BookingWithCustomer extends Booking {
  customer?: { name: string; phone: string } | null;
}

interface PaymentWithBooking extends Payment {
  bookings?: { customer_id: string; address: string } | null;
}

export function WorkerDashboardPage() {
  const {
    user, workerProfile, authLoading, loading, navigate,
    confirmingId, showSettings, setShowSettings,
    selectedSlip, setSelectedSlip,
    upiId, setUpiId, hourlyRate, setHourlyRate,
    savingSettings, settingsMsg, toastMsg,
    totalEarnings, pendingPayments, activeBookings, completedJobs,
    handleConfirmPayment, handleUpdateBookingStatus, handleSaveSettings,
  } = useWorkerDashboard();

  // Skeuomorphic toggle state for worker active availability
  const [isAvailable, setIsAvailable] = useState(true);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4EFE6] pt-16">
        <div className="rounded-2xl border-2 border-black bg-white p-6 shadow-[4px_4px_0px_#000000] flex items-center gap-3">
          <Loader2 size={24} className="animate-spin text-[#F59E0B]" />
          <span className="font-black text-sm uppercase">Loading Worker Command Center...</span>
        </div>
      </div>
    );
  }

  if (!workerProfile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F4EFE6] pt-16 gap-4 p-4 text-center">
        <div className="rounded-3xl border-2 border-black bg-white p-8 shadow-[6px_6px_0px_#000000] max-w-md">
          <AlertCircle className="text-[#F59E0B] mx-auto mb-3" size={40} />
          <h2 className="text-xl font-black uppercase text-neutral-900">Worker Profile Incomplete</h2>
          <p className="text-xs text-neutral-600 font-medium my-3">
            Please complete your registration details to start accepting jobs and direct UPI payouts.
          </p>
          <button
            type="button"
            onClick={() => navigate('/signup')}
            className="rounded-xl border-2 border-black bg-[#F59E0B] px-6 py-2.5 text-xs font-black uppercase shadow-[2px_2px_0px_#000000] cursor-pointer"
          >
            Complete Registration
          </button>
        </div>
      </div>
    );
  }

  const Icon = CATEGORY_ICONS[workerProfile.category] ?? Briefcase;
  const style = getCategoryStyle(workerProfile.category);

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-neutral-900 font-sans pt-20 pb-16 px-3 sm:px-6 lg:px-8 selection:bg-[#F59E0B] selection:text-black">
      <Toast message={toastMsg} />

      <div className="mx-auto max-w-7xl">
        
        {/* ========================================================================= */}
        {/* 1. TOP HEADER & WORKER BADGE BAR */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border-2 sm:border-[2.5px] border-black bg-white p-4 sm:p-6 shadow-[6px_6px_0px_#000000] mb-6 flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <div className={`h-14 w-14 rounded-2xl border-2 border-black ${style.bg} flex items-center justify-center shadow-[2px_2px_0px_#000000] flex-shrink-0`}>
              <Icon className={style.text} size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900">
                  {user?.name ?? 'Worker Pro'}
                </h1>
                <span className="rounded-md border border-black bg-[#BBF7D0] px-2 py-0.5 text-[10px] font-black text-[#15803D] uppercase shadow-[1px_1px_0px_#000000]">
                  {workerProfile.is_verified ? 'VERIFIED' : 'PENDING'}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-neutral-600">
                {workerProfile.category} • UPI: <span className="font-mono text-black font-black">{workerProfile.upi_id}</span> • ₹{workerProfile.hourly_rate}/hr
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => setShowSettings(true)}
              className="rounded-xl border-2 border-black bg-white hover:bg-neutral-100 px-4 py-2 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Settings size={14} />
              <span>Settings</span>
            </motion.button>
          </div>
        </motion.div>

        {/* ========================================================================= */}
        {/* 2. SKEUOMORPHIC AVAILABILITY SWITCH & TELEMETRY ROW */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          
          {/* Big Tactile Availability Status Switch (Directly Inspired by Screenshot) */}
          <div className="lg:col-span-6 rounded-3xl border-2 sm:border-[2.5px] border-black bg-white p-6 shadow-[6px_6px_0px_#000000] flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-neutral-300">
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-neutral-900">
                Availability Status
              </h2>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000000] ${
                isAvailable ? 'bg-[#BBF7D0] text-[#15803D]' : 'bg-[#FECACA] text-[#B91C1C]'
              }`}>
                {isAvailable ? 'DISPATCH ON' : 'PAUSED'}
              </span>
            </div>

            {/* Tactile 3D Switch Chassis */}
            <div className="my-5 flex items-center justify-between gap-4 bg-[#F4EFE6] border-2 border-black rounded-2xl p-4 shadow-inner">
              {/* Toggle Switch Component */}
              <button
                type="button"
                onClick={() => setIsAvailable(!isAvailable)}
                className={`relative flex h-14 w-32 items-center rounded-full border-2 border-black p-1.5 transition-all duration-300 shadow-[3px_3px_0px_#000000] cursor-pointer ${
                  isAvailable ? 'bg-[#84B082]' : 'bg-[#E2E8F0]'
                }`}
              >
                <motion.div
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={`h-10 w-10 rounded-full border-2 border-black bg-white shadow-md flex items-center justify-center font-black text-xs ${
                    isAvailable ? 'ml-auto text-[#1B4332]' : 'mr-auto text-neutral-500'
                  }`}
                >
                  {isAvailable ? 'ON' : 'OFF'}
                </motion.div>
              </button>

              <div className="text-right space-y-1">
                <span className={`inline-block rounded-md border border-black px-2.5 py-1 text-xs font-black uppercase shadow-[1px_1px_0px_#000000] ${
                  isAvailable ? 'bg-[#A3C9A8] text-black' : 'bg-neutral-200 text-neutral-600'
                }`}>
                  {isAvailable ? 'ON (Active)' : 'OFF (Paused)'}
                </span>
                <p className="text-[11px] font-medium text-neutral-500">
                  {isAvailable ? 'Visible to nearby customers in radar' : 'Hidden from instant booking dispatch'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-bold text-neutral-600">
              <span>Geo-radar broadcast active</span>
              <span className="text-[#15803D] font-mono font-black">99.8% Uptime</span>
            </div>
          </div>

          {/* Telemetry Metric Cards */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Total Earnings */}
            <div className="rounded-3xl border-2 border-black bg-white p-5 shadow-[5px_5px_0px_#000000] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-neutral-500">Total Earnings</span>
                <span className="rounded border border-black bg-[#FEF3C7] px-1.5 py-0.5 text-[9px] font-black">YTD</span>
              </div>
              <p className="text-2xl font-black text-neutral-900 font-mono my-2">
                ₹{totalEarnings.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
              </p>
              <span className="text-[10px] font-bold text-neutral-500">Direct UPI Settled</span>
            </div>

            {/* Completed Jobs */}
            <div className="rounded-3xl border-2 border-black bg-white p-5 shadow-[5px_5px_0px_#000000] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-neutral-500">Completed</span>
                <span className="rounded border border-black bg-[#BBF7D0] px-1.5 py-0.5 text-[9px] font-black text-[#15803D]">JOBS</span>
              </div>
              <p className="text-3xl font-black text-neutral-900 font-mono my-2">
                {completedJobs.length}
              </p>
              <span className="text-[10px] font-bold text-neutral-500">100% On-time</span>
            </div>

            {/* Average Rating */}
            <div className="rounded-3xl border-2 border-black bg-white p-5 shadow-[5px_5px_0px_#000000] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-neutral-500">Rating</span>
                <span className="rounded border border-black bg-[#FED7AA] px-1.5 py-0.5 text-[9px] font-black text-[#C2410C]">PRO</span>
              </div>
              <div className="my-2">
                <div className="text-3xl font-black text-neutral-900 flex items-center gap-1">
                  {Number(workerProfile.rating ?? 5.0).toFixed(1)}
                  <Star size={16} className="fill-[#F59E0B] text-[#F59E0B]" />
                </div>
              </div>
              <span className="text-[10px] font-bold text-neutral-500">{workerProfile.total_ratings ?? 0} reviews</span>
            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* 3. MAIN DASHBOARD CONTENT: JOB DISPATCHES & SETTLEMENTS */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (col-7): Active Requests & Upcoming Schedule */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Active Requests Card */}
            <div className="rounded-3xl border-2 sm:border-[2.5px] border-black bg-white p-5 sm:p-6 shadow-[6px_6px_0px_#000000]">
              <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-black">
                <div className="flex items-center gap-2">
                  <Bell size={18} className="text-black stroke-[2.5]" />
                  <h2 className="text-base sm:text-lg font-black uppercase text-neutral-900">
                    Active Job Requests & Dispatches
                  </h2>
                </div>
                {activeBookings.length > 0 && (
                  <span className="rounded-full bg-[#F59E0B] text-black px-2.5 py-0.5 text-xs font-black">
                    {activeBookings.length}
                  </span>
                )}
              </div>

              <div className="space-y-3.5">
                {activeBookings.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center bg-[#FAF7F2]">
                    <p className="text-xs font-bold text-neutral-500">No pending job requests right now.</p>
                  </div>
                ) : (
                  activeBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="rounded-2xl border-2 border-black bg-[#FAF7F2] p-4 shadow-[3px_3px_0px_#000000] flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-sm text-neutral-900">
                              {booking.customer?.name ?? 'Customer Booking'}
                            </h3>
                            <span className="rounded-md border border-black bg-[#FED7AA] px-2 py-0.5 text-[9px] font-black text-[#C2410C] uppercase">
                              {booking.status === 'confirmed' ? 'ACCEPTED' : booking.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-neutral-600 mt-0.5">
                            {booking.category} • ₹{Number(booking.total_amount).toFixed(0)}
                          </p>
                        </div>

                        <span className="rounded-xl border border-black bg-white px-3 py-1 text-xs font-black font-mono">
                          ₹{Number(booking.total_amount).toFixed(0)}
                        </span>
                      </div>

                      {/* Details row */}
                      <div className="space-y-1 text-xs text-neutral-600 bg-white border border-black rounded-xl p-2.5">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-neutral-500" />
                          <span>{new Date(booking.scheduled_at).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin size={12} className="text-neutral-500" />
                          <span className="truncate">{booking.address}</span>
                        </div>
                        {booking.notes && (
                          <p className="text-[11px] text-neutral-500 italic mt-1">
                            Note: "{booking.notes}"
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-1">
                        {booking.status === 'pending' && (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.96 }}
                              type="button"
                              onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                              className="flex-1 rounded-xl border-2 border-black bg-[#F59E0B] hover:bg-[#E68A00] py-2 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000] cursor-pointer flex items-center justify-center gap-1"
                            >
                              <Check size={14} className="stroke-[3]" />
                              <span>Accept Job</span>
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.96 }}
                              type="button"
                              onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                              className="rounded-xl border-2 border-black bg-[#FEE2E2] hover:bg-[#FECACA] px-4 py-2 text-xs font-black uppercase text-red-700 shadow-[2px_2px_0px_#000000] cursor-pointer"
                            >
                              Decline
                            </motion.button>
                          </>
                        )}

                        {booking.status === 'confirmed' && (
                          <div className="flex items-center justify-between w-full">
                            <span className="text-xs font-bold text-[#15803D]">
                              Job In-Progress • Direct UPI Mode
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.96 }}
                              type="button"
                              onClick={() => handleUpdateBookingStatus(booking.id, 'completed')}
                              className="rounded-xl border-2 border-black bg-[#A3C9A8] hover:bg-[#86EFAC] px-4 py-2 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000] cursor-pointer flex items-center gap-1"
                            >
                              <CheckCircle size={14} />
                              <span>Mark Complete</span>
                            </motion.button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Upcoming Bookings Perforated Ticket Strips (Inspired by Screenshot) */}
            <div className="rounded-3xl border-2 sm:border-[2.5px] border-black bg-[#FEF3C7] p-5 sm:p-6 shadow-[6px_6px_0px_#000000]">
              <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-black">
                <h3 className="font-black text-sm uppercase text-neutral-900 flex items-center gap-1.5">
                  🎟 Upcoming Schedule Tickets
                </h3>
                <span className="rounded border border-black bg-white px-2 py-0.5 text-[10px] font-black">
                  TICKETS
                </span>
              </div>

              <div className="space-y-2.5">
                {completedJobs.slice(0, 3).map((job, idx) => (
                  <div
                    key={job.id}
                    className="rounded-xl border-2 border-dashed border-black bg-white p-3 shadow-[2px_2px_0px_#000000] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-[#C2410C]" />
                      <span className="text-xs font-black text-neutral-900">
                        {job.category} ({job.customer?.name ?? 'Customer'})
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-neutral-600">
                      ₹{Number(job.total_amount).toFixed(0)} • Settled
                    </span>
                  </div>
                ))}
                {completedJobs.length === 0 && (
                  <p className="text-xs font-medium text-neutral-600 text-center py-2">
                    Schedule tickets will appear as bookings are completed.
                  </p>
                )}
              </div>
            </div>

          </div>

          {/* Right Column (col-5): Payment Verifications & Settled POS Slips */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Payment Confirmations */}
            <div className="rounded-3xl border-2 sm:border-[2.5px] border-black bg-white p-5 sm:p-6 shadow-[6px_6px_0px_#000000]">
              <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-black">
                <h3 className="font-black text-sm uppercase text-neutral-900 flex items-center gap-1.5">
                  <Wallet size={16} className="text-[#15803D] stroke-[2.5]" />
                  Payment Confirmations
                </h3>
                {pendingPayments.length > 0 && (
                  <span className="rounded-full bg-[#15803D] text-white px-2 py-0.5 text-[10px] font-black animate-pulse">
                    {pendingPayments.length} NEW
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {pendingPayments.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-neutral-300 p-6 text-center bg-[#FAF7F2]">
                    <p className="text-xs font-bold text-neutral-500">No payments awaiting confirmation.</p>
                  </div>
                ) : (
                  pendingPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="rounded-2xl border-2 border-black bg-[#DCFCE7] p-4 shadow-[3px_3px_0px_#000000] space-y-2.5"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-black text-xs text-neutral-900 uppercase">Payment Received Alert</p>
                          <p className="text-[11px] font-mono font-bold text-[#15803D]">UTR: {payment.utr_number}</p>
                        </div>
                        <span className="text-sm font-mono font-black text-neutral-900">
                          ₹{Number(payment.amount).toFixed(2)}
                        </span>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        onClick={() => handleConfirmPayment(payment.id)}
                        disabled={confirmingId === payment.id}
                        className="w-full rounded-xl border-2 border-black bg-[#15803D] hover:bg-[#166534] py-2 text-xs font-black uppercase text-white shadow-[2px_2px_0px_#000000] cursor-pointer flex items-center justify-center gap-1"
                      >
                        {confirmingId === payment.id ? (
                          <Loader2 size={14} className="animate-spin text-white" />
                        ) : (
                          <>
                            <Check size={14} className="stroke-[3]" />
                            <span>Confirm Receipt (Print Slip)</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Settled Jobs & CoLabour POS Slips */}
            <div className="rounded-3xl border-2 sm:border-[2.5px] border-black bg-white p-5 sm:p-6 shadow-[6px_6px_0px_#000000]">
              <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-black">
                <h3 className="font-black text-sm uppercase text-neutral-900 flex items-center gap-1.5">
                  <Receipt size={16} className="text-[#0369A1] stroke-[2.5]" />
                  Settled Jobs & CoLabour Slips
                </h3>
              </div>

              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {completedJobs.length === 0 ? (
                  <p className="text-xs text-neutral-500 text-center py-4">No settled jobs yet.</p>
                ) : (
                  completedJobs.slice(0, 6).map((job) => (
                    <div
                      key={job.id}
                      className="rounded-xl border-2 border-black bg-[#FAF7F2] p-3 shadow-[2px_2px_0px_#000000] flex items-center justify-between"
                    >
                      <div>
                        <p className="font-black text-xs text-neutral-900">
                          {job.customer?.name ?? 'Customer Booking'}
                        </p>
                        <p className="text-[10px] font-bold text-neutral-500">
                          {job.category} • ₹{Number(job.total_amount).toFixed(0)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedSlip({ booking: job })}
                        className="rounded-lg border border-black bg-white hover:bg-neutral-100 px-2.5 py-1 text-[10px] font-black uppercase text-black shadow-[1px_1px_0px_#000000] cursor-pointer flex items-center gap-1"
                      >
                        <Eye size={12} />
                        <span>Slip</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. MODALS: SLIP & SETTINGS */}
      {/* ========================================================================= */}
      {selectedSlip && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
          onClick={() => setSelectedSlip(null)}
        >
          <div className="relative w-full max-w-md my-8" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedSlip(null)}
              className="absolute top-2 right-2 z-20 rounded-full border-2 border-black bg-white p-2 text-black hover:bg-neutral-100 shadow-[2px_2px_0px_#000000]"
            >
              <X size={16} />
            </button>
            <CoLabourPrinterEngine
              bookingId={selectedSlip.booking.id}
              workerName={user?.name ?? 'Professional'}
              workerSkill={selectedSlip.booking.category}
              workerUpiId={workerProfile.upi_id}
              customerName={selectedSlip.booking.customer?.name ?? 'Verified Customer'}
              date={selectedSlip.payment?.paid_at || selectedSlip.booking.scheduled_at}
              utrNumber={selectedSlip.payment?.utr_number || 'OFFICIAL-PAID-UTR'}
              totalAmount={Number(selectedSlip.booking.total_amount)}
              onDone={() => setSelectedSlip(null)}
            />
          </div>
        </div>
      )}

      {showSettings && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border-2 sm:border-[2.5px] border-black bg-white p-6 shadow-[6px_6px_0px_#000000]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-black">
              <h2 className="text-base font-black uppercase text-neutral-900">Worker Settings</h2>
              <button onClick={() => setShowSettings(false)} className="text-neutral-500 hover:text-black">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-neutral-800 mb-1">Direct UPI ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full rounded-xl border-2 border-black bg-[#FAF7F2] px-4 py-2.5 text-xs font-mono font-bold text-neutral-900 outline-none shadow-[2px_2px_0px_#000000]"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-neutral-800 mb-1">Hourly Rate (₹)</label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  className="w-full rounded-xl border-2 border-black bg-[#FAF7F2] px-4 py-2.5 text-xs font-black text-neutral-900 outline-none shadow-[2px_2px_0px_#000000]"
                />
              </div>

              {settingsMsg && (
                <p className={`text-xs font-bold ${settingsMsg.includes('success') ? 'text-[#15803D]' : 'text-red-600'}`}>
                  {settingsMsg}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                  className="flex-1 rounded-xl border-2 border-black bg-[#F59E0B] hover:bg-[#E68A00] py-2.5 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000] cursor-pointer flex items-center justify-center gap-1"
                >
                  {savingSettings ? <Loader2 size={14} className="animate-spin" /> : 'Save Changes'}
                </motion.button>
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="rounded-xl border-2 border-black bg-white px-4 py-2.5 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000] hover:bg-neutral-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

