import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowUpDown, Tag } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const TransferMarket = ({ onBack }: { onBack: () => void }) => {
  const { user } = useAuth();
  const [myPlayers, setMyPlayers] = useState<any[]>([]);
  const [salePrice, setSalePrice] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    supabase.from("football_players").select("*").eq("user_id", user.id).order("overall_rating", { ascending: false }).then(({ data }) => setMyPlayers(data || []));
  }, [user]);

  const listPlayer = async (player: any) => {
    const price = parseInt(salePrice[player.id] || String(player.market_value));
    if (isNaN(price) || price < 100) { toast.error("Min price is 100"); return; }
    await supabase.from("football_players").update({ is_for_sale: true, sale_price: price }).eq("id", player.id);
    await supabase.from("football_transfers").insert({ seller_id: user!.id, player_id: player.id, price, status: "listed" });
    setMyPlayers(prev => prev.map(p => p.id === player.id ? { ...p, is_for_sale: true, sale_price: price } : p));
    toast.success(`${player.name} listed for ${price} coins!`);
  };

  const unlistPlayer = async (player: any) => {
    await supabase.from("football_players").update({ is_for_sale: false, sale_price: null }).eq("id", player.id);
    setMyPlayers(prev => prev.map(p => p.id === player.id ? { ...p, is_for_sale: false, sale_price: null } : p));
    toast.success(`${player.name} removed from market`);
  };

  if (!user) return <div className="space-y-4"><Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4" /> Back</Button><p className="text-center py-8">Sign in first</p></div>;

  return (
    <><FloatingHowItWorks title="TransferMarket — How it works" steps={[{title:"Open this section",desc:"Access TransferMarket from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
      <h2 className="text-2xl font-bold">🔄 Transfer Market</h2>
      {myPlayers.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No players. Create some first!</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {myPlayers.map(player => (
            <Card key={player.id} className={player.is_for_sale ? "border-amber-500/30" : "border-emerald-500/20"}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-3">
                  <div><p className="font-bold">{player.name}</p><p className="text-xs text-muted-foreground">{player.position} • OVR {player.overall_rating}</p></div>
                  {player.is_for_sale && <Tag className="h-4 w-4 text-amber-400" />}
                </div>
                {player.is_for_sale ? (
                  <div className="flex gap-2">
                    <p className="flex-1 text-sm py-2">Listed for {player.sale_price?.toLocaleString()} coins</p>
                    <Button variant="outline" size="sm" onClick={() => unlistPlayer(player)}>Remove</Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input type="number" placeholder={String(player.market_value)} value={salePrice[player.id] || ""} onChange={e => setSalePrice(prev => ({ ...prev, [player.id]: e.target.value }))} className="flex-1" />
                    <Button size="sm" onClick={() => listPlayer(player)} className="gap-1"><ArrowUpDown className="h-3 w-3" /> List</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  </>
  );
};
