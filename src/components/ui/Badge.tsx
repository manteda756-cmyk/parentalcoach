import React from 'react';

interface BadgeProps {
  variant?: 'high' | 'medium' | 'low' | 'pending' | 'active' | 'completed' | 'default';
  children: React.ReactNode;
  className?: string;
}

const styles: Record<string, React.CSSProperties> = {
  high:      { background: 'rgba(239,68,68,0.12)',   color: '#f87171', border: '1px solid rgba(239,68,68,0.25)',     boxShadow: '0 0 8px rgba(239,68,68,0.08)' },
  medium:    { background: 'rgba(245,158,11,0.12)',  color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)',    boxShadow: '0 0 8px rgba(245,158,11,0.08)' },
  low:       { background: 'rgba(52,211,153,0.12)',  color: '#34d399', border: '1px solid rgba(52,211,153,0.25)',    boxShadow: '0 0 8px rgba(52,211,153,0.08)' },
  pending:   { background: 'rgba(245,158,11,0.12)',  color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)' },
  active:    { background: 'rgba(99,102,241,0.12)',  color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)' },
  completed: { background: 'rgba(52,211,153,0.12)',  color: '#34d399', border: '1px solid rgba(52,211,153,0.25)' },
  default:   { background: 'rgba(255,255,255,0.06)', color: '#8b949e', border: '1px solid rgba(255,255,255,0.1)' },
};

export default function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg ${className}`}
      style={styles[variant]}
    >
      {children}
    </span>
  );
}
