import { Link } from 'react-router-dom';
import { Search, MapPin, Loader2, SlidersHorizontal, Navigation, Radio } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { GlowOrb, StarRating } from '@/components/ui/Shared';
import { CATEGORIES } from '@/lib/supabase';
import { CATEGORY_ICONS, getCategoryStyle } from '@/lib/categories';
import { useWorkersDirectory } from '@/hooks/useWorkersDirectory';
import {
  calculateHaversineDistance,
  getCoordinatesFromLocation,
  calculateReachTimeMinutes,
} from '@/lib/geo';

export function WorkersDirectoryPage() {
  const {
    loading, search, setSearch, selectedCategory, sortBy, setSortBy,
    userCoords, gpsActive, filtered,
    handleRefreshGps, handleCategoryChange, clearFilters,
  } = useWorkersDirectory();

  return (
    <div className="relative min-h-screen overflow-hidden pt-20 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-4xl font-extrabold text-nb-ink">Find Your Worker</h1>
            <p className="mt-2 text-nb-text-muted">Browse verified professionals across {CATEGORIES.length} categories with live GPS proximity</p>
          </div>

          <button
            type="button"
            onClick={handleRefreshGps}
            className="inline-flex items-center gap-2 rounded-nb-md border-[2px] border-nb-ink bg-nb-accent-blue/20 px-4 py-2.5 text-xs font-bold text-nb-ink shadow-nb-sm hover:shadow-nb-md transition-all active:shadow-nb-pressed active:translate-x-[3px] active:translate-y-[3px]"
          >
            <Radio size={14} className={gpsActive ? 'animate-pulse' : ''} />
            <span>{gpsActive ? 'GPS Signal Active' : 'Calibrate Live GPS'}</span>
            <span className="rounded-nb-sm bg-nb-surface border border-nb-ink/20 px-1.5 py-0.5 text-[9px] font-mono">
              {userCoords.lat.toFixed(2)}, {userCoords.lng.toFixed(2)}
            </span>
          </button>
        </div>

        {/* Search bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-nb-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, skill, or location..."
              className="w-full rounded-nb-md border-[2px] border-nb-ink bg-nb-surface py-3 pl-12 pr-4 text-sm font-medium text-nb-ink outline-none transition-all focus:shadow-nb-md"
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-nb-text-muted" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-nb-md border-[2px] border-nb-ink bg-nb-surface px-4 py-3 text-sm font-medium text-nb-ink outline-none focus:shadow-nb-md"
            >
              <option value="proximity">📍 Nearest Live GPS</option>
              <option value="rating">Top Rated</option>
              <option value="rate_low">Lowest Rate</option>
              <option value="rate_high">Highest Rate</option>
            </select>
          </div>
        </div>

        {/* Category filters */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
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
            <Loader2 size={32} className="animate-spin text-nb-ink" />
          </div>
        ) : filtered.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <p className="text-nb-text-muted font-medium">No workers found matching your criteria.</p>
            <button
              onClick={clearFilters}
              className="mt-4 text-sm font-bold text-nb-accent-orange hover:underline"
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
                          <div className={`h-12 w-12 rounded-nb-lg border-2 border-nb-ink bg-nb-surface flex items-center justify-center shadow-nb-sm`}>
                            {Icon && <Icon className="text-nb-ink" size={24} />}
                          </div>
                          <div>
                            <h3 className="font-bold text-nb-ink group-hover:text-nb-accent-orange transition-colors">
                              {worker.users?.name ?? 'Worker'}
                            </h3>
                            <p className="text-xs font-medium text-nb-text-muted">{worker.category}</p>
                          </div>
                        </div>
                        <Badge variant="emerald">₹{worker.hourly_rate}/hr</Badge>
                      </div>

                      {/* Live distance pill */}
                      <div className="mt-3 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-nb-sm bg-nb-accent-blue/20 px-2.5 py-0.5 text-[11px] font-bold text-nb-ink border border-nb-ink/20">
                          <Navigation size={11} /> {distanceKm.toFixed(1)} km away
                        </span>
                        <span className="text-[11px] font-medium text-nb-text-muted">~{reachTime} mins reach</span>
                      </div>

                      {worker.bio && (
                        <p className="mt-3 line-clamp-2 text-xs text-nb-text-muted leading-relaxed">
                          {worker.bio}
                        </p>
                      )}

                      {worker.skills && worker.skills.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {worker.skills.slice(0, 3).map((skill) => (
                            <span key={skill} className="rounded-nb-sm bg-nb-surface-muted border border-nb-ink/10 px-2 py-0.5 text-xs font-medium text-nb-ink">
                              {skill}
                            </span>
                          ))}
                          {worker.skills.length > 3 && (
                            <span className="rounded-nb-sm bg-nb-surface-muted border border-nb-ink/10 px-2 py-0.5 text-xs font-medium text-nb-text-muted">
                              +{worker.skills.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t-2 border-nb-ink/10 pt-4 text-xs font-medium text-nb-text-muted">
                      <div className="flex items-center gap-1">
                        <StarRating rating={worker.rating} size={14} />
                        <span className="ml-1 text-nb-text-muted">({worker.total_ratings})</span>
                      </div>
                      {worker.location && (
                        <div className="flex items-center gap-1">
                          <MapPin size={12} className="text-nb-text-muted" />
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
  icon?: React.ComponentType<{ size?: number; className?: string; ref?: React.Ref<SVGSVGElement> }>;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 whitespace-nowrap rounded-nb-md border-2 border-nb-ink px-4 py-2 text-xs font-bold transition-all ${
        active
          ? 'bg-nb-accent-yellow text-nb-ink shadow-nb-sm'
          : 'bg-nb-surface text-nb-text-muted hover:bg-nb-surface-muted shadow-nb-sm hover:shadow-nb-md'
      }`}
    >
      {Icon && <Icon size={14} />}
      {label}
    </button>
  );
}