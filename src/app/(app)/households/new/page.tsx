'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Home, MapPin, Save, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useData } from '@/context/DataContext';
import { useApp } from '@/context/AppContext';
import { createClient } from '@/lib/supabase/client';

const STEPS = ['Basic Info', 'Location', 'Programs', 'Review'];
const PROGRAMS = ['MCH', 'Nutrition', 'Immunization', 'WASH', 'Family Planning', 'TB/HIV'];
const REGIONS  = ['Oromia', 'Amhara', 'Tigray', 'SNNPR', 'Afar', 'Somali', 'Addis Ababa'];

export default function NewHouseholdPage() {
  const router      = useRouter();
  const { refresh } = useData();
  const { currentUser } = useApp();

  const [step,    setStep]    = useState(0);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState('');

  const [form, setForm] = useState({
    headName: '', houseNumber: '', phone: '', membersCount: '',
    region: 'Oromia', woreda: '', kebele: '',
    vulnerabilityStatus: 'none', programs: [] as string[], notes: '',
    gpsLat: '', gpsLng: '',
  });

  const update = (k: string, v: string | string[]) =>
    setForm(f => ({ ...f, [k]: v }));

  const toggleProgram = (p: string) =>
    update('programs', form.programs.includes(p)
      ? form.programs.filter(x => x !== p)
      : [...form.programs, p]);

  const captureGPS = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
      update('gpsLat', String(pos.coords.latitude));
      update('gpsLng', String(pos.coords.longitude));
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = createClient() as any;

      // Generate a registration number: HH-YYYY-XXXX (unique enough for now)
      const regNum = `HH-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

      const payload = {
        registration_number: regNum,
        house_number:        form.houseNumber,
        head_name:           form.headName,
        phone:               form.phone,
        region:              form.region,
        woreda:              form.woreda,
        kebele:              form.kebele,
        vulnerability_status:form.vulnerabilityStatus,
        programs:            form.programs,
        members_count:       parseInt(form.membersCount) || 1,
        registered_by:       currentUser?.id ?? null,
        registered_at:       new Date().toISOString().split('T')[0],
        gps_lat:             form.gpsLat ? parseFloat(form.gpsLat) : null,
        gps_lng:             form.gpsLng ? parseFloat(form.gpsLng) : null,
      };

      const { error: dbError } = await sb
        .from('households')
        .insert(payload);

      if (dbError) {
        setError(dbError.message);
        setSaving(false);
        return;
      }

      // Refresh DataContext so the households list updates immediately
      await refresh();
      setSaved(true);
      setTimeout(() => router.push('/households'), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setSaving(false);
    }
  };

  // ── Saved confirmation ──────────────────────────────────────────────
  if (saved) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center" style={{ minHeight: '60vh' }}>
        <div className="section-card text-center p-12">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)' }}>
            <CheckCircle size={32} style={{ color: '#34d399' }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#e6edf3' }}>Household Registered!</h2>
          <p className="text-sm" style={{ color: '#6b7280' }}>Redirecting to household list…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/households" className="p-2 rounded-xl transition-colors"
          style={{ color: '#8b949e' }}
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
              <button
                type="button"
                onClick={() => i < step && setStep(i)}
                className="flex flex-col items-center gap-1.5"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                  style={i <= step
                    ? { background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: 'white', boxShadow: '0 0 12px rgba(99,102,241,0.4)' }
                    : { background: 'rgba(255,255,255,0.06)', color: '#6b7280' }
                  }>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className="text-xs font-medium" style={{ color: i <= step ? '#818cf8' : '#6b7280' }}>{s}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px mx-3" style={{ background: i < step ? '#6366f1' : 'rgba(255,255,255,0.08)' }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl px-4 py-3 text-sm"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="section-card space-y-5">

          {/* ── Step 0: Basic Info ── */}
          {step === 0 && (
            <>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(99,102,241,0.15)' }}>
                  <Home size={14} style={{ color: '#818cf8' }} />
                </div>
                <h2 className="font-bold" style={{ color: '#e6edf3' }}>Basic Information</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="form-label">Household Head Name *</label>
                  <input className="form-input" value={form.headName}
                    onChange={e => update('headName', e.target.value)}
                    placeholder="Full name" required />
                </div>
                <div>
                  <label className="form-label">House Number *</label>
                  <input className="form-input" value={form.houseNumber}
                    onChange={e => update('houseNumber', e.target.value)}
                    placeholder="e.g. 12A" required />
                </div>
                <div>
                  <label className="form-label">Phone Number</label>
                  <input className="form-input" value={form.phone}
                    onChange={e => update('phone', e.target.value)}
                    placeholder="+251…" type="tel" />
                </div>
                <div>
                  <label className="form-label">Number of Members *</label>
                  <input className="form-input" type="number" min="1"
                    value={form.membersCount}
                    onChange={e => update('membersCount', e.target.value)}
                    placeholder="e.g. 5" required />
                </div>
                <div>
                  <label className="form-label">Vulnerability Status</label>
                  <select className="form-input" value={form.vulnerabilityStatus}
                    onChange={e => update('vulnerabilityStatus', e.target.value)}>
                    {['none', 'low', 'medium', 'high'].map(v =>
                      <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
                    )}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* ── Step 1: Location ── */}
          {step === 1 && (
            <>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(99,102,241,0.15)' }}>
                  <MapPin size={14} style={{ color: '#818cf8' }} />
                </div>
                <h2 className="font-bold" style={{ color: '#e6edf3' }}>Location Details</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Region *</label>
                  <select className="form-input" value={form.region}
                    onChange={e => update('region', e.target.value)}>
                    {REGIONS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Woreda *</label>
                  <input className="form-input" value={form.woreda}
                    onChange={e => update('woreda', e.target.value)}
                    placeholder="Enter woreda" required />
                </div>
                <div>
                  <label className="form-label">Kebele *</label>
                  <input className="form-input" value={form.kebele}
                    onChange={e => update('kebele', e.target.value)}
                    placeholder="Kebele number or name" required />
                </div>

                {/* GPS */}
                <div className="col-span-2 rounded-xl p-4 flex items-center gap-3"
                  style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                  <MapPin size={16} style={{ color: '#818cf8' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: '#e6edf3' }}>GPS Coordinates</p>
                    {form.gpsLat
                      ? <p className="text-xs mt-0.5" style={{ color: '#34d399' }}>
                          {parseFloat(form.gpsLat).toFixed(5)}, {parseFloat(form.gpsLng).toFixed(5)}
                        </p>
                      : <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>Tap to capture current location</p>
                    }
                  </div>
                  <button type="button" onClick={captureGPS} className="btn-primary py-1.5 text-xs" style={{ flexShrink: 0 }}>
                    {form.gpsLat ? 'Recapture' : 'Capture GPS'}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── Step 2: Programs ── */}
          {step === 2 && (
            <>
              <div>
                <h2 className="font-bold mb-1" style={{ color: '#e6edf3' }}>Program Enrollment</h2>
                <p className="text-sm" style={{ color: '#6b7280' }}>Select all applicable health programs</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {PROGRAMS.map(p => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => toggleProgram(p)}
                    className="p-3 rounded-xl text-sm font-semibold transition-all text-left"
                    style={form.programs.includes(p)
                      ? { background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.4)', color: '#a5b4fc' }
                      : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#8b949e' }
                    }
                  >
                    {form.programs.includes(p) ? '✓ ' : ''}{p}
                  </button>
                ))}
              </div>
              <div>
                <label className="form-label">Additional Notes</label>
                <textarea className="form-input" rows={3} value={form.notes}
                  onChange={e => update('notes', e.target.value)}
                  placeholder="Any additional information…" />
              </div>
            </>
          )}

          {/* ── Step 3: Review ── */}
          {step === 3 && (
            <>
              <h2 className="font-bold mb-3" style={{ color: '#e6edf3' }}>Review & Submit</h2>
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                {[
                  { label: 'Household Head',  value: form.headName },
                  { label: 'House Number',    value: form.houseNumber },
                  { label: 'Phone',           value: form.phone || '—' },
                  { label: 'Members',         value: form.membersCount },
                  { label: 'Region',          value: form.region },
                  { label: 'Woreda',          value: form.woreda },
                  { label: 'Kebele',          value: form.kebele },
                  { label: 'Vulnerability',   value: form.vulnerabilityStatus },
                  { label: 'Programs',        value: form.programs.join(', ') || 'None' },
                  { label: 'GPS',             value: form.gpsLat ? `${parseFloat(form.gpsLat).toFixed(5)}, ${parseFloat(form.gpsLng).toFixed(5)}` : 'Not captured' },
                ].map((item, i) => (
                  <div key={item.label}
                    className="flex items-start gap-3 px-4 py-3 text-sm"
                    style={{ borderBottom: i < 9 ? '1px solid rgba(255,255,255,0.05)' : 'none', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                    <span className="w-32 flex-shrink-0 font-medium" style={{ color: '#6b7280' }}>{item.label}</span>
                    <span className="font-semibold" style={{ color: '#e6edf3' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 justify-between mt-4">
          <button
            type="button"
            onClick={() => step > 0 ? setStep(s => s - 1) : router.push('/households')}
            className="btn-outline"
          >
            {step === 0 ? 'Cancel' : '← Back'}
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep(s => s + 1)}
              className="btn-primary"
              disabled={
                (step === 0 && (!form.headName || !form.houseNumber || !form.membersCount)) ||
                (step === 1 && (!form.woreda || !form.kebele))
              }
            >
              Next →
            </button>
          ) : (
            <button type="submit" className="btn-secondary" disabled={saving}>
              {saving
                ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
                : <><Save size={14} /> Register Household</>
              }
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
