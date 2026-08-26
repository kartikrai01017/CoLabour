import { useState, useEffect, useCallback } from 'react';
import {
  Users, ShieldCheck, Briefcase, Wallet, TrendingUp, Loader2, CheckCircle, XCircle,
  Star, AlertTriangle, Activity, DollarSign, Clock,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { GlowOrb, AnimatedCounter } from '@/components/ui/Shared';
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
    <div className="relative min-h-screen overflow-hidden pt-20 pb-12">
      <GlowOrb className="top-20 -left-20 h-80 w-80 bg-neon-violet/10" />
      <GlowOrb className="bottom-0 right-0 h-80 w-80 bg-neon-emerald/10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="inline-flex rounded-xl bg-neon-violet/10 border border-neon-violet/30 p-2.5">
              <ShieldCheck size={24} className="text-neon-violet" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Command Center</h1>
          </div>
          <p className="text-sm text-gray-400">Platform-wide monitoring and management</p>
        </div>

        {/* Telemetry */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <TelemetryCard icon={DollarSign} label="Total Revenue" value={`₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} color="emerald" />
          <TelemetryCard icon={Users} label="Total Workers" value={workers.length} color="cyan" />
          <TelemetryCard icon={Briefcase} label="Active Bookings" value={activeBookings} color="violet" />
          <TelemetryCard icon={AlertTriangle} label="Open Disputes" value={disputes.length} color="amber" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Worker verifications */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-200">
              <ShieldCheck size={18} className="text-neon-cyan" /> Worker Verifications
              {pendingVerifications > 0 && <Badge variant="amber">{pendingVerifications} pending</Badge>}
            </h2>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {workers.length === 0 ? (
                <GlassCard className="p-6 text-center text-gray-500">No workers registered</GlassCard>
              ) : (
                workers.map((worker) => {
                  const Icon = CATEGORY_ICONS[worker.category] ?? Briefcase;
                  const style = getCategoryStyle(worker.category);
                  return (
                    <GlassCard key={worker.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-xl border ${style.bg} ${style.border} flex items-center justify-center`}>
                            <Icon className={style.text} size={20} />
                          </div>
                          <div>
                            <p className="font-medium text-white text-sm">{worker.users?.name ?? 'Unknown'}</p>
                            <p className="text-xs text-gray-400">{worker.category} • ₹{worker.hourly_rate}/hr</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={worker.is_verified ? 'emerald' : 'amber'}>
                            {worker.is_verified ? <><CheckCircle size={12} /> Verified</> : <><Clock size={12} /> Pending</>}
                          </Badge>
                          <NeonButton size="sm" variant={worker.is_verified ? 'danger' : 'emerald'} onClick={() => handleToggleVerify(worker.id, worker.is_verified)}>
                            {worker.is_verified ? <XCircle size={14} /> : <CheckCircle size={14} />}
                          </NeonButton>
                        </div>
                      </div>
                    </GlassCard>
                  );
                })
              )}
            </div>
          </div>

          {/* Dispute logs */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-200">
              <AlertTriangle size={18} className="text-amber-400" /> Dispute Logs
              {disputes.length > 0 && <Badge variant="amber">{disputes.length}</Badge>}
            </h2>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {disputes.length === 0 ? (
                <GlassCard className="p-6 text-center text-gray-500">No disputes - all clear</GlassCard>
              ) : (
                disputes.map((dispute) => (
                  <GlassCard key={dispute.id} className="border-amber-500/20 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium text-white text-sm">Payment Dispute</p>
                        <p className="text-xs text-gray-400">UTR: {dispute.utr_number ?? 'N/A'}</p>
                        <p className="text-xs text-gray-400">Amount: ₹{Number(dispute.amount).toFixed(2)}</p>
                      </div>
                      <Badge variant="amber">Unresolved</Badge>
                    </div>
                    <NeonButton size="sm" variant="emerald" fullWidth onClick={() => handleResolveDispute(dispute.id)}>
                      <CheckCircle size={14} /> Resolve & Mark Paid
                    </NeonButton>
                  </GlassCard>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Platform telemetry */}
        <div className="mt-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-200">
            <Activity size={18} className="text-neon-emerald" /> Platform Telemetry
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
