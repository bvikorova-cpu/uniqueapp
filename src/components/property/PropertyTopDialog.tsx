import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Crown, Loader2, Coins, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const TOP_TIERS = [
  { days: 7, cost: 15 },
  { days: 14, cost: 25 },
  { days: 30, cost: 45 },
] as const;

export const PREMIUM_TIER = { days: 30, cost: 100 } as const;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string | null;
  propertyTitle?: string;
  featuredUntil?: string | null;
  premiumUntil?: string | null;
  onSuccess?: (featuredUntil: string) => void;
}

export function PropertyTopDialog({ open, onOpenChange, propertyId, propertyTitle, featuredUntil, premiumUntil, onSuccess }: Props) {
  const [balance, setBalance] = useState<number | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("ai_credits")
        .select("credits_remaining")
        .eq("user_id", user.id)
        .maybeSingle();
      setBalance(data?.credits_remaining ?? 0);
    })();
  }, [open]);

  const buy = async (days: number, cost: number, tier: "top" | "premium" = "top") => {
    if (!propertyId) return;
    setBusy(tier === "premium" ? -days : days);
    try {
      const { data, error } = await (supabase as any).rpc("property_top_listing", {
        _property_id: propertyId,
        _days: days,
        _tier: tier,
      });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      setBalance(row?.credits_remaining ?? balance);
      toast.success(tier === "premium" ? "Listing is now PREMIUM" : "Listing is now TOP", {
        description: `${cost} credits used · ${tier === "premium" ? "Premium" : "Top"} for ${days} days.`,
      });
      if (row?.featured_until) onSuccess?.(row.featured_until);
      onOpenChange(false);
    } catch (e: any) {
      const msg = String(e?.message || "");
      if (/INSUFFICIENT_CREDITS/i.test(msg)) {
        toast.error("Not enough credits", {
          description: `This Top package costs ${cost} credits.`,
          action: { label: "Top up", onClick: () => navigate("/ai-credits") },
        });
      } else {
        toast.error(msg || "Could not activate Top");
      }
    } finally {
      setBusy(null);
    }
  };

  const activeUntil = featuredUntil ? new Date(featuredUntil) : null;
  const isActive = !!activeUntil && activeUntil.getTime() > Date.now();
  const premiumActive = !!premiumUntil && new Date(premiumUntil).getTime() > Date.now();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" /> Promote this listing
          </DialogTitle>
          <DialogDescription>
            {propertyTitle ? `"${propertyTitle}" ` : ""}gets a TOP or PREMIUM badge and its own folder in the marketplace.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <span className="text-sm text-muted-foreground">Your balance</span>
          <Badge variant="outline">{balance === null ? "—" : `${balance} credits`}</Badge>
        </div>

        {isActive && (
          <p className="text-xs text-muted-foreground">
            Currently TOP until {activeUntil!.toLocaleDateString()} — buying again extends the period.
          </p>
        )}

        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Top folder</p>
        <div className="space-y-2">
          {TOP_TIERS.map((t) => (
            <Button
              key={t.days}
              variant="outline"
              className="w-full justify-between h-12"
              disabled={busy !== null}
              onClick={() => buy(t.days, t.cost)}
            >
              <span className="font-bold">{t.days} days</span>
              <span className="flex items-center gap-2 font-bold text-primary">
                {busy === t.days ? <Loader2 className="h-4 w-4 animate-spin" /> : <Coins className="h-4 w-4" />}
                {t.cost} credits
              </span>
            </Button>
          ))}
        </div>

        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground pt-1">Premium folder</p>
        {premiumActive && (
          <p className="text-xs text-muted-foreground">
            Premium until {new Date(premiumUntil!).toLocaleDateString()} — buying again extends the period.
          </p>
        )}
        <Button
          className="w-full justify-between h-12 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:opacity-90"
          disabled={busy !== null}
          onClick={() => buy(PREMIUM_TIER.days, PREMIUM_TIER.cost, "premium")}
        >
          <span className="font-black flex items-center gap-2"><Sparkles className="h-4 w-4" /> PREMIUM · 30 days</span>
          <span className="flex items-center gap-2 font-bold">
            {busy === -PREMIUM_TIER.days ? <Loader2 className="h-4 w-4 animate-spin" /> : <Coins className="h-4 w-4" />}
            {PREMIUM_TIER.cost} credits
          </span>
        </Button>
      </DialogContent>
    </Dialog>
  );
}
