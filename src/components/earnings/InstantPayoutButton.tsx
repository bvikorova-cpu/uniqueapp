import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Zap, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  amount: number;
  enabled: boolean;
  onPaid?: () => void;
}

/** Instant Stripe Connect payout button — 1% fee, available when balance ≥ €10. */
export function InstantPayoutButton({ amount, enabled, onPaid }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const fee = +(amount * 0.01).toFixed(2);
  const net = +(amount - fee).toFixed(2);
  const canRun = enabled && amount >= 10;

  const run = async () => {
    if (!canRun) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("stripe-connect-payout", {
        body: { amount_cents: Math.floor(amount * 100), currency: "eur", method: "instant" },
      });
      if (error) throw error;
      toast({ title: "Instant payout sent", description: `€${net.toFixed(2)} on its way (€${fee} fee)` });
      onPaid?.();
    } catch (e: any) {
      toast({ title: "Instant payout failed", description: e?.message || "Try standard payout.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={run} disabled={!canRun || loading} variant="outline" className="w-full gap-2 border-primary/40">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4 text-primary" />}
      Instant payout · €{net.toFixed(2)} <span className="text-[11px] text-muted-foreground">(1% fee)</span>
    </Button>
  );
}
