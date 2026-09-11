// ============================================================================
// AUTHENTICATION & SESSION CONTEXT
// Includes seamless 1-click role switcher for instant platform evaluation
// ============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  role: 'guest' | 'student' | 'parent' | 'admin' | 'instructor';
  token: string | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  loginDemo: (role: string) => Promise<void>;
  register: (payload: { email: string; full_name: string; role?: string; phone?: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('lernal_auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
      console.warn('Session verification failed, continuing as guest:', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const data = await api.login({ email, password });
      if (data.token && data.user) {
        localStorage.setItem('lernal_auth_token', data.token);
        setToken(data.token);
        setUser(data.user);
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
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: { email: string; full_name: string; role?: string; phone?: string }) => {
    setIsLoading(true);
    try {
      const data = await api.register(payload);
      if (data.token && data.user) {
        localStorage.setItem('lernal_auth_token', data.token);
        setToken(data.token);
        setUser(data.user);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('lernal_auth_token');
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
        login,
        loginDemo,
        register,
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
