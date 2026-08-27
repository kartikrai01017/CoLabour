import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, MapPin, Wallet, Clock, Loader2, ArrowRight, Briefcase, CheckCircle,
  Receipt, AlertCircle, Eye, X, Navigation, Phone, ShieldCheck
} from 'lucide-react';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { AnimatedCounter } from '@/components/ui/Shared';
import { CATEGORY_ICONS, getCategoryStyle } from '@/lib/categories';
import { useAuth } from '@/context/AuthContext';
import { fetchCustomerDashboardData } from '@/lib/dataService';
import { CoLabourPrinterEngine } from '@/components/CoLabourPrinterEngine';

interface BookingWithWorker {
  id: string;
  customer_id: string;
  worker_id: string;
  category: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'payment_submitted' | 'completed' | 'paid' | 'cancelled';
  total_amount: number | string;
  scheduled_at: string;
  address: string;
  notes?: string;
  worker?: { 
    id: string; 
    category: string; 
    hourly_rate: number; 
    lat?: number;
    lng?: number;
    users?: { name?: string; full_name?: string; phone?: string } | null;
  } | null;
}

interface PaymentWithBooking {
  id: string;
  booking_id: string;
  amount: number | string;
  status: 'pending' | 'payment_submitted' | 'paid' | 'failed';
  paid_at?: string;
  utr_number?: string;
  bookings?: { id: string; category: string } | null;
}

