'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Save } from 'lucide-react';
import Link from 'next/link';

const steps = ['Identity', 'Measurements', 'Vaccination', 'Milestones', 'Review'];
const vaccines = ['BCG', 'OPV 0', 'Penta 1', 'Penta 2', 'Penta 3', 'PCV 1', 'PCV 2', 'PCV 3', 'Measles 1', 'Measles 2', 'Vitamin A'];
const milestones = ['Head control (3m)', 'Sitting (6m)', 'Standing (9m)', 'Walking (12m)', 'First words (12m)', 'Talking (18m)', 'Running (24m)'];

export default function NewChildPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '', sex: 'male', dateOfBirth: '', caregiverName: '', caregiverPhone: '',
    weight: '', height: '', muac: '', nutritionStatus: 'normal',
    disabilityScreening: 'none', region: 'Oromia', woreda: '', kebele: '',
    nextAppointment: '', notes: '',
    vaccinations: {} as Record<string, string>,
    achievedMilestones: [] as string[],
  });
  const up = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Child registered successfully!');
    router.push('/children');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/children" className="p-2 hover:bg-slate-100 rounded-xl"><ChevronLeft size={20} /></Link>
        <div>
          <h1 className="page-title">Register Child</h1>
          <p className="text-slate-500 text-sm">Appendix #1 — Child Register</p>
        </div>
      </div>

      {/* Progress */}
      <div className="section-card py-4">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <button type="button" onClick={() => i < step && setStep(i)} className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i <= step ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-xs font-medium ${i <= step ? 'text-emerald-600' : 'text-slate-400'}`}>{s}</span>
              </button>
              {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-emerald-600' : 'bg-slate-200'}`} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="section-card space-y-4">
          {step === 0 && <>
            <h2 className="font-bold text-slate-800">Child Identity</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className="form-label">Child Full Name *</label><input className="form-input" value={form.name} onChange={e => up('name', e.target.value)} required /></div>
              <div><label className="form-label">Sex *</label>
                <div className="flex gap-3">
                  {['male','female'].map(s => (
                    <button type="button" key={s} onClick={() => up('sex', s)} className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold capitalize transition-all ${form.sex === s ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600'}`}>{s}</button>
                  ))}
                </div>
              </div>
              <div><label className="form-label">Date of Birth *</label><input className="form-input" type="date" value={form.dateOfBirth} onChange={e => up('dateOfBirth', e.target.value)} required /></div>
              <div><label className="form-label">Caregiver Name *</label><input className="form-input" value={form.caregiverName} onChange={e => up('caregiverName', e.target.value)} required /></div>
              <div><label className="form-label">Caregiver Phone</label><input className="form-input" value={form.caregiverPhone} onChange={e => up('caregiverPhone', e.target.value)} /></div>
              <div><label className="form-label">Disability Screening</label>
                <select className="form-input" value={form.disabilityScreening} onChange={e => up('disabilityScreening', e.target.value)}>
                  {['none','suspected','confirmed'].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div><label className="form-label">Region</label>
                <select className="form-input" value={form.region} onChange={e => up('region', e.target.value)}>
                  {['Oromia','Amhara','Tigray','SNNPR','Afar','Addis Ababa'].map(r=><option key={r}>{r}</option>)}
                </select>
              </div>
              <div><label className="form-label">Woreda</label><input className="form-input" value={form.woreda} onChange={e => up('woreda', e.target.value)} /></div>
              <div><label className="form-label">Kebele</label><input className="form-input" value={form.kebele} onChange={e => up('kebele', e.target.value)} /></div>
            </div>
          </>}

          {step === 1 && <>
            <h2 className="font-bold text-slate-800">Anthropometric Measurements</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="form-label">Weight (kg)</label><input className="form-input" type="number" step="0.1" value={form.weight} onChange={e => up('weight', e.target.value)} /></div>
              <div><label className="form-label">Height (cm)</label><input className="form-input" type="number" step="0.1" value={form.height} onChange={e => up('height', e.target.value)} /></div>
              <div><label className="form-label">MUAC (cm)</label><input className="form-input" type="number" step="0.1" value={form.muac} onChange={e => up('muac', e.target.value)} /></div>
              <div><label className="form-label">Nutrition Status</label>
                <select className="form-input" value={form.nutritionStatus} onChange={e => up('nutritionStatus', e.target.value)}>
                  {['normal','mam','sam','overweight'].map(v=><option key={v} value={v}>{v.toUpperCase()}</option>)}
                </select>
              </div>
              {form.muac && (
                <div className={`col-span-2 p-3 rounded-xl text-sm font-semibold ${Number(form.muac) < 11.5 ? 'bg-red-50 text-red-700' : Number(form.muac) < 12.5 ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'}`}>
                  MUAC {Number(form.muac) < 11.5 ? '< 11.5 cm — SAM (Severe Acute Malnutrition)' : Number(form.muac) < 12.5 ? '11.5–12.5 cm — MAM (Moderate Acute Malnutrition)' : '≥ 12.5 cm — Normal'}
                </div>
              )}
              <div><label className="form-label">Next Appointment</label><input className="form-input" type="date" value={form.nextAppointment} onChange={e => up('nextAppointment', e.target.value)} /></div>
            </div>
          </>}

          {step === 2 && <>
            <h2 className="font-bold text-slate-800">Vaccination Status</h2>
            <div className="space-y-3">
              {vaccines.map(v => (
                <div key={v} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                  <span className="text-sm font-semibold text-slate-700 w-28 flex-shrink-0">{v}</span>
                  <select className="form-input flex-1" value={form.vaccinations[v] ?? 'due'} onChange={e => up('vaccinations', { ...form.vaccinations, [v]: e.target.value })}>
                    <option value="due">Due</option>
                    <option value="given">Given</option>
                    <option value="overdue">Overdue</option>
                    <option value="missed">Missed</option>
                  </select>
                  {(form.vaccinations[v] === 'given') && (
                    <input type="date" className="form-input flex-1" placeholder="Date given" />
                  )}
                </div>
              ))}
            </div>
          </>}

          {step === 3 && <>
            <h2 className="font-bold text-slate-800">Developmental Milestones</h2>
            <div className="space-y-2">
              {milestones.map(m => (
                <button type="button" key={m} onClick={() => up('achievedMilestones', form.achievedMilestones.includes(m) ? form.achievedMilestones.filter(x => x !== m) : [...form.achievedMilestones, m])}
                  className={`w-full p-3 rounded-xl border-2 text-sm font-semibold text-left transition-all ${form.achievedMilestones.includes(m) ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600'}`}>
                  {form.achievedMilestones.includes(m) ? '✓ ' : ''}{m}
                </button>
              ))}
            </div>
          </>}

          {step === 4 && <>
            <h2 className="font-bold text-slate-800">Review & Save</h2>
            <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
              {[
                { label: 'Name', value: form.name },
                { label: 'Sex', value: form.sex },
                { label: 'DOB', value: form.dateOfBirth },
                { label: 'Caregiver', value: form.caregiverName },
                { label: 'MUAC', value: form.muac ? `${form.muac} cm` : '—' },
                { label: 'Nutrition', value: form.nutritionStatus.toUpperCase() },
                { label: 'Location', value: `Kebele ${form.kebele}, ${form.woreda}` },
                { label: 'Milestones', value: form.achievedMilestones.length ? `${form.achievedMilestones.length} achieved` : '—' },
              ].map(item => (
                <div key={item.label} className="flex gap-3">
                  <span className="text-slate-400 w-28 flex-shrink-0">{item.label}</span>
                  <span className="font-semibold text-slate-800">{item.value || '—'}</span>
                </div>
              ))}
            </div>
          </>}
        </div>

        <div className="flex gap-3 justify-between mt-4">
          <button type="button" onClick={() => step > 0 ? setStep(s => s - 1) : router.push('/children')} className="btn-outline">{step === 0 ? 'Cancel' : '← Back'}</button>
          {step < steps.length - 1 ? (
            <button type="button" onClick={() => setStep(s => s + 1)} className="btn-primary">Next →</button>
          ) : (
            <button type="submit" className="btn-secondary"><Save size={15} /> Save Record</button>
          )}
        </div>
      </form>
    </div>
  );
}
