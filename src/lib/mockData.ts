/**
 * mockData.ts
 *
 * Entity arrays (households, maternal, children, visits, etc.) are empty —
 * all real data comes from Supabase via DataContext / VisitContext.
 *
 * Chart seed data and utility functions are kept here because they are used
 * by the dashboard charts while live analytics are not yet implemented.
 */

import type {
  User, Household, MaternalRecord, ChildRecord,
  Referral, Appointment, DashboardStats,
  VisitReport, Notification, MaternalVisitSection, ChildVisitSection, RiskFlag
} from '@/types';

// ── Empty entity arrays (data lives in Supabase) ─────────────────────────

export const mockUsers: User[]                 = [];
export const mockHouseholds: Household[]       = [];
export const mockMaternalRecords: MaternalRecord[] = [];
export const mockChildren: ChildRecord[]       = [];
export const mockReferrals: Referral[]         = [];
export const mockAppointments: Appointment[]   = [];
export const mockVisitReports: VisitReport[]   = [];
export const mockNotifications: Notification[] = [];

export const mockDashboardStats: DashboardStats = {
  totalHouseholds: 0,
  pregnantWomen: 0,
  lactatingMothers: 0,
  childrenUnder5: 0,
  highRiskCases: 0,
  pendingReferrals: 0,
  upcomingAppointments: 0,
  missedAppointments: 0,
};

// ── Chart seed data (used by dashboard charts) ───────────────────────────

export const monthlyTrendData = [
  { name: 'Jan', households: 0, maternal: 0, children: 0 },
  { name: 'Feb', households: 0, maternal: 0, children: 0 },
  { name: 'Mar', households: 0, maternal: 0, children: 0 },
  { name: 'Apr', households: 0, maternal: 0, children: 0 },
  { name: 'May', households: 0, maternal: 0, children: 0 },
  { name: 'Jun', households: 0, maternal: 0, children: 0 },
];

export const nutritionStatusData = [
  { name: 'Normal',    value: 0, color: '#10b981' },
  { name: 'MAM',       value: 0, color: '#f59e0b' },
  { name: 'SAM',       value: 0, color: '#ef4444' },
  { name: 'Overweight',value: 0, color: '#6366f1' },
];

export const vaccinationCoverageData = [
  { name: 'BCG',      coverage: 0 },
  { name: 'Penta 1',  coverage: 0 },
  { name: 'Penta 2',  coverage: 0 },
  { name: 'Penta 3',  coverage: 0 },
  { name: 'Measles',  coverage: 0 },
  { name: 'Vitamin A',coverage: 0 },
];

export const riskDistributionData = [
  { name: 'Low Risk',    value: 0, color: '#10b981' },
  { name: 'Medium Risk', value: 0, color: '#f59e0b' },
  { name: 'High Risk',   value: 0, color: '#ef4444' },
];

// ── Risk flag computation (used by visit form) ───────────────────────────

export function computeRiskFlags(
  maternal?: MaternalVisitSection,
  children: ChildVisitSection[] = []
): RiskFlag[] {
  const flags: RiskFlag[] = [];

  if (maternal?.signsOfDepression === 'yes')
    flags.push({ type: 'depression', priority: 'high', description: 'Signs of maternal depression recorded', relatedRecordId: maternal.maternalRecordId });
  if (maternal?.signsOfViolence === 'yes')
    flags.push({ type: 'violence', priority: 'high', description: 'Signs of violence recorded for mother', relatedRecordId: maternal.maternalRecordId });

  for (const child of children) {
    if (child.nutritionalStatus === 'sam')
      flags.push({ type: 'sam', priority: 'high', description: 'Severe Acute Malnutrition (SAM) detected', relatedRecordId: child.childRecordId });
    if (child.nutritionalStatus === 'mam')
      flags.push({ type: 'mam', priority: 'medium', description: 'Moderate Acute Malnutrition (MAM) detected', relatedRecordId: child.childRecordId });
    if (child.signsOfAbuseViolence === 'yes')
      flags.push({ type: 'child_violence', priority: 'high', description: 'Signs of abuse or violence recorded for child', relatedRecordId: child.childRecordId });
    for (const [, status] of Object.entries(child.milestoneAssessment ?? {}))
      if (status === 'dd')
        flags.push({ type: 'developmental_delay', priority: 'medium', description: 'Developmental Delay (DD) recorded', relatedRecordId: child.childRecordId });
  }

  return flags;
}

export function getVisitReportsForHousehold(householdId: string): VisitReport[] {
  return mockVisitReports
    .filter(r => r.householdId === householdId)
    .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
}

export function getNextVisitNumber(householdId: string): number {
  return mockVisitReports.filter(r => r.householdId === householdId).length + 1;
}

export function getSubmittedReportsForSupervisor(_supervisorId: string): VisitReport[] {
  return mockVisitReports
    .filter(r => r.status === 'submitted')
    .sort((a, b) => new Date(a.submittedAt ?? a.createdAt).getTime() - new Date(b.submittedAt ?? b.createdAt).getTime());
}
