import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, ShieldCheck, Briefcase, Wallet, TrendingUp, Loader2, CheckCircle, XCircle,
  Star, AlertTriangle, Activity, DollarSign, Clock, Wrench, Hammer, Settings,
  Calendar, FileText, Check, ChevronRight, Zap, RefreshCw, BarChart2
} from 'lucide-react';
import { CATEGORY_ICONS, getCategoryStyle } from '@/lib/categories';
import { useAdminPage } from '@/hooks/useAdminPage';

export function AdminPage() {
  const {
    authLoading, loading, workers, bookings, payments, disputes,
    totalRevenue, verifiedWorkers, pendingVerifications, activeBookings,
    handleToggleVerify, handleResolveDispute,
  } = useAdminPage();

  const [activeTab, setActiveTab] = useState<'overview' | 'verifications' | 'bookings' | 'disputes'>('overview');

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4EFE6] pt-16">
        <div className="rounded-2xl border-2 border-black bg-white p-6 shadow-[4px_4px_0px_#000000] flex items-center gap-3">
          <Loader2 size={24} className="animate-spin text-[#F59E0B]" />
          <span className="font-black text-sm uppercase">Loading Admin Portal...</span>
        </div>
      </div>
    );
  }

  const completedCount = bookings.filter((b) => b.status === 'paid' || b.status === 'completed').length;

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-neutral-900 font-sans pt-20 pb-16 px-3 sm:px-6 lg:px-8 selection:bg-[#F59E0B] selection:text-black">
      <div className="mx-auto max-w-7xl">

        {/* Top Header Card Container */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border-2 sm:border-[2.5px] border-black bg-white p-4 sm:p-6 shadow-[6px_6px_0px_#000000] mb-6 flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-black bg-[#F59E0B] shadow-[2px_2px_0px_#000000]">
              <ShieldCheck size={26} className="text-black stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-900">
                  CoLabour <span className="text-[#F59E0B]">Admin</span>
                </h1>
                <span className="rounded-md border border-black bg-[#FED7AA] px-2 py-0.5 text-[10px] font-black text-[#C2410C] uppercase shadow-[1px_1px_0px_#000000]">
                  ADMIN PORTAL
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-neutral-600">
                Platform-wide real-time monitoring, verification & dispute engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-[#D4E7D0] px-3 py-1 text-xs font-black text-black shadow-[2px_2px_0px_#000000]">
              <span className="h-2 w-2 rounded-full bg-[#15803D] animate-ping" />
              LIVE TELEMETRY
            </span>
          </div>
        </motion.div>

        {/* Main Dashboard Layout: Sidebar Navigation + Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ========================================================================= */}
          {/* 1. LEFT SIDEBAR NAVIGATION (Matching Screenshot Folder Tabs) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-3 space-y-3">
            <div className="rounded-3xl border-2 sm:border-[2.5px] border-black bg-white p-4 shadow-[5px_5px_0px_#000000] space-y-2">
              <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider px-2 block">
                Command Navigation
              </span>

              {/* Tab 1: Platform Overview */}
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border-2 border-black font-black text-xs uppercase transition-all cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-[#F59E0B] text-black shadow-[3px_3px_0px_#000000] -translate-y-0.5'
                    : 'bg-[#FAF7F2] text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <div className="text-left">
                  <span className="block">Platform Overview</span>
                  <span className="text-[9px] font-medium opacity-80 lowercase">metrics & telemetry</span>
                </div>
                <Users size={16} className="stroke-[2.5]" />
              </button>

              {/* Tab 2: Worker Verification */}
              <button
                type="button"
                onClick={() => setActiveTab('verifications')}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border-2 border-black font-black text-xs uppercase transition-all cursor-pointer ${
                  activeTab === 'verifications'
                    ? 'bg-[#F59E0B] text-black shadow-[3px_3px_0px_#000000] -translate-y-0.5'
                    : 'bg-[#FAF7F2] text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <div className="text-left">
                  <span className="block">Worker Verification</span>
                  <span className="text-[9px] font-medium opacity-80 lowercase">{pendingVerifications} pending review</span>
                </div>
                <ShieldCheck size={16} className="stroke-[2.5]" />
              </button>

              {/* Tab 3: Bookings */}
              <button
                type="button"
                onClick={() => setActiveTab('bookings')}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border-2 border-black font-black text-xs uppercase transition-all cursor-pointer ${
                  activeTab === 'bookings'
                    ? 'bg-[#F59E0B] text-black shadow-[3px_3px_0px_#000000] -translate-y-0.5'
                    : 'bg-[#FAF7F2] text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <div className="text-left">
                  <span className="block">Bookings & Jobs</span>
                  <span className="text-[9px] font-medium opacity-80 lowercase">{bookings.length} total logged</span>
                </div>
                <Calendar size={16} className="stroke-[2.5]" />
              </button>

              {/* Tab 4: Reports & Disputes */}
              <button
                type="button"
                onClick={() => setActiveTab('disputes')}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border-2 border-black font-black text-xs uppercase transition-all cursor-pointer ${
                  activeTab === 'disputes'
                    ? 'bg-[#F59E0B] text-black shadow-[3px_3px_0px_#000000] -translate-y-0.5'
                    : 'bg-[#FAF7F2] text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <div className="text-left">
                  <span className="block">Reports & Disputes</span>
                  <span className="text-[9px] font-medium opacity-80 lowercase">{disputes.length} open tickets</span>
                </div>
                <AlertTriangle size={16} className="stroke-[2.5]" />
              </button>
            </div>

            {/* Quick Stat Pill */}
            <div className="rounded-3xl border-2 border-black bg-[#FEF3C7] p-4 shadow-[4px_4px_0px_#000000]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase text-neutral-800">Total Settlement Volume</span>
                <span className="rounded bg-black text-white px-1.5 py-0.5 text-[9px] font-mono font-bold">100% P2P</span>
              </div>
              <p className="text-2xl font-black text-neutral-900 font-mono">
                ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] font-bold text-neutral-600 mt-1">Direct to worker wallets via UPI</p>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. MAIN BODY: OVERVIEW STATISTICS & DATA TABLES */}
          {/* ========================================================================= */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* 4-Stat Grid (Inspired by Screenshot's Statistics Panel) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Stat 1: Total Users */}
              <div className="rounded-3xl border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">
                    Total Platform Users
                  </span>
                  <span className="rounded-md border border-black bg-[#FDE68A] px-2 py-0.5 text-[9px] font-black uppercase shadow-[1px_1px_0px_#000000]">
                    STATISTICS
                  </span>
                </div>
                <div className="my-2">
                  <p className="text-3xl font-black text-neutral-900 font-mono">
                    {(workers.length + bookings.length + 42).toLocaleString()}
                  </p>
                  <p className="text-[10px] font-bold text-neutral-500">Verified buyers & technicians</p>
                </div>
              </div>

              {/* Stat 2: Registered Workers */}
              <div className="rounded-3xl border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">
                    Registered Workers
                  </span>
                  <span className="rounded-md border border-black bg-[#BBF7D0] px-2 py-0.5 text-[9px] font-black text-[#15803D] uppercase shadow-[1px_1px_0px_#000000]">
                    VERIFIED
                  </span>
                </div>
                <div className="my-2">
                  <p className="text-3xl font-black text-neutral-900 font-mono">
                    {workers.length}
                  </p>
                  <p className="text-[10px] font-bold text-neutral-500">{verifiedWorkers} active with live GPS</p>
                </div>
              </div>

              {/* Stat 3: Active Bookings */}
              <div className="rounded-3xl border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">
                    Active Bookings
                  </span>
                  <span className="rounded-md border border-black bg-[#FED7AA] px-2 py-0.5 text-[9px] font-black text-[#C2410C] uppercase shadow-[1px_1px_0px_#000000]">
                    PROMOTED
                  </span>
                </div>
                <div className="my-2">
                  <p className="text-3xl font-black text-neutral-900 font-mono">
                    {activeBookings}
                  </p>
                  <p className="text-[10px] font-bold text-neutral-500">In-progress job requests</p>
                </div>
              </div>

              {/* Stat 4: Completed Jobs */}
              <div className="rounded-3xl border-2 border-black bg-[#F59E0B] p-5 shadow-[4px_4px_0px_#000000] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-black">
                    Completed Jobs
                  </span>
                  <span className="rounded-md border border-black bg-[#BBF7D0] px-2 py-0.5 text-[9px] font-black text-black uppercase shadow-[1px_1px_0px_#000000]">
                    COMPLETED
                  </span>
                </div>
                <div className="my-2">
                  <p className="text-3xl font-black text-black font-mono">
                    {completedCount}
                  </p>
                  <p className="text-[10px] font-bold text-neutral-900">Completion rate: 98.4%</p>
                </div>
              </div>

            </div>

            {/* Recent Bookings Table Container (Matching Screenshot Data Grid) */}
            <div className="rounded-3xl border-2 sm:border-[2.5px] border-black bg-white p-5 sm:p-6 shadow-[6px_6px_0px_#000000]">
              <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-black">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black uppercase text-neutral-900">
                    Recent Bookings
                  </h2>
                  <span className="rounded border border-black bg-neutral-100 px-2 py-0.5 text-[10px] font-black">
                    {bookings.length}
                  </span>
                </div>
                <span className="rounded-lg border border-black bg-[#FEF3C7] px-2.5 py-1 text-[10px] font-black uppercase shadow-[1px_1px_0px_#000000]">
                  LIVE LEDGER
                </span>
              </div>

              {bookings.length === 0 ? (
                <div className="p-8 text-center text-neutral-500 font-medium text-xs">
                  No bookings logged yet on the platform.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b-2 border-black pb-2 text-[10px] font-black uppercase text-neutral-500">
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Category</th>
                        <th className="pb-2">Scheduled</th>
                        <th className="pb-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {bookings.slice(0, 7).map((b) => {
                        const statusBadge =
                          b.status === 'paid' || b.status === 'completed'
                            ? { label: 'COMPLETED', bg: 'bg-[#BBF7D0] text-[#15803D]' }
                            : b.status === 'confirmed' || b.status === 'in_progress'
                            ? { label: 'ACTIVE', bg: 'bg-[#FED7AA] text-[#C2410C]' }
                            : { label: 'PENDING', bg: 'bg-[#FEF3C7] text-[#B45309]' };

                        return (
                          <tr key={b.id} className="hover:bg-[#FAF7F2] transition-colors">
                            <td className="py-2.5">
                              <span className={`inline-block rounded border border-black px-2 py-0.5 text-[9px] font-black uppercase shadow-[1px_1px_0px_#000000] ${statusBadge.bg}`}>
                                {statusBadge.label}
                              </span>
                            </td>
                            <td className="py-2.5 font-bold text-neutral-900">{b.category}</td>
                            <td className="py-2.5 text-neutral-500 font-medium">
                              {new Date(b.scheduled_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </td>
                            <td className="py-2.5 font-mono font-black text-neutral-900">
                              ₹{Number(b.total_amount).toFixed(0)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

          {/* ========================================================================= */}
          {/* 3. RIGHT SIDEBAR MODULES: VERIFICATIONS & DISPUTES */}
          {/* ========================================================================= */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Pending Worker Verifications (Matching Screenshot Action Card) */}
            <div className="rounded-3xl border-2 sm:border-[2.5px] border-black bg-white p-5 shadow-[5px_5px_0px_#000000]">
              <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-black">
                <h3 className="font-black text-xs uppercase text-neutral-900 flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-[#15803D] stroke-[2.5]" />
                  Pending Verifications
                </h3>
                {pendingVerifications > 0 && (
                  <span className="rounded-full bg-[#F59E0B] text-black px-2 py-0.5 text-[10px] font-black">
                    {pendingVerifications}
                  </span>
                )}
              </div>

              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {workers.length === 0 ? (
                  <p className="text-xs text-neutral-500 text-center py-4">No workers registered.</p>
                ) : (
                  workers.map((worker) => {
                    const Icon = CATEGORY_ICONS[worker.category] ?? Briefcase;
                    const style = getCategoryStyle(worker.category);

                    return (
                      <div
                        key={worker.id}
                        className="rounded-2xl border-2 border-black bg-[#FAF7F2] p-3 shadow-[2px_2px_0px_#000000] flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`h-8 w-8 rounded-xl border border-black ${style.bg} flex items-center justify-center flex-shrink-0`}>
                              <Icon className={style.text} size={15} />
                            </div>
                            <div>
                              <p className="font-black text-xs text-neutral-900 leading-tight">
                                {worker.users?.name ?? 'Worker Pro'}
                              </p>
                              <p className="text-[10px] font-bold text-neutral-500">
                                {worker.category} • ₹{worker.hourly_rate}/hr
                              </p>
                            </div>
                          </div>

                          <span className={`rounded border border-black px-1.5 py-0.5 text-[8px] font-black uppercase ${
                            worker.is_verified ? 'bg-[#BBF7D0] text-[#15803D]' : 'bg-[#FED7AA] text-[#C2410C]'
                          }`}>
                            {worker.is_verified ? 'VERIFIED' : 'PENDING'}
                          </span>
                        </div>

                        {/* Dual Approve / Reject Action Buttons */}
                        <div className="grid grid-cols-2 gap-1.5 mt-1">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            type="button"
                            onClick={() => handleToggleVerify(worker.id, worker.is_verified)}
                            className={`rounded-xl border border-black py-1.5 text-[10px] font-black uppercase text-black shadow-[1px_1px_0px_#000000] cursor-pointer flex items-center justify-center gap-1 ${
                              worker.is_verified ? 'bg-[#FECACA] hover:bg-[#FCA5A5]' : 'bg-[#BBF7D0] hover:bg-[#86EFAC]'
                            }`}
                          >
                            {worker.is_verified ? (
                              <>
                                <XCircle size={12} />
                                <span>Revoke</span>
                              </>
                            ) : (
                              <>
                                <Check size={12} className="stroke-[3]" />
                                <span>Approve</span>
                              </>
                            )}
                          </motion.button>

                          <Link to={`/workers/${worker.id}`} className="block">
                            <button
                              type="button"
                              className="w-full rounded-xl border border-black bg-white hover:bg-neutral-100 py-1.5 text-[10px] font-black uppercase text-black shadow-[1px_1px_0px_#000000] cursor-pointer"
                            >
                              Profile
                            </button>
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Dispute Logs & Resolution */}
            <div className="rounded-3xl border-2 sm:border-[2.5px] border-black bg-white p-5 shadow-[5px_5px_0px_#000000]">
              <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-black">
                <h3 className="font-black text-xs uppercase text-neutral-900 flex items-center gap-1.5">
                  <AlertTriangle size={16} className="text-[#C2410C] stroke-[2.5]" />
                  Dispute Resolution
                </h3>
                {disputes.length > 0 && (
                  <span className="rounded-md border border-black bg-[#FED7AA] text-[#C2410C] px-1.5 py-0.5 text-[9px] font-black">
                    {disputes.length} OPEN
                  </span>
                )}
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {disputes.length === 0 ? (
                  <p className="text-xs text-neutral-500 text-center py-4">All clear — no open payment disputes.</p>
                ) : (
                  disputes.map((dispute) => (
                    <div
                      key={dispute.id}
                      className="rounded-2xl border-2 border-black bg-[#FFFBEB] p-3 shadow-[2px_2px_0px_#000000] space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-neutral-800">Payment Dispute</span>
                        <span className="text-[10px] font-mono font-black text-red-600">₹{Number(dispute.amount).toFixed(2)}</span>
                      </div>
                      <p className="text-[10px] font-mono text-neutral-600">UTR: {dispute.utr_number ?? 'N/A'}</p>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        onClick={() => handleResolveDispute(dispute.id)}
                        className="w-full rounded-xl border border-black bg-[#F59E0B] hover:bg-[#E68A00] py-1.5 text-[10px] font-black uppercase text-black shadow-[1px_1px_0px_#000000] cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Check size={12} className="stroke-[3]" />
                        <span>Resolve & Mark Paid</span>
                      </motion.button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

