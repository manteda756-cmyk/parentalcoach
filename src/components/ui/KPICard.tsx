import React from 'react';

interface KPICardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  trend?: { value: number; positive: boolean };
  onClick?: () => void;
}

export default function KPICard({ title, value, subtitle, icon, color, bgColor, trend, onClick }: KPICardProps) {
  return (
    <div
      className={`kpi-card cursor-pointer group ${onClick ? 'hover:scale-[1.02] transition-transform' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-800">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${trend.positive ? 'text-emerald-600' : 'text-red-500'}`}>
              <span>{trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
              <span className="text-slate-400 font-normal">vs last month</span>
            </div>
          )}
        </div>
        <div className={`${bgColor} p-3 rounded-2xl`}>
          <div className={`${color} w-7 h-7 flex items-center justify-center`}>{icon}</div>
        </div>
      </div>
    </div>
  );
}
