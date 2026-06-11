import type {
  User, Household, MaternalRecord, ChildRecord,
  Referral, Appointment, DashboardStats
} from '@/types';

export const mockUsers: User[] = [
  { id: 'u1', name: 'Dr. Almaz Tadesse', email: 'almaz@health.gov.et', phone: '+251911000001', role: 'admin', region: 'Oromia', woreda: 'Burayu', kebele: '01', createdAt: '2024-01-01' },
  { id: 'u2', name: 'Tigist Haile', email: 'tigist@health.gov.et', phone: '+251911000002', role: 'supervisor', region: 'Oromia', woreda: 'Burayu', kebele: '01', createdAt: '2024-01-05' },
  { id: 'u3', name: 'Abebe Girma', email: 'abebe@health.gov.et', phone: '+251911000003', role: 'health_worker', region: 'Oromia', woreda: 'Burayu', kebele: '02', createdAt: '2024-01-10' },
  { id: 'u4', name: 'Sara Bekele', email: 'sara@health.gov.et', phone: '+251911000004', role: 'health_worker', region: 'Oromia', woreda: 'Burayu', kebele: '03', createdAt: '2024-01-15' },
];

export const mockHouseholds: Household[] = [
  { id: 'h1', registrationNumber: 'HH-2024-001', houseNumber: '12A', headName: 'Bekele Worku', phone: '+251912000001', region: 'Oromia', woreda: 'Burayu', kebele: '01', vulnerabilityStatus: 'medium', programs: ['MCH', 'Nutrition'], membersCount: 5, registeredBy: 'u3', registeredAt: '2024-01-15', gpsLat: 9.0248, gpsLng: 38.7469 },
  { id: 'h2', registrationNumber: 'HH-2024-002', houseNumber: '34B', headName: 'Girma Tadesse', phone: '+251912000002', region: 'Oromia', woreda: 'Burayu', kebele: '02', vulnerabilityStatus: 'high', programs: ['MCH'], membersCount: 7, registeredBy: 'u3', registeredAt: '2024-01-16', gpsLat: 9.0252, gpsLng: 38.7480 },
  { id: 'h3', registrationNumber: 'HH-2024-003', houseNumber: '56C', headName: 'Mulugeta Alemu', phone: '+251912000003', region: 'Oromia', woreda: 'Burayu', kebele: '01', vulnerabilityStatus: 'low', programs: ['Immunization'], membersCount: 4, registeredBy: 'u4', registeredAt: '2024-01-17', gpsLat: 9.0260, gpsLng: 38.7490 },
  { id: 'h4', registrationNumber: 'HH-2024-004', houseNumber: '78D', headName: 'Hailu Kebede', phone: '+251912000004', region: 'Oromia', woreda: 'Burayu', kebele: '03', vulnerabilityStatus: 'none', programs: ['MCH', 'Immunization'], membersCount: 3, registeredBy: 'u4', registeredAt: '2024-01-18' },
  { id: 'h5', registrationNumber: 'HH-2024-005', houseNumber: '90E', headName: 'Yonas Desta', phone: '+251912000005', region: 'Oromia', woreda: 'Burayu', kebele: '02', vulnerabilityStatus: 'high', programs: ['MCH', 'Nutrition', 'WASH'], membersCount: 6, registeredBy: 'u3', registeredAt: '2024-01-20' },
];

