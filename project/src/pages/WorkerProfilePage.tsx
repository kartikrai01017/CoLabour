import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star, MapPin, Clock, ShieldCheck, ArrowLeft, ArrowRight, Loader2, Briefcase, Wallet, MessageSquare, Handshake, Coins,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { FloatingShape, StarRating } from '@/components/ui/Shared';
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
      const { data, error } = await supabase.from('worker_profiles').select('*, users!inner(name, email, phone)').eq('id', id).maybeSingle();
      if (error) console.error('Error fetching worker:', error);
      else setWorker(data as unknown as WorkerWithUser | null);
      setLoading(false);
    }
    fetchWorker();
  }, [id]);

  const handleBook = () => {
    if (!user) { navigate('/login'); return; }
    if (user.role === 'worker') { alert('Workers cannot book other workers. Please sign in as a customer.'); return; }
    navigate(`/book/${id}`);
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center pt-16"><Loader2 size={28} className="animate-spin text-brass" /></div>;
  if (!worker) return (
    <div className="flex min-h-screen flex-col items-center justify-center pt-16 gap-4">
      <p className="text-muted">Worker not found.</p>
      <Link to="/workers"><NeonButton variant="ghost">Browse Workers</NeonButton></Link>
    </div>
  );

  const Icon = CATEGORY_ICONS[worker.category] ?? Star;
  const style = getCategoryStyle(worker.category);

  return (
    <div className="relative min-h-screen overflow-hidden pt-20 pb-12 atmosphere">
      <FloatingShape className="top-20 -left-20 h-[350px] w-[350px] animate-drift-slow" color="brass" />
      <FloatingShape className="bottom-0 -right-20 h-[300px] w-[300px] animate-drift" color="sage" delay={2} />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10">
        <Link to="/workers" className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted hover:text-brass transition-colors duration-300">
          <ArrowLeft size={14} /> Back to co-workers
        </Link>

        <GlassCard className="relative overflow-hidden p-7 mb-5 animate-slide-up border-brass/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brass/[0.03] rounded-full blur-[80px] pointer-events-none" />
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start relative z-10">
            <div className={`h-20 w-20 rounded-2xl border ${style.bg} ${style.border} flex items-center justify-center shrink-0 shadow-lg`}>
              <Icon className={style.text} size={40} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2.5 mb-1.5">
                <h1 className="font-display text-2xl font-bold text-white">{worker.users?.name ?? 'Unknown Worker'}</h1>
                {worker.is_verified && <Badge variant="emerald"><ShieldCheck size={11} /> Verified</Badge>}
                <Badge variant="gray"><Handshake size={10} /> Co-op member</Badge>
              </div>
              <p className="text-sm text-muted mb-2.5">{worker.category}</p>
              <div className="flex flex-wrap items-center gap-3">
                <StarRating rating={worker.rating} size={16} />
                <span className="text-xs text-muted-dark">({worker.total_ratings} reviews)</span>
                {worker.location && <span className="flex items-center gap-1 text-xs text-muted"><MapPin size={12} /> {worker.location}</span>}
              </div>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-sage/8 border border-sage/15 px-2.5 py-1">
                <Coins size={11} className="text-sage" />
                <span className="text-xs text-sage font-medium">Keeps 100% of every payment — no platform cut</span>
              </div>
            </div>
            <div className="text-right">
              <div className="font-display text-2xl font-bold text-white">₹{worker.hourly_rate}</div>
              <p className="text-xs text-brass">per hour · their price</p>
              <p className="text-[11px] text-muted-dark">they set it, they keep it</p>
            </div>
          </div>
        </GlassCard>

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-5">
            {worker.bio && (
              <GlassCard className="p-5">
                <h2 className="mb-2.5 flex items-center gap-2 text-base font-semibold text-white font-display">
                  <MessageSquare size={16} className="text-brass" /> About
                </h2>
                <p className="text-sm text-muted leading-relaxed">{worker.bio}</p>
              </GlassCard>
            )}
            {worker.skills && worker.skills.length > 0 && (
              <GlassCard className="p-5">
                <h2 className="mb-2.5 flex items-center gap-2 text-base font-semibold text-white font-display">
                  <Briefcase size={16} className="text-sage" /> Skills & Expertise
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {worker.skills.map((skill) => <Badge key={skill} variant="cyan">{skill}</Badge>)}
                </div>
              </GlassCard>
            )}
            <GlassCard className="p-5">
              <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-white font-display">
                <Star size={16} className="text-brass" /> Recent Work
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-square rounded-xl bg-base-700 border border-white/[0.04] flex items-center justify-center">
                    <Icon size={28} className="text-muted-dark/40" />
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          <div className="space-y-5">
            <GlassCard className="p-5 sticky top-20 border-brass/10">
              <h2 className="mb-1 font-display text-base font-semibold text-white">Book together</h2>
              <p className="mb-3.5 text-xs text-muted">Direct booking. No fees on either side.</p>
              <div className="space-y-2.5 mb-5">
                <InfoRow icon={Wallet} label="Their rate" value={`₹${worker.hourly_rate}/hr`} />
                <InfoRow icon={Coins} label="You pay → they get" value="Same amount" highlight />
                <InfoRow icon={Clock} label="Availability" value="Available Today" />
                <InfoRow icon={ShieldCheck} label="Verification" value="Verified co-op member" />
              </div>
              <NeonButton fullWidth size="lg" onClick={handleBook}>
                Book Now <ArrowRight size={16} />
              </NeonButton>
              {!user && <p className="mt-2.5 text-center text-xs text-muted-dark"><Link to="/login" className="text-brass hover:underline">Sign in</Link> to book</p>}
              <p className="mt-2.5 text-center text-[11px] text-muted-dark">CoLabour charges neither of you. That's co-operative.</p>
            </GlassCard>
            <GlassCard className="p-5">
              <h3 className="mb-2.5 text-[11px] font-semibold text-muted-light uppercase tracking-wider">Contact</h3>
              <div className="space-y-1.5 text-sm text-muted">
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

function InfoRow({ icon: Icon, label, value, highlight }: { icon: typeof Wallet; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1.5 text-sm text-muted"><Icon size={14} className={highlight ? 'text-brass' : 'text-muted-dark'} /> {label}</span>
      <span className={`text-sm font-medium ${highlight ? 'text-brass' : 'text-muted-light'}`}>{value}</span>
    </div>
  );
}
