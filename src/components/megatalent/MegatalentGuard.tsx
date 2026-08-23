import { ReactNode, useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";

import { Loader2, Lock, Star, CheckCircle2, Sparkles, Eye, Heart, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { safeInvoke } from "@/utils/safeInvoke";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface PreviewSubmission {
  id: string;
  title: string | null;
  media_url: string | null;
  media_type: string | null;
  category: string | null;
  votes_count: number | null;
}

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
  const [searchParams] = useSearchParams();
  const [checking, setChecking] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<null | "premium" | "top_premium">(null);
  const [activating, setActivating] = useState(false);
  const [activatedTier, setActivatedTier] = useState<null | "premium" | "top_premium">(null);
  const [previewItems, setPreviewItems] = useState<PreviewSubmission[]>([]);
  const [previewLoaded, setPreviewLoaded] = useState(false);
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

  /**
   * Synchronously strip Stripe redirect params (success, tier, canceled,
   * session_id) from the URL using history.replaceState. This runs BEFORE any
   * async work, so a user pressing back/forward or refreshing immediately after
   * payment will never see the activation flow re-trigger.
   *
   * Using window.history directly (instead of setSearchParams) is intentional:
   *  - it's synchronous (no React render cycle delay)
   *  - it doesn't add a history entry (replace, not push)
   *  - it preserves any other unrelated query params the user might have
   */
  const stripStripeParamsFromUrl = () => {
    try {
      const url = new URL(window.location.href);
      let mutated = false;
      for (const key of ["success", "tier", "canceled", "session_id"]) {
        if (url.searchParams.has(key)) {
          url.searchParams.delete(key);
          mutated = true;
        }
      }
      if (mutated) {
        const newUrl = url.pathname + (url.searchParams.toString() ? `?${url.searchParams}` : "") + url.hash;
        window.history.replaceState(window.history.state, "", newUrl);
      }
    } catch (e) {
      console.warn("Failed to strip Stripe params from URL", e);
    }
  };

  const runCheck = async (): Promise<boolean> => {
    if (!user) return false;
    // 1) Admins bypass
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (roleData) return true;

    // 2) DB-first: trust local active row (fast, no Stripe round-trip).
    //    Stripe webhook + check-megatalent-subscription keep this fresh.
    const { data: localSub } = await supabase
      .from("megatalent_subscriptions")
      .select("status, current_period_end")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();
    if (localSub) {
      const stillValid = !localSub.current_period_end ||
        new Date(localSub.current_period_end).getTime() > Date.now();
      if (stillValid) return true;
    }

    // 3) Fallback: hit Stripe via edge function (slower, ~2-6s).
    const { data, error } = await safeInvoke("check-megatalent-subscription");
    if (error) {
      console.error("MegaTalent subscription check failed:", error);
      return false;
    }
    return data?.subscribed === true;
  };

  // Hard safety net: if checking takes >8s, stop blocking the UI and show paywall.
  // Better than an infinite spinner — user can retry or contact support.
  useEffect(() => {
    const t = setTimeout(() => {
      setChecking((prev) => {
        if (prev) {
          console.warn("[MegatalentGuard] check timeout — releasing UI");
        }
        return false;
      });
    }, 8000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (authLoading) return;

    const success = searchParams.get("success") === "true";
    const canceled = searchParams.get("canceled") === "true";
    const tier = searchParams.get("tier");

    // ⚡ STRIP Stripe redirect params SYNCHRONOUSLY before any further work.
    // This guarantees that back/forward/refresh after payment cannot re-trigger
    // the activation flow — the URL is clean within the same tick.
    if (success || canceled || tier) {
      stripStripeParamsFromUrl();
    }

    // ── Session lost during/after payment ─────────────────────────────────
    // If we don't have a user but a payment is pending (either via ?success=true
    // or a previously stored marker), preserve the payment info and bounce to /auth
    // with a redirect param. After login, we'll resume the activation flow.
    if (!user) { if (success) {
        markPendingPayment(tier);
        toast({
          title: "Payment received ✅ — log in",
          description: "Your session has expired. After logging in, we will automatically activate your access." });
        navigate("/auth?redirect=/megatalent", { replace: true });
        return;
      }
      if (hasPendingPayment()) { toast({
          title: "Activation completion",
          description: "Log in to activate your MegaTalent subscription." });
        navigate("/auth?redirect=/megatalent", { replace: true });
        return;
      }
      setChecking(false);
      return;
    }

    (async () => { try {
        if (canceled && !successHandledRef.current) {
          successHandledRef.current = true;
          clearPendingPayment();
          toast({
            title: "Payment canceled",
            description: "You can try again anytime." });
          // URL params already stripped synchronously above.
        }

        // After-payment activation flow. Triggered by Stripe redirect (?success=true),
        // a follow-up hard reload (sessionStorage flag), OR a pending marker that
        // survived a sign-out / page close.
        const reloadFlag = sessionStorage.getItem(RELOAD_KEY);
        const pending = hasPendingPayment();
        const isPostPayment = success || reloadFlag === "1" || pending;

        if (isPostPayment && !successHandledRef.current) { successHandledRef.current = true;

          // Persist pending marker for the duration of activation (survives reload/logout)
          markPendingPayment(tier);

          if (success) {
            toast({
              title: "Payment successful! 🎉",
              description: tier === "top_premium"
                ? "Welcome to MegaTalent TOP Premium! Activating access..."
                : "Welcome to MegaTalent Premium! Activating access..." });
            // URL params already stripped synchronously above.
          } else if (pending && !reloadFlag) { toast({
              title: "Continuing activation",
              description: "Finishing your subscription activation after login..." });
          }

          setActivating(true);
          setChecking(false);

          // Poll up to 6x with 1s delay (~6s total). Verify session before each
          // call — if it died mid-flight, redirect to /auth keeping the pending marker.
          let ok = false;
          for (let i = 0; i < 6; i++) { const alive = await ensureSessionAlive();
            if (!alive) {
              toast({
                title: "Session expired",
                description: "Log in again — payment is saved and activation will continue.",
                variant: "destructive" });
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
          toast({ title: "Activation is taking longer than usual",
            description: "Payment received, Stripe is still processing it. Try to refresh access in a moment.",
            variant: "destructive" });
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

  // Fetch 3 latest active submissions for preview tease above paywall.
  // Runs only when paywall is about to show (no active subscription, done checking).
  useEffect(() => {
    if (checking || activating || activatedTier || subscribed) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from("talent_submissions")
          .select("id, title, media_url, media_type, category, votes_count")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(3);
        if (!cancelled && data) setPreviewItems(data as PreviewSubmission[]);
      } catch (err) {
        console.warn("[MegatalentGuard] preview fetch failed", err);
      } finally {
        if (!cancelled) setPreviewLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, [checking, activating, activatedTier, subscribed]);

  const startCheckout = async (tier: "premium" | "top_premium") => {
    setCheckoutLoading(tier);
    try {
      const { data, error } = await supabase.functions.invoke("create-megatalent-checkout", {
        body: { tier } });
      if (error) throw error;
      if (data?.url) {
        // Redirect in same tab so Stripe sends user back to /megatalent?success=true
        { const __w = window.open(data.url, "_blank", "noopener,noreferrer"); if (!__w) { const __w = window.open(data.url, "_blank", "noopener,noreferrer"); if (!__w) window.location.href = data.url; } }
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: any) { toast({
        title: "Checkout failed",
        description: err?.message ?? "Could not start checkout. Please try again.",
        variant: "destructive" });
    } finally {
      setCheckoutLoading(null);
    }
  };

  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking MegaTalent access...</p>
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
            <CardTitle className="text-2xl">{"Activating your subscription..."}</CardTitle>
            <CardDescription className="text-base">
              {"Payment received. Stripe needs a few seconds to activate — we'll redirect you to MegaTalent automatically as soon as it's ready."}
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
                {isTop ? "MegaTalent TOP Premium activated" : "MegaTalent Premium activated"}
              </span>
            </div>
            <CardTitle className="text-2xl">{"Welcome to the contest! 🏆"}</CardTitle>
            <CardDescription className="text-base">
              {isTop
                ? "You have access to all features + 2× vote weight and daily vote-boost."
                : "You have access to all categories, AI tools and voting."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <ul className="text-sm space-y-1.5 bg-muted/40 rounded-lg p-3">
              <li>{"✅ Unlimited photo & video uploads"}</li>
              <li>{"✅ Access to all 35+ categories"}</li>
              <li>{"✅ AI Talent Coach and all AI tools"}</li>
              <li>{"✅ Eligible for cash prizes for winners"}</li>
              {isTop && (
                <>
                  <li>{"⭐ 2× vote weight"}</li>
                  <li>{"⭐ Daily vote-boost and TOP Premium badge"}</li>
                </>
              )}
            </ul>
            <p className="text-xs text-muted-foreground text-center pt-1">
              {"Opening MegaTalent..."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Every registered user can browse MegaTalent. A subscription (€10 / €15) is
  // only required to publish a submission — enforced at upload time.


  return <>{children}</>;
};
