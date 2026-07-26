import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Lock, Sparkles, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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

const GOLD_PASS_FEATURES = [
  "Homework Helper",
  "Story Creator",
  "Drawing Buddy",
  "Science Lab",
  "Reading Companion",
  "Coloring Pages",
  "Fairy Castles",
  "Character Chat",
  "Bedtime Stories",
  "5 kids profiles",
  "Progress Reports",
  "Parental dashboard",
  "Priority support",
];

/**
 * Gate for Kids Gold Pass modules. Grants access if EITHER:
 *   1. Active Kids Gold Pass subscription (`check-kids-subscription`), OR
 *   2. Module has credits (`creditTable` row with credits >= 1), OR
 *   3. User has admin role.
 * Otherwise renders an inline paywall (Gold Pass upsell) — no redirect.
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
          const { data } = await supabase.functions.invoke("check-subscription", { body: { tier: "kids" } });
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

        // Denied → show inline paywall
        if (!cancelled) setChecking(false);
      } catch (e) {
        console.error("KidsGoldPassGate error", e);
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
  if (allowed) return <>{children}</>;

  // Inline paywall (no redirect) — new users see Gold Pass upsell for the module they tried to open
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-background to-background px-4 py-12 flex items-start justify-center">
      <Card className="w-full max-w-2xl p-8 md:p-10 shadow-xl border-amber-300/60 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-amber-100/40 via-transparent to-purple-100/40" />
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="mb-4 -ml-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-lg">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                Gold Pass required
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">{moduleName} is locked</h1>
            </div>
          </div>

          <p className="text-muted-foreground mb-6">
            Unlock <strong>{moduleName}</strong> and every Kids module with a single Gold Pass subscription.
            Cancel anytime.
          </p>

          <div className="rounded-xl border-2 border-amber-300 bg-white/70 backdrop-blur p-5 mb-6">
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-4xl font-black text-amber-600">€75</span>
              <span className="text-muted-foreground">/ month</span>
              <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                <Sparkles className="h-3 w-3" /> Fixed price
              </span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {GOLD_PASS_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-semibold shadow-lg"
              onClick={() => navigate(pricingPath)}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Get Gold Pass — €75/month
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/kids-channel")}
            >
              Explore free content
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-4">
            One subscription unlocks every Kids module. Cancel anytime from your account.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default KidsGoldPassGate;
