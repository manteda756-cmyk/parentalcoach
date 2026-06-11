'use client';
import React, { useState } from 'react';
import { mockMaternalRecords } from '@/lib/mockData';
import type { MaternalRecord } from '@/types';
import Badge from '@/components/ui/Badge';
import Table from '@/components/ui/Table';
import Modal from '@/components/ui/Modal';
import { Plus, Heart, AlertTriangle, Calendar, Phone, Search, Download } from 'lucide-react';
import Link from 'next/link';

export default function MaternalPage() {
  const [search, setSearch] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selected, setSelected] = useState<MaternalRecord | null>(null);

  const filtered = mockMaternalRecords.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchRisk = filterRisk === 'all' || m.riskLevel === filterRisk;
    const matchStatus = filterStatus === 'all' || m.status === filterStatus;
    return matchSearch && matchRisk && matchStatus;
  });

  const columns = [
    { key: 'name', header: 'Name', render: (m: MaternalRecord) => (
      <div>
        <p className="font-semibold text-slate-800">{m.name}</p>
        <p className="text-xs text-slate-400">Age: {m.age}</p>
      </div>
    )},
    { key: 'status', header: 'Status', render: (m: MaternalRecord) => (
      <Badge variant={m.status === 'pregnant' ? 'active' : 'completed'}>
        {m.status === 'pregnant' ? '🤰 Pregnant' : '🤱 Lactating'}
      </Badge>
    )},
    { key: 'gestationalAge', header: 'Gest. Age / Delivery', render: (m: MaternalRecord) => (
      <span className="text-sm text-slate-600">
        {m.gestationalAge ? `${m.gestationalAge} weeks` : m.actualDeliveryDate ? `Delivered: ${m.actualDeliveryDate}` : '-'}
      </span>
    )},
    { key: 'ancVisits', header: 'ANC / PNC', render: (m: MaternalRecord) => (
      <span className="text-sm font-semibold text-slate-700">{m.ancVisits} / {m.pncVisits}</span>
    )},
    { key: 'nutritionStatus', header: 'Nutrition', render: (m: MaternalRecord) => (
      <Badge variant={m.nutritionStatus === 'malnourished' ? 'high' : m.nutritionStatus === 'obese' ? 'medium' : 'low'}>
        {m.nutritionStatus}
      </Badge>
    )},
    { key: 'riskLevel', header: 'Risk', render: (m: MaternalRecord) => (
      <div className="flex items-center gap-1">
        {m.riskLevel === 'high' && <AlertTriangle size={13} className="text-red-500" />}
        <Badge variant={m.riskLevel as 'high' | 'medium' | 'low'}>{m.riskLevel}</Badge>
      </div>
    )},
    { key: 'nextAppointment', header: 'Next Appt', render: (m: MaternalRecord) => (
      <span className={`text-xs font-semibold ${m.missedAppointments > 0 ? 'text-red-600' : 'text-slate-600'}`}>
        {m.nextAppointment ?? 'Not scheduled'}
        {m.missedAppointments > 0 && <span className="ml-1 bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full text-xs">{m.missedAppointments} missed</span>}
      </span>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Maternal Health Register</h1>
          <p className="text-slate-500 text-sm">{mockMaternalRecords.length} mothers registered</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline"><Download size={15} /> Export</button>
          <Link href="/maternal/new" className="btn-primary"><Plus size={15} /> Register Mother</Link>
        </div>
      </div>

      {/* Stat pills */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Pregnant', count: mockMaternalRecords.filter(m => m.status === 'pregnant').length, color: 'bg-pink-50 border-pink-200 text-pink-700' },
          { label: 'Lactating', count: mockMaternalRecords.filter(m => m.status === 'lactating').length, color: 'bg-purple-50 border-purple-200 text-purple-700' },
          { label: 'High Risk', count: mockMaternalRecords.filter(m => m.riskLevel === 'high').length, color: 'bg-red-50 border-red-200 text-red-700' },
          { label: 'Missed Appts', count: mockMaternalRecords.reduce((s, m) => s + m.missedAppointments, 0), color: 'bg-orange-50 border-orange-200 text-orange-700' },
        ].map(s => (
          <div key={s.label} className={`section-card border ${s.color} py-3 text-center`}>
            <p className="text-2xl font-bold">{s.count}</p>
            <p className="text-xs font-semibold mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="section-card">
        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-9" />
          </div>
          <select className="form-input w-40" value={filterRisk} onChange={e => setFilterRisk(e.target.value)}>
            <option value="all">All Risks</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>
          <select className="form-input w-40" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="pregnant">Pregnant</option>
            <option value="lactating">Lactating</option>
          </select>
        </div>
        <Table columns={columns as never} data={filtered as never} onRowClick={(m) => setSelected(m as MaternalRecord)} />
      </div>

      {/* Detail modal */}
      {selected && (
        <Modal open={!!selected} onClose={() => setSelected(null)} title="Maternal Record" size="xl">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-pink-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-pink-200 rounded-xl flex items-center justify-center">
                    <Heart size={20} className="text-pink-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-lg">{selected.name}</p>
                    <p className="text-sm text-slate-500">Age: {selected.age} • {selected.status}</p>
                  </div>
                  <Badge variant={selected.riskLevel as 'high'|'medium'|'low'} className="ml-auto">{selected.riskLevel} risk</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: 'Phone', value: selected.phone, icon: <Phone size={13} /> },
                  { label: 'Location', value: `${selected.kebele}, ${selected.woreda}` },
                  { label: 'ANC Visits', value: String(selected.ancVisits) },
                  { label: 'PNC Visits', value: String(selected.pncVisits) },
                  { label: 'Iron/Folic', value: selected.ironFolicSupplementation ? '✅ Yes' : '❌ No' },
                  { label: 'Family Support', value: selected.familySupport },
                ].map(item => (
                  <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-400">{item.label}</p>
                    <p className="font-semibold text-slate-800 flex items-center gap-1">{item.icon}{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Clinical Indicators</p>
                <div className="space-y-2">
                  {[
                    { label: 'Nutrition Status', value: selected.nutritionStatus, color: selected.nutritionStatus === 'malnourished' ? 'text-red-600' : 'text-green-600' },
                    { label: 'Depression Screening', value: selected.depressionScreening.replace('_', ' '), color: selected.depressionScreening === 'positive' ? 'text-red-600' : 'text-green-600' },
                    { label: 'Gestational Age', value: selected.gestationalAge ? `${selected.gestationalAge} weeks` : 'N/A' },
                    { label: 'Expected Delivery', value: selected.expectedDeliveryDate ?? selected.actualDeliveryDate ?? 'N/A' },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-500">{item.label}</span>
                      <span className={`text-sm font-bold capitalize ${item.color ?? 'text-slate-800'}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={15} className="text-blue-600" />
                  <p className="text-sm font-semibold text-slate-800">Next Appointment</p>
                </div>
                <p className="text-blue-700 font-bold">{selected.nextAppointment ?? 'Not scheduled'}</p>
                {selected.missedAppointments > 0 && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertTriangle size={12} /> {selected.missedAppointments} appointment(s) missed
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-6 pt-4 border-t border-slate-100">
            <button className="btn-primary flex-1 justify-center">Edit Record</button>
            <button className="btn-outline flex-1 justify-center">Schedule Appointment</button>
            <button className="btn-secondary flex-1 justify-center">Create Referral</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
