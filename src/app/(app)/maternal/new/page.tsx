'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Save, Heart, Loader2, CheckCircle, Home } from 'lucide-react';
import Link from 'next/link';
import { useData } from '@/context/DataContext';
import { useApp } from '@/context/AppContext';
import { createClient } from '@/lib/supabase/client';

const STEPS = ['Household', 'Identity', 'Pregnancy', 'Clinical', 'Support', 'Review'];

export default function NewMaternalPage() {
  const router = useRouter();
  const { households, refresh } = useData();
  const { currentUser } = useApp();

  const [step,   setStep]   = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState('');

  const [form, setForm] = useState({
    householdId: '',
    name: '', age: '', phone: '', status: 'pregnant',
    gestationalAge: '', expectedDeliveryDate: '',
    ancVisits: '0', pncVisits: '0',
    ironFolicSupplementation: 'true',
    depressionScreening: 'not_done',
    familySupport: 'good',
    nutritionStatus: 'normal',
    nextAppointment: '', notes: '',
  });

  const up = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  // Auto-fill location from selected household
  const selectedHousehold = households.find(h => h.id === form.householdId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = createClient() as any;
      const { error: dbError } = await sb.from('maternal_records').insert({
        household_id:               form.householdId,
        name:                       form.name,
        age:                        parseInt(form.age) || 0,
        phone:                      form.phone,
        status:                     form.status,
        gestational_age:            form.status !== 'lactating' && form.gestationalAge ? parseInt(form.gestationalAge) : null,
        expected_delivery_date:     form.status !== 'lactating' && form.expectedDeliveryDate ? form.expectedDeliveryDate : null,
        anc_visits:                 parseInt(form.ancVisits) || 0,
        pnc_visits:                 parseInt(form.pncVisits) || 0,
        iron_folic_supplementation: form.ironFolicSupplementation === 'true',
        depression_screening:       form.depressionScreening,
        family_support:             form.familySupport,
        nutrition_status:           form.nutritionStatus,
        risk_level:                 'low',
        next_appointment:           form.nextAppointment || null,
        notes:                      form.notes || null,
        missed_appointments:        0,
        registered_by:              currentUser?.id ?? null,
        region:                     selectedHousehold?.region ?? '',
        woreda:                     selectedHousehold?.woreda ?? '',
        kebele:                     selectedHousehold?.kebele ?? '',
      });
      if (dbError) { setError(dbError.message); setSaving(false); return; }
      await refresh();
      setSaved(true);
      setTimeout(() => router.push('/maternal'), 1200);
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
            style={{ background: 'rgba(236,72,153,0.15)', border: '1px solid rgba(236,72,153,0.3)' }}>
            <CheckCircle size={32} style={{ color: '#f472b6' }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#e6edf3' }}>Maternal Record Saved!</h2>
          <p className="text-sm" style={{ color: '#6b7280' }}>Redirecting…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/maternal" className="p-2 rounded-xl transition-colors" style={{ color: '#8b949e' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
          <ChevronLeft size={18} />
        </Link>
        <div>
          <h1 className="page-title">Register Mother</h1>
          <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>Appendix #1 — Maternal Register</p>
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
                    ? { background: 'linear-gradient(135deg,#ec4899,#be185d)', color: 'white' }
                    : { background: 'rgba(255,255,255,0.06)', color: '#6b7280' }
                  }>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className="text-xs" style={{ color: i <= step ? '#f472b6' : '#6b7280', fontSize: '0.65rem' }}>{s}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px mx-1" style={{ background: i < step ? '#ec4899' : 'rgba(255,255,255,0.08)' }} />
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

          {/* Step 0: Household Selection */}
          {step === 0 && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}>
                  <Home size={14} style={{ color: '#818cf8' }} />
                </div>
                <div>
                  <h2 className="font-bold" style={{ color: '#e6edf3' }}>Select Household</h2>
                  <p className="text-xs" style={{ color: '#6b7280' }}>Choose the household this mother belongs to</p>
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
                <div className="rounded-xl p-4" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                  <p className="text-xs font-semibold uppercase mb-2" style={{ color: '#818cf8' }}>Household Details</p>
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
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(236,72,153,0.15)' }}>
                  <Heart size={14} style={{ color: '#f472b6' }} />
                </div>
                <h2 className="font-bold" style={{ color: '#e6edf3' }}>Identity Information</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" value={form.name} onChange={e => up('name', e.target.value)} required placeholder="Mother's full name" />
                </div>
                <div>
                  <label className="form-label">Age *</label>
                  <input className="form-input" type="number" min="10" max="60" value={form.age} onChange={e => up('age', e.target.value)} required placeholder="e.g. 25" />
                </div>
                <div>
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={form.phone} onChange={e => up('phone', e.target.value)} placeholder="+251…" />
                </div>
                <div className="col-span-2">
                  <label className="form-label">Status *</label>
                  <div className="flex gap-3">
                    {['pregnant', 'lactating', 'both'].map(s => (
                      <button type="button" key={s} onClick={() => up('status', s)}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all"
                        style={form.status === s
                          ? { border: '2px solid #ec4899', background: 'rgba(236,72,153,0.12)', color: '#f472b6' }
                          : { border: '1px solid rgba(255,255,255,0.1)', color: '#8b949e', background: 'transparent' }
                        }>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Step 2: Pregnancy */}
          {step === 2 && (
            <>
              <h2 className="font-bold" style={{ color: '#e6edf3' }}>Pregnancy Details</h2>
              <div className="grid grid-cols-2 gap-4">
                {form.status !== 'lactating' && (
                  <>
                    <div>
                      <label className="form-label">Gestational Age (weeks)</label>
                      <input className="form-input" type="number" min="0" max="42" value={form.gestationalAge} onChange={e => up('gestationalAge', e.target.value)} placeholder="e.g. 20" />
                    </div>
                    <div>
                      <label className="form-label">Expected Delivery Date</label>
                      <input className="form-input" type="date" value={form.expectedDeliveryDate} onChange={e => up('expectedDeliveryDate', e.target.value)} />
                    </div>
                  </>
                )}
                <div>
                  <label className="form-label">ANC Visits</label>
                  <input className="form-input" type="number" min="0" max="20" value={form.ancVisits} onChange={e => up('ancVisits', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">PNC Visits</label>
                  <input className="form-input" type="number" min="0" max="20" value={form.pncVisits} onChange={e => up('pncVisits', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Next Appointment</label>
                  <input className="form-input" type="date" value={form.nextAppointment} onChange={e => up('nextAppointment', e.target.value)} />
                </div>
              </div>
            </>
          )}

          {/* Step 3: Clinical */}
          {step === 3 && (
            <>
              <h2 className="font-bold" style={{ color: '#e6edf3' }}>Clinical Assessment</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Iron/Folic Supplementation</label>
                  <select className="form-input" value={form.ironFolicSupplementation} onChange={e => up('ironFolicSupplementation', e.target.value)}>
                    <option value="true">Yes — Receiving</option>
                    <option value="false">No — Not Receiving</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Depression Screening</label>
                  <select className="form-input" value={form.depressionScreening} onChange={e => up('depressionScreening', e.target.value)}>
                    {['not_done', 'normal', 'at_risk', 'positive'].map(v => (
                      <option key={v} value={v}>{v.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Nutrition Status</label>
                  <select className="form-input" value={form.nutritionStatus} onChange={e => up('nutritionStatus', e.target.value)}>
                    {['normal', 'malnourished', 'obese'].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Step 4: Support */}
          {step === 4 && (
            <>
              <h2 className="font-bold" style={{ color: '#e6edf3' }}>Social Support</h2>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Family Support Level</label>
                  <div className="flex gap-3">
                    {['poor', 'moderate', 'good'].map(s => (
                      <button type="button" key={s} onClick={() => up('familySupport', s)}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all"
                        style={form.familySupport === s
                          ? { border: '2px solid #6366f1', background: 'rgba(99,102,241,0.12)', color: '#a5b4fc' }
                          : { border: '1px solid rgba(255,255,255,0.1)', color: '#8b949e', background: 'transparent' }
                        }>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="form-label">Additional Notes</label>
                  <textarea className="form-input" rows={4} value={form.notes} onChange={e => up('notes', e.target.value)} placeholder="Clinical notes…" />
                </div>
              </div>
            </>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <>
              <h2 className="font-bold mb-3" style={{ color: '#e6edf3' }}>Review &amp; Save</h2>
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                {[
                  { label: 'Household',    value: selectedHousehold ? `${selectedHousehold.registrationNumber} — ${selectedHousehold.headName}` : '—' },
                  { label: 'Name',         value: form.name },
                  { label: 'Age',          value: form.age },
                  { label: 'Status',       value: form.status },
                  { label: 'ANC Visits',   value: form.ancVisits },
                  { label: 'PNC Visits',   value: form.pncVisits },
                  { label: 'Iron/Folic',   value: form.ironFolicSupplementation === 'true' ? 'Yes' : 'No' },
                  { label: 'Depression',   value: form.depressionScreening.replace(/_/g, ' ') },
                  { label: 'Nutrition',    value: form.nutritionStatus },
                  { label: 'Family Supp.', value: form.familySupport },
                  { label: 'Location',     value: selectedHousehold ? `${selectedHousehold.kebele}, ${selectedHousehold.woreda}, ${selectedHousehold.region}` : '—' },
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
          <button type="button" onClick={() => step > 0 ? setStep(s => s - 1) : router.push('/maternal')} className="btn-outline">
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
