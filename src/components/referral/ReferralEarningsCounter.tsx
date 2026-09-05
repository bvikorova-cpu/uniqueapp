import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Euro, Users, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Totals {
  total: number;
  paid: number;
  pending: number;
  friends: number;
}

/**
 * Compact live counter of referral money.
 * Real data only — sums public.megatalent_referral_earnings for the signed-in user.
 */
export const ReferralEarningsCounter = ({ userId }: { userId: string }) => {
  const navigate = useNavigate();
  const [totals, setTotals] = useState<Totals | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { data, error } = await supabase
        .from("megatalent_referral_earnings")
        .select("amount, paid, referred_user_id")
        .eq("referrer_id", userId);
      if (error || cancelled) return;
      const rows = data || [];
      const total = rows.reduce((s, r: any) => s + Number(r.amount || 0), 0);
      const paid = rows
        .filter((r: any) => r.paid)
        .reduce((s, r: any) => s + Number(r.amount || 0), 0);
      setTotals({
        total,
        paid,
        pending: total - paid,
        friends: new Set(rows.map((r: any) => r.referred_user_id)).size,
      });
    };
    load();

    const channel = supabase
      .channel(`referral-earnings-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "megatalent_referral_earnings",
          filter: `referrer_id=eq.${userId}`,
        },
        () => load(),
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <Card className="p-4 border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-teal-500/5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
            <Euro className="h-3.5 w-3.5" /> Referral earnings
          </p>
          {totals ? (
            <p className="text-3xl font-bold text-emerald-500">
              €{totals.total.toFixed(2)}
            </p>
          ) : (
            <Loader2 className="mt-2 h-5 w-5 animate-spin text-muted-foreground" />
          )}
        </div>
        <Button size="sm" variant="outline" onClick={() => navigate("/referral")}>
          Details
        </Button>
      </div>

      {totals && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge variant="outline" className="gap-1 text-[11px]">
            <Users className="h-3 w-3" /> {totals.friends} invited
          </Badge>
          <Badge variant="outline" className="gap-1 border-emerald-500/40 text-[11px] text-emerald-500">
            <CheckCircle2 className="h-3 w-3" /> €{totals.paid.toFixed(2)} paid out
          </Badge>
          <Badge variant="outline" className="gap-1 border-amber-500/40 text-[11px] text-amber-500">
            <Clock className="h-3 w-3" /> €{totals.pending.toFixed(2)} pending
          </Badge>
        </div>
      )}

      <p className="mt-2 text-[11px] text-muted-foreground">
        €5 for every friend who pays a subscription — updated automatically.
      </p>
    </Card>
  );
};

export default ReferralEarningsCounter;
