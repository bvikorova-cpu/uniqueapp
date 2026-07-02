import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wallet, Loader2, CheckCircle2, AlertTriangle, ExternalLink, Clock, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

type CampaignType = "medical" | "dream" | "hero" | "pet" | "student" | "crisis" | "talent";

interface Props {
  campaignType: CampaignType;
  campaignId: string;
  ownerUserId: string;
}

interface ConnectStatus {
  has_account: boolean;
  payouts_enabled: boolean;
  charges_enabled?: boolean;
  details_submitted?: boolean;
}

interface Balance {
  total_raised_cents: number;
  total_paid_out_cents: number;
  available_cents: number;
}

interface RecentPayout {
  id: string;
  amount_cents: number;
  status: string;
  requested_at: string;
  rejection_reason: string | null;
  review_reason: string | null;
}

const fmtEur = (cents: number) => `€${(cents / 100).toFixed(2)}`;

const STATUS_META: Record<string, { label: string; cls: string; icon: any }> = {
  pending_review: { label: "Awaiting admin review", cls: "border-amber-500/40 text-amber-600 dark:text-amber-400", icon: Clock },
  pending: { label: "Processing", cls: "border-blue-500/40 text-blue-600 dark:text-blue-400", icon: Clock },
  completed: { label: "Paid out", cls: "border-green-500/40 text-green-600 dark:text-green-400", icon: CheckCircle2 },
  rejected: { label: "Rejected", cls: "border-red-500/40 text-red-600 dark:text-red-400", icon: XCircle },
  failed: { label: "Failed", cls: "border-red-500/40 text-red-600 dark:text-red-400", icon: XCircle },
};

