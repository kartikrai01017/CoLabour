import React from 'react';
import {
  Zap,
  Wrench,
  Hammer,
  Paintbrush,
  Sparkles,
  Car,
  Trees,
  HeartHandshake,
  Cpu
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export interface TradeCategoryItem {
  id: string;
  name: string;
  count: number;
  icon: React.ElementType;
  gradient: string;
  avgPay: string;
  i18nKey: string;
}

export const CATEGORY_DATA: TradeCategoryItem[] = [
  { id: 'Electrician', name: 'Electrician', count: 8, icon: Zap, gradient: 'from-amber-400 to-orange-500', avgPay: '₹450/hr', i18nKey: 'electrician' },
  { id: 'Plumber', name: 'Plumber', count: 6, icon: Wrench, gradient: 'from-sky-400 to-blue-600', avgPay: '₹400/hr', i18nKey: 'plumber' },
  { id: 'Carpenter', name: 'Carpenter', count: 4, icon: Hammer, gradient: 'from-amber-600 to-amber-800', avgPay: '₹500/hr', i18nKey: 'carpenter' },
  { id: 'Painter', name: 'Painter', count: 5, icon: Paintbrush, gradient: 'from-rose-400 to-red-600', avgPay: '₹380/hr', i18nKey: 'painter' },
  { id: 'Cleaner', name: 'Cleaner', count: 9, icon: Sparkles, gradient: 'from-emerald-400 to-teal-600', avgPay: '₹350/hr', i18nKey: 'cleaner' },
  { id: 'Driver', name: 'Driver', count: 3, icon: Car, gradient: 'from-indigo-400 to-blue-700', avgPay: '₹420/hr', i18nKey: 'driver' },
  { id: 'Gardener', name: 'Gardener', count: 2, icon: Trees, gradient: 'from-green-500 to-emerald-700', avgPay: '₹320/hr', i18nKey: 'gardener' },
  { id: 'Caregiver', name: 'Caregiver', count: 4, icon: HeartHandshake, gradient: 'from-pink-400 to-rose-600', avgPay: '₹550/hr', i18nKey: 'caregiver' },
  { id: 'Technician', name: 'Technician', count: 7, icon: Cpu, gradient: 'from-cyan-400 to-teal-600', avgPay: '₹600/hr', i18nKey: 'technician' },
];

export const TRADE_CATEGORIES = CATEGORY_DATA;

interface TradeCategoryGridProps {
  onSelectCategory: (category: TradeCategoryItem) => void;
  selectedCategory?: string | null;
}

export function TradeCategoryGrid({ onSelectCategory, selectedCategory }: TradeCategoryGridProps) {
  const { t } = useLanguage();

  return (
    <div className="rounded-3xl bg-white border-2 border-stone-900 p-5 shadow-[4px_4px_0px_0px_#1c1917]">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-stone-900">
            {t('tradeCategoryDispatches', 'Trade Category Dispatches')}
          </h3>
          <p className="text-[11px] text-stone-600 font-bold">
            {t('tradeSubtitle', 'Browse all 9 active service verticals in your radius')}
          </p>
        </div>
        <span className="px-3 py-1 rounded-xl bg-teal-300 border-2 border-stone-900 text-stone-900 text-[10px] font-black shadow-[2px_2px_0px_0px_#1c1917]">
          {t('activeTrades', '9 Active Trades')}
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-9 gap-2.5">
        {CATEGORY_DATA.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.name;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat)}
              className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border-2 border-stone-900 transition-all duration-200 cursor-pointer group text-center ${
                isSelected
                  ? 'bg-teal-300 shadow-[3px_3px_0px_0px_#1c1917] -translate-y-0.5'
                  : 'bg-[#FAF9F5] hover:bg-stone-100 shadow-[2px_2px_0px_0px_#1c1917] hover:translate-x-[1px] hover:translate-y-[1px]'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl bg-gradient-to-br ${cat.gradient} text-white flex items-center justify-center border-2 border-stone-900 shadow-[1px_1px_0px_0px_#1c1917] group-hover:scale-105 transition-transform`}
              >
                <Icon size={18} strokeWidth={2.5} />
              </div>
              <span className="mt-2 text-[11px] font-black text-stone-900 truncate w-full block">
                {t(cat.i18nKey, cat.name)}
              </span>
              <span className="text-[10px] font-black text-emerald-800">
                {cat.count} jobs
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
