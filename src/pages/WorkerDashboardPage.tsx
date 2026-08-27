import { useState, useEffect, useCallback } from 'react';
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
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
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

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-16">
        <Loader2 size={32} className="animate-spin text-emerald-500" />
      </div>
    );
  }

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
                ))
              )}
            </div>
          </div>

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
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
