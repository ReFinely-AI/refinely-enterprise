import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import axios from 'axios';
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

  // 1) Setup axios baseURL and token header
  useEffect(() => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    axios.defaults.baseURL = base;

    // If a token was already in localStorage, attach it
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      setToken(savedToken);
    }
  }, []);

  // 2) On first load, if token exists, fetch user
  useEffect(() => {
    const bootstrap = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          await refetchUser(savedToken);
        } catch {
          // token invalid → clear everything
          localStorage.removeItem('token');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };
    bootstrap();
  }, []);

  // Helper to set token in state + axios + localStorage
  const applyToken = (accessToken: string) => {
    localStorage.setItem('token', accessToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    setToken(accessToken);
  };

  // 3) Fetch current user
  const refetchUser = async (tokenOverride?: string) => {
    const tokenToUse = tokenOverride || localStorage.getItem('token');
    if (!tokenToUse) throw new Error('No token');

    applyToken(tokenToUse);

    const res = await axios.get('/auth/me');
    setUser(res.data);
  };

  // 4) Login
  const login = async (email: string, password: string) => {
    const res = await axios.post('/auth/login', { email, password });
    const accessToken: string = res.data.access_token;
    applyToken(accessToken);
    await refetchUser(accessToken);
  };

  // 5) Register (auto-login)
  const register = async (data: RegisterData) => {
    const res = await axios.post('/auth/register', data);
    const accessToken: string = res.data.access_token;
    applyToken(accessToken);
    await refetchUser(accessToken);
  };

  // 6) Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    window.location.href = '/login';
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    refetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
