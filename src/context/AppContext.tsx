'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, Language } from '@/types';
import { createClient } from '@/lib/supabase/client';

interface AppContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  language: Language;
  sidebarOpen: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setLanguage: (lang: Language) => void;
  setSidebarOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const supabase = createClient();

  // ── Hydrate session on mount ──────────────────────────────────────────
  useEffect(() => {
    const loadSession = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        await loadUserProfile(authUser.id);
      }
    };
    loadSession();

    // Listen for auth state changes (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUserProfile = async (userId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('users')
      .select('*')
      .eq('id', userId)
      .single() as { data: { id: string; name: string; email: string; phone: string; role: string; region: string; woreda: string; kebele: string; avatar_url: string | null; created_at: string } | null; error: unknown };

    if (error || !data) {
      setIsAuthenticated(true);
      return;
    }

    setCurrentUser({
      id:        data.id,
      name:      data.name,
      email:     data.email,
      phone:     data.phone,
      role:      data.role as User['role'],
      region:    data.region,
      woreda:    data.woreda,
      kebele:    data.kebele,
      avatar:    data.avatar_url ?? undefined,
      createdAt: data.created_at,
    });
    setIsAuthenticated(true);
  };

  // ── Login ─────────────────────────────────────────────────────────────
  const login = async (email: string, password: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return false;
    return true;
  };

  // ── Logout ────────────────────────────────────────────────────────────
  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AppContext.Provider value={{
      currentUser, isAuthenticated, language, sidebarOpen,
      login, logout, setLanguage, setSidebarOpen,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
