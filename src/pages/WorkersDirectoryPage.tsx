import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Loader2,
  SlidersHorizontal,
  Navigation,
  Radio,
  Star,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { CATEGORIES, type WorkerWithUser, type Review } from '@/lib/supabase';
import { CATEGORY_ICONS, getCategoryStyle } from '@/lib/categories';
import { fetchWorkersList } from '@/lib/dataService';
import { calculateDynamicRating, getTradeMedia } from '@/lib/ratings';
import { WorkerDetailModal } from '@/components/WorkerDetailModal';
import {
  useLanguage,
  WORKERS_RAW_DATA,
  type RawWorkerData,
  type TranslationKey,
} from '@/context/LanguageContext';
import {
  calculateHaversineDistance,
  getCoordinatesFromLocation,
  calculateReachTimeMinutes,
  DEFAULT_COORDINATES,
  getUserLiveCoordinates,
} from '@/lib/geo';

// Convert RawWorkerData to WorkerWithUser interface for full interoperability
function transformRawToWorkerWithUser(raw: RawWorkerData, baseCoords = DEFAULT_COORDINATES): WorkerWithUser {
  const lat = baseCoords.lat + raw.latOffset;
  const lng = baseCoords.lng + raw.lngOffset;
  return {
    id: raw.id,
    user_id: raw.id,
    category: raw.category,
    skills: raw.skills,
    hourly_rate: raw.rate,
    upi_id: raw.upiId,
    rating: raw.rating,
    total_ratings: raw.totalRatings,
    is_verified: raw.isVerified,
    location: `Bengaluru, Karnataka (Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)})`,
    photo_url: raw.photoUrl,
    gallery_urls: raw.galleryUrls,
    created_at: new Date().toISOString(),
    users: {
      name: raw.name,
      email: `${raw.id}@colabour.direct`,
      phone: '+91 98765 43210',
    },
    reviews: raw.reviews.map((r) => ({
      id: r.id,
      user_name: r.userName,
      rating: r.rating,
      comment: r.comment,
      date: r.date,
    })),
  };
}

