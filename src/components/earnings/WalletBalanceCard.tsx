import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Wallet } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Balance {
  currency: string;
  balance: number;
}

/** Multi-currency wallet snapshot from `wallet_balances`. EUR is always shown. */
export function WalletBalanceCard() {
  const { user } = useAuth();
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data } = await supabase
        .from("wallet_balances")
        .select("currency, balance")
        .eq("user_id", user.id);
      const list = (data as Balance[]) || [];
      if (!list.find((b) => b.currency === "EUR")) {
        list.unshift({ currency: "EUR", balance: 0 });
      }
      setBalances(list);
      setLoading(false);
    })();
  }, [user?.id]);

  return (
    <>
      <FloatingHowItWorks title={"Wallet Balance Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Wallet Balance Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Wallet Balance Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-card to-accent/5">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Wallet className="h-4 w-4 text-primary" /> Wallet
        </CardTitle>
        <Badge variant="secondary">Multi-currency</Badge>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <div className="text-xs text-muted-foreground">Loading…</div>
        ) : (
          balances.map((b) => (
            <div key={b.currency} className="flex items-baseline justify-between border-b border-border/40 pb-2 last:border-0">
              <span className="text-sm text-muted-foreground">{b.currency}</span>
              <span className="text-2xl font-black">{Number(b.balance).toFixed(2)}</span>
            </div>
          ))
        )}
        <p className="text-[11px] text-muted-foreground pt-1">
          Updated automatically after each payout settlement.
        </p>
      </CardContent>
    </Card>
    </>
  );
}
