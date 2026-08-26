import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Star, Loader2, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { GlowOrb, StarRating } from '@/components/ui/Shared';
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
        .select('*, users!inner(name, email, phone)');

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching workers:', error);
      } else {
        setWorkers((data as unknown as WorkerWithUser[]) ?? []);
      }
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
    <div className="relative min-h-screen overflow-hidden pt-20 pb-12 bg-[#070b14] text-slate-100">
      <GlowOrb className="top-20 -left-20 h-80 w-80 bg-neon-emerald/10" />
      <GlowOrb className="bottom-0 right-0 h-80 w-80 bg-neon-cyan/10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold gradient-text-emerald-cyan">Find Your Worker</h1>
          <p className="mt-2 text-gray-400">Browse verified professionals across {CATEGORIES.length} categories</p>
        </div>

        {/* Search bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, skill, or location..."
              className="w-full rounded-xl border border-white/10 bg-base-800/60 py-3 pl-12 pr-4 text-sm text-gray-200 outline-none transition-all focus:border-neon-emerald/40 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)]"
            />
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-xl border border-white/10 bg-base-800/60 px-4 py-3 text-sm text-gray-200 outline-none focus:border-neon-emerald/40"
            >
              <option value="rating">Top Rated</option>
              <option value="rate_low">Lowest Rate</option>
              <option value="rate_high">Highest Rate</option>
            </select>
          </div>
        </div>

        {/* Category filters */}
        <div className="mb-8 flex flex-wrap gap-2">
          <CategoryChip label="All" active={selectedCategory === 'all'} onClick={() => handleCategoryChange('all')} />
          {CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat] ?? Search;
            const style = getCategoryStyle(cat);
            return (
              <CategoryChip
                key={cat}
                label={cat}
                icon={Icon}
                active={selectedCategory === cat}
                onClick={() => handleCategoryChange(cat)}
                style={style}
              />
            );
          })}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="animate-spin text-neon-emerald" />
          </div>
        ) : filtered.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <p className="text-gray-400">No workers found. Try adjusting your filters.</p>
          </GlassCard>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((worker) => (
              <WorkerCard key={worker.id} worker={worker} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function WorkerCard({ worker }: { worker: WorkerWithUser }) {
  const Icon = CATEGORY_ICONS[worker.category] ?? Search;
  const style = getCategoryStyle(worker.category);

  return (
    <Link to={`/workers/${worker.id}`}>
      <GlassCard hover className="group h-full p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`h-14 w-14 rounded-2xl border ${style.bg} ${style.border} flex items-center justify-center`}>
              <Icon className={style.text} size={26} />
            </div>
            <div>
              <h3 className="font-semibold text-white group-hover:text-neon-emeraldGlow transition-colors">
                {worker.users?.name ?? 'Unknown'}
              </h3>
              <p className="text-sm text-gray-400">{worker.category}</p>
            </div>
          </div>
          <StarRating rating={worker.rating} />
        </div>

        {worker.bio && <p className="text-sm text-gray-400 line-clamp-2 mb-4">{worker.bio}</p>}

        {worker.skills && worker.skills.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {worker.skills.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="gray">{skill}</Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-white/5 pt-4">
          <div>
            <span className="text-lg font-bold text-neon-emeraldGlow">₹{worker.hourly_rate}</span>
            <span className="text-sm text-gray-500">/hr</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-400">
            {worker.location && <><MapPin size={14} /> {worker.location}</>}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-neon-emerald opacity-0 transition-opacity group-hover:opacity-100">
          View Profile <ArrowRight size={14} />
        </div>
      </GlassCard>
    </Link>
  );
}

function CategoryChip({ label, active, onClick, icon: Icon, style }: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: typeof Search;
  style?: { bg: string; text: string; border: string };
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
        active
          ? 'border-neon-emerald/40 bg-neon-emerald/10 text-neon-emeraldGlow shadow-[0_0_15px_rgba(16,185,129,0.15)]'
          : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-200'
      }`}
    >
      {Icon && <Icon size={16} />}
      {label}
    </button>
  );
}
