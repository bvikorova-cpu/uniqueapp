import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Zap, Banknote } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const TABLES = [
  "instructor_withdrawal_requests",
  "musician_withdrawal_requests",
  "masterchef_withdrawal_requests",
  "influencer_withdrawal_requests",
  "auction_withdrawal_requests",
  "referral_withdrawal_requests",
  "withdrawal_requests",
] as const;

/**
 * Admin widget: shows total pending withdrawal count + sum across every
 * creator type, plus a one-click "Run auto-payout sweep now" trigger that
 * invokes the same scheduled edge function manually.
 */
export function PendingPayoutsCard() {
  const { toast } = useToast();
  const [count, setCount] = useState<number | null>(null);
  const [sum, setSum] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const load = async () => {
    setLoading(true);
    let c = 0;
    let s = 0;
    await Promise.all(
      TABLES.map(async (t) => {
        const { data, error } = await supabase
          .from(t as any)
          .select("amount", { count: "exact" })
          .eq("status", "pending");
        if (!error && data) {
          c += data.length;
          s += data.reduce((acc: number, r: any) => acc + Number(r.amount || 0), 0);
        }
      }),
    );
    setCount(c);
    setSum(s);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const runSweep = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "auto-payout-pending-withdrawals",
      );
      if (error) throw error;
      toast({
        title: "Auto-payout sweep complete",
        description: `Paid: ${(data as any)?.paid ?? 0} · Skipped: ${(data as any)?.skipped ?? 0} · Failed: ${(data as any)?.failed ?? 0}`,
      });
      await load();
    } catch (e: any) {
      toast({
        title: "Sweep failed",
        description: e?.message || "Unknown error",
        variant: "destructive",
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Pending Payouts Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Pending Payouts Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Pending Payouts Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="border-primary/20 bg-card/60 backdrop-blur-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Banknote className="h-4 w-4 text-amber-500" />
          Pending Creator Payouts
        </CardTitle>
        <Badge variant="secondary">all 7 hubs</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : (
          <>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold">{count ?? 0}</span>
              <span className="text-sm text-muted-foreground">
                requests · €{sum.toFixed(2)} total
              </span>
            </div>
            <Button
              onClick={runSweep}
              disabled={running || count === 0}
              className="w-full gap-2"
              size="sm"
            >
              {running ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              {running ? "Running sweep…" : "Run auto-payout sweep"}
            </Button>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Auto-pays pending withdrawals ≤ €200 to creators with active
              Stripe Connect. Larger amounts stay for manual review.
            </p>
          </>
        )}
      </CardContent>
    </Card>
    </>
  );
}
