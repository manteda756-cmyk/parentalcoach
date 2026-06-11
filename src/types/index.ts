export type UserRole = 'admin' | 'supervisor' | 'health_worker' | 'data_clerk' | 'viewer';
export type Language = 'en' | 'am';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  region: string;
  woreda: string;
  kebele: string;
  avatar?: string;
  createdAt: string;
}

export interface Household {
  id: string;
  registrationNumber: string;
  houseNumber: string;
  headName: string;
  phone: string;
  region: string;
  woreda: string;
  kebele: string;
  gpsLat?: number;
  gpsLng?: number;
  vulnerabilityStatus: 'none' | 'low' | 'medium' | 'high';
  programs: string[];
  membersCount: number;
  registeredBy: string;
  registeredAt: string;
  qrCode?: string;
}

export type RiskLevel = 'low' | 'medium' | 'high';
export type MaternalStatus = 'pregnant' | 'lactating' | 'both';
export type ReferralStatus = 'pending' | 'in_progress' | 'completed';

export interface MaternalRecord {
  id: string;
  householdId: string;
  name: string;
  age: number;
  phone: string;
  status: MaternalStatus;
  gestationalAge?: number;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  ancVisits: number;
  pncVisits: number;
  depressionScreening: 'not_done' | 'normal' | 'at_risk' | 'positive';
  ironFolicSupplementation: boolean;
  familySupport: 'good' | 'moderate' | 'poor';
  nutritionStatus: 'normal' | 'malnourished' | 'obese';
  riskLevel: RiskLevel;
  referrals: Referral[];
  nextAppointment?: string;
  missedAppointments: number;
  registeredBy: string;
  registeredAt: string;
  region: string;
  woreda: string;
  kebele: string;
  notes?: string;
}

export interface ChildRecord {
  id: string;
  householdId: string;
  name: string;
  sex: 'male' | 'female';
  dateOfBirth: string;
  ageMonths: number;
  caregiverName: string;
  caregiverPhone: string;
  vaccinationStatus: VaccinationRecord[];
  nutritionStatus: 'normal' | 'mam' | 'sam' | 'overweight';
  muac?: number;
  weight?: number;
  height?: number;
  developmentalMilestones: DevelopmentalMilestone[];
  disabilityScreening: 'none' | 'suspected' | 'confirmed';
  childProtectionFlags: string[];
  referrals: Referral[];
  nextAppointment?: string;
  riskLevel: RiskLevel;
  registeredBy: string;
  registeredAt: string;
  region: string;
  woreda: string;
  kebele: string;
}

export interface VaccinationRecord {
  vaccine: string;
  dueDate: string;
  givenDate?: string;
  status: 'due' | 'given' | 'overdue' | 'missed';
}

export interface DevelopmentalMilestone {
  milestone: string;
  expectedAgeMonths: number;
  achievedAt?: number;
  status: 'achieved' | 'pending' | 'delayed';
}

export interface Referral {
  id: string;
  patientId: string;
  patientType: 'maternal' | 'child';
  patientName: string;
  referralDate: string;
  reason: string;
  referredTo: string;
  serviceReceived?: string;
  followUpDate?: string;
  outcome?: string;
  status: ReferralStatus;
  referredBy: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientType: 'maternal' | 'child';
  patientName: string;
  date: string;
  time: string;
  type: string;
  healthWorker: string;
  status: 'scheduled' | 'completed' | 'missed' | 'cancelled';
  notes?: string;
  reminders: ('sms' | 'whatsapp' | 'email')[];
}

export interface DashboardStats {
  totalHouseholds: number;
  pregnantWomen: number;
  lactatingMothers: number;
  childrenUnder5: number;
  highRiskCases: number;
  pendingReferrals: number;
  upcomingAppointments: number;
  missedAppointments: number;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface ReportFilter {
  dateFrom: string;
  dateTo: string;
  region?: string;
  woreda?: string;
  healthWorker?: string;
  reportType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
}
