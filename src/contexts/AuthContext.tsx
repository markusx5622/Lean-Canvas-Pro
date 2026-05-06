import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Sentry } from '../lib/sentry';
import {
  identifyUser,
  resetIdentity,
  trackSignUp,
  trackLogin,
  trackLogout,
} from '../lib/analytics';

// === Types ===

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  /** True while the initial session is being retrieved from Supabase. */
  loading: boolean;
  /** False when VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY are missing. */
  isSupabaseConfigured: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

// === Context ===

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// === Provider ===

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      // Supabase is not configured — skip all auth calls and mark loading done.
      setLoading(false);
      return;
    }

    // Retrieve existing session on mount (handles page reload).
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Keep state in sync whenever auth changes (sign in / sign out / token refresh).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      // Attach the user ID (never email) so Sentry events can be correlated
      // with a specific account without exposing personally-identifiable data.
      if (session?.user) {
        Sentry.setUser({ id: session.user.id });
        identifyUser(session.user.id);
      } else {
        Sentry.setUser(null);
        resetIdentity();
      }
      if (event === 'SIGNED_OUT') trackLogout();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    if (!supabase) return { error: 'Supabase no está configurado.' };
    const { error } = await supabase.auth.signUp({ email, password });
    if (!error) trackSignUp();
    return { error: error?.message ?? null };
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: 'Supabase no está configurado.' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) trackLogin();
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isSupabaseConfigured, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// === Hook ===

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