export function CustomerDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<BookingWithWorker[]>([]);
  const [payments, setPayments] = useState<PaymentWithBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlip, setSelectedSlip] = useState<{ booking: BookingWithWorker; payment?: PaymentWithBooking } | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const data = await fetchCustomerDashboardData(user.id);
      setBookings((data.bookings as unknown as BookingWithWorker[]) || []);
      setPayments((data.payments as unknown as PaymentWithBooking[]) || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (user) fetchData();
    else setLoading(false);
  }, [user, authLoading, fetchData]);

  // Poll for status updates
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [user, fetchData]);

  const activeBookings = bookings.filter((b) => ['pending', 'confirmed', 'in_progress', 'payment_submitted'].includes(b.status));
  const completedBookings = bookings.filter((b) => b.status === 'paid' || b.status === 'completed');
  const totalSpent = payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const pendingPayments = payments.filter((p) => p.status === 'pending' || p.status === 'payment_submitted');

  const incomingWorkerBooking = bookings.find((b) => b.status === 'confirmed' || b.status === 'in_progress');
  const displayName = (user as any)?.full_name || (user as any)?.name || 'User';

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-16">
        <Loader2 size={32} className="animate-spin text-neon-emerald" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-transparent pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b-2 border-black/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 border-2 border-black rounded-full text-xs font-black text-black shadow-[2px_2px_0px_0px_#000] mb-2 uppercase tracking-wide">
              <CheckCircle size={13} className="text-emerald-700" /> Live Customer Console
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight">My Customer Dashboard</h1>
            <p className="text-sm font-semibold text-gray-700 mt-1">
              Welcome back, <span className="text-black font-black underline decoration-emerald-500">{displayName}</span>
            </p>
          </div>
          <Link to="/workers">
            <NeonButton variant="emerald"><Briefcase size={16} /> Book a Worker</NeonButton>
          </Link>
        </div>

        {/* Live Tracking Map on Active Booking */}
        {incomingWorkerBooking && (
          <div className="mb-8 border-2 border-black bg-gradient-to-r from-emerald-50 via-teal-50 to-white rounded-3xl p-6 shadow-[6px_6px_0px_0px_#000] relative overflow-hidden">
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
              
              <div className="w-full lg:w-1/2 space-y-4">
                <div className="inline-flex items-center gap-2 bg-emerald-400 border-2 border-black px-3 py-1 rounded-full text-xs font-black uppercase text-black shadow-[2px_2px_0px_0px_#000] animate-pulse">
                  <Navigation size={14} /> Worker En Route • Live Tracking Active
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
                  {incomingWorkerBooking.worker?.users?.name || incomingWorkerBooking.worker?.users?.full_name || 'Worker'} is arriving at your location
                </h2>

                <div className="grid grid-cols-2 gap-3 text-xs font-bold text-gray-800">
                  <div className="bg-white border-2 border-black p-3 rounded-xl shadow-[2px_2px_0px_0px_#000]">
                    <span className="text-gray-500 block text-[10px] uppercase">Service</span>
                    {incomingWorkerBooking.category}
                  </div>
                  <div className="bg-white border-2 border-black p-3 rounded-xl shadow-[2px_2px_0px_0px_#000]">
                    <span className="text-gray-500 block text-[10px] uppercase">Est. Arrival</span>
                    ~ 12 - 18 Mins
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-1">
                  {incomingWorkerBooking.worker?.users?.phone && (
                    <a 
                      href={`tel:${incomingWorkerBooking.worker.users.phone}`} 
                      className="inline-flex items-center gap-2 bg-white border-2 border-black px-4 py-2 rounded-xl text-xs font-black shadow-[2px_2px_0px_0px_#000] hover:bg-gray-100"
                    >
                      <Phone size={14} className="text-emerald-600" /> Call Worker
                    </a>
                  )}
                  <Link to={`/payment/${incomingWorkerBooking.id}`}>
                    <NeonButton size="sm" variant="emerald">
                      View Live Job & UPI Portal <ArrowRight size={14} />
                    </NeonButton>
                  </Link>
                </div>
              </div>

              {/* Radar Simulation */}
              <div className="w-full lg:w-1/2 h-56 bg-slate-900 border-2 border-black rounded-2xl relative overflow-hidden shadow-[4px_4px_0px_0px_#000] flex items-center justify-center">
                <div className="absolute w-40 h-40 border border-emerald-500/30 rounded-full animate-ping pointer-events-none" />
                <div className="absolute w-64 h-64 border border-emerald-500/20 rounded-full pointer-events-none" />
                <div className="absolute w-32 h-32 border border-emerald-500/40 rounded-full pointer-events-none" />
                
                <div className="absolute bottom-10 right-14 flex flex-col items-center">
                  <div className="h-4 w-4 bg-cyan-400 border-2 border-black rounded-full shadow-[0_0_12px_#22d3ee]" />
                  <span className="text-[10px] font-black text-white bg-black/80 px-2 py-0.5 rounded-md mt-1 border border-cyan-400">
                    Your Location
                  </span>
                </div>

                <div className="absolute top-12 left-16 flex flex-col items-center animate-bounce">
                  <div className="h-6 w-6 bg-emerald-400 border-2 border-black rounded-full flex items-center justify-center shadow-[0_0_15px_#34d399]">
                    <ShieldCheck size={14} className="text-black" />
                  </div>
                  <span className="text-[10px] font-black text-black bg-emerald-400 px-2 py-0.5 rounded-md mt-1 border border-black shadow-[2px_2px_0px_0px_#000]">
                    {incomingWorkerBooking.worker?.users?.name || incomingWorkerBooking.worker?.users?.full_name || 'Worker'} (Live)
                  </span>
                </div>

                <div className="absolute bottom-2 left-3 text-[11px] font-mono font-bold text-emerald-400/80 bg-black/60 px-2 py-1 rounded">
                  GPS: 19.0760° N, 72.8777° E • Signal: High
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={Calendar} label="Active Bookings" value={activeBookings.length} color="cyan" />
          <StatCard icon={CheckCircle} label="Completed & Paid" value={completedBookings.length} color="emerald" />
          <StatCard icon={Wallet} label="Total Spent" value={`₹${totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} color="violet" />
          <StatCard icon={Clock} label="Pending Payments" value={pendingPayments.length} color="amber" />
        </div>

        {/* Pending payments alert */}
        {pendingPayments.length > 0 && (
          <div className="mb-8 bg-amber-50 border-2 border-black p-5 rounded-2xl shadow-[5px_5px_0px_0px_#000] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-400 border-2 border-black rounded-xl text-black shadow-[2px_2px_0px_0px_#000]">
                <AlertCircle size={24} />
              </div>
              <div>
                <p className="text-base font-black text-black">Action Required: {pendingPayments.length} pending payment(s)</p>
                <p className="text-xs font-semibold text-gray-700">Complete or track your UPI payment to settle your booking with 0% fees</p>
              </div>
            </div>
            {pendingPayments[0] && (
              <Link to={`/payment/${pendingPayments[0].booking_id}`}>
                <NeonButton size="sm" variant="emerald">Open Payment Gateway <ArrowRight size={14} /></NeonButton>
              </Link>
            )}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Active bookings */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center gap-2 text-xl font-black text-black">
                <Clock size={20} className="text-black" /> Active Bookings
              </h2>
              <span className="px-2.5 py-0.5 bg-black text-white text-xs font-black rounded-full">
                {activeBookings.length}
              </span>
            </div>
            <div className="space-y-4">
              {activeBookings.length === 0 ? (
                <div className="bg-white border-2 border-black rounded-2xl p-8 text-center shadow-[4px_4px_0px_0px_#000]">
                  <p className="text-gray-600 font-bold mb-4">No active bookings right now</p>
                  <Link to="/workers"><NeonButton variant="ghost" size="sm">Browse Verified Workers</NeonButton></Link>
                </div>
              ) : (
                activeBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              )}
            </div>
          </div>

          {/* Completed & receipts */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center gap-2 text-xl font-black text-black">
                <Receipt size={20} className="text-black" /> History & Official POS Slips
              </h2>
              <span className="px-2.5 py-0.5 bg-emerald-400 border border-black text-black text-xs font-black rounded-full">
                {completedBookings.length}
              </span>
            </div>
            <div className="space-y-4">
              {completedBookings.length === 0 ? (
                <div className="bg-white border-2 border-black rounded-2xl p-8 text-center text-gray-600 font-bold shadow-[4px_4px_0px_0px_#000]">
                  No completed bookings yet
                </div>
              ) : (
                completedBookings.map((booking) => {
                  const p = payments.find((pay) => pay.booking_id === booking.id);
                  return (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      showReceipt
                      onViewSlip={() => setSelectedSlip({ booking, payment: p })}
                    />
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Slip Modal */}
      {selectedSlip && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
          onClick={() => setSelectedSlip(null)}
        >
          <div className="relative w-full max-w-md my-8" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedSlip(null)}
              className="absolute top-2 right-2 z-20 rounded-full bg-white p-2 text-black hover:bg-gray-200 border-2 border-black shadow-[2px_2px_0px_0px_#000]"
            >
              <X size={18} />
            </button>
            <CoLabourPrinterEngine
              bookingId={selectedSlip.booking.id}
              workerName={selectedSlip.booking.worker?.users?.name || selectedSlip.booking.worker?.users?.full_name || 'Professional Worker'}
              workerSkill={selectedSlip.booking.category}
              customerName={displayName}
              date={selectedSlip.payment?.paid_at || selectedSlip.booking.scheduled_at}
              utrNumber={selectedSlip.payment?.utr_number || 'UPI-OFFICIAL-UTR'}
              totalAmount={Number(selectedSlip.booking.total_amount)}
              onDone={() => setSelectedSlip(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Wallet; label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-100 text-emerald-900 border-2 border-black',
    cyan: 'bg-cyan-100 text-cyan-900 border-2 border-black',
    violet: 'bg-purple-100 text-purple-900 border-2 border-black',
    amber: 'bg-amber-100 text-amber-900 border-2 border-black',
  };
  return (
    <div className="bg-white border-2 border-black p-5 rounded-2xl shadow-[5px_5px_0px_0px_#000]">
      <div className={`mb-3 inline-flex rounded-xl p-2.5 shadow-[2px_2px_0px_0px_#000] ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl sm:text-3xl font-black text-black tracking-tight">{typeof value === 'number' ? <AnimatedCounter value={value} /> : value}</p>
      <p className="text-xs font-bold text-gray-600 mt-1 uppercase tracking-wide">{label}</p>
    </div>
  );
}

function BookingCard({
  booking,
  showReceipt,
  onViewSlip,
}: {
  booking: BookingWithWorker;
  showReceipt?: boolean;
  onViewSlip?: () => void;
}) {
  const statusColors: Record<string, 'amber' | 'cyan' | 'violet' | 'emerald' | 'gray'> = {
    pending: 'amber',
    confirmed: 'cyan',
    in_progress: 'violet',
    payment_submitted: 'cyan',
    completed: 'emerald',
    paid: 'emerald',
    cancelled: 'gray',
  };
  const variant = statusColors[booking.status] ?? 'gray';
  const Icon = (CATEGORY_ICONS as any)[booking.category] ?? Briefcase;
  const style = getCategoryStyle(booking.category);
  const workerDisplayName = booking.worker?.users?.name || booking.worker?.users?.full_name || 'Worker';

  return (
    <div className="bg-white border-2 border-black p-5 rounded-2xl shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`h-12 w-12 rounded-xl border-2 border-black ${style.bg} flex items-center justify-center shadow-[2px_2px_0px_0px_#000]`}>
            <Icon className={style.text} size={24} />
          </div>
          <div>
            <h3 className="font-black text-black text-base">{workerDisplayName}</h3>
            <p className="text-xs font-bold text-gray-600">{booking.category}</p>
          </div>
        </div>
        <Badge variant={variant}>{booking.status === 'confirmed' ? 'Accepted' : booking.status.replace('_', ' ')}</Badge>
      </div>

      <div className="space-y-1.5 text-xs font-semibold text-gray-700 mb-4 bg-gray-50 border border-black/10 p-3 rounded-xl">
        <div className="flex items-center gap-2"><Calendar size={14} className="text-black" /> {new Date(booking.scheduled_at).toLocaleString()}</div>
        <div className="flex items-center gap-2"><MapPin size={14} className="text-black" /> {booking.address}</div>
        <div className="flex items-center gap-2 font-bold text-black"><Wallet size={14} /> ₹{Number(booking.total_amount).toFixed(2)}</div>
      </div>

      <div className="flex gap-2">
        {booking.status === 'pending' && (
          <Link to={`/payment/${booking.id}`} className="w-full">
            <NeonButton size="sm" variant="amber" fullWidth>Waiting for Acceptance <ArrowRight size={14} /></NeonButton>
          </Link>
        )}
        {booking.status === 'confirmed' && (
          <Link to={`/payment/${booking.id}`} className="w-full">
            <NeonButton size="sm" variant="emerald" fullWidth>Pay Worker via UPI <ArrowRight size={14} /></NeonButton>
          </Link>
        )}
        {booking.status === 'payment_submitted' && (
          <Link to={`/payment/${booking.id}`} className="w-full">
            <NeonButton size="sm" variant="cyan" fullWidth>Track Verification <ArrowRight size={14} /></NeonButton>
          </Link>
        )}
        {showReceipt && (booking.status === 'paid' || booking.status === 'completed') && (
          <div className="flex items-center justify-between w-full">
            <span className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-400 font-bold">
              <CheckCircle size={14} /> Payment Settled
            </span>
            {onViewSlip && (
              <NeonButton size="sm" variant="ghost" onClick={onViewSlip} className="text-xs">
                <Eye size={14} /> View CoLabour Slip
              </NeonButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
