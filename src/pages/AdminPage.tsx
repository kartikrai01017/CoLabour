import { useState, useEffect, useCallback } from 'react';
import {
  Users, ShieldCheck, Briefcase, Wallet, TrendingUp, Loader2, CheckCircle, XCircle,
  Star, AlertTriangle, Activity, DollarSign, Clock,
} from 'lucide-react';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { AnimatedCounter } from '@/components/ui/Shared';
import { type WorkerProfile, type Booking, type Payment } from '@/lib/supabase';
import { CATEGORY_ICONS, getCategoryStyle } from '@/lib/categories';
import { useAuth } from '@/context/AuthContext';
import { fetchAdminData, toggleWorkerVerification, resolvePaymentDispute } from '@/lib/dataService';

interface WorkerWithUser extends WorkerProfile {
  users?: { name: string; email: string } | null;
}

export function AdminPage() {
  const { loading: authLoading } = useAuth();
  const [workers, setWorkers] = useState<WorkerWithUser[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [disputes, setDisputes] = useState<Payment[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const data = await fetchAdminData();
      setWorkers(data.workers as unknown as WorkerWithUser[]);
      setBookings(data.bookings);
      setPayments(data.payments);
      setDisputes(data.payments.filter((p) => p.status === 'payment_submitted'));
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    fetchData();
  }, [authLoading, fetchData]);

  const handleToggleVerify = async (workerId: string, current: boolean) => {
    try {
      await toggleWorkerVerification(workerId, current);
      await fetchData();
    } catch {
      alert('Failed to update verification');
    }
  };

  const handleResolveDispute = async (paymentId: string) => {
    try {
      await resolvePaymentDispute(paymentId);
      await fetchData();
    } catch {
      alert('Failed to resolve dispute');
    }
  };

  const totalRevenue = payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0);
  const verifiedWorkers = workers.filter((w) => w.is_verified).length;
  const pendingVerifications = workers.filter((w) => !w.is_verified).length;
  const activeBookings = bookings.filter((b) => ['pending', 'confirmed', 'in_progress', 'payment_submitted'].includes(b.status)).length;

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-16">
        <Loader2 size={32} className="animate-spin text-neon-emerald" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#F6F4EE] pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 border-b-2 border-black/10 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="inline-flex rounded-xl bg-purple-200 border-2 border-black p-2.5 shadow-[3px_3px_0px_0px_#000]">
              <ShieldCheck size={26} className="text-black" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight">Admin Command Center</h1>
              <p className="text-sm font-semibold text-gray-700">Platform-wide telemetry, verification control, and dispute clearance</p>
            </div>
          </div>
        </div>

        {/* Telemetry */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <TelemetryCard icon={DollarSign} label="Total Revenue" value={`₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} color="emerald" />
          <TelemetryCard icon={Users} label="Total Workers" value={workers.length} color="cyan" />
          <TelemetryCard icon={Briefcase} label="Active Bookings" value={activeBookings} color="violet" />
          <TelemetryCard icon={AlertTriangle} label="Open Disputes" value={disputes.length} color="amber" />
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Worker verifications */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center gap-2 text-xl font-black text-black">
                <ShieldCheck size={20} className="text-black" /> Worker Verifications
              </h2>
              {pendingVerifications > 0 && <Badge variant="amber">{pendingVerifications} pending</Badge>}
            </div>
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {workers.length === 0 ? (
                <div className="bg-white border-2 border-black rounded-2xl p-6 text-center text-gray-600 font-bold shadow-[4px_4px_0px_0px_#000]">
                  No workers registered yet
                </div>
              ) : (
                workers.map((worker) => {
                  const Icon = CATEGORY_ICONS[worker.category] ?? Briefcase;
                  const style = getCategoryStyle(worker.category);
                  return (
                    <div key={worker.id} className="bg-white border-2 border-black p-4 rounded-2xl shadow-[4px_4px_0px_0px_#000]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`h-11 w-11 rounded-xl border-2 border-black ${style.bg} flex items-center justify-center shadow-[2px_2px_0px_0px_#000]`}>
                            <Icon className={style.text} size={22} />
                          </div>
                          <div>
                            <p className="font-black text-black text-sm">{worker.users?.name ?? 'Unknown'}</p>
                            <p className="text-xs font-bold text-gray-600">{worker.category} • ₹{worker.hourly_rate}/hr</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={worker.is_verified ? 'emerald' : 'amber'}>
                            {worker.is_verified ? <><CheckCircle size={12} /> Verified</> : <><Clock size={12} /> Pending</>}
                          </Badge>
                          <NeonButton size="sm" variant={worker.is_verified ? 'danger' : 'emerald'} onClick={() => handleToggleVerify(worker.id, worker.is_verified)}>
                            {worker.is_verified ? <><XCircle size={14} /> Revoke</> : <><CheckCircle size={14} /> Verify</>}
                          </NeonButton>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Dispute logs */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center gap-2 text-xl font-black text-black">
                <AlertTriangle size={20} className="text-amber-600" /> Dispute Logs
              </h2>
              {disputes.length > 0 && <Badge variant="amber">{disputes.length} open</Badge>}
            </div>
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {disputes.length === 0 ? (
                <div className="bg-white border-2 border-black rounded-2xl p-6 text-center text-gray-600 font-bold shadow-[4px_4px_0px_0px_#000]">
                  ✨ No open disputes — all transactions resolved
                </div>
              ) : (
                disputes.map((dispute) => (
                  <div key={dispute.id} className="bg-amber-50 border-2 border-black p-4 rounded-2xl shadow-[4px_4px_0px_0px_#000]">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-black text-black text-sm">Payment Dispute</p>
                        <p className="text-xs font-mono font-bold text-gray-800">UTR: {dispute.utr_number ?? 'N/A'}</p>
                        <p className="text-xs font-black text-emerald-800">Amount: ₹{Number(dispute.amount).toFixed(2)}</p>
                      </div>
                      <Badge variant="amber">Unresolved</Badge>
                    </div>
                    <NeonButton size="sm" variant="emerald" fullWidth onClick={() => handleResolveDispute(dispute.id)}>
                      <CheckCircle size={14} /> Resolve & Mark Paid
                    </NeonButton>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Platform telemetry */}
        <div className="mt-10 pt-8 border-t-2 border-black/10">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-black">
            <Activity size={20} className="text-black" /> Network Telemetry
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <TelemetryCard icon={TrendingUp} label="Total Bookings" value={bookings.length} color="cyan" />
            <TelemetryCard icon={CheckCircle} label="Completed" value={bookings.filter((b) => b.status === 'paid' || b.status === 'completed').length} color="emerald" />
            <TelemetryCard icon={Star} label="Verified Workers" value={verifiedWorkers} color="violet" />
            <TelemetryCard icon={Wallet} label="Total Payments" value={payments.length} color="amber" />
          </div>
        </div>
      </div>
    </div>
  );
}

function TelemetryCard({ icon: Icon, label, value, color }: { icon: typeof Users; label: string; value: string | number; color: string }) {
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
