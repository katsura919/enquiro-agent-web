"use client";
import * as React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../utils/api';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  businessId: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    // Check for stored token and fetch user info
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/agent/info')
        .then(res => {
          setUser(res.data);
        })
        .catch(() => {
          setUser(null);
          localStorage.removeItem('token');
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/agent/login', { email, password });
      if (response.data.success === false) {
        throw new Error(response.data.message || 'Login failed');
      }
      const { token } = response.data;
      localStorage.setItem('token', token);
      // Fetch user info after login
      const userRes = await api.get('/agent/info', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(userRes.data);
      router.push('/dashboard'); 
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    // Use window.location instead of router.push to force a full page reload
    // This ensures all hooks and context are properly reset
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
