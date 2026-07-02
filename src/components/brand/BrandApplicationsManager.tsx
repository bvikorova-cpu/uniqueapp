import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { CheckCircle2, ExternalLink, HandCoins, Loader2, ShieldCheck, XCircle } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

type Application = {
  id: string;
  campaign_id: string;
  user_id: string;
  message: string | null;
  portfolio_link: string | null;
  status: string;
  payment_status: string | null;
  agreed_amount: number | null;
  created_at: string;
  brand_campaigns: {
    id: string;
    campaign_name: string;
    brand_name: string;
    budget_min: number;
    budget_max: number;
    user_id: string;
  } | null;
  virtual_influencers: {
    id: string;
    name: string;
    user_id: string;
  } | null;
};

type Escrow = {
  id: string;
  application_id: string;
  status: string;
  amount_cents: number;
  net_cents: number;
  platform_fee_cents: number;
  released_at: string | null;
  paid_at: string | null;
};

function ApprovePayDialog({
  app,
  onSuccess,
}: {
  app: Application;
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const defaultAmount = app.brand_campaigns
    ? String(Math.round((app.brand_campaigns.budget_min + app.brand_campaigns.budget_max) / 2))
    : "";
  const [amount, setAmount] = useState(defaultAmount);

  const mutation = useMutation({
    mutationFn: async () => {
      const eur = Number(amount);
      if (!Number.isFinite(eur) || eur < 1) throw new Error("Enter a valid amount in EUR");
      const { data, error } = await supabase.functions.invoke("brand-campaign-checkout", {
        body: { applicationId: app.id, agreedEur: eur },
      });
      if (error) throw error;
      if (!data?.url) throw new Error("No checkout URL returned");
      window.open(data.url, "_blank");
      return data;
    },
    onSuccess: () => {
      toast.success("Stripe checkout opened in a new tab");
      setOpen(false);
      onSuccess();
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to start checkout"),
  });

  return (
    <>
      <FloatingHowItWorks title={"Brand Applications Manager - How it works"} steps={[{ title: 'Open', desc: 'Access the Brand Applications Manager section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Brand Applications Manager.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" onClick={() => setOpen(true)}>
        <HandCoins className="h-4 w-4 mr-1" />
        Approve & Pay
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve & Pay (Escrow)</DialogTitle>
          <DialogDescription>
            Brand pays via Stripe. Funds are held in escrow until you mark the campaign as
            completed. Platform fee 20%, creator receives 80%.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="text-sm">
            <span className="text-muted-foreground">Creator: </span>
            <span className="font-medium">{app.virtual_influencers?.name ?? "—"}</span>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amt">Agreed amount (EUR)</Label>
            <Input
              id="amt"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="numeric"
            />
            {app.brand_campaigns && (
              <p className="text-xs text-muted-foreground">
                Suggested range: €{app.brand_campaigns.budget_min} – €{app.brand_campaigns.budget_max}
              </p>
            )}
          </div>
          <div className="rounded-md border p-3 text-sm bg-muted/30">
            {(() => {
              const eur = Number(amount) || 0;
              const fee = eur * 0.2;
              const net = eur - fee;
              return (
                <div className="space-y-1">
                  <div className="flex justify-between"><span>Total (you pay)</span><span className="font-semibold">€{eur.toFixed(2)}</span></div>
                  <div className="flex justify-between text-muted-foreground"><span>Platform fee (20%)</span><span>€{fee.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Creator receives</span><span className="font-semibold">€{net.toFixed(2)}</span></div>
                </div>
              );
            })()}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Pay with Stripe
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}

function ReleaseEscrowDialog({
  escrow,
  onSuccess,
}: {
  escrow: Escrow;
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("brand-release-escrow", {
        body: { escrowId: escrow.id, note },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Funds released to the creator");
      setOpen(false);
      onSuccess();
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to release escrow"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" variant="default" onClick={() => setOpen(true)}>
        <CheckCircle2 className="h-4 w-4 mr-1" />
        Mark Completed
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Release escrow funds</DialogTitle>
          <DialogDescription>
            Confirm the creator delivered the agreed work. €{(escrow.net_cents / 100).toFixed(2)} will
            be credited to their earnings (withdrawable). This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="note">Note for the creator (optional)</Label>
          <Textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Great work — thank you!"
            maxLength={500}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Release €{(escrow.net_cents / 100).toFixed(2)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function BrandApplicationsManager() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => (await supabase.auth.getUser()).data.user,
  });

  const { data: applications, isLoading } = useQuery({
    queryKey: ["brand-applications", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      // 1. Brand's own campaigns
      const { data: campaigns } = await supabase
        .from("brand_campaigns")
        .select("id")
        .eq("user_id", user!.id);
      const campaignIds = (campaigns ?? []).map((c) => c.id);
      if (campaignIds.length === 0) return [] as Application[];

      const { data, error } = await supabase
        .from("campaign_applications")
        .select(`
          id, campaign_id, user_id, message, portfolio_link, status, payment_status,
          agreed_amount, created_at,
          brand_campaigns ( id, campaign_name, brand_name, budget_min, budget_max, user_id ),
          virtual_influencers ( id, name, user_id )
        `)
        .in("campaign_id", campaignIds)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as unknown as Application[];
    },
  });

  const { data: escrows } = useQuery({
    queryKey: ["brand-escrows", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaign_escrow")
        .select("id, application_id, status, amount_cents, net_cents, platform_fee_cents, released_at, paid_at")
        .eq("brand_user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Escrow[];
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      const { error } = await supabase
        .from("campaign_applications")
        .update({ status: "rejected", rejection_reason: "Declined by brand" })
        .eq("id", applicationId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Application rejected");
      queryClient.invalidateQueries({ queryKey: ["brand-applications"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to reject"),
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["brand-applications"] });
    queryClient.invalidateQueries({ queryKey: ["brand-escrows"] });
  };

  const escrowByApp = new Map((escrows ?? []).map((e) => [e.application_id, e]));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          No applications yet. Once creators apply, they'll show up here.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((app) => {
        const escrow = escrowByApp.get(app.id);
        const isPending = app.status === "pending";
        const isApproved = app.status === "approved";
        const isRejected = app.status === "rejected";
        const escrowHeld = escrow?.status === "held";
        const escrowReleased = escrow?.status === "released";
        const escrowAwaiting = escrow?.status === "awaiting_payment";

        return (
          <Card key={app.id}>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="truncate">
                    {app.brand_campaigns?.campaign_name ?? "Campaign"}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    From: <span className="font-medium text-foreground">{app.virtual_influencers?.name ?? "—"}</span>
                    {" · "}
                    {new Date(app.created_at).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  {isPending && <Badge variant="secondary">Pending</Badge>}
                  {isApproved && <Badge>Approved</Badge>}
                  {isRejected && <Badge variant="destructive">Rejected</Badge>}
                  {escrowAwaiting && <Badge variant="outline">Awaiting payment</Badge>}
                  {escrowHeld && (
                    <Badge variant="outline" className="border-primary/40 text-primary">
                      <ShieldCheck className="h-3 w-3 mr-1" /> Escrow held
                    </Badge>
                  )}
                  {escrowReleased && (
                    <Badge variant="outline" className="border-primary text-primary">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Released
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {app.message && (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{app.message}</p>
              )}
              {app.portfolio_link && (
                <a
                  href={app.portfolio_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  Portfolio <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {app.agreed_amount && (
                <div className="text-sm">
                  Agreed amount: <span className="font-semibold">€{Number(app.agreed_amount).toFixed(2)}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                {isPending && !escrow && (
                  <>
                    <ApprovePayDialog app={app} onSuccess={refresh} />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => rejectMutation.mutate(app.id)}
                      disabled={rejectMutation.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </>
                )}
                {escrowHeld && <ReleaseEscrowDialog escrow={escrow!} onSuccess={refresh} />}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
