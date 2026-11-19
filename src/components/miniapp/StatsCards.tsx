import React from 'react';
import { Layers, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';
import { MiniAppAdmin } from '@/types/miniapp';

interface StatsCardsProps {
  apps: MiniAppAdmin[];
  onFilterChange: (status: string) => void;
  activeFilter: string;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ apps, onFilterChange, activeFilter }) => {
  const total = apps.length;
  const active = apps.filter((a) => a.status === 'Active').length;
  const pending = apps.filter((a) => a.status === 'PendingReview').length;
  const suspended = apps.filter((a) => a.status === 'Suspended').length;

  const stats = [
    {
      id: 'All',
      label: 'Total Mini-Apps',
      count: total,
      subtext: 'Registered partner apps',
      icon: Layers,
      color: 'text-slate-700',
      bgColor: 'bg-slate-100',
      activeBorder: 'border-slate-800 shadow-sm',
    },
    {
      id: 'Active',
      label: 'Live in Super App',
      count: active,
      subtext: 'Active customer checkout',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      activeBorder: 'border-emerald-600 shadow-sm',
    },
    {
      id: 'PendingReview',
      label: 'Pending Go-Live',
      count: pending,
      subtext: pending > 0 ? 'Requires compliance review' : 'No pending reviews',
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      badge: pending > 0 ? `${pending} Pending` : undefined,
      activeBorder: 'border-amber-500 shadow-sm',
    },
    {
      id: 'Suspended',
      label: 'Suspended (Kill-Switch)',
      count: suspended,
      subtext: 'Access restricted',
      icon: ShieldAlert,
      color: 'text-[var(--red)]',
      bgColor: 'bg-[var(--red-pale)]',
      activeBorder: 'border-[var(--red)] shadow-sm',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const isSelected = activeFilter === stat.id;
        return (
          <button
            key={stat.id}
            type="button"
            onClick={() => onFilterChange(stat.id)}
            className={`text-left p-5 rounded-2xl border bg-white transition-all cursor-pointer ${
              isSelected
                ? `${stat.activeBorder} ring-2 ring-[var(--red)]/20`
                : 'border-[var(--border)] hover:border-[var(--border-strong)] hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-3)]">
                {stat.label}
              </span>
              <div className={`p-2 rounded-xl ${stat.bgColor}`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-extrabold text-[var(--text)] font-[var(--font-display)] tracking-tight">
                {stat.count}
              </div>
              {stat.badge && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                  {stat.badge}
                </span>
              )}
            </div>

            <p className="mt-2 text-[12px] text-[var(--text-2)] font-medium">{stat.subtext}</p>
          </button>
        );
      })}
    </div>
  );
};
