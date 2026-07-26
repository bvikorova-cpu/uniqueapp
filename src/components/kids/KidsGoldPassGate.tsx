import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Props {
  children: ReactNode;
  /** Module credit table (e.g. "kids_story_credits"). If provided and row has credits > 0, pass. */
  creditTable?: string;
  /** Module-specific pricing page for redirect. Defaults to /kids-pricing (Gold Pass). */
  pricingPath?: string;
  /** Displayed module name for the toast. */
  moduleName: string;
  /** Current path so /auth can return here. */
  redirectPath: string;
}

/**
 * Gate for Kids Gold Pass modules. Grants access if EITHER:
 *   1. Active Kids Gold Pass subscription (`check-kids-subscription`), OR
 *   2. Module has credits (`creditTable` row with credits >= 1), OR
 *   3. User has admin role.
 * Otherwise redirects to the pricing page.
 */
export const KidsGoldPassGate = ({
  children,
  creditTable,
  pricingPath = "/kids-pricing",
  moduleName,
  redirectPath,
}: Props) => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate(`/auth?redirect=${encodeURIComponent(redirectPath)}`);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        // 1. Admin bypass
        const { data: role } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();
        if (cancelled) return;
        if (role) { setAllowed(true); setChecking(false); return; }

        // 2. Gold Pass subscription
        try {
          const { data } = await supabase.functions.invoke("check-kids-subscription");
          if (cancelled) return;
          if ((data as any)?.subscribed) { setAllowed(true); setChecking(false); return; }
        } catch { /* fall through to credit check */ }

        // 3. Module credits (all kids credit tables use `credits_remaining`)
        if (creditTable) {
          const { data: credits } = await (supabase as any)
            .from(creditTable)
            .select("credits_remaining")
            .eq("user_id", user.id)
            .maybeSingle();
          if (cancelled) return;
          if ((credits?.credits_remaining ?? 0) >= 1) { setAllowed(true); setChecking(false); return; }
        }

        // Denied
        toast.info(`${moduleName} requires an active Kids Gold Pass or credits.`);
        navigate(pricingPath);
      } catch (e) {
        console.error("KidsGoldPassGate error", e);
        navigate(pricingPath);
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id, authLoading, creditTable, pricingPath, moduleName, redirectPath, navigate]);

  if (checking || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  if (!allowed) return null;
  return <>{children}</>;
};

export default KidsGoldPassGate;
