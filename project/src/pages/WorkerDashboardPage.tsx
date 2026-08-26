import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchWorkerDashboardData, updateBookingStatus, confirmPaymentAsReceived, rejectPaymentDispute, fetchPaymentByBookingId } from '@/lib/dataService';
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  Star, 
  User as UserIcon, 
  Phone, 
  MapPin, 
  Calendar,
  AlertCircle,
  Wallet,
  XCircle,
  Check,
  Loader2,
  Printer
} from 'lucide-react';

export function WorkerDashboardPage() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      const data = await fetchWorkerDashboardData(user.id);
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    try {
      setLoadingId(bookingId);
      await updateBookingStatus(bookingId, newStatus);
      
      setDashboardData((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          bookings: prev.bookings.map((b: any) =>
            b.id === bookingId ? { ...b, status: newStatus } : b
          ),
        };
      });
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Status update failed, please try again.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleConfirmPayment = async (bookingId: string) => {
    try {
      setLoadingId(bookingId);
      // Find payment for this booking then confirm
      const payment = await fetchPaymentByBookingId(bookingId);
      if (!payment) { alert('No payment found for this booking'); return; }
      const ok = await confirmPaymentAsReceived(payment.id);
      if (!ok) throw new Error('Confirm failed');
      // Soundbox effect - kept
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.type = 'sine'; osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.4);
      } catch {}
      setDashboardData((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          bookings: prev.bookings.map((b: any) => b.id === bookingId ? { ...b, status: 'paid' } : b),
        };
      });
      // reload to reflect payment table
      setTimeout(loadData, 500);
    } catch (err) {
      console.error(err);
      alert('Payment confirmation failed');
    } finally { setLoadingId(null); }
  };

  const handleRejectPayment = async (bookingId: string) => {
    try {
      setLoadingId(bookingId);
      const payment = await fetchPaymentByBookingId(bookingId);
      if (!payment) { alert('No payment found'); return; }
      await rejectPaymentDispute(payment.id);
      // Reset booking to confirmed so customer can retry
      await updateBookingStatus(bookingId, 'confirmed');
      setDashboardData((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          bookings: prev.bookings.map((b: any) => b.id === bookingId ? { ...b, status: 'confirmed' } : b),
        };
      });
      alert('Payment rejected - customer can resubmit UTR.');
      setTimeout(loadData, 500);
    } catch (err) {
      console.error(err);
      alert('Reject failed');
    } finally { setLoadingId(null); }
  };

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading worker dashboard...</p>
        </div>
      </div>
    );
  }

  const profile = dashboardData?.profile;
  const bookings = dashboardData?.bookings || [];
  const activeRequests = bookings.filter((b: any) => b.status === 'pending');
  const ongoingJobs = bookings.filter((b: any) => b.status === 'confirmed' || b.status === 'in_progress' || b.status === 'payment_submitted');
  const completedJobs = bookings.filter((b: any) => b.status === 'completed' || b.status === 'paid');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Profile Banner */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-2xl">
              {user?.name ? user.name[0].toUpperCase() : 'W'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                {user?.name || 'Professional Worker'}
                {profile?.is_verified && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                )}
              </h1>
              <p className="text-sm text-slate-400">
                {profile?.category || 'Service Professional'} • {profile?.location || 'Local Area'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Base Hourly Rate</span>
            <p className="text-xl font-bold text-emerald-400">₹{profile?.hourly_rate || 350}/hr</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl">
            <div className="flex items-center gap-3 text-slate-400 text-sm mb-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Pending Requests</span>
            </div>
            <p className="text-2xl font-bold text-white">{activeRequests.length}</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl">
            <div className="flex items-center gap-3 text-slate-400 text-sm mb-2">
              <Briefcase className="w-4 h-4 text-blue-400" />
              <span>Ongoing Jobs</span>
            </div>
            <p className="text-2xl font-bold text-white">{ongoingJobs.length}</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl">
            <div className="flex items-center gap-3 text-slate-400 text-sm mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Jobs Settled</span>
            </div>
            <p className="text-2xl font-bold text-white">{completedJobs.length}</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl">
            <div className="flex items-center gap-3 text-slate-400 text-sm mb-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>Rating</span>
            </div>
            <p className="text-2xl font-bold text-white">{profile?.rating || 5.0}</p>
          </div>
        </div>

        {/* Job Requests */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-400" />
            Job Dispatches & Requests
          </h2>

          {bookings.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              No active job requests right now.
            </div>
          ) : (
            <div className="grid gap-4">
              {bookings.map((booking: any) => (
                <div 
                  key={booking.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {booking.category}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {booking.scheduled_at ? new Date(booking.scheduled_at).toLocaleString() : 'Immediate'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-slate-300">
                        <UserIcon className="w-4 h-4 text-slate-500" />
                        <span>Customer: {booking.customer?.name || 'Direct Customer'}</span>
                        {booking.customer?.phone && (
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Phone className="w-3 h-3 text-slate-500" />
                            {booking.customer.phone}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                        <span>{booking.address || 'Address provided upon acceptance'}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400">Amount</span>
                      <p className="text-xl font-bold text-white">₹{booking.total_amount || 0}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Status: <span className="text-emerald-400">{booking.status}</span>
                    </span>

                    <div className="flex gap-2">
                      {booking.status === 'pending' && (
                        <>
                          <button
                            disabled={loadingId === booking.id}
                            onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
                          >
                            {loadingId === booking.id ? 'Accepting...' : 'Accept Job'}
                          </button>
                          <button
                            disabled={loadingId === booking.id}
                            onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                            className="px-4 py-1.5 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 text-sm font-medium rounded-lg transition disabled:opacity-50"
                          >
                            Decline
                          </button>
                        </>
                      )}

                      {booking.status === 'confirmed' && (
                        <button
                          disabled={loadingId === booking.id}
                          onClick={() => handleUpdateStatus(booking.id, 'in_progress')}
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
                        >
                          Start Job
                        </button>
                      )}

                      {booking.status === 'in_progress' && (
                        <button
                          disabled={loadingId === booking.id}
                          onClick={() => handleUpdateStatus(booking.id, 'completed')}
                          className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
                        >
                          Mark Completed
                        </button>
                      )}

                      {booking.status === 'payment_submitted' && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-amber-500/20 text-amber-300 px-3 py-1.5 rounded-lg border border-amber-500/30 flex items-center gap-1">
                            <Wallet size={12} className="animate-pulse" /> UTR Submitted - Verify Manual
                          </span>
                          <button
                            disabled={loadingId === booking.id}
                            onClick={() => handleRejectPayment(booking.id)}
                            className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 text-xs font-medium rounded-lg border border-rose-500/30 flex items-center gap-1 disabled:opacity-50"
                          >
                            {loadingId === booking.id ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />} Reject
                          </button>
                          <button
                            disabled={loadingId === booking.id}
                            onClick={() => handleConfirmPayment(booking.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 disabled:opacity-50 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                          >
                            {loadingId === booking.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Confirm Payment Received ✓
                          </button>
                        </div>
                      )}

                      {booking.status === 'paid' && (
                        <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                          Paid & Settled
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
