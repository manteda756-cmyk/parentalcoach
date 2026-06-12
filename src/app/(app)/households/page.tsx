'use client';
import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { useApp } from '@/context/AppContext';
import { mockVisitReports, mockUsers } from '@/lib/mockData';
import type { Household } from '@/types';
import Badge from '@/components/ui/Badge';
import Table from '@/components/ui/Table';
import Modal from '@/components/ui/Modal';
import { createClient } from '@/lib/supabase/client';
import {
  Plus, Search, MapPin, Phone, Users, QrCode, Download,
  ClipboardList, AlertTriangle, Edit2, Save, Loader2,
} from 'lucide-react';
import Link from 'next/link';

const PROGRAMS = ['MCH', 'Nutrition', 'Immunization', 'WASH', 'Family Planning', 'TB/HIV'];
const REGIONS  = ['Oromia', 'Amhara', 'Tigray', 'SNNPR', 'Afar', 'Somali', 'Addis Ababa'];

export default function HouseholdsPage() {
  const { households, refresh } = useData();
  const { currentUser } = useApp();

  // Roles allowed to edit households: admin, supervisor, health_worker (HEW), data_clerk
  const canEdit = currentUser
    ? ['admin', 'supervisor', 'health_worker', 'data_clerk'].includes(currentUser.role)
    : false;

  const [search,     setSearch]     = useState('');
  const [selected,   setSelected]   = useState<Household | null>(null);
  const [filterVuln, setFilterVuln] = useState('all');
  const [detailTab,  setDetailTab]  = useState<'info' | 'edit' | 'visits'>('info');

  // Edit form state
  const [editForm,  setEditForm]  = useState<Partial<Household & { programs: string[] }>>({});
  const [saving,    setSaving]    = useState(false);
  const [saveMsg,   setSaveMsg]   = useState('');

  const openModal = (h: Household) => {
    setSelected(h);
    setDetailTab('info');
    setEditForm({
      headName:            h.headName,
      houseNumber:         h.houseNumber,
      phone:               h.phone,
      region:              h.region,
      woreda:              h.woreda,
      kebele:              h.kebele,
      membersCount:        h.membersCount,
      vulnerabilityStatus: h.vulnerabilityStatus,
      programs:            [...h.programs],
    });
    setSaveMsg('');
  };

  const toggleProgram = (p: string) => {
    setEditForm(f => ({
      ...f,
      programs: (f.programs ?? []).includes(p)
        ? (f.programs ?? []).filter(x => x !== p)
        : [...(f.programs ?? []), p],
    }));
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    setSaveMsg('');
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = createClient() as any;
      const { error } = await sb
        .from('households')
        .update({
          head_name:            editForm.headName,
          house_number:         editForm.houseNumber,
          phone:                editForm.phone,
          region:               editForm.region,
          woreda:               editForm.woreda,
          kebele:               editForm.kebele,
          members_count:        editForm.membersCount,
          vulnerability_status: editForm.vulnerabilityStatus,
          programs:             editForm.programs,
        })
        .eq('id', selected.id);

      if (error) {
        setSaveMsg(`Error: ${error.message}`);
      } else {
        setSaveMsg('Saved successfully.');
        await refresh();
        // Update selected to reflect new values immediately
        setSelected(prev => prev ? {
          ...prev,
          headName:            editForm.headName ?? prev.headName,
          houseNumber:         editForm.houseNumber ?? prev.houseNumber,
          phone:               editForm.phone ?? prev.phone,
          region:              editForm.region ?? prev.region,
          woreda:              editForm.woreda ?? prev.woreda,
          kebele:              editForm.kebele ?? prev.kebele,
          membersCount:        editForm.membersCount ?? prev.membersCount,
          vulnerabilityStatus: (editForm.vulnerabilityStatus ?? prev.vulnerabilityStatus) as Household['vulnerabilityStatus'],
          programs:            editForm.programs ?? prev.programs,
        } : null);
      }
    } catch (err) {
      setSaveMsg(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
    setSaving(false);
  };

  // ── Filtered data ────────────────────────────────────────────────────────
  const filtered = households.filter(h => {
    const matchSearch =
      h.headName.toLowerCase().includes(search.toLowerCase()) ||
      h.registrationNumber.toLowerCase().includes(search.toLowerCase()) ||
      h.kebele.includes(search);
    const matchVuln = filterVuln === 'all' || h.vulnerabilityStatus === filterVuln;
    return matchSearch && matchVuln;
  });

  const vulnCounts = {
    high:   households.filter(h => h.vulnerabilityStatus === 'high').length,
    medium: households.filter(h => h.vulnerabilityStatus === 'medium').length,
    low:    households.filter(h => h.vulnerabilityStatus === 'low').length,
  };

  const filterButtons = [
    { label: 'All',         value: 'all',    count: households.length, active: { bg: 'rgba(99,102,241,0.15)',  color: '#a5b4fc', border: 'rgba(99,102,241,0.3)' } },
    { label: 'High Vuln.',  value: 'high',   count: vulnCounts.high,   active: { bg: 'rgba(239,68,68,0.1)',   color: '#f87171', border: 'rgba(239,68,68,0.3)' } },
    { label: 'Medium Vuln.',value: 'medium', count: vulnCounts.medium, active: { bg: 'rgba(245,158,11,0.1)',  color: '#fbbf24', border: 'rgba(245,158,11,0.3)' } },
    { label: 'Low Vuln.',   value: 'low',    count: vulnCounts.low,    active: { bg: 'rgba(52,211,153,0.1)',  color: '#34d399', border: 'rgba(52,211,153,0.3)' } },
  ];

  const householdVisits = selected
    ? mockVisitReports.filter(r => r.householdId === selected.id)
        .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime())
    : [];

  // ── Table columns ────────────────────────────────────────────────────────
  const columns = [
    {
      key: 'registrationNumber', header: 'Reg. No.',
      render: (h: Household) => (
        <span className="font-mono text-xs font-bold" style={{ color: '#818cf8' }}>{h.registrationNumber}</span>
      ),
    },
    {
      key: 'headName', header: 'Household Head',
      render: (h: Household) => <span className="font-semibold" style={{ color: '#e6edf3' }}>{h.headName}</span>,
    },
    {
      key: 'location', header: 'Location',
      render: (h: Household) => (
        <div className="flex items-center gap-1 text-xs" style={{ color: '#8b949e' }}>
          <MapPin size={11} /> {h.kebele}, {h.woreda}
        </div>
      ),
    },
    {
      key: 'membersCount', header: 'Members',
      render: (h: Household) => (
        <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#c9d1d9' }}>
          <Users size={12} style={{ color: '#818cf8' }} /> {h.membersCount}
        </div>
      ),
    },
    {
      key: 'programs', header: 'Programs',
      render: (h: Household) => (
        <div className="flex gap-1 flex-wrap">
          {h.programs.map(p => (
            <span key={p} className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
              {p}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'vulnerabilityStatus', header: 'Vulnerability',
      render: (h: Household) => (
        <Badge variant={h.vulnerabilityStatus === 'high' ? 'high' : h.vulnerabilityStatus === 'medium' ? 'medium' : h.vulnerabilityStatus === 'low' ? 'low' : 'default'}>
          {h.vulnerabilityStatus}
        </Badge>
      ),
    },
    {
      key: 'registeredAt', header: 'Registered',
      render: (h: Household) => <span className="text-xs" style={{ color: '#6b7280' }}>{h.registeredAt}</span>,
    },
    {
      key: 'actions', header: '',
      render: (h: Household) => canEdit ? (
        <button
          onClick={e => { e.stopPropagation(); openModal(h); setDetailTab('edit'); }}
          className="p-1.5 rounded-lg transition-all"
          style={{ color: '#6b7280' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.15)'; (e.currentTarget as HTMLElement).style.color = '#818cf8'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#6b7280'; }}
          title="Edit household"
        >
          <Edit2 size={13} />
        </button>
      ) : null,
    },
  ];

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Household Registry</h1>
          <p className="text-sm mt-1" style={{ color: '#6b7280' }}>{households.length} households registered</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline"><Download size={14} /> Export</button>
          <Link href="/households/new" className="btn-primary"><Plus size={14} /> Register Household</Link>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {filterButtons.map(f => {
          const isActive = filterVuln === f.value;
          return (
            <button key={f.value} onClick={() => setFilterVuln(f.value)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={isActive
                ? { background: f.active.bg, color: f.active.color, border: `1px solid ${f.active.border}` }
                : { background: 'rgba(255,255,255,0.04)', color: '#8b949e', border: '1px solid rgba(255,255,255,0.08)' }
              }>
              {f.label}
              <span className="text-xs px-1.5 py-0.5 rounded-full"
                style={{ background: isActive ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)', color: 'inherit' }}>
                {f.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="section-card">
        <div className="flex gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#6b7280' }} />
            <input type="text" placeholder="Search by name, registration number, kebele…"
              value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-10" />
          </div>
        </div>
        <Table
          columns={columns as never}
          data={filtered as never}
          onRowClick={h => openModal(h as Household)}
        />
        <p className="text-xs mt-3" style={{ color: '#6b7280' }}>{filtered.length} of {households.length} households shown</p>
      </div>

      {/* Detail modal */}
      {selected && (
        <Modal open={!!selected} onClose={() => setSelected(null)} title="Household Details" size="lg">

          {/* Tabs */}
          <div className="flex gap-1 mb-5 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
            {[
              { id: 'info',   label: 'Info' },
              ...(canEdit ? [{ id: 'edit', label: 'Edit' }] : []),
              { id: 'visits', label: `Visits (${householdVisits.length})` },
            ].map(tab => (
              <button key={tab.id}
                onClick={() => { setDetailTab(tab.id as typeof detailTab); setSaveMsg(''); }}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                style={detailTab === tab.id
                  ? { background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)' }
                  : { color: '#6b7280', border: '1px solid transparent' }
                }>
                {tab.id === 'edit' && <Edit2 size={12} className="inline mr-1.5" />}
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Info tab ── */}
          {detailTab === 'info' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl p-4" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <p className="text-xs mb-1" style={{ color: '#6b7280' }}>Registration Number</p>
                  <p className="font-mono font-bold text-lg" style={{ color: '#818cf8' }}>{selected.registrationNumber}</p>
                </div>
                <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="text-xs mb-1" style={{ color: '#6b7280' }}>House Number</p>
                  <p className="font-bold text-lg" style={{ color: '#e6edf3' }}>{selected.houseNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { label: 'Household Head', value: selected.headName },
                  { label: 'Phone', value: selected.phone, icon: <Phone size={12} style={{ color: '#6b7280' }} /> },
                  { label: 'Region', value: selected.region },
                  { label: 'Woreda', value: selected.woreda },
                  { label: 'Kebele', value: selected.kebele },
                  { label: 'Members', value: String(selected.membersCount) },
                ].map(item => (
                  <div key={item.label} className="rounded-xl p-3"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#6b7280', fontSize: '0.67rem' }}>{item.label}</p>
                    <p className="font-semibold flex items-center gap-1.5" style={{ color: '#e6edf3' }}>{item.icon}{item.value}</p>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#6b7280', fontSize: '0.67rem' }}>Enrolled Programs</p>
                <div className="flex gap-2 flex-wrap">
                  {selected.programs.map(p => (
                    <span key={p} className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <Badge variant={selected.vulnerabilityStatus === 'high' ? 'high' : selected.vulnerabilityStatus === 'medium' ? 'medium' : 'low'}>
                {selected.vulnerabilityStatus} vulnerability
              </Badge>

              {selected.gpsLat && (
                <div className="rounded-xl p-3 flex items-center gap-2 text-sm"
                  style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399' }}>
                  <MapPin size={14} /> GPS: {selected.gpsLat.toFixed(4)}, {selected.gpsLng?.toFixed(4)}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                {canEdit && (
                  <button className="btn-outline flex-1 justify-center"
                    onClick={() => { setDetailTab('edit'); setSaveMsg(''); }}>
                    <Edit2 size={14} /> Edit Household
                  </button>
                )}
                <button className="btn-outline flex-1 justify-center"><QrCode size={14} /> QR Code</button>
                <button className="btn-outline flex-1 justify-center"><Download size={14} /> Export PDF</button>
              </div>
            </div>
          )}

          {/* ── Edit tab ── */}
          {detailTab === 'edit' && (
            <div className="space-y-5">
              <div className="rounded-xl p-3 flex items-center gap-2 text-xs"
                style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8' }}>
                <Edit2 size={12} />
                Editing household <strong>{selected.registrationNumber}</strong> — changes save directly to the database.
              </div>

              {/* Basic fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="form-label">Household Head Name *</label>
                  <input className="form-input" value={editForm.headName ?? ''}
                    onChange={e => setEditForm(f => ({ ...f, headName: e.target.value }))}
                    placeholder="Full name" />
                </div>
                <div>
                  <label className="form-label">House Number</label>
                  <input className="form-input" value={editForm.houseNumber ?? ''}
                    onChange={e => setEditForm(f => ({ ...f, houseNumber: e.target.value }))}
                    placeholder="e.g. 12A" />
                </div>
                <div>
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={editForm.phone ?? ''}
                    onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+251…" type="tel" />
                </div>
                <div>
                  <label className="form-label">Number of Members</label>
                  <input className="form-input" type="number" min="1"
                    value={editForm.membersCount ?? 1}
                    onChange={e => setEditForm(f => ({ ...f, membersCount: parseInt(e.target.value) || 1 }))} />
                </div>
                <div>
                  <label className="form-label">Vulnerability Status</label>
                  <select className="form-input" value={editForm.vulnerabilityStatus ?? 'none'}
                    onChange={e => setEditForm(f => ({ ...f, vulnerabilityStatus: e.target.value as Household['vulnerabilityStatus'] }))}>
                    {['none', 'low', 'medium', 'high'].map(v => (
                      <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location */}
              <div>
                <p className="form-label mb-3">Location</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="form-label">Region</label>
                    <select className="form-input" value={editForm.region ?? 'Oromia'}
                      onChange={e => setEditForm(f => ({ ...f, region: e.target.value }))}>
                      {REGIONS.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Woreda</label>
                    <input className="form-input" value={editForm.woreda ?? ''}
                      onChange={e => setEditForm(f => ({ ...f, woreda: e.target.value }))}
                      placeholder="Woreda" />
                  </div>
                  <div>
                    <label className="form-label">Kebele</label>
                    <input className="form-input" value={editForm.kebele ?? ''}
                      onChange={e => setEditForm(f => ({ ...f, kebele: e.target.value }))}
                      placeholder="Kebele" />
                  </div>
                </div>
              </div>

              {/* Programs */}
              <div>
                <p className="form-label mb-3">Enrolled Programs</p>
                <div className="grid grid-cols-3 gap-2">
                  {PROGRAMS.map(p => {
                    const active = (editForm.programs ?? []).includes(p);
                    return (
                      <button type="button" key={p} onClick={() => toggleProgram(p)}
                        className="p-2.5 rounded-xl text-xs font-semibold transition-all text-left"
                        style={active
                          ? { background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.4)', color: '#a5b4fc' }
                          : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#8b949e' }
                        }>
                        {active ? '✓ ' : ''}{p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Feedback */}
              {saveMsg && (
                <p className="text-sm rounded-xl px-4 py-2.5"
                  style={{
                    background: saveMsg.startsWith('Error') ? 'rgba(239,68,68,0.1)' : 'rgba(52,211,153,0.1)',
                    border: saveMsg.startsWith('Error') ? '1px solid rgba(239,68,68,0.25)' : '1px solid rgba(52,211,153,0.25)',
                    color: saveMsg.startsWith('Error') ? '#fca5a5' : '#6ee7b7',
                  }}>
                  {saveMsg}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setDetailTab('info')} className="btn-outline flex-1 justify-center">
                  Cancel
                </button>
                <button type="button" onClick={handleSave} className="btn-primary flex-1 justify-center" disabled={saving}>
                  {saving
                    ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
                    : <><Save size={14} /> Save Changes</>
                  }
                </button>
              </div>
            </div>
          )}

          {/* ── Visits tab ── */}
          {detailTab === 'visits' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm" style={{ color: '#8b949e' }}>
                  {householdVisits.length} visit report{householdVisits.length !== 1 ? 's' : ''}
                </p>
                <Link href={`/visits/new?householdId=${selected.id}`} className="btn-primary py-2 text-xs">
                  <Plus size={12} /> Start New Visit
                </Link>
              </div>

              {householdVisits.length === 0 ? (
                <div className="text-center py-12 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
                  <ClipboardList size={32} className="mx-auto mb-3" style={{ color: '#30363d' }} />
                  <p className="font-semibold text-sm" style={{ color: '#6b7280' }}>No visits recorded yet</p>
                  <p className="text-xs mt-1" style={{ color: '#484f58' }}>Start a new visit to record the bi-weekly household report</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {householdVisits.map(r => {
                    const hew = mockUsers.find(u => u.id === r.hewId);
                    const highFlags = r.riskFlags.filter(f => f.priority === 'high');
                    return (
                      <Link key={r.id} href={`/visits/${r.id}`}
                        className="block p-4 rounded-xl transition-all"
                        style={{
                          border: `1px solid ${highFlags.length ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.07)'}`,
                          background: highFlags.length ? 'rgba(239,68,68,0.04)' : 'rgba(255,255,255,0.02)',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = highFlags.length ? 'rgba(239,68,68,0.4)' : 'rgba(99,102,241,0.3)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = highFlags.length ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.07)'; }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono font-bold text-sm" style={{ color: '#818cf8' }}>Visit #{r.visitNumber}</span>
                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold capitalize"
                                style={
                                  r.status === 'approved'  ? { background: 'rgba(52,211,153,0.1)', color: '#34d399' } :
                                  r.status === 'submitted' ? { background: 'rgba(99,102,241,0.1)', color: '#818cf8' } :
                                  r.status === 'returned'  ? { background: 'rgba(245,158,11,0.1)', color: '#fbbf24' } :
                                                             { background: 'rgba(255,255,255,0.06)', color: '#8b949e' }
                                }>
                                {r.status}
                              </span>
                              {highFlags.length > 0 && (
                                <span className="flex items-center gap-1 text-xs font-bold" style={{ color: '#f87171' }}>
                                  <AlertTriangle size={10} /> {highFlags.length} alert{highFlags.length > 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                            <p className="text-xs" style={{ color: '#6b7280' }}>{r.visitDate} · HEW: {hew?.name ?? r.hewId}</p>
                          </div>
                          <span className="text-xs font-semibold" style={{ color: '#818cf8' }}>View →</span>
                        </div>
                        {r.riskFlags.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap gap-1">
                            {r.riskFlags.map((f, i) => (
                              <span key={i} className="text-xs px-2 py-0.5 rounded-full font-semibold"
                                style={f.priority === 'high'
                                  ? { background: 'rgba(239,68,68,0.1)', color: '#f87171' }
                                  : { background: 'rgba(245,158,11,0.1)', color: '#fbbf24' }}>
                                {f.type.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
