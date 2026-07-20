import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useIdleLogout } from '@/hooks/useIdleLogout';
import { usePresenceHeartbeat } from '@/hooks/usePresenceHeartbeat';
import { getPendingReturnTo } from '@/lib/pendingAction';
// WelcomeCreditsDialog removed — paid-only model (no free tier)

export type VerificationTier = 'none' | 'verified' | 'plus' | 'pro';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
  verificationTier: VerificationTier;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [verificationTier, setVerificationTier] = useState<VerificationTier>('none');
  const navigate = useNavigate();

  const fetchVerification = async (currentUserId?: string) => {
    const uid = currentUserId ?? user?.id;
    if (!uid) {
      setVerificationTier('none');
      return;
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('verification_tier')
        .eq('id', uid)
        .single();
      if (!error && data?.verification_tier) {
        setVerificationTier(data.verification_tier as VerificationTier);
      } else {
        setVerificationTier('none');
      }
    } catch {
      setVerificationTier('none');
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user?.id) fetchVerification(session.user.id);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.id) fetchVerification(session.user.id);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel('profile-verification')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, (payload) => {
        const newTier = (payload.new as any)?.verification_tier;
        if (newTier) setVerificationTier(newTier as VerificationTier);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        }
      }
    });

    // Only navigate when a session is established (email confirmation NOT required).
    // Otherwise the caller should show a "check your email" message and stay on /auth.
    if (!error && data?.session) {
      navigate(getPendingReturnTo() || '/');
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error && data?.session) {
      navigate(getPendingReturnTo() || '/');
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <AuthContext.Provider value={{ user, session, signUp, signIn, signOut, loading, verificationTier }}>
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
