'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Search, AlertTriangle, AlertCircle, Trash2, Send, Info } from 'lucide-react';
import { mockUsers } from '@/lib/mockData';
import { useVisits } from '@/context/VisitContext';
import { useData } from '@/context/DataContext';
import { useApp } from '@/context/AppContext';
import type { VisitReport } from '@/types';

const STATUS_STYLES: Record<VisitReport['status'], string> = {
  draft: 'bg-slate-100 text-slate-600',
  submitted: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  returned: 'bg-yellow-100 text-yellow-700',
};

const FILTERS = ['all', 'draft', 'submitted', 'approved', 'returned'] as const;

// ── Permission helpers ────────────────────────────────────────────────────
function canDelete(role: string, report: VisitReport, userId: string): boolean {
  if (role === 'admin') return true;
  if (role === 'supervisor') return report.status === 'draft' || report.status === 'returned';
  if (role === 'health_worker' || role === 'data_clerk')
    return report.hewId === userId && report.status === 'draft';
  return false;
}

function canSend(role: string, report: VisitReport, userId: string): boolean {
  if (role === 'admin') return report.status === 'draft' || report.status === 'returned';
  if (role === 'data_clerk') return report.status === 'draft' || report.status === 'returned';
  if (role === 'health_worker')
    return report.hewId === userId && (report.status === 'draft' || report.status === 'returned');
  return false;
}

export default function VisitsPage() {
  const router = useRouter();
  const { visitReports, deleteVisitReport, updateVisitReport } = useVisits();
  const { households } = useData();
  const { currentUser } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<typeof FILTERS[number]>('all');
  const [confirmDelete, setConfirmDelete] = useState<VisitReport | null>(null);

  const role = currentUser?.role ?? 'viewer';
  const userId = currentUser?.id ?? '';

  const filtered = visitReports.filter(r => {
    const hh = households.find(h => h.id === r.householdId);
    const matchSearch = !search ||
      hh?.headName.toLowerCase().includes(search.toLowerCase()) ||
      hh?.registrationNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  }).sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === 'all' ? visitReports.length : visitReports.filter(r => r.status === f).length;
    return acc;
  }, {} as Record<string, number>);

  const handleSend = (e: React.MouseEvent, r: VisitReport) => {
    e.stopPropagation();
    updateVisitReport(r.id, {
      status: 'submitted',
      submittedAt: new Date().toISOString().split('T')[0],
    });
  };

  const handleDelete = (r: VisitReport) => {
    deleteVisitReport(r.id);
    setConfirmDelete(null);
  };

  // Permission legend for current role
  const permissionNote = {
    admin: 'As Admin: you can delete any report and submit any draft.',
    supervisor: 'As Supervisor: you can delete draft and returned reports.',
    health_worker: 'As Health Worker: you can delete and submit your own draft reports.',
    data_clerk: 'As Data Clerk: you can submit drafts on behalf of a HEW.',
    viewer: 'As Viewer: read-only access. No delete or submit permissions.',
  }[role] ?? '';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Visit Reports</h1>
          <p className="text-slate-500 text-sm">{visitReports.length} total visit reports</p>
        </div>
        {(role === 'health_worker' || role === 'data_clerk' || role === 'admin') && (
          <Link href="/visits/new" className="btn-primary">
            <Plus size={15} /> New Visit Report
          </Link>
        )}
      </div>

      {/* Permission info bar */}
      <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5">
        <Info size={14} className="text-blue-500 flex-shrink-0" />
        <p className="text-xs text-blue-700 font-medium">{permissionNote}</p>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setStatusFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${statusFilter === f ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'}`}>
            {f} <span className="ml-1 opacity-70">{counts[f]}</span>
          </button>
        ))}
      </div>

      <div className="section-card">
        <div className="mb-4">
          <div className="relative max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search by household name or reg. number..."
              value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-9" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {['Visit #', 'Household', 'Date', 'HEW', 'Status', 'Flags', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const hew = mockUsers.find(u => u.id === r.hewId);
                const highFlags = r.riskFlags.filter(f => f.priority === 'high');
                const mediumFlags = r.riskFlags.filter(f => f.priority === 'medium');
                const showDelete = canDelete(role, r, userId);
                const showSend = canSend(role, r, userId);

                return (
                  <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/visits/${r.id}`)}>
                    <td className="py-3 px-3 font-mono font-bold text-blue-600">#{r.visitNumber}</td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-800">{households.find(h => h.id === r.householdId)?.headName ?? r.householdId}</p>
                      <p className="text-xs text-slate-400">{households.find(h => h.id === r.householdId)?.registrationNumber}</p>
                    </td>
                    <td className="py-3 px-3 text-slate-700">{r.visitDate}</td>
                    <td className="py-3 px-3 text-slate-600 text-xs">{hew?.name ?? r.hewId}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[r.status]}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        {highFlags.length > 0 && <span className="flex items-center gap-0.5 text-xs text-red-600 font-semibold"><AlertTriangle size={12} /> {highFlags.length}</span>}
                        {mediumFlags.length > 0 && <span className="flex items-center gap-0.5 text-xs text-yellow-600 font-semibold"><AlertCircle size={12} /> {mediumFlags.length}</span>}
                        {r.riskFlags.length === 0 && <span className="text-slate-300">—</span>}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <Link href={`/visits/${r.id}`} className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 hover:bg-blue-50 rounded-lg">
                          View
                        </Link>
                        {showSend && (
                          <button onClick={e => handleSend(e, r)}
                            className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-semibold px-2 py-1 hover:bg-emerald-50 rounded-lg"
                            title="Submit to supervisor">
                            <Send size={12} /> Send
                          </button>
                        )}
                        {showDelete && (
                          <button onClick={e => { e.stopPropagation(); setConfirmDelete(r); }}
                            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-semibold px-2 py-1 hover:bg-red-50 rounded-lg"
                            title="Delete report">
                            <Trash2 size={12} /> Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm">No visit reports match your filters.</div>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-red-600" />
            </div>
            <h3 className="font-bold text-slate-800 text-center text-lg">Delete Visit Report?</h3>
            <p className="text-slate-500 text-sm text-center mt-2 mb-6">
              Visit <strong>#{confirmDelete.visitNumber}</strong> will be permanently deleted. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="btn-outline flex-1 justify-center">Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2">
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
