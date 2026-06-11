import React from 'react';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import type { RiskFlag } from '@/types';

const LABELS: Record<RiskFlag['type'], string> = {
  sam:                  'Severe Acute Malnutrition (SAM) detected',
  mam:                  'Moderate Acute Malnutrition (MAM) detected',
  depression:           'Signs of maternal depression recorded',
  violence:             'Signs of violence against mother recorded',
  child_violence:       'Signs of abuse or violence against child recorded',
  developmental_delay:  'Developmental delay identified in child',
};

interface Props { flags: RiskFlag[]; className?: string; }

export default function RiskFlagAlert({ flags, className = '' }: Props) {
  if (flags.length === 0) return null;
  const high   = flags.filter(f => f.priority === 'high');
  const medium = flags.filter(f => f.priority === 'medium');

  return (
    <div className={`space-y-3 ${className}`}>
      {high.length > 0 && (
        <div className="rounded-xl p-4"
          style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.25)',
          }}>
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(239,68,68,0.15)' }}>
              <AlertTriangle size={13} style={{ color: '#f87171' }} />
            </div>
            <p className="font-bold text-sm" style={{ color: '#f87171' }}>High Priority Alerts</p>
          </div>
          <ul className="space-y-1.5">
            {high.map((f, i) => (
              <li key={i} className="text-sm flex items-start gap-2" style={{ color: '#fca5a5' }}>
                <span className="mt-0.5 flex-shrink-0 text-xs">•</span>
                {LABELS[f.type]}
              </li>
            ))}
          </ul>
        </div>
      )}
      {medium.length > 0 && (
        <div className="rounded-xl p-4"
          style={{
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.25)',
          }}>
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(245,158,11,0.15)' }}>
              <AlertCircle size={13} style={{ color: '#fbbf24' }} />
            </div>
            <p className="font-bold text-sm" style={{ color: '#fbbf24' }}>Medium Priority Alerts</p>
          </div>
          <ul className="space-y-1.5">
            {medium.map((f, i) => (
              <li key={i} className="text-sm flex items-start gap-2" style={{ color: '#fde68a' }}>
                <span className="mt-0.5 flex-shrink-0 text-xs">•</span>
                {LABELS[f.type]}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
