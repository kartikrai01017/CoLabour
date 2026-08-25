import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar, MapPin, Clock, ArrowLeft, ArrowRight, Loader2, AlertCircle, Navigation, Check,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { FloatingShape } from '@/components/ui/Shared';
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
        <Loader2 size={28} className="animate-spin text-brass" />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center pt-16 gap-4">
        <p className="text-muted">Worker not found.</p>
        <Link to="/workers"><NeonButton variant="ghost">Browse Workers</NeonButton></Link>
      </div>
    );
  }

  const Icon = CATEGORY_ICONS[worker.category] ?? Calendar;
  const style = getCategoryStyle(worker.category);

  return (
    <div className="relative min-h-screen overflow-hidden pt-20 pb-12 atmosphere">
      <FloatingShape className="top-20 -left-20 h-[350px] w-[350px] animate-drift-slow" color="neon-cyan" />
      <FloatingShape className="bottom-0 -right-20 h-[300px] w-[300px] animate-drift" color="neon-purple" delay={2} />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 relative z-10">
        <Link to={`/workers/${id}`} className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted hover:text-brass transition-colors duration-300">
          <ArrowLeft size={14} /> Back to Profile
        </Link>

        <div className="mb-7 animate-fade-in">
          <h1 className="text-2xl font-bold gradient-text">Book Your Appointment</h1>
          <p className="mt-1.5 text-muted">Schedule a service with {worker.users?.name}</p>
        </div>

        <GlassCard className="mb-5 p-4 flex items-center gap-3.5">
          <div className={`h-12 w-12 rounded-xl border ${style.bg} ${style.border} flex items-center justify-center shadow-lg`}>
            <Icon className={style.text} size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white text-sm">{worker.users?.name}</h3>
            <p className="text-xs text-muted">{worker.category} · ₹{worker.hourly_rate}/hr</p>
          </div>
          <Badge variant="emerald"><Check size={11} /> Verified</Badge>
        </GlassCard>

        <form onSubmit={handleSubmit} className="space-y-5">
          <GlassCard className="p-5">
            <h2 className="mb-3.5 flex items-center gap-2 text-base font-semibold text-white">
              <Calendar size={16} className="text-brass" /> Date & Time
            </h2>
            <div className="grid gap-3.5 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-muted-light">Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required
                  min={new Date().toISOString().split('T')[0]}
                  className="booking-input" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-muted-light">Time</label>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required
                  className="booking-input" />
              </div>
            </div>
            <div className="mt-3.5">
              <label className="mb-1 block text-sm font-medium text-muted-light">Duration (hours)</label>
              <div className="flex items-center gap-2.5">
                <button type="button" onClick={() => setHours(String(Math.max(1, parseInt(hours) - 1)))}
                  className="rounded-lg border border-white/[0.06] px-2.5 py-1.5 text-sm text-muted-light hover:border-brass/20 hover:shadow-brass transition-all duration-300">-</button>
                <input type="number" value={hours} onChange={(e) => setHours(e.target.value)} min="1" max="12"
                  className="booking-input text-center max-w-[72px]" />
                <button type="button" onClick={() => setHours(String(parseInt(hours) + 1))}
                  className="rounded-lg border border-white/[0.06] px-2.5 py-1.5 text-sm text-muted-light hover:border-brass/20 hover:shadow-brass transition-all duration-300">+</button>
                <span className="text-xs text-muted">hours</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <h2 className="mb-3.5 flex items-center gap-2 text-base font-semibold text-white">
              <MapPin size={16} className="text-brass" /> Service Location
            </h2>
            <div className="space-y-2.5">
              <div>
                <label className="mb-1 block text-sm font-medium text-muted-light">Address</label>
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} required
                  placeholder="Enter your full address..."
                  className="booking-input min-h-[72px] resize-none" />
              </div>
              <NeonButton type="button" variant="ghost" size="sm" onClick={handleUseMyLocation}>
                <Navigation size={14} /> Use My Current Location
              </NeonButton>
              {location && (
                <div className="flex items-center gap-1.5 text-xs text-brass text-shadow-neon">
                  <Check size={12} /> Location captured: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </div>
              )}
              <div className="relative h-40 rounded-xl border border-white/[0.04] bg-base-800 overflow-hidden">
                <div className="absolute inset-0 grid-bg opacity-30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  {location ? (
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="relative">
                        <MapPin size={28} className="text-brass drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]" fill="currentColor" />
                        <div className="absolute inset-0 animate-ping rounded-full bg-brass/20" />
                      </div>
                      <span className="text-[11px] text-muted">Your location</span>
                    </div>
                  ) : (
                    <div className="text-center text-muted-dark">
                      <MapPin size={28} className="mx-auto mb-1.5 opacity-30" />
                      <p className="text-xs">Click "Use My Current Location" to pin your address</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <h2 className="mb-3.5 flex items-center gap-2 text-base font-semibold text-white">
              <Clock size={16} className="text-sage" /> Additional Notes
            </h2>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe the work you need done..."
              className="booking-input min-h-[72px] resize-none" />
          </GlassCard>

          <GlassCard className="p-5">
            <h2 className="mb-3.5 text-base font-semibold text-white">Booking Summary</h2>
            <div className="space-y-1.5 mb-3.5">
              <SummaryRow label="Worker" value={worker.users?.name ?? ''} />
              <SummaryRow label="Category" value={worker.category} />
              <SummaryRow label="Duration" value={`${hours} hour(s)`} />
              <SummaryRow label="Rate" value={`₹${worker.hourly_rate}/hr`} />
              <div className="border-t border-white/[0.04] pt-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-white">Total Amount</span>
                  <span className="text-xl font-bold gradient-text">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-3.5 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/8 px-3.5 py-2.5 text-sm text-red-400">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <NeonButton type="submit" fullWidth size="lg" disabled={submitting}>
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Creating booking...</> : <>Proceed to Payment <ArrowRight size={16} /></>}
            </NeonButton>
          </GlassCard>
        </form>
      </div>

      <style>{`
        .booking-input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(255,255,255,0.04);
          background: rgba(5,5,8,0.8);
          padding: 0.5rem 0.75rem;
          color: #c4c4d4;
          font-size: 0.875rem;
          outline: none;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .booking-input:focus {
          border-color: rgba(0,240,255,0.3);
          box-shadow: 0 0 0 3px rgba(0,240,255,0.06), 0 0 20px rgba(0,240,255,0.05);
        }
        .booking-input::placeholder { color: #5a5a70; }
        .booking-input::-webkit-calendar-picker-indicator { filter: invert(0.7); }
      `}</style>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-muted-light">{value}</span>
    </div>
  );
}
