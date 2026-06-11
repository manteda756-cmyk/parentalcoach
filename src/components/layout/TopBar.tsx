'use client';
import React, { useState } from 'react';
import { Search, Bell, Plus, Globe, ChevronDown, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import Link from 'next/link';

const notifications = [
  { id: 1, text: 'Marta Girma missed her ANC appointment',   time: '2h ago', type: 'warning', unread: true  },
  { id: 2, text: 'Liya Girma SAM referral needs follow-up', time: '4h ago', type: 'danger',  unread: true  },
  { id: 3, text: 'New household registered in Kebele 02',   time: '1d ago', type: 'info',    unread: false },
];

const quickAdd = [
  { href: '/households/new', label: 'New Household',   icon: '🏠' },
  { href: '/maternal/new',   label: 'Register Mother', icon: '🤰' },
  { href: '/children/new',   label: 'Register Child',  icon: '👶' },
  { href: '/visits/new',     label: 'New Visit Report',icon: '📋' },
  { href: '/referrals/new',  label: 'New Referral',    icon: '↗️' },
];

const dotColor: Record<string, string> = {
  danger:  '#ef4444',
  warning: '#f59e0b',
  info:    '#6366f1',
};

export default function TopBar() {
  const { language, setLanguage, currentUser, sidebarOpen } = useApp();
  const [search,     setSearch]     = useState('');
  const [notifOpen,  setNotifOpen]  = useState(false);
  const [addOpen,    setAddOpen]    = useState(false);
  const unread = notifications.filter(n => n.unread).length;

  return (
    <header className={`topbar${sidebarOpen ? '' : ' collapsed'}`}>

      {/* Search */}
      <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b7280', pointerEvents: 'none' }} />
        <input
          type="text"
          placeholder="Search patients, households…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="form-input"
          style={{ paddingLeft: 36, paddingRight: search ? 32 : 14, height: 36, fontSize: 13 }}
          aria-label="Global search"
        />
        {search && (
          <button onClick={() => setSearch('')}
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex' }}>
            <X size={13} />
          </button>
        )}
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>

        {/* Language */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
            background: 'none', border: '1px solid rgba(255,255,255,0.08)',
            color: '#8b949e', fontSize: 12, fontWeight: 600,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = '#e6edf3'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = '#8b949e'; }}
          aria-label="Toggle language"
        >
          <Globe size={13} />
          {language === 'en' ? 'አማርኛ' : 'EN'}
        </button>

        {/* Quick add */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setAddOpen(!addOpen); setNotifOpen(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              border: 'none', color: 'white', fontSize: 12, fontWeight: 700,
              boxShadow: '0 2px 10px rgba(99,102,241,0.4)',
            }}
          >
            <Plus size={13} />
            New
            <ChevronDown size={11} style={{ transition: 'transform 0.15s', transform: addOpen ? 'rotate(180deg)' : 'none' }} />
          </button>

          {addOpen && (
            <div className="animate-fadeIn" style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)',
              background: '#1c2128', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              width: 200, padding: '4px 0', zIndex: 100,
            }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.25)', padding: '8px 16px 6px' }}>
                Quick Add
              </p>
              {quickAdd.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setAddOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 16px', textDecoration: 'none',
                    color: '#8b949e', fontSize: 13, transition: 'all 0.12s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.1)'; (e.currentTarget as HTMLElement).style.color = '#a5b4fc'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = '#8b949e'; }}
                >
                  <span style={{ fontSize: 15 }}>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setNotifOpen(!notifOpen); setAddOpen(false); }}
            style={{
              position: 'relative', background: 'none',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
              padding: 7, cursor: 'pointer', display: 'flex',
              color: '#8b949e', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = '#e6edf3'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = '#8b949e'; }}
            aria-label="Notifications"
          >
            <Bell size={16} />
            {unread > 0 && (
              <span style={{
                position: 'absolute', top: -3, right: -3,
                width: 16, height: 16, borderRadius: '50%',
                background: '#ef4444', color: 'white',
                fontSize: 9, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 8px rgba(239,68,68,0.6)',
              }}>
                {unread}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="animate-fadeIn" style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)',
              background: '#1c2128', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              width: 300, zIndex: 100, overflow: 'hidden',
            }}>
              <div style={{
                padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}>
                <p style={{ color: '#e6edf3', fontWeight: 700, fontSize: 13, margin: 0 }}>Notifications</p>
                <span style={{
                  background: 'rgba(239,68,68,0.12)', color: '#f87171',
                  border: '1px solid rgba(239,68,68,0.25)', fontSize: 11, fontWeight: 700,
                  padding: '2px 8px', borderRadius: 20,
                }}>
                  {unread} new
                </span>
              </div>

              {notifications.map(n => (
                <div
                  key={n.id}
                  style={{
                    padding: '12px 16px', cursor: 'pointer', transition: 'background 0.12s',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: n.unread ? 'rgba(99,102,241,0.04)' : 'transparent',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = n.unread ? 'rgba(99,102,241,0.04)' : 'transparent'; }}
                >
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%', marginTop: 5, flexShrink: 0,
                      background: dotColor[n.type],
                      boxShadow: `0 0 6px ${dotColor[n.type]}80`,
                    }} />
                    <div>
                      <p style={{ color: '#c9d1d9', fontSize: 12, fontWeight: 500, lineHeight: 1.5, margin: '0 0 2px' }}>{n.text}</p>
                      <p style={{ color: '#6b7280', fontSize: 11, margin: 0 }}>{n.time}</p>
                    </div>
                  </div>
                </div>
              ))}

              <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#818cf8', fontSize: 12, fontWeight: 600 }}>
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 10, borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            color: 'white', fontSize: 12, fontWeight: 700,
            boxShadow: '0 0 10px rgba(99,102,241,0.3)',
          }}>
            {currentUser?.name?.[0] ?? 'U'}
          </div>
          {currentUser && (
            <div style={{ display: 'none' }} className="md-show">
              <p style={{ color: '#e6edf3', fontSize: 12, fontWeight: 600, margin: 0, lineHeight: 1.3 }}>{currentUser.name.split(' ')[0]}</p>
              <p style={{ color: '#6b7280', fontSize: 11, margin: 0, textTransform: 'capitalize' }}>{currentUser.role.replace('_', ' ')}</p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
