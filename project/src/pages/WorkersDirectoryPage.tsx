import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Loader2, SlidersHorizontal, ArrowRight, Handshake } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { FloatingShape, ParticleField, StarRating } from '@/components/ui/Shared';
import { supabase, CATEGORIES, type WorkerWithUser } from '@/lib/supabase';
import { CATEGORY_ICONS, getCategoryStyle } from '@/lib/categories';

export function WorkersDirectoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [workers, setWorkers] = useState<WorkerWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') ?? 'all');
  const [sortBy, setSortBy] = useState<'rating' | 'rate_low' | 'rate_high'>('rating');

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  useEffect(() => {
    async function fetchWorkers() {
      setLoading(true);
      let query = supabase
        .from('worker_profiles')
        .select('*, users!inner(name, email, phone)')
        .eq('is_verified', true);

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;
      if (error) console.error('Error fetching workers:', error);
      else setWorkers((data as unknown as WorkerWithUser[]) ?? []);
      setLoading(false);
    }
    fetchWorkers();
  }, [selectedCategory]);

  const filtered = useMemo(() => {
    let result = workers;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((w) =>
        w.users?.name?.toLowerCase().includes(q) ||
        w.category.toLowerCase().includes(q) ||
        w.location?.toLowerCase().includes(q) ||
        w.skills?.some((s) => s.toLowerCase().includes(q))
      );
    }
    result = [...result];
    if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'rate_low') result.sort((a, b) => a.hourly_rate - b.hourly_rate);
    else if (sortBy === 'rate_high') result.sort((a, b) => b.hourly_rate - a.hourly_rate);
    return result;
  }, [workers, search, sortBy]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    if (cat === 'all') setSearchParams({});
    else setSearchParams({ category: cat });
  };

  return (
    <div className="relative min-h-screen overflow-hidden pt-20 pb-12 atmosphere">
      <FloatingShape className="top-20 -left-20 h-[350px] w-[350px] animate-drift-slow" color="brass" />
      <FloatingShape className="bottom-0 -right-20 h-[300px] w-[300px] animate-drift" color="sage" delay={2} />
      <ParticleField />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header — co-op framing */}
        <div className="mb-6 animate-fade-in">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brass/60">Co-op members</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-white">Meet your <span className="gradient-text">co-workers</span></h1>
          <p className="mt-2 text-sm text-muted">Every person here sets their own rate and keeps every rupee. No middleman. Just neighbours helping neighbours.</p>
        </div>

        {/* Search */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-dark" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, skill, or location..."
              className="search-input"
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-muted-dark" />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="search-input px-3">
              <option value="rating">Top Rated</option>
              <option value="rate_low">Lowest Rate</option>
              <option value="rate_high">Highest Rate</option>
            </select>
          </div>
        </div>

        {/* Category filters */}
        <div className="mb-7 flex flex-wrap gap-1.5">
          <CategoryChip label="All" active={selectedCategory === 'all'} onClick={() => handleCategoryChange('all')} />
          {CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat] ?? Search;
            const style = getCategoryStyle(cat);
            return (
              <CategoryChip key={cat} label={cat} icon={Icon} active={selectedCategory === cat} onClick={() => handleCategoryChange(cat)} style={style} />
            );
          })}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={28} className="animate-spin text-brass" />
          </div>
        ) : filtered.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <p className="text-muted">No co-workers found. Try a different search.</p>
          </GlassCard>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((worker) => (
              <WorkerCard key={worker.id} worker={worker} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        .search-input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(255,255,255,0.04);
          background: rgba(12,14,20,0.8);
          padding: 0.625rem 0.875rem 0.625rem 2.5rem;
          color: #c4c8d8;
          font-size: 0.875rem;
          outline: none;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .search-input:focus {
          border-color: rgba(197,160,89,0.25);
          box-shadow: 0 0 0 3px rgba(197,160,89,0.05), 0 0 20px rgba(197,160,89,0.04);
        }
        .search-input::placeholder { color: #5a6080; }
      `}</style>
    </div>
  );
}

function WorkerCard({ worker }: { worker: WorkerWithUser }) {
  const Icon = CATEGORY_ICONS[worker.category] ?? Search;
  const style = getCategoryStyle(worker.category);

  return (
    <Link to={`/workers/${worker.id}`}>
      <GlassCard hover className="group h-full p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`h-11 w-11 rounded-xl border ${style.bg} ${style.border} flex items-center justify-center transition-all duration-500 group-hover:shadow-lg`}>
              <Icon className={style.text} size={22} />
            </div>
            <div>
              <h3 className="font-display font-semibold text-white text-sm group-hover:text-brass transition-colors duration-300">
                {worker.users?.name ?? 'Unknown'}
              </h3>
              <p className="text-xs text-muted">{worker.category} · Co-op member</p>
            </div>
          </div>
          <StarRating rating={worker.rating} size={14} />
        </div>

        {worker.bio && <p className="text-xs text-muted line-clamp-2 mb-3">{worker.bio}</p>}

        {worker.skills && worker.skills.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {worker.skills.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="gray">{skill}</Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-white/[0.04] pt-3">
          <div>
            <span className="text-base font-bold text-white font-display">₹{worker.hourly_rate}</span>
            <span className="text-xs text-muted-dark">/hr</span>
            <span className="ml-1.5 text-[10px] text-sage font-medium">they keep 100%</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted">
            {worker.location && <><MapPin size={12} /> {worker.location}</>}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-brass opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-1">
          View profile <ArrowRight size={12} />
        </div>
      </GlassCard>
    </Link>
  );
}

function CategoryChip({ label, active, onClick, icon: Icon, style }: {
  label: string; active: boolean; onClick: () => void; icon?: typeof Search; style?: { bg: string; text: string; border: string };
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-300 ${
        active
          ? 'border-brass/25 bg-brass/10 text-brass shadow-[0_0_15px_rgba(197,160,89,0.08)]'
          : 'border-white/[0.04] text-muted-dark hover:border-white/10 hover:text-muted-light'
      }`}
    >
      {Icon && <Icon size={13} />}
      {label}
    </button>
  );
}
