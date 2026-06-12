'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Save, Baby, Loader2, CheckCircle, Home } from 'lucide-react';
import Link from 'next/link';
import { useData } from '@/context/DataContext';
import { useApp } from '@/context/AppContext';
import { createClient } from '@/lib/supabase/client';

const STEPS    = ['Household', 'Identity', 'Measurements', 'Vaccination', 'Review'];
const VACCINES = ['BCG', 'OPV 0', 'Penta 1', 'Penta 2', 'Penta 3', 'PCV 1', 'PCV 2', 'PCV 3', 'Measles 1', 'Measles 2', 'Vitamin A'];

function calcAgeMonths(dob: string): number {
  if (!dob) return 0;
  const birth = new Date(dob);
  const now   = new Date();
  return Math.max(0, Math.floor(
    (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  ));
}

export default function NewChildPage() {
  const router = useRouter();
  const { households, refresh } = useData();
  const { currentUser } = useApp();

  const [step,   setStep]   = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState('');

  const [form, setForm] = useState({
    householdId: '',
    name: '', sex: 'male', dateOfBirth: '',
    caregiverName: '', caregiverPhone: '',
    weight: '', height: '', muac: '',
    nutritionStatus: 'normal',
    disabilityScreening: 'none',
    nextAppointment: '',
    vaccinations: {} as Record<string, string>,
  });

  const up = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const selectedHousehold = households.find(h => h.id === form.householdId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = createClient() as any;
      const { error: dbError } = await sb.from('child_records').insert({
        household_id:           form.householdId,
        name:                   form.name,
        sex:                    form.sex,
        date_of_birth:          form.dateOfBirth,
        age_months:             calcAgeMonths(form.dateOfBirth),
        caregiver_name:         form.caregiverName,
        caregiver_phone:        form.caregiverPhone || null,
        weight:                 form.weight ? parseFloat(form.weight) : null,
        height:                 form.height ? parseFloat(form.height) : null,
        muac:                   form.muac ? parseFloat(form.muac) : null,
        nutrition_status:       form.nutritionStatus,
        disability_screening:   form.disabilityScreening,
        next_appointment:       form.nextAppointment || null,
        risk_level:             'low',
        registered_by:          currentUser?.id ?? null,
        region:                 selectedHousehold?.region ?? '',
        woreda:                 selectedHousehold?.woreda ?? '',
        kebele:                 selectedHousehold?.kebele ?? '',
        child_protection_flags: [],
      });
      if (dbError) { setError(dbError.message); setSaving(false); return; }
      await refresh();
      setSaved(true);
      setTimeout(() => router.push('/children'), 1200);
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
            style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
            <CheckCircle size={32} style={{ color: '#34d399' }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#e6edf3' }}>Child Registered!</h2>
          <p className="text-sm" style={{ color: '#6b7280' }}>Redirecting…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/children" className="p-2 rounded-xl transition-colors" style={{ color: '#8b949e' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
          <ChevronLeft size={18} />
        </Link>
        <div>
          <h1 className="page-title">Register Child</h1>
          <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>Appendix #1 — Child Register</p>
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
                    ? { background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white' }
                    : { background: 'rgba(255,255,255,0.06)', color: '#6b7280' }
                  }>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className="text-xs" style={{ color: i <= step ? '#34d399' : '#6b7280', fontSize: '0.65rem' }}>{s}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px mx-1" style={{ background: i < step ? '#10b981' : 'rgba(255,255,255,0.08)' }} />
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

          {/* Step 0: Household */}
          {step === 0 && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}>
                  <Home size={14} style={{ color: '#818cf8' }} />
                </div>
                <div>
                  <h2 className="font-bold" style={{ color: '#e6edf3' }}>Select Household</h2>
                  <p className="text-xs" style={{ color: '#6b7280' }}>Choose the household this child belongs to</p>
                </div>
              </div>

              <div>
                <label className="form-label">Household *</label>
                <select className="form-input" value={form.householdId} onChange={e => up('householdId', e.target.value)} required>
                  <option value="">— Select a household —</option>
                  {households.map(h => (
                    <option key={h.id} value={h.id}>
                      {h.registrationNumber} — {h.headName} ({h.kebele}, {h.woreda})
                    </option>
                  ))}
                </select>
                {households.length === 0 && (
                  <p className="text-xs mt-2" style={{ color: '#f59e0b' }}>
                    No households registered yet. <Link href="/households/new" style={{ color: '#818cf8' }}>Register one first →</Link>
                  </p>
                )}
              </div>

              {selectedHousehold && (
                <div className="rounded-xl p-4" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                  <p className="text-xs font-semibold uppercase mb-2" style={{ color: '#34d399' }}>Household Details</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {[
                      { label: 'Head', value: selectedHousehold.headName },
                      { label: 'Reg. No.', value: selectedHousehold.registrationNumber },
                      { label: 'Region', value: selectedHousehold.region },
                      { label: 'Woreda', value: selectedHousehold.woreda },
                      { label: 'Kebele', value: selectedHousehold.kebele },
                      { label: 'Members', value: String(selectedHousehold.membersCount) },
                    ].map(item => (
                      <div key={item.label}>
                        <span style={{ color: '#6b7280' }}>{item.label}: </span>
                        <span className="font-semibold" style={{ color: '#e6edf3' }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Step 1: Identity */}
          {step === 1 && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}>
                  <Baby size={14} style={{ color: '#34d399' }} />
                </div>
                <h2 className="font-bold" style={{ color: '#e6edf3' }}>Child Identity</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="form-label">Child Full Name *</label>
                  <input className="form-input" value={form.name} onChange={e => up('name', e.target.value)} required placeholder="Child's full name" />
                </div>
                <div>
                  <label className="form-label">Sex *</label>
                  <div className="flex gap-3">
                    {['male', 'female'].map(s => (
                      <button type="button" key={s} onClick={() => up('sex', s)}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all"
                        style={form.sex === s
                          ? { border: '2px solid #10b981', background: 'rgba(16,185,129,0.12)', color: '#34d399' }
                          : { border: '1px solid rgba(255,255,255,0.1)', color: '#8b949e', background: 'transparent' }
                        }>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="form-label">Date of Birth *</label>
                  <input className="form-input" type="date" value={form.dateOfBirth}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={e => up('dateOfBirth', e.target.value)} required />
                </div>
                {form.dateOfBirth && (
                  <div className="col-span-2 text-sm rounded-xl px-4 py-2.5"
                    style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', color: '#818cf8' }}>
                    Age: {calcAgeMonths(form.dateOfBirth)} months
                  </div>
                )}
                <div>
                  <label className="form-label">Caregiver Name *</label>
                  <input className="form-input" value={form.caregiverName} onChange={e => up('caregiverName', e.target.value)} required placeholder="Primary caregiver" />
                </div>
                <div>
                  <label className="form-label">Caregiver Phone</label>
                  <input className="form-input" value={form.caregiverPhone} onChange={e => up('caregiverPhone', e.target.value)} placeholder="+251…" />
                </div>
                <div>
                  <label className="form-label">Disability Screening</label>
                  <select className="form-input" value={form.disabilityScreening} onChange={e => up('disabilityScreening', e.target.value)}>
                    {['none', 'suspected', 'confirmed'].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Next Appointment</label>
                  <input className="form-input" type="date" value={form.nextAppointment} onChange={e => up('nextAppointment', e.target.value)} />
                </div>
              </div>
            </>
          )}

          {/* Step 2: Measurements */}
          {step === 2 && (
            <>
              <h2 className="font-bold" style={{ color: '#e6edf3' }}>Anthropometric Measurements</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Weight (kg)</label>
                  <input className="form-input" type="number" step="0.1" value={form.weight} onChange={e => up('weight', e.target.value)} placeholder="e.g. 8.5" />
                </div>
                <div>
                  <label className="form-label">Height (cm)</label>
                  <input className="form-input" type="number" step="0.1" value={form.height} onChange={e => up('height', e.target.value)} placeholder="e.g. 72" />
                </div>
                <div>
                  <label className="form-label">MUAC (cm)</label>
                  <input className="form-input" type="number" step="0.1" value={form.muac} onChange={e => up('muac', e.target.value)} placeholder="e.g. 13.5" />
                </div>
                <div>
                  <label className="form-label">Nutrition Status</label>
                  <select className="form-input" value={form.nutritionStatus} onChange={e => up('nutritionStatus', e.target.value)}>
                    {['normal', 'mam', 'sam', 'overweight'].map(v => <option key={v} value={v}>{v.toUpperCase()}</option>)}
                  </select>
                </div>
                {form.muac && (
                  <div className="col-span-2 text-sm rounded-xl px-4 py-2.5 font-semibold"
                    style={Number(form.muac) < 11.5
                      ? { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }
                      : Number(form.muac) < 12.5
                      ? { background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#fbbf24' }
                      : { background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399' }
                    }>
                    MUAC {Number(form.muac) < 11.5
                      ? '< 11.5 cm — SAM (Severe Acute Malnutrition)'
                      : Number(form.muac) < 12.5
                      ? '11.5–12.5 cm — MAM (Moderate Acute Malnutrition)'
                      : '≥ 12.5 cm — Normal'}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Step 3: Vaccination */}
          {step === 3 && (
            <>
              <h2 className="font-bold" style={{ color: '#e6edf3' }}>Vaccination Status</h2>
              <div className="space-y-2">
                {VACCINES.map(v => (
                  <div key={v} className="flex items-center gap-4 px-4 py-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span className="text-sm font-semibold w-24 flex-shrink-0" style={{ color: '#e6edf3' }}>{v}</span>
                    <select
                      className="form-input flex-1"
                      value={form.vaccinations[v] ?? 'due'}
                      onChange={e => up('vaccinations', { ...form.vaccinations, [v]: e.target.value })}>
                      <option value="due">Due</option>
                      <option value="given">Given</option>
                      <option value="overdue">Overdue</option>
                      <option value="missed">Missed</option>
                    </select>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <>
              <h2 className="font-bold mb-3" style={{ color: '#e6edf3' }}>Review &amp; Save</h2>
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                {[
                  { label: 'Household',  value: selectedHousehold ? `${selectedHousehold.registrationNumber} — ${selectedHousehold.headName}` : '—' },
                  { label: 'Name',       value: form.name },
                  { label: 'Sex',        value: form.sex },
                  { label: 'DOB',        value: form.dateOfBirth },
                  { label: 'Age',        value: form.dateOfBirth ? `${calcAgeMonths(form.dateOfBirth)} months` : '—' },
                  { label: 'Caregiver',  value: form.caregiverName },
                  { label: 'Weight',     value: form.weight ? `${form.weight} kg` : '—' },
                  { label: 'Height',     value: form.height ? `${form.height} cm` : '—' },
                  { label: 'MUAC',       value: form.muac ? `${form.muac} cm` : '—' },
                  { label: 'Nutrition',  value: form.nutritionStatus.toUpperCase() },
                  { label: 'Location',   value: selectedHousehold ? `${selectedHousehold.kebele}, ${selectedHousehold.woreda}, ${selectedHousehold.region}` : '—' },
                ].map((item, i, arr) => (
                  <div key={item.label} className="flex items-start gap-3 px-4 py-2.5 text-sm"
                    style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                    <span className="w-28 flex-shrink-0 font-medium" style={{ color: '#6b7280' }}>{item.label}</span>
                    <span className="font-semibold capitalize" style={{ color: '#e6edf3' }}>{item.value || '—'}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 justify-between mt-4">
          <button type="button" onClick={() => step > 0 ? setStep(s => s - 1) : router.push('/children')} className="btn-outline">
            {step === 0 ? 'Cancel' : '← Back'}
          </button>
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={() => setStep(s => s + 1)} className="btn-primary"
              disabled={step === 0 && !form.householdId}>
              Next →
            </button>
          ) : (
            <button type="submit" className="btn-secondary" disabled={saving}>
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> Save Record</>}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
