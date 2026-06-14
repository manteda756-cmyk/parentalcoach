'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Search, Bell, Plus, Globe, ChevronDown, X, Menu, CheckCheck } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useMobileNav } from './AppShell';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface DBNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  related_report_id: string | null;
  is_read: boolean;
  is_urgent: boolean;
  created_at: string;
}

const quickAdd = [
  { href: '/households/new', label: 'New Household',    icon: '🏠' },
  { href: '/maternal/new',   label: 'Register Mother',  icon: '🤰' },
  { href: '/children/new',   label: 'Register Child',   icon: '👶' },
  { href: '/visits/new',     label: 'New Visit Report', icon: '📋' },
  { href: '/referrals/new',  label: 'New Referral',     icon: '↗️' },
];

const typeColor: Record<string, string> = {
  submission:       '#6366f1',
  approval:         '#34d399',
  returned:         '#f59e0b',
  risk_flag:        '#ef4444',
  visit_reminder:   '#818cf8',
  resubmit_reminder:'#f59e0b',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function TopBar() {
  const { language, setLanguage, currentUser, sidebarOpen } = useApp();
  const { mobileOpen, setMobileOpen } = useMobileNav();
  const [search,       setSearch]       = useState('');
  const [notifOpen,    setNotifOpen]    = useState(false);
  const [addOpen,      setAddOpen]      = useState(false);
  const [notifications, setNotifications] = useState<DBNotification[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createClient() as any;

  const loadNotifications = useCallback(async () => {
    if (!currentUser) return;
    const { data } = await sb
      .from('notifications')
      .select('*')
      .eq('recipient_user_id', currentUser.id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setNotifications(data);
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  // Subscribe to real-time new notifications for this user
  useEffect(() => {
    if (!currentUser) return;
    const channel = sb
      .channel('notifications-topbar')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `recipient_user_id=eq.${currentUser.id}`,
      }, (payload: { new: DBNotification }) => {
        setNotifications(prev => [payload.new, ...prev]);
      })
      .subscribe();
    return () => { void sb.removeChannel(channel); };
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

  const markAllRead = async () => {
    if (!currentUser) return;
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;
    await sb.from('notifications').update({ is_read: true }).in('id', unreadIds);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const markRead = async (id: string) => {
    await sb.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const unread = notifications.filter(n => !n.is_read).length;

  return (
    <header className={`topbar${sidebarOpen ? '' : ' collapsed'}`}>

      {/* ── Hamburger — mobile only ── */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Open menu"
        style={{
          display: 'none',
          background: 'none', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 8, padding: 7, cursor: 'pointer',
          color: '#8b949e', flexShrink: 0, alignItems: 'center', justifyContent: 'center',
        }}
        className="mobile-menu-btn"
      >
        <Menu size={18} />
      </button>

      {/* Search */}
      <div style={{ position: 'relative', flex: 1, maxWidth: 360, minWidth: 0 }}>
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto', flexShrink: 0 }}>

        {/* Language */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
          className="hide-mobile"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
            background: 'none', border: '1px solid rgba(255,255,255,0.08)',
            color: '#8b949e', fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
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
            <span className="hide-mobile">New</span>
            <ChevronDown size={11} className="hide-mobile" style={{ transition: 'transform 0.15s', transform: addOpen ? 'rotate(180deg)' : 'none' }} />
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
                <Link key={item.href} href={item.href} onClick={() => setAddOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', textDecoration: 'none', color: '#8b949e', fontSize: 13, transition: 'all 0.12s' }}
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
            onClick={() => { setNotifOpen(!notifOpen); setAddOpen(false); if (!notifOpen) void loadNotifications(); }}
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
              width: 320, zIndex: 100, overflow: 'hidden',
            }}>
              {/* Header */}
              <div style={{
                padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}>
                <p style={{ color: '#e6edf3', fontWeight: 700, fontSize: 13, margin: 0 }}>Notifications</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {unread > 0 && (
                    <span style={{
                      background: 'rgba(239,68,68,0.12)', color: '#f87171',
                      border: '1px solid rgba(239,68,68,0.25)', fontSize: 11, fontWeight: 700,
                      padding: '2px 8px', borderRadius: 20,
                    }}>
                      {unread} new
                    </span>
                  )}
                  {unread > 0 && (
                    <button onClick={() => void markAllRead()}
                      title="Mark all as read"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', padding: 4, borderRadius: 6 }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#818cf8'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#6b7280'; }}>
                      <CheckCheck size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* List */}
              <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '28px 16px', textAlign: 'center', color: '#6b7280', fontSize: 13 }}>
                    No notifications yet
                  </div>
                ) : (
                  notifications.map(n => {
                    const color = typeColor[n.type] ?? '#818cf8';
                    return (
                      <div
                        key={n.id}
                        onClick={() => { if (!n.is_read) void markRead(n.id); }}
                        style={{
                          padding: '12px 16px', cursor: 'pointer', transition: 'background 0.12s',
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          background: !n.is_read ? 'rgba(99,102,241,0.05)' : 'transparent',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = !n.is_read ? 'rgba(99,102,241,0.05)' : 'transparent'; }}
                      >
                        <div style={{ display: 'flex', gap: 10 }}>
                          <div style={{
                            width: 6, height: 6, borderRadius: '50%', marginTop: 6, flexShrink: 0,
                            background: color, boxShadow: `0 0 6px ${color}80`,
                            opacity: n.is_read ? 0.4 : 1,
                          }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ color: n.is_read ? '#6b7280' : '#c9d1d9', fontSize: 12, fontWeight: n.is_read ? 400 : 500, lineHeight: 1.5, margin: '0 0 2px', wordBreak: 'break-word' }}>
                              {n.message}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <p style={{ color: '#484f58', fontSize: 11, margin: 0 }}>{timeAgo(n.created_at)}</p>
                              {n.is_urgent && (
                                <span style={{ fontSize: 10, fontWeight: 700, color: '#f87171', background: 'rgba(239,68,68,0.1)', padding: '1px 6px', borderRadius: 4 }}>
                                  URGENT
                                </span>
                              )}
                            </div>
                          </div>
                          {!n.is_read && (
                            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#6366f1', flexShrink: 0, marginTop: 5 }} />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                <p style={{ color: '#484f58', fontSize: 11, margin: 0 }}>
                  {notifications.length > 0 ? `${notifications.length} notification${notifications.length !== 1 ? 's' : ''} total` : 'Notifications appear when visit reports are submitted or reviewed'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 8, borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            color: 'white', fontSize: 12, fontWeight: 700,
            boxShadow: '0 0 10px rgba(99,102,241,0.3)',
          }}>
            {currentUser?.name?.[0] ?? 'U'}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
