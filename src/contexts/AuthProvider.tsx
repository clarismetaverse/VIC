import { createContext, useEffect, useMemo, useState } from 'react';
import type { AuthContextType, AuthUser } from './AuthContext';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = 'https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async (token: string) => {
    const response = await fetch(`${API_BASE}/user_turbo`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Unable to fetch user');
    return (await response.json()) as AuthUser;
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setIsLoading(false);
      return;
    }
    fetchUser(token)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('auth_token');
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE}/user_login_Upgrade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error('Login failed');
    const data = await response.json();
    const token = data.authToken ?? data.auth_token ?? data.token;
    if (!token) throw new Error('No auth token returned');
    localStorage.setItem('auth_token', token);
    const currentUser = await fetchUser(token);
    setUser(currentUser);
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!response.ok) throw new Error('Register failed');
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const value = useMemo(() => ({ user, isLoading, login, register, logout }), [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
