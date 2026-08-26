import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, AlertCircle, Loader2, ArrowLeft, Briefcase, IndianRupee, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { GlowOrb } from '@/components/ui/Shared';
import { supabase, type WorkerProfile } from '@/lib/supabase';
import { CATEGORY_ICONS, getCategoryStyle } from '@/lib/categories';
import { useAuth } from '@/context/AuthContext';

interface WorkerWithUser extends WorkerProfile {
  users?: { name: string; email: string; phone?: string } | null;
}

export function BookingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [worker, setWorker] = useState<WorkerWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Rapido style waiting screen states - persist across refresh via localStorage
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(() => {
    try { return localStorage.getItem('pendingBookingId'); } catch { return null; }
  });
  const [requestStatus, setRequestStatus] = useState<'idle' | 'waiting' | 'accepted' | 'rejected'>(() => {
    try {
      const s = localStorage.getItem('pendingBookingStatus');
      return (s as any) ?? 'idle';
    } catch { return 'idle'; }
  });

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [hours, setHours] = useState(2);
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const pollIntervalRef = useRef<any>(null);

  useEffect(() => {
    async function fetchWorker() {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('worker_profiles')
          .select('*, users:user_id(name, email, phone)')
          .eq('id', id)
          .single();

        if (error) throw error;
        setWorker(data as unknown as WorkerWithUser);
      } catch (err) {
        console.error('Error fetching worker:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchWorker();
  }, [id]);

  // Persist waiting state for refresh recovery
  useEffect(() => {
    try {
      if (createdBookingId) localStorage.setItem('pendingBookingId', createdBookingId);
      else localStorage.removeItem('pendingBookingId');
      localStorage.setItem('pendingBookingStatus', requestStatus);
    } catch {}
  }, [createdBookingId, requestStatus]);

  const clearPendingState = () => {
    setCreatedBookingId(null);
    setRequestStatus('idle');
    try { localStorage.removeItem('pendingBookingId'); localStorage.setItem('pendingBookingStatus', 'idle'); } catch {}
  };

  // Live polling for worker response (Accept / Reject) - also re-hydrates on refresh
  useEffect(() => {
    if (!createdBookingId || requestStatus !== 'waiting') return;

    // immediate check on mount in case status already changed while away
    const checkOnce = async () => {
      const { data } = await supabase.from('bookings').select('status').eq('id', createdBookingId).maybeSingle();
      if (!data) { clearPendingState(); return; }
      if (data.status === 'confirmed') {
        setRequestStatus('accepted');
        clearInterval(pollIntervalRef.current);
        localStorage.setItem('pendingBookingStatus', 'accepted');
        setTimeout(() => { clearPendingState(); navigate('/customer/dashboard'); }, 2000);
      } else if (data.status === 'cancelled') {
        setRequestStatus('rejected');
        clearInterval(pollIntervalRef.current);
        localStorage.setItem('pendingBookingStatus', 'rejected');
      } else if (['paid','completed','payment_submitted'].includes(data.status)) {
        // edge: worker confirmed and customer already moving to payment
        setRequestStatus('accepted');
        clearInterval(pollIntervalRef.current);
        setTimeout(() => { clearPendingState(); navigate('/customer/dashboard'); }, 1500);
      }
    };
    checkOnce();
    pollIntervalRef.current = setInterval(checkOnce, 2500);

    return () => clearInterval(pollIntervalRef.current);
  }, [createdBookingId, requestStatus, navigate]);

  const totalAmount = worker ? Number(worker.hourly_rate) * hours : 0;

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!date || !time || !address) { setErrorMsg('Date, Time aur Address bharein.'); return; }
    // Validate future datetime
    const scheduledAt = new Date(`${date}T${time}`);
    if (isNaN(scheduledAt.getTime()) || scheduledAt.getTime() < Date.now() - 60000) {
      setErrorMsg('Please select a future date & time.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const iso = scheduledAt.toISOString();
      // Try with hours; fallback without hours if column missing in DB
      let data: any = null;
      let error: any = null;
      const payloadWithHours: any = {
        customer_id: user.id,
        worker_id: worker?.id,
        category: worker?.category,
        address,
        notes: notes || null,
        scheduled_at: iso,
        total_amount: totalAmount,
        hours,
        status: 'pending',
      };
      const res1 = await supabase.from('bookings').insert([payloadWithHours]).select().single();
      data = res1.data; error = res1.error;
      if (error && /hours/i.test(error.message)) {
        const { hours: _h, ...payloadNoHours } = payloadWithHours;
        // Encode hours in notes if column missing
        const notesWithHours = `Duration: ${hours}h` + (notes ? ` | ${notes}` : '');
        (payloadNoHours as any).notes = notesWithHours;
        const res2 = await supabase.from('bookings').insert([payloadNoHours]).select().single();
        data = res2.data; error = res2.error;
      }
      if (error) throw error;

      setCreatedBookingId(data.id);
      setRequestStatus('waiting');
      try { localStorage.setItem('pendingBookingId', data.id); localStorage.setItem('pendingBookingStatus', 'waiting'); } catch {}
    } catch (err: any) {
      setErrorMsg(err.message || 'Request bhejne me error aayi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelWaiting = async () => {
    if (!createdBookingId) { clearPendingState(); return; }
    try {
      await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', createdBookingId);
    } catch {}
    clearPendingState();
  };

  if (loading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-16">
        <Loader2 size={32} className="animate-spin text-neon-emerald" />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center pt-16 gap-4">
        <AlertCircle className="text-red-400" size={32} />
        <p className="text-gray-400">Worker profile nahi mili.</p>
        <NeonButton onClick={() => navigate('/workers')}>Browse Workers</NeonButton>
      </div>
    );
  }

  const Icon = CATEGORY_ICONS[worker.category] ?? Briefcase;
  const style = getCategoryStyle(worker.category);

  return (
    <div className="relative min-h-screen overflow-hidden pt-20 pb-12">
      <GlowOrb className="top-20 -left-20 h-80 w-80 bg-neon-violet/10" />
      <GlowOrb className="bottom-0 right-0 h-80 w-80 bg-neon-emerald/10" />

      {/* Rapido / Uber Style Waiting Overlay */}
      {requestStatus === 'waiting' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <GlassCard className="max-w-md w-full p-8 text-center border-neon-cyan/40 shadow-2xl">
            <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
              <span className="absolute h-full w-full animate-ping rounded-full bg-neon-cyan/20 duration-1000" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-neon-cyan/10 border border-neon-cyan text-neon-cyan">
                <Loader2 size={40} className="animate-spin" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Connecting to Worker...</h2>
            <p className="text-sm text-gray-300 mb-6">
              Request <span className="text-neon-cyan font-bold">{worker.users?.name}</span> ko bhej di gayi hai. Unke Accept/Reject karne ka wait karein.
            </p>
            <div className="text-xs text-gray-500 animate-pulse mb-4">Waiting for response...</div>
            <NeonButton variant="ghost" size="sm" onClick={handleCancelWaiting}>Cancel Request</NeonButton>
          </GlassCard>
        </div>
      )}

      {/* Request Accepted Modal */}
      {requestStatus === 'accepted' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <GlassCard className="max-w-md w-full p-8 text-center border-neon-emerald/40">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neon-emerald/20 text-neon-emerald">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Request Accepted! 🎉</h2>
            <p className="text-sm text-gray-300">Worker ne aapki booking confirm kar li hai. Dashboard par le ja rahe hain...</p>
          </GlassCard>
        </div>
      )}

      {/* Request Rejected Modal */}
      {requestStatus === 'rejected' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <GlassCard className="max-w-md w-full p-8 text-center border-red-500/40">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 text-red-400">
              <XCircle size={40} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Request Declined</h2>
            <p className="text-sm text-gray-300 mb-6">Worker filhal available nahi hai. Kripya kisi doosre worker ko choose karein.</p>
            <NeonButton fullWidth variant="ghost" onClick={() => { clearPendingState(); }}>
              Try Another Time / Worker
            </NeonButton>
          </GlassCard>
        </div>
      )}

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-1">
            <GlassCard className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className={`h-20 w-20 rounded-2xl border ${style.bg} ${style.border} flex items-center justify-center mb-4`}>
                  <Icon className={style.text} size={40} />
                </div>
                <h2 className="text-xl font-bold text-white">{worker.users?.name ?? 'Worker'}</h2>
                <p className="text-sm text-gray-400 mb-2">{worker.category}</p>
                <Badge variant={worker.is_verified ? 'emerald' : 'amber'}>
                  <ShieldCheck size={12} /> {worker.is_verified ? 'Verified' : 'Pending Verification'}
                </Badge>
                <div className="mt-6 w-full border-t border-white/10 pt-4 text-left space-y-2 text-sm text-gray-300">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Hourly Rate:</span>
                    <span className="font-semibold text-white">₹{worker.hourly_rate}/hr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Rating:</span>
                    <span className="font-semibold text-amber-400">★ {worker.rating?.toFixed(1) || '5.0'}</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          <div className="md:col-span-2">
            <GlassCard className="p-6">
              <h1 className="text-xl font-bold text-white mb-1">Book Service</h1>
              <p className="text-xs text-gray-400 mb-6">Details bharein aur request send karein.</p>

              {errorMsg && (
                <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400 flex items-center gap-2">
                  <AlertCircle size={16} /> {errorMsg}
                </div>
              )}

              <form onSubmit={handleBooking} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1.5">
                      <Calendar size={14} className="text-neon-cyan" /> Service Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="w-full rounded-xl border border-white/10 bg-base-800/60 px-4 py-2.5 text-sm text-gray-200 outline-none focus:border-neon-emerald/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1.5">
                      <Clock size={14} className="text-neon-cyan" /> Service Time
                    </label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      required
                      className="w-full rounded-xl border border-white/10 bg-base-800/60 px-4 py-2.5 text-sm text-gray-200 outline-none focus:border-neon-emerald/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Duration: <span className="text-neon-emerald font-bold">{hours} hr</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                    className="w-full accent-neon-emerald"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1.5">
                    <MapPin size={14} className="text-neon-cyan" /> Service Address
                  </label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Pura address likhein..."
                    required
                    className="w-full rounded-xl border border-white/10 bg-base-800/60 px-4 py-2.5 text-sm text-gray-200 outline-none focus:border-neon-emerald/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Special Notes (Optional)</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Kaam se judi koi jaankari..."
                    className="w-full rounded-xl border border-white/10 bg-base-800/60 px-4 py-2.5 text-sm text-gray-200 outline-none focus:border-neon-emerald/40"
                  />
                </div>

                <div className="rounded-xl border border-white/5 bg-base-800/40 p-4 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-400">Total Estimated Cost</p>
                    <p className="text-lg font-bold text-white flex items-center">
                      <IndianRupee size={16} /> {totalAmount.toFixed(2)}
                    </p>
                  </div>
                  <Badge variant="cyan">{hours} Hours x ₹{worker.hourly_rate}</Badge>
                </div>

                <NeonButton type="submit" fullWidth variant="emerald" disabled={submitting}>
                  {submitting ? 'Connecting...' : 'Request Booking Now'}
                </NeonButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
