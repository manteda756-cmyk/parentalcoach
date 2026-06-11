'use client';
import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import KPICard from '@/components/ui/KPICard';
import { BarChart, DonutChart, LineChart } from '@/components/ui/Charts';
import Badge from '@/components/ui/Badge';
import {
  Home, Heart, Baby, AlertTriangle, ArrowRightLeft,
  Calendar, TrendingUp, Clock, ChevronRight, Zap
} from 'lucide-react';
import { monthlyTrendData, nutritionStatusData, riskDistributionData, vaccinationCoverageData } from '@/lib/mockData';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Stats {
  totalHouseholds: number;
  pregnantWomen: number;
  lactatingMothers: number;
  childrenUnder5: number;
  highRiskCases: number;
  pendingReferrals: number;
  upcomingAppointments: number;
  missedAppointments: number;
}

interface RecentReferral {
  id: string;
  patientName: string;
  reason: string;
  status: string;
}

interface UpcomingAppt {
  id: string;
  patientName: string;
  type: string;
  date: string;
  time: string;
}

const EMPTY_STATS: Stats = {
  totalHouseholds: 0, pregnantWomen: 0, lactatingMothers: 0,
  childrenUnder5: 0, highRiskCases: 0, pendingReferrals: 0,
  upcomingAppointments: 0, missedAppointments: 0,
};

