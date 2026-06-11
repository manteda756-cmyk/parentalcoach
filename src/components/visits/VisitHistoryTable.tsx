import React from 'react';
import { AlertTriangle, AlertCircle, Eye } from 'lucide-react';
import type { VisitReport } from '@/types';
import { mockUsers } from '@/lib/mockData';

const STATUS_STYLES: Record<VisitReport['status'], string> = {
  draft: 'bg-slate-100 text-slate-600',
  submitted: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  returned: 'bg-yellow-100 text-yellow-700',
};

interface VisitHistoryTableProps {
  reports: VisitReport[];
  onOpen: (id: string) => void;
}

export default function VisitHistoryTable({ reports, onOpen }: VisitHistoryTableProps) {
  if (!reports.length) {
    return (
      <div className="text-center py-10 text-slate-400 text-sm">
        No visit reports found for this household.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase">Visit #</th>
            <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
            <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
            <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase">HEW</th>
            <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase">Risk Flags</th>
            <th className="py-3 px-3" />
          </tr>
        </thead>
        <tbody>
          {reports.map(r => {
            const hew = mockUsers.find(u => u.id === r.hewId);
            const highFlags = r.riskFlags.filter(f => f.priority === 'high');
            const mediumFlags = r.riskFlags.filter(f => f.priority === 'medium');
            return (
              <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="py-3 px-3 font-mono font-bold text-blue-600">#{r.visitNumber}</td>
                <td className="py-3 px-3 text-slate-700">{r.visitDate}</td>
                <td className="py-3 px-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[r.status]}`}>
                    {r.status}
                  </span>
                </td>
                <td className="py-3 px-3 text-slate-600">{hew?.name ?? r.hewId}</td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1.5">
                    {highFlags.length > 0 && (
                      <span className="flex items-center gap-1 text-xs text-red-600 font-semibold">
                        <AlertTriangle size={13} /> {highFlags.length}
                      </span>
                    )}
                    {mediumFlags.length > 0 && (
                      <span className="flex items-center gap-1 text-xs text-yellow-600 font-semibold">
                        <AlertCircle size={13} /> {mediumFlags.length}
                      </span>
                    )}
                    {r.riskFlags.length === 0 && <span className="text-slate-400 text-xs">—</span>}
                  </div>
                </td>
                <td className="py-3 px-3">
                  <button
                    onClick={() => onOpen(r.id)}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                  >
                    <Eye size={13} /> View
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
