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
import { useLanguage } from '@/context/LanguageContext';

export function WorkerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, categoryName } = useLanguage();
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
      alert(t('profile.cannotBookWorkers'));
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
        <p className="text-gray-400">{t('profile.workerNotFound')}</p>
        <Link to="/workers"><NeonButton variant="ghost">{t('profile.browseWorkers')}</NeonButton></Link>
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
        <Link to="/workers" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-neon-emerald transition-colors">
          <ArrowLeft size={16} /> {t('profile.backToWorkers')}
        </Link>

        {/* Hero card */}
        <GlassCard className="relative overflow-hidden p-8 mb-6 animate-slide-up">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className={`h-24 w-24 rounded-3xl border ${style.bg} ${style.border} ${style.glow} flex items-center justify-center shrink-0`}>
              <Icon className={style.text} size={48} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{worker.users?.name ?? t('profile.unknownWorker')}</h1>
                {worker.is_verified && (
                  <Badge variant="emerald"><ShieldCheck size={12} /> {t('profile.verified')}</Badge>
                )}
              </div>
              <p className="text-lg text-gray-400 mb-3">{categoryName(worker.category)}</p>
              <div className="flex flex-wrap items-center gap-4">
                <StarRating rating={worker.rating} size={18} />
                <span className="text-sm text-gray-500">{t('profile.reviews', { count: worker.total_ratings ?? 0 })}</span>
                {worker.location && (
                  <span className="flex items-center gap-1 text-sm text-gray-400">
                    <MapPin size={14} className="text-gray-500" /> {worker.location}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:items-end justify-between">
              <div className="text-right">
                <span className="text-3xl font-bold text-white">₹{worker.hourly_rate}</span>
                <span className="text-gray-400 text-sm">{t('profile.perHour')}</span>
              </div>
              <NeonButton onClick={handleBook} size="lg" variant="emerald" className="mt-4">
                {t('profile.bookNow')} <ArrowRight size={18} />
              </NeonButton>
            </div>
          </div>
        </GlassCard>

        {/* Details Grid */}
        <div className="grid gap-6 md:grid-cols-3 mb-6">
          {/* Bio */}
          <GlassCard className="p-6 md:col-span-2">
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Briefcase size={18} className="text-neon-emerald" /> {t('profile.about')}
            </h2>
            <p className="text-gray-300 leading-relaxed text-sm">
              {worker.bio || t('profile.noBio')}
            </p>

            <h3 className="text-sm font-semibold text-gray-400 mt-6 mb-3">{t('profile.skills')}</h3>
            <div className="flex flex-wrap gap-2">
              {worker.skills?.map((skill) => (
                <span key={skill} className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-gray-200">
                  {skill}
                </span>
              ))}
            </div>
          </GlassCard>

          {/* Quick Info */}
          <div className="space-y-6">
            <GlassCard className="p-6">
              <h2 className="text-lg font-semibold text-white mb-4">{t('profile.highlights')}</h2>
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3 text-gray-300">
                  <ShieldCheck size={18} className="text-neon-emerald shrink-0" />
                  <span>{t('profile.backgroundVerified')}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Wallet size={18} className="text-neon-cyan shrink-0" />
                  <span>{t('profile.directUpi')}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Clock size={18} className="text-neon-cyan shrink-0" />
                  <span>{t('profile.promptResponse')}</span>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h2 className="text-lg font-semibold text-white mb-2">{t('profile.customWork')}</h2>
              <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                {t('profile.customWorkDescription')}
              </p>
              <NeonButton onClick={handleBook} fullWidth size="md" variant="cyan">
                {t('profile.requestService')}
              </NeonButton>
            </GlassCard>
          </div>
        </div>

        {/* Reviews Section */}
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MessageSquare size={18} className="text-neon-emerald" /> {t('profile.customerReviews', { count: worker.total_ratings ?? 0 })}
          </h2>
          <div className="space-y-4">
            <div className="border-b border-white/5 pb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-white text-sm">Ankit Verma</span>
                <StarRating rating={5} size={14} />
              </div>
              <p className="text-xs text-gray-400">
                {t('profile.reviewOne')}
              </p>
            </div>
            <div className="border-b border-white/5 pb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-white text-sm">Neha Kapoor</span>
                <StarRating rating={4.8} size={14} />
              </div>
              <p className="text-xs text-gray-400">
                {t('profile.reviewTwo')}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