export const mockMaternalRecords: MaternalRecord[] = [
  {
    id: 'm1', householdId: 'h1', name: 'Hana Bekele', age: 24, phone: '+251913000001',
    status: 'pregnant', gestationalAge: 28, expectedDeliveryDate: '2024-08-15',
    ancVisits: 3, pncVisits: 0, depressionScreening: 'normal', ironFolicSupplementation: true,
    familySupport: 'good', nutritionStatus: 'normal', riskLevel: 'low',
    referrals: [], nextAppointment: '2024-07-10', missedAppointments: 0,
    registeredBy: 'u3', registeredAt: '2024-02-01', region: 'Oromia', woreda: 'Burayu', kebele: '01'
  },
  {
    id: 'm2', householdId: 'h2', name: 'Marta Girma', age: 32, phone: '+251913000002',
    status: 'pregnant', gestationalAge: 36, expectedDeliveryDate: '2024-07-05',
    ancVisits: 4, pncVisits: 0, depressionScreening: 'at_risk', ironFolicSupplementation: true,
    familySupport: 'poor', nutritionStatus: 'malnourished', riskLevel: 'high',
    referrals: [], nextAppointment: '2024-06-28', missedAppointments: 2,
    registeredBy: 'u3', registeredAt: '2024-01-20', region: 'Oromia', woreda: 'Burayu', kebele: '02'
  },
  {
    id: 'm3', householdId: 'h3', name: 'Selamawit Mulugeta', age: 27, phone: '+251913000003',
    status: 'lactating', actualDeliveryDate: '2024-03-10',
    ancVisits: 4, pncVisits: 2, depressionScreening: 'normal', ironFolicSupplementation: true,
    familySupport: 'good', nutritionStatus: 'normal', riskLevel: 'low',
    referrals: [], nextAppointment: '2024-07-15', missedAppointments: 0,
    registeredBy: 'u4', registeredAt: '2024-01-18', region: 'Oromia', woreda: 'Burayu', kebele: '01'
  },
  {
    id: 'm4', householdId: 'h5', name: 'Tigist Yonas', age: 19, phone: '+251913000004',
    status: 'pregnant', gestationalAge: 12, expectedDeliveryDate: '2024-12-20',
    ancVisits: 1, pncVisits: 0, depressionScreening: 'positive', ironFolicSupplementation: false,
    familySupport: 'poor', nutritionStatus: 'malnourished', riskLevel: 'high',
    referrals: [], nextAppointment: '2024-07-05', missedAppointments: 1,
    registeredBy: 'u3', registeredAt: '2024-05-01', region: 'Oromia', woreda: 'Burayu', kebele: '02'
  },
  {
    id: 'm5', householdId: 'h4', name: 'Birtukan Hailu', age: 29, phone: '+251913000005',
    status: 'lactating', actualDeliveryDate: '2024-04-20',
    ancVisits: 4, pncVisits: 3, depressionScreening: 'normal', ironFolicSupplementation: true,
    familySupport: 'moderate', nutritionStatus: 'normal', riskLevel: 'medium',
    referrals: [], nextAppointment: '2024-07-20', missedAppointments: 0,
    registeredBy: 'u4', registeredAt: '2024-02-10', region: 'Oromia', woreda: 'Burayu', kebele: '03'
  },
];

