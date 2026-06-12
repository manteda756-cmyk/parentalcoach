'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Home, MapPin, Save, Loader2, CheckCircle, Plus, X, Users, Baby } from 'lucide-react';
import Link from 'next/link';
import { useData } from '@/context/DataContext';
import { useApp } from '@/context/AppContext';
import { createClient } from '@/lib/supabase/client';

const STEPS    = ['Basic Info', 'Location', 'Programs', 'Maternal', 'Children', 'Review'];
const PROGRAMS = ['MCH', 'Nutrition', 'Immunization', 'WASH', 'Family Planning', 'TB/HIV'];
const REGIONS  = ['Oromia', 'Amhara', 'Tigray', 'SNNPR', 'Afar', 'Somali', 'Addis Ababa'];

interface MaternalEntry {
  id: string;
  name: string;
  age: string;
  phone: string;
  status: 'pregnant' | 'lactating' | 'both';
  gestationalAge: string;
}

interface ChildEntry {
  id: string;
  name: string;
  sex: 'male' | 'female';
  dateOfBirth: string;
  caregiverName: string;
}

const blankMaternal = (): MaternalEntry => ({
  id: Math.random().toString(36).slice(2),
  name: '', age: '', phone: '', status: 'pregnant', gestationalAge: '',
});

const blankChild = (): ChildEntry => ({
  id: Math.random().toString(36).slice(2),
  name: '', sex: 'male', dateOfBirth: '', caregiverName: '',
});

