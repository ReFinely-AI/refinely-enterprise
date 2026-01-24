import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import axios, { AxiosError } from 'axios';
import { User } from '../types/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refetchUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  full_name?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          await refetchUser(savedToken);
        } catch {
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const refetchUser = async (currentToken?: string) => {
    const tokenToUse = currentToken || localStorage.getItem('token');
    if (!tokenToUse) throw new Error('No token');

    const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${tokenToUse}` }
    });

    const userData = response.data;
    setUser(userData);
    setToken(tokenToUse);
    localStorage.setItem('token', tokenToUse);
    axios.defaults.headers.common['Authorization'] = `Bearer ${tokenToUse}`;
  };

  const login = async (email: string, password: string) => {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { email, password });
    await refetchUser(response.data.access_token);
  };

  const register = async (data: RegisterData) => {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, data);
    await refetchUser(response.data.access_token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{
      user, token, isLoading, login, register, logout, refetchUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
