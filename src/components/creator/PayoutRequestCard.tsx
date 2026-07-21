import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Banknote, Loader2, Zap, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const MIN_STANDARD = 1;
const MIN_INSTANT = 10;
const INSTANT_FEE = 0.01; // 1%

interface Props {
  enabled: boolean;
  onPaid?: () => void;
}

export function PayoutRequestCard({ enabled, onPaid }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [available, setAvailable] = useState(0);
  const [amount, setAmount] = useState("");
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [submitting, setSubmitting] = useState<"standard" | "instant" | null>(null);

  const loadBalance = useCallback(async () => {
    if (!user?.id) return;
    setLoadingBalance(true);
    try {
      const { data, error } = await (supabase as any).rpc(
        "get_creator_available_cents",
        { p_user: user.id },
      );
      if (error) throw error;
      const cents = Number(data ?? 0);
      setAvailable(cents / 100);
    } catch (e) {
      console.warn("[PayoutRequestCard] balance rpc failed", e);
      setAvailable(0);
    } finally {
      setLoadingBalance(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadBalance();
  }, [loadBalance]);

  const requested = Number(amount) || 0;
  const feeInstant = +(requested * INSTANT_FEE).toFixed(2);
  const netInstant = +(requested - feeInstant).toFixed(2);

  const run = async (method: "standard" | "instant") => {
    if (!enabled) {
      toast({
        title: "Stripe Connect required",
        description: "Complete onboarding to receive payouts.",
        variant: "destructive",
      });
      return;
    }
    const min = method === "instant" ? MIN_INSTANT : MIN_STANDARD;
    if (requested < min) {
      toast({
        title: "Amount too low",
        description: `Minimum ${method} payout is €${min.toFixed(2)}.`,
        variant: "destructive",
      });
      return;
    }
    if (requested > available) {
      toast({
        title: "Insufficient balance",
        description: `Available: €${available.toFixed(2)}.`,
        variant: "destructive",
      });
      return;
    }

    setSubmitting(method);
    try {
      const { data, error } = await supabase.functions.invoke("stripe-connect-payout", {
        body: {
          amount_cents: Math.floor(requested * 100),
          currency: "eur",
          method,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast({
        title: method === "instant" ? "Instant payout sent" : "Payout requested",
        description:
          method === "instant"
            ? `€${netInstant.toFixed(2)} on its way (€${feeInstant} fee).`
            : `€${requested.toFixed(2)} will arrive in 1–2 business days.`,
      });
      setAmount("");
      loadBalance();
      onPaid?.();
    } catch (e: any) {
      toast({
        title: "Payout failed",
        description: e?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <Banknote className="h-5 w-5 text-primary" />
            Request payout
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadBalance}
            disabled={loadingBalance}
          >
            <RefreshCw className={`h-4 w-4 ${loadingBalance ? "animate-spin" : ""}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
          <span className="text-sm text-muted-foreground">Available balance</span>
          <span className="text-2xl font-bold text-primary">
            €{available.toFixed(2)}
          </span>
        </div>

        <div className="space-y-2">
          <Label htmlFor="payout-amount">Amount (EUR)</Label>
          <div className="flex gap-2">
            <Input
              id="payout-amount"
              type="number"
              min={MIN_STANDARD}
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={!enabled || submitting !== null}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => setAmount(available.toFixed(2))}
              disabled={!enabled || available <= 0}
            >
              Max
            </Button>
          </div>
          {requested >= MIN_INSTANT && (
            <p className="text-xs text-muted-foreground">
              Instant net: <span className="font-semibold">€{netInstant.toFixed(2)}</span> (fee €{feeInstant})
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Button
            onClick={() => run("standard")}
            disabled={!enabled || submitting !== null || requested < MIN_STANDARD}
            className="w-full"
          >
            {submitting === "standard" ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Banknote className="h-4 w-4 mr-2" />
            )}
            Standard payout
            <Badge variant="secondary" className="ml-2 text-[10px]">Free · 1–2d</Badge>
          </Button>
          <Button
            variant="outline"
            onClick={() => run("instant")}
            disabled={!enabled || submitting !== null || requested < MIN_INSTANT}
            className="w-full border-primary/40"
          >
            {submitting === "instant" ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2 text-primary" />
            )}
            Instant
            <Badge variant="secondary" className="ml-2 text-[10px]">1% · min €10</Badge>
          </Button>
        </div>

        {!enabled && (
          <p className="text-xs text-muted-foreground text-center">
            Complete Stripe Connect onboarding above to enable payouts.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
