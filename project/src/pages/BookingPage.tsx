import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar, MapPin, Clock, ArrowLeft, ArrowRight, Loader2, AlertCircle, Navigation, Check,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { GlowOrb } from '@/components/ui/Shared';
import { supabase, type WorkerWithUser } from '@/lib/supabase';
import { CATEGORY_ICONS, getCategoryStyle } from '@/lib/categories';
import { useAuth } from '@/context/AuthContext';

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
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    async function fetchWorker() {
      if (!id) return;
      const { data } = await supabase
        .from('worker_profiles')
        .select('*, users!inner(name, email, phone)')
        .eq('id', id)
        .maybeSingle();
      setWorker(data as unknown as WorkerWithUser | null);
      setLoading(false);
    }
    fetchWorker();
  }, [id]);

  const totalAmount = worker ? (worker.hourly_rate * parseFloat(hours || '0')) : 0;

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          if (!address) setAddress(`Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}`);
        },
        () => setError('Could not get your location. Please enter address manually.')
      );
    } else {
      setError('Geolocation is not supported on this device.');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
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

    setSubmitting(true);

    try {
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          customer_id: user.id,
          worker_id: worker.id,
          category: worker.category,
          scheduled_at: scheduledAt.toISOString(),
          address,
          total_amount: totalAmount,
          status: 'pending',
          notes,
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      navigate(`/payment/${booking.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create booking';
      setError(msg);
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

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link to={`/workers/${id}`} className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-neon-emeraldGlow transition-colors">
          <ArrowLeft size={16} /> Back to Profile
        </Link>

        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold gradient-text-emerald-cyan">Book Your Appointment</h1>
          <p className="mt-2 text-gray-400">Schedule a service with {worker.users?.name}</p>
        </div>

        {/* Worker summary */}
        <GlassCard className="mb-6 p-5 flex items-center gap-4">
          <div className={`h-16 w-16 rounded-2xl border ${style.bg} ${style.border} flex items-center justify-center`}>
            <Icon className={style.text} size={30} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">{worker.users?.name}</h3>
            <p className="text-sm text-gray-400">{worker.category} • ₹{worker.hourly_rate}/hr</p>
          </div>
          <Badge variant="emerald"><Check size={12} /> Verified</Badge>
        </GlassCard>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date & Time */}
          <GlassCard className="p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-200">
              <Calendar size={18} className="text-neon-cyan" /> Date & Time
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required
                  min={new Date().toISOString().split('T')[0]}
                  className="booking-input" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Time</label>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required
                  className="booking-input" />
              </div>
            </div>
            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Duration (hours)</label>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setHours(String(Math.max(1, parseInt(hours) - 1)))}
                  className="rounded-lg border border-white/10 px-3 py-2 text-gray-300 hover:border-neon-emerald/30">-</button>
                <input type="number" value={hours} onChange={(e) => setHours(e.target.value)} min="1" max="12"
                  className="booking-input text-center max-w-[80px]" />
                <button type="button" onClick={() => setHours(String(parseInt(hours) + 1))}
                  className="rounded-lg border border-white/10 px-3 py-2 text-gray-300 hover:border-neon-emerald/30">+</button>
                <span className="text-sm text-gray-400">hours</span>
              </div>
            </div>
          </GlassCard>

          {/* Location */}
          <GlassCard className="p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-200">
              <MapPin size={18} className="text-neon-emerald" /> Service Location
            </h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Address</label>
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} required
                  placeholder="Enter your full address..."
                  className="booking-input min-h-[80px] resize-none" />
              </div>
              <NeonButton type="button" variant="ghost" size="sm" onClick={handleUseMyLocation}>
                <Navigation size={16} /> Use My Current Location
              </NeonButton>
              {location && (
                <div className="flex items-center gap-2 text-sm text-neon-emerald">
                  <Check size={14} /> Location captured: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </div>
              )}
              {/* Map placeholder */}
              <div className="relative h-48 rounded-xl border border-white/10 bg-base-800 overflow-hidden">
                <div className="absolute inset-0 grid-bg opacity-50" />
                <div className="absolute inset-0 flex items-center justify-center">
                  {location ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative">
                        <MapPin size={32} className="text-neon-emerald" fill="currentColor" />
                        <div className="absolute inset-0 animate-ping rounded-full bg-neon-emerald/30" />
                      </div>
                      <span className="text-xs text-gray-400">Your location</span>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <MapPin size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Click "Use My Current Location" to pin your address on the map</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Notes */}
          <GlassCard className="p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-200">
              <Clock size={18} className="text-neon-violet" /> Additional Notes
            </h2>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe the work you need done..."
              className="booking-input min-h-[80px] resize-none" />
          </GlassCard>

          {/* Summary */}
          <GlassCard className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-200">Booking Summary</h2>
            <div className="space-y-2 mb-4">
              <SummaryRow label="Worker" value={worker.users?.name ?? ''} />
              <SummaryRow label="Category" value={worker.category} />
              <SummaryRow label="Duration" value={`${hours} hour(s)`} />
              <SummaryRow label="Rate" value={`₹${worker.hourly_rate}/hr`} />
              <div className="border-t border-white/10 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-200">Total Amount</span>
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
              {submitting ? <><Loader2 size={18} className="animate-spin" /> Creating booking...</> : <>Proceed to Payment <ArrowRight size={18} /></>}
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
