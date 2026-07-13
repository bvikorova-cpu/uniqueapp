import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useIdleLogout } from '@/hooks/useIdleLogout';
import { usePresenceHeartbeat } from '@/hooks/usePresenceHeartbeat';
import { getPendingReturnTo } from '@/lib/pendingAction';
// WelcomeCreditsDialog removed — paid-only model (no free tier)

const AUTH_REQUEST_TIMEOUT_MS = 8000;

function withAuthTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error(`${label} timeout`)), AUTH_REQUEST_TIMEOUT_MS);
    }),
  ]);
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session (with fallback if fetch fails/hangs)
    const failsafe = setTimeout(() => setLoading(false), 5000);
    withAuthTimeout(supabase.auth.getSession(), 'Session check')
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
      })
      .catch((err) => {
        console.warn("[Auth] getSession failed, continuing unauthenticated:", err?.message);
      })
      .finally(() => {
        clearTimeout(failsafe);
        setLoading(false);
      });

    return () => {
      clearTimeout(failsafe);
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;

    let data: any = null;
    let error: any = null;

    try {
      const result = await withAuthTimeout(
        supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: fullName,
            }
          }
        }),
        'Registration'
      );
      data = result.data;
      error = result.error;
    } catch (err: any) {
      error = err ?? new Error('Registration failed');
    }

    // Only navigate when a session is established (email confirmation NOT required).
    // Otherwise the caller should show a "check your email" message and stay on /auth.
    if (!error && data?.session) {
      navigate(getPendingReturnTo() || '/');
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    let data: any = null;
    let error: any = null;

    try {
      const result = await withAuthTimeout(
        supabase.auth.signInWithPassword({
          email,
          password,
        }),
        'Login'
      );
      data = result.data;
      error = result.error;
    } catch (err: any) {
      error = err ?? new Error('Login failed');
    }

    if (!error && data?.session) {
      navigate(getPendingReturnTo() || '/');
    }

    return { error };
  };

  const signOut = async () => {
    await withAuthTimeout(supabase.auth.signOut(), 'Logout').catch(() => undefined);
    navigate('/auth');
  };

  return (
    <AuthContext.Provider value={{ user, session, signUp, signIn, signOut, loading }}>
      <IdleLogoutMount />
      <PresenceMount userId={user?.id ?? null} />
      {children}
    </AuthContext.Provider>
  );
}

function IdleLogoutMount() {
  // P4: enforce 30 min idle auto sign-out when a session is active.
  // Hook is a no-op for anonymous users.
  useIdleLogout();
  return null;
}

function PresenceMount({ userId }: { userId: string | null }) {
  // Global heartbeat so `last_seen` reflects real activity anywhere in the app,
  // not only while the Messenger page is open.
  usePresenceHeartbeat(userId);
  return null;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
