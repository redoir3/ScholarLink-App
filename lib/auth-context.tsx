'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { createSupabaseClient } from '@/lib/supabaseClient';

export type UserRole = 'student' | 'organization' | 'admin' | null;

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  role: UserRole;
  loading: boolean;
  mounted: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  isOrg: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function resolveRole(user: User | null): UserRole {
  if (!user) return null;
  const meta =
    (user.app_metadata?.role as string) || (user.user_metadata?.role as string) || '';
  if (meta === 'admin' || meta === 'organization' || meta === 'student') return meta;
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@locallink.app';
  if (user.email?.toLowerCase() === adminEmail.toLowerCase()) return 'admin';
  return 'student';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const applySession = useCallback((s: Session | null) => {
    setSession(s);
    const u = s?.user ?? null;
    setUser(u);
    // Roles from JWT metadata only — do NOT query public.profiles
    // (recursive RLS on profiles causes HTTP 500)
    setRole(resolveRole(u));
    setLoading(false);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const client = createSupabaseClient();
      const { data } = await client.auth.getSession();
      applySession(data.session);
    } catch {
      applySession(null);
    }
  }, [applySession]);

  useEffect(() => {
    setMounted(true);
    const client = createSupabaseClient();
    void refresh();
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, s) => {
      applySession(s);
    });
    return () => subscription.unsubscribe();
  }, [applySession, refresh]);

  const signOut = useCallback(async () => {
    try {
      const client = createSupabaseClient();
      await client.auth.signOut();
    } finally {
      setUser(null);
      setSession(null);
      setRole(null);
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      session,
      role,
      loading: !mounted || loading,
      mounted,
      isAuthenticated: !!user,
      isAdmin: role === 'admin',
      isStudent: role === 'student' || role === 'admin',
      isOrg: role === 'organization' || role === 'admin',
      signOut,
      refresh,
    }),
    [user, session, role, loading, mounted, signOut, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
