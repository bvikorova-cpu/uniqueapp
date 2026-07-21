import { useEffect, useMemo, useState } from "react";
import { Crown, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Clock, CreditCard, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

type MembershipRow = {
  id: string;
  fan_club_id: string;
  status: string;
  tier: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  stripe_subscription_id: string | null;
  fan_club?: {
    name: string | null;
    creator_id: string | null;
  } | null;
};

const STATUS_META: Record<
  string,
  { label: string; icon: React.ElementType; className: string; tone: "ok" | "warn" | "bad" | "info" }
> = {
  active: { label: "Verified", icon: CheckCircle2, className: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30", tone: "ok" },
  past_due: { label: "Needs re-check", icon: AlertTriangle, className: "bg-amber-500/15 text-amber-500 border-amber-500/30", tone: "warn" },
  pending: { label: "Needs re-check", icon: Clock, className: "bg-amber-500/15 text-amber-500 border-amber-500/30", tone: "warn" },
  canceled: { label: "Canceled", icon: XCircle, className: "bg-rose-500/15 text-rose-500 border-rose-500/30", tone: "bad" },
  expired: { label: "Expired", icon: XCircle, className: "bg-rose-500/15 text-rose-500 border-rose-500/30", tone: "bad" },
};

export const FanClubMembershipsCard = () => {
  const [rows, setRows] = useState<MembershipRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | "all" | null>(null);
  const [openingPortal, setOpeningPortal] = useState(false);
  const [lastVerifiedAt, setLastVerifiedAt] = useState<Date | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) {
        setRows([]);
        return;
      }
      const { data, error } = await supabase
        .from("influencer_fan_club_members")
        .select(
          "id, fan_club_id, status, tier, current_period_end, cancel_at_period_end, stripe_subscription_id, fan_club:influencer_fan_clubs(name, creator_id)"
        )
        .eq("user_id", uid)
        .order("current_period_end", { ascending: false, nullsFirst: false });
      if (error) throw error;
      setRows((data as unknown as MembershipRow[]) ?? []);
    } catch (e: any) {
      toast.error(e?.message || "Could not load memberships.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const runVerify = async (fanClubId?: string) => {
    setVerifying(fanClubId ?? "all");
    try {
      const { data, error } = await supabase.functions.invoke("fanclub-verify", {
        body: fanClubId ? { fan_club_id: fanClubId } : {},
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setLastVerifiedAt(new Date());
      toast.success("Re-verified with Stripe.");
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Re-verify failed.");
    } finally {
      setVerifying(null);
    }
  };

  const openBillingPortal = async () => {
    setOpeningPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke("billing-portal", {
        body: { return_url: window.location.href },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      if ((data as any)?.url) window.open((data as any).url, "_blank");
    } catch (e: any) {
      toast.error(e?.message || "Could not open billing portal.");
    } finally {
      setOpeningPortal(false);
    }
  };

  const needsAttention = useMemo(
    () => rows.filter((r) => ["past_due", "pending"].includes(r.status)).length,
    [rows]
  );

  if (!loading && rows.length === 0) return null;

  return (
    <>
      <FloatingHowItWorks
        title="Fan Club Memberships - How it works"
        steps={[
          { title: "Overview", desc: "See every fan club you've joined with its current verified state." },
          { title: "Re-verify", desc: "Force a live check against Stripe if a status looks stale." },
          { title: "Manage", desc: "Open Stripe billing portal to change payment method or cancel." },
          { title: "Auto-sync", desc: "Webhooks keep statuses fresh — manual re-verify is only a safety net." },
        ]}
      />
      <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl p-5 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <Crown className="h-5 w-5 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Fan Club Memberships</p>
              <p className="text-base font-black bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent truncate">
                {rows.length} {rows.length === 1 ? "membership" : "memberships"}
                {lastVerifiedAt && (
                  <span className="ml-2 text-[11px] font-medium text-muted-foreground">
                    · checked {lastVerifiedAt.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => runVerify()}
              disabled={verifying !== null}
              className="gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${verifying === "all" ? "animate-spin" : ""}`} />
              Re-verify all
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={openBillingPortal}
              disabled={openingPortal}
              className="gap-1.5"
            >
              <CreditCard className="h-3.5 w-3.5" />
              Billing
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {needsAttention > 0 && (
          <Alert className="mb-4 border-amber-500/40 bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-sm">
              {needsAttention} membership{needsAttention > 1 ? "s" : ""} may be out of sync with Stripe. Click <strong>Re-verify</strong> to reconcile.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2.5">
          {loading && (
            <div className="text-sm text-muted-foreground py-4 text-center">Loading memberships…</div>
          )}
          {rows.map((row) => {
            const meta = STATUS_META[row.status] ?? STATUS_META.pending;
            const Icon = meta.icon;
            const endDate = row.current_period_end ? new Date(row.current_period_end) : null;
            const isVerifying = verifying === row.fan_club_id;
            return (
              <div
                key={row.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border/40 bg-muted/20 flex-wrap"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-bold truncate">
                      {row.fan_club?.name || "Fan Club"}
                    </p>
                    {row.tier && (
                      <Badge variant="secondary" className="text-[10px] uppercase">
                        {row.tier}
                      </Badge>
                    )}
                    <Badge className={`text-[10px] gap-1 border ${meta.className}`}>
                      <Icon className="h-3 w-3" />
                      {meta.label}
                    </Badge>
                    {row.cancel_at_period_end && (
                      <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-500">
                        Ends at period
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {endDate
                      ? `${row.cancel_at_period_end ? "Ends" : "Renews"} ${endDate.toLocaleDateString()}`
                      : "No active period"}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => runVerify(row.fan_club_id)}
                  disabled={verifying !== null}
                  className="gap-1.5"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isVerifying ? "animate-spin" : ""}`} />
                  Re-verify
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default FanClubMembershipsCard;
