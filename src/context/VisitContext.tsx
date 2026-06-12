'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { VisitReport } from '@/types';
import { createClient } from '@/lib/supabase/client';

interface VisitContextType {
  visitReports: VisitReport[];
  loading: boolean;
  addVisitReport: (r: VisitReport) => void;
  updateVisitReport: (id: string, patch: Partial<VisitReport>) => void;
  deleteVisitReport: (id: string) => void;
  refreshVisits: () => Promise<void>;
}

const VisitContext = createContext<VisitContextType | undefined>(undefined);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapVisitReport(row: any): VisitReport {
  return {
    id:                  row.id,
    householdId:         row.household_id,
    visitNumber:         row.visit_number,
    visitDate:           row.visit_date,
    status:              row.status,
    vulnerabilityStatus: row.vulnerability_status,
    psnpEnrollment:      row.psnp_enrollment,
    cbhiStatus:          row.cbhi_status,
    tdsStatus:           row.tds_status,
    maternalSection:     row.maternal_section ?? undefined,
    childSections:       row.child_sections ?? [],
    riskFlags:           row.risk_flags ?? [],
    hewId:               row.hew_id,
    submittedAt:         row.submitted_at ?? undefined,
    supervisorId:        row.supervisor_id ?? undefined,
    approvedAt:          row.approved_at ?? undefined,
    returnedAt:          row.returned_at ?? undefined,
    supervisorComment:   row.supervisor_comment ?? undefined,
    draftSavedAt:        row.draft_saved_at ?? undefined,
    createdAt:           row.created_at,
    updatedAt:           row.updated_at,
  };
}

export function VisitProvider({ children }: { children: ReactNode }) {
  const [visitReports, setVisitReports] = useState<VisitReport[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshVisits = async () => {
    setLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = createClient() as any;
      const { data, error } = await sb
        .from('visit_reports')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setVisitReports(data.map(mapVisitReport));
      }
    } catch (err) {
      console.error('VisitContext fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refreshVisits(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const addVisitReport = (r: VisitReport) =>
    setVisitReports(prev => [r, ...prev]);

  const updateVisitReport = async (id: string, patch: Partial<VisitReport>) => {
    // Optimistic update
    setVisitReports(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = createClient() as any;
      // Build DB patch (camelCase → snake_case for the fields we care about)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dbPatch: Record<string, any> = {};
      if (patch.status          !== undefined) dbPatch.status           = patch.status;
      if (patch.submittedAt     !== undefined) dbPatch.submitted_at     = patch.submittedAt;
      if (patch.approvedAt      !== undefined) dbPatch.approved_at      = patch.approvedAt;
      if (patch.returnedAt      !== undefined) dbPatch.returned_at      = patch.returnedAt;
      if (patch.supervisorComment !== undefined) dbPatch.supervisor_comment = patch.supervisorComment;
      if (patch.supervisorId    !== undefined) dbPatch.supervisor_id    = patch.supervisorId;
      if (patch.maternalSection !== undefined) dbPatch.maternal_section = patch.maternalSection;
      if (patch.childSections   !== undefined) dbPatch.child_sections   = patch.childSections;
      if (patch.riskFlags       !== undefined) dbPatch.risk_flags       = patch.riskFlags;

      await sb.from('visit_reports').update(dbPatch).eq('id', id);
    } catch (err) {
      console.error('updateVisitReport error:', err);
    }
  };

  const deleteVisitReport = async (id: string) => {
    // Optimistic remove
    setVisitReports(prev => prev.filter(r => r.id !== id));
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = createClient() as any;
      await sb.from('visit_reports').delete().eq('id', id);
    } catch (err) {
      console.error('deleteVisitReport error:', err);
    }
  };

  return (
    <VisitContext.Provider value={{ visitReports, loading, addVisitReport, updateVisitReport, deleteVisitReport, refreshVisits }}>
      {children}
    </VisitContext.Provider>
  );
}

export function useVisits() {
  const ctx = useContext(VisitContext);
  if (!ctx) throw new Error('useVisits must be used within VisitProvider');
  return ctx;
}
