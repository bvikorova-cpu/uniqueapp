import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Banknote, Loader2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Withdrawable {
  earned_credits: number;
  withdrawn_credits: number;
  wallet_credits: number;
  available_credits: number;
  available_eur: number;
  min_eur: number;
}

const MIN_EUR = 20;

/**
 * Lets creators convert ONLY the credits they earned from video unlocks
 * (never purchased credits) into a withdrawable EUR balance in Earnings.
 */
export default function CreatorCashoutCard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<Withdrawable | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: res, error } = await (supabase as any).rpc("get_premium_video_withdrawable");
    if (error) {
      console.error("[CreatorCashoutCard]", error);
    } else if (res && !res.error) {
      setData(res as Withdrawable);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const cashout = async () => {
    setBusy(true);
    try {
      const { data: res, error } = await (supabase as any).rpc("cashout_premium_video_earnings");
      if (error) throw error;
      if (!res?.success) {
        if (res?.error === "below_minimum") {
          toast.error(`Minimum payout is €${MIN_EUR}`, {
            description: `You currently have €${Number(res.available_eur ?? 0).toFixed(2)} available from unlocks.`,
          });
        } else {
          toast.error("Cash out failed", { description: res?.error ?? "Unknown error" });
        }
        return;
      }
      toast.success(`€${Number(res.amount_eur).toFixed(2)} moved to your Earnings balance`, {
        description: "Request the bank payout in the Earnings section.",
      });
      window.dispatchEvent(new Event("video-credits-updated"));
      await load();
    } catch (e: any) {
      toast.error("Cash out failed", { description: e?.message });
    } finally {
      setBusy(false);
    }
  };

  const availableEur = Number(data?.available_eur ?? 0);
  const canCashout = availableEur >= MIN_EUR;

  return (
    <div className="rounded-xl border border-border/60 bg-background/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Wallet className="h-3.5 w-3.5" /> Withdrawable from unlocks
          </p>
          <p className="text-2xl font-black">
            {loading ? "…" : `€${availableEur.toFixed(2)}`}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Only credits <strong>earned from video unlocks</strong> can be withdrawn — purchased
            credits stay in your wallet for uploads and boosts.
            {data ? (
              <>
                {" "}
                Earned: <strong>{data.earned_credits}</strong> · already withdrawn:{" "}
                <strong>{data.withdrawn_credits}</strong> · wallet:{" "}
                <strong>{data.wallet_credits}</strong> credits.
              </>
            ) : null}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button onClick={cashout} disabled={busy || loading || !canCashout} className="gap-2">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Banknote className="h-4 w-4" />}
            Cash out to Earnings
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate("/earnings")}>
            Open Earnings
          </Button>
        </div>
      </div>
      {!loading && !canCashout ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Minimum cash out is <strong>€{MIN_EUR}</strong> (40 earned credits).
        </p>
      ) : null}
    </div>
  );
}
