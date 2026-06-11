'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Home, MapPin, Save } from 'lucide-react';
import Link from 'next/link';
import { useData } from '@/context/DataContext';
import { useApp } from '@/context/AppContext';
import type { Household } from '@/types';

const steps = ['Basic Info', 'Location', 'Programs', 'Review'];

export default function NewHouseholdPage() {
  const router = useRouter();
  const { addHousehold, households } = useData();
  const { currentUser } = useApp();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    headName: '', houseNumber: '', phone: '', membersCount: '',
    region: 'Oromia', woreda: '', kebele: '', vulnerabilityStatus: 'none',
    programs: [] as string[], notes: '',
  });

  const update = (k: string, v: string | string[]) => setForm(f => ({ ...f, [k]: v }));
  const programs = ['MCH', 'Nutrition', 'Immunization', 'WASH', 'Family Planning', 'TB/HIV'];
  const toggleProgram = (p: string) =>
    update('programs', form.programs.includes(p) ? form.programs.filter(x => x !== p) : [...form.programs, p]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextNum = String(households.length + 1).padStart(3, '0');
    const newHousehold: Household = {
      id: `h-${Date.now()}`,
      registrationNumber: `HH-${new Date().getFullYear()}-${nextNum}`,
      houseNumber: form.houseNumber,
      headName: form.headName,
      phone: form.phone,
      region: form.region,
      woreda: form.woreda,
      kebele: form.kebele,
      vulnerabilityStatus: form.vulnerabilityStatus as Household['vulnerabilityStatus'],
      programs: form.programs,
      membersCount: parseInt(form.membersCount) || 1,
      registeredBy: currentUser?.id ?? 'unknown',
      registeredAt: new Date().toISOString().split('T')[0],
    };
    addHousehold(newHousehold);
    router.push('/households');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/households" className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <ChevronLeft size={20} className="text-slate-600" />
        </Link>
        <div>
          <h1 className="page-title">Register Household</h1>
          <p className="text-slate-500 text-sm">Complete all sections to register a new household</p>
        </div>
      </div>

      {/* Progress */}
      <div className="section-card py-4">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <button onClick={() => i < step && setStep(i)} className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${i <= step ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-xs font-medium ${i <= step ? 'text-blue-600' : 'text-slate-400'}`}>{s}</span>
              </button>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-blue-600' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="section-card space-y-5">
          {/* Step 0: Basic Info */}
          {step === 0 && (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Home size={18} className="text-blue-600" />
                <h2 className="font-bold text-slate-800">Basic Information</h2>
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
                  <input className="form-input" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+251..." type="tel" />
                </div>
                <div>
                  <label className="form-label">Number of Members *</label>
                  <input className="form-input" type="number" min="1" value={form.membersCount} onChange={e => update('membersCount', e.target.value)} placeholder="e.g. 5" required />
                </div>
                <div>
                  <label className="form-label">Vulnerability Status</label>
                  <select className="form-input" value={form.vulnerabilityStatus} onChange={e => update('vulnerabilityStatus', e.target.value)}>
                    {['none', 'low', 'medium', 'high'].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Step 1: Location */}
          {step === 1 && (
            <>
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={18} className="text-blue-600" />
                <h2 className="font-bold text-slate-800">Location Details</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Region *</label>
                  <select className="form-input" value={form.region} onChange={e => update('region', e.target.value)}>
                    {['Oromia', 'Amhara', 'Tigray', 'SNNPR', 'Afar', 'Somali', 'Addis Ababa'].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Woreda *</label>
                  <input className="form-input" value={form.woreda} onChange={e => update('woreda', e.target.value)} placeholder="Enter woreda" required />
                </div>
                <div>
                  <label className="form-label">Kebele *</label>
                  <input className="form-input" value={form.kebele} onChange={e => update('kebele', e.target.value)} placeholder="Kebele number/name" required />
                </div>
                <div className="col-span-2 bg-blue-50 rounded-xl p-4 flex items-center gap-3">
                  <MapPin size={18} className="text-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-700">GPS Location</p>
                    <p className="text-xs text-slate-500">Click to capture current GPS coordinates</p>
                  </div>
                  <button type="button" className="ml-auto btn-primary py-1.5 text-xs">Capture GPS</button>
                </div>
              </div>
            </>
          )}

          {/* Step 2: Programs */}
          {step === 2 && (
            <>
              <h2 className="font-bold text-slate-800">Program Enrollment</h2>
              <p className="text-sm text-slate-500">Select all applicable health programs</p>
              <div className="grid grid-cols-2 gap-3">
                {programs.map(p => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => toggleProgram(p)}
                    className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all text-left ${form.programs.includes(p) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-blue-300'}`}
                  >
                    {form.programs.includes(p) ? '✓ ' : ''}{p}
                  </button>
                ))}
              </div>
              <div>
                <label className="form-label">Additional Notes</label>
                <textarea className="form-input" rows={3} value={form.notes} onChange={e => update('notes', e.target.value)} placeholder="Any additional information..." />
              </div>
            </>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <>
              <h2 className="font-bold text-slate-800">Review & Submit</h2>
              <div className="bg-slate-50 rounded-xl p-4 space-y-3 text-sm">
                {[
                  { label: 'Household Head', value: form.headName },
                  { label: 'House Number', value: form.houseNumber },
                  { label: 'Phone', value: form.phone || 'Not provided' },
                  { label: 'Members', value: form.membersCount },
                  { label: 'Location', value: `Kebele ${form.kebele}, ${form.woreda}, ${form.region}` },
                  { label: 'Vulnerability', value: form.vulnerabilityStatus },
                  { label: 'Programs', value: form.programs.join(', ') || 'None selected' },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-3">
                    <span className="text-slate-400 w-28 flex-shrink-0">{item.label}</span>
                    <span className="font-semibold text-slate-800">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 justify-between mt-4">
          <button type="button" onClick={() => step > 0 ? setStep(s => s - 1) : router.push('/households')} className="btn-outline">
            {step === 0 ? 'Cancel' : '← Back'}
          </button>
          {step < steps.length - 1 ? (
            <button type="button" onClick={() => setStep(s => s + 1)} className="btn-primary">
              Next →
            </button>
          ) : (
            <button type="submit" className="btn-secondary">
              <Save size={15} /> Register Household
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
