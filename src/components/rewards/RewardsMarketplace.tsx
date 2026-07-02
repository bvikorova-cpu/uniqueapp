import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Loader2, Crown, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { HowItWorksButton } from "@/components/common/HowItWorksButton";

interface ShopItem {
  code: string;
  name: string;
  description: string | null;
  emoji: string | null;
  category: string;
  cost_xp: number;
  stock: number | null;
}

interface InventoryRow {
  item_code: string;
  quantity: number;
  expires_at: string | null;
}

export default function RewardsMarketplace() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [pending, setPending] = useState<string | null>(null);

  const { data: items } = useQuery<ShopItem[]>({
    queryKey: ["shop-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shop_items")
        .select("code,name,description,emoji,category,cost_xp,stock")
        .eq("is_active", true)
        .order("cost_xp");
      if (error) throw error;
      return (data ?? []) as ShopItem[];
    },
  });

  const { data: inv } = useQuery<InventoryRow[]>({
    queryKey: ["rewards-inventory"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("rewards_inventory")
        .select("item_code,quantity,expires_at")
        .eq("user_id", user.id);
      if (error) throw error;
      return (data ?? []) as InventoryRow[];
    },
  });

  const redeem = useMutation({
    mutationFn: async (code: string) => {
      setPending(code);
      const { data, error } = await supabase.rpc("redeem_shop_item", { _item_code: code });
      if (error) throw error;
      const res = data as { error?: string; ok?: boolean };
      if (res?.error) throw new Error(res.error.replace(/_/g, " "));
      return res;
    },
    onSuccess: () => {
      toast({ title: "✅ Item purchased!", description: "Added to your inventory." });
      qc.invalidateQueries({ queryKey: ["rewards-inventory"] });
      qc.invalidateQueries({ queryKey: ["rewards-stats"] });
      qc.invalidateQueries({ queryKey: ["gamification"] });
    },
    onError: (e: Error) => toast({ title: "Purchase failed", description: e.message, variant: "destructive" }),
    onSettled: () => setPending(null),
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex justify-end"><HowItWorksButton variant="compact" title="Rewards Marketplace" intro="Spend XP or credits on cosmetics, boosts and consumables." steps={[
        { title: "Browse items", desc: "Cards show the price (XP or credits), rarity and what the item does." },
        { title: "Buy with XP or credits", desc: "Some items accept XP, others only credits. The button label tells you which currency is used." },
        { title: "Your inventory", desc: "Purchased items go straight to your inventory and can be equipped from the Cosmetics tab." },
        { title: "Limited stock", desc: "Featured items rotate weekly. If you love it, buy it — it may not come back for a while." },
      ]} /></div>
      <Card className="p-6 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 border-violet-400/20 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/40">
            <ShoppingBag className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="font-black text-xl">XP Marketplace</h2>
            <p className="text-xs text-muted-foreground">Spend your XP on real boosters & cosmetics</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(items ?? []).map((it) => {
          const owned = inv?.find((x) => x.item_code === it.code);
          return (
            <Card key={it.code} className="p-4 bg-card/80 border-violet-400/15 backdrop-blur-md">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{it.emoji}</span>
                  <div>
                    <h3 className="font-bold">{it.name}</h3>
                    <p className="text-xs text-muted-foreground">{it.description}</p>
                  </div>
                </div>
                <Badge variant="outline" className="capitalize">{it.category}</Badge>
              </div>
              {owned && (
                <p className="text-xs text-emerald-500 mb-2 flex items-center gap-1">
                  <Package className="h-3 w-3" /> Owned ×{owned.quantity}
                  {owned.expires_at && ` · expires ${new Date(owned.expires_at).toLocaleDateString()}`}
                </p>
              )}
              <Button
                onClick={() => redeem.mutate(it.code)}
                disabled={pending === it.code}
                className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white"
                size="sm"
              >
                {pending === it.code ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  <><Crown className="h-4 w-4 mr-1" /> {it.cost_xp} XP</>
                )}
              </Button>
            </Card>
          );
        })}
      </div>
    </motion.div>
  );
}