export const mockChildren: ChildRecord[] = [
  {
    id: 'c1', householdId: 'h1', name: 'Dawit Bekele', sex: 'male',
    dateOfBirth: '2022-06-15', ageMonths: 24, caregiverName: 'Hana Bekele', caregiverPhone: '+251913000001',
    vaccinationStatus: [
      { vaccine: 'BCG', dueDate: '2022-06-15', givenDate: '2022-06-15', status: 'given' },
      { vaccine: 'Penta 1', dueDate: '2022-08-15', givenDate: '2022-08-18', status: 'given' },
      { vaccine: 'Measles', dueDate: '2023-06-15', givenDate: '2023-06-20', status: 'given' },
    ],
    nutritionStatus: 'normal', muac: 14.5, weight: 12.5, height: 87,
    developmentalMilestones: [
      { milestone: 'Walking', expectedAgeMonths: 12, achievedAt: 13, status: 'achieved' },
      { milestone: 'Talking', expectedAgeMonths: 18, achievedAt: 20, status: 'achieved' },
    ],
    disabilityScreening: 'none', childProtectionFlags: [],
    referrals: [], nextAppointment: '2024-07-15', riskLevel: 'low',
    registeredBy: 'u3', registeredAt: '2022-06-20', region: 'Oromia', woreda: 'Burayu', kebele: '01'
  },
  {
    id: 'c2', householdId: 'h2', name: 'Liya Girma', sex: 'female',
    dateOfBirth: '2023-01-10', ageMonths: 17, caregiverName: 'Marta Girma', caregiverPhone: '+251913000002',
    vaccinationStatus: [
      { vaccine: 'BCG', dueDate: '2023-01-10', givenDate: '2023-01-10', status: 'given' },
      { vaccine: 'Penta 1', dueDate: '2023-03-10', status: 'overdue', givenDate: undefined },
    ],
    nutritionStatus: 'sam', muac: 11.2, weight: 6.8, height: 72,
    developmentalMilestones: [
      { milestone: 'Sitting', expectedAgeMonths: 6, achievedAt: 8, status: 'delayed' },
      { milestone: 'Walking', expectedAgeMonths: 12, status: 'pending', achievedAt: undefined },
    ],
    disabilityScreening: 'suspected', childProtectionFlags: ['neglect_risk'],
    referrals: [], nextAppointment: '2024-07-01', riskLevel: 'high',
    registeredBy: 'u3', registeredAt: '2023-01-15', region: 'Oromia', woreda: 'Burayu', kebele: '02'
  },
  {
    id: 'c3', householdId: 'h3', name: 'Abel Mulugeta', sex: 'male',
    dateOfBirth: '2021-11-20', ageMonths: 31, caregiverName: 'Selamawit Mulugeta', caregiverPhone: '+251913000003',
    vaccinationStatus: [
      { vaccine: 'BCG', dueDate: '2021-11-20', givenDate: '2021-11-20', status: 'given' },
      { vaccine: 'Measles', dueDate: '2022-11-20', givenDate: '2022-11-25', status: 'given' },
    ],
    nutritionStatus: 'mam', muac: 12.8, weight: 10.2, height: 90,
    developmentalMilestones: [
      { milestone: 'Walking', expectedAgeMonths: 12, achievedAt: 12, status: 'achieved' },
    ],
    disabilityScreening: 'none', childProtectionFlags: [],
    referrals: [], nextAppointment: '2024-07-20', riskLevel: 'medium',
    registeredBy: 'u4', registeredAt: '2021-11-25', region: 'Oromia', woreda: 'Burayu', kebele: '01'
  },
  {
    id: 'c4', householdId: 'h5', name: 'Saron Yonas', sex: 'female',
    dateOfBirth: '2020-05-12', ageMonths: 49, caregiverName: 'Tigist Yonas', caregiverPhone: '+251913000004',
    vaccinationStatus: [
      { vaccine: 'BCG', dueDate: '2020-05-12', givenDate: '2020-05-12', status: 'given' },
      { vaccine: 'Vitamin A', dueDate: '2024-05-12', status: 'due', givenDate: undefined },
    ],
    nutritionStatus: 'normal', muac: 15.2, weight: 16.5, height: 103,
    developmentalMilestones: [],
    disabilityScreening: 'none', childProtectionFlags: [],
    referrals: [], nextAppointment: '2024-08-01', riskLevel: 'low',
    registeredBy: 'u3', registeredAt: '2020-05-15', region: 'Oromia', woreda: 'Burayu', kebele: '02'
  },
];

export const mockReferrals: Referral[] = [
  {
    id: 'r1', patientId: 'm2', patientType: 'maternal', patientName: 'Marta Girma',
    referralDate: '2024-06-15', reason: 'High blood pressure, risk of preeclampsia',
    referredTo: 'Burayu Health Center', serviceReceived: 'Blood pressure management',
    followUpDate: '2024-06-22', outcome: 'Stabilized', status: 'completed', referredBy: 'u3'
  },
  {
    id: 'r2', patientId: 'c2', patientType: 'child', patientName: 'Liya Girma',
    referralDate: '2024-06-20', reason: 'Severe Acute Malnutrition (SAM)',
    referredTo: 'Burayu District Hospital', status: 'in_progress', referredBy: 'u3'
  },
  {
    id: 'r3', patientId: 'm4', patientType: 'maternal', patientName: 'Tigist Yonas',
    referralDate: '2024-06-25', reason: 'Depression screening positive, nutritional support needed',
    referredTo: 'Mental Health Clinic, Addis Ababa', status: 'pending', referredBy: 'u3'
  },
  {
    id: 'r4', patientId: 'c3', patientType: 'child', patientName: 'Abel Mulugeta',
    referralDate: '2024-06-18', reason: 'Moderate Acute Malnutrition (MAM)',
    referredTo: 'Nutrition Rehabilitation Center', status: 'in_progress', referredBy: 'u4'
  },
];

