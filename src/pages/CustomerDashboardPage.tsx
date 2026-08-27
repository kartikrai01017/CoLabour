import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar, MapPin, Wallet, Clock, Loader2, ArrowRight, Briefcase, CheckCircle,
  Receipt, AlertCircle, Eye, X, Star, Check, Sparkles, Navigation, Wrench,
  Zap, Hammer, ShieldCheck, Phone, MessageSquare
} from 'lucide-react';
import { CATEGORY_ICONS, getCategoryStyle } from '@/lib/categories';
import { useCustomerDashboard } from '@/hooks/useCustomerDashboard';
import { CoLabourPrinterEngine } from '@/components/CoLabourPrinterEngine';
import type { Booking } from '@/lib/supabase';

interface BookingWithWorker extends Booking {
  worker?: { id: string; category: string; hourly_rate: number; users?: { name: string } | null } | null;
}

const FEATURED_RECOMMENDATIONS = [
  { id: '1', name: 'Rajesh Kumar', category: 'Plumber', rating: 4.9, reviews: 34, rate: 350, available: true },
  { id: '2', name: 'Amit Sharma', category: 'Electrician', rating: 4.8, reviews: 29, rate: 400, available: true },
  { id: '3', name: 'Suresh Patel', category: 'Carpenter', rating: 4.9, reviews: 42, rate: 450, available: true },
];

