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

// ── Household Visit Report ──────────────────────────────────────────────────

export type VisitStatus = 'draft' | 'submitted' | 'approved' | 'returned';
export type RiskPriority = 'high' | 'medium';
export type YesNo = 'yes' | 'no';
export type YesNoNA = 'yes' | 'no' | 'na';
export type EarlyStimulationScore = 0 | 1 | 2; // 0=Never, 1=Sometimes, 2=Yes
export type NutritionalStatusVisit = 'sam' | 'mam' | 'n' | 'na';
export type MilestoneStatus = 'n' | 'sd' | 'dd'; // Normal, Suspected Delay, Developmental Delay
export type DisabilityCategory = 'md' | 'hd' | 'vd' | 'pd' | 'pp' | 'nd';
export type MaternalVisitStatus = 'p' | 'pn' | 'l'; // Pregnant, Postnatal, Lactating

export interface RiskFlag {
  type: 'sam' | 'mam' | 'depression' | 'violence' | 'child_violence' | 'developmental_delay';
  priority: RiskPriority;
  description: string;
  relatedRecordId: string;
}

export interface MaternalVisitSection {
  maternalRecordId: string;
  maternalStatus: MaternalVisitStatus;
  ancPncFollowUpStarted: YesNoNA;
  ancFollowUpDropped: YesNoNA;
  substanceUse: YesNo;
  substanceSpecification?: string;
  signsOfDepression: YesNo;
  diverseDietExtraMeal: YesNo;
  ironFolicAcid: YesNoNA;
  partnerFamilySupport: YesNo;
  signsOfViolence: YesNo;
  earlyStimulation?: {
    talkingSinging: YesNo;
    fetalMovementMonitoring: YesNo;
    bellyMassage: YesNo;
  };
  referred: YesNo;
  referralReasons?: Array<'anc' | 'pnc' | 'depression' | 'violence'>;
  nextAppointmentDate: string;
}

export interface ChildVisitSection {
  childRecordId: string;
  earlyStimulation: {
    talksSings: EarlyStimulationScore;
    plays: EarlyStimulationScore;
    tellsStoriesReads: EarlyStimulationScore;
    playsOutdoors: EarlyStimulationScore;
  };
  understandsChildNeeds: YesNo;
  positiveDiscipline: YesNo;
  vaccinationUpToDate: YesNoNA;
  feedingPractice: {
    exclusiveBreastfeeding: YesNo;
    complementaryFeeding: YesNo;
    balancedDiet: YesNo;
  };
  nutritionalStatus: NutritionalStatusVisit;
  signsOfAbuseViolence: YesNo;
  abuseSpecification?: string;
  hasToy: YesNo;
  toyType?: 'homemade' | 'purchased';
  referred: YesNo;
  referralReasons?: Array<'vitamin_a' | 'deworming' | 'malnutrition' | 'developmental_delay' | 'abuse_violence' | 'hospital' | 'other'>;
  referralOtherSpecification?: string;
  nextAppointmentDate: string;
  milestoneAssessment?: Record<string, MilestoneStatus>;
  disabilityCategories: DisabilityCategory[];
  riskFactorsForDevelopment: YesNo;
}

export interface VisitReport {
  id: string;
  householdId: string;
  visitNumber: number;
  visitDate: string;
  status: VisitStatus;
  vulnerabilityStatus: YesNo;
  psnpEnrollment: YesNo;
  cbhiStatus: 'free' | 'paid' | 'no';
  tdsStatus: YesNo;
  maternalSection?: MaternalVisitSection;
  childSections: ChildVisitSection[];
  riskFlags: RiskFlag[];
  hewId: string;
  submittedAt?: string;
  supervisorId?: string;
  approvedAt?: string;
  returnedAt?: string;
  supervisorComment?: string;
  draftSavedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  recipientUserId: string;
  type: 'submission' | 'approval' | 'returned' | 'risk_flag' | 'visit_reminder' | 'resubmit_reminder';
  title: string;
  message: string;
  relatedReportId?: string;
  isRead: boolean;
  isUrgent: boolean;
  createdAt: string;
}
