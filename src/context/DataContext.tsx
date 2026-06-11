'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Household, MaternalRecord, ChildRecord } from '@/types';
import { createClient } from '@/lib/supabase/client';

interface DataContextType {
  households: Household[];
  maternalRecords: MaternalRecord[];
  children: ChildRecord[];
  loading: boolean;
  addHousehold: (h: Household) => void;
  addMaternalRecord: (m: MaternalRecord) => void;
  addChild: (c: ChildRecord) => void;
  refresh: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// ── DB row → app type mappers ────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapHousehold(row: any): Household {
  return {
    id:                   row.id,
    registrationNumber:   row.registration_number,
    houseNumber:          row.house_number,
    headName:             row.head_name,
    phone:                row.phone,
    region:               row.region,
    woreda:               row.woreda,
    kebele:               row.kebele,
    gpsLat:               row.gps_lat ?? undefined,
    gpsLng:               row.gps_lng ?? undefined,
    vulnerabilityStatus:  row.vulnerability_status,
    programs:             row.programs ?? [],
    membersCount:         row.members_count,
    registeredBy:         row.registered_by ?? '',
    registeredAt:         row.registered_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMaternal(row: any): MaternalRecord {
  return {
    id:                         row.id,
    householdId:                row.household_id,
    name:                       row.name,
    age:                        row.age,
    phone:                      row.phone,
    status:                     row.status,
    gestationalAge:             row.gestational_age ?? undefined,
    expectedDeliveryDate:       row.expected_delivery_date ?? undefined,
    actualDeliveryDate:         row.actual_delivery_date ?? undefined,
    ancVisits:                  row.anc_visits,
    pncVisits:                  row.pnc_visits,
    depressionScreening:        row.depression_screening,
    ironFolicSupplementation:   row.iron_folic_supplementation,
    familySupport:              row.family_support,
    nutritionStatus:            row.nutrition_status,
    riskLevel:                  row.risk_level,
    referrals:                  [],
    nextAppointment:            row.next_appointment ?? undefined,
    missedAppointments:         row.missed_appointments,
    registeredBy:               row.registered_by ?? '',
    registeredAt:               row.created_at,
    region:                     row.region,
    woreda:                     row.woreda,
    kebele:                     row.kebele,
    notes:                      row.notes ?? undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapChild(row: any): ChildRecord {
  return {
    id:                     row.id,
    householdId:            row.household_id,
    name:                   row.name,
    sex:                    row.sex,
    dateOfBirth:            row.date_of_birth,
    ageMonths:              row.age_months,
    caregiverName:          row.caregiver_name,
    caregiverPhone:         row.caregiver_phone,
    vaccinationStatus:      [],
    nutritionStatus:        row.nutrition_status,
    muac:                   row.muac ?? undefined,
    weight:                 row.weight ?? undefined,
    height:                 row.height ?? undefined,
    developmentalMilestones:[],
    disabilityScreening:    row.disability_screening,
    childProtectionFlags:   row.child_protection_flags ?? [],
    referrals:              [],
    nextAppointment:        row.next_appointment ?? undefined,
    riskLevel:              row.risk_level,
    registeredBy:           row.registered_by ?? '',
    registeredAt:           row.created_at,
    region:                 row.region,
    woreda:                 row.woreda,
    kebele:                 row.kebele,
  };
}

// ── Provider ─────────────────────────────────────────────────────────────

export function DataProvider({ children: reactChildren }: { children: ReactNode }) {
  const [households,     setHouseholds]     = useState<Household[]>([]);
  const [maternalRecords,setMaternalRecords]= useState<MaternalRecord[]>([]);
  const [children,       setChildren]       = useState<ChildRecord[]>([]);
  const [loading,        setLoading]        = useState(true);

  const supabase = createClient();

  const refresh = async () => {
    setLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any;
      const [hRes, mRes, cRes] = await Promise.all([
        sb.from('households').select('*').order('created_at', { ascending: false }),
        sb.from('maternal_records').select('*').order('created_at', { ascending: false }),
        sb.from('child_records').select('*').order('created_at', { ascending: false }),
      ]);
      setHouseholds((hRes.data ?? []).map(mapHousehold));
      setMaternalRecords((mRes.data ?? []).map(mapMaternal));
      setChildren((cRes.data ?? []).map(mapChild));
    } catch (err) {
      console.error('DataContext fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const addHousehold     = (h: Household)      => setHouseholds(prev => [h, ...prev]);
  const addMaternalRecord= (m: MaternalRecord) => setMaternalRecords(prev => [m, ...prev]);
  const addChild         = (c: ChildRecord)    => setChildren(prev => [c, ...prev]);

  return (
    <DataContext.Provider value={{
      households, maternalRecords, children, loading,
      addHousehold, addMaternalRecord, addChild, refresh,
    }}>
      {reactChildren}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
