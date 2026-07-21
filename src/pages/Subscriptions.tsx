import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Crown, Shield, Star, ExternalLink, RefreshCw, CreditCard, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { FanClubMembershipsCard } from "@/components/profile/FanClubMembershipsCard";

type ClubMembership = {
  tier: "digital" | "physical";
  status: string;
  current_period_end: string | null;
  cancel_at_period_end?: boolean | null;
  member_number?: number | null;
};

type VerifiedState = {
  tier: "none" | "verified" | "plus" | "pro";
  status: "none" | "active" | "canceling" | "expired";
  expiresAt: string | null;
};

const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—";

export default function Subscriptions() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);
  const [club, setClub] = useState<ClubMembership | null>(null);
  const [verified, setVerified] = useState<VerifiedState>({ tier: "none", status: "none", expiresAt: null });

  const load = async () => {
    setLoading(true);
    try {
      const [{ data: clubData }, { data: verData }] = await Promise.all([
        supabase.functions.invoke("check-club-status").catch(() => ({ data: null })),
        supabase.functions.invoke("check-verification").catch(() => ({ data: null })),
      ]);
      setClub((clubData as any)?.membership ?? null);
      if (verData) {
        setVerified({
          tier: (verData as any).tier ?? "none",
          status: (verData as any).status ?? "none",
          expiresAt: (verData as any).expiresAt ?? null,
        });
      }
    } catch (e) {
      console.error("[Subscriptions.load]", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) load();
  }, [authLoading, user?.id]);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
    toast.success("Refreshed");
  };

  const openBillingPortal = async () => {
    setOpeningPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke("billing-portal", {
        body: { return_url: `${window.location.origin}/subscriptions` },
      });
      if (error) throw error;
      const url = (data as any)?.url;
      if (!url) throw new Error("No portal URL");
      window.location.assign(url);
    } catch (e: any) {
      console.error("[billing-portal]", e);
      toast.error(e?.message ?? "Could not open billing portal. Do you have an active subscription?");
    } finally {
      setOpeningPortal(false);
    }
  };

  if (!authLoading && !user) {
    return (
      <div className="container max-w-3xl mx-auto px-4 py-10">
        <Card>
          <CardHeader><CardTitle>Sign in required</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Sign in to manage your subscriptions.</p>
            <Button onClick={() => navigate("/auth")}>Sign in</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasAnyStripeSub = !!club || verified.status === "active" || verified.status === "canceling";

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Subscriptions</h1>
            <p className="text-sm text-muted-foreground">Manage or cancel your plans directly from your account.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button size="sm" onClick={openBillingPortal} disabled={openingPortal}>
            <CreditCard className="h-4 w-4 mr-2" />
            {openingPortal ? "Opening…" : "Manage in Stripe"}
          </Button>
        </div>
      </div>

      <Alert className="mb-6">
        <AlertDescription>
          Cancel, change plan, or update your payment method through the secure Stripe billing portal.
          Changes take effect immediately or at the end of the current period, depending on the plan.
        </AlertDescription>
      </Alert>

      {/* Unique VIP Club */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            Unique VIP Club
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : club ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 items-center">
                <Badge variant="secondary" className="capitalize">{club.tier} card</Badge>
                <Badge className="capitalize">{club.status}</Badge>
                {club.member_number ? <Badge variant="outline">#{club.member_number}</Badge> : null}
                {club.cancel_at_period_end ? <Badge variant="destructive">Cancels at period end</Badge> : null}
              </div>
              <p className="text-sm text-muted-foreground">
                Next billing / period end: <span className="font-medium">{fmtDate(club.current_period_end)}</span>
              </p>
              <div className="flex gap-2 pt-2">
                <Button size="sm" onClick={openBillingPortal} disabled={openingPortal}>
                  Cancel or change plan
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/club/card">View card</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <p className="text-sm text-muted-foreground">You're not a Unique VIP Club member yet.</p>
              <Button size="sm" asChild><Link to="/club">Join the Club</Link></Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verified */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Unique Verified
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : verified.tier !== "none" ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 items-center">
                <Badge variant="secondary" className="capitalize">{verified.tier}</Badge>
                <Badge className="capitalize">{verified.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {verified.status === "canceling" ? "Ends on" : "Renews on"}:{" "}
                <span className="font-medium">{fmtDate(verified.expiresAt)}</span>
              </p>
              <div className="flex gap-2 pt-2">
                {verified.tier !== "verified" && (
                  <Button size="sm" onClick={openBillingPortal} disabled={openingPortal}>
                    Cancel or change tier
                  </Button>
                )}
                <Button size="sm" variant="outline" asChild>
                  <Link to="/verified">
                    <Star className="h-4 w-4 mr-1" /> Verified plans
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <p className="text-sm text-muted-foreground">No Verified plan active.</p>
              <Button size="sm" asChild><Link to="/verified">Get Verified</Link></Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fan Clubs */}
      <div className="mb-4">
        <FanClubMembershipsCard />
      </div>

      {!hasAnyStripeSub && !loading && (
        <p className="text-xs text-muted-foreground text-center mt-6">
          The Stripe portal only opens if you have at least one subscription on file.
        </p>
      )}

      <p className="text-xs text-muted-foreground text-center mt-8 inline-flex items-center gap-1 w-full justify-center">
        <ExternalLink className="h-3 w-3" /> Billing is handled securely by Stripe.
      </p>
    </div>
  );
}
