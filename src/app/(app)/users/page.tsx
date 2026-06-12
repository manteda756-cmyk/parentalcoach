'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User, UserRole } from '@/types';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { Plus, Search, Shield, Edit2, Loader2 } from 'lucide-react';

const REGIONS = ['Oromia', 'Amhara', 'Tigray', 'SNNPR', 'Afar', 'Somali', 'Addis Ababa'];
const ROLES: UserRole[] = ['admin', 'supervisor', 'health_worker', 'data_clerk', 'viewer'];

const roleColors: Record<string, 'high' | 'medium' | 'low' | 'active' | 'default'> = {
  admin: 'high', supervisor: 'medium', health_worker: 'active', data_clerk: 'low', viewer: 'default',
};

// ── New-user form shape ──────────────────────────────────────────────────────
interface NewUserForm {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  region: string;
  woreda: string;
  kebele: string;
}

const blankNewUser = (): NewUserForm => ({
  name: '', email: '', phone: '', role: 'health_worker',
  region: 'Oromia', woreda: '', kebele: '',
});

// ── Edit shape (only editable fields shown in modal) ─────────────────────────
interface EditForm {
  role: UserRole;
  region: string;
  woreda: string;
  kebele: string;
}

export default function UsersPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createClient() as any;

  const [users,    setUsers]    = useState<User[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [selected, setSelected] = useState<User | null>(null);
  const [showNew,  setShowNew]  = useState(false);

  const [newForm,   setNewForm]   = useState<NewUserForm>(blankNewUser());
  const [creating,  setCreating]  = useState(false);
  const [createMsg, setCreateMsg] = useState('');

  const [editForm,  setEditForm]  = useState<EditForm>({ role: 'health_worker', region: 'Oromia', woreda: '', kebele: '' });
  const [saving,    setSaving]    = useState(false);
  const [saveMsg,   setSaveMsg]   = useState('');

  // ── Load users ─────────────────────────────────────────────────────────────
  const loadUsers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await sb
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setUsers(data.map((u: Record<string, string>) => ({
        id:        u.id,
        name:      u.name,
        email:     u.email,
        phone:     u.phone ?? '',
        role:      u.role as UserRole,
        region:    u.region ?? '',
        woreda:    u.woreda ?? '',
        kebele:    u.kebele ?? '',
        avatar:    u.avatar_url ?? undefined,
        createdAt: u.created_at ?? '',
      })));
    }
    setLoading(false);
  }, [sb]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  // ── Derived state ──────────────────────────────────────────────────────────
  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.includes(search.toLowerCase())
  );

  const roleCounts = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // ── Create user ────────────────────────────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateMsg('');

    const { error } = await sb.from('users').insert({
      name:   newForm.name,
      email:  newForm.email,
      phone:  newForm.phone || null,
      role:   newForm.role,
      region: newForm.region,
      woreda: newForm.woreda || null,
      kebele: newForm.kebele || null,
    });

    if (error) {
      setCreateMsg(`Error: ${error.message}`);
    } else {
      setCreateMsg('User profile created. Ask them to sign up with this email through the app.');
      setNewForm(blankNewUser());
      await loadUsers();
    }
    setCreating(false);
  };

  // ── Open edit modal ────────────────────────────────────────────────────────
  const openEdit = (user: User) => {
    setSelected(user);
    setEditForm({ role: user.role, region: user.region, woreda: user.woreda, kebele: user.kebele });
    setSaveMsg('');
  };

  const closeEdit = () => { setSelected(null); setSaveMsg(''); };

  // ── Save edit ──────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    setSaveMsg('');

    const { error } = await sb
      .from('users')
      .update({
        role:   editForm.role,
        region: editForm.region,
        woreda: editForm.woreda,
        kebele: editForm.kebele,
      })
      .eq('id', selected.id);

    if (error) {
      setSaveMsg(`Error: ${error.message}`);
    } else {
      setSaveMsg('Saved successfully.');
      await loadUsers();
      // Refresh local selected to reflect changes
      setSelected(prev => prev ? { ...prev, ...editForm } : null);
    }
    setSaving(false);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>
            {loading ? 'Loading…' : `${users.length} system users`}
          </p>
        </div>
        <button onClick={() => { setShowNew(true); setCreateMsg(''); }} className="btn-primary">
          <Plus size={15} /> Add User
        </button>
      </div>

      {/* Role stat cards */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { role: 'admin',        label: 'Admins',        accent: '#ef4444' },
          { role: 'supervisor',   label: 'Supervisors',   accent: '#f59e0b' },
          { role: 'health_worker',label: 'Health Workers',accent: '#6366f1' },
          { role: 'data_clerk',   label: 'Data Clerks',   accent: '#10b981' },
          { role: 'viewer',       label: 'Viewers',       accent: '#6b7280' },
        ].map(r => (
          <div key={r.role} className="section-card text-center py-4"
            style={{ borderColor: `${r.accent}33` }}>
            {loading
              ? <div className="h-7 w-8 rounded mx-auto mb-1 animate-pulse"
                  style={{ background: 'rgba(255,255,255,0.08)' }} />
              : <p className="text-2xl font-bold" style={{ color: r.accent }}>{roleCounts[r.role] ?? 0}</p>
            }
            <p className="text-xs font-semibold mt-0.5" style={{ color: '#8b949e' }}>{r.label}</p>
          </div>
        ))}
      </div>

      {/* Search + table */}
      <div className="section-card">
        <div className="flex gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6b7280' }} />
            <input
              type="text"
              placeholder="Search by name, email or role…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-input pl-9"
            />
          </div>
        </div>

        {loading ? (
          // Skeleton rows
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-3 py-3 rounded-xl animate-pulse"
                style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="w-10 h-10 rounded-xl flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.07)' }} />
                <div className="flex-1 space-y-2">
                  <div className="h-3 rounded w-40" style={{ background: 'rgba(255,255,255,0.07)' }} />
                  <div className="h-2 rounded w-56" style={{ background: 'rgba(255,255,255,0.05)' }} />
                </div>
                <div className="h-5 w-20 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }} />
                <div className="h-3 w-32 rounded" style={{ background: 'rgba(255,255,255,0.05)' }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center py-10 text-sm" style={{ color: '#6b7280' }}>
            {users.length === 0 ? 'No users found in the database.' : 'No users match your search.'}
          </p>
        ) : (
          <div className="space-y-1">
            {/* Header row */}
            <div className="grid text-xs font-semibold uppercase px-3 pb-2"
              style={{ gridTemplateColumns: '2fr 1fr 2fr 1fr 1fr auto', color: '#6b7280', letterSpacing: '0.05em' }}>
              <span>User</span>
              <span>Role</span>
              <span>Location</span>
              <span>Phone</span>
              <span>Joined</span>
              <span />
            </div>

            {filtered.map(u => (
              <div key={u.id}
                className="grid items-center px-3 py-3 rounded-xl cursor-pointer transition-all text-sm"
                style={{ gridTemplateColumns: '2fr 1fr 2fr 1fr 1fr auto', border: '1px solid transparent' }}
                onClick={() => openEdit(u)}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
                }}
              >
                {/* Name + email */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(99,102,241,0.2)' }}>
                    <span className="font-bold text-sm" style={{ color: '#818cf8' }}>
                      {u.name[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate" style={{ color: '#e6edf3' }}>{u.name}</p>
                    <p className="text-xs truncate" style={{ color: '#6b7280' }}>{u.email}</p>
                  </div>
                </div>

                {/* Role badge */}
                <div>
                  <Badge variant={roleColors[u.role] ?? 'default'} className="capitalize">
                    {u.role.replace('_', ' ')}
                  </Badge>
                </div>

                {/* Location */}
                <span className="truncate text-xs" style={{ color: '#8b949e' }}>
                  {[u.kebele, u.woreda, u.region].filter(Boolean).join(', ') || '—'}
                </span>

                {/* Phone */}
                <span className="text-xs" style={{ color: '#8b949e' }}>{u.phone || '—'}</span>

                {/* Joined */}
                <span className="text-xs" style={{ color: '#6b7280' }}>
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                </span>

                {/* Edit button */}
                <button
                  onClick={e => { e.stopPropagation(); openEdit(u); }}
                  className="p-1.5 rounded-lg transition-all"
                  style={{ color: '#6b7280' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.15)'; (e.currentTarget as HTMLElement).style.color = '#818cf8'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#6b7280'; }}
                >
                  <Edit2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Edit / detail modal ───────────────────────────────────────────── */}
      {selected && (
        <Modal open={!!selected} onClose={closeEdit} title="User Details" size="md">
          <div className="space-y-5">
            {/* Avatar + name */}
            <div className="flex items-center gap-4 rounded-xl p-4"
              style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(99,102,241,0.2)' }}>
                <span className="font-bold text-xl" style={{ color: '#818cf8' }}>
                  {selected.name[0]?.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-bold text-lg" style={{ color: '#e6edf3' }}>{selected.name}</p>
                <p className="text-sm" style={{ color: '#6b7280' }}>{selected.email}</p>
              </div>
            </div>

            {/* Read-only info */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: 'Phone',  value: selected.phone || '—' },
                { label: 'Joined', value: selected.createdAt ? new Date(selected.createdAt).toLocaleDateString() : '—' },
              ].map(item => (
                <div key={item.label} className="rounded-xl p-3"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="text-xs font-semibold uppercase mb-1" style={{ color: '#6b7280' }}>{item.label}</p>
                  <p className="font-semibold" style={{ color: '#e6edf3' }}>{item.value}</p>
                </div>
              ))}
            </div>

            {/* Editable fields */}
            <div className="space-y-4">
              <div>
                <label className="form-label flex items-center gap-1.5">
                  <Shield size={11} /> Role
                </label>
                <select className="form-input" value={editForm.role}
                  onChange={e => setEditForm(f => ({ ...f, role: e.target.value as UserRole }))}>
                  {ROLES.map(r => (
                    <option key={r} value={r}>{r.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="form-label">Region</label>
                  <select className="form-input" value={editForm.region}
                    onChange={e => setEditForm(f => ({ ...f, region: e.target.value }))}>
                    {REGIONS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Woreda</label>
                  <input className="form-input" value={editForm.woreda}
                    onChange={e => setEditForm(f => ({ ...f, woreda: e.target.value }))}
                    placeholder="Woreda" />
                </div>
                <div>
                  <label className="form-label">Kebele</label>
                  <input className="form-input" value={editForm.kebele}
                    onChange={e => setEditForm(f => ({ ...f, kebele: e.target.value }))}
                    placeholder="Kebele" />
                </div>
              </div>
            </div>

            {/* Feedback */}
            {saveMsg && (
              <p className="text-sm rounded-xl px-3 py-2"
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
              <button type="button" onClick={closeEdit} className="btn-outline flex-1 justify-center">
                Cancel
              </button>
              <button type="button" onClick={handleSave} className="btn-primary flex-1 justify-center"
                disabled={saving}>
                {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── New user modal ────────────────────────────────────────────────── */}
      <Modal open={showNew} onClose={() => { setShowNew(false); setCreateMsg(''); }} title="Add New User" size="md">
        <form className="space-y-4" onSubmit={handleCreate}>
          <div>
            <label className="form-label">Full Name *</label>
            <input className="form-input" required value={newForm.name}
              onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Full name" />
          </div>
          <div>
            <label className="form-label">Email *</label>
            <input className="form-input" type="email" required value={newForm.email}
              onChange={e => setNewForm(f => ({ ...f, email: e.target.value }))}
              placeholder="user@example.com" />
          </div>
          <div>
            <label className="form-label">Phone</label>
            <input className="form-input" type="tel" value={newForm.phone}
              onChange={e => setNewForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="+251…" />
          </div>
          <div>
            <label className="form-label">Role *</label>
            <select className="form-input" value={newForm.role}
              onChange={e => setNewForm(f => ({ ...f, role: e.target.value as UserRole }))}>
              {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="form-label">Region</label>
              <select className="form-input" value={newForm.region}
                onChange={e => setNewForm(f => ({ ...f, region: e.target.value }))}>
                {REGIONS.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Woreda</label>
              <input className="form-input" value={newForm.woreda}
                onChange={e => setNewForm(f => ({ ...f, woreda: e.target.value }))}
                placeholder="Woreda" />
            </div>
            <div>
              <label className="form-label">Kebele</label>
              <input className="form-input" value={newForm.kebele}
                onChange={e => setNewForm(f => ({ ...f, kebele: e.target.value }))}
                placeholder="Kebele" />
            </div>
          </div>

          {/* Feedback message */}
          {createMsg && (
            <p className="text-sm rounded-xl px-3 py-2"
              style={{
                background: createMsg.startsWith('Error') ? 'rgba(239,68,68,0.1)' : 'rgba(52,211,153,0.1)',
                border: createMsg.startsWith('Error') ? '1px solid rgba(239,68,68,0.25)' : '1px solid rgba(52,211,153,0.25)',
                color: createMsg.startsWith('Error') ? '#fca5a5' : '#6ee7b7',
              }}>
              {createMsg}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => { setShowNew(false); setCreateMsg(''); }}
              className="btn-outline flex-1 justify-center">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={creating}>
              {creating
                ? <><Loader2 size={14} className="animate-spin" /> Creating…</>
                : <><Plus size={14} /> Create User</>
              }
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
