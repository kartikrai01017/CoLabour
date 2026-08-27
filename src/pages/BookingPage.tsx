import { Link } from 'react-router-dom';
import {
  Calendar, MapPin, Clock, ArrowLeft, ArrowRight, Loader2, AlertCircle, Navigation, Check, Radio,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { GlowOrb } from '@/components/ui/Shared';
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
      <div className="flex min-h-screen items-center justify-center pt-16">
        <Loader2 size={32} className="animate-spin text-neon-emerald" />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center pt-16 gap-4">
        <p className="text-gray-400">Worker not found.</p>
        <Link to="/workers"><NeonButton variant="ghost">Browse Workers</NeonButton></Link>
      </div>
    );
  }

  const Icon = CATEGORY_ICONS[worker.category] ?? Calendar;
  const style = getCategoryStyle(worker.category);

  return (
    <div className="relative min-h-screen overflow-hidden pt-20 pb-12">
      <GlowOrb className="top-20 -left-20 h-80 w-80 bg-neon-emerald/10" />
      <GlowOrb className="bottom-0 right-0 h-80 w-80 bg-neon-cyan/10" />

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

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link to={`/workers/${id}`} className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-neon-emerald transition-colors">
          <ArrowLeft size={16} /> Back to Profile
        </Link>

        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold gradient-text-emerald-cyan">Book Your Appointment</h1>
          <p className="mt-2 text-gray-400">Schedule a service with {worker.users?.name}</p>
        </div>

        {/* Worker summary & live proximity badge */}
        <GlassCard className="mb-6 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`h-16 w-16 rounded-2xl border ${style.bg} ${style.border} flex items-center justify-center`}>
              <Icon className={style.text} size={30} />
            </div>
            <div>
              <h3 className="font-semibold text-white">{worker.users?.name}</h3>
              <p className="text-sm text-gray-400">{worker.category} • ₹{worker.hourly_rate}/hr</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-neon-emerald/15 px-2 py-0.5 text-[11px] font-bold text-neon-emerald border border-neon-emerald/30">
                  <Navigation size={11} /> {distanceKm.toFixed(1)} km away
                </span>
                <span className="text-[11px] text-gray-400">~{reachTime} mins reach</span>
              </div>
            </div>
          </div>
          <Badge variant="emerald"><Check size={12} /> Verified Professional</Badge>
        </GlassCard>

        <form onSubmit={handlePreSubmit} className="space-y-6">
          {/* Date & Time */}
          <GlassCard className="p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-200">
              <Calendar size={18} className="text-neon-cyan" /> Date & Time
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="booking-input"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="booking-input"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Duration (hours)</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setHours(String(Math.max(1, parseInt(hours) - 1)))}
                  className="rounded-lg border border-white/10 px-3 py-2 text-gray-300 hover:border-neon-emerald/30"
                >
                  -
                </button>
                <input
                  type="number"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  min="1"
                  max="12"
                  className="booking-input text-center max-w-[80px]"
                />
                <button
                  type="button"
                  onClick={() => setHours(String(parseInt(hours) + 1))}
                  className="rounded-lg border border-white/10 px-3 py-2 text-gray-300 hover:border-neon-emerald/30"
                >
                  +
                </button>
                <span className="text-sm text-gray-400">hours</span>
              </div>
            </div>
          </GlassCard>

          {/* Location */}
          <GlassCard className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-200">
                <MapPin size={18} className="text-neon-emerald" /> Service Location & Live GPS
              </h2>
              <span className="flex items-center gap-1 rounded-full border border-neon-cyan/30 bg-neon-cyan/10 px-2.5 py-0.5 text-xs font-mono text-neon-cyan">
                <Radio size={12} className="animate-pulse" /> Live Radar Ready
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Address / Flat / Landmark</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  placeholder="Enter your full address..."
                  className="booking-input min-h-[80px] resize-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <NeonButton type="button" variant="ghost" size="sm" onClick={handleUseMyLocation}>
                  <Navigation size={16} /> Use My Current GPS Location
                </NeonButton>
                {userCoords && (
                  <span className="text-xs text-gray-400 font-mono">
                    Lat: {userCoords.lat.toFixed(4)}, Lng: {userCoords.lng.toFixed(4)}
                  </span>
                )}
              </div>

              {/* Interactive Radar Sonar mini preview map */}
              <div className="relative h-44 rounded-2xl border border-white/10 bg-base-950 overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 grid-bg opacity-40" />
                {/* Sonar rings */}
                <div className="absolute h-32 w-32 rounded-full border border-neon-emerald/20 animate-ping opacity-30" />
                <div className="absolute h-20 w-20 rounded-full border border-neon-cyan/30" />

                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-neon-emerald/20 border border-neon-emerald text-neon-emerald shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                    <Navigation size={20} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-white">Live Proximity: {distanceKm.toFixed(1)} km</p>
                    <p className="text-[10px] text-gray-400">Worker is stationed near {worker.location ?? 'Bangalore'}</p>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Notes */}
          <GlassCard className="p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-200">
              <Clock size={18} className="text-neon-violet" /> Problem Description & Notes
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe the issue (e.g. Inverter tripping, bathroom pipe leak, fan capacitor replacement)..."
              className="booking-input min-h-[80px] resize-none"
            />
          </GlassCard>

          {/* Summary & Proceed with Radar */}
          <GlassCard className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-200">Booking Summary</h2>
            <div className="space-y-2 mb-4">
              <SummaryRow label="Worker" value={worker.users?.name ?? ''} />
              <SummaryRow label="Category" value={worker.category} />
              <SummaryRow label="Duration" value={`${hours} hour(s)`} />
              <SummaryRow label="Rate" value={`₹${worker.hourly_rate}/hr`} />
              <SummaryRow label="Distance" value={`${distanceKm.toFixed(1)} km (~${reachTime} mins)`} />
              <div className="border-t border-white/10 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-200">Total Amount (0% fee)</span>
                  <span className="text-2xl font-bold gradient-text-emerald-cyan">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <NeonButton type="submit" fullWidth size="lg" disabled={submitting}>
              {submitting ? (
                <><Loader2 size={18} className="animate-spin" /> Dispatching...</>
              ) : (
                <><Radio size={18} className="animate-pulse" /> Launch GPS Radar & Match <ArrowRight size={18} /></>
              )}
            </NeonButton>
          </GlassCard>
        </form>
      </div>

      <style>{`
        .booking-input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(11,15,25,0.6);
          padding: 0.625rem 1rem;
          color: #e5e7eb;
          font-size: 0.875rem;
          outline: none;
          transition: all 0.2s;
        }
        .booking-input:focus {
          border-color: rgba(16,185,129,0.4);
          box-shadow: 0 0 0 3px rgba(16,185,129,0.1);
        }
        .booking-input::placeholder { color: #6b7280; }
        .booking-input::-webkit-calendar-picker-indicator { filter: invert(0.7); }
      `}</style>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium text-gray-200">{value}</span>
    </div>
  );
}
