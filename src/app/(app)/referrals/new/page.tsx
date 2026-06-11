'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Save } from 'lucide-react';
import React, { useState } from 'react';

export default function NewReferralPage() {
  const router = useRouter();
  const [form, setForm] = useState({ patientName: '', patientType: 'maternal', reason: '', referredTo: '', followUpDate: '', notes: '' });
  const up = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/referrals" className="p-2 hover:bg-slate-100 rounded-xl"><ChevronLeft size={20} /></Link>
        <h1 className="page-title">Create New Referral</h1>
      </div>
      <form className="section-card space-y-4" onSubmit={e => { e.preventDefault(); alert('Referral created!'); router.push('/referrals'); }}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><label className="form-label">Patient Name *</label><input className="form-input" value={form.patientName} onChange={e => up('patientName', e.target.value)} required /></div>
          <div><label className="form-label">Patient Type *</label>
            <select className="form-input" value={form.patientType} onChange={e => up('patientType', e.target.value)}>
              <option value="maternal">Maternal</option><option value="child">Child</option>
            </select>
          </div>
          <div><label className="form-label">Referred To *</label><input className="form-input" value={form.referredTo} onChange={e => up('referredTo', e.target.value)} required placeholder="Facility name" /></div>
          <div className="col-span-2"><label className="form-label">Referral Reason *</label><textarea className="form-input" rows={4} value={form.reason} onChange={e => up('reason', e.target.value)} required /></div>
          <div><label className="form-label">Follow-up Date</label><input className="form-input" type="date" value={form.followUpDate} onChange={e => up('followUpDate', e.target.value)} /></div>
          <div className="col-span-2"><label className="form-label">Additional Notes</label><textarea className="form-input" rows={2} value={form.notes} onChange={e => up('notes', e.target.value)} /></div>
        </div>
        <div className="flex gap-3">
          <Link href="/referrals" className="btn-outline flex-1 justify-center">Cancel</Link>
          <button type="submit" className="btn-primary flex-1 justify-center"><Save size={15} /> Create Referral</button>
        </div>
      </form>
    </div>
  );
}
