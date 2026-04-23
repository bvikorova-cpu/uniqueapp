import { ReactNode, useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Lock, Star } from "lucide-react";
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
  const successHandledRef = useRef(false);

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
    if (!user) {
      setChecking(false);
      return;
    }

    const success = searchParams.get("success") === "true";
    const canceled = searchParams.get("canceled") === "true";
    const tier = searchParams.get("tier");

    (async () => {
      try {
        if (canceled && !successHandledRef.current) {
          successHandledRef.current = true;
          toast({
            title: "Payment canceled",
            description: "You can try again whenever you're ready.",
          });
          // strip query params
          const next = new URLSearchParams(searchParams);
          next.delete("canceled");
          setSearchParams(next, { replace: true });
        }

        if (success && !successHandledRef.current) {
          successHandledRef.current = true;
          toast({
            title: "Payment successful! 🎉",
            description: tier === "top_premium"
              ? "Welcome to MegaTalent TOP Premium!"
              : "Welcome to MegaTalent Premium!",
          });

          // Stripe needs a moment to propagate the active subscription.
          // Poll up to 5x with 1.5s delay.
          let ok = false;
          for (let i = 0; i < 5; i++) {
            ok = await runCheck();
            if (ok) break;
            await new Promise((r) => setTimeout(r, 1500));
          }
          setSubscribed(ok);

          // strip query params either way
          const next = new URLSearchParams(searchParams);
          next.delete("success");
          next.delete("tier");
          setSearchParams(next, { replace: true });

          if (!ok) {
            toast({
              title: "Still activating...",
              description: "Your payment was received but the subscription isn't active yet. Please refresh in a moment.",
              variant: "destructive",
            });
          }
          return;
        }

        const ok = await runCheck();
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
          <p className="text-muted-foreground">Checking MegaTalent access...</p>
        </div>
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
            <CardTitle className="text-2xl">MegaTalent Subscription Required</CardTitle>
            <CardDescription className="text-base">
              Get unlimited uploads, voting, prize eligibility and access to all categories.
              Choose a plan to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
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
                {checkoutLoading === "premium" ? <Loader2 className="h-4 w-4 animate-spin" /> : "€10 / month"}
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
                <Star className="h-4 w-4 fill-current" /> TOP Premium
              </span>
              <span className="font-bold">
                {checkoutLoading === "top_premium" ? <Loader2 className="h-4 w-4 animate-spin" /> : "€15 / month"}
              </span>
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate("/")}>
              Return Home
            </Button>
            <p className="text-xs text-muted-foreground text-center pt-2">
              Already paid? <button className="underline" onClick={() => window.location.reload()}>Refresh access</button>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
