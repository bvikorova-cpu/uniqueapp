import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Coins, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const COIN_PACKS = [
  { coins: 1000, price: "€4.99", priceId: "price_hockey_1000" },
  { coins: 3000, price: "€9.99", priceId: "price_hockey_3000", popular: true },
  { coins: 7000, price: "€19.99", priceId: "price_hockey_7000" },
  { coins: 15000, price: "€39.99", priceId: "price_hockey_15000" },
];

export function CoinShop({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("hockey_coins").select("balance").eq("user_id", user.id).single().then(({ data }) => setBalance(data?.balance ?? 0));
  }, [user]);

  const purchase = async (pack: typeof COIN_PACKS[0]) => {
    if (!user) { toast.error("Please sign in"); return; }
    setLoading(pack.priceId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { priceId: pack.priceId, productKey: "hockey_coins", metadata: { coins: pack.coins, module: "hockey" } },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e: any) { toast.error(e.message); } finally { setLoading(null); }
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2"><Coins className="h-5 w-5 text-primary" />Coin Shop</span>
            {balance !== null && <span className="text-sm font-normal text-muted-foreground">Balance: {balance} 🪙</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {COIN_PACKS.map(pack => (
            <div key={pack.priceId} className={`flex items-center justify-between p-4 rounded-lg border ${pack.popular ? "border-primary/50 bg-primary/5" : "border-border/50"}`}>
              <div>
                <span className="font-bold">{pack.coins.toLocaleString()} Coins</span>
                {pack.popular && <span className="ml-2 text-xs text-primary font-semibold">BEST VALUE</span>}
                <p className="text-sm text-muted-foreground">{pack.price}</p>
              </div>
              <Button onClick={() => purchase(pack)} disabled={loading === pack.priceId}>
                {loading === pack.priceId ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buy"}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
