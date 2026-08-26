import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Loader2, SlidersHorizontal, Navigation, Radio } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { GlowOrb, StarRating } from '@/components/ui/Shared';
import { CATEGORIES, type WorkerWithUser } from '@/lib/supabase';
import { CATEGORY_ICONS, getCategoryStyle } from '@/lib/categories';
import { fetchWorkersList } from '@/lib/dataService';
import {
  calculateHaversineDistance,
  getCoordinatesFromLocation,
  calculateReachTimeMinutes,
  DEFAULT_COORDINATES,
  getUserLiveCoordinates,
} from '@/lib/geo';

export function WorkersDirectoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [workers, setWorkers] = useState<WorkerWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') ?? 'all');
  const [sortBy, setSortBy] = useState<'rating' | 'rate_low' | 'rate_high' | 'proximity'>('proximity');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>(DEFAULT_COORDINATES);
  const [gpsActive, setGpsActive] = useState(false);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  useEffect(() => {
    let mounted = true;
    async function fetchWorkers() {
      setLoading(true);
      try {
        const data = await fetchWorkersList(selectedCategory);
        if (mounted) {
          setWorkers(data);
        }
      } catch {
        if (mounted) setWorkers([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchWorkers();

    // Auto-fetch GPS
    getUserLiveCoordinates().then((coords) => {
      if (mounted) {
        setUserCoords(coords);
        setGpsActive(true);
      }
    });

    return () => {
      mounted = false;
    };
  }, [selectedCategory]);

  const handleRefreshGps = async () => {
    const coords = await getUserLiveCoordinates();
    setUserCoords(coords);
    setGpsActive(true);
    setSortBy('proximity');
  };

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

    if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'rate_low') {
      result.sort((a, b) => a.hourly_rate - b.hourly_rate);
    } else if (sortBy === 'rate_high') {
      result.sort((a, b) => b.hourly_rate - a.hourly_rate);
    } else if (sortBy === 'proximity') {
      result.sort((a, b) => {
        const coordsA = getCoordinatesFromLocation(a.location);
        const coordsB = getCoordinatesFromLocation(b.location);
        const distA = calculateHaversineDistance(userCoords.lat, userCoords.lng, coordsA.lat, coordsA.lng);
        const distB = calculateHaversineDistance(userCoords.lat, userCoords.lng, coordsB.lat, coordsB.lng);
        return distA - distB;
      });
    }

    return result;
  }, [workers, search, sortBy, userCoords]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    if (cat === 'all') setSearchParams({});
    else setSearchParams({ category: cat });
  };

  return (
    <div className="relative min-h-screen overflow-hidden pt-20 pb-12">
      <GlowOrb className="top-20 -left-20 h-80 w-80 bg-neon-emerald/10" />
      <GlowOrb className="bottom-0 right-0 h-80 w-80 bg-neon-cyan/10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold gradient-text-emerald-cyan">Find Your Worker</h1>
            <p className="mt-2 text-gray-400">Browse verified professionals across {CATEGORIES.length} categories with live GPS proximity</p>
          </div>

          <button
            type="button"
            onClick={handleRefreshGps}
            className="inline-flex items-center gap-2 rounded-2xl border border-neon-cyan/40 bg-neon-cyan/10 px-4 py-2.5 text-xs font-bold text-neon-cyan hover:bg-neon-cyan/20 transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)]"
          >
            <Radio size={14} className={gpsActive ? 'animate-pulse' : ''} />
            <span>{gpsActive ? 'GPS Signal Active' : 'Calibrate Live GPS'}</span>
            <span className="rounded bg-neon-cyan/20 px-1.5 py-0.5 text-[9px] font-mono">
              {userCoords.lat.toFixed(2)}, {userCoords.lng.toFixed(2)}
            </span>
          </button>
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
              <option value="proximity">📍 Nearest Live GPS</option>
              <option value="rating">Top Rated</option>
              <option value="rate_low">Lowest Rate</option>
              <option value="rate_high">Highest Rate</option>
            </select>
          </div>
        </div>

        {/* Category filters */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <CategoryChip
            label="All"
            active={selectedCategory === 'all'}
            onClick={() => handleCategoryChange('all')}
            icon={SlidersHorizontal}
          />
          {CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat];
            return (
              <CategoryChip
                key={cat}
                label={cat}
                active={selectedCategory === cat}
                onClick={() => handleCategoryChange(cat)}
                icon={Icon}
              />
            );
          })}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-neon-emerald" />
          </div>
        ) : filtered.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <p className="text-gray-400">No workers found matching your criteria.</p>
            <button
              onClick={() => { setSearch(''); setSelectedCategory('all'); setSearchParams({}); }}
              className="mt-4 text-sm text-neon-emerald hover:underline"
            >
              Clear filters
            </button>
          </GlassCard>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((worker) => {
              const Icon = CATEGORY_ICONS[worker.category];
              const style = getCategoryStyle(worker.category);
              const workerCoords = getCoordinatesFromLocation(worker.location);
              const distanceKm = calculateHaversineDistance(
                userCoords.lat,
                userCoords.lng,
                workerCoords.lat,
                workerCoords.lng
              );
              const reachTime = calculateReachTimeMinutes(distanceKm);

              return (
                <Link key={worker.id} to={`/workers/${worker.id}`}>
                  <GlassCard hover className="group p-6 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`h-12 w-12 rounded-2xl border ${style.bg} ${style.border} flex items-center justify-center`}>
                            {Icon && <Icon className={style.text} size={24} />}
                          </div>
                          <div>
                            <h3 className="font-semibold text-white group-hover:text-neon-emeraldGlow transition-colors">
                              {worker.users?.name ?? 'Worker'}
                            </h3>
                            <p className="text-xs text-gray-400">{worker.category}</p>
                          </div>
                        </div>
                        <Badge variant="emerald">₹{worker.hourly_rate}/hr</Badge>
                      </div>

                      {/* Live distance pill */}
                      <div className="mt-3 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-neon-cyan/15 px-2.5 py-0.5 text-[11px] font-bold text-neon-cyan border border-neon-cyan/30">
                          <Navigation size={11} /> {distanceKm.toFixed(1)} km away
                        </span>
                        <span className="text-[11px] text-gray-400">~{reachTime} mins reach</span>
                      </div>

                      {worker.bio && (
                        <p className="mt-3 line-clamp-2 text-xs text-gray-400 leading-relaxed">
                          {worker.bio}
                        </p>
                      )}

                      {worker.skills && worker.skills.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {worker.skills.slice(0, 3).map((skill) => (
                            <span key={skill} className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-gray-300">
                              {skill}
                            </span>
                          ))}
                          {worker.skills.length > 3 && (
                            <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-gray-500">
                              +{worker.skills.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <StarRating rating={worker.rating} size={14} />
                        <span className="ml-1 text-gray-500">({worker.total_ratings})</span>
                      </div>
                      {worker.location && (
                        <div className="flex items-center gap-1">
                          <MapPin size={12} className="text-gray-500" />
                          <span className="truncate max-w-[120px]">{worker.location}</span>
                        </div>
                      )}
                    </div>
                  </GlassCard>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryChip({ label, active, onClick, icon: Icon }: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 whitespace-nowrap rounded-xl border px-4 py-2 text-xs font-medium transition-all ${
        active
          ? 'border-neon-emerald/40 bg-neon-emerald/15 text-neon-emerald shadow-[0_0_15px_rgba(16,185,129,0.15)]'
          : 'border-white/5 bg-base-800/40 text-gray-400 hover:border-white/10 hover:text-gray-200'
      }`}
    >
      {Icon && <Icon size={14} />}
      {label}
    </button>
  );
}
