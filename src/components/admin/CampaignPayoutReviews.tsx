import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Check, X, AlertTriangle, ExternalLink, RefreshCw, Heart } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface PendingPayout {
  id: string;
  campaign_id: string;
  campaign_type: string;
  owner_user_id: string;
  amount_cents: number;
  currency: string;
  stripe_destination_account: string;
  review_reason: string | null;
  requested_at: string;
  // joined client-side
  owner_name?: string | null;
  owner_email?: string | null;
  campaign_title?: string | null;
}

const CAMPAIGN_TABLE: Record<string, string> = {
  medical: "medical_campaigns",
  dream: "dream_campaigns",
  hero: "hero_campaigns",
  pet: "pet_campaigns",
  student: "student_campaigns",
  crisis: "crisis_campaigns",
  talent: "talent_campaigns",
};

const TYPE_LABEL: Record<string, string> = {
  medical: "🏥 Medical",
  dream: "✨ Dream",
  hero: "🦸 Hero",
  pet: "🐾 Pet",
  student: "🎓 Student",
  crisis: "🚨 Crisis",
  talent: "⭐ Talent",
};

const fmtEur = (cents: number) => `€${(cents / 100).toFixed(2)}`;

export function CampaignPayoutReviews() {
  const [items, setItems] = useState<PendingPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PendingPayout | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [acting, setActing] = useState<"approve" | "reject" | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("campaign_payouts")
        .select("*")
        .eq("status", "pending_review")
        .order("requested_at", { ascending: true });
      if (error) throw error;

      const rows = ((data || []) as unknown) as PendingPayout[];

      // Enrich with owner name + campaign title (best-effort, parallel)
      const enriched = await Promise.all(rows.map(async (r) => {
        const [ownerRes, campRes] = await Promise.all([
          supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", r.owner_user_id)
            .maybeSingle(),
          (async () => {
            const t = CAMPAIGN_TABLE[r.campaign_type];
            if (!t) return { data: null };
            return supabase.from(t as any).select("title").eq("id", r.campaign_id).maybeSingle();
          })(),
        ]);
        return {
          ...r,
          owner_name: ownerRes.data?.full_name ?? null,
          owner_email: ownerRes.data?.email ?? null,
          campaign_title: (campRes as any).data?.title ?? null,
        };
      }));

      setItems(enriched);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load pending payouts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleAction = async (action: "approve" | "reject") => {
    if (!selected) return;
    if (action === "reject" && rejectReason.trim().length < 5) {
      toast.error("Please provide a rejection reason (min 5 characters)");
      return;
    }
    setActing(action);
    try {
      const { data, error } = await supabase.functions.invoke(
        "admin-approve-campaign-payout",
        {
          body: {
            payout_id: selected.id,
            action,
            ...(action === "reject" ? { rejection_reason: rejectReason.trim() } : {}),
          },
        },
      );
      if (error) throw error;
      const res = data as any;
      if (res?.error) throw new Error(res.error);

      toast.success(
        action === "approve"
          ? `Payout approved — ${fmtEur(selected.amount_cents)} transferred.`
          : "Payout rejected.",
      );
      setSelected(null);
      setRejectReason("");
      refresh();
    } catch (e: any) {
      toast.error(e?.message || "Action failed");
    } finally {
      setActing(null);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Campaign Payout Reviews - How it works"} steps={[{ title: 'Open', desc: 'Access the Campaign Payout Reviews section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Campaign Payout Reviews.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Campaign Payout Reviews
          </h3>
          <p className="text-sm text-muted-foreground">
            Review high-risk and first-time fundraising payouts before funds are transferred.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          🎉 No pending payouts to review.
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {items.map((p) => (
            <Card key={p.id} className="hover:border-primary/40 transition-colors">
              <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-[260px] space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline">{TYPE_LABEL[p.campaign_type] ?? p.campaign_type}</Badge>
                    <span className="font-semibold">{p.campaign_title || `Campaign ${p.campaign_id.slice(0, 8)}…`}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Owner: {p.owner_name || p.owner_email || p.owner_user_id.slice(0, 8) + "…"}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                    {p.review_reason || "Manual review"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Requested {format(new Date(p.requested_at), "PPp")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{fmtEur(p.amount_cents)}</p>
                  <p className="text-xs text-muted-foreground uppercase">{p.currency}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setSelected(p)} className="gap-1">
                    Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Review dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Payout</DialogTitle>
            <DialogDescription>
              Approving will trigger an immediate Stripe transfer to the owner's Connect account.
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="rounded-lg border p-3 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Campaign</span><span className="font-medium">{selected.campaign_title}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span>{TYPE_LABEL[selected.campaign_type]}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Owner</span><span>{selected.owner_name || selected.owner_email}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-bold text-primary">{fmtEur(selected.amount_cents)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Stripe acct</span><span className="font-mono text-xs">{selected.stripe_destination_account}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Review reason</span><span className="text-amber-600 dark:text-amber-400">{selected.review_reason}</span></div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => window.open(`/fundraising/${selected.campaign_type}/${selected.campaign_id}`, "_blank")}
                  className="gap-1"
                >
                  <ExternalLink className="h-4 w-4" /> View campaign
                </Button>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Rejection reason (only required if rejecting)</p>
                <Textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Documentation insufficient — please upload hospital invoice."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="destructive"
                  onClick={() => handleAction("reject")}
                  disabled={!!acting}
                  className="gap-1"
                >
                  {acting === "reject" ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                  Reject
                </Button>
                <Button
                  onClick={() => handleAction("approve")}
                  disabled={!!acting}
                  className="gap-1"
                >
                  {acting === "approve" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Approve & Transfer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
}
