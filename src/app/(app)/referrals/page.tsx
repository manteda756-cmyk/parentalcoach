'use client';
import React, { useState } from 'react';
import { mockReferrals } from '@/lib/mockData';
import type { Referral } from '@/types';
import Badge from '@/components/ui/Badge';
import Table from '@/components/ui/Table';
import Modal from '@/components/ui/Modal';
import { Plus, ArrowRightLeft, Search, Download, Save, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function ReferralsPage() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selected, setSelected] = useState<Referral | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ patientName: '', reason: '', referredTo: '', followUpDate: '' });

  const filtered = mockReferrals.filter(r => {
    const ms = r.patientName.toLowerCase().includes(search.toLowerCase()) || r.reason.toLowerCase().includes(search.toLowerCase());
    const mst = filterStatus === 'all' || r.status === filterStatus;
    return ms && mst;
  });

  const columns = [
    { key: 'patientName', header: 'Patient', render: (r: Referral) => (
      <div>
        <p className="font-semibold text-slate-800">{r.patientName}</p>
        <p className="text-xs text-slate-400 capitalize">{r.patientType}</p>
      </div>
    )},
    { key: 'referralDate', header: 'Date', render: (r: Referral) => <span className="text-sm text-slate-600">{r.referralDate}</span> },
    { key: 'reason', header: 'Reason', render: (r: Referral) => <span className="text-sm text-slate-600 truncate max-w-[220px] block">{r.reason}</span> },
    { key: 'referredTo', header: 'Referred To', render: (r: Referral) => <span className="text-sm font-medium text-slate-700">{r.referredTo}</span> },
    { key: 'status', header: 'Status', render: (r: Referral) => (
      <Badge variant={r.status === 'completed' ? 'completed' : r.status === 'in_progress' ? 'active' : 'pending'}>
        {r.status.replace('_', ' ')}
      </Badge>
    )},
    { key: 'followUpDate', header: 'Follow-up', render: (r: Referral) => <span className="text-xs text-slate-400">{r.followUpDate ?? '—'}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Referral Management</h1>
          <p className="text-slate-500 text-sm">{mockReferrals.length} total referrals</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline"><Download size={15} /> Export</button>
          <button onClick={() => setShowNew(true)} className="btn-primary"><Plus size={15} /> New Referral</button>
        </div>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending', status: 'pending', count: mockReferrals.filter(r => r.status === 'pending').length, color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
          { label: 'In Progress', status: 'in_progress', count: mockReferrals.filter(r => r.status === 'in_progress').length, color: 'bg-blue-50 border-blue-200 text-blue-700' },
          { label: 'Completed', status: 'completed', count: mockReferrals.filter(r => r.status === 'completed').length, color: 'bg-green-50 border-green-200 text-green-700' },
        ].map(s => (
          <button key={s.status} onClick={() => setFilterStatus(filterStatus === s.status ? 'all' : s.status)}
            className={`section-card border text-center py-4 transition-all ${s.color} ${filterStatus === s.status ? 'ring-2 ring-blue-400' : ''}`}>
            <p className="text-3xl font-bold">{s.count}</p>
            <p className="text-sm font-semibold mt-1">{s.label}</p>
          </button>
        ))}
      </div>

      <div className="section-card">
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search patient or reason..." value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-9" />
          </div>
          <select className="form-input w-40" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <Table columns={columns as never} data={filtered as never} onRowClick={(r) => setSelected(r as Referral)} />
      </div>

      {/* Detail modal */}
      {selected && (
        <Modal open={!!selected} onClose={() => setSelected(null)} title="Referral Details" size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: 'Patient', value: selected.patientName },
                { label: 'Patient Type', value: selected.patientType },
                { label: 'Referral Date', value: selected.referralDate },
                { label: 'Referred To', value: selected.referredTo },
                { label: 'Follow-up Date', value: selected.followUpDate ?? '—' },
                { label: 'Referred By', value: selected.referredBy },
              ].map(item => (
                <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <p className="font-semibold text-slate-800 capitalize">{item.value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Referral Reason</p>
              <p className="bg-slate-50 rounded-xl p-3 text-sm text-slate-700">{selected.reason}</p>
            </div>
            {selected.serviceReceived && (
              <div>
                <p className="text-xs text-slate-400 mb-1">Service Received</p>
                <p className="bg-emerald-50 rounded-xl p-3 text-sm text-emerald-700">{selected.serviceReceived}</p>
              </div>
            )}
            {selected.outcome && (
              <div>
                <p className="text-xs text-slate-400 mb-1">Outcome</p>
                <p className="bg-blue-50 rounded-xl p-3 text-sm text-blue-700">{selected.outcome}</p>
              </div>
            )}
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">Status:</span>
              <Badge variant={selected.status === 'completed' ? 'completed' : selected.status === 'in_progress' ? 'active' : 'pending'}>
                {selected.status.replace('_', ' ')}
              </Badge>
            </div>
            <div className="flex gap-2 pt-2">
              <button className="btn-primary flex-1 justify-center">Update Status</button>
              <button className="btn-outline flex-1 justify-center"><Download size={15} /> Print Referral</button>
            </div>
          </div>
        </Modal>
      )}

      {/* New referral modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="Create New Referral" size="md">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Referral created!'); setShowNew(false); }}>
          <div><label className="form-label">Patient Name *</label><input className="form-input" value={newForm.patientName} onChange={e => setNewForm(f => ({ ...f, patientName: e.target.value }))} required /></div>
          <div><label className="form-label">Referral Reason *</label><textarea className="form-input" rows={3} value={newForm.reason} onChange={e => setNewForm(f => ({ ...f, reason: e.target.value }))} required /></div>
          <div><label className="form-label">Referred To (Facility) *</label><input className="form-input" value={newForm.referredTo} onChange={e => setNewForm(f => ({ ...f, referredTo: e.target.value }))} required /></div>
          <div><label className="form-label">Follow-up Date</label><input className="form-input" type="date" value={newForm.followUpDate} onChange={e => setNewForm(f => ({ ...f, followUpDate: e.target.value }))} /></div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowNew(false)} className="btn-outline flex-1 justify-center">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center"><Save size={15} /> Create Referral</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
