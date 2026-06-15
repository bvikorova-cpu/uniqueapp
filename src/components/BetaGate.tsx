import { useEffect, useState, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

/**
 * Closed Beta gate. Allows public routes (/auth, /reset-password, /legal/*),
 * blocks the rest unless the signed-in user's email is on `beta_whitelist`
 * (or the user is an admin).
 */
const PUBLIC_PREFIXES = ['/auth', '/reset-password', '/legal', '/privacy', '/terms'];

export function BetaGate({ children }: { children: ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const location = useLocation();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  const isPublicRoute = PUBLIC_PREFIXES.some((p) => location.pathname.startsWith(p));

  useEffect(() => {
    let cancelled = false;
    if (loading) return;
    if (!user) {
      setAllowed(null);
      return;
    }
    (async () => {
      const { data, error } = await supabase.rpc('is_current_user_whitelisted');
      if (cancelled) return;
      setAllowed(error ? false : !!data);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  if (isPublicRoute) return <>{children}</>;
  if (loading) return null;
  if (!user) return <>{children}</>; // auth pages / redirects handled downstream
  if (allowed === null) return null;
  if (allowed) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-2xl border border-border bg-card shadow-lg">
        <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
          <Lock className="w-7 h-7 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Closed Beta</h1>
          <p className="text-muted-foreground text-sm">
            Unique je momentálne v uzavretej bete. Prístup má len pozvaný okruh
            testerov.
          </p>
          <p className="text-xs text-muted-foreground/80 pt-2">
            Si prihlásený(á) ako <span className="font-medium">{user.email}</span>,
            ale tento e-mail nie je na whitelist.
          </p>
        </div>
        <Button variant="outline" onClick={signOut} className="w-full">
          Odhlásiť sa
        </Button>
      </div>
    </div>
  );
}