export default function DashboardPage() {
  const { currentUser } = useApp();
  const [stats,        setStats]        = useState<Stats>(EMPTY_STATS);
  const [referrals,    setReferrals]    = useState<RecentReferral[]>([]);
  const [appointments, setAppointments] = useState<UpcomingAppt[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    const load = async () => {
      setLoadingStats(true);
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sb = createClient() as any;
        const [hRes, mRes, cRes, vRes, rRes, aRes] = await Promise.all([
          sb.from('households').select('*', { count: 'exact', head: true }),
          sb.from('maternal_records').select('id, status'),
          sb.from('child_records').select('id, age_months'),
          sb.from('visit_reports').select('id, risk_flags'),
          sb.from('referrals').select('id, patient_name, reason, status').order('created_at', { ascending: false }).limit(4),
          sb.from('appointments').select('id, patient_name, type, date, time, status').order('date', { ascending: true }).limit(10),
        ]);

        const maternal   = (mRes.data ?? []) as Array<{ status: string }>;
        const kids       = (cRes.data ?? []) as Array<{ age_months: number }>;
        const visits     = (vRes.data ?? []) as Array<{ risk_flags: Array<{ priority: string }> }>;
        const refData    = (rRes.data ?? []) as Array<{ id: string; patient_name: string; reason: string; status: string }>;
        const apptData   = (aRes.data ?? []) as Array<{ id: string; patient_name: string; type: string; date: string; time: string; status: string }>;

        setStats({
          totalHouseholds:      hRes.count ?? 0,
          pregnantWomen:        maternal.filter(m => m.status === 'pregnant' || m.status === 'both').length,
          lactatingMothers:     maternal.filter(m => m.status === 'lactating' || m.status === 'both').length,
          childrenUnder5:       kids.filter(k => k.age_months < 60).length,
          highRiskCases:        visits.filter(v => v.risk_flags?.some(f => f.priority === 'high')).length,
          pendingReferrals:     refData.filter(r => r.status === 'pending').length,
          upcomingAppointments: apptData.filter(a => a.status === 'scheduled').length,
          missedAppointments:   apptData.filter(a => a.status === 'missed').length,
        });

        setReferrals(refData.map(r => ({ id: r.id, patientName: r.patient_name, reason: r.reason, status: r.status })));
        setAppointments(
          apptData
            .filter(a => a.status === 'scheduled')
            .slice(0, 5)
            .map(a => ({ id: a.id, patientName: a.patient_name, type: a.type, date: a.date, time: a.time }))
        );
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoadingStats(false);
      }
    };
    void load();
  }, []);

  const kpis = [
    { title: 'Total Households',   value: stats.totalHouseholds,       icon: <Home size={18} />,          gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)', trend: undefined },
    { title: 'Pregnant Women',     value: stats.pregnantWomen,         icon: <Heart size={18} />,         gradient: 'linear-gradient(135deg, #ec4899, #be185d)', trend: undefined },
    { title: 'Lactating Mothers',  value: stats.lactatingMothers,      icon: <Heart size={18} />,         gradient: 'linear-gradient(135deg, #a855f7, #7c3aed)', trend: undefined },
    { title: 'Children Under 5',   value: stats.childrenUnder5,        icon: <Baby size={18} />,          gradient: 'linear-gradient(135deg, #10b981, #059669)', trend: undefined },
    { title: 'High-Risk Cases',    value: stats.highRiskCases,         icon: <AlertTriangle size={18} />, gradient: 'linear-gradient(135deg, #ef4444, #b91c1c)', trend: undefined },
    { title: 'Pending Referrals',  value: stats.pendingReferrals,      icon: <ArrowRightLeft size={18} />,gradient: 'linear-gradient(135deg, #f97316, #c2410c)', trend: undefined },
    { title: 'Upcoming Appts',     value: stats.upcomingAppointments,  icon: <Calendar size={18} />,      gradient: 'linear-gradient(135deg, #06b6d4, #0284c7)', trend: undefined },
    { title: 'Missed Appts',       value: stats.missedAppointments,    icon: <Clock size={18} />,         gradient: 'linear-gradient(135deg, #eab308, #a16207)', trend: undefined },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: '#6b7280' }}>
            {new Date().toLocaleDateString('en-ET', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-2xl font-black" style={{ color: '#e6edf3', letterSpacing: '-0.03em' }}>
            {greeting}, {currentUser?.name.split(' ')[0] ?? 'there'} 👋
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
            style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#34d399', boxShadow: '0 0 6px rgba(52,211,153,0.8)' }} />
            System Online
          </div>
        </div>
      </div>

      {/* KPI grid */}
      {loadingStats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="kpi-card" style={{ minHeight: 110 }}>
              <div style={{ height: 10, width: '60%', borderRadius: 6, background: 'rgba(255,255,255,0.06)', marginBottom: 12 }} />
              <div style={{ height: 32, width: '40%', borderRadius: 6, background: 'rgba(255,255,255,0.06)' }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => <KPICard key={i} {...kpi} />)}
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="section-card lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold" style={{ color: '#e6edf3' }}>Registration Trends</h2>
              <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>6-month overview</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl"
              style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
              <TrendingUp size={12} /> Live data
            </div>
          </div>
          <LineChart data={monthlyTrendData} height={200} lines={[
            { key: 'households', color: '#6366f1', label: 'Households' },
            { key: 'maternal',   color: '#ec4899', label: 'Maternal' },
            { key: 'children',   color: '#10b981', label: 'Children' },
          ]} />
        </div>
        <div className="section-card">
          <h2 className="font-bold mb-1" style={{ color: '#e6edf3' }}>Risk Distribution</h2>
          <p className="text-xs mb-5" style={{ color: '#6b7280' }}>All registered patients</p>
          <DonutChart data={riskDistributionData} size={150} />
        </div>
      </div>

      {/* Second charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="section-card">
          <h2 className="font-bold mb-1" style={{ color: '#e6edf3' }}>Child Nutrition Status</h2>
          <p className="text-xs mb-5" style={{ color: '#6b7280' }}>Current period distribution</p>
          <DonutChart data={nutritionStatusData} size={140} />
        </div>
        <div className="section-card">
          <h2 className="font-bold mb-1" style={{ color: '#e6edf3' }}>Vaccination Coverage</h2>
          <p className="text-xs mb-5" style={{ color: '#6b7280' }}>By vaccine type (%)</p>
          <BarChart data={vaccinationCoverageData.map(d => ({
            name: d.name, value: d.coverage,
            color: d.coverage >= 90 ? '#10b981' : d.coverage >= 75 ? '#f59e0b' : '#ef4444'
          }))} height={170} />
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Referrals */}
        <div className="section-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold" style={{ color: '#e6edf3' }}>Recent Referrals</h2>
            <Link href="/referrals" className="flex items-center gap-1 text-xs font-semibold"
              style={{ color: '#818cf8' }}>
              View all <ChevronRight size={12} />
            </Link>
          </div>
          {referrals.length === 0 ? (
            <div className="text-center py-10" style={{ color: '#6b7280' }}>
              <ArrowRightLeft size={28} className="mx-auto mb-2" style={{ opacity: 0.3 }} />
              <p className="text-sm">No referrals yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {referrals.map(r => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-xl"
                  style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ background: r.status === 'completed' ? 'linear-gradient(135deg,#10b981,#059669)' : r.status === 'in_progress' ? 'linear-gradient(135deg,#6366f1,#4f46e5)' : 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
                      {r.patientName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#e6edf3' }}>{r.patientName}</p>
                      <p className="text-xs truncate max-w-[180px]" style={{ color: '#6b7280' }}>{r.reason}</p>
                    </div>
                  </div>
                  <Badge variant={r.status === 'completed' ? 'completed' : r.status === 'in_progress' ? 'active' : 'pending'}>
                    {r.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Appointments */}
        <div className="section-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold" style={{ color: '#e6edf3' }}>Upcoming Appointments</h2>
            <Link href="/appointments" className="flex items-center gap-1 text-xs font-semibold"
              style={{ color: '#818cf8' }}>
              View all <ChevronRight size={12} />
            </Link>
          </div>
          {appointments.length === 0 ? (
            <div className="text-center py-10" style={{ color: '#6b7280' }}>
              <Calendar size={28} className="mx-auto mb-2" style={{ opacity: 0.3 }} />
              <p className="text-sm">No upcoming appointments</p>
            </div>
          ) : (
            <div className="space-y-2">
              {appointments.map(a => (
                <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}>
                    <Calendar size={14} style={{ color: '#818cf8' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: '#e6edf3' }}>{a.patientName}</p>
                    <p className="text-xs truncate" style={{ color: '#6b7280' }}>{a.type}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold" style={{ color: '#818cf8' }}>{a.date}</p>
                    <p className="text-xs" style={{ color: '#6b7280' }}>{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI bar */}
      <div className="rounded-2xl p-5 flex items-center justify-between gap-6"
        style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)' }}>
            <Zap size={17} style={{ color: '#a5b4fc' }} />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: '#e6edf3' }}>AI Risk Detection Active</p>
            <p className="text-xs" style={{ color: '#6b7280' }}>
              Monitoring {stats.pregnantWomen + stats.childrenUnder5} patients for risk indicators
            </p>
          </div>
        </div>
        <div className="flex items-center gap-8">
          {[
            { label: 'High Risk', value: stats.highRiskCases,      color: '#f87171' },
            { label: 'Pending',   value: stats.pendingReferrals,   color: '#fbbf24' },
            { label: 'Missed',    value: stats.missedAppointments, color: '#818cf8' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs" style={{ color: '#6b7280' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
