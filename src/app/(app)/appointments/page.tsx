'use client';
import React, { useState } from 'react';
import { mockAppointments } from '@/lib/mockData';
import type { Appointment } from '@/types';
import Badge from '@/components/ui/Badge';
import { Calendar, Clock, Plus, Bell, MessageCircle, Mail, Search } from 'lucide-react';
import Modal from '@/components/ui/Modal';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function getCalendarDays(year: number, month: number) {
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(first).fill(null);
  for (let i = 1; i <= days; i++) cells.push(i);
  return cells;
}

export default function AppointmentsPage() {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);

  const cells = getCalendarDays(viewYear, viewMonth);

  const apptsByDay = (day: number) => mockAppointments.filter(a => {
    const d = new Date(a.date);
    return d.getFullYear() === viewYear && d.getMonth() === viewMonth && d.getDate() === day;
  });

  const filtered = mockAppointments.filter(a =>
    a.patientName.toLowerCase().includes(search.toLowerCase()) ||
    a.type.toLowerCase().includes(search.toLowerCase())
  );

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Appointments</h1>
          <p className="text-slate-500 text-sm">{mockAppointments.filter(a => a.status === 'scheduled').length} upcoming</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary"><Plus size={15} /> Schedule Appointment</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="section-card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800">{MONTHS[viewMonth]} {viewYear}</h2>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">◀</button>
              <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">▶</button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map(d => <div key={d} className="text-center text-xs font-bold text-slate-400 py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (!day) return <div key={i} />;
              const appts = apptsByDay(day);
              const isToday = day === now.getDate() && viewMonth === now.getMonth() && viewYear === now.getFullYear();
              return (
                <div key={i} className={`min-h-[60px] p-1 rounded-xl border transition-colors cursor-pointer hover:bg-blue-50 ${isToday ? 'border-blue-400 bg-blue-50' : 'border-transparent'}`}>
                  <p className={`text-xs font-bold text-center mb-1 ${isToday ? 'text-blue-600' : 'text-slate-700'}`}>{day}</p>
                  {appts.slice(0, 2).map(a => (
                    <div key={a.id} onClick={() => setSelected(a)} className={`text-xs px-1 py-0.5 rounded mb-0.5 truncate cursor-pointer ${a.status === 'missed' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                      {a.patientName.split(' ')[0]}
                    </div>
                  ))}
                  {appts.length > 2 && <p className="text-xs text-slate-400 text-center">+{appts.length - 2}</p>}
                </div>
              );
            })}
          </div>
        </div>

        {/* List */}
        <div className="section-card">
          <div className="flex items-center gap-2 mb-4">
            <Search size={15} className="text-slate-400" />
            <input type="text" placeholder="Search appointments..." value={search} onChange={e => setSearch(e.target.value)} className="form-input py-2 flex-1" />
          </div>
          <div className="space-y-3 overflow-y-auto max-h-[420px]">
            {filtered.map(a => (
              <div key={a.id} onClick={() => setSelected(a)} className={`p-3 rounded-xl cursor-pointer transition-colors hover:bg-slate-50 border ${a.status === 'missed' ? 'border-red-200 bg-red-50' : 'border-slate-100'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{a.patientName}</p>
                    <p className="text-xs text-slate-500 truncate">{a.type}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1 text-xs text-slate-400"><Calendar size={11} />{a.date}</span>
                      <span className="flex items-center gap-1 text-xs text-slate-400"><Clock size={11} />{a.time}</span>
                    </div>
                  </div>
                  <Badge variant={a.status === 'scheduled' ? 'active' : a.status === 'completed' ? 'completed' : a.status === 'missed' ? 'high' : 'default'}>
                    {a.status}
                  </Badge>
                </div>
                <div className="flex gap-1 mt-2">
                  {a.reminders.includes('sms') && <span aria-label="SMS"><Bell size={12} className="text-slate-400" /></span>}
                  {a.reminders.includes('whatsapp') && <span aria-label="WhatsApp"><MessageCircle size={12} className="text-slate-400" /></span>}
                  {a.reminders.includes('email') && <span aria-label="Email"><Mail size={12} className="text-slate-400" /></span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <Modal open={!!selected} onClose={() => setSelected(null)} title="Appointment Details" size="md">
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="font-bold text-slate-800 text-lg">{selected.patientName}</p>
              <p className="text-sm text-slate-500 capitalize">{selected.patientType}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: 'Appointment Type', value: selected.type },
                { label: 'Health Worker', value: selected.healthWorker },
                { label: 'Date', value: selected.date },
                { label: 'Time', value: selected.time },
              ].map(item => (
                <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <p className="font-semibold text-slate-800">{item.value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-2 font-semibold">Reminders Sent</p>
              <div className="flex gap-2">
                {selected.reminders.includes('sms') && <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold"><Bell size={12} /> SMS</span>}
                {selected.reminders.includes('whatsapp') && <span className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-semibold"><MessageCircle size={12} /> WhatsApp</span>}
                {selected.reminders.includes('email') && <span className="flex items-center gap-1.5 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full text-xs font-semibold"><Mail size={12} /> Email</span>}
              </div>
            </div>
            <Badge variant={selected.status === 'scheduled' ? 'active' : selected.status === 'completed' ? 'completed' : selected.status === 'missed' ? 'high' : 'default'}>
              {selected.status}
            </Badge>
          </div>
        </Modal>
      )}

      {/* New appointment modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="Schedule Appointment" size="md">
        <form className="space-y-4" onSubmit={e => { e.preventDefault(); alert('Appointment scheduled!'); setShowNew(false); }}>
          <div><label className="form-label">Patient Name *</label><input className="form-input" required /></div>
          <div><label className="form-label">Appointment Type *</label>
            <select className="form-input">
              {['ANC Visit','PNC Visit','Growth Monitoring','Immunization','SAM Follow-up','Nutrition Counseling'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="form-label">Date *</label><input className="form-input" type="date" required /></div>
            <div><label className="form-label">Time *</label><input className="form-input" type="time" required /></div>
          </div>
          <div>
            <label className="form-label">Reminders</label>
            <div className="flex gap-3 mt-1">
              {['SMS', 'WhatsApp', 'Email'].map(r => (
                <label key={r} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded" defaultChecked={r === 'SMS'} />
                  {r}
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowNew(false)} className="btn-outline flex-1 justify-center">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center"><Calendar size={15} /> Schedule</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
