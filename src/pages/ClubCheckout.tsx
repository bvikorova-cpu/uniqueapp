import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, ExternalLink, Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ClubTier = "digital" | "physical";

export default function ClubCheckout() {
  const navigate = useNavigate();
  const { tier: rawTier } = useParams();
  const tier = rawTier === "physical" ? "physical" : rawTier === "digital" ? "digital" : null;
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const label = useMemo(() => {
    if (tier === "physical") return "Physical Unique VIP Club Card";
    return "Digital Unique VIP Club Card";
  }, [tier]);

  useEffect(() => {
    if (!tier) {
      navigate("/club", { replace: true });
      return;
    }

    let cancelled = false;

    async function createCheckout(selectedTier: ClubTier) {
      setError(null);
      try {
        const { data: u } = await supabase.auth.getUser();
        if (!u.user) {
          navigate(`/auth?redirect=/club/checkout/${selectedTier}`, { replace: true });
          return;
        }

        // Persist referral code across auth redirect via localStorage
        const params = new URLSearchParams(window.location.search);
        const refFromUrl = params.get("ref");
        if (refFromUrl) localStorage.setItem("unique_club_ref", refFromUrl);
        const referralCode = refFromUrl ?? localStorage.getItem("unique_club_ref") ?? "";

        const { data, error: invokeError } = await supabase.functions.invoke("create-club-checkout", {
          body: { tier: selectedTier, referralCode } });
        if (invokeError) throw invokeError;

        const url = (data as any)?.url;
        if (!url || typeof url !== "string") throw new Error("Stripe checkout URL was not returned.");
        if (cancelled) return;

        setCheckoutUrl(url);
      } catch (e: any) {
        const { reportError } = await import("@/lib/errorReporter");
        void reportError(e, { source: "stripe.club.checkout", context: { tier: selectedTier } });
        if (!cancelled) setError(e?.message ?? "Checkout failed. Please try again.");
      }
    }

    createCheckout(tier);
    return () => {
      cancelled = true;
    };
  }, [navigate, tier]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-amber-50 px-4 py-24 dark:from-purple-950 dark:via-pink-950 dark:to-amber-950">
      <Card className="mx-auto max-w-md border-2 border-amber-500/50 p-6 text-center shadow-2xl">
        <ShieldCheck className="mx-auto mb-4 h-12 w-12 text-amber-500" />
        <h1 className="text-2xl font-black">Opening secure Stripe checkout</h1>
        <p className="mt-2 text-sm text-muted-foreground">{label}</p>

        {!error && !checkoutUrl && (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Preparing payment…
          </div>
        )}

        {checkoutUrl && (
          <div className="mt-6 space-y-3">
            <Button asChild size="lg" className="h-12 w-full bg-gradient-to-r from-amber-500 via-pink-500 to-purple-500 text-base">
              <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                Open Stripe checkout <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 w-full text-base">
              <a href={checkoutUrl} target="_self">
                Open in this tab <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <p className="text-xs text-muted-foreground">
              Checkout is ready. Tap the first button; if your browser blocks new tabs, use “Open in this tab”.
            </p>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button asChild variant="ghost" className="mt-6">
          <Link to="/club">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Unique VIP Club
          </Link>
        </Button>
      </Card>
    </div>
  );
}