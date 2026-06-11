import React from 'react';

interface KPICardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  gradient: string;
  trend?: { value: number; positive: boolean };
  onClick?: () => void;
}

export default function KPICard({ title, value, subtitle, icon, gradient, trend, onClick }: KPICardProps) {
  return (
    <div
      className="kpi-card cursor-pointer group relative overflow-hidden"
      onClick={onClick}
      style={{ '--glow': gradient } as React.CSSProperties}
    >
      {/* Corner glow */}
      <div
        className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-15 blur-2xl transition-opacity duration-300 group-hover:opacity-30"
        style={{ background: gradient }}
      />

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px opacity-40"
        style={{ background: gradient }}
      />

      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2.5" style={{ color: '#6b7280', fontSize: '0.67rem' }}>
            {title}
          </p>
          <p className="text-3xl font-black leading-none" style={{ color: '#e6edf3', letterSpacing: '-0.04em' }}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && <p className="text-xs mt-1.5" style={{ color: '#6b7280' }}>{subtitle}</p>}
          {trend && (
            <div className={`flex items-center gap-1 mt-2.5 text-xs font-bold`}
              style={{ color: trend.positive ? '#34d399' : '#f87171' }}>
              <span className={`inline-flex items-center justify-center w-4 h-4 rounded text-xs font-black`}
                style={{ background: trend.positive ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)' }}>
                {trend.positive ? '↑' : '↓'}
              </span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="font-normal" style={{ color: '#6b7280' }}>vs last month</span>
            </div>
          )}
        </div>

        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white"
          style={{
            background: gradient,
            boxShadow: `0 4px 16px rgba(0,0,0,0.3)`,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
