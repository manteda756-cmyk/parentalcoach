'use client';
import React from 'react';

interface ChartData { name: string; value: number; color?: string; }

// ── Bar Chart ──────────────────────────────────────────────────────────────
export function BarChart({ data, height = 200, color = '#6366f1' }: { data: ChartData[]; height?: number; color?: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-2 w-full" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
          <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity font-semibold"
            style={{ color: '#8b949e' }}>{d.value}</span>
          <div
            className="w-full rounded-t-lg transition-all duration-500 relative overflow-hidden"
            style={{ height: `${(d.value / max) * (height - 40)}px`, backgroundColor: d.color ?? color, opacity: 0.85 }}
          >
            <div className="absolute inset-0 rounded-t-lg opacity-40"
              style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%)' }} />
          </div>
          <span className="text-xs font-medium truncate w-full text-center" style={{ color: '#6b7280' }}>{d.name}</span>
        </div>
      ))}
    </div>
  );
}

// ── Donut / Pie Chart ──────────────────────────────────────────────────────
export function DonutChart({ data, size = 160 }: { data: ChartData[]; size?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = 45; const cx = 60; const cy = 60;
  let startAngle = -90;

  const slices = data.map(d => {
    const angle = (d.value / total) * 360;
    const start = startAngle;
    startAngle += angle;
    const startRad = (start * Math.PI) / 180;
    const endRad = ((start + angle) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad); const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);   const y2 = cy + r * Math.sin(endRad);
    const large = angle > 180 ? 1 : 0;
    return { ...d, path: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z` };
  });

  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} viewBox="0 0 120 120">
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color ?? '#6366f1'} className="hover:opacity-80 transition-opacity cursor-pointer">
            <title>{s.name}: {s.value}%</title>
          </path>
        ))}
        {/* Inner circle — dark background */}
        <circle cx={cx} cy={cy} r={28} fill="#1c2128" />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#e6edf3">{total}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="7" fill="#6b7280">Total</text>
      </svg>
      <div className="flex flex-col gap-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color ?? '#6366f1' }} />
            <span className="text-xs" style={{ color: '#8b949e' }}>{d.name}</span>
            <span className="text-xs font-bold ml-auto pl-4" style={{ color: '#e6edf3' }}>{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Line Chart ─────────────────────────────────────────────────────────────
export function LineChart({ data, height = 200, lines }: {
  data: Record<string, unknown>[];
  height?: number;
  lines: { key: string; color: string; label: string }[];
}) {
  const w = 400; const h = height; const pad = 40;
  const chartW = w - pad * 2; const chartH = h - pad * 2;

  const allValues = lines.flatMap(l => data.map(d => Number(d[l.key]) || 0));
  const maxVal = Math.max(...allValues, 1);

  const getX = (i: number) => pad + (i / (data.length - 1)) * chartW;
  const getY = (v: number) => h - pad - (v / maxVal) * chartH;

  return (
    <div className="w-full overflow-x-auto">
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
          <line key={i} x1={pad} y1={pad + t * chartH} x2={w - pad} y2={pad + t * chartH}
            stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        ))}

        {/* Area fills */}
        {lines.map(line => {
          const pts = data.map((d, i) => `${getX(i)},${getY(Number(d[line.key]) || 0)}`);
          const areaPath = `M ${getX(0)},${h - pad} L ${pts.join(' L ')} L ${getX(data.length - 1)},${h - pad} Z`;
          return (
            <path key={`area-${line.key}`} d={areaPath} fill={line.color} opacity="0.08" />
          );
        })}

        {/* Lines */}
        {lines.map(line => {
          const pts = data.map((d, i) => `${getX(i)},${getY(Number(d[line.key]) || 0)}`).join(' ');
          return (
            <g key={line.key}>
              <polyline fill="none" stroke={line.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={pts} />
              {data.map((d, i) => (
                <circle key={i} cx={getX(i)} cy={getY(Number(d[line.key]) || 0)} r="3.5" fill={line.color}
                  stroke="#1c2128" strokeWidth="2">
                  <title>{line.label}: {String(d[line.key])}</title>
                </circle>
              ))}
            </g>
          );
        })}

        {/* X labels */}
        {data.map((d, i) => (
          <text key={i} x={getX(i)} y={h - 8} textAnchor="middle" fontSize="9" fill="#6b7280">{String(d.name)}</text>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex gap-5 mt-3 flex-wrap">
        {lines.map(l => (
          <div key={l.key} className="flex items-center gap-2">
            <div className="w-4 h-0.5 rounded" style={{ backgroundColor: l.color }} />
            <span className="text-xs" style={{ color: '#8b949e' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Horizontal Bar Chart ───────────────────────────────────────────────────
export function HorizontalBarChart({ data, color = '#6366f1' }: { data: ChartData[]; color?: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="space-y-3">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs w-20 text-right flex-shrink-0" style={{ color: '#8b949e' }}>{d.name}</span>
          <div className="flex-1 rounded-full h-2 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(d.value / max) * 100}%`, backgroundColor: d.color ?? color }}
            />
          </div>
          <span className="text-xs font-bold w-10" style={{ color: '#e6edf3' }}>{d.value}%</span>
        </div>
      ))}
    </div>
  );
}
