'use client';
import { useState, useMemo } from 'react';
import { BarChart, DonutChart, HorizontalBarChart, LineChart } from '@/components/ui/Charts';
import { monthlyTrendData, nutritionStatusData, riskDistributionData, vaccinationCoverageData } from '@/lib/mockData';
import { useData } from '@/context/DataContext';
import { useVisits } from '@/context/VisitContext';
import { Download, FileText, BarChart3, Filter } from 'lucide-react';

const reportTypes = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annual'];
const regions = ['All Regions', 'Oromia', 'Amhara', 'Tigray', 'SNNPR', 'Afar', 'Addis Ababa'];

export default function ReportsPage() {
  const { households, maternalRecords, children } = useData();
  const { visitReports } = useVisits();

  const [reportType, setReportType] = useState('Monthly');
  const [region, setRegion] = useState('All Regions');
  const [dateFrom, setDateFrom] = useState('2024-01-01');
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);

  const handleExport = (format: string) => {
    alert(`Exporting ${reportType} report as ${format}...`);
  };

  // ── Filtered visit reports based on region + date range ──────────────
  const filteredVisits = useMemo(() => {
    return visitReports.filter(r => {
      const hh = households.find(h => h.id === r.householdId);
      const matchRegion = region === 'All Regions' || hh?.region === region;
      const matchDate = (!dateFrom || r.visitDate >= dateFrom) && (!dateTo || r.visitDate <= dateTo);
      return matchRegion && matchDate;
    });
  }, [visitReports, households, region, dateFrom, dateTo]);

  // ── Real summary stats ────────────────────────────────────────────────
  const filteredHouseholds = region === 'All Regions'
    ? households
    : households.filter(h => h.region === region);

  const filteredMaternal = region === 'All Regions'
    ? maternalRecords
    : maternalRecords.filter(m => m.region === region);

  const filteredChildren = region === 'All Regions'
    ? children
    : children.filter(c => c.region === region);

  const pregnantCount   = filteredMaternal.filter(m => m.status === 'pregnant' || m.status === 'both').length;
  const lactatingCount  = filteredMaternal.filter(m => m.status === 'lactating' || m.status === 'both').length;
  const highRiskCount   = filteredVisits.filter(r => r.riskFlags.some(f => f.priority === 'high')).length;
  const approvedVisits  = filteredVisits.filter(r => r.status === 'approved').length;

  const summaryStats = [
    { label: 'Total Households',   value: filteredHouseholds.length },
    { label: 'Pregnant Women',     value: pregnantCount },
    { label: 'Lactating Mothers',  value: lactatingCount },
    { label: 'Children Under 5',   value: filteredChildren.length },
    { label: 'Total Visit Reports',value: filteredVisits.length },
    { label: 'Approved Visits',    value: approvedVisits },
  ];

  // ── Build monthly trend from real visit reports ───────────────────────
  const visitsByMonth = useMemo(() => {
    const map: Record<string, number> = {};
    filteredVisits.forEach(r => {
      const month = r.visitDate.slice(0, 7); // "YYYY-MM"
      map[month] = (map[month] ?? 0) + 1;
    });
    // Last 6 months
    const months: { name: string; visits: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toISOString().slice(0, 7);
      const label = d.toLocaleString('default', { month: 'short' });
      months.push({ name: label, visits: map[key] ?? 0 });
    }
    return months;
  }, [filteredVisits]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Reporting Center</h1>
          <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Generate and export health program reports</p>
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
          <Filter size={16} style={{ color: '#818cf8' }} />
          <h2 className="font-bold" style={{ color: '#e6edf3' }}>Report Filters</h2>
        </div>
        <div className="flex gap-4 flex-wrap">
          <div>
            <label className="form-label">Report Type</label>
            <div className="flex gap-2 flex-wrap">
              {reportTypes.map(t => (
                <button key={t} onClick={() => setReportType(t)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={reportType === t
                    ? { background: 'rgba(99,102,241,0.2)', border: '2px solid rgba(99,102,241,0.5)', color: '#a5b4fc' }
                    : { background: 'rgba(255,255,255,0.04)', border: '2px solid rgba(255,255,255,0.08)', color: '#8b949e' }
                  }>
                  {t}
                </button>
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

      {/* Summary stats — real numbers */}
      <div className="section-card">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={16} style={{ color: '#818cf8' }} />
          <h2 className="font-bold" style={{ color: '#e6edf3' }}>{reportType} Summary — {region}</h2>
          <span className="text-xs ml-2" style={{ color: '#6b7280' }}>{dateFrom} to {dateTo}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {summaryStats.map(s => (
            <div key={s.label} className="rounded-xl p-4 text-center"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-2xl font-bold" style={{ color: '#e6edf3' }}>{s.value.toLocaleString()}</p>
              <p className="text-xs mt-1 font-medium" style={{ color: '#6b7280' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Visit trend — real data */}
      <div className="section-card">
        <h2 className="font-bold mb-4" style={{ color: '#e6edf3' }}>
          Visit Reports — Last 6 Months
          <span className="ml-2 text-sm font-normal" style={{ color: '#6b7280' }}>({filteredVisits.length} total in range)</span>
        </h2>
        {filteredVisits.length === 0 ? (
          <div className="text-center py-10 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', color: '#6b7280' }}>
            No visit reports found for the selected filters.
          </div>
        ) : (
          <BarChart
            data={visitsByMonth.map(m => ({ name: m.name, value: m.visits }))}
            color="#6366f1"
            height={200}
          />
        )}
      </div>

      {/* Charts grid — static reference charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="section-card">
          <h2 className="font-bold mb-4" style={{ color: '#e6edf3' }}>Registration Trends</h2>
          <LineChart data={monthlyTrendData} height={200} lines={[
            { key: 'households', color: '#6366f1', label: 'Households' },
            { key: 'maternal',   color: '#f472b6', label: 'Maternal'   },
            { key: 'children',   color: '#34d399', label: 'Children'   },
          ]} />
        </div>

        <div className="section-card">
          <h2 className="font-bold mb-4" style={{ color: '#e6edf3' }}>Nutrition Status Distribution</h2>
          <DonutChart data={nutritionStatusData} size={150} />
        </div>

        <div className="section-card">
          <h2 className="font-bold mb-4" style={{ color: '#e6edf3' }}>Risk Level Distribution</h2>
          <DonutChart data={riskDistributionData} size={150} />
        </div>

        <div className="section-card">
          <h2 className="font-bold mb-4" style={{ color: '#e6edf3' }}>Vaccination Coverage</h2>
          <HorizontalBarChart data={vaccinationCoverageData.map(d => ({
            name: d.name, value: d.coverage,
            color: d.coverage >= 90 ? '#34d399' : d.coverage >= 75 ? '#fbbf24' : '#f87171',
          }))} />
        </div>
      </div>

      {/* Real visit report table */}
      <div className="section-card">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={16} style={{ color: '#818cf8' }} />
          <h2 className="font-bold" style={{ color: '#e6edf3' }}>Visit Report Details</h2>
          <span className="text-xs ml-1" style={{ color: '#6b7280' }}>({filteredVisits.length} records)</span>
        </div>
        <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                {['Visit #', 'Household', 'Date', 'Status', 'Risk Flags', 'CBHI', 'PSNP'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredVisits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm" style={{ color: '#6b7280' }}>
                    No reports match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredVisits.map(r => {
                  const hh = households.find(h => h.id === r.householdId);
                  const highFlags = r.riskFlags.filter(f => f.priority === 'high').length;
                  return (
                    <tr key={r.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <td className="px-4 py-3 font-mono font-bold" style={{ color: '#818cf8' }}>#{r.visitNumber}</td>
                      <td className="px-4 py-3" style={{ color: '#e6edf3' }}>
                        <p className="font-semibold">{hh?.headName ?? '—'}</p>
                        <p className="text-xs" style={{ color: '#6b7280' }}>{hh?.registrationNumber}</p>
                      </td>
                      <td className="px-4 py-3" style={{ color: '#c9d1d9' }}>{r.visitDate}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold capitalize"
                          style={
                            r.status === 'approved'  ? { background: 'rgba(52,211,153,0.1)',  color: '#34d399' } :
                            r.status === 'submitted' ? { background: 'rgba(99,102,241,0.1)',  color: '#818cf8' } :
                            r.status === 'returned'  ? { background: 'rgba(245,158,11,0.1)',  color: '#fbbf24' } :
                                                       { background: 'rgba(255,255,255,0.06)', color: '#8b949e' }
                          }>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {highFlags > 0
                          ? <span className="text-xs font-bold" style={{ color: '#f87171' }}>⚠ {highFlags} high</span>
                          : <span style={{ color: '#484f58' }}>—</span>
                        }
                      </td>
                      <td className="px-4 py-3 uppercase text-xs font-semibold" style={{ color: '#8b949e' }}>{r.cbhiStatus}</td>
                      <td className="px-4 py-3 uppercase text-xs font-semibold" style={{ color: '#8b949e' }}>{r.psnpEnrollment}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
