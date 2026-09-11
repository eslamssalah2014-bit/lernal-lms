// ============================================================================
// AUTHENTICATION & SESSION CONTEXT - SUPABASE INTEGRATED
// Supports Supabase Auth, persistent session sync, RBAC, and demo personas
// ============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { api } from '../services/api';
import { supabase, isSupabaseConfigured } from '../services/supabase';

export type AuthModalTab = 'login' | 'register' | 'forgot';

interface AuthContextType {
  user: UserProfile | null;
  role: 'guest' | 'student' | 'parent' | 'admin' | 'instructor';
  token: string | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalTab: AuthModalTab;
  openAuthModal: (tab?: AuthModalTab) => void;
  closeAuthModal: () => void;
  login: (email: string, password?: string) => Promise<void>;
  loginDemo: (role: string) => Promise<void>;
  register: (payload: { email: string; full_name: string; password?: string; role?: string; phone?: string }) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('lernal_auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<AuthModalTab>('login');

  const openAuthModal = (tab: AuthModalTab = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const fetchProfile = async () => {
    try {
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const data = await api.getMe();
      if (data.user) {
        setUser(data.user);
      } else {
        logout();
      }
    } catch (err) {
      console.warn('Session verification notice:', err);
      // Don't log out if offline or network hiccup, but clear if unauthorized
      if (String(err).includes('401')) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Listen for Supabase Auth state changes
  useEffect(() => {
    if (isSupabaseConfigured) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.access_token) {
          localStorage.setItem('lernal_auth_token', session.access_token);
          setToken(session.access_token);
          // Fetch synced profile
          try {
            const data = await api.getMe();
            if (data.user) setUser(data.user);
          } catch (e) {
            // Profile fallback from session user_metadata
            const meta = session.user.user_metadata || {};
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              full_name: meta.full_name || session.user.email?.split('@')[0] || 'Learner',
              role: (meta.role as any) || 'student',
              avatar_url: meta.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${session.user.id}`,
            });
          }
        } else if (event === 'SIGNED_OUT') {
          logout();
        }
      });

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      // 1. Direct Supabase Auth attempt if configured and password present
      if (isSupabaseConfigured && password) {
        const { data: sbData, error: sbError } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (!sbError && sbData?.session) {
          const accessToken = sbData.session.access_token;
          localStorage.setItem('lernal_auth_token', accessToken);
          setToken(accessToken);
          closeAuthModal();
          return;
        }
      }

      // 2. Fallback to API engine authentication
      const data = await api.login({ email, password });
      if (data.token && data.user) {
        localStorage.setItem('lernal_auth_token', data.token);
        setToken(data.token);
        setUser(data.user);
        closeAuthModal();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loginDemo = async (targetRole: string) => {
    setIsLoading(true);
    try {
      const data = await api.login({ role: targetRole });
      if (data.token && data.user) {
        localStorage.setItem('lernal_auth_token', data.token);
        setToken(data.token);
        setUser(data.user);
        closeAuthModal();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: { email: string; full_name: string; password?: string; role?: string; phone?: string }) => {
    setIsLoading(true);
    try {
      // 1. If password provided and Supabase active, perform Supabase sign up
      if (isSupabaseConfigured && payload.password) {
        const { data: sbData, error: sbError } = await supabase.auth.signUp({
          email: payload.email.trim().toLowerCase(),
          password: payload.password,
          options: {
            data: {
              full_name: payload.full_name,
              role: payload.role || 'student',
              phone: payload.phone || null,
            },
          },
        });

        if (sbError) {
          console.warn('Supabase direct signUp notice:', sbError.message);
        } else if (sbData?.session) {
          localStorage.setItem('lernal_auth_token', sbData.session.access_token);
          setToken(sbData.session.access_token);
        }
      }

      // 2. Synchronize with API backend to ensure role profiles, parent/student table records exist
      const data = await api.register(payload);
      if (data.token && data.user) {
        localStorage.setItem('lernal_auth_token', data.token);
        setToken(data.token);
        setUser(data.user);
        closeAuthModal();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
      }
      await api.forgotPassword(email);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (newPassword: string) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (isSupabaseConfigured) {
      supabase.auth.signOut().catch(() => {});
    }
    localStorage.removeItem('lernal_auth_token');
    localStorage.removeItem('lernal_supabase_auth_token');
    setToken(null);
    setUser(null);
  };

  const role = user ? user.role : 'guest';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isLoading,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        login,
        loginDemo,
        register,
        resetPassword,
        updatePassword,
        logout,
        refreshUser: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
