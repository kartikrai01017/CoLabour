import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star, MapPin, Clock, ShieldCheck, ArrowLeft, ArrowRight, Loader2, Briefcase, Wallet, MessageSquare,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { GlowOrb, StarRating } from '@/components/ui/Shared';
import { type WorkerWithUser } from '@/lib/supabase';
import { CATEGORY_ICONS, getCategoryStyle } from '@/lib/categories';
import { useAuth } from '@/context/AuthContext';
import { fetchWorkerProfile } from '@/lib/dataService';

export function WorkerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [worker, setWorker] = useState<WorkerWithUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchWorker() {
      if (!id) return;
      setLoading(true);
      try {
        const data = await fetchWorkerProfile(id);
        if (mounted) {
          setWorker(data);
        }
      } catch {
        if (mounted) setWorker(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchWorker();

    return () => {
      mounted = false;
    };
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

  const Icon = CATEGORY_ICONS[worker.category] ?? Star;
  const style = getCategoryStyle(worker.category);

  return (
    <div className="relative min-h-screen overflow-hidden pt-20 pb-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link to="/workers" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-nb-text-muted hover:text-nb-accent-orange transition-colors">
          <ArrowLeft size={16} /> Back to Workers
        </Link>

        {/* Hero card */}
        <GlassCard className="relative overflow-hidden p-8 mb-6 animate-slide-up border-[4px] shadow-nb-xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className={`h-24 w-24 rounded-nb-xl border-[3px] border-nb-ink bg-nb-surface flex items-center justify-center shrink-0 shadow-nb-lg`}>
              <Icon className="text-nb-ink" size={48} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-extrabold text-nb-ink">{worker.users?.name ?? 'Unknown Worker'}</h1>
                {worker.is_verified && (
                  <Badge variant="emerald"><ShieldCheck size={12} /> Verified</Badge>
                )}
              </div>
              <p className="text-lg font-semibold text-nb-text-muted mb-3">{worker.category}</p>
              <div className="flex flex-wrap items-center gap-4">
                <StarRating rating={worker.rating} size={18} />
                <span className="text-sm font-medium text-nb-text-muted">({worker.total_ratings} reviews)</span>
                {worker.location && (
                  <span className="flex items-center gap-1 text-sm font-medium text-nb-text-muted">
                    <MapPin size={14} /> {worker.location}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:items-end justify-between">
              <div className="text-right">
                <span className="text-3xl font-extrabold text-nb-ink">₹{worker.hourly_rate}</span>
                <span className="text-nb-text-muted text-sm font-medium">/hr</span>
              </div>
              <NeonButton onClick={handleBook} size="lg" variant="amber" className="mt-4">
                Book Now <ArrowRight size={18} />
              </NeonButton>
            </div>
          </div>
        </GlassCard>

        {/* Details Grid */}
        <div className="grid gap-6 md:grid-cols-3 mb-6">
          {/* Bio */}
          <GlassCard className="p-6 md:col-span-2">
            <h2 className="text-lg font-bold text-nb-ink mb-3 flex items-center gap-2">
              <Briefcase size={18} /> About
            </h2>
            <p className="text-nb-ink leading-relaxed text-sm">
              {worker.bio || 'No bio provided.'}
            </p>

            <h3 className="text-xs font-bold uppercase tracking-wider text-nb-text-muted mt-6 mb-3">Skills & Specializations</h3>
            <div className="flex flex-wrap gap-2">
              {worker.skills?.map((skill) => (
                <span key={skill} className="rounded-nb-sm bg-nb-surface-muted border-[1.5px] border-nb-ink/20 px-3 py-1.5 text-xs font-semibold text-nb-ink">
                  {skill}
                </span>
              ))}
            </div>
          </GlassCard>

          {/* Quick Info */}
          <div className="space-y-6">
            <GlassCard className="p-6">
              <h2 className="text-lg font-bold text-nb-ink mb-4">Highlights</h2>
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3 font-medium text-nb-ink">
                  <ShieldCheck size={18} className="text-nb-accent-green shrink-0" />
                  <span>100% Background Verified</span>
                </div>
                <div className="flex items-center gap-3 font-medium text-nb-ink">
                  <Wallet size={18} className="text-nb-accent-blue shrink-0" />
                  <span>Direct UPI Payments</span>
                </div>
                <div className="flex items-center gap-3 font-medium text-nb-ink">
                  <Clock size={18} className="text-nb-accent-orange shrink-0" />
                  <span>Prompt Response Rate</span>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6 border-[4px] shadow-nb-xl">
              <h2 className="text-lg font-bold text-nb-ink mb-2">Need Custom Work?</h2>
              <p className="text-xs text-nb-text-muted font-medium mb-4 leading-relaxed">
                You can specify exact requirements and provide special notes during the booking step.
              </p>
              <NeonButton onClick={handleBook} fullWidth size="md" variant="amber">
                Request Service
              </NeonButton>
            </GlassCard>
          </div>
        </div>

        {/* Reviews Section */}
        <GlassCard className="p-6">
          <h2 className="text-lg font-bold text-nb-ink mb-4 flex items-center gap-2">
            <MessageSquare size={18} /> Customer Reviews ({worker.total_ratings})
          </h2>
          <div className="space-y-4">
            <div className="border-b-2 border-nb-ink/10 pb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-nb-ink text-sm">Ankit Verma</span>
                <StarRating rating={5} size={14} />
              </div>
              <p className="text-xs text-nb-text-muted">
                Extremely skilled, arrived right on time, and resolved the issue quickly. Highly recommended!
              </p>
            </div>
            <div className="border-b-2 border-nb-ink/10 pb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-nb-ink text-sm">Neha Kapoor</span>
                <StarRating rating={4.8} size={14} />
              </div>
              <p className="text-xs text-nb-text-muted">
                Very courteous and professional. Clean work and fair hourly rate.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}