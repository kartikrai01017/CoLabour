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
import { useLanguage } from '@/context/LanguageContext';

export function BookingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, categoryName } = useLanguage();
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
            setAddress(t('booking.currentGpsLocation', {
              lat: pos.coords.latitude.toFixed(4),
              lng: pos.coords.longitude.toFixed(4),
            }));
          }
        },
        () => setError(t('booking.locationError'))
      );
    } else {
      setError(t('booking.geoUnsupported'));
    }
  };

  const handlePreSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user || !worker) return;
    if (!date || !time || !address) {
      setError(t('booking.requiredFields'));
      return;
    }

    const scheduledAt = new Date(`${date}T${time}`);
    if (scheduledAt < new Date()) {
      setError(t('booking.futureTime'));
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
      const msg = err instanceof Error ? err.message : t('booking.createFailed');
      setError(msg);
      setShowRadarModal(false);
    } finally {
      setSubmitting(false);
    }
  };

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
        <p className="text-gray-400">{t('booking.workerNotFound')}</p>
        <Link to="/workers"><NeonButton variant="ghost">{t('booking.browseWorkers')}</NeonButton></Link>
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
        workerName={worker.users?.name ?? t('booking.professionalWorker')}
        workerCategory={worker.category}
        workerRate={worker.hourly_rate}
        workerLocation={worker.location}
        distanceKm={distanceKm}
        onConfirm={handleConfirmBooking}
        onCancel={() => setShowRadarModal(false)}
      />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link to={`/workers/${id}`} className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-neon-emerald transition-colors">
          <ArrowLeft size={16} /> {t('booking.backToProfile')}
        </Link>

        <div className="mb-8 animate-fade-in">
           <h1 className="text-3xl font-bold gradient-text-emerald-cyan">{t('booking.title')}</h1>
           <p className="mt-2 text-gray-400">{t('booking.subtitle', { name: worker.users?.name ?? t('booking.professionalWorker') })}</p>
        </div>

        {/* Worker summary & live proximity badge */}
        <GlassCard className="mb-6 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`h-16 w-16 rounded-2xl border ${style.bg} ${style.border} flex items-center justify-center`}>
              <Icon className={style.text} size={30} />
            </div>
            <div>
              <h3 className="font-semibold text-white">{worker.users?.name}</h3>
               <p className="text-sm text-gray-400">{categoryName(worker.category)} • ₹{worker.hourly_rate}/hr</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-neon-emerald/15 px-2 py-0.5 text-[11px] font-bold text-neon-emerald border border-neon-emerald/30">
                   <Navigation size={11} /> {t('booking.kmAway', { distance: distanceKm.toFixed(1) })}
                </span>
                <span className="text-[11px] text-gray-400">{t('booking.minsReach', { minutes: reachTime })}</span>
              </div>
            </div>
          </div>
          <Badge variant="emerald"><Check size={12} /> {t('booking.verifiedProfessional')}</Badge>
        </GlassCard>

        <form onSubmit={handlePreSubmit} className="space-y-6">
          {/* Date & Time */}
          <GlassCard className="p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-200">
              <Calendar size={18} className="text-neon-cyan" /> {t('booking.dateTime')}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                 <label className="mb-1.5 block text-sm font-medium text-gray-300">{t('booking.date')}</label>
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
                 <label className="mb-1.5 block text-sm font-medium text-gray-300">{t('booking.time')}</label>
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
               <label className="mb-1.5 block text-sm font-medium text-gray-300">{t('booking.duration')}</label>
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
                 <span className="text-sm text-gray-400">{t('booking.hours')}</span>
              </div>
            </div>
          </GlassCard>

          {/* Location */}
          <GlassCard className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-200">
                 <MapPin size={18} className="text-neon-emerald" /> {t('booking.serviceLocation')}
              </h2>
              <span className="flex items-center gap-1 rounded-full border border-neon-cyan/30 bg-neon-cyan/10 px-2.5 py-0.5 text-xs font-mono text-neon-cyan">
                 <Radio size={12} className="animate-pulse" /> {t('booking.liveRadarReady')}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                 <label className="mb-1.5 block text-sm font-medium text-gray-300">{t('booking.address')}</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                   placeholder={t('booking.addressPlaceholder')}
                  className="booking-input min-h-[80px] resize-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <NeonButton type="button" variant="ghost" size="sm" onClick={handleUseMyLocation}>
                   <Navigation size={16} /> {t('booking.useGps')}
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
                     <p className="text-xs font-bold text-white">{t('booking.liveProximity', { distance: distanceKm.toFixed(1) })}</p>
                     <p className="text-[10px] text-gray-400">{t('booking.workerStationed', { location: worker.location ?? t('booking.defaultLocation') })}</p>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Notes */}
          <GlassCard className="p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-200">
               <Clock size={18} className="text-neon-violet" /> {t('booking.problemNotes')}
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
               placeholder={t('booking.notesPlaceholder')}
              className="booking-input min-h-[80px] resize-none"
            />
          </GlassCard>

          {/* Summary & Proceed with Radar */}
          <GlassCard className="p-6">
             <h2 className="mb-4 text-lg font-semibold text-gray-200">{t('booking.summary')}</h2>
            <div className="space-y-2 mb-4">
               <SummaryRow label={t('booking.worker')} value={worker.users?.name ?? ''} />
               <SummaryRow label={t('booking.category')} value={categoryName(worker.category)} />
               <SummaryRow label={t('booking.duration')} value={t('booking.durationValue', { hours })} />
               <SummaryRow label={t('booking.rate')} value={t('booking.rateValue', { rate: worker.hourly_rate })} />
               <SummaryRow label={t('booking.distance')} value={t('booking.distanceValue', { distance: distanceKm.toFixed(1), minutes: reachTime })} />
              <div className="border-t border-white/10 pt-2">
                <div className="flex items-center justify-between">
                   <span className="text-lg font-semibold text-gray-200">{t('booking.totalAmount')}</span>
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
                 <><Loader2 size={18} className="animate-spin" /> {t('booking.dispatching')}</>
              ) : (
                 <><Radio size={18} className="animate-pulse" /> {t('booking.launchRadar')} <ArrowRight size={18} /></>
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
