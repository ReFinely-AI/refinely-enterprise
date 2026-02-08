import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import axios from 'axios';
import { User } from '../types/auth';

// ---------- TYPES ----------
interface RegisterData {
  email: string;
  password: string;
  full_name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refetchUser: () => Promise<void>;
  activeOrgId: number | null;
  setActiveOrgId: (orgId: number | null) => void;
}

// ---------- GLOBAL AXIOS CLIENT ----------
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// This client will be used everywhere (auth + reconciliation)
export const apiClient = axios.create({
  baseURL: API_URL,
});

// Attach token automatically from localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ---------- PROVIDER ----------
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeOrgId, setActiveOrgIdState] = useState<number | null>(null);

  // Helper to set token everywhere
  const applyToken = (accessToken: string | null) => {
    if (accessToken) {
      localStorage.setItem('token', accessToken);
      setToken(accessToken);
    } else {
      localStorage.removeItem('token');
      setToken(null);
    }
  };

  const setActiveOrgId = (orgId: number | null) => {
    if (orgId !== null) {
      localStorage.setItem('activeOrgId', String(orgId));
    } else {
      localStorage.removeItem('activeOrgId');
    }
    setActiveOrgIdState(orgId);
  };

  // Bootstrap: if token in localStorage, load user and active org
  useEffect(() => {
    const init = async () => {
      const savedToken = localStorage.getItem('token');
      const savedOrgId = localStorage.getItem('activeOrgId');

      if (savedOrgId) {
        const parsed = Number(savedOrgId);
        if (!Number.isNaN(parsed)) {
          setActiveOrgIdState(parsed);
        }
      }

      if (savedToken) {
        try {
          applyToken(savedToken);
          const res = await apiClient.get('/auth/me');
          setUser(res.data);
        } catch (err) {
          console.error('Bootstrap auth failed, clearing token', err);
          applyToken(null);
          setUser(null);
        }
      }

      setIsLoading(false);
    };
    void init();
  }, []);

  // Explicit refetch
  const refetchUser = async () => {
    const current = localStorage.getItem('token');
    if (!current) throw new Error('No token');

    const res = await apiClient.get('/auth/me');
    setUser(res.data);
    applyToken(current);
  };

  // Login
  const login = async (email: string, password: string) => {
    const res = await apiClient.post('/auth/login', { email, password });
    const accessToken: string = res.data.access_token;
    applyToken(accessToken);

    const me = await apiClient.get('/auth/me');
    setUser(me.data);
  };

  // Register (then login to get JWT)
  const register = async (data: RegisterData) => {
    // 1) Create the user (no token returned)
    await apiClient.post('/auth/register', data);

    // 2) Immediately login to obtain access_token
    const loginRes = await apiClient.post('/auth/login', {
      email: data.email,
      password: data.password,
    });
    const accessToken: string = loginRes.data.access_token;
    applyToken(accessToken);

    // 3) Fetch current user profile
    const me = await apiClient.get('/auth/me');
    setUser(me.data);
  };

  // Logout
  const logout = () => {
    applyToken(null);
    setUser(null);
    setActiveOrgId(null);
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
    activeOrgId,
    setActiveOrgId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ---------- HOOK ----------
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