function calcAgeMonths(dob: string): number {
  if (!dob) return 0;
  const birth = new Date(dob);
  const now   = new Date();
  return Math.max(0, Math.floor(
    (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  ));
}

export default function NewHouseholdPage() {
  const router      = useRouter();
  const { refresh } = useData();
  const { currentUser } = useApp();

  const [step,   setStep]   = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState('');

  const [form, setForm] = useState({
    headName: '', houseNumber: '', phone: '', membersCount: '',
    region: 'Oromia', woreda: '', kebele: '',
    vulnerabilityStatus: 'none', programs: [] as string[], notes: '',
    gpsLat: '', gpsLng: '',
  });

  const [maternalList,  setMaternalList]  = useState<MaternalEntry[]>([]);
  const [maternalDraft, setMaternalDraft] = useState<MaternalEntry>(blankMaternal());
  const [childList,     setChildList]     = useState<ChildEntry[]>([]);
  const [childDraft,    setChildDraft]    = useState<ChildEntry>(blankChild());

  const update = (k: string, v: string | string[]) => setForm(f => ({ ...f, [k]: v }));
  const toggleProgram = (p: string) =>
    update('programs', form.programs.includes(p) ? form.programs.filter(x => x !== p) : [...form.programs, p]);

  const captureGPS = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
      update('gpsLat', String(pos.coords.latitude));
      update('gpsLng', String(pos.coords.longitude));
    });
  };

  const addMother = () => {
    if (!maternalDraft.name || !maternalDraft.age) return;
    setMaternalList(l => [...l, maternalDraft]);
    setMaternalDraft(blankMaternal());
  };
  const removeMother = (id: string) => setMaternalList(l => l.filter(m => m.id !== id));

  const addChild = () => {
    if (!childDraft.name || !childDraft.dateOfBirth) return;
    setChildList(l => [...l, childDraft]);
    setChildDraft(blankChild());
  };
  const removeChild = (id: string) => setChildList(l => l.filter(c => c.id !== id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = createClient() as any;
      const regNum = `HH-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

      const { data: hhData, error: dbError } = await sb
        .from('households')
        .insert({
          registration_number:  regNum,
          house_number:         form.houseNumber,
          head_name:            form.headName,
          phone:                form.phone,
          region:               form.region,
          woreda:               form.woreda,
          kebele:               form.kebele,
          vulnerability_status: form.vulnerabilityStatus,
          programs:             form.programs,
          members_count:        parseInt(form.membersCount) || 1,
          registered_by:        currentUser?.id ?? null,
          registered_at:        new Date().toISOString().split('T')[0],
          gps_lat:              form.gpsLat ? parseFloat(form.gpsLat) : null,
          gps_lng:              form.gpsLng ? parseFloat(form.gpsLng) : null,
        })
        .select('id')
        .single();

      if (dbError) { setError(dbError.message); setSaving(false); return; }

      const householdId = hhData?.id;

      if (householdId && maternalList.length > 0) {
        await sb.from('maternal_records').insert(
          maternalList.map(m => ({
            household_id:               householdId,
            name:                       m.name,
            age:                        parseInt(m.age) || 0,
            phone:                      m.phone,
            status:                     m.status,
            gestational_age:            m.status !== 'lactating' && m.gestationalAge ? parseInt(m.gestationalAge) : null,
            risk_level:                 'low',
            registered_by:              currentUser?.id ?? null,
            region:                     form.region,
            woreda:                     form.woreda,
            kebele:                     form.kebele,
            anc_visits:                 0,
            pnc_visits:                 0,
            depression_screening:       'not_done',
            iron_folic_supplementation: false,
            family_support:             'good',
            nutrition_status:           'normal',
            missed_appointments:        0,
          }))
        );
      }

      if (householdId && childList.length > 0) {
        await sb.from('child_records').insert(
          childList.map(c => ({
            household_id:           householdId,
            name:                   c.name,
            sex:                    c.sex,
            date_of_birth:          c.dateOfBirth,
            age_months:             calcAgeMonths(c.dateOfBirth),
            caregiver_name:         c.caregiverName,
            risk_level:             'low',
            registered_by:          currentUser?.id ?? null,
            region:                 form.region,
            woreda:                 form.woreda,
            kebele:                 form.kebele,
            nutrition_status:       'normal',
            disability_screening:   'none',
            child_protection_flags: [],
          }))
        );
      }

      await refresh();
      setSaved(true);
      setTimeout(() => router.push('/households'), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center" style={{ minHeight: '60vh' }}>
        <div className="section-card text-center p-12">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)' }}>
            <CheckCircle size={32} style={{ color: '#34d399' }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#e6edf3' }}>Household Registered!</h2>
          <p className="text-sm" style={{ color: '#6b7280' }}>
            {maternalList.length > 0 && `${maternalList.length} maternal record(s) saved. `}
            {childList.length > 0 && `${childList.length} child record(s) saved. `}
            Redirecting…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/households" className="p-2 rounded-xl transition-colors" style={{ color: '#8b949e' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
          <ChevronLeft size={18} />
        </Link>
        <div>
          <h1 className="page-title">Register Household</h1>
          <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>Complete all sections to register a new household</p>
        </div>
      </div>

      {/* Step progress */}
      <div className="section-card py-5">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <button type="button" onClick={() => i < step && setStep(i)} className="flex flex-col items-center gap-1">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={i <= step
                    ? { background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: 'white' }
                    : { background: 'rgba(255,255,255,0.06)', color: '#6b7280' }
                  }>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className="text-xs" style={{ color: i <= step ? '#818cf8' : '#6b7280', fontSize: '0.65rem' }}>{s}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px mx-1" style={{ background: i < step ? '#6366f1' : 'rgba(255,255,255,0.08)' }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="section-card space-y-5">

          {/* Step 0: Basic Info */}
          {step === 0 && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}>
                  <Home size={14} style={{ color: '#818cf8' }} />
                </div>
                <h2 className="font-bold" style={{ color: '#e6edf3' }}>Basic Information</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="form-label">Household Head Name *</label>
                  <input className="form-input" value={form.headName} onChange={e => update('headName', e.target.value)} placeholder="Full name" required />
                </div>
                <div>
                  <label className="form-label">House Number *</label>
                  <input className="form-input" value={form.houseNumber} onChange={e => update('houseNumber', e.target.value)} placeholder="e.g. 12A" required />
                </div>
                <div>
                  <label className="form-label">Phone Number</label>
                  <input className="form-input" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+251…" type="tel" />
                </div>
                <div>
                  <label className="form-label">Number of Members *</label>
                  <input className="form-input" type="number" min="1" value={form.membersCount} onChange={e => update('membersCount', e.target.value)} placeholder="e.g. 5" required />
                </div>
                <div>
                  <label className="form-label">Vulnerability Status</label>
                  <select className="form-input" value={form.vulnerabilityStatus} onChange={e => update('vulnerabilityStatus', e.target.value)}>
                    {['none','low','medium','high'].map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase()+v.slice(1)}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Step 1: Location */}
          {step === 1 && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}>
                  <MapPin size={14} style={{ color: '#818cf8' }} />
                </div>
                <h2 className="font-bold" style={{ color: '#e6edf3' }}>Location Details</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Region *</label>
                  <select className="form-input" value={form.region} onChange={e => update('region', e.target.value)}>
                    {REGIONS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Woreda *</label>
                  <input className="form-input" value={form.woreda} onChange={e => update('woreda', e.target.value)} placeholder="Enter woreda" required />
                </div>
                <div>
                  <label className="form-label">Kebele *</label>
                  <input className="form-input" value={form.kebele} onChange={e => update('kebele', e.target.value)} placeholder="Kebele number or name" required />
                </div>
                <div className="col-span-2 rounded-xl p-4 flex items-center gap-3"
                  style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                  <MapPin size={16} style={{ color: '#818cf8' }} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: '#e6edf3' }}>GPS Coordinates</p>
                    {form.gpsLat
                      ? <p className="text-xs mt-0.5" style={{ color: '#34d399' }}>{parseFloat(form.gpsLat).toFixed(5)}, {parseFloat(form.gpsLng).toFixed(5)}</p>
                      : <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>Tap to capture current location</p>
                    }
                  </div>
                  <button type="button" onClick={captureGPS} className="btn-primary py-1.5 text-xs">
                    {form.gpsLat ? 'Recapture' : 'Capture GPS'}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Step 2: Programs */}
          {step === 2 && (
            <>
              <h2 className="font-bold" style={{ color: '#e6edf3' }}>Program Enrollment</h2>
              <p className="text-sm" style={{ color: '#6b7280' }}>Select all applicable health programs</p>
              <div className="grid grid-cols-2 gap-3">
                {PROGRAMS.map(p => (
                  <button type="button" key={p} onClick={() => toggleProgram(p)}
                    className="p-3 rounded-xl text-sm font-semibold transition-all text-left"
                    style={form.programs.includes(p)
                      ? { background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.4)', color: '#a5b4fc' }
                      : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#8b949e' }
                    }>
                    {form.programs.includes(p) ? '✓ ' : ''}{p}
                  </button>
                ))}
              </div>
              <div>
                <label className="form-label">Additional Notes</label>
                <textarea className="form-input" rows={3} value={form.notes} onChange={e => update('notes', e.target.value)} placeholder="Any additional information…" />
              </div>
            </>
          )}

          {/* Step 3: Maternal Members */}
          {step === 3 && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(236,72,153,0.15)' }}>
                  <Users size={14} style={{ color: '#f472b6' }} />
                </div>
                <div>
                  <h2 className="font-bold" style={{ color: '#e6edf3' }}>Maternal Members</h2>
                  <p className="text-xs" style={{ color: '#6b7280' }}>Add pregnant or lactating mothers in this household (optional)</p>
                </div>
              </div>

              <div className="rounded-xl p-4 space-y-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="form-label">Mother&apos;s Name *</label>
                    <input className="form-input" value={maternalDraft.name}
                      onChange={e => setMaternalDraft(d => ({ ...d, name: e.target.value }))}
                      placeholder="Full name" />
                  </div>
                  <div>
                    <label className="form-label">Age *</label>
                    <input className="form-input" type="number" min="10" max="60" value={maternalDraft.age}
                      onChange={e => setMaternalDraft(d => ({ ...d, age: e.target.value }))}
                      placeholder="e.g. 25" />
                  </div>
                  <div>
                    <label className="form-label">Phone</label>
                    <input className="form-input" type="tel" value={maternalDraft.phone}
                      onChange={e => setMaternalDraft(d => ({ ...d, phone: e.target.value }))}
                      placeholder="+251…" />
                  </div>
                  <div>
                    <label className="form-label">Status *</label>
                    <select className="form-input" value={maternalDraft.status}
                      onChange={e => setMaternalDraft(d => ({ ...d, status: e.target.value as MaternalEntry['status'] }))}>
                      <option value="pregnant">Pregnant</option>
                      <option value="lactating">Lactating</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  {maternalDraft.status !== 'lactating' && (
                    <div>
                      <label className="form-label">Gestational Age (weeks)</label>
                      <input className="form-input" type="number" min="1" max="42" value={maternalDraft.gestationalAge}
                        onChange={e => setMaternalDraft(d => ({ ...d, gestationalAge: e.target.value }))}
                        placeholder="e.g. 20" />
                    </div>
                  )}
                </div>
                <button type="button" onClick={addMother} className="btn-primary w-full justify-center"
                  disabled={!maternalDraft.name || !maternalDraft.age}>
                  <Plus size={14} /> Add Mother
                </button>
              </div>

              {maternalList.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase" style={{ color: '#6b7280' }}>Added ({maternalList.length})</p>
                  {maternalList.map(m => (
                    <div key={m.id} className="flex items-center gap-3 rounded-xl px-4 py-3"
                      style={{ background: 'rgba(236,72,153,0.06)', border: '1px solid rgba(236,72,153,0.2)' }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(236,72,153,0.2)' }}>
                        <span className="text-xs font-bold" style={{ color: '#f472b6' }}>{m.name[0]?.toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold" style={{ color: '#e6edf3' }}>{m.name}</p>
                        <p className="text-xs" style={{ color: '#6b7280' }}>
                          Age {m.age} · {m.status}
                          {m.gestationalAge ? ` · ${m.gestationalAge} wks GA` : ''}
                          {m.phone ? ` · ${m.phone}` : ''}
                        </p>
                      </div>
                      <button type="button" onClick={() => removeMother(m.id)} className="p-1.5 rounded-lg transition-all"
                        style={{ color: '#6b7280' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.15)'; (e.currentTarget as HTMLElement).style.color = '#fca5a5'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#6b7280'; }}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {maternalList.length === 0 && (
                <p className="text-sm text-center py-2" style={{ color: '#6b7280' }}>No maternal records added. You can skip this step.</p>
              )}
            </>
          )}

          {/* Step 4: Children */}
          {step === 4 && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.15)' }}>
                  <Baby size={14} style={{ color: '#60a5fa' }} />
                </div>
                <div>
                  <h2 className="font-bold" style={{ color: '#e6edf3' }}>Children (0–6 years)</h2>
                  <p className="text-xs" style={{ color: '#6b7280' }}>Add children aged 0–6 years in this household (optional)</p>
                </div>
              </div>

              <div className="rounded-xl p-4 space-y-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="form-label">Child&apos;s Name *</label>
                    <input className="form-input" value={childDraft.name}
                      onChange={e => setChildDraft(d => ({ ...d, name: e.target.value }))}
                      placeholder="Child's full name" />
                  </div>
                  <div>
                    <label className="form-label">Sex *</label>
                    <select className="form-input" value={childDraft.sex}
                      onChange={e => setChildDraft(d => ({ ...d, sex: e.target.value as ChildEntry['sex'] }))}>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Date of Birth *</label>
                    <input className="form-input" type="date" value={childDraft.dateOfBirth}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={e => setChildDraft(d => ({ ...d, dateOfBirth: e.target.value }))} />
                  </div>
                  <div className="col-span-2">
                    <label className="form-label">Caregiver Name</label>
                    <input className="form-input" value={childDraft.caregiverName}
                      onChange={e => setChildDraft(d => ({ ...d, caregiverName: e.target.value }))}
                      placeholder="Name of primary caregiver" />
                  </div>
                </div>
                <button type="button" onClick={addChild} className="btn-primary w-full justify-center"
                  disabled={!childDraft.name || !childDraft.dateOfBirth}>
                  <Plus size={14} /> Add Child
                </button>
              </div>

              {childList.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase" style={{ color: '#6b7280' }}>Added ({childList.length})</p>
                  {childList.map(c => (
                    <div key={c.id} className="flex items-center gap-3 rounded-xl px-4 py-3"
                      style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)' }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(59,130,246,0.2)' }}>
                        <span className="text-xs font-bold" style={{ color: '#60a5fa' }}>{c.name[0]?.toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold" style={{ color: '#e6edf3' }}>{c.name}</p>
                        <p className="text-xs" style={{ color: '#6b7280' }}>
                          {c.sex} · DOB {c.dateOfBirth} · {calcAgeMonths(c.dateOfBirth)} months
                          {c.caregiverName ? ` · ${c.caregiverName}` : ''}
                        </p>
                      </div>
                      <button type="button" onClick={() => removeChild(c.id)} className="p-1.5 rounded-lg transition-all"
                        style={{ color: '#6b7280' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.15)'; (e.currentTarget as HTMLElement).style.color = '#fca5a5'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#6b7280'; }}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {childList.length === 0 && (
                <p className="text-sm text-center py-2" style={{ color: '#6b7280' }}>No children added. You can skip this step.</p>
              )}
            </>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <>
              <h2 className="font-bold mb-3" style={{ color: '#e6edf3' }}>Review &amp; Submit</h2>
              <div className="rounded-xl overflow-hidden mb-4" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                {[
                  { label: 'Household Head', value: form.headName },
                  { label: 'House Number',   value: form.houseNumber },
                  { label: 'Phone',          value: form.phone || '—' },
                  { label: 'Members',        value: form.membersCount },
                  { label: 'Region',         value: form.region },
                  { label: 'Woreda',         value: form.woreda },
                  { label: 'Kebele',         value: form.kebele },
                  { label: 'Vulnerability',  value: form.vulnerabilityStatus },
                  { label: 'Programs',       value: form.programs.join(', ') || 'None' },
                  { label: 'GPS',            value: form.gpsLat ? `${parseFloat(form.gpsLat).toFixed(5)}, ${parseFloat(form.gpsLng).toFixed(5)}` : 'Not captured' },
                ].map((item, i) => (
                  <div key={item.label} className="flex items-start gap-3 px-4 py-3 text-sm"
                    style={{ borderBottom: i < 9 ? '1px solid rgba(255,255,255,0.05)' : 'none', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                    <span className="w-32 flex-shrink-0 font-medium" style={{ color: '#6b7280' }}>{item.label}</span>
                    <span className="font-semibold capitalize" style={{ color: '#e6edf3' }}>{item.value}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs font-semibold uppercase mb-2" style={{ color: '#f472b6' }}>
                Maternal Members ({maternalList.length})
              </p>
              {maternalList.length === 0
                ? <p className="text-sm mb-3" style={{ color: '#6b7280' }}>None added</p>
                : <div className="mb-3 space-y-1">
                    {maternalList.map(m => (
                      <div key={m.id} className="flex items-center gap-2 text-sm py-1"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span className="font-semibold" style={{ color: '#e6edf3' }}>{m.name}</span>
                        <span style={{ color: '#6b7280' }}>· Age {m.age} · {m.status}</span>
                        {m.gestationalAge && <span style={{ color: '#6b7280' }}>· {m.gestationalAge} wks GA</span>}
                      </div>
                    ))}
                  </div>
              }

              <p className="text-xs font-semibold uppercase mb-2" style={{ color: '#60a5fa' }}>
                Children 0–6 yrs ({childList.length})
              </p>
              {childList.length === 0
                ? <p className="text-sm" style={{ color: '#6b7280' }}>None added</p>
                : <div className="space-y-1">
                    {childList.map(c => (
                      <div key={c.id} className="flex items-center gap-2 text-sm py-1"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span className="font-semibold" style={{ color: '#e6edf3' }}>{c.name}</span>
                        <span style={{ color: '#6b7280' }}>· {c.sex} · DOB {c.dateOfBirth}</span>
                        {c.caregiverName && <span style={{ color: '#6b7280' }}>· {c.caregiverName}</span>}
                      </div>
                    ))}
                  </div>
              }
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 justify-between mt-4">
          <button type="button" onClick={() => step > 0 ? setStep(s => s - 1) : router.push('/households')} className="btn-outline">
            {step === 0 ? 'Cancel' : '← Back'}
          </button>
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={() => setStep(s => s + 1)} className="btn-primary"
              disabled={
                (step === 0 && (!form.headName || !form.houseNumber || !form.membersCount)) ||
                (step === 1 && (!form.woreda || !form.kebele))
              }>
              Next →
            </button>
          ) : (
            <button type="submit" className="btn-secondary" disabled={saving}>
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> Register Household</>}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
