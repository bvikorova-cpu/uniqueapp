import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Flame, Loader2 } from "lucide-react";

const TOP_TIERS = [
  { days: 7, credits: 15 },
  { days: 14, credits: 25 },
  { days: 30, credits: 45 },
];
const PREMIUM = { days: 30, credits: 100 };

export function AuctionPromoteDialog({
  itemId,
  open,
  onOpenChange,
  onPromoted,
}: {
  itemId: string | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onPromoted?: () => void;
}) {
  const { toast } = useToast();
  const [busy, setBusy] = useState<string | null>(null);

  const promote = async (tier: "top" | "premium", days: number) => {
    if (!itemId) return;
    setBusy(`${tier}-${days}`);
    try {
      const { data, error } = await (supabase as any).rpc("auction_top_listing", {
        _item_id: itemId,
        _days: days,
        _tier: tier,
      });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      const start = new Date().toLocaleDateString();
      const end = new Date(row.promoted_until).toLocaleDateString();
      toast({
        title: tier === "premium" ? "PREMIUM activated" : "TOP activated",
        description: `Active ${start} – ${end} · ${row.credits_remaining} credits left.`,
      });
      window.dispatchEvent(new Event("ai-credits-updated"));
      onPromoted?.();
      onOpenChange(false);
    } catch (err: any) {
      const msg = String(err?.message || "");
      toast({
        title: "Could not promote",
        description: msg.includes("INSUFFICIENT_CREDITS")
          ? "Not enough credits."
          : msg.includes("NOT_OWNER")
            ? "You can promote only your own auction."
            : msg || "Try again",
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Promote this auction</DialogTitle>
          <DialogDescription>
            TOP auctions appear above standard ones. PREMIUM auctions get their own showcase folder at the very top.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center gap-2 font-semibold">
                <Flame className="h-4 w-4 text-primary" /> TOP
              </div>
              <div className="grid grid-cols-3 gap-2">
                {TOP_TIERS.map((t) => (
                  <Button
                    key={t.days}
                    variant="outline"
                    disabled={!!busy}
                    onClick={() => promote("top", t.days)}
                    className="h-auto flex-col py-3"
                  >
                    {busy === `top-${t.days}` ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <span className="font-semibold">{t.days} days</span>
                        <span className="text-xs text-muted-foreground">{t.credits} credits</span>
                      </>
                    )}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/40">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center gap-2 font-semibold">
                <Crown className="h-4 w-4 text-primary" /> PREMIUM
              </div>
              <Button className="w-full" disabled={!!busy} onClick={() => promote("premium", PREMIUM.days)}>
                {busy === `premium-${PREMIUM.days}` ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>{PREMIUM.days} days · {PREMIUM.credits} credits</>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AuctionPromoteDialog;
