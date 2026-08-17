import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Lock } from "lucide-react";
import { toast } from "sonner";

/**
 * €1/month entry pass for Skills Marketplace only.
 * Wraps Skills Marketplace pages — no access without an active pass.
 */
export function SkillsAccessGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [busy, setBusy] = useState(false);

  const check = async () => {
    if (!user) {
      setHasAccess(false);
      setChecking(false);
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription", {
        body: { tier: "skills_marketplace" },
      });
      if (error) throw error;
      setHasAccess(Boolean(data?.subscribed ?? data?.hasSubscription));
    } catch (e) {
      console.error("Skills access check failed", e);
      setHasAccess(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const subscribe = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setBusy(true);
    try {
      const origin = window.location.origin;
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          product: "skills_marketplace",
          successUrl: `${origin}/marketplace?entry=success&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${origin}/marketplace?entry=canceled`,
        },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
      else throw new Error("No checkout URL");
    } catch (e: any) {
      toast.error(e?.message || "Could not start checkout");
    } finally {
      setBusy(false);
    }
  };

  if (checking) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (hasAccess) return <>{children}</>;

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <Card className="border-primary/30">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Skills Marketplace access</CardTitle>
          <p className="text-muted-foreground">
            Entry to the Skills section is €1/month. Cancel anytime.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-4xl font-bold">€1</span>
            <span className="text-muted-foreground">/ month</span>
          </div>
          <ul className="space-y-2 text-sm">
            {[
              "Browse every offering across all categories",
              "Contact providers and order services",
              "Publish your own offerings (2 credits per offering)",
              "0% listing commission",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <Button className="w-full" onClick={subscribe} disabled={busy}>
            {busy ? "Opening checkout…" : "Get access · €1/month"}
          </Button>
          <div className="text-center">
            <Badge variant="outline">Secure Stripe checkout · EUR</Badge>
          </div>
          <Button variant="ghost" className="w-full" onClick={check}>
            I already paid — refresh access
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
