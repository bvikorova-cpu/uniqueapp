import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const PlayerMarket = ({ onBack }: { onBack: () => void }) => {
  const { user } = useAuth();
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("football_players").select("*").eq("is_for_sale", true).order("overall_rating", { ascending: false });
      setPlayers(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const buyPlayer = async (player: any) => {
    if (!user) { toast.error("Please sign in"); return; }
    if (player.user_id === user.id) { toast.error("Can't buy your own player"); return; }
    const { data: coins } = await supabase.from("football_coins").select("*").eq("user_id", user.id).single();
    if (!coins || coins.balance < (player.sale_price || player.market_value)) { toast.error("Not enough coins! Purchase coins first."); return; }
    const price = player.sale_price || player.market_value;
    await supabase.from("football_coins").update({ balance: coins.balance - price, total_spent: coins.total_spent + price }).eq("user_id", user.id);
    await supabase.from("football_players").update({ user_id: user.id, is_for_sale: false, sale_price: null, team_id: null }).eq("id", player.id);
    await supabase.from("football_transfers").insert({ seller_id: player.user_id, buyer_id: user.id, player_id: player.id, price, status: "completed" });
    toast.success(`Bought ${player.name}!`);
    setPlayers(prev => prev.filter(p => p.id !== player.id));
  };

  return (
    <><FloatingHowItWorks title="PlayerMarket — How it works" steps={[{title:"Open this section",desc:"Access PlayerMarket from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
      <h2 className="text-2xl font-bold">🏪 Player Market</h2>
      {loading ? <p className="text-center text-muted-foreground py-8">Loading market...</p> : players.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No players listed for sale yet. Create players and list them!</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {players.map(player => (
            <Card key={player.id} className="border-emerald-500/20">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <Badge className="mb-1">{player.position}</Badge>
                    <p className="text-lg font-bold">{player.name}</p>
                  </div>
                  <p className="text-2xl font-black text-emerald-400">{player.overall_rating}</p>
                </div>
                <div className="grid grid-cols-5 gap-1 text-center text-xs mb-4">
                  {[{ l: "PAC", v: player.pace }, { l: "SHO", v: player.shooting }, { l: "PAS", v: player.passing }, { l: "DEF", v: player.defending }, { l: "PHY", v: player.physical }].map(s => (
                    <div key={s.l} className="p-1 rounded bg-muted/50"><p className="font-bold text-sm">{s.v}</p><p className="text-muted-foreground">{s.l}</p></div>
                  ))}
                </div>
                <Button onClick={() => buyPlayer(player)} className="w-full gap-2 bg-gradient-to-r from-emerald-600 to-green-600">
                  <ShoppingCart className="h-4 w-4" /> Buy for {(player.sale_price || player.market_value).toLocaleString()} coins
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  </>
  );
};
