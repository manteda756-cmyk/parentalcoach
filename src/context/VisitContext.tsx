'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { VisitReport } from '@/types';
import { mockVisitReports } from '@/lib/mockData';

interface VisitContextType {
  visitReports: VisitReport[];
  addVisitReport: (r: VisitReport) => void;
  updateVisitReport: (id: string, patch: Partial<VisitReport>) => void;
  deleteVisitReport: (id: string) => void;
}

const VisitContext = createContext<VisitContextType | undefined>(undefined);

export function VisitProvider({ children }: { children: ReactNode }) {
  const [visitReports, setVisitReports] = useState<VisitReport[]>(mockVisitReports);

  const addVisitReport = (r: VisitReport) => setVisitReports(prev => [r, ...prev]);

  const updateVisitReport = (id: string, patch: Partial<VisitReport>) =>
    setVisitReports(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));

  const deleteVisitReport = (id: string) =>
    setVisitReports(prev => prev.filter(r => r.id !== id));

  return (
    <VisitContext.Provider value={{ visitReports, addVisitReport, updateVisitReport, deleteVisitReport }}>
      {children}
    </VisitContext.Provider>
  );
}

export function useVisits() {
  const ctx = useContext(VisitContext);
  if (!ctx) throw new Error('useVisits must be used within VisitProvider');
  return ctx;
}
