'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Save, Send, AlertTriangle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useData } from '@/context/DataContext';
import { useApp } from '@/context/AppContext';
import { useVisits } from '@/context/VisitContext';
import { createClient } from '@/lib/supabase/client';
import RiskFlagAlert from '@/components/ui/RiskFlagAlert';
import type {
  MaternalVisitSection, ChildVisitSection, RiskFlag,
  YesNo, YesNoNA, EarlyStimulationScore, NutritionalStatusVisit,
  DisabilityCategory, MilestoneStatus,
} from '@/types';

const STEPS = ['Household', 'Maternal', 'Child', 'Review'];

function YNToggle({ value, onChange, options = ['yes', 'no'] }: { value: string; onChange: (v: string) => void; options?: string[] }) {
  return (
    <div className="flex gap-2">
      {options.map(o => (
        <button type="button" key={o} onClick={() => onChange(o)}
          className={`px-4 py-1.5 rounded-lg border-2 text-xs font-bold uppercase transition-all ${value === o ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
          {o}
        </button>
      ))}
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 gap-4">
      <span className="text-sm text-slate-600 flex-1">{label}</span>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function ScoreToggle({ value, onChange }: { value: EarlyStimulationScore; onChange: (v: EarlyStimulationScore) => void }) {
  return (
    <div className="flex gap-1.5">
      {([{ v: 0, label: '0' }, { v: 1, label: '1' }, { v: 2, label: '2' }] as { v: EarlyStimulationScore; label: string }[]).map(o => (
        <button type="button" key={o.v} onClick={() => onChange(o.v)}
          className={`px-3 py-1 rounded-lg border text-xs font-semibold transition-all ${value === o.v ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 text-slate-500'}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function defaultMaternal(maternalRecordId: string): MaternalVisitSection {
  return {
    maternalRecordId, maternalStatus: 'p',
    ancPncFollowUpStarted: 'na', ancFollowUpDropped: 'na',
    substanceUse: 'no', signsOfDepression: 'no',
    diverseDietExtraMeal: 'yes', ironFolicAcid: 'na',
    partnerFamilySupport: 'yes', signsOfViolence: 'no',
    referred: 'no', nextAppointmentDate: '',
  };
}

function defaultChild(childRecordId: string): ChildVisitSection {
  return {
    childRecordId,
    earlyStimulation: { talksSings: 0, plays: 0, tellsStoriesReads: 0, playsOutdoors: 0 },
    understandsChildNeeds: 'yes', positiveDiscipline: 'yes',
    vaccinationUpToDate: 'na',
    feedingPractice: { exclusiveBreastfeeding: 'no', complementaryFeeding: 'no', balancedDiet: 'no' },
    nutritionalStatus: 'n', signsOfAbuseViolence: 'no',
    hasToy: 'no', referred: 'no',
    disabilityCategories: [], riskFactorsForDevelopment: 'no',
    nextAppointmentDate: '',
  };
}

function computeRiskFlags(maternal: MaternalVisitSection | undefined, children: ChildVisitSection[]): RiskFlag[] {
  const flags: RiskFlag[] = [];
  if (maternal) {
    if (maternal.signsOfDepression === 'yes') flags.push({ type: 'depression', priority: 'high', description: 'Signs of depression', relatedRecordId: maternal.maternalRecordId });
    if (maternal.signsOfViolence === 'yes') flags.push({ type: 'violence', priority: 'high', description: 'Signs of violence', relatedRecordId: maternal.maternalRecordId });
  }
  children.forEach(c => {
    if (c.nutritionalStatus === 'sam') flags.push({ type: 'sam', priority: 'high', description: 'SAM', relatedRecordId: c.childRecordId });
    if (c.nutritionalStatus === 'mam') flags.push({ type: 'mam', priority: 'medium', description: 'MAM', relatedRecordId: c.childRecordId });
    if (c.signsOfAbuseViolence === 'yes') flags.push({ type: 'child_violence', priority: 'high', description: 'Abuse/violence', relatedRecordId: c.childRecordId });
    if (c.milestoneAssessment && Object.values(c.milestoneAssessment).some(v => v === 'dd'))
      flags.push({ type: 'developmental_delay', priority: 'medium', description: 'Developmental delay', relatedRecordId: c.childRecordId });
  });
  return flags;
}

export default function NewVisitForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { currentUser } = useApp();
  const preselectedHHId = params.get('householdId') ?? '';

  const [step, setStep] = useState(0);
  const [householdId, setHouseholdId] = useState(preselectedHHId);
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [vulnerability, setVulnerability] = useState<YesNo>('no');
  const [psnp, setPsnp] = useState<YesNo>('no');
  const [cbhi, setCbhi] = useState<'free' | 'paid' | 'no'>('no');
  const [tds, setTds] = useState<YesNo>('no');
  const [includeMaternal, setIncludeMaternal] = useState(false);
  const [maternalSection, setMaternalSection] = useState<MaternalVisitSection | null>(null);
  const [childSections, setChildSections] = useState<ChildVisitSection[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const { households, maternalRecords, children: allChildren } = useData();
  const { addVisitReport } = useVisits();
  const household = households.find(h => h.id === householdId);
  const householdMother = maternalRecords.find(m => m.householdId === householdId);
  const householdChildren = allChildren.filter(c => c.householdId === householdId);

  // Restore draft from localStorage
  useEffect(() => {
    if (!householdId) return;
    try {
      const raw = localStorage.getItem(`draft_visit_${householdId}`);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.visitDate) setVisitDate(d.visitDate);
        if (d.vulnerability) setVulnerability(d.vulnerability);
        if (d.psnp) setPsnp(d.psnp);
        if (d.cbhi) setCbhi(d.cbhi);
        if (d.tds) setTds(d.tds);
        if (d.maternalSection) { setMaternalSection(d.maternalSection); setIncludeMaternal(true); }
        if (d.childSections?.length) setChildSections(d.childSections);
      }
    } catch { /* ignore */ }
  }, [householdId]);

  const riskFlags = computeRiskFlags(maternalSection ?? undefined, childSections);

  const saveDraft = () => {
    if (!householdId) { alert('Please select a household first.'); return; }
    localStorage.setItem(`draft_visit_${householdId}`, JSON.stringify({
      visitDate, vulnerability, psnp, cbhi, tds, maternalSection, childSections, savedAt: new Date().toISOString(),
    }));
    alert('Draft saved successfully!');
  };

  const validate = (): boolean => {
    const errs: string[] = [];
    if (!householdId) errs.push('Please select a household.');
    if (!visitDate) errs.push('Visit date is required.');
    if (visitDate && new Date(visitDate) > new Date()) errs.push('Visit date cannot be in the future.');
    if (includeMaternal && maternalSection) {
      if (maternalSection.substanceUse === 'yes' && !maternalSection.substanceSpecification?.trim())
        errs.push('Maternal: Substance type must be specified.');
      if (maternalSection.referred === 'yes' && !maternalSection.referralReasons?.length)
        errs.push('Maternal: At least one referral reason must be selected.');
      if (!maternalSection.nextAppointmentDate)
        errs.push('Maternal: Next appointment date is required.');
    }
    childSections.forEach((c, i) => {
      if (c.signsOfAbuseViolence === 'yes' && !c.abuseSpecification?.trim())
        errs.push(`Child ${i + 1}: Abuse/violence specification is required.`);
      if (c.referred === 'yes' && !c.referralReasons?.length)
        errs.push(`Child ${i + 1}: At least one referral reason must be selected.`);
      if (!c.nextAppointmentDate)
        errs.push(`Child ${i + 1}: Next appointment date is required.`);
    });
    setErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!currentUser) { setSubmitError('Not authenticated.'); return; }
    setSubmitting(true);
    setSubmitError('');
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = createClient() as any;
      const flags = computeRiskFlags(maternalSection ?? undefined, childSections);

      // Determine next visit number for this household
      const { data: existing } = await sb
        .from('visit_reports')
        .select('visit_number')
        .eq('household_id', householdId)
        .order('visit_number', { ascending: false })
        .limit(1);
      const nextVisitNumber = existing && existing.length > 0 ? existing[0].visit_number + 1 : 1;

      const { data: inserted, error: insertError } = await sb
        .from('visit_reports')
        .insert({
          household_id:         householdId,
          visit_number:         nextVisitNumber,
          visit_date:           visitDate,
          status:               'submitted',
          vulnerability_status: vulnerability,
          psnp_enrollment:      psnp,
          cbhi_status:          cbhi,
          tds_status:           tds,
          maternal_section:     includeMaternal && maternalSection ? maternalSection : null,
          child_sections:       childSections,
          risk_flags:           flags,
          hew_id:               currentUser.id,
          submitted_at:         new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        setSubmitError(`Failed to submit: ${insertError.message}`);
        setSubmitting(false);
        return;
      }

      // Add to local state so list updates immediately without full refresh
      addVisitReport({
        id:                  inserted.id,
        householdId:         inserted.household_id,
        visitNumber:         inserted.visit_number,
        visitDate:           inserted.visit_date,
        status:              inserted.status,
        vulnerabilityStatus: inserted.vulnerability_status,
        psnpEnrollment:      inserted.psnp_enrollment,
        cbhiStatus:          inserted.cbhi_status,
        tdsStatus:           inserted.tds_status,
        maternalSection:     inserted.maternal_section ?? undefined,
        childSections:       inserted.child_sections ?? [],
        riskFlags:           inserted.risk_flags ?? [],
        hewId:               inserted.hew_id,
        submittedAt:         inserted.submitted_at ?? undefined,
        createdAt:           inserted.created_at,
        updatedAt:           inserted.updated_at,
      });

      if (householdId) localStorage.removeItem(`draft_visit_${householdId}`);
      router.push('/visits');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
      setSubmitting(false);
    }
  };

  const updateMaternal = (patch: Partial<MaternalVisitSection>) =>
    setMaternalSection(prev => prev ? { ...prev, ...patch } : null);

  const updateChild = (idx: number, patch: Partial<ChildVisitSection>) =>
    setChildSections(prev => prev.map((c, i) => i === idx ? { ...c, ...patch } : c));

  const addChild = (childRecordId: string) => {
    if (!childSections.find(c => c.childRecordId === childRecordId))
      setChildSections(prev => [...prev, defaultChild(childRecordId)]);
  };

  const removeChild = (childRecordId: string) =>
    setChildSections(prev => prev.filter(c => c.childRecordId !== childRecordId));

  const toggleChildRef = (idx: number, reason: string) => {
    const reasons = (childSections[idx].referralReasons ?? []) as string[];
    const next = reasons.includes(reason) ? reasons.filter(r => r !== reason) : [...reasons, reason];
    updateChild(idx, { referralReasons: next as ChildVisitSection['referralReasons'] });
  };

  const toggleMaternalRef = (reason: string) => {
    if (!maternalSection) return;
    const reasons = (maternalSection.referralReasons ?? []) as string[];
    const next = reasons.includes(reason) ? reasons.filter(r => r !== reason) : [...reasons, reason];
    updateMaternal({ referralReasons: next as MaternalVisitSection['referralReasons'] });
  };

  const toggleDisability = (idx: number, cat: DisabilityCategory) => {
    const cats = childSections[idx].disabilityCategories;
    updateChild(idx, { disabilityCategories: cats.includes(cat) ? cats.filter(x => x !== cat) : [...cats, cat] });
  };

  const DISABILITY_LABELS: Record<DisabilityCategory, string> = {
    md: 'Motor', hd: 'Hearing', vd: 'Visual', pd: 'Physical', pp: 'Psycho-social', nd: 'Neurological',
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/visits" className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <ChevronLeft size={20} className="text-slate-600" />
        </Link>
        <div>
          <h1 className="page-title">New Visit Report</h1>
          <p className="text-slate-500 text-sm">Appendix #1 — Bi-weekly Household Visit</p>
        </div>
      </div>

      {/* Step progress */}
      <div className="section-card py-4">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <button type="button" onClick={() => i < step && setStep(i)} className="flex flex-col items-center gap-1">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${i < step ? 'bg-blue-600 text-white' : i === step ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-slate-100 text-slate-400'}`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-xs font-semibold ${i <= step ? 'text-blue-600' : 'text-slate-400'}`}>{s}</span>
              </button>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-blue-600' : 'bg-slate-200'}`} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Step 1: Household ── */}
      {step === 0 && (
        <div className="section-card space-y-5">
          <h2 className="font-bold text-slate-800">Household Information</h2>
          <div>
            <label className="form-label">Select Household *</label>
            <select className="form-input" value={householdId} onChange={e => setHouseholdId(e.target.value)}>
              <option value="">— Select a household —</option>
              {households.map(h => (
                <option key={h.id} value={h.id}>{h.registrationNumber} — {h.headName}</option>
              ))}
            </select>
          </div>

          {household && (
            <div className="bg-blue-50 rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
              {[
                { label: 'Reg. Number', value: household.registrationNumber },
                { label: 'House No.', value: household.houseNumber },
                { label: 'Head Name', value: household.headName },
                { label: 'Phone', value: household.phone },
                { label: 'Kebele', value: household.kebele },
                { label: 'Woreda', value: household.woreda },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <p className="font-semibold text-slate-800">{item.value}</p>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Visit Date *</label>
              <input type="date" className="form-input" value={visitDate}
                onChange={e => setVisitDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <label className="form-label">Health Worker</label>
              <input className="form-input bg-slate-50" readOnly value={currentUser?.name ?? ''} />
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 space-y-0">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Program Enrollment</p>
            <FieldRow label="Household Vulnerability"><YNToggle value={vulnerability} onChange={v => setVulnerability(v as YesNo)} /></FieldRow>
            <FieldRow label="PSNP Enrollment"><YNToggle value={psnp} onChange={v => setPsnp(v as YesNo)} /></FieldRow>
            <FieldRow label="CBHI Status">
              <div className="flex gap-2">
                {(['free', 'paid', 'no'] as const).map(o => (
                  <button type="button" key={o} onClick={() => setCbhi(o)}
                    className={`px-3 py-1.5 rounded-lg border-2 text-xs font-bold uppercase ${cbhi === o ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500'}`}>
                    {o}
                  </button>
                ))}
              </div>
            </FieldRow>
            <FieldRow label="TDS Status"><YNToggle value={tds} onChange={v => setTds(v as YesNo)} /></FieldRow>
          </div>
        </div>
      )}

      {/* ── Step 2: Maternal ── */}
      {step === 1 && (
        <div className="section-card space-y-5">
          <h2 className="font-bold text-slate-800">Maternal Section</h2>
          {!householdMother ? (
            <div className="bg-slate-50 rounded-xl p-6 text-center text-slate-500 text-sm">
              No maternal record linked to this household. Skip to next step.
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <div className="bg-pink-50 rounded-xl p-3 flex-1">
                  <p className="font-semibold text-slate-800">{householdMother.name}</p>
                  <p className="text-xs text-slate-500">Age {householdMother.age} · {householdMother.status}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Include?</span>
                  <YNToggle value={includeMaternal ? 'yes' : 'no'} onChange={v => {
                    const incl = v === 'yes';
                    setIncludeMaternal(incl);
                    if (incl && !maternalSection) setMaternalSection(defaultMaternal(householdMother.id));
                  }} />
                </div>
              </div>

              {includeMaternal && maternalSection && (
                <div className="space-y-4">
                  <div>
                    <label className="form-label">Maternal Status</label>
                    <div className="flex gap-2">
                      {([['p', 'Pregnant'], ['pn', 'Postnatal'], ['l', 'Lactating']] as [string, string][]).map(([v, l]) => (
                        <button type="button" key={v} onClick={() => updateMaternal({ maternalStatus: v as MaternalVisitSection['maternalStatus'] })}
                          className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${maternalSection.maternalStatus === v ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-slate-200 text-slate-500'}`}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 space-y-0">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Counseling Indicators</p>
                    <FieldRow label="ANC/PNC Follow-up Started"><YNToggle value={maternalSection.ancPncFollowUpStarted} onChange={v => updateMaternal({ ancPncFollowUpStarted: v as YesNoNA })} options={['yes', 'no', 'na']} /></FieldRow>
                    <FieldRow label="ANC Follow-up Dropped"><YNToggle value={maternalSection.ancFollowUpDropped} onChange={v => updateMaternal({ ancFollowUpDropped: v as YesNoNA })} options={['yes', 'no', 'na']} /></FieldRow>
                    <FieldRow label="Substance Use (alcohol/smoke/drugs)"><YNToggle value={maternalSection.substanceUse} onChange={v => updateMaternal({ substanceUse: v as YesNo })} /></FieldRow>
                    {maternalSection.substanceUse === 'yes' && (
                      <div className="pb-2">
                        <label className="form-label mt-2">Specify substance *</label>
                        <input className="form-input" value={maternalSection.substanceSpecification ?? ''} onChange={e => updateMaternal({ substanceSpecification: e.target.value })} placeholder="e.g. alcohol, tobacco" />
                      </div>
                    )}
                    <FieldRow label="Signs of Maternal Depression"><YNToggle value={maternalSection.signsOfDepression} onChange={v => updateMaternal({ signsOfDepression: v as YesNo })} /></FieldRow>
                    <FieldRow label="Diverse Diet & Extra Meal"><YNToggle value={maternalSection.diverseDietExtraMeal} onChange={v => updateMaternal({ diverseDietExtraMeal: v as YesNo })} /></FieldRow>
                    <FieldRow label="Iron/Folic Acid Supplementation"><YNToggle value={maternalSection.ironFolicAcid} onChange={v => updateMaternal({ ironFolicAcid: v as YesNoNA })} options={['yes', 'no', 'na']} /></FieldRow>
                    <FieldRow label="Partner/Family Support"><YNToggle value={maternalSection.partnerFamilySupport} onChange={v => updateMaternal({ partnerFamilySupport: v as YesNo })} /></FieldRow>
                    <FieldRow label="Signs of Violence"><YNToggle value={maternalSection.signsOfViolence} onChange={v => updateMaternal({ signsOfViolence: v as YesNo })} /></FieldRow>
                  </div>

                  {maternalSection.maternalStatus === 'p' && (
                    <div className="bg-purple-50 rounded-xl p-4 space-y-0">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Prenatal Stimulation</p>
                      <FieldRow label="Talking / Singing to baby">
                        <YNToggle value={maternalSection.earlyStimulation?.talkingSinging ?? 'no'}
                          onChange={v => updateMaternal({ earlyStimulation: { talkingSinging: v as YesNo, fetalMovementMonitoring: maternalSection.earlyStimulation?.fetalMovementMonitoring ?? 'no', bellyMassage: maternalSection.earlyStimulation?.bellyMassage ?? 'no' } })} />
                      </FieldRow>
                      <FieldRow label="Monitoring Fetal Movements">
                        <YNToggle value={maternalSection.earlyStimulation?.fetalMovementMonitoring ?? 'no'}
                          onChange={v => updateMaternal({ earlyStimulation: { talkingSinging: maternalSection.earlyStimulation?.talkingSinging ?? 'no', fetalMovementMonitoring: v as YesNo, bellyMassage: maternalSection.earlyStimulation?.bellyMassage ?? 'no' } })} />
                      </FieldRow>
                      <FieldRow label="Belly Massage">
                        <YNToggle value={maternalSection.earlyStimulation?.bellyMassage ?? 'no'}
                          onChange={v => updateMaternal({ earlyStimulation: { talkingSinging: maternalSection.earlyStimulation?.talkingSinging ?? 'no', fetalMovementMonitoring: maternalSection.earlyStimulation?.fetalMovementMonitoring ?? 'no', bellyMassage: v as YesNo } })} />
                      </FieldRow>
                    </div>
                  )}

                  <div className="bg-orange-50 rounded-xl p-4 space-y-3">
                    <FieldRow label="Referred for Other Services"><YNToggle value={maternalSection.referred} onChange={v => updateMaternal({ referred: v as YesNo })} /></FieldRow>
                    {maternalSection.referred === 'yes' && (
                      <div>
                        <p className="form-label">Referral Reasons *</p>
                        <div className="flex gap-2 flex-wrap mt-1">
                          {(['anc', 'pnc', 'depression', 'violence'] as const).map(r => (
                            <button type="button" key={r} onClick={() => toggleMaternalRef(r)}
                              className={`px-3 py-1.5 rounded-lg border-2 text-xs font-bold uppercase ${(maternalSection.referralReasons ?? []).includes(r) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500'}`}>
                              {r}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="form-label">Next Appointment Date *</label>
                    <input type="date" className="form-input" value={maternalSection.nextAppointmentDate}
                      onChange={e => updateMaternal({ nextAppointmentDate: e.target.value })} min={visitDate} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Step 3: Children ── */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="section-card">
            <h2 className="font-bold text-slate-800 mb-4">Select Children to Include</h2>
            {householdChildren.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-6">No children under 6 registered for this household.</p>
            ) : (
              <div className="space-y-2">
                {householdChildren.map(child => {
                  const included = !!childSections.find(c => c.childRecordId === child.id);
                  return (
                    <div key={child.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{child.name}</p>
                        <p className="text-xs text-slate-400">{child.sex} · {child.ageMonths} months</p>
                      </div>
                      <YNToggle value={included ? 'yes' : 'no'} onChange={v => v === 'yes' ? addChild(child.id) : removeChild(child.id)} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {childSections.map((cs, idx) => {
            const child = householdChildren.find(c => c.id === cs.childRecordId);
            if (!child) return null;
            const DISABILITIES: DisabilityCategory[] = ['md', 'hd', 'vd', 'pd', 'pp', 'nd'];

            return (
              <div key={cs.childRecordId} className="section-card space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <span className="font-bold text-emerald-700">{child.name[0]}</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{child.name}</p>
                    <p className="text-xs text-slate-400">{child.sex} · {child.ageMonths}m · Caregiver: {child.caregiverName}</p>
                  </div>
                </div>

                {/* Early Stimulation */}
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Early Stimulation (0=Never 1=Sometimes 2=Regular)</p>
                  {(['talksSings', 'plays', 'tellsStoriesReads', 'playsOutdoors'] as const).map(key => {
                    const labels: Record<string, string> = { talksSings: 'Talks / Sings to child', plays: 'Plays with child', tellsStoriesReads: 'Tells stories / Reads', playsOutdoors: 'Plays outdoors' };
                    return (
                      <FieldRow key={key} label={labels[key]}>
                        <ScoreToggle value={cs.earlyStimulation[key]} onChange={v => updateChild(idx, { earlyStimulation: { ...cs.earlyStimulation, [key]: v } })} />
                      </FieldRow>
                    );
                  })}
                </div>

                {/* Health indicators */}
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Health Indicators</p>
                  <FieldRow label="Caregiver understands child needs"><YNToggle value={cs.understandsChildNeeds} onChange={v => updateChild(idx, { understandsChildNeeds: v as YesNo })} /></FieldRow>
                  <FieldRow label="Positive discipline practices"><YNToggle value={cs.positiveDiscipline} onChange={v => updateChild(idx, { positiveDiscipline: v as YesNo })} /></FieldRow>
                  <FieldRow label="Vaccination up to date"><YNToggle value={cs.vaccinationUpToDate} onChange={v => updateChild(idx, { vaccinationUpToDate: v as YesNoNA })} options={['yes', 'no', 'na']} /></FieldRow>
                  <FieldRow label="Nutritional Status">
                    <div className="flex gap-1.5">
                      {(['n', 'mam', 'sam', 'na'] as NutritionalStatusVisit[]).map(s => (
                        <button type="button" key={s} onClick={() => updateChild(idx, { nutritionalStatus: s })}
                          className={`px-3 py-1 rounded-lg border-2 text-xs font-bold uppercase ${cs.nutritionalStatus === s ? s === 'sam' ? 'border-red-500 bg-red-50 text-red-700' : s === 'mam' ? 'border-yellow-500 bg-yellow-50 text-yellow-700' : 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 text-slate-500'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </FieldRow>
                </div>

                {/* Feeding */}
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Feeding Practice</p>
                  <FieldRow label="Exclusive Breastfeeding"><YNToggle value={cs.feedingPractice.exclusiveBreastfeeding} onChange={v => updateChild(idx, { feedingPractice: { ...cs.feedingPractice, exclusiveBreastfeeding: v as YesNo } })} /></FieldRow>
                  <FieldRow label="Complementary Feeding"><YNToggle value={cs.feedingPractice.complementaryFeeding} onChange={v => updateChild(idx, { feedingPractice: { ...cs.feedingPractice, complementaryFeeding: v as YesNo } })} /></FieldRow>
                  <FieldRow label="Balanced Diet"><YNToggle value={cs.feedingPractice.balancedDiet} onChange={v => updateChild(idx, { feedingPractice: { ...cs.feedingPractice, balancedDiet: v as YesNo } })} /></FieldRow>
                </div>

                {/* Child protection */}
                <div className="bg-red-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Child Protection</p>
                  <FieldRow label="Signs of Abuse / Violence"><YNToggle value={cs.signsOfAbuseViolence} onChange={v => updateChild(idx, { signsOfAbuseViolence: v as YesNo })} /></FieldRow>
                  {cs.signsOfAbuseViolence === 'yes' && (
                    <div className="pt-2">
                      <label className="form-label">Specify *</label>
                      <input className="form-input" value={cs.abuseSpecification ?? ''} onChange={e => updateChild(idx, { abuseSpecification: e.target.value })} />
                    </div>
                  )}
                  <FieldRow label="Has a Toy at Home"><YNToggle value={cs.hasToy} onChange={v => updateChild(idx, { hasToy: v as YesNo })} /></FieldRow>
                  {cs.hasToy === 'yes' && (
                    <FieldRow label="Toy Type"><YNToggle value={cs.toyType ?? 'homemade'} onChange={v => updateChild(idx, { toyType: v as 'homemade' | 'purchased' })} options={['homemade', 'purchased']} /></FieldRow>
                  )}
                  <FieldRow label="Risk Factors for Development"><YNToggle value={cs.riskFactorsForDevelopment} onChange={v => updateChild(idx, { riskFactorsForDevelopment: v as YesNo })} /></FieldRow>
                </div>

                {/* Disability screening */}
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Disability Screening</p>
                  <div className="flex gap-2 flex-wrap">
                    {DISABILITIES.map(cat => (
                      <button type="button" key={cat} onClick={() => toggleDisability(idx, cat)}
                        className={`px-3 py-1.5 rounded-lg border-2 text-xs font-bold uppercase ${cs.disabilityCategories.includes(cat) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500'}`}>
                        {DISABILITY_LABELS[cat]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Milestones — shown every 2 months cycle */}
                {child.ageMonths % 2 === 0 && (
                  <div className="bg-purple-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Developmental Milestones</p>
                    {['Gross Motor', 'Fine Motor', 'Language', 'Social-Emotional'].map(m => (
                      <FieldRow key={m} label={m}>
                        <div className="flex gap-1.5">
                          {([['n', 'N'], ['sd', 'SD'], ['dd', 'DD']] as [MilestoneStatus, string][]).map(([v, l]) => (
                            <button type="button" key={v} onClick={() => updateChild(idx, { milestoneAssessment: { ...(cs.milestoneAssessment ?? {}), [m]: v } })}
                              className={`px-3 py-1 rounded-lg border-2 text-xs font-bold ${(cs.milestoneAssessment?.[m] ?? 'n') === v ? v === 'dd' ? 'border-red-500 bg-red-50 text-red-700' : v === 'sd' ? 'border-yellow-500 bg-yellow-50 text-yellow-700' : 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 text-slate-500'}`}>
                              {l}
                            </button>
                          ))}
                        </div>
                      </FieldRow>
                    ))}
                  </div>
                )}

                {/* Referral */}
                <div className="bg-orange-50 rounded-xl p-4 space-y-3">
                  <FieldRow label="Referred for Services"><YNToggle value={cs.referred} onChange={v => updateChild(idx, { referred: v as YesNo })} /></FieldRow>
                  {cs.referred === 'yes' && (
                    <div>
                      <p className="form-label">Referral Reasons *</p>
                      <div className="flex gap-2 flex-wrap mt-1">
                        {(['vitamin_a', 'deworming', 'malnutrition', 'developmental_delay', 'abuse_violence', 'hospital', 'other'] as const).map(r => (
                          <button type="button" key={r} onClick={() => toggleChildRef(idx, r)}
                            className={`px-3 py-1.5 rounded-lg border-2 text-xs font-bold uppercase ${(cs.referralReasons ?? []).includes(r) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500'}`}>
                            {r.replace(/_/g, ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="form-label">Next Appointment Date *</label>
                  <input type="date" className="form-input" value={cs.nextAppointmentDate}
                    onChange={e => updateChild(idx, { nextAppointmentDate: e.target.value })} min={visitDate} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Step 4: Review ── */}
      {step === 3 && (
        <div className="space-y-4">
          <RiskFlagAlert flags={riskFlags} />

          {riskFlags.some(f => f.priority === 'high') && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
              <AlertTriangle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-semibold">
                This report has high-priority risk flags. Your supervisor will be urgently notified upon submission.
              </p>
            </div>
          )}

          <div className="section-card space-y-4">
            <h2 className="font-bold text-slate-800">Report Summary</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: 'Household', value: household?.headName ?? householdId },
                { label: 'Reg. Number', value: household?.registrationNumber ?? '—' },
                { label: 'Visit Date', value: visitDate },
                { label: 'HEW', value: currentUser?.name ?? '—' },
                { label: 'Vulnerability', value: vulnerability.toUpperCase() },
                { label: 'PSNP', value: psnp.toUpperCase() },
                { label: 'CBHI', value: cbhi.toUpperCase() },
                { label: 'TDS', value: tds.toUpperCase() },
              ].map(item => (
                <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <p className="font-semibold text-slate-800">{item.value}</p>
                </div>
              ))}
            </div>

            {includeMaternal && maternalSection && (
              <div className="border-t border-slate-100 pt-4">
                <p className="text-sm font-bold text-slate-700 mb-2">Maternal Section</p>
                <div className="grid grid-cols-3 gap-2 text-xs text-slate-600">
                  <span>Status: <strong>{maternalSection.maternalStatus.toUpperCase()}</strong></span>
                  <span>Depression: <strong className={maternalSection.signsOfDepression === 'yes' ? 'text-red-600' : ''}>{maternalSection.signsOfDepression.toUpperCase()}</strong></span>
                  <span>Violence: <strong className={maternalSection.signsOfViolence === 'yes' ? 'text-red-600' : ''}>{maternalSection.signsOfViolence.toUpperCase()}</strong></span>
                  <span>IFA: <strong>{maternalSection.ironFolicAcid.toUpperCase()}</strong></span>
                  <span>Referred: <strong>{maternalSection.referred.toUpperCase()}</strong></span>
                  <span>Next Appt: <strong>{maternalSection.nextAppointmentDate || '—'}</strong></span>
                </div>
              </div>
            )}

            {childSections.map(cs => {
              const child = householdChildren.find(c => c.id === cs.childRecordId);
              return (
                <div key={cs.childRecordId} className="border-t border-slate-100 pt-4">
                  <p className="text-sm font-bold text-slate-700 mb-2">Child: {child?.name}</p>
                  <div className="grid grid-cols-3 gap-2 text-xs text-slate-600">
                    <span>Nutrition: <strong className={cs.nutritionalStatus === 'sam' ? 'text-red-600' : cs.nutritionalStatus === 'mam' ? 'text-yellow-600' : ''}>{cs.nutritionalStatus.toUpperCase()}</strong></span>
                    <span>Abuse: <strong className={cs.signsOfAbuseViolence === 'yes' ? 'text-red-600' : ''}>{cs.signsOfAbuseViolence.toUpperCase()}</strong></span>
                    <span>Vaccination: <strong>{cs.vaccinationUpToDate.toUpperCase()}</strong></span>
                    <span>Referred: <strong>{cs.referred.toUpperCase()}</strong></span>
                    <span>Disabilities: <strong>{cs.disabilityCategories.length ? cs.disabilityCategories.join(', ').toUpperCase() : 'None'}</strong></span>
                    <span>Next Appt: <strong>{cs.nextAppointmentDate || '—'}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>

          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm font-bold text-red-700 mb-2">Fix the following before submitting:</p>
              <ul className="space-y-1">
                {errors.map((e, i) => <li key={i} className="text-sm text-red-600">• {e}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 justify-between pb-8">
        <button type="button" onClick={() => step > 0 ? setStep(s => s - 1) : router.push('/visits')} className="btn-outline">
          {step === 0 ? 'Cancel' : '← Back'}
        </button>
        <div className="flex gap-2 flex-col items-end">
          {submitError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">{submitError}</p>
          )}
          <div className="flex gap-2">
            <button type="button" onClick={saveDraft} className="btn-outline">
              <Save size={15} /> Save Draft
            </button>
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={() => setStep(s => s + 1)} disabled={step === 0 && !householdId} className="btn-primary disabled:opacity-50">
                Next →
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} className="btn-secondary" disabled={submitting}>
                {submitting
                  ? <><Loader2 size={15} className="animate-spin" /> Submitting…</>
                  : <><Send size={15} /> Submit to Supervisor</>
                }
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
