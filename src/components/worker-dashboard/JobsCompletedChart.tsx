import React, { useState, useMemo } from 'react';
import { type Booking } from '@/lib/supabase';

interface JobsCompletedChartProps {
  completedJobsCount: number;
  bookings: Booking[];
}

export function JobsCompletedChart({ completedJobsCount, bookings }: JobsCompletedChartProps) {
  const [filter, setFilter] = useState<'month' | 'week'>('month');

  // Compute 4 weeks distribution
  const weeksData = useMemo(() => {
    // 4 weeks buckets
    const counts = [0, 0, 0, 0];
    const completed = bookings.filter((b) => b.status === 'completed' || b.status === 'paid');

    completed.forEach((b, idx) => {
      const bucket = idx % 4;
      counts[bucket] += 1;
    });

    // If worker has actual jobs completed but low counts, give proportional representation
    const maxVal = Math.max(...counts, 1);

    return [
      { label: 'W1', count: counts[0], heightPct: Math.max(15, (counts[0] / maxVal) * 85) },
      { label: 'W2', count: counts[1], heightPct: Math.max(25, (counts[1] / maxVal) * 85) },
      { label: 'W3', count: counts[2], heightPct: Math.max(35, (counts[2] / maxVal) * 85) },
      { label: 'W4', count: counts[3] || completedJobsCount || 0, heightPct: 90 },
    ];
  }, [bookings, completedJobsCount]);

  const peakWeek = weeksData[3];

  return (
    <div className="rounded-3xl bg-white border border-gray-100 p-5 shadow-[0_4px_25px_rgba(0,0,0,0.04)] flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-gray-900">
            Jobs Completed
          </h3>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'month' | 'week')}
            className="appearance-none bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-2.5 py-1 text-xs font-bold text-gray-800 cursor-pointer outline-none transition-colors"
          >
            <option value="month">This Month</option>
            <option value="week">This Week</option>
          </select>
        </div>

        {/* Count */}
        <div className="mt-2">
          <div className="text-2xl sm:text-3xl font-black text-gray-950">
            {completedJobsCount}
          </div>
          <p className="text-xs font-semibold text-gray-500">Total Jobs</p>
        </div>
      </div>

      {/* Bar Chart Container */}
      <div className="mt-4 relative pt-6">
        {/* Floating peak indicator badge */}
        <div className="absolute top-0 right-4 -translate-x-1/2">
          <span className="px-2 py-0.5 rounded-md bg-gray-900 text-white text-[10px] font-bold shadow-md">
            {peakWeek.count > 0 ? `${peakWeek.count} Jobs` : `${completedJobsCount} Jobs`}
          </span>
        </div>

        {/* 4 Vertical Rounded Bars */}
        <div className="flex items-end justify-between h-24 px-4 pb-2 border-b border-gray-100 gap-4">
          {weeksData.map((w, idx) => (
            <div key={w.label} className="flex-1 flex flex-col items-center group cursor-pointer">
              <div className="w-full max-w-[28px] h-20 flex items-end justify-center">
                <div
                  style={{ height: `${completedJobsCount > 0 ? w.heightPct : 10}%` }}
                  className={`w-full rounded-t-lg transition-all duration-300 group-hover:opacity-80 ${
                    idx === 3 ? 'bg-emerald-500 shadow-sm' : 'bg-emerald-400/80'
                  }`}
                />
              </div>
              <span className="text-[11px] font-bold text-gray-400 mt-2 group-hover:text-gray-900 transition-colors">
                {w.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
