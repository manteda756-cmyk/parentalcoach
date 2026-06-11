'use client';
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Bell, Globe, Shield, Database, Smartphone, Save } from 'lucide-react';

export default function SettingsPage() {
  const { language, setLanguage, currentUser } = useApp();
  const [notifications, setNotifications] = useState({ sms: true, whatsapp: true, email: false, missedAppt: true, highRisk: true });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const sections = [
    {
      icon: <Globe size={18} className="text-blue-600" />,
      title: 'Language & Localization',
      content: (
        <div className="space-y-4">
          <div>
            <label className="form-label">Display Language</label>
            <div className="flex gap-3">
              {[{ value: 'en', label: 'English' }, { value: 'am', label: 'አማርኛ (Amharic)' }].map(l => (
                <button key={l.value} onClick={() => setLanguage(l.value as 'en'|'am')}
                  className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${language === l.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'}`}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="form-label">Date Format</label>
            <select className="form-input"><option>DD/MM/YYYY (Ethiopian)</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option></select>
          </div>
          <div>
            <label className="form-label">Time Zone</label>
            <select className="form-input"><option>Africa/Addis_Ababa (EAT, UTC+3)</option></select>
          </div>
        </div>
      ),
    },
    {
      icon: <Bell size={18} className="text-amber-600" />,
      title: 'Notification Preferences',
      content: (
        <div className="space-y-3">
          {[
            { key: 'sms', label: 'SMS Reminders', desc: 'Send SMS appointment reminders' },
            { key: 'whatsapp', label: 'WhatsApp Notifications', desc: 'Send WhatsApp messages for critical alerts' },
            { key: 'email', label: 'Email Reports', desc: 'Receive weekly summary emails' },
            { key: 'missedAppt', label: 'Missed Appointment Alerts', desc: 'Alert when a patient misses an appointment' },
            { key: 'highRisk', label: 'High-Risk Alerts', desc: 'Immediate alerts for high-risk cases' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div>
                <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
              </div>
              <button
                onClick={() => setNotifications(n => ({ ...n, [item.key]: !n[item.key as keyof typeof n] }))}
                className={`w-11 h-6 rounded-full transition-colors relative ${notifications[item.key as keyof typeof notifications] ? 'bg-blue-600' : 'bg-slate-300'}`}
                aria-label={`Toggle ${item.label}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${notifications[item.key as keyof typeof notifications] ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          ))}
        </div>
      ),
    },
    {
      icon: <Shield size={18} className="text-emerald-600" />,
      title: 'Security',
      content: (
        <div className="space-y-4">
          <div><label className="form-label">Current Password</label><input type="password" className="form-input" placeholder="••••••••" /></div>
          <div><label className="form-label">New Password</label><input type="password" className="form-input" placeholder="••••••••" /></div>
          <div><label className="form-label">Confirm New Password</label><input type="password" className="form-input" placeholder="••••••••" /></div>
          <div className="bg-blue-50 rounded-xl p-3 text-sm text-blue-700">
            Two-factor authentication is <strong>enabled</strong> for your account.
          </div>
        </div>
      ),
    },
    {
      icon: <Smartphone size={18} className="text-purple-600" />,
      title: 'PWA & Offline Mode',
      content: (
        <div className="space-y-3">
          {[
            { label: 'Offline Data Collection', desc: 'Collect data without internet connection', enabled: true },
            { label: 'Auto-Sync on Connect', desc: 'Automatically sync data when online', enabled: true },
            { label: 'Background Sync', desc: 'Sync data in the background', enabled: false },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div>
                <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </div>
              <div className={`w-11 h-6 rounded-full relative ${item.enabled ? 'bg-blue-600' : 'bg-slate-300'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 ${item.enabled ? 'left-6' : 'left-1'}`} />
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      icon: <Database size={18} className="text-orange-600" />,
      title: 'Data & Privacy',
      content: (
        <div className="space-y-3">
          <div className="bg-slate-50 rounded-xl p-4 text-sm">
            <p className="font-semibold text-slate-700">Data Retention Policy</p>
            <p className="text-slate-500 mt-1">Patient data is retained for 10 years per Ethiopian FMOH policy.</p>
          </div>
          <button className="btn-outline w-full justify-center">Export My Data</button>
          <button className="w-full border-2 border-red-200 text-red-600 hover:bg-red-50 font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
            Delete Account
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="text-slate-500 text-sm">Manage your account and system preferences</p>
        </div>
        <button onClick={handleSave} className={`btn-primary ${saved ? 'bg-emerald-600' : ''}`}>
          <Save size={15} /> {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Profile card */}
      <div className="section-card">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
            {currentUser?.name[0]}
          </div>
          <div>
            <p className="font-bold text-slate-800 text-lg">{currentUser?.name}</p>
            <p className="text-slate-500 text-sm capitalize">{currentUser?.role.replace('_', ' ')} · {currentUser?.region}</p>
            <p className="text-slate-400 text-sm">{currentUser?.email}</p>
          </div>
        </div>
      </div>

      {sections.map(section => (
        <div key={section.title} className="section-card">
          <div className="flex items-center gap-2 mb-4">
            {section.icon}
            <h2 className="font-bold text-slate-800">{section.title}</h2>
          </div>
          {section.content}
        </div>
      ))}
    </div>
  );
}
