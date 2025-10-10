"use client";
import * as React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../utils/api';

interface User {
  _id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  businessId: string;
  role: string;
  phone: string;
  profilePic: string;
  createdAt: string;
  deletedAt: string | null;
  __v: number;
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
    console.log("=== AUTH CONTEXT DEBUG ===");
    console.log("Current User State:", user);
    console.log("Current Loading State:", isLoading);
    console.log("========================");
  }, [user, isLoading]);
  
  useEffect(() => {
    // Check for stored token and fetch user info
    const token = localStorage.getItem('token');
    if (token) {
      console.log("Token found, fetching user info...");
      api.get('/agent/info')
        .then(res => {
          console.log("API Response from /agent/info:", res.data);
          // Convert ObjectId to string if needed
          const userData = {
            ...res.data,
            businessId: res.data.businessId?.toString() || res.data.businessId
          };
          console.log("Processed user data:", userData);
          setUser(userData);
        })
        .catch((err) => {
          console.error("Error fetching user info:", err);
          setUser(null);
          localStorage.removeItem('token');
        })
        .finally(() => setIsLoading(false));
    } else {
      console.log("No token found");
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
      // Convert ObjectId to string if needed
      const userData = {
        ...userRes.data,
        businessId: userRes.data.businessId?.toString() || userRes.data.businessId
      };
      setUser(userData);
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
