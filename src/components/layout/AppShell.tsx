'use client';
import React, { createContext, useContext, useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useApp } from '@/context/AppContext';

// Mobile sidebar open state — shared between TopBar (hamburger) and Sidebar (close on link click)
interface MobileNavContextType {
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}
export const MobileNavContext = createContext<MobileNavContextType>({
  mobileOpen: false,
  setMobileOpen: () => {},
});
export function useMobileNav() { return useContext(MobileNavContext); }

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarOpen } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <MobileNavContext.Provider value={{ mobileOpen, setMobileOpen }}>
      <div className="bg-grid" style={{ background: '#0d1117', minHeight: '100vh' }}>
        {/* Ambient glow */}
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          background:
            'radial-gradient(ellipse 60% 40% at 0% 0%, rgba(99,102,241,0.07) 0%, transparent 100%), ' +
            'radial-gradient(ellipse 50% 40% at 100% 100%, rgba(16,185,129,0.05) 0%, transparent 100%)',
        }} />

        {/* Mobile backdrop */}
        <div
          className={`sidebar-backdrop${mobileOpen ? ' active' : ''}`}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />

        <Sidebar />
        <TopBar />

        <main className={`app-main${sidebarOpen ? '' : ' collapsed'}`} style={{ position: 'relative', zIndex: 1 }}>
          <div className="app-main-inner">
            {children}
          </div>
        </main>
      </div>
    </MobileNavContext.Provider>
  );
}
