'use client';
import React, { useState } from 'react';
import { mockChildren } from '@/lib/mockData';
import type { ChildRecord } from '@/types';
import Badge from '@/components/ui/Badge';
import Table from '@/components/ui/Table';
import Modal from '@/components/ui/Modal';
import { Plus, Baby, AlertTriangle, Search, Download, Syringe, Scale } from 'lucide-react';
import Link from 'next/link';

export default function ChildrenPage() {
  const [search, setSearch] = useState('');
  const [filterNutrition, setFilterNutrition] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [selected, setSelected] = useState<ChildRecord | null>(null);

  const filtered = mockChildren.filter(c => {
    const ms = c.name.toLowerCase().includes(search.toLowerCase()) || c.caregiverName.toLowerCase().includes(search.toLowerCase());
    const mn = filterNutrition === 'all' || c.nutritionStatus === filterNutrition;
    const mr = filterRisk === 'all' || c.riskLevel === filterRisk;
    return ms && mn && mr;
  });

  const columns = [
    { key: 'name', header: 'Child Name', render: (c: ChildRecord) => (
      <div>
        <p className="font-semibold text-slate-800">{c.name}</p>
        <p className="text-xs text-slate-400">{c.sex} · {c.ageMonths} months</p>
      </div>
    )},
    { key: 'caregiver', header: 'Caregiver', render: (c: ChildRecord) => <span className="text-sm text-slate-600">{c.caregiverName}</span> },
    { key: 'nutritionStatus', header: 'Nutrition', render: (c: ChildRecord) => (
      <Badge variant={c.nutritionStatus === 'sam' ? 'high' : c.nutritionStatus === 'mam' ? 'medium' : 'low'}>
        {c.nutritionStatus.toUpperCase()}
      </Badge>
    )},
    { key: 'muac', header: 'MUAC (cm)', render: (c: ChildRecord) => (
      <span className={`text-sm font-bold ${!c.muac ? 'text-slate-400' : c.muac < 11.5 ? 'text-red-600' : c.muac < 12.5 ? 'text-yellow-600' : 'text-green-600'}`}>
        {c.muac ? `${c.muac} cm` : '—'}
      </span>
    )},
    { key: 'vaccination', header: 'Vaccination', render: (c: ChildRecord) => {
      const overdue = c.vaccinationStatus.filter(v => v.status === 'overdue').length;
      return overdue > 0
        ? <Badge variant="high">{overdue} overdue</Badge>
        : <Badge variant="completed">Up to date</Badge>;
    }},
    { key: 'disabilityScreening', header: 'Disability', render: (c: ChildRecord) => (
      <Badge variant={c.disabilityScreening === 'confirmed' ? 'high' : c.disabilityScreening === 'suspected' ? 'medium' : 'low'}>
        {c.disabilityScreening}
      </Badge>
    )},
    { key: 'riskLevel', header: 'Risk', render: (c: ChildRecord) => (
      <div className="flex items-center gap-1">
        {c.riskLevel === 'high' && <AlertTriangle size={13} className="text-red-500" />}
        <Badge variant={c.riskLevel as 'high'|'medium'|'low'}>{c.riskLevel}</Badge>
      </div>
    )},
    { key: 'nextAppointment', header: 'Next Appt', render: (c: ChildRecord) => (
      <span className="text-xs text-slate-500">{c.nextAppointment ?? '—'}</span>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Child Health Register</h1>
          <p className="text-slate-500 text-sm">{mockChildren.length} children registered</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline"><Download size={15} /> Export</button>
          <Link href="/children/new" className="btn-primary"><Plus size={15} /> Register Child</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Normal', count: mockChildren.filter(c => c.nutritionStatus === 'normal').length, color: 'bg-green-50 border-green-200 text-green-700' },
          { label: 'MAM', count: mockChildren.filter(c => c.nutritionStatus === 'mam').length, color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
          { label: 'SAM', count: mockChildren.filter(c => c.nutritionStatus === 'sam').length, color: 'bg-red-50 border-red-200 text-red-700' },
          { label: 'High Risk', count: mockChildren.filter(c => c.riskLevel === 'high').length, color: 'bg-orange-50 border-orange-200 text-orange-700' },
        ].map(s => (
          <div key={s.label} className={`section-card border ${s.color} py-3 text-center`}>
            <p className="text-2xl font-bold">{s.count}</p>
            <p className="text-xs font-semibold mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="section-card">
        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search child or caregiver..." value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-9" />
          </div>
          <select className="form-input w-44" value={filterNutrition} onChange={e => setFilterNutrition(e.target.value)}>
            <option value="all">All Nutrition</option>
            <option value="normal">Normal</option>
            <option value="mam">MAM</option>
            <option value="sam">SAM</option>
          </select>
          <select className="form-input w-36" value={filterRisk} onChange={e => setFilterRisk(e.target.value)}>
            <option value="all">All Risks</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <Table columns={columns as never} data={filtered as never} onRowClick={(c) => setSelected(c as ChildRecord)} />
      </div>

      {/* Detail modal */}
      {selected && (
        <Modal open={!!selected} onClose={() => setSelected(null)} title="Child Record" size="xl">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-emerald-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-200 rounded-xl flex items-center justify-center">
                    <Baby size={20} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-lg">{selected.name}</p>
                    <p className="text-sm text-slate-500">{selected.sex} · {selected.ageMonths} months · DOB: {selected.dateOfBirth}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: 'Caregiver', value: selected.caregiverName },
                  { label: 'Phone', value: selected.caregiverPhone },
                  { label: 'Weight', value: selected.weight ? `${selected.weight} kg` : '—' },
                  { label: 'Height', value: selected.height ? `${selected.height} cm` : '—' },
                  { label: 'MUAC', value: selected.muac ? `${selected.muac} cm` : '—' },
                  { label: 'Nutrition', value: selected.nutritionStatus.toUpperCase() },
                ].map(item => (
                  <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-400">{item.label}</p>
                    <p className="font-semibold text-slate-800">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Syringe size={15} className="text-blue-600" />
                  <p className="text-sm font-bold text-slate-700">Vaccination Status</p>
                </div>
                <div className="space-y-2">
                  {selected.vaccinationStatus.map((v, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                      <span className="text-slate-600 font-medium">{v.vaccine}</span>
                      <Badge variant={v.status === 'given' ? 'completed' : v.status === 'overdue' ? 'high' : 'pending'}>
                        {v.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Scale size={15} className="text-purple-600" />
                  <p className="text-sm font-bold text-slate-700">Developmental Milestones</p>
                </div>
                <div className="space-y-2">
                  {selected.developmentalMilestones.map((m, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                      <span className="text-slate-600 font-medium">{m.milestone}</span>
                      <Badge variant={m.status === 'achieved' ? 'completed' : m.status === 'delayed' ? 'high' : 'pending'}>
                        {m.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
              {selected.childProtectionFlags.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-xs font-bold text-red-700 mb-1">⚠ Child Protection Flags</p>
                  {selected.childProtectionFlags.map(f => <p key={f} className="text-xs text-red-600">{f.replace('_', ' ')}</p>)}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-6 pt-4 border-t border-slate-100">
            <button className="btn-primary flex-1 justify-center">Edit Record</button>
            <button className="btn-outline flex-1 justify-center">Growth Chart</button>
            <button className="btn-secondary flex-1 justify-center">Create Referral</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