export const mockAppointments: Appointment[] = [
  { id: 'a1', patientId: 'm1', patientType: 'maternal', patientName: 'Hana Bekele', date: '2024-07-10', time: '09:00', type: 'ANC Visit 4', healthWorker: 'Abebe Girma', status: 'scheduled', reminders: ['sms'] },
  { id: 'a2', patientId: 'm2', patientType: 'maternal', patientName: 'Marta Girma', date: '2024-06-28', time: '10:00', type: 'ANC Visit 5 - High Risk Follow-up', healthWorker: 'Abebe Girma', status: 'scheduled', reminders: ['sms', 'whatsapp'] },
  { id: 'a3', patientId: 'c1', patientType: 'child', patientName: 'Dawit Bekele', date: '2024-07-15', time: '08:30', type: 'Growth Monitoring', healthWorker: 'Sara Bekele', status: 'scheduled', reminders: ['sms'] },
  { id: 'a4', patientId: 'm3', patientType: 'maternal', patientName: 'Selamawit Mulugeta', date: '2024-07-15', time: '11:00', type: 'PNC Visit 3', healthWorker: 'Sara Bekele', status: 'scheduled', reminders: ['sms'] },
  { id: 'a5', patientId: 'c2', patientType: 'child', patientName: 'Liya Girma', date: '2024-07-01', time: '09:30', type: 'SAM Follow-up', healthWorker: 'Abebe Girma', status: 'scheduled', reminders: ['sms', 'whatsapp'] },
  { id: 'a6', patientId: 'm1', patientType: 'maternal', patientName: 'Hana Bekele', date: '2024-06-05', time: '09:00', type: 'ANC Visit 3', healthWorker: 'Abebe Girma', status: 'missed', reminders: ['sms'] },
];

export const mockDashboardStats: DashboardStats = {
  totalHouseholds: 1248,
  pregnantWomen: 187,
  lactatingMothers: 143,
  childrenUnder5: 412,
  highRiskCases: 34,
  pendingReferrals: 12,
  upcomingAppointments: 28,
  missedAppointments: 9,
};

export const monthlyTrendData = [
  { name: 'Jan', households: 1100, maternal: 160, children: 380 },
  { name: 'Feb', households: 1130, maternal: 168, children: 390 },
  { name: 'Mar', households: 1165, maternal: 172, children: 395 },
  { name: 'Apr', households: 1190, maternal: 175, children: 400 },
  { name: 'May', households: 1215, maternal: 180, children: 408 },
  { name: 'Jun', households: 1248, maternal: 187, children: 412 },
];

export const nutritionStatusData = [
  { name: 'Normal', value: 68, color: '#00B894' },
  { name: 'MAM', value: 18, color: '#FDCB6E' },
  { name: 'SAM', value: 8, color: '#E17055' },
  { name: 'Overweight', value: 6, color: '#74B9FF' },
];

export const vaccinationCoverageData = [
  { name: 'BCG', coverage: 96 },
  { name: 'Penta 1', coverage: 92 },
  { name: 'Penta 2', coverage: 88 },
  { name: 'Penta 3', coverage: 85 },
  { name: 'Measles', coverage: 80 },
  { name: 'Vitamin A', coverage: 75 },
];

export const riskDistributionData = [
  { name: 'Low Risk', value: 58, color: '#00B894' },
  { name: 'Medium Risk', value: 28, color: '#FDCB6E' },
  { name: 'High Risk', value: 14, color: '#E17055' },
];
