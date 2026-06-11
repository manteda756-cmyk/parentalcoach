'use client';
import React, { useState } from 'react';
import { BarChart, DonutChart, HorizontalBarChart, LineChart } from '@/components/ui/Charts';
import { monthlyTrendData, nutritionStatusData, riskDistributionData, vaccinationCoverageData, mockDashboardStats } from '@/lib/mockData';
import { Download, FileText, BarChart3, Filter } from 'lucide-react';

const reportTypes = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annual'];
const regions = ['All Regions', 'Oromia', 'Amhara', 'Tigray', 'SNNPR', 'Afar', 'Addis Ababa'];

export default function ReportsPage() {
  const [reportType, setReportType] = useState('Monthly');
  const [region, setRegion] = useState('All Regions');
  const [dateFrom, setDateFrom] = useState('2024-01-01');
  const [dateTo, setDateTo] = useState('2024-06-30');

  const handleExport = (format: string) => {
    alert(`Exporting ${reportType} report as ${format}...`);
  };

  const summaryStats = [
    { label: 'Total Households', value: mockDashboardStats.totalHouseholds, change: '+3.2%' },
    { label: 'Pregnant Women', value: mockDashboardStats.pregnantWomen, change: '+2.1%' },
    { label: 'Lactating Mothers', value: mockDashboardStats.lactatingMothers, change: '+1.5%' },
    { label: 'Children Under 5', value: mockDashboardStats.childrenUnder5, change: '+0.8%' },
    { label: 'ANC Coverage (%)', value: '87%', change: '+4.2%' },
    { label: 'Immunization Rate', value: '82%', change: '+1.9%' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Reporting Center</h1>
          <p className="text-slate-500 text-sm">Generate and export health program reports</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleExport('PDF')} className="btn-primary"><Download size={15} /> PDF</button>
          <button onClick={() => handleExport('Excel')} className="btn-secondary"><Download size={15} /> Excel</button>
          <button onClick={() => handleExport('CSV')} className="btn-outline"><Download size={15} /> CSV</button>
        </div>
      </div>

      {/* Filters */}
      <div className="section-card">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={16} className="text-blue-600" />
          <h2 className="font-bold text-slate-800">Report Filters</h2>
        </div>
        <div className="flex gap-4 flex-wrap">
          <div>
            <label className="form-label">Report Type</label>
            <div className="flex gap-2">
              {reportTypes.map(t => (
                <button key={t} onClick={() => setReportType(t)} className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${reportType === t ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-blue-300'}`}>{t}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="form-label">Region</label>
            <select className="form-input w-44" value={region} onChange={e => setRegion(e.target.value)}>
              {regions.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Date From</label>
            <input type="date" className="form-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Date To</label>
            <input type="date" className="form-input" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="section-card">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={16} className="text-blue-600" />
          <h2 className="font-bold text-slate-800">{reportType} Summary — {region}</h2>
          <span className="text-xs text-slate-400 ml-2">{dateFrom} to {dateTo}</span>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {summaryStats.map(s => (
            <div key={s.label} className="bg-slate-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-slate-800">{typeof s.value === 'number' ? s.value.toLocaleString() : s.value}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">{s.label}</p>
              <p className="text-xs text-emerald-600 font-bold mt-1">{s.change}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="section-card">
          <h2 className="font-bold text-slate-800 mb-4">Registration Trends</h2>
          <LineChart data={monthlyTrendData} height={200} lines={[
            { key: 'households', color: '#0F6CBD', label: 'Households' },
            { key: 'maternal', color: '#E84393', label: 'Maternal' },
            { key: 'children', color: '#00B894', label: 'Children' },
          ]} />
        </div>

        <div className="section-card">
          <h2 className="font-bold text-slate-800 mb-4">Nutrition Status Distribution</h2>
          <DonutChart data={nutritionStatusData} size={150} />
        </div>

        <div className="section-card">
          <h2 className="font-bold text-slate-800 mb-4">Risk Level Distribution</h2>
          <DonutChart data={riskDistributionData} size={150} />
        </div>

        <div className="section-card">
          <h2 className="font-bold text-slate-800 mb-4">Vaccination Coverage</h2>
          <HorizontalBarChart data={vaccinationCoverageData.map(d => ({ name: d.name, value: d.coverage, color: d.coverage >= 90 ? '#00B894' : d.coverage >= 75 ? '#FDCB6E' : '#E17055' }))} />
        </div>
      </div>

      {/* Report table preview */}
      <div className="section-card">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={16} className="text-blue-600" />
          <h2 className="font-bold text-slate-800">Detailed Report Preview</h2>
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                {['Month', 'Households', 'Pregnant', 'Lactating', 'Children U5', 'High Risk', 'Referrals', 'Immunized'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthlyTrendData.map((row, i) => (
                <tr key={i} className="border-t border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-700">{row.name} 2024</td>
                  <td className="px-4 py-3 text-slate-600">{row.households}</td>
                  <td className="px-4 py-3 text-slate-600">{row.maternal}</td>
                  <td className="px-4 py-3 text-slate-600">{Math.round(row.maternal * 0.7)}</td>
                  <td className="px-4 py-3 text-slate-600">{row.children}</td>
                  <td className="px-4 py-3 text-red-600 font-semibold">{Math.round(row.maternal * 0.15)}</td>
                  <td className="px-4 py-3 text-slate-600">{Math.round(row.maternal * 0.08)}</td>
                  <td className="px-4 py-3 text-emerald-600 font-semibold">{Math.round(row.children * 0.82)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
