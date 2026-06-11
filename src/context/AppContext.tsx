'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { User, Language } from '@/types';
import { mockUsers } from '@/lib/mockData';

interface AppContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  language: Language;
  sidebarOpen: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  setLanguage: (lang: Language) => void;
  setSidebarOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const login = (email: string, _password: string): boolean => {
    const user = mockUsers.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AppContext.Provider value={{
      currentUser, isAuthenticated, language, sidebarOpen,
      login, logout, setLanguage, setSidebarOpen
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
