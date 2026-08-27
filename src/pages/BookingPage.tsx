import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar, MapPin, Clock, ArrowLeft, ArrowRight, Loader2, AlertCircle, Navigation, Check, Radio,
  ShieldCheck, Star, Sparkles, Wrench
} from 'lucide-react';
import { CATEGORY_ICONS, getCategoryStyle } from '@/lib/categories';
import { useBookingPage } from '@/hooks/useBookingPage';
import { RadarScannerModal } from '@/components/RadarScannerModal';

export function BookingPage() {
  const {
    id, worker, loading, submitting, error,
    date, setDate, time, setTime, hours, setHours,
    address, setAddress, notes, setNotes,
    userCoords, showRadarModal, setShowRadarModal,
    totalAmount, distanceKm, reachTime,
    handleUseMyLocation, handlePreSubmit, handleConfirmBooking,
  } = useBookingPage();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4EFE6] pt-16">
        <div className="rounded-2xl border-2 border-black bg-white p-6 shadow-[4px_4px_0px_#000000] flex items-center gap-3">
          <Loader2 size={24} className="animate-spin text-[#F59E0B]" />
          <span className="font-black text-sm uppercase">Loading Booking Dispatch...</span>
        </div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F4EFE6] pt-16 gap-4 p-4 text-center">
        <div className="rounded-3xl border-2 border-black bg-white p-8 shadow-[6px_6px_0px_#000000] max-w-md">
          <AlertCircle className="text-[#F59E0B] mx-auto mb-3" size={40} />
          <h2 className="text-xl font-black uppercase text-neutral-900">Worker Not Found</h2>
          <p className="text-xs text-neutral-600 font-medium my-3">
            The requested worker profile could not be loaded.
          </p>
          <Link to="/workers">
            <button
              type="button"
              className="rounded-xl border-2 border-black bg-[#F59E0B] px-6 py-2.5 text-xs font-black uppercase shadow-[2px_2px_0px_#000000] cursor-pointer"
            >
              Browse Workers
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const Icon = CATEGORY_ICONS[worker.category] ?? Wrench;
  const style = getCategoryStyle(worker.category);

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-neutral-900 font-sans pt-20 pb-16 px-3 sm:px-6 lg:px-8 selection:bg-[#F59E0B] selection:text-black">
      
      {/* Radar Scanner Modal */}
      <RadarScannerModal
        isOpen={showRadarModal}
        workerName={worker.users?.name ?? 'Professional Worker'}
        workerCategory={worker.category}
        workerRate={worker.hourly_rate}
        workerLocation={worker.location}
        distanceKm={distanceKm}
        onConfirm={handleConfirmBooking}
        onCancel={() => setShowRadarModal(false)}
      />

      <div className="mx-auto max-w-3xl">
        
        {/* Navigation back link */}
        <Link
          to={`/workers/${id}`}
          className="mb-6 inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-white px-3.5 py-1.5 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000] hover:bg-neutral-100 transition-all"
        >
          <ArrowLeft size={14} /> Back to Profile
        </Link>

        {/* Page Title Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-900">
            Book Your <span className="text-[#F59E0B]">Appointment</span>
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-neutral-600">
            Schedule a certified trade service with {worker.users?.name}
          </p>
        </motion.div>

        {/* Worker summary & live proximity badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border-2 sm:border-[2.5px] border-black bg-white p-5 sm:p-6 shadow-[6px_6px_0px_#000000] mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className={`h-16 w-16 rounded-2xl border-2 border-black ${style.bg} flex items-center justify-center shadow-[2px_2px_0px_#000000] flex-shrink-0`}>
              <Icon className={style.text} size={30} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg text-neutral-900">{worker.users?.name}</h3>
                <span className="rounded border border-black bg-[#BBF7D0] px-1.5 py-0.5 text-[8px] font-black text-[#15803D] uppercase">
                  VERIFIED
                </span>
              </div>
              <p className="text-xs font-bold text-neutral-600">{worker.category} • ₹{worker.hourly_rate}/hr</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md border border-black bg-[#DCFCE7] px-2 py-0.5 text-[10px] font-black text-[#15803D] shadow-[1px_1px_0px_#000000]">
                  <Navigation size={10} /> {distanceKm.toFixed(1)} km away
                </span>
                <span className="text-[10px] font-bold text-neutral-500">~{reachTime} mins reach</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black font-mono text-neutral-900">₹{worker.hourly_rate}</span>
            <span className="text-xs font-bold text-neutral-500">/hr</span>
          </div>
        </motion.div>

        <form onSubmit={handlePreSubmit} className="space-y-6">
          
          {/* Section 1: Date & Time */}
          <div className="rounded-3xl border-2 sm:border-[2.5px] border-black bg-white p-5 sm:p-6 shadow-[5px_5px_0px_#000000]">
            <h2 className="text-sm sm:text-base font-black uppercase text-neutral-900 mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-[#F59E0B] stroke-[2.5]" /> Date & Time
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-black uppercase text-neutral-800 mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-xl border-2 border-black bg-[#FAF7F2] px-4 py-2.5 text-xs font-bold text-neutral-900 outline-none shadow-[2px_2px_0px_#000000] focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-neutral-800 mb-1">Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="w-full rounded-xl border-2 border-black bg-[#FAF7F2] px-4 py-2.5 text-xs font-bold text-neutral-900 outline-none shadow-[2px_2px_0px_#000000] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Duration Counter */}
            <div className="mt-4 pt-3 border-t border-dashed border-neutral-300">
              <label className="block text-xs font-black uppercase text-neutral-800 mb-1.5">Estimated Duration (hours)</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setHours(String(Math.max(1, parseInt(hours) - 1)))}
                  className="h-9 w-9 rounded-xl border-2 border-black bg-white hover:bg-neutral-100 font-black text-sm shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  min="1"
                  max="12"
                  className="h-9 w-20 rounded-xl border-2 border-black bg-[#FAF7F2] text-center font-mono font-black text-sm text-neutral-900 outline-none shadow-[2px_2px_0px_#000000]"
                />
                <button
                  type="button"
                  onClick={() => setHours(String(parseInt(hours) + 1))}
                  className="h-9 w-9 rounded-xl border-2 border-black bg-[#F59E0B] hover:bg-[#E68A00] font-black text-sm shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                >
                  +
                </button>
                <span className="text-xs font-bold text-neutral-600">hour(s)</span>
              </div>
            </div>
          </div>

          {/* Section 2: Service Location & Live GPS */}
          <div className="rounded-3xl border-2 sm:border-[2.5px] border-black bg-white p-5 sm:p-6 shadow-[5px_5px_0px_#000000]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm sm:text-base font-black uppercase text-neutral-900 flex items-center gap-2">
                <MapPin size={18} className="text-[#15803D] stroke-[2.5]" /> Service Location & Live GPS
              </h2>
              <span className="inline-flex items-center gap-1 rounded-md border border-black bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-black text-[#B45309]">
                <Radio size={11} className="animate-pulse" /> Live Radar Ready
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-black uppercase text-neutral-800 mb-1">
                  Full Address / Flat / Landmark <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  placeholder="Enter your full street address, apartment name, or landmark..."
                  className="w-full rounded-2xl border-2 border-black bg-[#FAF7F2] p-3 text-xs font-semibold text-neutral-900 placeholder-neutral-400 outline-none shadow-[2px_2px_0px_#000000] min-h-[80px] resize-none focus:bg-white transition-all"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={handleUseMyLocation}
                  className="rounded-xl border-2 border-black bg-white hover:bg-neutral-100 px-3.5 py-1.5 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000] flex items-center gap-1.5 cursor-pointer"
                >
                  <Navigation size={14} className="text-[#0369A1]" />
                  <span>Use My Current GPS Location</span>
                </motion.button>
                {userCoords && (
                  <span className="text-[11px] text-neutral-500 font-mono font-bold">
                    Lat: {userCoords.lat.toFixed(4)}, Lng: {userCoords.lng.toFixed(4)}
                  </span>
                )}
              </div>

              {/* Interactive Radar Sonar mini preview map */}
              <div className="relative h-40 rounded-2xl border-2 border-black bg-[#18181B] overflow-hidden flex items-center justify-center shadow-inner">
                {/* Sonar concentric rings */}
                <div className="absolute h-32 w-32 rounded-full border border-neutral-700 animate-ping opacity-30" />
                <div className="absolute h-20 w-20 rounded-full border border-[#F59E0B]/50" />
                <div className="absolute h-10 w-10 rounded-full border border-[#15803D]/60" />

                <div className="relative z-10 flex flex-col items-center gap-1.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F59E0B] border-2 border-black text-black shadow-[0_0_15px_#F59E0B]">
                    <Navigation size={18} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-black text-white">Live Proximity: {distanceKm.toFixed(1)} km</p>
                    <p className="text-[10px] font-bold text-neutral-400">Worker stationed near {worker.location ?? 'Bangalore'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Notes & Problem Description */}
          <div className="rounded-3xl border-2 sm:border-[2.5px] border-black bg-white p-5 sm:p-6 shadow-[5px_5px_0px_#000000]">
            <h2 className="text-sm sm:text-base font-black uppercase text-neutral-900 mb-3 flex items-center gap-2">
              <Clock size={18} className="text-[#6D28D9] stroke-[2.5]" /> Problem Description & Notes
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe the issue (e.g. Inverter tripping, bathroom pipe leak, switchboard repair)..."
              className="w-full rounded-2xl border-2 border-black bg-[#FAF7F2] p-3 text-xs font-semibold text-neutral-900 placeholder-neutral-400 outline-none shadow-[2px_2px_0px_#000000] min-h-[80px] resize-none focus:bg-white transition-all"
            />
          </div>

          {/* Section 4: Summary & Dispatch Action */}
          <div className="rounded-3xl border-2 sm:border-[2.5px] border-black bg-white p-5 sm:p-6 shadow-[6px_6px_0px_#000000]">
            <h2 className="text-base font-black uppercase text-neutral-900 mb-3">Booking Summary</h2>
            <div className="space-y-2 mb-4 text-xs font-bold text-neutral-700">
              <div className="flex items-center justify-between">
                <span>Assigned Worker:</span>
                <span className="font-black text-neutral-900">{worker.users?.name ?? ''}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Service Category:</span>
                <span className="font-black text-neutral-900">{worker.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Duration:</span>
                <span className="font-black text-neutral-900">{hours} hour(s)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Rate:</span>
                <span className="font-mono font-black text-neutral-900">₹{worker.hourly_rate}/hr</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Distance:</span>
                <span className="font-black text-neutral-900">{distanceKm.toFixed(1)} km (~{reachTime} mins)</span>
              </div>
              <div className="border-t-2 border-black pt-3 flex items-center justify-between">
                <span className="text-sm font-black uppercase text-neutral-900">Total Amount (0% fee):</span>
                <span className="text-3xl font-black text-neutral-900 font-mono">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-600 bg-[#FEE2E2] p-3 text-xs font-bold text-red-700">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl border-2 border-black bg-[#F59E0B] hover:bg-[#E68A00] py-3.5 px-6 text-sm sm:text-base font-black uppercase tracking-wider text-black shadow-[4px_4px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin text-black" />
                  <span>Dispatching...</span>
                </>
              ) : (
                <>
                  <Radio size={16} className="animate-pulse stroke-[3]" />
                  <span>Launch GPS Radar & Match</span>
                  <ArrowRight size={16} className="stroke-[3]" />
                </>
              )}
            </motion.button>
          </div>

        </form>
      </div>
    </div>
  );
}

