import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar, MapPin, Clock, ArrowLeft, ArrowRight, Loader2, AlertCircle, Navigation, Check, Radio,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { GlowOrb } from '@/components/ui/Shared';
import { type WorkerWithUser } from '@/lib/supabase';
import { CATEGORY_ICONS, getCategoryStyle } from '@/lib/categories';
import { useAuth } from '@/context/AuthContext';
import { fetchWorkerProfile, createNewBooking } from '@/lib/dataService';
import { RadarScannerModal } from '@/components/RadarScannerModal';
import {
  calculateHaversineDistance,
  getCoordinatesFromLocation,
  calculateReachTimeMinutes,
  DEFAULT_COORDINATES,
} from '@/lib/geo';

export function BookingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [worker, setWorker] = useState<WorkerWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [hours, setHours] = useState('1');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>(DEFAULT_COORDINATES);
  const [showRadarModal, setShowRadarModal] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function fetchWorker() {
      if (!id) return;
      setLoading(true);
      try {
        const data = await fetchWorkerProfile(id);
        if (mounted) setWorker(data);
      } catch {
        if (mounted) setWorker(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchWorker();

    // Auto-detect GPS location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (mounted) {
            setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          }
        },
        () => {
          // fallback to default
        },
        { timeout: 5000 }
      );
    }

    return () => {
      mounted = false;
    };
  }, [id]);

  const totalAmount = worker ? worker.hourly_rate * parseFloat(hours || '0') : 0;

  // Calculate Haversine distance
  const workerCoords = worker ? getCoordinatesFromLocation(worker.location) : DEFAULT_COORDINATES;
  const distanceKm = calculateHaversineDistance(
    userCoords.lat,
    userCoords.lng,
    workerCoords.lat,
    workerCoords.lng
  );
  const reachTime = calculateReachTimeMinutes(distanceKm);

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserCoords(coords);
          if (!address) {
            setAddress(`Current GPS Location (Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)})`);
          }
        },
        () => setError('Could not get your location. Please enter address manually.')
      );
    } else {
      setError('Geolocation is not supported on this device.');
    }
  };

  const handlePreSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user || !worker) return;
    if (!date || !time || !address) {
      setError('Please fill in all required fields');
      return;
    }

    const scheduledAt = new Date(`${date}T${time}`);
    if (scheduledAt < new Date()) {
      setError('Scheduled time must be in the future');
      return;
    }

    // Launch Radar Scanner Animation Modal
    setShowRadarModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!user || !worker) return;
    setSubmitting(true);
    setError('');

    try {
      const scheduledAt = new Date(`${date}T${time}`);
      const booking = await createNewBooking({
        customer_id: user.id,
        worker_id: worker.id,
        category: worker.category,
        scheduled_at: scheduledAt.toISOString(),
        address,
        total_amount: totalAmount,
        notes: notes || undefined,
      });

      setShowRadarModal(false);
      navigate(`/payment/${booking.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create booking';
      setError(msg);
      setShowRadarModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-16">
        <Loader2 size={32} className="animate-spin text-nb-ink" />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center pt-16 gap-4">
        <p className="text-nb-text-muted font-medium">Worker not found.</p>
        <Link to="/workers"><NeonButton variant="ghost">Browse Workers</NeonButton></Link>
      </div>
    );
  }

  const Icon = CATEGORY_ICONS[worker.category] ?? Calendar;
  const style = getCategoryStyle(worker.category);

  return (
    <div className="relative min-h-screen overflow-hidden pt-20 pb-12">
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
        <Link to={`/workers/${id}`} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-nb-text-muted hover:text-nb-accent-orange transition-colors">
          <ArrowLeft size={16} /> Back to Profile
        </Link>

        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-extrabold text-nb-ink">Book Your Appointment</h1>
          <p className="mt-2 text-nb-text-muted">Schedule a service with {worker.users?.name}</p>
        </div>

        {/* Worker summary & live proximity badge */}
        <GlassCard className="mb-6 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`h-16 w-16 rounded-nb-lg border-[3px] border-nb-ink bg-nb-surface flex items-center justify-center shadow-nb-sm`}>
              <Icon className="text-nb-ink" size={30} />
            </div>
            <div>
              <h3 className="font-bold text-nb-ink">{worker.users?.name}</h3>
              <p className="text-sm font-medium text-nb-text-muted">{worker.category} • ₹{worker.hourly_rate}/hr</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-nb-sm bg-nb-accent-blue/20 px-2 py-0.5 text-[11px] font-bold text-nb-ink border border-nb-ink/20">
                  <Navigation size={11} /> {distanceKm.toFixed(1)} km away
                </span>
                <span className="text-[11px] font-medium text-nb-text-muted">~{reachTime} mins reach</span>
              </div>
            </div>
          </div>
          <Badge variant="emerald"><Check size={12} /> Verified Professional</Badge>
        </GlassCard>

        <form onSubmit={handlePreSubmit} className="space-y-6">
          {/* Date & Time */}
          <GlassCard className="p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-nb-ink">
              <Calendar size={18} /> Date & Time
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-nb-text-muted">Date</label>
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
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-nb-text-muted">Time</label>
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
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-nb-text-muted">Duration (hours)</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setHours(String(Math.max(1, parseInt(hours) - 1)))}
                  className="rounded-nb-md border-[2px] border-nb-ink bg-nb-surface px-3 py-2 text-nb-ink font-bold shadow-nb-sm hover:shadow-nb-md active:shadow-nb-pressed active:translate-x-[3px] active:translate-y-[3px]"
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
                  className="rounded-nb-md border-[2px] border-nb-ink bg-nb-surface px-3 py-2 text-nb-ink font-bold shadow-nb-sm hover:shadow-nb-md active:shadow-nb-pressed active:translate-x-[3px] active:translate-y-[3px]"
                >
                  +
                </button>
                <span className="text-sm font-medium text-nb-text-muted">hours</span>
              </div>
            </div>
          </GlassCard>

          {/* Location */}
          <GlassCard className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-nb-ink">
                <MapPin size={18} /> Service Location & Live GPS
              </h2>
              <span className="flex items-center gap-1 rounded-nb-sm border-[1.5px] border-nb-ink bg-nb-accent-green/20 px-2.5 py-0.5 text-xs font-bold text-nb-ink">
                <Radio size={12} className="animate-pulse" /> Live Radar Ready
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-nb-text-muted">Address / Flat / Landmark</label>
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
                  <span className="text-xs text-nb-text-muted font-mono font-medium">
                    Lat: {userCoords.lat.toFixed(4)}, Lng: {userCoords.lng.toFixed(4)}
                  </span>
                )}
              </div>

              {/* Interactive Radar Sonar mini preview map */}
              <div className="relative h-44 rounded-nb-xl border-[3px] border-nb-ink bg-nb-surface overflow-hidden flex items-center justify-center shadow-nb-md">
                <div className="absolute inset-0 grid-bg opacity-40" />
                {/* Sonar rings */}
                <div className="absolute h-32 w-32 rounded-full border-[1.5px] border-nb-accent-green/30 animate-ping opacity-30" />
                <div className="absolute h-20 w-20 rounded-full border-[2px] border-nb-ink/20" />

                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-nb-accent-green border-[2px] border-nb-ink text-nb-ink shadow-nb-md">
                    <Navigation size={20} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-nb-ink">Live Proximity: {distanceKm.toFixed(1)} km</p>
                    <p className="text-[10px] font-medium text-nb-text-muted">Worker is stationed near {worker.location ?? 'Bangalore'}</p>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Notes */}
          <GlassCard className="p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-nb-ink">
              <Clock size={18} /> Problem Description & Notes
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe the issue (e.g. Inverter tripping, bathroom pipe leak, fan capacitor replacement)..."
              className="booking-input min-h-[80px] resize-none"
            />
          </GlassCard>

          {/* Summary & Proceed with Radar */}
          <GlassCard className="p-6 border-[4px] shadow-nb-xl">
            <h2 className="mb-4 text-lg font-bold text-nb-ink">Booking Summary</h2>
            <div className="space-y-2 mb-4">
              <SummaryRow label="Worker" value={worker.users?.name ?? ''} />
              <SummaryRow label="Category" value={worker.category} />
              <SummaryRow label="Duration" value={`${hours} hour(s)`} />
              <SummaryRow label="Rate" value={`₹${worker.hourly_rate}/hr`} />
              <SummaryRow label="Distance" value={`${distanceKm.toFixed(1)} km (~${reachTime} mins)`} />
              <div className="border-t-2 border-nb-ink/10 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-nb-ink">Total Amount (0% fee)</span>
                  <span className="text-2xl font-extrabold text-nb-accent-orange">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-nb-md border-[2px] border-nb-accent-red bg-nb-accent-red/10 px-4 py-3 text-sm font-medium text-nb-accent-red">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <NeonButton type="submit" fullWidth size="lg" variant="amber" disabled={submitting}>
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
          border-radius: 8px;
          border: 2px solid #171717;
          background: #FFFFFF;
          padding: 0.625rem 1rem;
          color: #171717;
          font-size: 0.875rem;
          font-weight: 500;
          outline: none;
          transition: all 0.15s;
          box-shadow: 3px 3px 0 #171717;
        }
        .booking-input:focus {
          box-shadow: 4px 4px 0 #171717;
        }
        .booking-input::placeholder { color: #66635D; }
      `}</style>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-nb-text-muted font-medium">{label}</span>
      <span className="font-bold text-nb-ink">{value}</span>
    </div>
  );
}