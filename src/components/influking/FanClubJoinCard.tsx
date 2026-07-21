import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Crown, Star, Sparkles, Lock, Loader2, CheckCircle2, XCircle, RotateCcw, ArrowLeftRight, CreditCard, ExternalLink, AlertTriangle, RefreshCw, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { classifyVerifyResult, classifyVerifyError, type VerifyNotice } from "@/lib/fanclubVerifyStatus";

const TIER_ICON = { bronze: Star, silver: Crown, gold: Sparkles } as const;
const TIER_COLOR = {
  bronze: "text-orange-500",
  silver: "text-gray-400",
  gold: "text-amber-400",
} as const;

interface Props {
  creatorId: string;
  creatorName: string;
}

interface ClubRow {
  id: string;
  name: string;
  description: string | null;
  tier: "bronze" | "silver" | "gold";
  price_cents: number;
  perks: string[];
  member_count: number;
}

interface MembershipRow {
  fan_club_id: string;
  status: string;
  cancel_at_period_end: boolean;
  current_period_end: string | null;
}

export function FanClubJoinCard({ creatorId, creatorName }: Props) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [params, setParams] = useSearchParams();

  const { data: user } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => (await supabase.auth.getUser()).data.user,
  });

  const { data: clubs = [], isLoading } = useQuery<ClubRow[]>({
    queryKey: ["public-fan-clubs", creatorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("influencer_fan_clubs")
        .select("id, name, description, tier, price_cents, perks, member_count")
        .eq("creator_id", creatorId)
        .eq("is_active", true)
        .order("price_cents", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((r: any) => ({
        ...r,
        perks: Array.isArray(r.perks) ? r.perks : [],
      })) as ClubRow[];
    },
  });

  const { data: memberships = [] } = useQuery<MembershipRow[]>({
    queryKey: ["my-fan-club-memberships", user?.id, creatorId],
    queryFn: async () => {
      if (!user || clubs.length === 0) return [];
      const { data, error } = await supabase
        .from("influencer_fan_club_members")
        .select("fan_club_id, status, cancel_at_period_end, current_period_end")
        .eq("user_id", user.id)
        .in("fan_club_id", clubs.map((c) => c.id));
      if (error) throw error;
      return (data ?? []) as MembershipRow[];
    },
    enabled: !!user && clubs.length > 0,
  });

  const [verifyNotice, setVerifyNotice] = useState<null | { clubId: string | null; notice: VerifyNotice }>(null);
  const [verifying, setVerifying] = useState(false);

  const runVerify = async (clubId: string | null, opts?: { silent?: boolean }) => {
    setVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke("fanclub-verify", {
        body: { fan_club_id: clubId },
      });
      if (error) throw new Error(error.message || "Verification failed");
      if ((data as any)?.error) throw new Error((data as any).error);

      const memberships = ((data as any)?.memberships ?? []) as Array<{
        fan_club_id: string;
        active: boolean;
        status: string;
      }>;
      const target = clubId
        ? memberships.find((m) => m.fan_club_id === clubId)
        : memberships.find((m) => m.active) ?? memberships[0];

      qc.invalidateQueries({ queryKey: ["my-fan-club-memberships"] });
      qc.invalidateQueries({ queryKey: ["fan-club-locked-posts"] });

      const notice = classifyVerifyResult(target);

      if (notice.kind === "active") {
        setVerifyNotice(null);
        if (!opts?.silent) {
          toast({ title: "🎉 Welcome to the Fan Club!", description: notice.reason });
        }
        return true;
      }

      setVerifyNotice({ clubId, notice });
      if (!opts?.silent) {
        toast({
          title: notice.title,
          description: notice.reason,
          variant: notice.tone === "success" ? "default" : "destructive",
        });
      }
      return false;
    } catch (e: any) {
      const notice = classifyVerifyError(e);
      setVerifyNotice({ clubId, notice });
      if (!opts?.silent) {
        toast({ title: notice.title, description: notice.reason, variant: "destructive" });
      }
      return false;
    } finally {
      setVerifying(false);
    }
  };

  // Post-checkout redirect handling
  useEffect(() => {
    const fanclubParam = params.get("fanclub");
    if (!fanclubParam) return;
    const clubId = params.get("fan_club_id");
    if (fanclubParam === "success" && user) {
      runVerify(clubId);
    } else if (fanclubParam === "canceled") {
      toast({ title: "Checkout canceled", variant: "destructive" });
    }
    params.delete("fanclub");
    params.delete("fan_club_id");
    params.delete("session_id");
    setParams(params, { replace: true });
  }, [params, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const checkout = useMutation({
    mutationFn: async (fan_club_id: string) => {
      if (!user) throw new Error("Sign in to subscribe");
      const { data, error } = await supabase.functions.invoke("fanclub-checkout", {
        body: { fan_club_id },
      });
      if (error) throw error;
      if (data?.already_member) {
        qc.invalidateQueries({ queryKey: ["my-fan-club-memberships"] });
        return;
      }
      if (data?.url) window.location.href = data.url;
    },
    onError: (e: any) => toast({ title: "Checkout error", description: e.message, variant: "destructive" }),
  });

  const cancel = useMutation({
    mutationFn: async (fan_club_id: string) => {
      const { error } = await supabase.functions.invoke("fanclub-cancel", { body: { fan_club_id } });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-fan-club-memberships"] });
      toast({ title: "Subscription will end at period end" });
    },
    onError: (e: any) => toast({ title: "Cancel failed", description: e.message, variant: "destructive" }),
  });

  const resume = useMutation({
    mutationFn: async (fan_club_id: string) => {
      const { error } = await supabase.functions.invoke("fanclub-resume", { body: { fan_club_id } });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-fan-club-memberships"] });
      toast({ title: "Membership resumed" });
    },
    onError: (e: any) => toast({ title: "Resume failed", description: e.message, variant: "destructive" }),
  });

  const swap = useMutation({
    mutationFn: async ({ from_fan_club_id, to_fan_club_id }: { from_fan_club_id: string; to_fan_club_id: string }) => {
      const { error } = await supabase.functions.invoke("fanclub-swap", {
        body: { from_fan_club_id, to_fan_club_id },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-fan-club-memberships"] });
      qc.invalidateQueries({ queryKey: ["fan-club-locked-posts"] });
      toast({ title: "Tier changed", description: "Proration applied on your next invoice." });
    },
    onError: (e: any) => toast({ title: "Swap failed", description: e.message, variant: "destructive" }),
  });

  const openPortal = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("billing-portal", {
        body: { return_url: window.location.href },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      if ((data as any)?.url) window.open((data as any).url, "_blank");
    },
    onError: (e: any) => toast({ title: "Billing portal error", description: e.message, variant: "destructive" }),
  });

  const activeMembership = memberships.find((m) => m.status === "active");
  const hasAnyMembership = memberships.length > 0;
  const [guideOpen, setGuideOpen] = useState(false);

  // Pick the membership most likely to need guidance (broken > cancelling > active > none)
  const guideMembership = (() => {
    const broken = memberships.find((m) => ["past_due", "unpaid", "pending", "incomplete"].includes(m.status));
    if (broken) return broken;
    const cancelling = memberships.find((m) => m.status === "active" && m.cancel_at_period_end);
    if (cancelling) return cancelling;
    return activeMembership ?? memberships[0] ?? null;
  })();

  const guideNotice: VerifyNotice = (() => {
    if (!guideMembership) {
      return {
        kind: "missing",
        title: "How to subscribe and manage a Fan Club",
        reason: "You don't have a membership yet. Once you subscribe, the Billing Portal is where you update your card, download invoices, or cancel.",
        portalSteps: [
          "Click Join on the tier you want — Stripe checkout opens in a new tab.",
          "Complete payment (a card is required; SCA / 3-D Secure may prompt you).",
          "You'll be redirected back — access unlocks the moment the webhook confirms.",
          "Later, use Manage billing here to change card, download invoices, or cancel.",
        ],
        tone: "info",
        showPortal: false,
        showRetry: false,
      };
    }
    if (guideMembership.status === "active" && guideMembership.cancel_at_period_end) {
      return {
        kind: "active",
        title: "Cancellation scheduled — how to reverse it",
        reason: `Access ends ${guideMembership.current_period_end?.slice(0, 10) ?? "at the end of the period"}. You can resume anytime before that date.`,
        portalSteps: [
          "Click Resume on the tier card to instantly cancel the pending cancellation.",
          "Or open Billing Portal → your subscription → Renew subscription.",
          "No new charge until the current period ends.",
        ],
        tone: "warn",
        showPortal: true,
        showRetry: false,
      };
    }
    return classifyVerifyResult({
      active: guideMembership.status === "active",
      status: guideMembership.status,
    });
  })();

  if (isLoading) {
    return <div className="flex justify-center py-6"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }
  if (clubs.length === 0) return null;

  return (
    <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 flex-wrap">
          <Crown className="h-5 w-5 text-amber-500" />
          <span>{creatorName}'s Fan Clubs</span>
          <div className="ml-auto flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="ghost"
              className="gap-1 h-8"
              onClick={() => setGuideOpen(true)}
              title="Step-by-step guide to Billing Portal"
            >
              <BookOpen className="h-3 w-3" />
              Guide
            </Button>
            {hasAnyMembership && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1 h-8"
                onClick={() => openPortal.mutate()}
                disabled={openPortal.isPending}
              >
                {openPortal.isPending
                  ? <Loader2 className="h-3 w-3 animate-spin" />
                  : <CreditCard className="h-3 w-3" />}
                Manage billing
                <ExternalLink className="h-3 w-3 opacity-60" />
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <Dialog open={guideOpen} onOpenChange={setGuideOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-amber-500" />
              {guideNotice.title}
            </DialogTitle>
            <DialogDescription>{guideNotice.reason}</DialogDescription>
          </DialogHeader>

          {guideNotice.portalSteps.length > 0 && (
            <div className="rounded-md border bg-muted/30 p-3">
              <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                <CreditCard className="h-3 w-3" /> Step by step
              </p>
              <ol className="text-sm list-decimal ml-5 space-y-1.5">
                {guideNotice.portalSteps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </div>
          )}

          <div className="text-[11px] text-muted-foreground border-t pt-2">
            Current status:{" "}
            <span className="font-mono">
              {guideMembership
                ? `${guideMembership.status}${guideMembership.cancel_at_period_end ? " (cancels at period end)" : ""}`
                : "no membership"}
            </span>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="ghost" onClick={() => setGuideOpen(false)}>Close</Button>
            {hasAnyMembership && (
              <Button
                onClick={() => { setGuideOpen(false); openPortal.mutate(); }}
                disabled={openPortal.isPending}
                className="gap-1"
              >
                {openPortal.isPending
                  ? <Loader2 className="h-3 w-3 animate-spin" />
                  : <CreditCard className="h-3 w-3" />}
                Open Billing Portal
                <ExternalLink className="h-3 w-3 opacity-60" />
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {verifyNotice && (
        <div className="px-6 pb-3">
          <Alert
            variant={verifyNotice.notice.tone === "error" ? "destructive" : "default"}
            className={
              verifyNotice.notice.tone === "warn"
                ? "border-amber-500/40 bg-amber-500/10"
                : verifyNotice.notice.tone === "success"
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : undefined
            }
          >
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{verifyNotice.notice.title}</AlertTitle>
            <AlertDescription className="space-y-2">
              <p className="text-xs">{verifyNotice.notice.reason}</p>
              {verifyNotice.notice.portalSteps.length > 0 && (
                <div className="rounded-md border border-border/50 bg-background/40 p-2">
                  <p className="text-[11px] font-semibold mb-1 flex items-center gap-1">
                    <CreditCard className="h-3 w-3" /> What to do in Billing Portal
                  </p>
                  <ol className="text-[11px] list-decimal ml-4 space-y-0.5 opacity-90">
                    {verifyNotice.notice.portalSteps.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                </div>
              )}
              <div className="flex gap-2 flex-wrap pt-1">
                {verifyNotice.notice.showRetry && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="gap-1 h-7"
                    onClick={() => runVerify(verifyNotice.clubId)}
                    disabled={verifying}
                  >
                    {verifying
                      ? <Loader2 className="h-3 w-3 animate-spin" />
                      : <RefreshCw className="h-3 w-3" />}
                    Re-verify with Stripe
                  </Button>
                )}
                {verifyNotice.notice.showPortal && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 h-7"
                    onClick={() => openPortal.mutate()}
                    disabled={openPortal.isPending}
                  >
                    <CreditCard className="h-3 w-3" />
                    Open billing portal
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7"
                  onClick={() => setVerifyNotice(null)}
                >
                  Dismiss
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {clubs.map((c) => {
          const Icon = TIER_ICON[c.tier];
          const membership = memberships.find((m) => m.fan_club_id === c.id);
          const active = membership?.status === "active";
          return (
            <Card key={c.id} className="border-border/40">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="capitalize gap-1">
                    <Icon className={`h-3 w-3 ${TIER_COLOR[c.tier]}`} /> {c.tier}
                  </Badge>
                  <span className="font-bold text-green-500">
                    €{(c.price_cents / 100).toFixed(2)}<span className="text-xs text-muted-foreground">/mo</span>
                  </span>
                </div>
                <h4 className="font-semibold text-sm">{c.name}</h4>
                {c.description && <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>}
                {c.perks.length > 0 && (
                  <ul className="space-y-0.5">
                    {c.perks.slice(0, 3).map((p, i) => (
                      <li key={i} className="text-xs flex gap-1 items-start">
                        <CheckCircle2 className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{p}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {active ? (
                  <div className="space-y-1">
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/30 w-full justify-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Active tier
                    </Badge>
                    {membership?.cancel_at_period_end ? (
                      <>
                        <p className="text-[10px] text-muted-foreground text-center">
                          Ends {membership.current_period_end?.slice(0, 10)}
                        </p>
                        <Button size="sm" variant="secondary" className="w-full text-xs h-7"
                          onClick={() => resume.mutate(c.id)} disabled={resume.isPending}>
                          <RotateCcw className="h-3 w-3 mr-1" /> Resume
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="ghost" className="w-full text-xs h-7"
                        onClick={() => cancel.mutate(c.id)} disabled={cancel.isPending}>
                        <XCircle className="h-3 w-3 mr-1" /> Cancel at period end
                      </Button>
                    )}
                  </div>
                ) : activeMembership && !activeMembership.cancel_at_period_end ? (
                  <Button size="sm" variant="outline" className="w-full gap-1"
                    onClick={() => swap.mutate({ from_fan_club_id: activeMembership.fan_club_id, to_fan_club_id: c.id })}
                    disabled={swap.isPending}>
                    {swap.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowLeftRight className="h-3 w-3" />}
                    Switch to this tier
                  </Button>
                ) : (
                  <Button size="sm" className="w-full gap-1"
                    onClick={() => checkout.mutate(c.id)}
                    disabled={checkout.isPending || !user}>
                    {checkout.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Lock className="h-3 w-3" />}
                    {user ? "Join" : "Sign in to join"}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </CardContent>
    </Card>
  );
}
