import { useState, useEffect, useCallback } from 'react';
<<<<<<< HEAD
import { 
  Briefcase, CheckCircle, Clock, Wallet, MapPin, 
  Phone, AlertCircle, Loader2, Navigation, UserCheck
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { CATEGORY_ICONS, getCategoryStyle } from '@/lib/categories';

interface BookingItem {
  id: string;
  customer_id: string;
  worker_id: string;
  category: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'payment_submitted' | 'completed' | 'paid' | 'cancelled';
  total_amount: number | string;
  scheduled_at: string;
  address: string;
  customer?: {
    full_name?: string;
    phone?: string;
    email?: string;
  } | null;
}

export function WorkerDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Real Database Fetching
  const fetchWorkerData = useCallback(async () => {
    if (!user) return;
    try {
      // 1. Fetch worker profile details
      const { data: profile } = await supabase
        .from('worker_profiles')
        .select('is_online')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile) setIsOnline(profile.is_online);

      // 2. Fetch all real assigned bookings with customer info
      const { data: bookingData, error } = await supabase
        .from('bookings')
        .select(`
          id,
          customer_id,
          worker_id,
          category,
          status,
          total_amount,
          scheduled_at,
          address,
          customer:customer_id (
            full_name,
            phone,
            email
          )
        `)
        .eq('worker_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && bookingData) {
        setBookings(bookingData as unknown as BookingItem[]);
      }
    } catch (err) {
      console.error('Error fetching worker dashboard data:', err);
=======
import { useNavigate } from 'react-router-dom';
import {
  Wallet, Clock, CheckCircle, XCircle, Bell, Briefcase, Star,
  Check, Loader2, MapPin, Calendar, AlertCircle, Settings, ShieldCheck,
  Receipt, Eye, X
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { GlowOrb, AnimatedCounter } from '@/components/ui/Shared';
import { type Booking, type Payment } from '@/lib/supabase';
import { CATEGORY_ICONS, getCategoryStyle } from '@/lib/categories';
import { useAuth } from '@/context/AuthContext';
import { fetchWorkerDashboardData, updateBookingStatus, confirmPaymentAsReceived } from '@/lib/dataService';
import { CoLabourPrinterEngine } from '@/components/CoLabourPrinterEngine';

interface BookingWithCustomer extends Booking {
  customer?: { name: string; phone: string } | null;
}

interface PaymentWithBooking extends Payment {
  bookings?: { customer_id: string; address: string } | null;
}

export function WorkerDashboardPage() {
  const { user, workerProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingWithCustomer[]>([]);
  const [payments, setPayments] = useState<PaymentWithBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState<{ booking: BookingWithCustomer; payment?: PaymentWithBooking } | null>(null);
  const [upiId, setUpiId] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState('');

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const data = await fetchWorkerDashboardData(user.id);
      setBookings(data.bookings as BookingWithCustomer[]);
      setPayments(data.payments as PaymentWithBooking[]);
    } catch {
      // fallback
>>>>>>> origin/main
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
<<<<<<< HEAD
    if (user) fetchWorkerData();
    else setLoading(false);
  }, [user, authLoading, fetchWorkerData]);

  // Realtime subscription for live bookings
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('worker-realtime-bookings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings', filter: `worker_id=eq.${user.id}` },
        () => fetchWorkerData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchWorkerData]);

  // Status Updater with Safe Error Handling
  const handleUpdateStatus = async (bookingId: string, nextStatus: 'confirmed' | 'in_progress' | 'completed' | 'cancelled') => {
    try {
      setUpdatingId(bookingId);
      const { error } = await supabase
        .from('bookings')
        .update({ status: nextStatus })
        .eq('id', bookingId);

      if (error) throw error;
      await fetchWorkerData();
    } catch (err: any) {
      console.error('Failed to update status:', err);
      alert('Failed to update status: ' + (err.message || 'Check database permissions'));
    } finally {
      setUpdatingId(null);
    }
  };

  // Toggle Online/Offline
  const toggleOnlineStatus = async () => {
    if (!user) return;
    const nextState = !isOnline;
    setIsOnline(nextState);
    await supabase
      .from('worker_profiles')
      .update({ is_online: nextState })
      .eq('user_id', user.id);
  };

  // Dynamic Calculated Statistics
  const pendingDispatches = bookings.filter((b) => b.status === 'pending');
  const activeJobs = bookings.filter((b) => ['confirmed', 'in_progress'].includes(b.status));
  const completedJobs = bookings.filter((b) => ['completed', 'paid'].includes(b.status));
  const totalEarnings = completedJobs.reduce((sum, b) => sum + Number(b.total_amount || 0), 0);

  const activeEnRouteJob = bookings.find((b) => b.status === 'confirmed' || b.status === 'in_progress');
  const displayName = (user as any)?.full_name || (user as any)?.name || 'Professional Partner';
=======
    if (workerProfile) {
      setUpiId(workerProfile.upi_id);
      setHourlyRate(String(workerProfile.hourly_rate));
      fetchData();
    } else {
      setLoading(false);
    }
  }, [workerProfile, authLoading, fetchData]);

  // Poll for new bookings/payments every 3 seconds for instant synchronization
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [user, fetchData]);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleConfirmPayment = async (paymentId: string) => {
    setConfirmingId(paymentId);
    // Optimistic payment status update
    setPayments((prev) =>
      prev.map((p) => (p.id === paymentId ? { ...p, status: 'paid', paid_at: new Date().toISOString() } : p))
    );
    showToast('Payment confirmed as received!');
    try {
      await confirmPaymentAsReceived(paymentId);
      await fetchData();
    } catch {
      alert('Failed to confirm payment');
      await fetchData();
    } finally {
      setConfirmingId(null);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
    // Optimistic UI updates
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
    );

    if (status === 'confirmed') {
      showToast('🎉 Job Accepted successfully! Customer notified to pay via UPI.');
    } else if (status === 'cancelled') {
      showToast('Job Declined and removed from active queue.');
    } else if (status === 'completed' || status === 'paid') {
      showToast('Job marked as Completed.');
    }

    try {
      await updateBookingStatus(bookingId, status);
      await fetchData();
    } catch {
      alert('Failed to update booking status');
      await fetchData();
    }
  };

  const handleSaveSettings = async () => {
    if (!workerProfile) return;
    setSavingSettings(true);
    setSettingsMsg('');
    try {
      workerProfile.upi_id = upiId;
      workerProfile.hourly_rate = parseFloat(hourlyRate) || workerProfile.hourly_rate;
      setSettingsMsg('Settings saved successfully');
      setTimeout(() => setShowSettings(false), 1200);
    } catch {
      setSettingsMsg('Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const totalEarnings = payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0);
  const pendingPayments = payments.filter((p) => p.status === 'payment_submitted');
  // Active bookings includes pending and confirmed
  const activeBookings = bookings.filter((b) => ['pending', 'confirmed', 'in_progress'].includes(b.status));
  const completedJobs = bookings.filter((b) => b.status === 'paid' || b.status === 'completed');
>>>>>>> origin/main

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-16">
<<<<<<< HEAD
        <Loader2 size={32} className="animate-spin text-emerald-500" />
=======
        <Loader2 size={32} className="animate-spin text-neon-emerald" />
>>>>>>> origin/main
      </div>
    );
  }

<<<<<<< HEAD
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Top Worker Profile & Status Toggle Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white border-2 border-black p-6 rounded-3xl shadow-[5px_5px_0px_0px_#000]">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-amber-400 border-2 border-black rounded-2xl flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
              <UserCheck size={32} className="text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-black">{displayName}</h1>
                <span className="bg-emerald-100 border border-emerald-500 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                  VERIFIED PRO
                </span>
              </div>
              <p className="text-xs font-bold text-gray-600 mt-0.5">Partner ID: {user?.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs font-bold text-gray-500 block">Duty Status</span>
              <span className={`text-sm font-black ${isOnline ? 'text-emerald-600' : 'text-gray-500'}`}>
                {isOnline ? '● AVAILABLE (LIVE)' : '○ OFFLINE'}
              </span>
            </div>
            <button
              onClick={toggleOnlineStatus}
              className={`px-5 py-2.5 rounded-2xl border-2 border-black font-black text-xs shadow-[3px_3px_0px_0px_#000] transition-all ${
                isOnline ? 'bg-emerald-400 hover:bg-emerald-300' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {isOnline ? 'Go Offline' : 'Go Online'}
            </button>
          </div>
        </div>

        {/* Real Live Earnings & Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="bg-white border-2 border-black p-5 rounded-2xl shadow-[4px_4px_0px_0px_#000]">
            <Wallet size={20} className="mb-2 text-emerald-600" />
            <p className="text-2xl font-black text-black">₹{totalEarnings.toLocaleString('en-IN')}</p>
            <p className="text-xs font-bold text-gray-500 uppercase mt-1">Total Settled Earnings</p>
          </div>

          <div className="bg-white border-2 border-black p-5 rounded-2xl shadow-[4px_4px_0px_0px_#000]">
            <Clock size={20} className="mb-2 text-amber-500" />
            <p className="text-2xl font-black text-black">{pendingDispatches.length}</p>
            <p className="text-xs font-bold text-gray-500 uppercase mt-1">Pending Requests</p>
          </div>

          <div className="bg-white border-2 border-black p-5 rounded-2xl shadow-[4px_4px_0px_0px_#000]">
            <Navigation size={20} className="mb-2 text-cyan-600" />
            <p className="text-2xl font-black text-black">{activeJobs.length}</p>
            <p className="text-xs font-bold text-gray-500 uppercase mt-1">Ongoing Jobs</p>
          </div>

          <div className="bg-white border-2 border-black p-5 rounded-2xl shadow-[4px_4px_0px_0px_#000]">
            <CheckCircle size={20} className="mb-2 text-purple-600" />
            <p className="text-2xl font-black text-black">{completedJobs.length}</p>
            <p className="text-xs font-bold text-gray-500 uppercase mt-1">Jobs Completed</p>
          </div>
        </div>

        {/* Active En Route Tracking Banner & Map */}
        {activeEnRouteJob && (
          <div className="mb-8 border-2 border-black bg-white rounded-3xl p-6 shadow-[6px_6px_0px_0px_#000]">
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
              <div className="w-full lg:w-1/2 space-y-3">
                <span className="bg-emerald-400 border border-black text-black text-xs font-black px-3 py-1 rounded-full uppercase">
                  Active Dispatch • En Route
                </span>
                <h2 className="text-2xl font-black text-black">
                  Serving {activeEnRouteJob.customer?.full_name || 'Customer'}
                </h2>
                <p className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
                  <MapPin size={14} /> {activeEnRouteJob.address}
                </p>
                <div className="flex gap-3 pt-2">
                  {activeEnRouteJob.customer?.phone && (
                    <a
                      href={`tel:${activeEnRouteJob.customer.phone}`}
                      className="bg-emerald-400 text-black border-2 border-black px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-[2px_2px_0px_0px_#000]"
                    >
                      <Phone size={14} /> Call Customer
                    </a>
                  )}
                  {activeEnRouteJob.status === 'confirmed' && (
                    <NeonButton
                      size="sm"
                      variant="emerald"
                      onClick={() => handleUpdateStatus(activeEnRouteJob.id, 'in_progress')}
                    >
                      Mark Arrived & Start
                    </NeonButton>
                  )}
                  {activeEnRouteJob.status === 'in_progress' && (
                    <NeonButton
                      size="sm"
                      variant="cyan"
                      onClick={() => handleUpdateStatus(activeEnRouteJob.id, 'completed')}
                    >
                      Mark Job Complete
                    </NeonButton>
                  )}
                </div>
              </div>

              {/* Free Map View */}
              <div className="w-full lg:w-1/2 h-52 rounded-2xl border-2 border-black overflow-hidden shadow-[3px_3px_0px_0px_#000]">
                <iframe
                  title="LiveRouteMap"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=72.82%2C19.00%2C72.92%2C19.15&layer=mapnik&marker=19.0760%2C72.8777"
                />
              </div>
            </div>
          </div>
        )}

        {/* Incoming Dispatches & All Bookings Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          
          {/* Incoming Job Requests */}
          <div>
            <h2 className="text-xl font-black text-black mb-4 flex items-center gap-2">
              <AlertCircle size={20} /> Incoming Job Dispatches
            </h2>
            <div className="space-y-4">
              {pendingDispatches.length === 0 ? (
                <div className="bg-white border-2 border-black p-8 rounded-2xl text-center text-sm font-bold text-gray-500 shadow-[3px_3px_0px_0px_#000]">
                  No pending requests. Keep radar online to receive bookings!
                </div>
              ) : (
                pendingDispatches.map((job) => (
                  <div key={job.id} className="bg-white border-2 border-black p-5 rounded-2xl shadow-[4px_4px_0px_0px_#000]">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-black text-black text-base">{job.customer?.full_name || 'Verified Customer'}</h3>
                        <p className="text-xs font-bold text-gray-600">{job.category} • ₹{job.total_amount}</p>
                      </div>
                      <Badge variant="amber">NEW DISPATCH</Badge>
                    </div>
                    <p className="text-xs font-semibold text-gray-700 bg-gray-50 p-2.5 rounded-xl border border-black/10 mb-3 flex items-center gap-2">
                      <MapPin size={14} /> {job.address}
                    </p>
                    <div className="flex gap-3">
                      <button
                        disabled={updatingId === job.id}
                        onClick={() => handleUpdateStatus(job.id, 'confirmed')}
                        className="flex-1 bg-emerald-400 hover:bg-emerald-300 text-black border-2 border-black py-2 rounded-xl text-xs font-black shadow-[2px_2px_0px_0px_#000]"
                      >
                        {updatingId === job.id ? 'Accepting...' : 'Accept Dispatch'}
                      </button>
                      <button
                        disabled={updatingId === job.id}
                        onClick={() => handleUpdateStatus(job.id, 'cancelled')}
                        className="bg-gray-100 hover:bg-red-100 text-black border-2 border-black px-4 py-2 rounded-xl text-xs font-black shadow-[2px_2px_0px_0px_#000]"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
=======
  if (!workerProfile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center pt-16 gap-4">
        <AlertCircle className="text-amber-400" size={32} />
        <p className="text-gray-400">Worker profile not found. Please complete your registration.</p>
        <NeonButton onClick={() => navigate('/signup')}>Complete Registration</NeonButton>
      </div>
    );
  }

  const Icon = CATEGORY_ICONS[workerProfile.category] ?? Briefcase;
  const style = getCategoryStyle(workerProfile.category);

  return (
    <div className="relative min-h-screen overflow-hidden pt-20 pb-12">
      <GlowOrb className="top-20 -left-20 h-80 w-80 bg-neon-emerald/10" />
      <GlowOrb className="bottom-0 right-0 h-80 w-80 bg-neon-cyan/10" />

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-2xl border border-neon-emerald/40 bg-base-900/90 px-4 py-3 text-sm font-semibold text-neon-emerald shadow-[0_0_30px_rgba(16,185,129,0.3)] backdrop-blur-xl animate-slide-down">
          <CheckCircle size={18} className="text-neon-emerald" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div className="flex items-center gap-4">
            <div className={`h-16 w-16 rounded-2xl border ${style.bg} ${style.border} flex items-center justify-center`}>
              <Icon className={style.text} size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{user?.name}'s Dashboard</h1>
              <p className="text-sm text-gray-400">{workerProfile.category} • Worker ID: {workerProfile.id.slice(0, 8)} • UPI: {workerProfile.upi_id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="emerald"><ShieldCheck size={12} /> {workerProfile.is_verified ? 'Verified' : 'Pending'}</Badge>
            <NeonButton variant="ghost" size="sm" onClick={() => setShowSettings(true)}>
              <Settings size={16} /> Settings
            </NeonButton>
          </div>
        </div>

        {/* Stats grid */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={Wallet} label="Total Earnings" value={`₹${totalEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} color="emerald" />
          <StatCard icon={Briefcase} label="Active Requests" value={activeBookings.length} color="cyan" />
          <StatCard icon={CheckCircle} label="Jobs Settled" value={completedJobs.length} color="violet" />
          <StatCard icon={Star} label="Rating" value={workerProfile.rating.toFixed(1)} color="amber" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Incoming booking requests */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-200">
              <Bell size={18} className="text-neon-cyan" /> Job Dispatches & Requests
              {activeBookings.length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neon-emerald text-xs font-bold text-base-900">
                  {activeBookings.length}
                </span>
              )}
            </h2>
            <div className="space-y-4">
              {activeBookings.length === 0 ? (
                <GlassCard className="p-8 text-center text-gray-500">No active job requests right now</GlassCard>
              ) : (
                activeBookings.map((booking) => (
                  <BookingRequestCard
                    key={booking.id}
                    booking={booking}
                    onAccept={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                    onDecline={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                    onComplete={() => handleUpdateBookingStatus(booking.id, 'completed')}
                  />
>>>>>>> origin/main
                ))
              )}
            </div>
          </div>

<<<<<<< HEAD
          {/* Job History */}
          <div>
            <h2 className="text-xl font-black text-black mb-4 flex items-center gap-2">
              <Briefcase size={20} /> Booking History & Completed
            </h2>
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="bg-white border-2 border-black p-8 rounded-2xl text-center text-sm font-bold text-gray-500 shadow-[3px_3px_0px_0px_#000]">
                  No past jobs recorded.
                </div>
              ) : (
                bookings.map((b) => {
                  const Icon = (CATEGORY_ICONS as any)[b.category] ?? Briefcase;
                  const style = getCategoryStyle(b.category);
                  return (
                    <div key={b.id} className="bg-white border-2 border-black p-4 rounded-2xl shadow-[3px_3px_0px_0px_#000] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl border-2 border-black ${style.bg} flex items-center justify-center`}>
                          <Icon className={style.text} size={18} />
                        </div>
                        <div>
                          <p className="font-black text-sm text-black">{b.customer?.full_name || 'Customer'}</p>
                          <p className="text-xs font-bold text-gray-500">{b.category} • ₹{b.total_amount}</p>
                        </div>
                      </div>
                      <Badge variant={b.status === 'paid' || b.status === 'completed' ? 'emerald' : 'gray'}>
                        {b.status.toUpperCase()}
                      </Badge>
                    </div>
=======
          {/* Payment confirmations & Earnings */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-200">
              <Wallet size={18} className="text-neon-emerald" /> Payment Confirmations
              {pendingPayments.length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-base-900 animate-pulse">
                  {pendingPayments.length}
                </span>
              )}
            </h2>
            <div className="space-y-4">
              {pendingPayments.length === 0 ? (
                <GlassCard className="p-8 text-center text-gray-500">
                  No customer payments waiting for your verification
                </GlassCard>
              ) : (
                pendingPayments.map((payment) => (
                  <PaymentConfirmCard
                    key={payment.id}
                    payment={payment}
                    onConfirm={() => handleConfirmPayment(payment.id)}
                    loading={confirmingId === payment.id}
                  />
                ))
              )}
            </div>

            {/* Completed & Paid Jobs with View CoLabour Slip */}
            <h3 className="mb-4 mt-6 text-sm font-semibold text-gray-300 flex items-center gap-2">
              <Receipt size={16} className="text-neon-cyan" /> Settled Jobs & CoLabour Slips
            </h3>
            <div className="space-y-3">
              {completedJobs.length === 0 ? (
                <GlassCard className="p-4 text-center text-sm text-gray-500">No completed jobs yet</GlassCard>
              ) : (
                completedJobs.slice(0, 5).map((job) => {
                  const jobPayment = payments.find((p) => p.booking_id === job.id);
                  return (
                    <GlassCard key={job.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white text-sm">{job.customer?.name ?? 'Customer Booking'}</p>
                        <p className="text-xs text-gray-400">
                          {job.category} • ₹{Number(job.total_amount).toFixed(2)}
                          {jobPayment?.utr_number && <span className="font-mono text-neon-cyan ml-2">UTR: {jobPayment.utr_number}</span>}
                        </p>
                      </div>
                      <NeonButton
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedSlip({ booking: job, payment: jobPayment })}
                        className="text-xs"
                      >
                        <Eye size={14} /> View CoLabour Slip
                      </NeonButton>
                    </GlassCard>
>>>>>>> origin/main
                  );
                })
              )}
            </div>
          </div>
<<<<<<< HEAD

        </div>

      </div>
    </div>
  );
}
=======
        </div>
      </div>

      {/* Slip Modal */}
      {selectedSlip && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-base-950/85 backdrop-blur-md overflow-y-auto"
          onClick={() => setSelectedSlip(null)}
        >
          <div className="relative w-full max-w-md my-8" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedSlip(null)}
              className="absolute top-2 right-2 z-20 rounded-full bg-base-800 p-2 text-gray-400 hover:text-white border border-white/10"
            >
              <X size={18} />
            </button>
            <CoLabourPrinterEngine
              bookingId={selectedSlip.booking.id}
              workerName={user?.name ?? 'Professional'}
              workerSkill={selectedSlip.booking.category}
              workerUpiId={workerProfile.upi_id}
              customerName={selectedSlip.booking.customer?.name ?? 'Verified Customer'}
              date={selectedSlip.payment?.paid_at || selectedSlip.booking.scheduled_at}
              utrNumber={selectedSlip.payment?.utr_number || 'OFFICIAL-PAID-UTR'}
              totalAmount={Number(selectedSlip.booking.total_amount)}
              onDone={() => setSelectedSlip(null)}
            />
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-900/80 backdrop-blur-sm animate-fade-in" onClick={() => setShowSettings(false)}>
          <GlassCard className="w-full max-w-md p-6 m-4">
            <div onClick={(e) => e.stopPropagation()}>
              <h2 className="mb-4 text-lg font-semibold text-gray-200">Worker Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300">UPI ID</label>
                  <input value={upiId} onChange={(e) => setUpiId(e.target.value)} className="w-full rounded-xl border border-white/10 bg-base-800/60 px-4 py-3 text-sm text-gray-200 outline-none focus:border-neon-emerald/40" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300">Hourly Rate (₹)</label>
                  <input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} className="w-full rounded-xl border border-white/10 bg-base-800/60 px-4 py-3 text-sm text-gray-200 outline-none focus:border-neon-emerald/40" />
                </div>
                {settingsMsg && <p className={`text-sm ${settingsMsg.includes('success') ? 'text-neon-emerald' : 'text-red-400'}`}>{settingsMsg}</p>}
                <div className="flex gap-3">
                  <NeonButton fullWidth onClick={handleSaveSettings} disabled={savingSettings}>
                    {savingSettings ? <Loader2 size={16} className="animate-spin" /> : 'Save'}
                  </NeonButton>
                  <NeonButton variant="ghost" onClick={() => setShowSettings(false)}>Cancel</NeonButton>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Wallet; label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = {
    emerald: 'text-neon-emerald bg-neon-emerald/10 border-neon-emerald/30',
    cyan: 'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/30',
    violet: 'text-neon-violet bg-neon-violet/10 border-neon-violet/30',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  };
  return (
    <GlassCard className="p-5">
      <div className={`mb-3 inline-flex rounded-xl border p-2.5 ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-bold text-white">{typeof value === 'number' ? <AnimatedCounter value={value} /> : value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </GlassCard>
  );
}

function BookingRequestCard({ booking, onAccept, onDecline, onComplete }: {
  booking: BookingWithCustomer;
  onAccept: () => void;
  onDecline: () => void;
  onComplete: () => void;
}) {
  const statusColors: Record<string, string> = {
    pending: 'amber',
    confirmed: 'cyan',
    in_progress: 'violet',
    payment_submitted: 'cyan',
    completed: 'emerald',
    paid: 'emerald',
  };
  const variant = (statusColors[booking.status] ?? 'gray') as 'amber' | 'cyan' | 'violet' | 'emerald' | 'gray';

  return (
    <GlassCard className="p-5 animate-slide-up">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-white">{booking.customer?.name ?? 'Customer'}</h3>
          <p className="text-xs text-gray-400">{booking.category}</p>
        </div>
        <Badge variant={variant}>{booking.status === 'confirmed' ? 'Accepted' : booking.status.replace('_', ' ')}</Badge>
      </div>
      <div className="space-y-1.5 text-sm text-gray-400 mb-4">
        <div className="flex items-center gap-2"><Calendar size={14} /> {new Date(booking.scheduled_at).toLocaleString()}</div>
        <div className="flex items-center gap-2"><MapPin size={14} /> {booking.address}</div>
        <div className="flex items-center gap-2"><Wallet size={14} /> ₹{Number(booking.total_amount).toFixed(2)}</div>
        {booking.notes && <div className="text-xs text-gray-400 bg-white/5 p-2 rounded-lg mt-2">Note: {booking.notes}</div>}
      </div>
      <div className="flex gap-2">
        {booking.status === 'pending' && (
          <>
            <NeonButton size="sm" variant="emerald" onClick={onAccept}><Check size={14} /> Accept Job</NeonButton>
            <NeonButton size="sm" variant="danger" onClick={onDecline}><XCircle size={14} /> Decline</NeonButton>
          </>
        )}
        {booking.status === 'confirmed' && (
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-neon-emerald font-medium">Job Accepted • Customer paying via UPI</span>
            <NeonButton size="sm" variant="cyan" onClick={onComplete}><CheckCircle size={14} /> Mark Complete</NeonButton>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

function PaymentConfirmCard({ payment, onConfirm, loading }: {
  payment: PaymentWithBooking;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <GlassCard className="border-neon-emerald/30 bg-neon-emerald/5 p-5 animate-slide-up">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-white">Payment Received Alert</h3>
          <p className="text-xs font-mono text-neon-cyan">UTR: {payment.utr_number}</p>
        </div>
        <Badge variant="amber">Awaiting Receipt</Badge>
      </div>
      <div className="mb-4 space-y-1.5 text-sm text-gray-400">
        <div className="flex items-center gap-2"><Wallet size={14} /> ₹{Number(payment.amount).toFixed(2)}</div>
        <div className="flex items-center gap-2"><Clock size={14} /> {new Date(payment.created_at).toLocaleString()}</div>
      </div>
      <NeonButton size="sm" fullWidth variant="emerald" onClick={onConfirm} disabled={loading}>
        {loading ? <Loader2 size={14} className="animate-spin" /> : <><Check size={14} /> Yes, Received (Confirm)</>}
      </NeonButton>
    </GlassCard>
  );
}
>>>>>>> origin/main
