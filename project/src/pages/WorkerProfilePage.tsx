import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star, MapPin, Clock, ShieldCheck, ArrowLeft, ArrowRight, Loader2, Briefcase, Wallet, MessageSquare,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { GlowOrb, StarRating } from '@/components/ui/Shared';
import { supabase, type WorkerWithUser } from '@/lib/supabase';
import { CATEGORY_ICONS, getCategoryStyle } from '@/lib/categories';
import { useAuth } from '@/context/AuthContext';

export function WorkerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [worker, setWorker] = useState<WorkerWithUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWorker() {
      if (!id) return;
      const { data, error } = await supabase
        .from('worker_profiles')
        .select('*, users!inner(name, email, phone)')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching worker:', error);
      } else {
        setWorker(data as unknown as WorkerWithUser | null);
      }
      setLoading(false);
    }
    fetchWorker();
  }, [id]);

  const handleBook = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'worker') {
      alert('Workers cannot book other workers. Please sign in as a customer.');
      return;
    }
    navigate(`/book/${id}`);
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

  const Icon = CATEGORY_ICONS[worker.category] ?? Star;
  const style = getCategoryStyle(worker.category);

  return (
    <div className="relative min-h-screen overflow-hidden pt-20 pb-12">
      <GlowOrb className="top-20 -left-20 h-80 w-80 bg-neon-emerald/10" />
      <GlowOrb className="bottom-0 right-0 h-80 w-80 bg-neon-cyan/10" />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link to="/workers" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-neon-emeraldGlow transition-colors">
          <ArrowLeft size={16} /> Back to Workers
        </Link>

        {/* Hero card */}
        <GlassCard className="relative overflow-hidden p-8 mb-6 animate-slide-up">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className={`h-24 w-24 rounded-3xl border ${style.bg} ${style.border} ${style.glow} flex items-center justify-center shrink-0`}>
              <Icon className={style.text} size={48} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{worker.users?.name ?? 'Unknown Worker'}</h1>
                {worker.is_verified && (
                  <Badge variant="emerald"><ShieldCheck size={12} /> Verified</Badge>
                )}
              </div>
              <p className="text-lg text-gray-400 mb-3">{worker.category}</p>
              <div className="flex flex-wrap items-center gap-4">
                <StarRating rating={worker.rating} size={18} />
                <span className="text-sm text-gray-500">({worker.total_ratings} reviews)</span>
                {worker.location && (
                  <span className="flex items-center gap-1 text-sm text-gray-400">
                    <MapPin size={14} /> {worker.location}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold gradient-text-emerald-cyan">₹{worker.hourly_rate}</div>
              <p className="text-sm text-gray-500">per hour</p>
            </div>
          </div>
        </GlassCard>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {worker.bio && (
              <GlassCard className="p-6">
                <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-200">
                  <MessageSquare size={18} className="text-neon-cyan" /> About
                </h2>
                <p className="text-gray-400 leading-relaxed">{worker.bio}</p>
              </GlassCard>
            )}

            {worker.skills && worker.skills.length > 0 && (
              <GlassCard className="p-6">
                <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-200">
                  <Briefcase size={18} className="text-neon-emerald" /> Skills & Expertise
                </h2>
                <div className="flex flex-wrap gap-2">
                  {worker.skills.map((skill) => (
                    <Badge key={skill} variant="cyan">{skill}</Badge>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Portfolio placeholder */}
            <GlassCard className="p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-200">
                <Star size={18} className="text-amber-400" /> Recent Work
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-square rounded-xl bg-gradient-to-br from-base-700 to-base-800 border border-white/5 flex items-center justify-center">
                    <Icon size={32} className="text-gray-600" />
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Right column - Booking */}
          <div className="space-y-6">
            <GlassCard className="p-6 sticky top-24">
              <h2 className="mb-4 text-lg font-semibold text-gray-200">Book This Worker</h2>

              <div className="space-y-3 mb-6">
                <InfoRow icon={Wallet} label="Rate" value={`₹${worker.hourly_rate}/hr`} />
                <InfoRow icon={Clock} label="Availability" value="Available Today" />
                <InfoRow icon={ShieldCheck} label="Verification" value="Verified Pro" />
              </div>

              <NeonButton fullWidth size="lg" onClick={handleBook}>
                Book Now <ArrowRight size={18} />
              </NeonButton>

              {!user && (
                <p className="mt-3 text-center text-xs text-gray-500">
                  <Link to="/login" className="text-neon-emeraldGlow hover:underline">Sign in</Link> to book
                </p>
              )}
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="mb-3 text-sm font-semibold text-gray-300">Contact Info</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <p>{worker.users?.email}</p>
                <p>{worker.users?.phone ?? 'Phone not provided'}</p>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Wallet; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-sm text-gray-400">
        <Icon size={16} className="text-gray-500" /> {label}
      </span>
      <span className="text-sm font-medium text-gray-200">{value}</span>
    </div>
  );
}
