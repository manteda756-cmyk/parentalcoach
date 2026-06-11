'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  LayoutDashboard, Home, Heart, Baby, ArrowRightLeft,
  Calendar, BarChart3, Users, Settings, LogOut,
  ChevronLeft, ChevronRight, Activity, ClipboardList,
  CheckSquare, Zap
} from 'lucide-react';

const navGroups = [
  {
    label: 'Main',
    items: [
      { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', labelAm: 'ዳሽቦርድ', roles: null },
    ]
  },
  {
    label: 'Registrations',
    items: [
      { href: '/households', icon: Home,  label: 'Households',     labelAm: 'ቤተሰቦች',      roles: null },
      { href: '/maternal',   icon: Heart, label: 'Maternal Health', labelAm: 'የእናቶች ጤና',   roles: null },
      { href: '/children',   icon: Baby,  label: 'Child Health',    labelAm: 'የህፃናት ጤና',   roles: null },
    ]
  },
  {
    label: 'Visits & Care',
    items: [
      { href: '/visits',           icon: ClipboardList,  label: 'Visit Reports', labelAm: 'ጉብኝቶች', roles: ['health_worker','supervisor','admin','data_clerk'] },
      { href: '/supervisor/queue', icon: CheckSquare,    label: 'Review Queue',  labelAm: 'ወረፋ',    roles: ['supervisor','admin'] },
      { href: '/referrals',        icon: ArrowRightLeft, label: 'Referrals',     labelAm: 'ማስተላለፍ',  roles: null },
      { href: '/appointments',     icon: Calendar,       label: 'Appointments',  labelAm: 'ቀጠሮዎች',  roles: null },
    ]
  },
  {
    label: 'Analytics',
    items: [
      { href: '/reports', icon: BarChart3, label: 'Reports', labelAm: 'ሪፖርቶች', roles: null },
    ]
  },
  {
    label: 'Admin',
    items: [
      { href: '/users',    icon: Users,    label: 'Users',    labelAm: 'ተጠቃሚዎች', roles: ['admin','supervisor'] },
      { href: '/settings', icon: Settings, label: 'Settings', labelAm: 'ቅንብሮች',   roles: null },
    ]
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { currentUser, logout, language, sidebarOpen, setSidebarOpen } = useApp();

  return (
    <aside className={`sidebar${sidebarOpen ? '' : ' collapsed'}`}>

      {/* ── Logo ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '0 14px', height: 64, flexShrink: 0,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        justifyContent: sidebarOpen ? 'flex-start' : 'center',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
          boxShadow: '0 0 16px rgba(99,102,241,0.35)',
        }}>
          <Activity size={15} color="white" />
        </div>

        {sidebarOpen && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: '#e6edf3', fontWeight: 700, fontSize: 13, lineHeight: 1.3, margin: 0 }}>HealthTrack</p>
            <p style={{ color: '#6366f1', fontSize: 11, fontWeight: 500, margin: 0 }}>MCH System</p>
          </div>
        )}

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#6b7280', padding: 6, borderRadius: 6, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = '#e6edf3'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = '#6b7280'; }}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      {/* ── Nav ── */}
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 10px' }}>
        {navGroups.map(group => {
          const visibleItems = group.items.filter(item =>
            !item.roles || (currentUser && item.roles.includes(currentUser.role))
          );
          if (visibleItems.length === 0) return null;
          return (
            <div key={group.label} style={{ marginBottom: 12 }}>
              {sidebarOpen && (
                <p style={{
                  color: 'rgba(255,255,255,0.22)', fontSize: 10, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  padding: '6px 10px 4px', margin: 0,
                }}>
                  {group.label}
                </p>
              )}
              {!sidebarOpen && <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', margin: '6px 0' }} />}

              {visibleItems.map(({ href, icon: Icon, label, labelAm }) => {
                const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`sidebar-link${active ? ' active' : ''}${!sidebarOpen ? ' icon-only' : ''}`}
                    title={!sidebarOpen ? label : undefined}
                  >
                    <Icon size={16} style={{ flexShrink: 0, color: active ? '#a5b4fc' : 'currentColor' }} />
                    {sidebarOpen && <span>{language === 'am' ? labelAm : label}</span>}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* ── AI badge ── */}
      {sidebarOpen && (
        <div style={{
          margin: '0 10px 10px', padding: '10px 12px', borderRadius: 10,
          background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Zap size={12} color="#a5b4fc" />
            <span style={{ color: '#a5b4fc', fontSize: 12, fontWeight: 600 }}>AI Risk Detection</span>
          </div>
          <p style={{ color: '#6b7280', fontSize: 11, margin: 0, lineHeight: 1.4 }}>3 high-risk cases flagged today</p>
        </div>
      )}

      {/* ── User ── */}
      <div style={{ padding: 10, flexShrink: 0, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {currentUser && sidebarOpen ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 10px', borderRadius: 10,
            background: 'rgba(255,255,255,0.03)',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: 'white', fontSize: 12, fontWeight: 700,
            }}>
              {currentUser.name[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: '#e6edf3', fontSize: 12, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser.name}
              </p>
              <p style={{ color: '#6b7280', fontSize: 11, margin: 0, textTransform: 'capitalize' }}>
                {currentUser.role.replace('_', ' ')}
              </p>
            </div>
            <button
              onClick={() => void logout()}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#6b7280', padding: 6, borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f87171'; (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#6b7280'; (e.currentTarget as HTMLElement).style.background = 'none'; }}
              aria-label="Logout"
            >
              <LogOut size={13} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => void logout()}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#6b7280', width: '100%', padding: '8px 0',
              borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f87171'; (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.06)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#6b7280'; (e.currentTarget as HTMLElement).style.background = 'none'; }}
            aria-label="Logout"
          >
            <LogOut size={15} />
          </button>
        )}
      </div>
    </aside>
  );
}
