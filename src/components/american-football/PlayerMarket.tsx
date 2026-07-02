import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export function PlayerMarket({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [listings, setListings] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("american_football_players").select("*").eq("is_for_sale", true).order("overall_rating", { ascending: false }).then(({ data }) => setListings((data || []).filter(p => p.user_id !== user?.id)));
  }, [user]);

  const buyPlayer = async (player: any) => {
    if (!user) return;
    const price = player.sale_price || player.market_value;
    const { data: coins } = await supabase.from("american_football_coins").select("*").eq("user_id", user.id).single();
    if (!coins || coins.balance < price) { toast.error("Not enough coins!"); return; }
    await supabase.from("american_football_coins").update({ balance: coins.balance - price, total_spent: coins.total_spent + price }).eq("user_id", user.id);
    await supabase.from("american_football_players").update({ user_id: user.id, is_for_sale: false, sale_price: null }).eq("id", player.id);
    await supabase.from("american_football_transfers").insert({ seller_id: player.user_id, buyer_id: user.id, player_id: player.id, price, status: "completed" });
    setListings(prev => prev.filter(p => p.id !== player.id));
    toast.success(`Bought ${player.name} for ${price} coins!`);
  };

  return (
    <><FloatingHowItWorks title="PlayerMarket — How it works" steps={[{title:"Open this section",desc:"Access PlayerMarket from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<div className="space-y-4">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-primary" />Player Market</CardTitle></CardHeader>
        <CardContent>
          {listings.length === 0 ? <p className="text-sm text-muted-foreground">No players for sale right now.</p> :
            <div className="space-y-3">{listings.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                <div>
                  <span className="font-bold text-sm">{p.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">{p.position} | OVR {p.overall_rating}</span>
                  <div className="text-xs text-muted-foreground">THR:{p.throwing} RSH:{p.rushing} SPD:{p.speed} TKL:{p.tackling}</div>
                </div>
                <Button size="sm" onClick={() => buyPlayer(p)}>{p.sale_price || p.market_value} coins</Button>
              </div>
            ))}</div>
          }
        </CardContent>
      </Card>
    </div>
  </>
  );
}