export function CampaignPayoutPanel({ campaignType, campaignId, ownerUserId }: Props) {
  const { user } = useAuth();
  const [balance, setBalance] = useState<Balance | null>(null);
  const [connect, setConnect] = useState<ConnectStatus | null>(null);
  const [recent, setRecent] = useState<RecentPayout[]>([]);
  const [amountEur, setAmountEur] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isOwner = !!user && user.id === ownerUserId;

  const refresh = useCallback(async () => {
    if (!isOwner) return;
    setLoading(true);
    try {
      const [balRes, connectRes, recentRes] = await Promise.all([
        supabase.rpc("get_campaign_available_balance", {
          _campaign_type: campaignType,
          _campaign_id: campaignId,
        }),
        supabase.functions.invoke("check-connect-status", { body: { action: "status" } }),
        supabase
          .from("campaign_payouts")
          .select("id, amount_cents, status, requested_at, rejection_reason, review_reason")
          .eq("campaign_id", campaignId)
          .eq("campaign_type", campaignType)
          .order("requested_at", { ascending: false })
          .limit(5),
      ]);

      if (balRes.error) throw balRes.error;
      const row = (balRes.data as any)?.[0];
      if (row) {
        setBalance({
          total_raised_cents: Number(row.total_raised_cents ?? 0),
          total_paid_out_cents: Number(row.total_paid_out_cents ?? 0),
          available_cents: Number(row.available_cents ?? 0),
        });
      }

      if (!connectRes.error && connectRes.data) {
        const d = connectRes.data as any;
        setConnect({
          has_account: !!d.has_account,
          payouts_enabled: !!d.payouts_enabled,
          charges_enabled: !!d.charges_enabled,
          details_submitted: !!d.details_submitted,
        });
      } else {
        setConnect({ has_account: false, payouts_enabled: false });
      }

      if (!recentRes.error && recentRes.data) {
        setRecent(((recentRes.data as unknown) as RecentPayout[]) || []);
      }
    } catch (e: any) {
      console.error("[payout panel] refresh failed", e);
    } finally {
      setLoading(false);
    }
  }, [campaignType, campaignId, isOwner]);

  useEffect(() => { refresh(); }, [refresh]);

  if (!isOwner) return null;

  const handleStartOnboarding = async () => {
    try {
      // 1. Ensure account exists
      if (!connect?.has_account) {
        const { error } = await supabase.functions.invoke("create-connect-account", { body: {} });
        if (error) throw error;
      }
      // 2. Get onboarding link
      const { data, error } = await supabase.functions.invoke("stripe-connect-onboarding", { body: {} });
      if (error) throw error;
      const url = (data as any)?.url;
      if (url) { const __w = window.open(url, "_blank", "noopener,noreferrer"); if (!__w) window.location.href = url; }
      else throw new Error("No onboarding URL returned");
    } catch (e: any) {
      toast.error(e?.message || "Could not start Stripe onboarding");
    }
  };

  const handleWithdraw = async () => {
    if (!balance) return;
    const eur = parseFloat(amountEur);
    if (!isFinite(eur) || eur <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    const cents = Math.round(eur * 100);
    if (cents < 100) { toast.error("Minimum withdrawal is €1.00"); return; }
    if (cents > balance.available_cents) {
      toast.error(`Maximum available: ${fmtEur(balance.available_cents)}`);
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("request-campaign-payout", {
        body: { campaign_type: campaignType, campaign_id: campaignId, amount_cents: cents },
      });
      if (error) throw error;
      const res = data as any;
      if (res?.error) throw new Error(res.error);

      const status = res?.status;
      if (status === "pending_review") {
        toast.info("Withdrawal queued for admin review", {
          description: res?.review_reason || "You will be notified once approved.",
          duration: 7000,
        });
      } else {
        toast.success(`Payout sent! ${fmtEur(cents)} is on its way to your bank.`);
      }
      setAmountEur("");
      await refresh();
    } catch (e: any) {
      toast.error(e?.message || "Payout failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Campaign Payout Panel - How it works"} steps={[{ title: 'Open', desc: 'Access the Campaign Payout Panel section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Campaign Payout Panel.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Wallet className="h-5 w-5 text-primary" />
          Manage Payouts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && !balance ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Balance summary */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-background/50 p-3">
                <p className="text-xs text-muted-foreground">Raised</p>
                <p className="font-bold">{fmtEur(balance?.total_raised_cents ?? 0)}</p>
              </div>
              <div className="rounded-lg bg-background/50 p-3">
                <p className="text-xs text-muted-foreground">Paid out</p>
                <p className="font-bold">{fmtEur(balance?.total_paid_out_cents ?? 0)}</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-3">
                <p className="text-xs text-muted-foreground">Available</p>
                <p className="font-bold text-primary">{fmtEur(balance?.available_cents ?? 0)}</p>
              </div>
            </div>

            {/* Connect status / actions */}
            {!connect?.has_account || !connect?.payouts_enabled ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="space-y-2">
                  <p className="text-sm">
                    {!connect?.has_account
                      ? "Connect your Stripe account to receive funds."
                      : "Finish Stripe onboarding to enable payouts."}
                  </p>
                  <Button size="sm" onClick={handleStartOnboarding} className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    {!connect?.has_account ? "Set up Stripe" : "Continue onboarding"}
                  </Button>
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <Badge variant="outline" className="gap-1 border-green-500/40 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-3 w-3" />
                  Stripe ready
                </Badge>

                <div className="space-y-2">
                  <Input
                    type="number"
                    inputMode="decimal"
                    min="1"
                    step="0.01"
                    placeholder="Amount in €"
                    value={amountEur}
                    onChange={(e) => setAmountEur(e.target.value)}
                    disabled={submitting || (balance?.available_cents ?? 0) < 100}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => setAmountEur(((balance?.available_cents ?? 0) / 100).toFixed(2))}
                      disabled={submitting || (balance?.available_cents ?? 0) < 100}
                    >
                      Max
                    </Button>
                    <Button
                      onClick={handleWithdraw}
                      disabled={submitting || !amountEur || (balance?.available_cents ?? 0) < 100}
                      className="flex-1 gap-2"
                    >
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                      Withdraw
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Funds arrive in your bank within 1–2 business days (Stripe).
                  </p>
                </div>
              </>
            )}

            {/* Recent payouts history */}
            {recent.length > 0 && (
              <div className="pt-3 border-t space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Recent payouts</p>
                {recent.map((r) => {
                  const meta = STATUS_META[r.status] ?? STATUS_META.pending;
                  const Icon = meta.icon;
                  return (
                    <div key={r.id} className="flex items-start justify-between gap-2 text-sm">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`gap-1 ${meta.cls}`}>
                            <Icon className="h-3 w-3" />
                            {meta.label}
                          </Badge>
                          <span className="font-semibold">{fmtEur(r.amount_cents)}</span>
                        </div>
                        {(r.rejection_reason || (r.status === "pending_review" && r.review_reason)) && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {r.rejection_reason || r.review_reason}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(r.requested_at), "MMM d")}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
    </>
  );
}
