import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Lock, Sparkles, ArrowLeft, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { KidsGoldPassBanner } from "@/components/kids/KidsGoldPassBanner";

interface Props {
  children: ReactNode;
  /** Legacy prop — module credit tables are no longer used (unified ai_credits). */
  creditTable?: string;
  /** Legacy prop — all purchases now happen on /ai-credits. */
  pricingPath?: string;
  /** Displayed module name. */
  moduleName: string;
  /** Current path so /auth can return here. */
  redirectPath: string;
}

/** Credit price list shown on the paywall (server-side enforced). */
const KIDS_CREDIT_PRICES: { label: string; cost: string }[] = [
  { label: "Homework Helper", cost: "3 credits / question" },
  { label: "Science Lab", cost: "3 credits / answer" },
  { label: "Story Creator", cost: "8 credits / story" },
  { label: "Story illustration", cost: "3 credits / page" },
  { label: "Story read-aloud (TTS)", cost: "2 credits / page" },
  { label: "Drawing Buddy", cost: "5 credits / drawing" },
  { label: "Reading Companion", cost: "3 credits / analysis or quiz" },
  { label: "Word definition", cost: "1 credit" },
  { label: "Character Chat", cost: "1 credit / message" },
  { label: "Academy AI actions", cost: "3 credits / action" },
];

/**
 * Credit gate for Kids modules. Grants access if EITHER:
 *   1. User is an admin, OR
 *   2. User has at least 1 credit in the unified `ai_credits` balance.
 *
 * Every AI action inside the module deducts its own credit cost server-side.
 */
export const KidsGoldPassGate = ({
  children,
  moduleName,
  redirectPath,
}: Props) => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [balance, setBalance] = useState(0);

  const runCheck = async (uid: string): Promise<boolean> => {
    // 1. Admin bypass
    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid)
      .eq("role", "admin")
      .maybeSingle();
    if (role) return true;

    // 2. Unified AI credits balance
    const { data: credits } = await supabase
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", uid)
      .maybeSingle();
    const remaining = credits?.credits_remaining ?? 0;
    setBalance(remaining);
    return remaining >= 1;
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate(`/auth?redirect=${encodeURIComponent(redirectPath)}`);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const ok = await runCheck(user.id);
        if (!cancelled) { setAllowed(ok); setChecking(false); }
      } catch (e) {
        console.error("KidsGoldPassGate error", e);
        if (!cancelled) setChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, authLoading, moduleName, redirectPath, navigate]);

  if (checking || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (allowed) {
    return (
      <>
        <div className="px-4 pt-4">
          <KidsGoldPassBanner moduleName={moduleName} />
        </div>
        {children}
      </>
    );
  }

  // Inline paywall — no subscription, just AI credits
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background px-4 py-12 flex items-start justify-center">
      <Card className="w-full max-w-2xl p-8 md:p-10 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="relative">
          <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <Lock className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                AI credits required
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">{moduleName} needs credits</h1>
            </div>
          </div>

          <p className="text-muted-foreground mb-6">
            No subscription needed — Kids modules run on the same AI credits you use everywhere
            else on the platform. You currently have{" "}
            <span className="font-bold text-primary">{balance} credits</span>.
          </p>

          <div className="rounded-xl border bg-card/70 backdrop-blur p-5 mb-6">
            <div className="flex items-center gap-2 mb-3 font-semibold">
              <Coins className="h-4 w-4 text-primary" /> Kids credit prices
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {KIDS_CREDIT_PRICES.map((p) => (
                <li key={p.label} className="flex items-center justify-between gap-2 rounded-lg bg-muted/50 px-3 py-2">
                  <span>{p.label}</span>
                  <span className="font-semibold text-primary whitespace-nowrap">{p.cost}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className="flex-1 font-semibold shadow-lg"
              onClick={() => navigate("/ai-credits")}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Buy AI credits
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/kids-channel")}>
              Explore free content
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Credits never expire. Math games and free content stay open — you only pay for AI actions.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default KidsGoldPassGate;
