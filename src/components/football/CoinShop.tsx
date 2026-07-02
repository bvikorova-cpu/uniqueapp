import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Coins, CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const coinPackages = [
  { coins: 1000, price: 299, label: "Starter Pack" },
  { coins: 5000, price: 999, label: "Pro Pack" },
  { coins: 15000, price: 2499, label: "Elite Pack" },
  { coins: 50000, price: 4999, label: "Legend Pack" },
];

export const CoinShop = ({ onBack }: { onBack: () => void }) => {
  const { user, session } = useAuth();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("football_coins").select("*").eq("user_id", user.id).single().then(async ({ data }) => {
      if (data) setBalance(data.balance);
      else {
        await supabase.from("football_coins").insert({ user_id: user.id });
        setBalance(0);
      }
    });
  }, [user]);

  const buyCoins = async (pkg: typeof coinPackages[0]) => {
    if (!user || !session) { toast.error("Sign in first"); return; }
    setLoading(pkg.label);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: {
          productName: `Football Arena - ${pkg.label}`,
          amount: pkg.price,
          metadata: { type: "football_coins", user_id: user.id, coins: pkg.coins }
        }
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e: any) { toast.error(e.message); } finally { setLoading(null); }
  };

  if (!user) return <div className="space-y-4"><Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4" /> Back</Button><p className="text-center py-8">Sign in first</p></div>;

  return (
    <><FloatingHowItWorks title="CoinShop — How it works" steps={[{title:"Open this section",desc:"Access CoinShop from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
      <h2 className="text-2xl font-bold">🪙 Coin Shop</h2>
      <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent">
        <CardContent className="pt-6 text-center">
          <Coins className="h-8 w-8 text-amber-400 mx-auto mb-2" />
          <p className="text-3xl font-black">{balance.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Your Coin Balance</p>
        </CardContent>
      </Card>
      <div className="grid grid-cols-2 gap-3">
        {coinPackages.map(pkg => (
          <Card key={pkg.label} className="border-emerald-500/20">
            <CardContent className="pt-6 text-center">
              <p className="text-2xl font-black text-amber-400">{pkg.coins.toLocaleString()}</p>
              <p className="font-semibold text-sm">{pkg.label}</p>
              <p className="text-xs text-muted-foreground mb-3">coins</p>
              <Button onClick={() => buyCoins(pkg)} disabled={loading === pkg.label} className="w-full gap-2" size="sm">
                <CreditCard className="h-3 w-3" /> €{(pkg.price / 100).toFixed(2)}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </>
  );
};
