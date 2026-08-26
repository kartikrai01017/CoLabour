import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar, MapPin, Clock, ArrowLeft, ArrowRight, Loader2, AlertCircle, Check
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

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00');
  const [hours, setHours] = useState('1');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    async function loadWorker() {
      if (!id) return;
      try {
        const { data, error: fetchErr } = await supabase
          .from('worker_profiles')
          .select('*, users(name, email, phone)')
          .eq('id', id)
          .maybeSingle();

        if (fetchErr) throw fetchErr;

        if (data) {
          setWorker(data as unknown as WorkerWithUser);
        } else {
          const { data: byUser } = await supabase
            .from('worker_profiles')
            .select('*, users(name, email, phone)')
            .eq('user_id', id)
            .maybeSingle();
          if (byUser) setWorker(byUser as unknown as WorkerWithUser);
        }
      } catch (err) {
        console.error('Worker load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadWorker();
  }, [id]);

  const hourlyRate = Number(worker?.hourly_rate) || 150;
  const totalAmount = hourlyRate * (parseFloat(hours) || 1);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      alert('Please login first to book a service.');
      navigate('/login');
      return;
    }

    if (!worker) {
      setError('Worker profile could not be loaded.');
      return;
    }

    if (!date || !time || !address.trim()) {
      setError('Please fill in date, time, and address.');
      return;
    }

    setSubmitting(true);

    try {
      const scheduledAt = new Date(`${date}T${time}`).toISOString();

      const { data: booking, error: insertError } = await supabase
        .from('bookings')
        .insert({
          customer_id: user.id,
          worker_id: worker.id,
          category: worker.category || 'General',
          scheduled_at: scheduledAt,
          address: address.trim(),
          total_amount: totalAmount,
          status: 'pending',
          notes: notes.trim() || 'Service Booking',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Direct clean redirect to Payment Page
      navigate(`/payment/${booking.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create booking.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-16 bg-[#070b14]">
        <Loader2 size={32} className="animate-spin text-neon-emerald" />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center pt-16 gap-4 bg-[#070b14] text-slate-100">
        <p className="text-gray-400">Worker record not found.</p>
        <Link to="/workers">
          <NeonButton variant="emerald">Back to Workers</NeonButton>
        </Link>
      </div>
    );
  }

  const Icon = CATEGORY_ICONS[worker.category] ?? Calendar;
  const style = getCategoryStyle(worker.category);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070b14] pt-20 pb-12 text-slate-100">
      <GlowOrb className="top-20 -left-20 h-80 w-80 bg-neon-emerald/10 blur-[120px]" />
      <GlowOrb className="bottom-0 right-0 h-80 w-80 bg-neon-cyan/10 blur-[120px]" />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link to="/workers" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-neon-emerald transition-colors">
          <ArrowLeft size={16} /> Back to Directory
        </Link>

        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold gradient-text-emerald-cyan">Book Service</h1>
          <p className="mt-2 text-gray-400">Schedule your appointment with {worker.users?.name ?? 'Professional Worker'}</p>
        </div>

        {/* Worker Summary Card */}
        <GlassCard className="mb-6 p-5 flex items-center gap-4">
          <div className={`h-16 w-16 rounded-2xl border ${style.bg} ${style.border} flex items-center justify-center`}>
            <Icon className={style.text} size={30} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white text-lg">{worker.users?.name ?? 'Professional Worker'}</h3>
            <p className="text-sm text-gray-400">{worker.category} • <strong className="text-emerald-400">₹{hourlyRate}/hr</strong></p>
          </div>
          <Badge variant="emerald"><Check size={12} /> Verified</Badge>
        </GlassCard>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date & Time */}
          <GlassCard className="p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-200">
              <Calendar size={18} className="text-neon-cyan" /> Select Date & Time
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-base-800/60 p-3 text-sm text-gray-200 outline-none focus:border-neon-emerald/40"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-base-800/60 p-3 text-sm text-gray-200 outline-none focus:border-neon-emerald/40"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Duration (hours)</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setHours(String(Math.max(1, (parseInt(hours) || 1) - 1)))}
                  className="rounded-lg border border-white/10 px-3.5 py-2 text-gray-300 hover:border-neon-emerald cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  min="1"
                  max="12"
                  className="w-20 rounded-xl border border-white/10 bg-base-800/60 p-2 text-center text-sm text-gray-200 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setHours(String((parseInt(hours) || 1) + 1))}
                  className="rounded-lg border border-white/10 px-3.5 py-2 text-gray-300 hover:border-neon-emerald cursor-pointer"
                >
                  +
                </button>
                <span className="text-sm text-gray-400">hours</span>
              </div>
            </div>
          </GlassCard>

          {/* Address */}
          <GlassCard className="p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-200">
              <MapPin size={18} className="text-neon-emerald" /> Service Address
            </h2>
            <div>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                placeholder="Enter complete house address / landmark..."
                className="w-full rounded-xl border border-white/10 bg-base-800/60 p-3 text-sm text-gray-200 outline-none focus:border-neon-emerald/40 min-h-[80px]"
              />
            </div>
          </GlassCard>

          {/* Notes */}
          <GlassCard className="p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-200">
              <Clock size={18} className="text-neon-violet" /> Work Details (Optional)
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe the task or issue..."
              className="w-full rounded-xl border border-white/10 bg-base-800/60 p-3 text-sm text-gray-200 outline-none focus:border-neon-emerald/40 min-h-[70px]"
            />
          </GlassCard>

          {/* Summary & Submit */}
          <GlassCard className="p-6">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Rate:</span>
                <span className="text-gray-200 font-medium">₹{hourlyRate}/hr</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Duration:</span>
                <span className="text-gray-200 font-medium">{hours} hr(s)</span>
              </div>
              <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                <span className="text-lg font-semibold text-white">Estimated Total</span>
                <span className="text-3xl font-black text-neon-emerald">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 py-4 text-base font-bold text-black shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Scheduling...
                </>
              ) : (
                <>
                  Confirm Booking & Pay <ArrowRight size={18} />
                </>
              )}
            </button>
          </GlassCard>
        </form>
      </div>
    </div>
  );
}
