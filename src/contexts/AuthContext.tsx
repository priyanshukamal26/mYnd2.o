import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken, clearToken, type Profile, type UserInfo } from '@/lib/api';

interface AuthUser {
  id: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, check if we have a token and fetch user data
  useEffect(() => {
    const token = getToken();
    if (token) {
      api.auth.me()
        .then((data: UserInfo) => {
          setUser({ id: data.id, email: data.email });
          setProfile(data.profile);
        })
        .catch(() => {
          clearToken();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    const res = await api.auth.register(email, password, firstName, lastName);
    setToken(res.token);
    setUser({ id: res.user.id, email: res.user.email });
    setProfile(res.user.profile);
  };

  const signIn = async (email: string, password: string) => {
    const res = await api.auth.login(email, password);
    setToken(res.token);
    setUser({ id: res.user.id, email: res.user.email });
    setProfile(res.user.profile);
  };

  const signOut = async () => {
    clearToken();
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (!getToken()) return;
    try {
      const data = await api.auth.me();
      setProfile(data.profile);
    } catch (e) {
      console.error('Error refreshing profile:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
