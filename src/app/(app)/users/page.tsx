'use client';
import React, { useState } from 'react';
import { mockUsers } from '@/lib/mockData';
import type { User } from '@/types';
import Badge from '@/components/ui/Badge';
import Table from '@/components/ui/Table';
import Modal from '@/components/ui/Modal';
import { Plus, Search, Shield, UserCheck, Edit2 } from 'lucide-react';

const roleColors: Record<string, 'high'|'medium'|'low'|'active'|'default'> = {
  admin: 'high', supervisor: 'medium', health_worker: 'active', data_clerk: 'low', viewer: 'default',
};

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<User | null>(null);
  const [showNew, setShowNew] = useState(false);

  const filtered = mockUsers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.includes(search.toLowerCase())
  );

  const columns = [
    { key: 'name', header: 'Name', render: (u: User) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-blue-700 font-bold text-sm">{u.name[0]}</span>
        </div>
        <div>
          <p className="font-semibold text-slate-800">{u.name}</p>
          <p className="text-xs text-slate-400">{u.email}</p>
        </div>
      </div>
    )},
    { key: 'role', header: 'Role', render: (u: User) => (
      <Badge variant={roleColors[u.role] ?? 'default'} className="capitalize">{u.role.replace('_', ' ')}</Badge>
    )},
    { key: 'location', header: 'Location', render: (u: User) => (
      <span className="text-sm text-slate-500">{u.kebele}, {u.woreda}, {u.region}</span>
    )},
    { key: 'phone', header: 'Phone', render: (u: User) => <span className="text-sm text-slate-600">{u.phone}</span> },
    { key: 'createdAt', header: 'Joined', render: (u: User) => <span className="text-xs text-slate-400">{u.createdAt}</span> },
    { key: 'actions', header: '', render: (u: User) => (
      <button onClick={(e) => { e.stopPropagation(); setSelected(u); }} className="p-1.5 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
        <Edit2 size={14} />
      </button>
    )},
  ];

  const roleCounts = mockUsers.reduce((acc, u) => { acc[u.role] = (acc[u.role] || 0) + 1; return acc; }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="text-slate-500 text-sm">{mockUsers.length} system users</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary"><Plus size={15} /> Add User</button>
      </div>

      {/* Role distribution */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { role: 'admin', label: 'Admins', color: 'bg-red-50 border-red-200 text-red-700' },
          { role: 'supervisor', label: 'Supervisors', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
          { role: 'health_worker', label: 'Health Workers', color: 'bg-blue-50 border-blue-200 text-blue-700' },
          { role: 'data_clerk', label: 'Data Clerks', color: 'bg-green-50 border-green-200 text-green-700' },
          { role: 'viewer', label: 'Viewers', color: 'bg-slate-50 border-slate-200 text-slate-700' },
        ].map(r => (
          <div key={r.role} className={`section-card border ${r.color} text-center py-3`}>
            <p className="text-2xl font-bold">{roleCounts[r.role] ?? 0}</p>
            <p className="text-xs font-semibold mt-0.5">{r.label}</p>
          </div>
        ))}
      </div>

      <div className="section-card">
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-9" />
          </div>
        </div>
        <Table columns={columns as never} data={filtered as never} onRowClick={(u) => setSelected(u as User)} />
      </div>

      {/* User detail/edit modal */}
      {selected && (
        <Modal open={!!selected} onClose={() => setSelected(null)} title="User Details" size="md">
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-blue-50 rounded-xl p-4">
              <div className="w-14 h-14 bg-blue-200 rounded-2xl flex items-center justify-center">
                <span className="text-blue-800 font-bold text-xl">{selected.name[0]}</span>
              </div>
              <div>
                <p className="font-bold text-slate-800 text-lg">{selected.name}</p>
                <Badge variant={roleColors[selected.role] ?? 'default'} className="capitalize mt-1">{selected.role.replace('_', ' ')}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: 'Email', value: selected.email },
                { label: 'Phone', value: selected.phone },
                { label: 'Region', value: selected.region },
                { label: 'Woreda', value: selected.woreda },
                { label: 'Kebele', value: selected.kebele },
                { label: 'Joined', value: selected.createdAt },
              ].map(item => (
                <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <p className="font-semibold text-slate-800">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <button className="btn-primary flex-1 justify-center"><Shield size={15} /> Change Role</button>
              <button className="btn-outline flex-1 justify-center"><UserCheck size={15} /> Reset Password</button>
            </div>
          </div>
        </Modal>
      )}

      {/* New user modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="Add New User" size="md">
        <form className="space-y-4" onSubmit={e => { e.preventDefault(); alert('User created!'); setShowNew(false); }}>
          <div><label className="form-label">Full Name *</label><input className="form-input" required /></div>
          <div><label className="form-label">Email *</label><input className="form-input" type="email" required /></div>
          <div><label className="form-label">Phone</label><input className="form-input" type="tel" /></div>
          <div><label className="form-label">Role *</label>
            <select className="form-input">
              {['admin','supervisor','health_worker','data_clerk','viewer'].map(r => <option key={r} value={r}>{r.replace('_',' ')}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="form-label">Region</label>
              <select className="form-input">{['Oromia','Amhara','Tigray','SNNPR','Addis Ababa'].map(r=><option key={r}>{r}</option>)}</select>
            </div>
            <div><label className="form-label">Woreda</label><input className="form-input" /></div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowNew(false)} className="btn-outline flex-1 justify-center">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center"><Plus size={15} /> Create User</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
