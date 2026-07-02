import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Sparkles, Loader2, Check, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUserXp } from "@/hooks/useUserXp";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

type Item = { id: string; name: string; description: string | null; cost_xp: number; item_type: string; payload: any; active: boolean };
type Purchase = { item_id: string; created_at: string };

interface Props { userId: string | null; }

const MegatalentTalentShop = ({ userId }: Props) => {
  const { xp: totalXp } = useUserXp(userId);
  const [items, setItems] = useState<Item[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data: it } = await (supabase as any).from("talent_shop_items").select("*").eq("active", true).order("cost_xp");
      setItems((it as Item[]) || []);
      if (userId) {
        const { data: pu } = await (supabase as any).from("talent_shop_purchases").select("item_id,created_at").eq("user_id", userId);
        setPurchases((pu as Purchase[]) || []);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-line */ }, [userId]);

  const ownedSet = new Set(purchases.map(p => p.item_id));

  const buy = async (item: Item) => {
    if (!userId) { toast.error("Sign in to buy"); return; }
    if (totalXp < item.cost_xp) { toast.error("Not enough XP"); return; }
    setBusy(item.id);
    try {
      const { error } = await (supabase as any).rpc("purchase_shop_item", { _item_id: item.id });
      if (error) throw error;
      toast.success(`Unlocked: ${item.name}`);
      setPurchases(p => [...p, { item_id: item.id, created_at: new Date().toISOString() }]);
    } catch (e: any) {
      const msg = e?.message?.includes("insufficient_xp") ? "Not enough XP"
        : e?.message?.includes("item_not_found") ? "Item unavailable" : (e?.message || "Purchase failed");
      toast.error(msg);
    } finally { setBusy(null); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Megatalent Talent Shop - How it works"} steps={[{ title: 'Open', desc: 'Access the Megatalent Talent Shop section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Megatalent Talent Shop.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="backdrop-blur-xl bg-card/60 border-border/30">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <ShoppingBag className="h-4 w-4 text-primary" />
          <h2 className="font-bold">Talent Shop</h2>
          <Badge variant="secondary" className="ml-auto gap-1"><Sparkles className="h-3 w-3" /> {totalXp} XP</Badge>
        </div>

        {loading ? (
          <div className="py-6 flex items-center justify-center text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin mr-2" />Loading…</div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No items available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map(it => {
              const owned = ownedSet.has(it.id);
              const canAfford = totalXp >= it.cost_xp;
              return (
                <div key={it.id} className={`rounded-lg border p-3 ${owned ? "border-emerald-500/40 bg-emerald-500/5" : "border-border/30 bg-background/40"}`}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="font-semibold text-sm">{it.name}</div>
                    <Badge variant={canAfford ? "default" : "secondary"} className="text-[10px] shrink-0">{it.cost_xp} XP</Badge>
                  </div>
                  {it.description && <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{it.description}</p>}
                  <Button size="sm" variant={owned ? "secondary" : "default"} disabled={owned || !userId || !canAfford || busy === it.id}
                    onClick={() => buy(it)} className="w-full gap-1 h-8 text-xs">
                    {busy === it.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> :
                      owned ? <><Check className="h-3.5 w-3.5" /> Owned</> :
                      !canAfford ? <><Lock className="h-3.5 w-3.5" /> Need {it.cost_xp - totalXp} more XP</> :
                      "Unlock"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
};

export default MegatalentTalentShop;
