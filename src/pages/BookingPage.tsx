import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar, MapPin, Clock, ArrowLeft, ArrowRight, Loader2, AlertCircle, Navigation, Check, Radio,
} from 'lucide-react';
<<<<<<< HEAD
import { type WorkerWithUser } from '@/lib/supabase';
import { CATEGORY_ICONS, getCategoryStyle } from '@/lib/categories';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
=======
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { GlowOrb } from '@/components/ui/Shared';
import { type WorkerWithUser } from '@/lib/supabase';
import { CATEGORY_ICONS, getCategoryStyle } from '@/lib/categories';
import { useAuth } from '@/context/AuthContext';
>>>>>>> origin/main
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
<<<<<<< HEAD
  const { t } = useLanguage();
=======
>>>>>>> origin/main
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
<<<<<<< HEAD
      <div className="flex min-h-screen items-center justify-center pt-16 bg-[#F6F4EE]">
        <Loader2 size={36} className="animate-spin text-black" />
      </div>
    );
  }

  if (user?.role === 'worker') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center pt-16 gap-4 bg-[#F6F4EE] px-4 text-center">
        <div className="p-4 rounded-full bg-red-100 border-2 border-black">
          <AlertCircle size={36} className="text-red-600" />
        </div>
        <h2 data-i18n="workerAccountRestriction" className="text-2xl font-black text-black">{t('workerAccountRestriction')}</h2>
        <p data-i18n="workerAccountRestrictionDesc" className="text-sm font-bold text-gray-700 max-w-md">
          {t('workerAccountRestrictionDesc')}
        </p>
        <Link to="/workers">
          <button data-i18n="backToDirectory" className="mt-2 px-6 py-2.5 rounded-xl border-2 border-black bg-emerald-400 font-black text-xs uppercase tracking-wider text-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
            {t('backToDirectory')}
          </button>
        </Link>
=======
      <div className="flex min-h-screen items-center justify-center pt-16">
        <Loader2 size={32} className="animate-spin text-neon-emerald" />
>>>>>>> origin/main
      </div>
    );
  }

  if (!worker) {
    return (
<<<<<<< HEAD
      <div className="flex min-h-screen flex-col items-center justify-center pt-16 gap-4 bg-[#F6F4EE]">
        <p data-i18n="workerNotFound" className="text-base font-bold text-gray-700">{t('workerNotFound')}</p>
        <Link to="/workers">
          <button data-i18n="browseWorkers" className="px-5 py-2.5 rounded-xl border-2 border-black bg-amber-300 font-black text-black shadow-[3px_3px_0px_0px_#000]">
            {t('browseWorkers')}
          </button>
        </Link>
=======
      <div className="flex min-h-screen flex-col items-center justify-center pt-16 gap-4">
        <p className="text-gray-400">Worker not found.</p>
        <Link to="/workers"><NeonButton variant="ghost">Browse Workers</NeonButton></Link>
>>>>>>> origin/main
      </div>
    );
  }

  const Icon = CATEGORY_ICONS[worker.category] ?? Calendar;
  const style = getCategoryStyle(worker.category);

  return (
<<<<<<< HEAD
    <div className="relative min-h-screen bg-[#F6F4EE] text-black pt-20 pb-16">
=======
    <div className="relative min-h-screen overflow-hidden pt-20 pb-12">
      <GlowOrb className="top-20 -left-20 h-80 w-80 bg-neon-emerald/10" />
      <GlowOrb className="bottom-0 right-0 h-80 w-80 bg-neon-cyan/10" />

>>>>>>> origin/main
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
<<<<<<< HEAD
        <Link to={`/workers/${id}`} className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-gray-800 hover:text-emerald-800 transition-colors">
          <ArrowLeft size={16} /> <span data-i18n="backToProfile">{t('backToProfile')}</span>
        </Link>

        <div className="mb-8">
          <div data-i18n="directBookingDispatch" className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-200 border-2 border-black font-black text-xs uppercase tracking-wider mb-2 shadow-[2px_2px_0px_0px_#000]">
            {t('directBookingDispatch')}
          </div>
          <h1 data-i18n="bookServiceAppointment" className="text-3xl sm:text-4xl font-black text-black">{t('bookServiceAppointment')}</h1>
          <p className="mt-1 text-sm font-semibold text-gray-700">{t('scheduleServiceWith')} {worker.users?.name}</p>
        </div>

        {/* Worker summary & live proximity badge */}
        <div className="rounded-2xl border-2 border-black bg-white mb-6 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[5px_5px_0px_0px_#000]">
          <div className="flex items-center gap-4">
            <div className={`h-16 w-16 rounded-xl border-2 border-black ${style.bg} flex items-center justify-center shadow-[2px_2px_0px_0px_#000]`}>
              <Icon className="text-black" size={30} />
            </div>
            <div>
              <h3 className="font-black text-lg text-black">{worker.users?.name}</h3>
              <p className="text-xs font-bold text-gray-700">{t(worker.category as any) || worker.category} • ₹{worker.hourly_rate}{t('perHour')}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-200 px-2 py-0.5 text-[11px] font-black text-black border border-black shadow-[1px_1px_0px_0px_#000]">
                  <Navigation size={11} /> {distanceKm.toFixed(1)} <span data-i18n="kmAway">{t('kmAway')}</span>
                </span>
                <span className="text-[11px] font-semibold text-gray-600">~{reachTime} <span data-i18n="minsReach">{t('minsReach')}</span></span>
              </div>
            </div>
          </div>
          <span data-i18n="verifiedPro" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-300 border-2 border-black font-black text-xs text-black shadow-[2px_2px_0px_0px_#000]">
            <Check size={14} strokeWidth={3} /> {t('verifiedPro')}
          </span>
        </div>

        <form onSubmit={handlePreSubmit} className="space-y-6">
          {/* Date & Time */}
          <div className="rounded-2xl border-2 border-black bg-white p-6 shadow-[5px_5px_0px_0px_#000]">
            <h2 data-i18n="dateTimeSlot" className="mb-4 flex items-center gap-2 text-base font-black text-black uppercase tracking-wider">
              <Calendar size={18} className="text-emerald-800" /> {t('dateTimeSlot')}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label data-i18n="bookingDate" className="mb-1.5 block text-xs font-bold text-gray-800">{t('bookingDate')}</label>
=======
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
>>>>>>> origin/main
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  min={new Date().toISOString().split('T')[0]}
<<<<<<< HEAD
                  className="w-full rounded-xl border-2 border-black bg-white px-4 py-2.5 text-sm font-semibold text-black shadow-[2px_2px_0px_0px_#000] focus:shadow-[4px_4px_0px_0px_#000] outline-none"
                />
              </div>
              <div>
                <label data-i18n="serviceTime" className="mb-1.5 block text-xs font-bold text-gray-800">{t('serviceTime')}</label>
=======
                  className="booking-input"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Time</label>
>>>>>>> origin/main
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
<<<<<<< HEAD
                  className="w-full rounded-xl border-2 border-black bg-white px-4 py-2.5 text-sm font-semibold text-black shadow-[2px_2px_0px_0px_#000] focus:shadow-[4px_4px_0px_0px_#000] outline-none"
=======
                  className="booking-input"
>>>>>>> origin/main
                />
              </div>
            </div>
            <div className="mt-4">
<<<<<<< HEAD
              <label data-i18n="estimatedDuration" className="mb-1.5 block text-xs font-bold text-gray-800">{t('estimatedDuration')}</label>
=======
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Duration (hours)</label>
>>>>>>> origin/main
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setHours(String(Math.max(1, parseInt(hours) - 1)))}
<<<<<<< HEAD
                  className="h-10 w-10 flex items-center justify-center rounded-xl border-2 border-black bg-gray-100 font-black text-base text-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer"
=======
                  className="rounded-lg border border-white/10 px-3 py-2 text-gray-300 hover:border-neon-emerald/30"
>>>>>>> origin/main
                >
                  -
                </button>
                <input
                  type="number"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  min="1"
                  max="12"
<<<<<<< HEAD
                  className="rounded-xl border-2 border-black bg-white py-2 px-3 text-center text-sm font-black text-black max-w-[80px] shadow-[2px_2px_0px_0px_#000] outline-none"
=======
                  className="booking-input text-center max-w-[80px]"
>>>>>>> origin/main
                />
                <button
                  type="button"
                  onClick={() => setHours(String(parseInt(hours) + 1))}
<<<<<<< HEAD
                  className="h-10 w-10 flex items-center justify-center rounded-xl border-2 border-black bg-gray-100 font-black text-base text-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer"
                >
                  +
                </button>
                <span data-i18n="hoursEstimated" className="text-xs font-bold text-gray-700">{t('hoursEstimated')}</span>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="rounded-2xl border-2 border-black bg-white p-6 shadow-[5px_5px_0px_0px_#000]">
            <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
              <h2 data-i18n="serviceLocationGps" className="flex items-center gap-2 text-base font-black text-black uppercase tracking-wider">
                <MapPin size={18} className="text-emerald-800" /> {t('serviceLocationGps')}
              </h2>
              <span data-i18n="liveRadarReady" className="flex items-center gap-1 rounded-md border-2 border-black bg-cyan-200 px-2.5 py-0.5 text-xs font-black text-black shadow-[2px_2px_0px_0px_#000]">
                <Radio size={12} className="animate-pulse" /> {t('liveRadarReady')}
=======
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
>>>>>>> origin/main
              </span>
            </div>

            <div className="space-y-3">
              <div>
<<<<<<< HEAD
                <label data-i18n="addressLabel" className="mb-1.5 block text-xs font-bold text-gray-800">{t('addressLabel')}</label>
=======
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Address / Flat / Landmark</label>
>>>>>>> origin/main
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
<<<<<<< HEAD
                  placeholder={t('addressPlaceholder')}
                  data-i18n-placeholder="addressPlaceholder"
                  className="w-full rounded-xl border-2 border-black bg-white p-3 text-sm font-semibold text-black placeholder:text-gray-400 min-h-[80px] resize-none shadow-[2px_2px_0px_0px_#000] focus:shadow-[4px_4px_0px_0px_#000] outline-none"
=======
                  placeholder="Enter your full address..."
                  className="booking-input min-h-[80px] resize-none"
>>>>>>> origin/main
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
<<<<<<< HEAD
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-black bg-amber-200 px-4 py-2 text-xs font-black text-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
                >
                  <Navigation size={14} /> <span data-i18n="autoDetectGps">{t('autoDetectGps')}</span>
                </button>
                {userCoords && (
                  <span className="text-xs font-mono font-bold text-gray-700 bg-gray-100 border border-black px-2 py-1 rounded-md">
=======
                <NeonButton type="button" variant="ghost" size="sm" onClick={handleUseMyLocation}>
                  <Navigation size={16} /> Use My Current GPS Location
                </NeonButton>
                {userCoords && (
                  <span className="text-xs text-gray-400 font-mono">
>>>>>>> origin/main
                    Lat: {userCoords.lat.toFixed(4)}, Lng: {userCoords.lng.toFixed(4)}
                  </span>
                )}
              </div>

              {/* Interactive Radar Sonar mini preview map */}
<<<<<<< HEAD
              <div className="relative h-44 rounded-xl border-2 border-black bg-amber-50 overflow-hidden flex items-center justify-center shadow-[3px_3px_0px_0px_#000]">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px]" />
                {/* Sonar rings */}
                <div className="absolute h-32 w-32 rounded-full border-2 border-emerald-500 animate-ping opacity-30" />
                <div className="absolute h-20 w-20 rounded-full border-2 border-black/30" />

                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-emerald-400 border-2 border-black text-black shadow-[3px_3px_0px_0px_#000]">
                    <Navigation size={20} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-black text-black">{t('liveProximity')}: {distanceKm.toFixed(1)} km</p>
                    <p className="text-[11px] font-bold text-gray-700">{t('workerStationedNear')} {worker.location ?? 'Bangalore'}</p>
=======
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
>>>>>>> origin/main
                  </div>
                </div>
              </div>
            </div>
<<<<<<< HEAD
          </div>

          {/* Notes */}
          <div className="rounded-2xl border-2 border-black bg-white p-6 shadow-[5px_5px_0px_0px_#000]">
            <h2 data-i18n="problemDescriptionNotes" className="mb-4 flex items-center gap-2 text-base font-black text-black uppercase tracking-wider">
              <Clock size={18} className="text-purple-800" /> {t('problemDescriptionNotes')}
=======
          </GlassCard>

          {/* Notes */}
          <GlassCard className="p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-200">
              <Clock size={18} className="text-neon-violet" /> Problem Description & Notes
>>>>>>> origin/main
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
<<<<<<< HEAD
              placeholder={t('problemPlaceholder')}
              data-i18n-placeholder="problemPlaceholder"
              className="w-full rounded-xl border-2 border-black bg-white p-3 text-sm font-semibold text-black placeholder:text-gray-400 min-h-[80px] resize-none shadow-[2px_2px_0px_0px_#000] focus:shadow-[4px_4px_0px_0px_#000] outline-none"
            />
          </div>

          {/* Summary & Proceed with Radar */}
          <div className="rounded-2xl border-2 border-black bg-white p-6 shadow-[5px_5px_0px_0px_#000]">
            <h2 data-i18n="bookingCostBreakdown" className="mb-4 text-base font-black text-black uppercase tracking-wider">{t('bookingCostBreakdown')}</h2>
            <div className="space-y-2.5 mb-4">
              <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                <span data-i18n="assignedWorker">{t('assignedWorker')}</span>
                <span className="text-black font-black">{worker.users?.name ?? ''}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                <span data-i18n="category">{t('category')}</span>
                <span className="text-black font-black">{t(worker.category as any) || worker.category}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                <span data-i18n="duration">{t('duration')}</span>
                <span className="text-black font-black">{hours} {t('hoursEstimated')}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                <span data-i18n="ratePerHour">{t('ratePerHour')}</span>
                <span className="text-black font-black">₹{worker.hourly_rate}{t('perHour')}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                <span data-i18n="liveProximity">{t('liveProximity')}</span>
                <span className="text-black font-black">{distanceKm.toFixed(1)} km (~{reachTime} {t('minsReach')})</span>
              </div>
              <div className="border-t-2 border-black/10 pt-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span data-i18n="totalPayable" className="text-base font-black text-black">{t('totalPayable')}</span>
                    <span data-i18n="zeroPlatformHiddenFee" className="block text-[11px] font-bold text-emerald-800">{t('zeroPlatformHiddenFee')}</span>
                  </div>
                  <span className="text-3xl font-black text-black">₹{totalAmount.toFixed(2)}</span>
=======
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
>>>>>>> origin/main
                </div>
              </div>
            </div>

            {error && (
<<<<<<< HEAD
              <div className="mb-4 flex items-center gap-2 rounded-xl border-2 border-black bg-red-100 px-4 py-3 text-xs font-bold text-red-900 shadow-[2px_2px_0px_0px_#000]">
                <AlertCircle size={16} className="text-red-700 shrink-0" /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-6 rounded-xl border-2 border-black bg-emerald-400 text-black font-black text-sm shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider disabled:opacity-50"
            >
              {submitting ? (
                <><Loader2 size={18} className="animate-spin text-black" /> <span data-i18n="dispatching">{t('dispatching')}</span></>
              ) : (
                <><Radio size={18} className="animate-pulse text-black" /> <span data-i18n="launchGpsRadarMatch">{t('launchGpsRadarMatch')}</span> <ArrowRight size={18} /></>
              )}
            </button>
          </div>
        </form>
      </div>
=======
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
>>>>>>> origin/main
    </div>
  );
}
