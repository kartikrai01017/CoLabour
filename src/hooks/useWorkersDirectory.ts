import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchWorkersList } from '@/lib/dataService';
import {
  calculateHaversineDistance,
  getCoordinatesFromLocation,
  DEFAULT_COORDINATES,
  getUserLiveCoordinates,
} from '@/lib/geo';
import type { WorkerWithUser } from '@/lib/supabase';

export function useWorkersDirectory() {
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

  const handleRefreshGps = useCallback(async () => {
    const coords = await getUserLiveCoordinates();
    setUserCoords(coords);
    setGpsActive(true);
    setSortBy('proximity');
  }, []);

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

  const handleCategoryChange = useCallback((cat: string) => {
    setSelectedCategory(cat);
    if (cat === 'all') setSearchParams({});
    else setSearchParams({ category: cat });
  }, [setSearchParams]);

  const clearFilters = useCallback(() => {
    setSearch('');
    setSelectedCategory('all');
    setSearchParams({});
  }, [setSearchParams]);

  return {
    loading,
    search,
    setSearch,
    selectedCategory,
    sortBy,
    setSortBy,
    userCoords,
    gpsActive,
    filtered,
    handleRefreshGps,
    handleCategoryChange,
    clearFilters,
  };
}
