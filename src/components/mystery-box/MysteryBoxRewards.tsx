import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Crown, Star, Sparkles, Package, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface Props { onBack: () => void; }

const getRarityStyle = (rarity: string) => {
  switch (rarity?.toLowerCase()) {
    case 'legendary': return { border: "border-yellow-500/40", bg: "bg-yellow-500/10", text: "text-yellow-400", badge: "bg-yellow-500" };
    case 'epic': return { border: "border-purple-500/40", bg: "bg-purple-500/10", text: "text-purple-400", badge: "bg-purple-500" };
    case 'rare': return { border: "border-blue-500/40", bg: "bg-blue-500/10", text: "text-blue-400", badge: "bg-blue-500" };
    default: return { border: "border-gray-500/40", bg: "bg-gray-500/10", text: "text-gray-400", badge: "bg-gray-500" };
  }
};

export const MysteryBoxRewards = ({ onBack }: Props) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('user_collectibles')
      .select('*, collectibles(*, collectible_rarities(*))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    setItems(data || []);
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={onBack} className="gap-2 text-yellow-400 hover:text-yellow-300">
        <ArrowLeft className="h-4 w-4" /> Back to Vault
      </Button>

      <Card className="p-6 max-w-4xl mx-auto bg-card/80 backdrop-blur-xl border-yellow-500/20 shadow-[0_0_30px_rgba(255,215,0,0.08)]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/20">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">My Collection</h2>
            <p className="text-muted-foreground text-sm">{items.length} items collected</p>
          </div>
        </motion.div>

        {items.length === 0 ? (
          <Card className="p-16 text-center border-yellow-500/10">
            <Package className="h-14 w-14 mx-auto text-yellow-500/30 mb-4" />
            <p className="text-muted-foreground font-medium">No items yet. Open mystery boxes to start collecting!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {items.map((item, i) => {
              const rarity = item.collectibles?.collectible_rarities?.name || item.collectibles?.rarity || 'common';
              const style = getRarityStyle(rarity);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: i * 0.03, type: "spring" }}
                  whileHover={{ scale: 1.05, y: -4 }}
                >
                  <Card className={`p-4 ${style.border} ${style.bg} hover:shadow-lg transition-all`}>
                    <div className="text-center mb-2">
                      {rarity === 'legendary' ? <Crown className={`h-8 w-8 mx-auto ${style.text}`} /> :
                       rarity === 'epic' ? <Star className={`h-8 w-8 mx-auto ${style.text}`} /> :
                       rarity === 'rare' ? <Sparkles className={`h-8 w-8 mx-auto ${style.text}`} /> :
                       <Package className={`h-8 w-8 mx-auto ${style.text}`} />}
                    </div>
                    <p className="font-bold text-sm text-center truncate">{item.collectibles?.name || 'Unknown'}</p>
                    <div className="flex justify-center mt-2">
                      <Badge className={`${style.badge} text-white text-[10px]`}>{rarity}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center mt-1">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};
