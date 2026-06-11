import React from 'react';

interface BadgeProps {
  variant?: 'high' | 'medium' | 'low' | 'pending' | 'active' | 'completed' | 'default';
  children: React.ReactNode;
  className?: string;
}

const variants = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  active: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  default: 'bg-slate-100 text-slate-700',
};

export default function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
