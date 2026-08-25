import { useState, useEffect, useCallback } from 'react';
import {
  Users, ShieldCheck, Briefcase, Wallet, TrendingUp, Loader2, CheckCircle, XCircle,
  Star, AlertTriangle, Activity, DollarSign, Clock,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Badge } from '@/components/ui/Badge';
import { FloatingShape, AnimatedCounter } from '@/components/ui/Shared';
import { supabase, type WorkerProfile, type Booking, type Payment } from '@/lib/supabase';
import { CATEGORY_ICONS, getCategoryStyle } from '@/lib/categories';
import { useAuth } from '@/context/AuthContext';

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
    const { data: workerData } = await supabase
      .from('worker_profiles')
      .select('*, users:user_id(name, email)')
      .order('created_at', { ascending: false });
    setWorkers((workerData as unknown as WorkerWithUser[]) ?? []);

    const { data: bookingData } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
    setBookings(bookingData ?? []);

    const { data: paymentData } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
    setPayments(paymentData ?? []);

    setDisputes((paymentData ?? []).filter((p) => p.status === 'payment_submitted'));

    setLoading(false);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    fetchData();
  }, [authLoading, fetchData]);

  const handleToggleVerify = async (workerId: string, current: boolean) => {
    try {
      await supabase.from('worker_profiles').update({ is_verified: !current }).eq('id', workerId);
      await fetchData();
    } catch {
      alert('Failed to update verification');
    }
  };

  const handleResolveDispute = async (paymentId: string) => {
    try {
      await supabase.from('payments').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', paymentId);
      const payment = payments.find((p) => p.id === paymentId);
      if (payment) {
        await supabase.from('bookings').update({ status: 'paid' }).eq('id', payment.booking_id);
      }
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
        <Loader2 size={28} className="animate-spin text-brass" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden pt-20 pb-12 atmosphere">
      <FloatingShape className="top-20 -left-20 h-[350px] w-[350px] animate-drift-slow" color="neon-cyan" />
      <FloatingShape className="bottom-0 -right-20 h-[300px] w-[300px] animate-drift" color="neon-purple" delay={2} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-7 flex items-center gap-3 animate-fade-in">
          <div className="inline-flex rounded-xl bg-brass/[0.08] border border-brass/15 p-2.5 shadow-brass">
            <ShieldCheck size={24} className="text-brass" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Admin Command Center</h1>
            <p className="text-xs text-muted">Platform-wide monitoring and management</p>
          </div>
        </div>

        <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <TelemetryCard icon={DollarSign} label="Total Revenue" value={`₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} color="emerald" />
          <TelemetryCard icon={Users} label="Total Workers" value={workers.length} color="cyan" />
          <TelemetryCard icon={Briefcase} label="Active Bookings" value={activeBookings} color="purple" />
          <TelemetryCard icon={AlertTriangle} label="Open Disputes" value={disputes.length} color="amber" />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <h2 className="mb-3.5 flex items-center gap-2 text-base font-semibold text-white">
              <ShieldCheck size={16} className="text-brass" /> Worker Verifications
              {pendingVerifications > 0 && <Badge variant="amber">{pendingVerifications} pending</Badge>}
            </h2>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1.5 scrollbar-thin">
              {workers.length === 0 ? (
                <GlassCard className="p-5 text-center text-muted-dark text-sm">No workers registered</GlassCard>
              ) : workers.map((worker) => {
                const Icon = CATEGORY_ICONS[worker.category] ?? Briefcase;
                const style = getCategoryStyle(worker.category);
                return (
                  <GlassCard key={worker.id} className="p-3.5 animate-slide-up">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`h-9 w-9 rounded-lg border ${style.bg} ${style.border} flex items-center justify-center shadow-lg`}>
                          <Icon className={style.text} size={18} />
                        </div>
                        <div>
                          <p className="font-medium text-white text-xs">{worker.users?.name ?? 'Unknown'}</p>
                          <p className="text-[11px] text-muted-dark">{worker.category} · ₹{worker.hourly_rate}/hr</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant={worker.is_verified ? 'emerald' : 'amber'}>
                          {worker.is_verified ? <><CheckCircle size={10} /> Verified</> : <><Clock size={10} /> Pending</>}
                        </Badge>
                        <NeonButton size="sm" variant={worker.is_verified ? 'danger' : 'emerald'} onClick={() => handleToggleVerify(worker.id, worker.is_verified)}>
                          {worker.is_verified ? <XCircle size={12} /> : <CheckCircle size={12} />}
                        </NeonButton>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="mb-3.5 flex items-center gap-2 text-base font-semibold text-white">
              <AlertTriangle size={16} className="text-[#c27a6e]" /> Dispute Logs
              {disputes.length > 0 && <Badge variant="amber">{disputes.length}</Badge>}
            </h2>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1.5 scrollbar-thin">
              {disputes.length === 0 ? (
                <GlassCard className="p-5 text-center text-muted-dark text-sm">No disputes - all clear</GlassCard>
              ) : disputes.map((dispute) => (
                <GlassCard key={dispute.id} className="p-3.5 animate-slide-up">
                  <div className="flex items-start justify-between mb-2.5">
                    <div>
                      <p className="font-medium text-white text-xs">Payment Dispute</p>
                      <p className="text-[11px] text-muted-dark">UTR: {dispute.utr_number ?? 'N/A'}</p>
                      <p className="text-[11px] text-muted-dark">Amount: ₹{Number(dispute.amount).toFixed(2)}</p>
                    </div>
                    <Badge variant="amber">Unresolved</Badge>
                  </div>
                  <NeonButton size="sm" variant="emerald" fullWidth onClick={() => handleResolveDispute(dispute.id)}>
                    <CheckCircle size={12} /> Resolve & Mark Paid
                  </NeonButton>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-7">
          <h2 className="mb-3.5 flex items-center gap-2 text-base font-semibold text-white">
            <Activity size={16} className="text-sage" /> Platform Telemetry
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <TelemetryCard icon={TrendingUp} label="Total Bookings" value={bookings.length} color="cyan" />
            <TelemetryCard icon={CheckCircle} label="Completed" value={bookings.filter((b) => b.status === 'paid' || b.status === 'completed').length} color="emerald" />
            <TelemetryCard icon={Star} label="Verified Workers" value={verifiedWorkers} color="purple" />
            <TelemetryCard icon={Wallet} label="Total Payments" value={payments.length} color="pink" />
          </div>
        </div>
      </div>
    </div>
  );
}

function TelemetryCard({ icon: Icon, label, value, color }: { icon: typeof Users; label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = {
    emerald: 'text-brass bg-brass/[0.08] border-brass/15 shadow-brass',
    cyan: 'text-sage bg-sage/[0.08] border-sage/15 shadow-sage',
    purple: 'text-sage bg-sage/[0.08] border-sage/15 shadow-sage',
    pink: 'text-[#c27a6e] bg-[#c27a6e]/[0.08] border-[#c27a6e]/15 shadow-brass',
    amber: 'text-amber-400 bg-amber-500/[0.08] border-amber-500/15',
  };
  return (
    <GlassCard className="p-4">
      <div className={`mb-2.5 inline-flex rounded-xl border p-2 ${colors[color]}`}>
        <Icon size={18} />
      </div>
      <p className="text-xl font-bold text-white">{typeof value === 'number' ? <AnimatedCounter value={value} /> : value}</p>
      <p className="text-[11px] text-muted-dark mt-0.5">{label}</p>
    </GlassCard>
  );
}
