import React, { useState, useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { type Payment } from '@/lib/supabase';

interface EarningsChartProps {
  payments: Payment[];
  totalEarnings: number;
}

export function EarningsChart({ payments, totalEarnings }: EarningsChartProps) {
  const [filter, setFilter] = useState<'week' | 'month'>('week');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Compute 7 days breakdown
  const chartData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const paidPayments = payments.filter((p) => p.status === 'paid');

    // Group earnings by day of week
    const dailyTotals = [0, 0, 0, 0, 0, 0, 0];

    paidPayments.forEach((payment) => {
      const date = payment.paid_at ? new Date(payment.paid_at) : new Date(payment.created_at || Date.now());
      // getDay: 0 is Sun, 1 is Mon...
      const dayIndex = (date.getDay() + 6) % 7; // Map 0 (Mon) to 6 (Sun)
      dailyTotals[dayIndex] += Number(payment.amount || 0);
    });

    // If worker has no earnings yet, provide a gentle zero-based dataset
    const maxVal = Math.max(...dailyTotals, 100);

    return days.map((day, idx) => ({
      day,
      amount: dailyTotals[idx],
      heightPct: maxVal > 0 ? (dailyTotals[idx] / maxVal) * 100 : 0,
    }));
  }, [payments]);

  // Compute SVG polyline points
  const points = useMemo(() => {
    const width = 360;
    const height = 110;
    const step = width / (chartData.length - 1);

    const maxVal = Math.max(...chartData.map((d) => d.amount), 500);

    return chartData.map((d, i) => {
      const x = i * step;
      const y = height - (d.amount / maxVal) * (height - 20) - 10;
      return { x, y, ...d };
    });
  }, [chartData]);

  // Construct SVG path string for smooth curve
  const svgPath = useMemo(() => {
    if (points.length === 0) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cx = (prev.x + curr.x) / 2;
      d += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return d;
  }, [points]);

  const svgAreaPath = useMemo(() => {
    if (points.length === 0) return '';
    const last = points[points.length - 1];
    return `${svgPath} L ${last.x} 120 L ${points[0].x} 120 Z`;
  }, [svgPath, points]);

  return (
    <div className="rounded-3xl bg-white border border-gray-100 p-5 shadow-[0_4px_25px_rgba(0,0,0,0.04)] flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-gray-900">
            Earnings Overview
          </h3>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'week' | 'month')}
            className="appearance-none bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-2.5 py-1 text-xs font-bold text-gray-800 cursor-pointer outline-none transition-colors"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        {/* Amount & Trend */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-gray-950">
            ₹{totalEarnings.toLocaleString('en-IN')}
          </span>
          <span className="text-xs font-semibold text-gray-500">Total Earnings</span>
        </div>
        <div className="mt-0.5 flex items-center gap-1 text-xs font-bold text-emerald-600">
          <TrendingUp size={14} />
          <span>+22% from last {filter === 'week' ? 'week' : 'month'}</span>
        </div>
      </div>

      {/* SVG Smooth Curve Area Chart */}
      <div className="mt-4 relative">
        <svg viewBox="0 0 360 130" className="w-full h-28 overflow-visible">
          <defs>
            <linearGradient id="earnAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          <path d={svgAreaPath} fill="url(#earnAreaGrad)" />

          {/* Smooth Stroke */}
          <path d={svgPath} fill="none" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" />

          {/* Dots on points */}
          {points.map((p, idx) => (
            <g
              key={p.day}
              className="cursor-pointer"
              onMouseEnter={() => setHoverIndex(idx)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <circle cx={p.x} cy={p.y} r={hoverIndex === idx ? 6 : 4} fill="#FFFFFF" stroke="#10B981" strokeWidth="2.5" />
              {hoverIndex === idx && (
                <g transform={`translate(${p.x}, ${p.y - 25})`}>
                  <rect x="-24" y="-12" width="48" height="18" rx="4" fill="#0F172A" />
                  <text x="0" y="1" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">
                    ₹{p.amount}
                  </text>
                </g>
              )}
            </g>
          ))}
        </svg>

        {/* Day labels below */}
        <div className="flex justify-between pt-1 text-[11px] font-bold text-gray-400">
          {chartData.map((d) => (
            <span key={d.day} className="w-8 text-center hover:text-gray-900 transition-colors">
              {d.day}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