export function WorkersDirectoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();

  const [workers, setWorkers] = useState<WorkerWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') ?? 'all');
  const [sortBy, setSortBy] = useState<'proximity' | 'rating' | 'rate_low' | 'rate_high'>('proximity');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>(DEFAULT_COORDINATES);
  const [gpsActive, setGpsActive] = useState(false);

  // Modal State
  const [selectedWorkerForModal, setSelectedWorkerForModal] = useState<WorkerWithUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync state with global APP_STATE
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.APP_STATE.selectedCategory = selectedCategory;
      window.APP_STATE.searchQuery = search;
      window.APP_STATE.sortBy = sortBy;
    }
  }, [selectedCategory, search, sortBy]);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  useEffect(() => {
    let mounted = true;
    async function loadDirectoryWorkers() {
      setLoading(true);
      try {
        const dbWorkers = await fetchWorkersList(selectedCategory);
        if (mounted) {
          if (dbWorkers && dbWorkers.length > 0) {
            setWorkers(dbWorkers);
          } else {
            // Decoupled raw data fallback
            const filteredRaw =
              selectedCategory === 'all'
                ? WORKERS_RAW_DATA
                : WORKERS_RAW_DATA.filter((w) => w.category.toLowerCase() === selectedCategory.toLowerCase());
            const transformed = filteredRaw.map((r) => transformRawToWorkerWithUser(r, userCoords));
            setWorkers(transformed);
          }
        }
      } catch {
        if (mounted) {
          const filteredRaw =
            selectedCategory === 'all'
              ? WORKERS_RAW_DATA
              : WORKERS_RAW_DATA.filter((w) => w.category.toLowerCase() === selectedCategory.toLowerCase());
          setWorkers(filteredRaw.map((r) => transformRawToWorkerWithUser(r, userCoords)));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDirectoryWorkers();

    // Auto-fetch Live GPS
    getUserLiveCoordinates().then((coords) => {
      if (mounted) {
        setUserCoords(coords);
        setGpsActive(true);
      }
    });

    return () => {
      mounted = false;
    };
  }, [selectedCategory, userCoords.lat, userCoords.lng]);

  const handleRefreshGps = useCallback(async () => {
    const coords = await getUserLiveCoordinates();
    setUserCoords(coords);
    setGpsActive(true);
    setSortBy('proximity');
  }, []);

  const handleReviewAdded = useCallback((workerId: string, newReview: Review) => {
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id === workerId) {
          const currentReviews = w.reviews || [];
          const updatedReviews = [newReview, ...currentReviews];
          const newRatingData = calculateDynamicRating(updatedReviews, w.rating || 4.8);
          return {
            ...w,
            reviews: updatedReviews,
            rating: newRatingData.averageRating,
            total_ratings: newRatingData.totalReviews,
          };
        }
        return w;
      })
    );

    if (selectedWorkerForModal && selectedWorkerForModal.id === workerId) {
      setSelectedWorkerForModal((prev) => {
        if (!prev) return null;
        const currentReviews = prev.reviews || [];
        const updatedReviews = [newReview, ...currentReviews];
        const newRatingData = calculateDynamicRating(updatedReviews, prev.rating || 4.8);
        return {
          ...prev,
          reviews: updatedReviews,
          rating: newRatingData.averageRating,
          total_ratings: newRatingData.totalReviews,
        };
      });
    }
  }, [selectedWorkerForModal]);

  const filtered = useMemo(() => {
    let result = workers;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (w) =>
          w.users?.name?.toLowerCase().includes(q) ||
          w.category.toLowerCase().includes(q) ||
          w.location?.toLowerCase().includes(q) ||
          w.skills?.some((s) => s.toLowerCase().includes(q))
      );
    }
    result = [...result];

    if (sortBy === 'rating') {
      result.sort((a, b) => {
        const ratingA = calculateDynamicRating(a.reviews, a.rating).averageRating;
        const ratingB = calculateDynamicRating(b.reviews, b.rating).averageRating;
        return ratingB - ratingA;
      });
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

  // Helper for specialty localized text
  const getSpecialtyLabel = (category: string) => {
    const key = `spec${category}` as TranslationKey;
    const localized = t(key);
    if (localized && localized !== key) return localized;
    return getTradeMedia(category).verifiedSpecialty;
  };

  return (
    <div className="relative min-h-screen bg-transparent text-stone-900 pt-20 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* DIRECTORY HEADER */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div
              data-i18n="directoryBadge"
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-300 border-2 border-stone-900 font-black text-xs uppercase tracking-wider mb-2 shadow-[2px_2px_0px_0px_#1c1917]"
            >
              {t('directoryBadge')}
            </div>
            <h1
              data-i18n="directoryTitle"
              className="text-4xl sm:text-5xl font-black tracking-tight text-stone-900"
            >
              {t('directoryTitle')}
            </h1>
            <p
              data-i18n="directorySubtitle"
              className="mt-2 text-sm font-semibold text-stone-700"
            >
              {t('directorySubtitle')}
            </p>
          </div>

          {/* GPS CALIBRATION BUTTON */}
          <button
            type="button"
            onClick={handleRefreshGps}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-stone-900 bg-teal-300 px-4 py-2.5 text-xs font-black text-stone-900 hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none shadow-[3px_3px_0px_0px_#1c1917] transition-all cursor-pointer"
          >
            <Radio size={14} className={gpsActive ? 'animate-pulse text-stone-900' : ''} />
            <span data-i18n={gpsActive ? 'gpsSignalCalibrated' : 'calibrateGps'}>
              {gpsActive ? t('gpsSignalCalibrated') : t('calibrateGps')}
            </span>
            <span className="rounded-md bg-white border border-stone-900 px-1.5 py-0.5 text-[10px] font-mono font-bold">
              {userCoords.lat.toFixed(2)}, {userCoords.lng.toFixed(2)}
            </span>
          </button>
        </div>

        {/* SEARCH & SORT BAR */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-i18n-placeholder="searchPlaceholder"
              placeholder={t('searchPlaceholder')}
              className="w-full rounded-xl border-2 border-stone-900 bg-white py-3 pl-12 pr-4 text-sm font-bold text-stone-900 placeholder:text-stone-400 outline-none shadow-[3px_3px_0px_0px_#1c1917] focus:shadow-[4px_4px_0px_0px_#1c1917] transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-stone-900" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-xl border-2 border-stone-900 bg-white px-4 py-3 text-sm font-black text-stone-900 outline-none shadow-[3px_3px_0px_0px_#1c1917] focus:shadow-[4px_4px_0px_0px_#1c1917] transition-all cursor-pointer"
            >
              <option value="proximity">{t('sortProximity')}</option>
              <option value="rating">{t('sortRating')}</option>
              <option value="rate_low">{t('sortRateLow')}</option>
              <option value="rate_high">{t('sortRateHigh')}</option>
            </select>
          </div>
        </div>

        {/* DYNAMIC CATEGORY FILTER CHIPS */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-3 scrollbar-thin">
          <CategoryChip
            label={t('allCategories')}
            active={selectedCategory === 'all'}
            onClick={() => handleCategoryChange('all')}
            icon={SlidersHorizontal}
          />
          {CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat];
            const localizedCategory = t(cat as TranslationKey, cat);
            return (
              <CategoryChip
                key={cat}
                label={localizedCategory}
                active={selectedCategory === cat}
                onClick={() => handleCategoryChange(cat)}
                icon={Icon}
              />
            );
          })}
        </div>

        {/* RESULTS GRID */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={36} className="animate-spin text-stone-900" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border-2 border-stone-900 bg-white p-12 text-center shadow-[5px_5px_0px_0px_#1c1917]">
            <p data-i18n="noWorkersFound" className="text-base font-bold text-stone-700">
              {t('noWorkersFound')}
            </p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('all');
                setSearchParams({});
              }}
              data-i18n="clearFilters"
              className="mt-4 px-4 py-2 rounded-xl bg-amber-300 border-2 border-stone-900 text-sm font-black text-stone-900 shadow-[2px_2px_0px_0px_#1c1917] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer"
            >
              {t('clearFilters')}
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((worker) => {
              const Icon = CATEGORY_ICONS[worker.category];
              const style = getCategoryStyle(worker.category);
              const media = getTradeMedia(worker.category);
              const workerCoords = getCoordinatesFromLocation(worker.location);
              const distanceKm = calculateHaversineDistance(
                userCoords.lat,
                userCoords.lng,
                workerCoords.lat,
                workerCoords.lng
              );
              const reachTime = calculateReachTimeMinutes(distanceKm);

              // Dynamic rating computation: (sum of ratings / total reviews)
              const ratingData = calculateDynamicRating(
                worker.reviews,
                worker.rating || 4.8,
                worker.total_ratings || (worker.reviews?.length || 24)
              );

              const localizedCategoryName = t(worker.category as TranslationKey, worker.category);
              const specialtyText = getSpecialtyLabel(worker.category);

              return (
                <div
                  key={worker.id}
                  onClick={() => {
                    setSelectedWorkerForModal(worker);
                    setIsModalOpen(true);
                  }}
                  className="group rounded-3xl border-2 border-stone-900 bg-white overflow-hidden flex flex-col justify-between h-full shadow-[5px_5px_0px_0px_#1c1917] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_#1c1917] transition-all cursor-pointer"
                >
                  {/* Card Header Media Image */}
                  <div className="relative h-32 w-full bg-stone-900 overflow-hidden border-b-2 border-stone-900">
                    <img
                      src={worker.photo_url || media.heroImage}
                      alt={worker.category}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Category Chip */}
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border-2 border-stone-900 ${style.bg} font-black text-[11px] text-stone-900 shadow-[2px_2px_0px_0px_#1c1917]`}>
                        {Icon && <Icon size={13} />}
                        {localizedCategoryName}
                      </span>
                    </div>

                    {/* Rate pill */}
                    <div className="absolute top-3 right-3">
                      <span className="rounded-lg bg-teal-300 border-2 border-stone-900 px-2.5 py-0.5 text-xs font-black text-stone-900 shadow-[2px_2px_0px_0px_#1c1917]">
                        ₹{worker.hourly_rate}{t('perHourSuffix')}
                      </span>
                    </div>

                    {/* Name and Verification */}
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
                      <h3 className="font-black text-base text-white truncate drop-shadow-sm">
                        {worker.users?.name ?? 'Worker'}
                      </h3>
                      {worker.is_verified && (
                        <span className="flex items-center gap-1 text-[10px] font-black text-teal-300 bg-stone-900/80 px-2 py-0.5 rounded-md border border-teal-400">
                          <ShieldCheck size={12} /> {t('verifiedBadge')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Live distance pill & Reach time */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center gap-1 rounded-md bg-teal-200 border border-stone-900 px-2 py-0.5 text-[11px] font-black text-stone-900 shadow-[1px_1px_0px_0px_#1c1917]">
                          <Navigation size={11} /> {distanceKm.toFixed(1)} {t('kmAway')}
                        </span>
                        <span className="text-[11px] font-semibold text-stone-600">
                          ~{reachTime} {t('minsReach')}
                        </span>
                      </div>

                      {/* Trade Specialty */}
                      <p className="text-[11px] font-bold text-teal-900 line-clamp-1">
                        🎯 {specialtyText}
                      </p>

                      {worker.bio && (
                        <p className="mt-2 line-clamp-2 text-xs font-medium text-stone-700 leading-relaxed">
                          {worker.bio}
                        </p>
                      )}

                      {/* Project Photo Thumbnails Preview */}
                      <div className="mt-3 flex items-center gap-1.5">
                        {media.projectGallery.slice(0, 3).map((proj, pIdx) => (
                          <div
                            key={pIdx}
                            className="h-10 w-12 rounded-lg border border-stone-900 overflow-hidden bg-stone-100 shrink-0"
                            title={proj.title}
                          >
                            <img
                              src={proj.imageUrl}
                              alt={proj.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        <span className="text-[10px] font-bold text-stone-500 pl-1">
                          {t('moreProjects')}
                        </span>
                      </div>

                      {/* Skills Tags */}
                      {worker.skills && worker.skills.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {worker.skills.slice(0, 3).map((skill) => (
                            <span
                              key={skill}
                              className="rounded-md bg-stone-100 border border-stone-900 px-2 py-0.5 text-xs font-semibold text-stone-900"
                            >
                              {skill}
                            </span>
                          ))}
                          {worker.skills.length > 3 && (
                            <span className="rounded-md bg-amber-100 border border-stone-900 px-2 py-0.5 text-xs font-black text-stone-900">
                              +{worker.skills.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* DYNAMIC RATING & MODAL ACTION FOOTER */}
                    <div className="mt-4 pt-3 border-t-2 border-stone-900/10 flex items-center justify-between">
                      {/* Dynamic Rating Badge */}
                      <div className="flex items-center gap-1.5 bg-amber-100 border border-stone-900 px-2.5 py-1 rounded-xl shadow-[1px_1px_0px_0px_#1c1917]">
                        <Star size={14} className="fill-amber-500 text-amber-600" />
                        <span className="font-black text-stone-900 text-xs">
                          {ratingData.formattedRating}
                        </span>
                        <span className="text-[11px] font-bold text-stone-600">
                          ({ratingData.totalReviews} {ratingData.totalReviews === 1 ? t('reviewSingular') : t('reviewsLabel')})
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedWorkerForModal(worker);
                          setIsModalOpen(true);
                        }}
                        className="px-3 py-1 rounded-lg border border-stone-900 bg-white hover:bg-teal-300 font-black text-xs text-stone-900 shadow-[1px_1px_0px_0px_#1c1917] flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Eye size={13} /> {t('viewModalBtn')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DYNAMIC RATING & DETAIL MODAL */}
      <WorkerDetailModal
        isOpen={isModalOpen}
        worker={selectedWorkerForModal}
        onClose={() => setIsModalOpen(false)}
        onReviewAdded={handleReviewAdded}
      />
    </div>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
  icon: Icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 whitespace-nowrap rounded-xl border-2 border-stone-900 px-4 py-2 text-xs font-black transition-all cursor-pointer ${
        active
          ? 'bg-amber-300 text-stone-900 shadow-[3px_3px_0px_0px_#1c1917]'
          : 'bg-white text-stone-800 hover:bg-stone-100 shadow-[2px_2px_0px_0px_#1c1917]'
      }`}
    >
      {Icon && <Icon size={14} />}
      {label}
    </button>
  );
}
