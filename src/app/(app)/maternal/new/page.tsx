'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Save, Heart } from 'lucide-react';
import Link from 'next/link';

const steps = ['Identity', 'Pregnancy', 'Clinical', 'Support', 'Review'];

export default function NewMaternalPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '', age: '', phone: '', householdId: '', status: 'pregnant',
    gestationalAge: '', expectedDeliveryDate: '', ancVisits: '0', pncVisits: '0',
    ironFolicSupplementation: 'true', depressionScreening: 'not_done',
    familySupport: 'good', nutritionStatus: 'normal',
    region: 'Oromia', woreda: '', kebele: '', nextAppointment: '', notes: '',
  });
  const up = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Maternal record saved!');
    router.push('/maternal');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/maternal" className="p-2 hover:bg-slate-100 rounded-xl"><ChevronLeft size={20} className="text-slate-600" /></Link>
        <div>
          <h1 className="page-title">Register Mother</h1>
          <p className="text-slate-500 text-sm">Appendix #1 — Maternal Register</p>
        </div>
      </div>

      {/* Progress */}
      <div className="section-card py-4">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <button type="button" onClick={() => i < step && setStep(i)} className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${i <= step ? 'bg-pink-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-xs font-medium ${i <= step ? 'text-pink-600' : 'text-slate-400'}`}>{s}</span>
              </button>
              {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-pink-600' : 'bg-slate-200'}`} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="section-card space-y-4">
          {/* Step 0: Identity */}
          {step === 0 && <>
            <div className="flex items-center gap-2"><Heart size={18} className="text-pink-600" /><h2 className="font-bold text-slate-800">Identity Information</h2></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className="form-label">Full Name *</label><input className="form-input" value={form.name} onChange={e => up('name', e.target.value)} required placeholder="Mother's full name" /></div>
              <div><label className="form-label">Age *</label><input className="form-input" type="number" min="10" max="60" value={form.age} onChange={e => up('age', e.target.value)} required /></div>
              <div><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e => up('phone', e.target.value)} placeholder="+251..." /></div>
              <div className="col-span-2"><label className="form-label">Status *</label>
                <div className="flex gap-3">
                  {['pregnant', 'lactating', 'both'].map(s => (
                    <button type="button" key={s} onClick={() => up('status', s)} className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all capitalize ${form.status === s ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-slate-200 text-slate-600'}`}>{s}</button>
                  ))}
                </div>
              </div>
            </div>
          </>}

          {/* Step 1: Pregnancy */}
          {step === 1 && <>
            <h2 className="font-bold text-slate-800">Pregnancy Details</h2>
            <div className="grid grid-cols-2 gap-4">
              {form.status !== 'lactating' && <>
                <div><label className="form-label">Gestational Age (weeks)</label><input className="form-input" type="number" min="0" max="42" value={form.gestationalAge} onChange={e => up('gestationalAge', e.target.value)} /></div>
                <div><label className="form-label">Expected Delivery Date</label><input className="form-input" type="date" value={form.expectedDeliveryDate} onChange={e => up('expectedDeliveryDate', e.target.value)} /></div>
              </>}
              <div><label className="form-label">ANC Visits</label><input className="form-input" type="number" min="0" max="20" value={form.ancVisits} onChange={e => up('ancVisits', e.target.value)} /></div>
              <div><label className="form-label">PNC Visits</label><input className="form-input" type="number" min="0" max="20" value={form.pncVisits} onChange={e => up('pncVisits', e.target.value)} /></div>
              <div><label className="form-label">Next Appointment</label><input className="form-input" type="date" value={form.nextAppointment} onChange={e => up('nextAppointment', e.target.value)} /></div>
            </div>
          </>}

          {/* Step 2: Clinical */}
          {step === 2 && <>
            <h2 className="font-bold text-slate-800">Clinical Assessment</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="form-label">Iron/Folic Supplementation</label>
                <select className="form-input" value={form.ironFolicSupplementation} onChange={e => up('ironFolicSupplementation', e.target.value)}>
                  <option value="true">Yes — Receiving</option><option value="false">No — Not Receiving</option>
                </select>
              </div>
              <div><label className="form-label">Depression Screening</label>
                <select className="form-input" value={form.depressionScreening} onChange={e => up('depressionScreening', e.target.value)}>
                  {['not_done', 'normal', 'at_risk', 'positive'].map(v => <option key={v} value={v}>{v.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div><label className="form-label">Nutrition Status</label>
                <select className="form-input" value={form.nutritionStatus} onChange={e => up('nutritionStatus', e.target.value)}>
                  {['normal', 'malnourished', 'obese'].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>
          </>}

          {/* Step 3: Support */}
          {step === 3 && <>
            <h2 className="font-bold text-slate-800">Social Support & Location</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className="form-label">Family Support Level</label>
                <div className="flex gap-3">
                  {['poor', 'moderate', 'good'].map(s => (
                    <button type="button" key={s} onClick={() => up('familySupport', s)} className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold capitalize transition-all ${form.familySupport === s ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'}`}>{s}</button>
                  ))}
                </div>
              </div>
              <div><label className="form-label">Region</label>
                <select className="form-input" value={form.region} onChange={e => up('region', e.target.value)}>
                  {['Oromia','Amhara','Tigray','SNNPR','Afar','Addis Ababa'].map(r=><option key={r}>{r}</option>)}
                </select>
              </div>
              <div><label className="form-label">Woreda</label><input className="form-input" value={form.woreda} onChange={e => up('woreda', e.target.value)} /></div>
              <div><label className="form-label">Kebele</label><input className="form-input" value={form.kebele} onChange={e => up('kebele', e.target.value)} /></div>
              <div className="col-span-2"><label className="form-label">Notes</label><textarea className="form-input" rows={3} value={form.notes} onChange={e => up('notes', e.target.value)} placeholder="Clinical notes..." /></div>
            </div>
          </>}

          {/* Step 4: Review */}
          {step === 4 && <>
            <h2 className="font-bold text-slate-800">Review & Save</h2>
            <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
              {[
                { label: 'Name', value: form.name },
                { label: 'Age', value: form.age },
                { label: 'Status', value: form.status },
                { label: 'ANC Visits', value: form.ancVisits },
                { label: 'Depression Screening', value: form.depressionScreening },
                { label: 'Nutrition', value: form.nutritionStatus },
                { label: 'Family Support', value: form.familySupport },
                { label: 'Location', value: `Kebele ${form.kebele}, ${form.woreda}, ${form.region}` },
              ].map(item => (
                <div key={item.label} className="flex gap-3">
                  <span className="text-slate-400 w-36 flex-shrink-0">{item.label}</span>
                  <span className="font-semibold text-slate-800 capitalize">{item.value || '—'}</span>
                </div>
              ))}
            </div>
          </>}
        </div>

        <div className="flex gap-3 justify-between mt-4">
          <button type="button" onClick={() => step > 0 ? setStep(s => s - 1) : router.push('/maternal')} className="btn-outline">
            {step === 0 ? 'Cancel' : '← Back'}
          </button>
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
