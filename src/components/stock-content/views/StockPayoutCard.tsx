import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CreditCard, Wallet, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { useStripeConnect, type ConnectStatus } from "@/hooks/useStripeConnect";

type Withdrawal = {
  id: string;
  amount: number;
  status: string;
  payment_method: string;
  created_at: string;
};

export function StockPayoutCard() {
  const { toast } = useToast();
  const { getStatus, createAccount, startOnboarding, openDashboard, loading: connectLoading } = useStripeConnect();
  const [connectStatus, setConnectStatus] = useState<ConnectStatus>("none");
  const [balance, setBalance] = useState<number>(0);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Withdrawal[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const loadData = useCallback(async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    const status = await getStatus();
    setConnectStatus(status);

    const { data: wallet } = await supabase
      .from("wallet_balances")
      .select("balance")
      .eq("user_id", user.user.id)
      .eq("currency", "EUR")
      .maybeSingle();
    setBalance(wallet?.balance ?? 0);

    setHistoryLoading(true);
    const { data: withdrawals } = await supabase
      .from("stock_withdrawal_requests")
      .select("id, amount, status, payment_method, created_at")
      .eq("creator_id", user.user.id)
      .order("created_at", { ascending: false })
      .limit(10);
    setHistory(withdrawals || []);
    setHistoryLoading(false);
  }, [getStatus]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleConnect = async () => {
    try {
      const status = await getStatus();
      if (status === "none") {
        await createAccount();
      }
      await startOnboarding();
    } catch (e: any) {
      toast({ title: "Stripe setup failed", description: e?.message, variant: "destructive" });
    }
  };

  const handleRequest = async () => {
    const value = parseFloat(amount);
    if (!value || value <= 0) {
      toast({ title: "Enter amount", description: "Please enter a positive amount.", variant: "destructive" });
      return;
    }
    if (value > balance) {
      toast({ title: "Insufficient balance", description: `Available: €${balance.toFixed(2)}`, variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not signed in");

      const { error } = await supabase.from("stock_withdrawal_requests").insert({
        creator_id: user.user.id,
        amount: value,
        currency: "EUR",
        payment_method: "stripe_connect",
        payment_details: {},
        status: "pending",
        notes: "Payout to Stripe Connect account",
      });

      if (error) throw error;

      toast({ title: "Payout requested", description: "We will transfer your earnings to your Stripe account after approval." });
      setAmount("");
      await loadData();
    } catch (e: any) {
      toast({ title: "Request failed", description: e?.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const statusMessage: Record<ConnectStatus, string> = {
    none: "Connect your Stripe account to receive payouts instantly.",
    pending: "Your Stripe account is being reviewed. Payouts will begin once active.",
    active: "Your Stripe account is connected. Request a payout below.",
    restricted: "Your Stripe account needs attention. Open the dashboard to fix it.",
    error: "We could not verify your Stripe account status.",
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Stock Content Earnings
          </CardTitle>
          <CardDescription>
            Available balance: <strong>€{balance.toFixed(2)}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border p-4 bg-muted/50">
            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 mt-0.5 text-primary" />
              <div className="flex-1">
                <p className="font-medium">Stripe Connect</p>
                <p className="text-sm text-muted-foreground">{statusMessage[connectStatus]}</p>
              </div>
              {connectStatus === "active" ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : connectStatus === "restricted" || connectStatus === "error" ? (
                <AlertCircle className="w-5 h-5 text-amber-500" />
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {connectStatus === "active" ? (
                <Button variant="outline" onClick={openDashboard} disabled={connectLoading}>
                  {connectLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Open Stripe Dashboard"}
                </Button>
              ) : (
                <Button onClick={handleConnect} disabled={connectLoading}>
                  {connectLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Connect Stripe Account <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {connectStatus === "active" ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="payout-amount">Payout amount (EUR)</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    id="payout-amount"
                    type="number"
                    min={1}
                    max={balance}
                    step={0.01}
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={loading}
                  />
                  <Button onClick={handleRequest} disabled={loading || !amount}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Request Payout"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Minimum €1.00. Funds move to Stripe once an admin approves.</p>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
              Connect Stripe to request payouts. Until then, your earnings stay in your wallet.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No withdrawal requests yet.</p>
          ) : (
            <ul className="space-y-3">
              {history.map((w) => (
                <li key={w.id} className="flex justify-between items-center border-b last:border-0 pb-2">
                  <div>
                    <p className="font-medium">€{w.amount.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(w.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className="text-xs uppercase tracking-wide font-medium px-2 py-1 rounded-full bg-muted">
                    {w.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