export function CustomerDashboardPage() {
  const {
    user, authLoading, loading,
    selectedSlip, setSelectedSlip,
    activeBookings, completedBookings, totalSpent, pendingPayments, payments,
  } = useCustomerDashboard();

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4EFE6] pt-16">
        <div className="rounded-2xl border-2 border-black bg-white p-6 shadow-[4px_4px_0px_#000000] flex items-center gap-3">
          <Loader2 size={24} className="animate-spin text-[#F59E0B]" />
          <span className="font-black text-sm uppercase">Loading Customer Command Center...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-neutral-900 font-sans pt-20 pb-16 px-3 sm:px-6 lg:px-8 selection:bg-[#F59E0B] selection:text-black">
      <div className="mx-auto max-w-7xl">
        
        {/* ========================================================================= */}
        {/* 1. TOP HEADER BANNER (Inspired by Screenshot's Welcome Box) */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border-2 sm:border-[2.5px] border-black bg-white p-5 sm:p-6 shadow-[6px_6px_0px_#000000] mb-6 flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-black bg-[#F59E0B] shadow-[2px_2px_0px_#000000] flex-shrink-0">
              <Sparkles size={28} className="text-black stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-3xl font-black uppercase tracking-tight text-neutral-900">
                  Welcome Back, <span className="text-[#F59E0B]">{user?.name ?? 'Customer'}</span>!
                </h1>
                <span className="rounded-md border border-black bg-[#BBF7D0] px-2 py-0.5 text-[10px] font-black text-[#15803D] uppercase shadow-[1px_1px_0px_#000000]">
                  ACTIVE BUYER
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-neutral-600">
                Book verified local technicians with 0% platform commission via direct UPI.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/workers">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                className="rounded-2xl border-2 border-black bg-[#F59E0B] hover:bg-[#E68A00] px-5 py-2.5 text-xs font-black uppercase text-black shadow-[3px_3px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Briefcase size={15} />
                <span>Book a Worker</span>
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* ========================================================================= */}
        {/* 2. TELEMETRY STAT CARDS */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          
          <div className="rounded-3xl border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-neutral-500">Active Bookings</span>
              <span className="rounded border border-black bg-[#FED7AA] px-1.5 py-0.5 text-[9px] font-black text-[#C2410C]">LIVE</span>
            </div>
            <p className="text-3xl font-black text-neutral-900 font-mono my-2">{activeBookings.length}</p>
            <span className="text-[10px] font-bold text-neutral-500">Scheduled / In-progress</span>
          </div>

          <div className="rounded-3xl border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-neutral-500">Completed & Paid</span>
              <span className="rounded border border-black bg-[#BBF7D0] px-1.5 py-0.5 text-[9px] font-black text-[#15803D]">SETTLED</span>
            </div>
            <p className="text-3xl font-black text-neutral-900 font-mono my-2">{completedBookings.length}</p>
            <span className="text-[10px] font-bold text-neutral-500">Official POS Slips Issued</span>
          </div>

          <div className="rounded-3xl border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-neutral-500">Total Spent</span>
              <span className="rounded border border-black bg-[#FEF3C7] px-1.5 py-0.5 text-[9px] font-black text-neutral-800">100% P2P</span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-neutral-900 font-mono my-2">
              ₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
            </p>
            <span className="text-[10px] font-bold text-neutral-500">Direct to worker UPI</span>
          </div>

          <div className="rounded-3xl border-2 border-black bg-[#F59E0B] p-5 shadow-[4px_4px_0px_#000000] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-black">Pending Actions</span>
              <span className="rounded border border-black bg-white px-1.5 py-0.5 text-[9px] font-black text-black">ALERTS</span>
            </div>
            <p className="text-3xl font-black text-black font-mono my-2">{pendingPayments.length}</p>
            <span className="text-[10px] font-bold text-neutral-900">Awaiting payment verification</span>
          </div>

        </div>

        {/* Pending Payments Alert Callout */}
        {pendingPayments.length > 0 && (
          <div className="rounded-3xl border-2 sm:border-[2.5px] border-black bg-[#FEF3C7] p-4 sm:p-5 shadow-[5px_5px_0px_#000000] mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle size={22} className="text-[#C2410C] stroke-[2.5] flex-shrink-0 animate-bounce" />
              <div>
                <p className="text-xs sm:text-sm font-black uppercase text-neutral-900">
                  You have {pendingPayments.length} pending payment action(s)
                </p>
                <p className="text-xs font-semibold text-neutral-600">
                  Complete your direct UPI transfer to confirm your worker dispatch and print your slip.
                </p>
              </div>
            </div>

            {pendingPayments[0] && (
              <Link to={`/payment/${pendingPayments[0].booking_id}`}>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  className="rounded-xl border-2 border-black bg-[#15803D] hover:bg-[#166534] px-4 py-2 text-xs font-black uppercase text-white shadow-[2px_2px_0px_#000000] cursor-pointer flex items-center gap-1.5"
                >
                  <span>Open Payment Gateway</span>
                  <ArrowRight size={14} className="stroke-[3]" />
                </motion.button>
              </Link>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. MAIN DASHBOARD SPLIT: ACTIVE PROJECTS & UPCOMING TICKETS */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (col-7): Active Projects & Recommended Workers */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Active Bookings Card (Matching Screenshot's "Active Project" Container) */}
            <div className="rounded-3xl border-2 sm:border-[2.5px] border-black bg-white p-5 sm:p-6 shadow-[6px_6px_0px_#000000]">
              <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-black">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-black stroke-[2.5]" />
                  <h2 className="text-base sm:text-lg font-black uppercase text-neutral-900">
                    Active Projects & Dispatches
                  </h2>
                </div>
                {activeBookings.length > 0 && (
                  <span className="rounded-full bg-[#F59E0B] text-black px-2.5 py-0.5 text-xs font-black">
                    {activeBookings.length}
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {activeBookings.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center bg-[#FAF7F2]">
                    <p className="text-xs font-bold text-neutral-500 mb-3">No active bookings right now.</p>
                    <Link to="/workers">
                      <button
                        type="button"
                        className="rounded-xl border border-black bg-[#F59E0B] px-4 py-2 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000] cursor-pointer"
                      >
                        Browse Worker Radar
                      </button>
                    </Link>
                  </div>
                ) : (
                  activeBookings.map((booking) => (
                    <BookingItemCard key={booking.id} booking={booking} />
                  ))
                )}
              </div>
            </div>

            {/* Recommended Workers Carousel/Grid (Matching Screenshot's "Recommended Workers" Section) */}
            <div className="rounded-3xl border-2 sm:border-[2.5px] border-black bg-white p-5 sm:p-6 shadow-[6px_6px_0px_#000000]">
              <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-black">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-[#F59E0B] stroke-[2.5]" />
                  <h3 className="text-base font-black uppercase text-neutral-900">
                    Recommended Workers (AI-Matched)
                  </h3>
                </div>
                <Link to="/workers" className="text-xs font-black uppercase text-[#C2410C] hover:underline">
                  View All &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {FEATURED_RECOMMENDATIONS.map((pro) => (
                  <div
                    key={pro.id}
                    className="rounded-2xl border-2 border-black bg-[#FAF7F2] p-3.5 shadow-[3px_3px_0px_#000000] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="rounded border border-black bg-[#BBF7D0] px-1.5 py-0.5 text-[8px] font-black text-[#15803D] uppercase">
                          AVAILABLE NOW
                        </span>
                        <div className="flex items-center gap-0.5 text-xs font-black text-neutral-800">
                          <Star size={11} className="fill-[#F59E0B] text-[#F59E0B]" />
                          <span>{pro.rating}</span>
                        </div>
                      </div>

                      <h4 className="font-black text-xs text-neutral-900">{pro.name}</h4>
                      <p className="text-[10px] font-bold text-neutral-500">{pro.category}</p>
                      <p className="text-xs font-black text-neutral-900 font-mono mt-1">₹{pro.rate}/hr</p>
                    </div>

                    <Link to="/workers" className="mt-3">
                      <button
                        type="button"
                        className="w-full rounded-xl border border-black bg-[#F59E0B] hover:bg-[#E68A00] py-1.5 text-[10px] font-black uppercase text-black shadow-[1px_1px_0px_#000000] cursor-pointer"
                      >
                        Book Now
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column (col-5): Past Bookings & Official POS Slips */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* History & Official Slips */}
            <div className="rounded-3xl border-2 sm:border-[2.5px] border-black bg-white p-5 sm:p-6 shadow-[6px_6px_0px_#000000]">
              <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-black">
                <h3 className="font-black text-sm uppercase text-neutral-900 flex items-center gap-1.5">
                  <Receipt size={16} className="text-[#0369A1] stroke-[2.5]" />
                  History & Official POS Slips
                </h3>
              </div>

              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {completedBookings.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-neutral-300 p-6 text-center bg-[#FAF7F2]">
                    <p className="text-xs font-bold text-neutral-500">No completed bookings yet.</p>
                  </div>
                ) : (
                  completedBookings.map((booking) => {
                    const p = payments.find((pay) => pay.booking_id === booking.id);
                    return (
                      <div
                        key={booking.id}
                        className="rounded-2xl border-2 border-black bg-[#FAF7F2] p-3.5 shadow-[3px_3px_0px_#000000] flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-black text-xs text-neutral-900">
                              {booking.worker?.users?.name ?? 'Professional Worker'}
                            </p>
                            <p className="text-[10px] font-bold text-neutral-500">
                              {booking.category} • {new Date(booking.scheduled_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="font-mono font-black text-xs text-neutral-900">
                            ₹{Number(booking.total_amount).toFixed(0)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-dashed border-neutral-300">
                          <span className="inline-flex items-center gap-1 text-[10px] font-black text-[#15803D] uppercase">
                            <CheckCircle size={12} /> Settled
                          </span>
                          
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            type="button"
                            onClick={() => setSelectedSlip({ booking, payment: p })}
                            className="rounded-lg border border-black bg-white hover:bg-neutral-100 px-3 py-1 text-[10px] font-black uppercase text-black shadow-[1px_1px_0px_#000000] cursor-pointer flex items-center gap-1"
                          >
                            <Eye size={12} />
                            <span>View Slip</span>
                          </motion.button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Quick Category Shortcuts */}
            <div className="rounded-3xl border-2 sm:border-[2.5px] border-black bg-[#FEF3C7] p-5 shadow-[5px_5px_0px_#000000]">
              <h4 className="text-xs font-black uppercase text-neutral-900 mb-3 flex items-center gap-1.5">
                ⚡ Quick Bookings Radar
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <Link to="/workers?category=Plumber">
                  <button type="button" className="w-full rounded-xl border border-black bg-white hover:bg-neutral-100 p-2.5 text-[11px] font-black uppercase text-black shadow-[1px_1px_0px_#000000] text-left">
                    🔧 Plumbers
                  </button>
                </Link>
                <Link to="/workers?category=Electrician">
                  <button type="button" className="w-full rounded-xl border border-black bg-white hover:bg-neutral-100 p-2.5 text-[11px] font-black uppercase text-black shadow-[1px_1px_0px_#000000] text-left">
                    ⚡ Electricians
                  </button>
                </Link>
                <Link to="/workers?category=Carpenter">
                  <button type="button" className="w-full rounded-xl border border-black bg-white hover:bg-neutral-100 p-2.5 text-[11px] font-black uppercase text-black shadow-[1px_1px_0px_#000000] text-left">
                    🪚 Carpenters
                  </button>
                </Link>
                <Link to="/workers?category=Painter">
                  <button type="button" className="w-full rounded-xl border border-black bg-white hover:bg-neutral-100 p-2.5 text-[11px] font-black uppercase text-black shadow-[1px_1px_0px_#000000] text-left">
                    🎨 Painters
                  </button>
                </Link>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. MODALS: SLIP PRINTER ENGINE */}
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
              workerName={selectedSlip.booking.worker?.users?.name ?? 'Professional Worker'}
              workerSkill={selectedSlip.booking.category}
              customerName={user?.name ?? 'Verified Customer'}
              date={selectedSlip.payment?.paid_at || selectedSlip.booking.scheduled_at}
              utrNumber={selectedSlip.payment?.utr_number || 'UPI-OFFICIAL-UTR'}
              totalAmount={Number(selectedSlip.booking.total_amount)}
              onDone={() => setSelectedSlip(null)}
            />
          </div>
        </div>
      )}

    </div>
  );
}

function BookingItemCard({ booking }: { booking: BookingWithWorker }) {
  const Icon = CATEGORY_ICONS[booking.category] ?? Briefcase;
  const style = getCategoryStyle(booking.category);

  return (
    <div className="rounded-2xl border-2 border-black bg-[#FAF7F2] p-4 shadow-[3px_3px_0px_#000000] flex flex-col justify-between gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className={`h-11 w-11 rounded-xl border border-black ${style.bg} flex items-center justify-center flex-shrink-0`}>
            <Icon className={style.text} size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm text-neutral-900">
                {booking.worker?.users?.name ?? 'Assigned Worker'}
              </h3>
              <span className="rounded border border-black bg-[#BBF7D0] px-1.5 py-0.5 text-[8px] font-black text-[#15803D] uppercase">
                VERIFIED
              </span>
            </div>
            <p className="text-xs font-bold text-neutral-600 mt-0.5">
              {booking.category} • ₹{booking.worker?.hourly_rate ?? 350}/hr
            </p>
          </div>
        </div>

        <span className="rounded-xl border border-black bg-white px-3 py-1 text-xs font-black font-mono">
          ₹{Number(booking.total_amount).toFixed(0)}
        </span>
      </div>

      {/* Details box */}
      <div className="space-y-1 text-xs text-neutral-600 bg-white border border-black rounded-xl p-2.5">
        <div className="flex items-center gap-1.5">
          <Calendar size={12} className="text-neutral-500" />
          <span>{new Date(booking.scheduled_at).toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin size={12} className="text-neutral-500" />
          <span className="truncate">{booking.address}</span>
        </div>
      </div>

      {/* Action triggers */}
      <div className="pt-1">
        {booking.status === 'pending' && (
          <Link to={`/payment/${booking.id}`} className="block">
            <button
              type="button"
              className="w-full rounded-xl border-2 border-black bg-[#FEF3C7] hover:bg-[#FDE68A] py-2 text-xs font-black uppercase text-neutral-900 shadow-[2px_2px_0px_#000000] cursor-pointer flex items-center justify-center gap-1"
            >
              <span>Waiting for Worker Acceptance &rarr;</span>
            </button>
          </Link>
        )}

        {booking.status === 'confirmed' && (
          <Link to={`/payment/${booking.id}`} className="block">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              className="w-full rounded-xl border-2 border-black bg-[#F59E0B] hover:bg-[#E68A00] py-2 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000] cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Wallet size={14} />
              <span>Pay Worker via UPI</span>
              <ArrowRight size={14} className="stroke-[3]" />
            </motion.button>
          </Link>
        )}

        {booking.status === 'payment_submitted' && (
          <Link to={`/payment/${booking.id}`} className="block">
            <button
              type="button"
              className="w-full rounded-xl border-2 border-black bg-[#E0F2FE] hover:bg-[#BAE6FD] py-2 text-xs font-black uppercase text-[#0369A1] shadow-[2px_2px_0px_#000000] cursor-pointer flex items-center justify-center gap-1"
            >
              <span>Track Worker Settlement &rarr;</span>
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}

