'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardCheck, AlertTriangle, AlertCircle, Search, Eye } from 'lucide-react';
import { mockHouseholds, mockUsers } from '@/lib/mockData';
import { useVisits } from '@/context/VisitContext';
import { useApp } from '@/context/AppContext';
import Badge from '@/components/ui/Badge';
import Link from 'next/link';

export default function SupervisorQueuePage() {
  const { currentUser } = useApp();
  const { visitReports } = useVisits();
  const router = useRouter();
  const [search, setSearch] = useState('');

  const submitted = visitReports
    .filter(r => r.status === 'submitted')
    .sort((a, b) => new Date(a.submittedAt ?? a.createdAt).getTime() - new Date(b.submittedAt ?? b.createdAt).getTime());

  const filtered = submitted.filter(r => {
    const hh = mockHouseholds.find(h => h.id === r.householdId);
    const hew = mockUsers.find(u => u.id === r.hewId);
    return !search ||
      hh?.headName.toLowerCase().includes(search.toLowerCase()) ||
      hew?.name.toLowerCase().includes(search.toLowerCase());
  });

  const allReports = visitReports;
  const stats = {
    pending: allReports.filter(r => r.status === 'submitted').length,
    approved: allReports.filter(r => r.status === 'approved').length,
    returned: allReports.filter(r => r.status === 'returned').length,
    highRisk: allReports.filter(r => r.riskFlags.some(f => f.priority === 'high')).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Supervisor Review Queue</h1>
          <p className="text-slate-500 text-sm">
            Reviewing as <strong>{currentUser?.name}</strong> — {stats.pending} report{stats.pending !== 1 ? 's' : ''} pending review
          </p>
        </div>
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
          <ClipboardCheck size={20} className="text-white" />
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Pending Review', value: stats.pending, color: 'bg-blue-50 border-blue-200 text-blue-700' },
          { label: 'Approved', value: stats.approved, color: 'bg-green-50 border-green-200 text-green-700' },
          { label: 'Returned', value: stats.returned, color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
          { label: 'High Risk Flags', value: stats.highRisk, color: 'bg-red-50 border-red-200 text-red-700' },
        ].map(s => (
          <div key={s.label} className={`section-card border ${s.color} text-center py-4`}>
            <p className="text-3xl font-bold">{s.value}</p>
            <p className="text-xs font-semibold mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pending queue */}
      <div className="section-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-800">Pending Reports</h2>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-8 py-2 text-xs w-52" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardCheck size={36} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 font-semibold">No reports pending review</p>
            <p className="text-slate-300 text-sm mt-1">All visit reports are up to date</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(r => {
              const hh = mockHouseholds.find(h => h.id === r.householdId);
              const hew = mockUsers.find(u => u.id === r.hewId);
              const highFlags = r.riskFlags.filter(f => f.priority === 'high');
              const medFlags = r.riskFlags.filter(f => f.priority === 'medium');

              return (
                <div
                  key={r.id}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-sm ${highFlags.length > 0 ? 'border-red-200 bg-red-50/30 hover:border-red-300' : 'border-slate-100 hover:border-blue-200'}`}
                  onClick={() => router.push(`/visits/${r.id}`)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-slate-800">{hh?.headName ?? r.householdId}</p>
                        <span className="text-xs font-mono text-slate-400">{hh?.registrationNumber}</span>
                        {highFlags.length > 0 && (
                          <span className="flex items-center gap-1 bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                            <AlertTriangle size={10} /> {highFlags.length} HIGH
                          </span>
                        )}
                        {medFlags.length > 0 && (
                          <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">
                            <AlertCircle size={10} /> {medFlags.length} MED
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>Visit #{r.visitNumber}</span>
                        <span>{r.visitDate}</span>
                        <span>HEW: {hew?.name}</span>
                        {r.submittedAt && <span>Submitted: {r.submittedAt}</span>}
                      </div>
                      {r.riskFlags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {r.riskFlags.map((f, i) => (
                            <span key={i} className={`text-xs px-2 py-0.5 rounded-full font-semibold ${f.priority === 'high' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                              {f.type.replace(/_/g,' ')}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <Link
                      href={`/visits/${r.id}`}
                      onClick={e => e.stopPropagation()}
                      className="btn-primary py-2 px-3 text-xs flex-shrink-0"
                    >
                      <Eye size={13} /> Review
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* All reports history */}
      <div className="section-card">
        <h2 className="font-bold text-slate-800 mb-4">All Reports</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {['#', 'Household', 'Date', 'HEW', 'Status', 'Flags', ''].map(h => (
                  <th key={h} className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allReports.sort((a,b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()).map(r => {
                const hh = mockHouseholds.find(h => h.id === r.householdId);
                const hew = mockUsers.find(u => u.id === r.hewId);
                return (
                  <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer" onClick={() => router.push(`/visits/${r.id}`)}>
                    <td className="py-3 px-3 font-mono text-blue-600 font-bold">#{r.visitNumber}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{hh?.headName}</td>
                    <td className="py-3 px-3 text-slate-600">{r.visitDate}</td>
                    <td className="py-3 px-3 text-slate-500 text-xs">{hew?.name}</td>
                    <td className="py-3 px-3">
                      <Badge variant={r.status === 'approved' ? 'completed' : r.status === 'submitted' ? 'active' : r.status === 'returned' ? 'medium' : 'default'}>
                        {r.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3">
                      {r.riskFlags.some(f => f.priority === 'high') && <AlertTriangle size={14} className="text-red-500" />}
                      {!r.riskFlags.length && <span className="text-slate-300">—</span>}
                    </td>
                    <td className="py-3 px-3">
                      <Link href={`/visits/${r.id}`} onClick={e => e.stopPropagation()} className="text-xs text-blue-600 font-semibold hover:underline">View</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
