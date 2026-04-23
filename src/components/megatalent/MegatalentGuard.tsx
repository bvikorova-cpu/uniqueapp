import { ReactNode, useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Lock, Star, CheckCircle2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { safeInvoke } from "@/utils/safeInvoke";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface MegatalentGuardProps {
  children: ReactNode;
}

/**
 * Gate for /megatalent and /megatalent/:category.
 * Requires an active MegaTalent subscription (€10 Premium or €15 TOP Premium).
 * Admins bypass the check. Handles ?success=true / ?canceled=true returns from Stripe.
 */
export const MegatalentGuard = ({ children }: MegatalentGuardProps) => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [checking, setChecking] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<null | "premium" | "top_premium">(null);
  const [activating, setActivating] = useState(false);
  const [activatedTier, setActivatedTier] = useState<null | "premium" | "top_premium">(null);
  const successHandledRef = useRef(false);

  // Pending payment marker survives session loss (localStorage, not sessionStorage)
  const PENDING_KEY = "megatalent_pending_payment";
  const RELOAD_KEY = "megatalent_post_payment_reload";

  const markPendingPayment = (tier: string | null) => {
    try {
      localStorage.setItem(
        PENDING_KEY,
        JSON.stringify({ tier: tier || "premium", at: Date.now() }),
      );
    } catch { /* ignore quota errors */ }
  };

  const clearPendingPayment = () => {
    try {
      localStorage.removeItem(PENDING_KEY);
      sessionStorage.removeItem(RELOAD_KEY);
    } catch { /* ignore */ }
  };

  const hasPendingPayment = (): boolean => {
    try {
      const raw = localStorage.getItem(PENDING_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      // Pending markers older than 1 hour are considered stale
      if (Date.now() - (parsed?.at ?? 0) > 60 * 60 * 1000) {
        localStorage.removeItem(PENDING_KEY);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  };

  // Verify the auth session is still valid. Returns false if the user was
  // signed out or the JWT expired during the activation polling window.
  const ensureSessionAlive = async (): Promise<boolean> => {
    const { data, error } = await supabase.auth.getSession();
    if (error) return false;
    return !!data.session;
  };

  const runCheck = async (): Promise<boolean> => {
    if (!user) return false;
    // Admins bypass
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (roleData) return true;

    const { data, error } = await safeInvoke("check-megatalent-subscription");
    if (error) {
      console.error("MegaTalent subscription check failed:", error);
      return false;
    }
    return data?.subscribed === true;
  };

  useEffect(() => {
    if (authLoading) return;

    const success = searchParams.get("success") === "true";
    const canceled = searchParams.get("canceled") === "true";
    const tier = searchParams.get("tier");

    // ── Session lost during/after payment ─────────────────────────────────
    // If we don't have a user but a payment is pending (either via ?success=true
    // or a previously stored marker), preserve the payment info and bounce to /auth
    // with a redirect param. After login, we'll resume the activation flow.
    if (!user) {
      if (success) {
        markPendingPayment(tier);
        toast({
          title: "Platba prijatá ✅ — prihlás sa",
          description: "Tvoja session vypršala. Po prihlásení automaticky aktivujeme prístup.",
        });
        navigate("/auth?redirect=/megatalent", { replace: true });
        return;
      }
      if (hasPendingPayment()) {
        toast({
          title: "Dokončenie aktivácie",
          description: "Prihlás sa, aby sme aktivovali tvoje MegaTalent predplatné.",
        });
        navigate("/auth?redirect=/megatalent", { replace: true });
        return;
      }
      setChecking(false);
      return;
    }

    (async () => {
      try {
        if (canceled && !successHandledRef.current) {
          successHandledRef.current = true;
          clearPendingPayment();
          toast({
            title: "Platba zrušená",
            description: "Môžeš to skúsiť znova kedykoľvek.",
          });
          const next = new URLSearchParams(searchParams);
          next.delete("canceled");
          setSearchParams(next, { replace: true });
        }

        // After-payment activation flow. Triggered by Stripe redirect (?success=true),
        // a follow-up hard reload (sessionStorage flag), OR a pending marker that
        // survived a sign-out / page close.
        const reloadFlag = sessionStorage.getItem(RELOAD_KEY);
        const pending = hasPendingPayment();
        const isPostPayment = success || reloadFlag === "1" || pending;

        if (isPostPayment && !successHandledRef.current) {
          successHandledRef.current = true;

          // Persist pending marker for the duration of activation (survives reload/logout)
          markPendingPayment(tier);

          if (success) {
            toast({
              title: "Platba úspešná! 🎉",
              description: tier === "top_premium"
                ? "Vitaj v MegaTalent TOP Premium! Aktivujem prístup..."
                : "Vitaj v MegaTalent Premium! Aktivujem prístup...",
            });
            const next = new URLSearchParams(searchParams);
            next.delete("success");
            next.delete("tier");
            setSearchParams(next, { replace: true });
          } else if (pending && !reloadFlag) {
            toast({
              title: "Pokračujem v aktivácii",
              description: "Dokončujem aktiváciu tvojho predplatného po prihlásení...",
            });
          }

          setActivating(true);
          setChecking(false);

          // Poll up to 6x with 1s delay (~6s total). Verify session before each
          // call — if it died mid-flight, redirect to /auth keeping the pending marker.
          let ok = false;
          for (let i = 0; i < 6; i++) {
            const alive = await ensureSessionAlive();
            if (!alive) {
              toast({
                title: "Session vypršala",
                description: "Prihlás sa znova — platba je uložená a aktivácia bude pokračovať.",
                variant: "destructive",
              });
              navigate("/auth?redirect=/megatalent", { replace: true });
              return;
            }
            ok = await runCheck();
            if (ok) break;
            await new Promise((r) => setTimeout(r, 1000));
          }

          if (ok) {
            clearPendingPayment();
            // Determine tier: prefer URL param, else stored pending marker
            let resolvedTier: "premium" | "top_premium" = "premium";
            const urlTier = tier;
            if (urlTier === "top_premium" || urlTier === "premium") {
              resolvedTier = urlTier;
            } else {
              try {
                const raw = localStorage.getItem(PENDING_KEY);
                if (raw) {
                  const parsed = JSON.parse(raw);
                  if (parsed?.tier === "top_premium") resolvedTier = "top_premium";
                }
              } catch { /* ignore */ }
            }
            setActivatedTier(resolvedTier);
            setActivating(false);
            // Show success screen for ~2.5s before granting access
            setTimeout(() => {
              setSubscribed(true);
              setActivatedTier(null);
            }, 2500);
            return;
          }

          // Not active after polling — try one hard reload (only once per attempt)
          if (reloadFlag !== "1") {
            sessionStorage.setItem(RELOAD_KEY, "1");
            await new Promise((r) => setTimeout(r, 600));
            window.location.replace("/megatalent");
            return;
          }

          // Reload already attempted — show paywall with informative message.
          // Keep the pending marker so a manual refresh / re-login can still resume.
          sessionStorage.removeItem(RELOAD_KEY);
          setActivating(false);
          setSubscribed(false);
          toast({
            title: "Aktivácia trvá dlhšie ako zvyčajne",
            description: "Platba prijatá, Stripe ju ešte spracováva. Skús obnoviť prístup o chvíľu.",
            variant: "destructive",
          });
          return;
        }

        const ok = await runCheck();
        if (ok) clearPendingPayment(); // any stale pending marker is now obsolete
        setSubscribed(ok);
      } catch (err) {
        console.error("MegatalentGuard error:", err);
        setSubscribed(false);
      } finally {
        setChecking(false);
      }
    })();
  }, [user, authLoading]);

  const startCheckout = async (tier: "premium" | "top_premium") => {
    setCheckoutLoading(tier);
    try {
      const { data, error } = await supabase.functions.invoke("create-megatalent-checkout", {
        body: { tier },
      });
      if (error) throw error;
      if (data?.url) {
        // Redirect in same tab so Stripe sends user back to /megatalent?success=true
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: any) {
      toast({
        title: "Checkout failed",
        description: err?.message ?? "Could not start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCheckoutLoading(null);
    }
  };

  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Kontrolujem prístup do MegaTalent...</p>
        </div>
      </div>
    );
  }

  if (activating) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
        <Card className="max-w-md w-full border-2 border-primary/40 shadow-2xl">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <CardTitle className="text-2xl">Aktivujem tvoje predplatné...</CardTitle>
            <CardDescription className="text-base">
              Platba prijatá. Stripe potrebuje pár sekúnd na aktiváciu — automaticky ťa presmerujeme do MegaTalentu, len čo bude pripravené.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (activatedTier) {
    const isTop = activatedTier === "top_premium";
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/10 animate-in fade-in duration-300">
        <Card className="max-w-md w-full border-2 border-primary/50 shadow-2xl">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto w-20 h-20 rounded-full bg-green-500/15 flex items-center justify-center animate-in zoom-in duration-500">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <div className="flex justify-center">
              <span
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold ${
                  isTop
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
                    : "bg-primary/15 text-primary border border-primary/30"
                }`}
              >
                {isTop ? <Sparkles className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                MegaTalent {isTop ? "TOP Premium" : "Premium"} aktivované
              </span>
            </div>
            <CardTitle className="text-2xl">Vitaj v súťaži! 🏆</CardTitle>
            <CardDescription className="text-base">
              {isTop
                ? "Máš prístup ku všetkým funkciám + 2× váhu hlasu a denný vote-boost."
                : "Máš prístup ku všetkým kategóriám, AI nástrojom a hlasovaniu."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <ul className="text-sm space-y-1.5 bg-muted/40 rounded-lg p-3">
              <li>✅ Neobmedzené uploady fotiek a videí</li>
              <li>✅ Prístup ku všetkým 35+ kategóriám</li>
              <li>✅ AI Talent Coach a všetky AI nástroje</li>
              <li>✅ Nárok na peňažné odmeny pre víťazov</li>
              {isTop && (
                <>
                  <li>⭐ <strong>2× váha tvojich hlasov</strong></li>
                  <li>⭐ <strong>Denný vote-boost</strong> a TOP Premium odznak</li>
                </>
              )}
            </ul>
            <p className="text-xs text-muted-foreground text-center pt-1">
              Otváram MegaTalent...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!subscribed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
        <Card className="max-w-lg w-full border-2 border-primary/40 shadow-2xl">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Odomkni MegaTalent súťaž 🏆</CardTitle>
            <CardDescription className="text-base">
              Nahrávaj fotky a videá, súťaž o peňažné ceny v 35+ kategóriách
              a získaj viditeľnosť pred tisíckami fanúšikov. Predplatné spustíš za pár sekúnd.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="text-sm space-y-1.5 bg-muted/40 rounded-lg p-3">
              <li>✅ Neobmedzené uploady fotiek a videí</li>
              <li>✅ Hlasovanie a Live Leaderboard</li>
              <li>✅ Prístup ku všetkým AI Talent nástrojom</li>
              <li>✅ Nárok na peňažné odmeny pre víťazov</li>
            </ul>
            <Button
              size="lg"
              className="w-full justify-between"
              onClick={() => startCheckout("premium")}
              disabled={checkoutLoading !== null}
            >
              <span className="flex items-center gap-2">
                <Star className="h-4 w-4" /> Premium
              </span>
              <span className="font-bold">
                {checkoutLoading === "premium" ? <Loader2 className="h-4 w-4 animate-spin" /> : "€10 / mesiac"}
              </span>
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="w-full justify-between"
              onClick={() => startCheckout("top_premium")}
              disabled={checkoutLoading !== null}
            >
              <span className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-current" /> TOP Premium <span className="text-xs opacity-80">(2× váha hlasu)</span>
              </span>
              <span className="font-bold">
                {checkoutLoading === "top_premium" ? <Loader2 className="h-4 w-4 animate-spin" /> : "€15 / mesiac"}
              </span>
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate("/")}>
              Späť na hlavnú stránku
            </Button>
            <p className="text-xs text-muted-foreground text-center pt-2">
              Už si zaplatil? <button className="underline" onClick={() => window.location.reload()}>Obnoviť prístup</button>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
