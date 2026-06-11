'use client';
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, CheckCircle, RotateCcw, AlertTriangle, User, Calendar, Home } from 'lucide-react';
import Link from 'next/link';
import { mockVisitReports, mockHouseholds, mockUsers, mockMaternalRecords, mockChildren } from '@/lib/mockData';
import { useApp } from '@/context/AppContext';
import { useVisits } from '@/context/VisitContext';
import RiskFlagAlert from '@/components/ui/RiskFlagAlert';
import Badge from '@/components/ui/Badge';
import type { VisitReport } from '@/types';

const STATUS_COLORS: Record<VisitReport['status'], string> = {
  draft: 'default', submitted: 'active', approved: 'completed', returned: 'medium',
};

function ReadRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm font-bold ${highlight ? 'text-red-600' : 'text-slate-800'}`}>{value}</span>
    </div>
  );
}

export default function VisitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { currentUser } = useApp();
  const { visitReports, updateVisitReport } = useVisits();
  const [returnComment, setReturnComment] = useState('');
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [actionDone, setActionDone] = useState<'approved' | 'returned' | null>(null);

  const report = visitReports.find(r => r.id === id);
  if (!report) return (
    <div className="section-card text-center py-16 text-slate-400">
      <p className="text-lg font-semibold">Visit report not found.</p>
      <Link href="/visits" className="btn-primary mt-4 inline-flex">← Back to Visits</Link>
    </div>
  );

  const household = mockHouseholds.find(h => h.id === report.householdId);
  const hew = mockUsers.find(u => u.id === report.hewId);
  const mother = report.maternalSection ? mockMaternalRecords.find(m => m.id === report.maternalSection!.maternalRecordId) : null;
  const isSupervisor = currentUser?.role === 'supervisor' || currentUser?.role === 'admin';
  const canAct = isSupervisor && report.status === 'submitted' && !actionDone;
  const effectiveStatus = actionDone ?? report.status;

  const handleApprove = () => {
    updateVisitReport(report.id, {
      status: 'approved',
      approvedAt: new Date().toISOString().split('T')[0],
      supervisorId: currentUser?.id,
    });
    setActionDone('approved');
    setShowReturnForm(false);
  };

  const handleReturn = () => {
    if (!returnComment.trim()) { alert('Please enter a correction comment.'); return; }
    updateVisitReport(report.id, {
      status: 'returned',
      returnedAt: new Date().toISOString().split('T')[0],
      supervisorComment: returnComment,
      supervisorId: currentUser?.id,
    });
    setActionDone('returned');
    setShowReturnForm(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-xl">
          <ChevronLeft size={20} className="text-slate-600" />
        </button>
        <div className="flex-1">
          <h1 className="page-title">Visit Report #{report.visitNumber}</h1>
          <p className="text-slate-500 text-sm">{household?.headName} · {report.visitDate}</p>
        </div>
        <Badge variant={STATUS_COLORS[effectiveStatus] as 'default'|'active'|'completed'|'medium'}>
          {effectiveStatus}
        </Badge>
      </div>

      {/* Risk flags */}
      <RiskFlagAlert flags={report.riskFlags} />

      {/* Returned comment */}
      {(effectiveStatus === 'returned') && report.supervisorComment && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm font-bold text-yellow-700 mb-1">Supervisor Comment</p>
          <p className="text-sm text-yellow-800">{report.supervisorComment}</p>
        </div>
      )}

      {/* Household info */}
      <div className="section-card">
        <div className="flex items-center gap-2 mb-4">
          <Home size={16} className="text-blue-600" />
          <h2 className="font-bold text-slate-800">Household Information</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          {[
            { label: 'Household', value: household?.headName ?? report.householdId },
            { label: 'Reg. Number', value: household?.registrationNumber ?? '—' },
            { label: 'Visit Date', value: report.visitDate },
            { label: 'Visit Number', value: `#${report.visitNumber}` },
          ].map(item => (
            <div key={item.label} className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400">{item.label}</p>
              <p className="font-semibold text-slate-800">{item.value}</p>
            </div>
          ))}
        </div>
        <ReadRow label="Vulnerability" value={report.vulnerabilityStatus.toUpperCase()} />
        <ReadRow label="PSNP Enrollment" value={report.psnpEnrollment.toUpperCase()} />
        <ReadRow label="CBHI Status" value={report.cbhiStatus.toUpperCase()} />
        <ReadRow label="TDS Status" value={report.tdsStatus.toUpperCase()} />
      </div>

      {/* HEW info */}
      <div className="section-card">
        <div className="flex items-center gap-2 mb-3">
          <User size={16} className="text-slate-500" />
          <h2 className="font-bold text-slate-800">Health Worker</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <span className="font-bold text-blue-700">{hew?.name[0]}</span>
          </div>
          <div>
            <p className="font-semibold text-slate-800">{hew?.name}</p>
            <p className="text-xs text-slate-400">{hew?.role.replace('_',' ')} · Kebele {hew?.kebele}</p>
          </div>
          {report.submittedAt && (
            <div className="ml-auto text-right">
              <p className="text-xs text-slate-400 flex items-center gap-1"><Calendar size={11} /> Submitted</p>
              <p className="text-xs font-semibold text-slate-700">{report.submittedAt}</p>
            </div>
          )}
        </div>
      </div>

      {/* Maternal section */}
      {report.maternalSection && (
        <div className="section-card">
          <h2 className="font-bold text-slate-800 mb-4">Maternal Section</h2>
          {mother && (
            <div className="bg-pink-50 rounded-xl p-3 mb-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-pink-200 rounded-xl flex items-center justify-center">
                <span className="text-pink-700 font-bold text-sm">{mother.name[0]}</span>
              </div>
              <div>
                <p className="font-semibold text-slate-800">{mother.name}</p>
                <p className="text-xs text-slate-400">Age {mother.age} · {report.maternalSection.maternalStatus.toUpperCase()}</p>
              </div>
            </div>
          )}
          <ReadRow label="ANC/PNC Follow-up Started" value={report.maternalSection.ancPncFollowUpStarted.toUpperCase()} />
          <ReadRow label="ANC Follow-up Dropped" value={report.maternalSection.ancFollowUpDropped.toUpperCase()} />
          <ReadRow label="Substance Use" value={report.maternalSection.substanceUse.toUpperCase()} highlight={report.maternalSection.substanceUse === 'yes'} />
          {report.maternalSection.substanceSpecification && <ReadRow label="Substance Type" value={report.maternalSection.substanceSpecification} highlight />}
          <ReadRow label="Signs of Depression" value={report.maternalSection.signsOfDepression.toUpperCase()} highlight={report.maternalSection.signsOfDepression === 'yes'} />
          <ReadRow label="Diverse Diet & Extra Meal" value={report.maternalSection.diverseDietExtraMeal.toUpperCase()} />
          <ReadRow label="Iron / Folic Acid" value={report.maternalSection.ironFolicAcid.toUpperCase()} />
          <ReadRow label="Partner / Family Support" value={report.maternalSection.partnerFamilySupport.toUpperCase()} />
          <ReadRow label="Signs of Violence" value={report.maternalSection.signsOfViolence.toUpperCase()} highlight={report.maternalSection.signsOfViolence === 'yes'} />
          <ReadRow label="Referred" value={report.maternalSection.referred.toUpperCase()} />
          {report.maternalSection.referralReasons?.length && (
            <ReadRow label="Referral Reasons" value={report.maternalSection.referralReasons.join(', ').toUpperCase()} />
          )}
          <ReadRow label="Next Appointment" value={report.maternalSection.nextAppointmentDate} />
        </div>
      )}

      {/* Child sections */}
      {report.childSections.map((cs, i) => {
        const child = mockChildren.find(c => c.id === cs.childRecordId);
        return (
          <div key={cs.childRecordId} className="section-card">
            <h2 className="font-bold text-slate-800 mb-4">Child Section — {child?.name ?? cs.childRecordId}</h2>
            {child && (
              <div className="bg-emerald-50 rounded-xl p-3 mb-4">
                <p className="font-semibold text-slate-800">{child.name}</p>
                <p className="text-xs text-slate-400">{child.sex} · {child.ageMonths} months · Caregiver: {child.caregiverName}</p>
              </div>
            )}
            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Early Stimulation</p>
            <ReadRow label="Talks / Sings" value={String(cs.earlyStimulation.talksSings)} />
            <ReadRow label="Plays" value={String(cs.earlyStimulation.plays)} />
            <ReadRow label="Tells Stories / Reads" value={String(cs.earlyStimulation.tellsStoriesReads)} />
            <ReadRow label="Plays Outdoors" value={String(cs.earlyStimulation.playsOutdoors)} />
            <div className="pt-2">
              <ReadRow label="Understands Child Needs" value={cs.understandsChildNeeds.toUpperCase()} />
              <ReadRow label="Positive Discipline" value={cs.positiveDiscipline.toUpperCase()} />
              <ReadRow label="Vaccination Up to Date" value={cs.vaccinationUpToDate.toUpperCase()} />
              <ReadRow label="Nutritional Status" value={cs.nutritionalStatus.toUpperCase()} highlight={cs.nutritionalStatus === 'sam' || cs.nutritionalStatus === 'mam'} />
              <ReadRow label="Signs of Abuse / Violence" value={cs.signsOfAbuseViolence.toUpperCase()} highlight={cs.signsOfAbuseViolence === 'yes'} />
              {cs.abuseSpecification && <ReadRow label="Abuse Detail" value={cs.abuseSpecification} highlight />}
              <ReadRow label="Has Toy" value={cs.hasToy.toUpperCase()} />
              {cs.toyType && <ReadRow label="Toy Type" value={cs.toyType.toUpperCase()} />}
              <ReadRow label="Risk Factors for Development" value={cs.riskFactorsForDevelopment.toUpperCase()} />
              <ReadRow label="Referred" value={cs.referred.toUpperCase()} />
              {cs.referralReasons?.length && <ReadRow label="Referral Reasons" value={cs.referralReasons.join(', ').replace(/_/g,' ')} />}
              {cs.disabilityCategories.length > 0 && <ReadRow label="Disability Categories" value={cs.disabilityCategories.join(', ').toUpperCase()} highlight />}
              <ReadRow label="Next Appointment" value={cs.nextAppointmentDate} />
            </div>
            {cs.milestoneAssessment && Object.keys(cs.milestoneAssessment).length > 0 && (
              <div className="pt-2">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2 pt-2">Developmental Milestones</p>
                {Object.entries(cs.milestoneAssessment).map(([m, v]) => (
                  <ReadRow key={m} label={m} value={(v as string).toUpperCase()} highlight={v === 'dd'} />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Supervisor action panel */}
      {canAct && (
        <div className="section-card border-2 border-blue-200 bg-blue-50">
          <h2 className="font-bold text-slate-800 mb-4">Supervisor Review</h2>
          {!showReturnForm ? (
            <div className="flex gap-3">
              <button onClick={handleApprove} className="btn-secondary flex-1 justify-center">
                <CheckCircle size={16} /> Approve Report
              </button>
              <button onClick={() => setShowReturnForm(true)} className="btn-outline flex-1 justify-center text-orange-600 border-orange-300 hover:bg-orange-50">
                <RotateCcw size={16} /> Return for Correction
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="form-label">Correction Comment *</label>
                <textarea className="form-input" rows={4} value={returnComment} onChange={e => setReturnComment(e.target.value)} placeholder="Explain what the HEW needs to correct..." />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowReturnForm(false)} className="btn-outline flex-1 justify-center">Cancel</button>
                <button onClick={handleReturn} className="flex-1 justify-center px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm flex items-center gap-2">
                  <RotateCcw size={15} /> Return to HEW
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {actionDone === 'approved' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle size={18} className="text-green-600" />
          <p className="text-sm font-semibold text-green-700">Report approved successfully. HEW has been notified.</p>
        </div>
      )}
      {actionDone === 'returned' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle size={18} className="text-yellow-600" />
          <p className="text-sm font-semibold text-yellow-700">Report returned to {hew?.name} for correction.</p>
        </div>
      )}
    </div>
  );
}
