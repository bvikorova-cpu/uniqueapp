import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowUpDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export function TransferMarket({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [myPlayers, setMyPlayers] = useState<any[]>([]);
  const [salePrice, setSalePrice] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    supabase.from("hockey_players").select("*").eq("user_id", user.id).order("overall_rating", { ascending: false }).then(({ data }) => setMyPlayers(data || []));
  }, [user]);

  const listPlayer = async (player: any) => {
    const price = parseInt(salePrice[player.id] || String(player.market_value));
    if (isNaN(price) || price < 100) { toast.error("Min price is 100"); return; }
    await supabase.from("hockey_players").update({ is_for_sale: true, sale_price: price }).eq("id", player.id);
    await supabase.from("hockey_transfers").insert({ seller_id: user!.id, player_id: player.id, price, status: "listed" });
    setMyPlayers(prev => prev.map(p => p.id === player.id ? { ...p, is_for_sale: true, sale_price: price } : p));
    toast.success(`${player.name} listed for ${price} coins!`);
  };

  const unlistPlayer = async (player: any) => {
    await supabase.from("hockey_players").update({ is_for_sale: false, sale_price: null }).eq("id", player.id);
    setMyPlayers(prev => prev.map(p => p.id === player.id ? { ...p, is_for_sale: false, sale_price: null } : p));
    toast.success(`${player.name} removed from market`);
  };

  return (
    <>
      <FloatingHowItWorks title={"Transfer Market - How it works"} steps={[{ title: 'Open', desc: 'Access the Transfer Market section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Transfer Market.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-4">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ArrowUpDown className="h-5 w-5 text-primary" />Transfer Market</CardTitle></CardHeader>
        <CardContent>
          {myPlayers.length === 0 ? <p className="text-sm text-muted-foreground">No players to sell.</p> :
            <div className="space-y-3">{myPlayers.map(p => (
              <div key={p.id} className="p-3 rounded-lg border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <div><span className="font-bold text-sm">{p.name}</span><span className="text-xs text-muted-foreground ml-2">{p.position} | OVR {p.overall_rating}</span></div>
                  {p.is_for_sale && <span className="text-xs text-emerald-400">Listed: {p.sale_price} coins</span>}
                </div>
                {p.is_for_sale ? (
                  <Button size="sm" variant="outline" className="w-full" onClick={() => unlistPlayer(p)}>Remove from Market</Button>
                ) : (
                  <div className="flex gap-2">
                    <Input type="number" placeholder={String(p.market_value)} value={salePrice[p.id] || ""} onChange={(e) => setSalePrice(prev => ({ ...prev, [p.id]: e.target.value }))} className="h-8 text-sm" />
                    <Button size="sm" onClick={() => listPlayer(p)}>List</Button>
                  </div>
                )}
              </div>
            ))}</div>
          }
        </CardContent>
      </Card>
    </div>
    </>
  );
}
