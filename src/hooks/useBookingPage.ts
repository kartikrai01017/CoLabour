import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { fetchWorkerProfile, createNewBooking } from '@/lib/dataService';
import {
  calculateHaversineDistance,
  getCoordinatesFromLocation,
  calculateReachTimeMinutes,
  DEFAULT_COORDINATES,
} from '@/lib/geo';
import type { WorkerWithUser } from '@/lib/supabase';

export function useBookingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [worker, setWorker] = useState<WorkerWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [hours, setHours] = useState('1');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>(DEFAULT_COORDINATES);
  const [showRadarModal, setShowRadarModal] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function fetchWorker() {
      if (!id) return;
      setLoading(true);
      try {
        const data = await fetchWorkerProfile(id);
        if (mounted) setWorker(data);
      } catch {
        if (mounted) setWorker(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchWorker();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (mounted) {
            setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          }
        },
        () => {
          // fallback to default
        },
        { timeout: 5000 }
      );
    }

    return () => {
      mounted = false;
    };
  }, [id]);

  const totalAmount = worker ? worker.hourly_rate * parseFloat(hours || '0') : 0;

  const workerCoords = worker ? getCoordinatesFromLocation(worker.location) : DEFAULT_COORDINATES;
  const distanceKm = calculateHaversineDistance(
    userCoords.lat,
    userCoords.lng,
    workerCoords.lat,
    workerCoords.lng
  );
  const reachTime = calculateReachTimeMinutes(distanceKm);

  const handleUseMyLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserCoords(coords);
          if (!address) {
            setAddress(`Current GPS Location (Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)})`);
          }
        },
        () => setError('Could not get your location. Please enter address manually.')
      );
    } else {
      setError('Geolocation is not supported on this device.');
    }
  }, [address]);

  const handlePreSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user || !worker) return;
    if (!date || !time || !address) {
      setError('Please fill in all required fields');
      return;
    }

    const scheduledAt = new Date(`${date}T${time}`);
    if (scheduledAt < new Date()) {
      setError('Scheduled time must be in the future');
      return;
    }

    setShowRadarModal(true);
  }, [user, worker, date, time, address]);

  const handleConfirmBooking = useCallback(async () => {
    if (!user || !worker) return;
    setSubmitting(true);
    setError('');

    try {
      const scheduledAt = new Date(`${date}T${time}`);
      const booking = await createNewBooking({
        customer_id: user.id,
        worker_id: worker.id,
        category: worker.category,
        scheduled_at: scheduledAt.toISOString(),
        address,
        total_amount: totalAmount,
        notes: notes || undefined,
      });

      setShowRadarModal(false);
      navigate(`/payment/${booking.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create booking';
      setError(msg);
      setShowRadarModal(false);
    } finally {
      setSubmitting(false);
    }
  }, [user, worker, date, time, address, totalAmount, notes, navigate]);

  return {
    id,
    navigate,
    worker,
    loading,
    submitting,
    error,
    date,
    setDate,
    time,
    setTime,
    hours,
    setHours,
    address,
    setAddress,
    notes,
    setNotes,
    userCoords,
    showRadarModal,
    setShowRadarModal,
    totalAmount,
    distanceKm,
    reachTime,
    handleUseMyLocation,
    handlePreSubmit,
    handleConfirmBooking,
  };
}
