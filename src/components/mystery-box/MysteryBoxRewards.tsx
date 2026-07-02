import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Crown, Star, Sparkles, Package, Trophy, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

const getRarityStyle = (rarity: string) => {
  switch (rarity?.toLowerCase()) {
    case 'legendary': return { border: "border-yellow-500/40", bg: "bg-yellow-500/10", text: "text-yellow-400", badge: "bg-gradient-to-r from-yellow-500 to-amber-600", glow: "shadow-yellow-500/20" };
    case 'epic': return { border: "border-purple-500/40", bg: "bg-purple-500/10", text: "text-purple-400", badge: "bg-gradient-to-r from-purple-500 to-violet-600", glow: "shadow-purple-500/20" };
    case 'rare': return { border: "border-blue-500/40", bg: "bg-blue-500/10", text: "text-blue-400", badge: "bg-gradient-to-r from-blue-500 to-cyan-600", glow: "shadow-blue-500/20" };
    default: return { border: "border-slate-500/40", bg: "bg-slate-500/10", text: "text-slate-400", badge: "bg-gradient-to-r from-slate-500 to-slate-600", glow: "shadow-slate-500/20" };
  }
};

export const MysteryBoxRewards = ({ onBack }: Props) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('user_collectibles')
      .select('*, collectibles(*, collectible_rarities(*))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);
    setItems(data || []);
    setLoading(false);
  };

  const filteredItems = filter === "all" ? items : items.filter(i => {
    const rarity = i.collectibles?.collectible_rarities?.name || i.collectibles?.rarity || 'common';
    return rarity.toLowerCase() === filter;
  });

  const rarityCount = (r: string) => items.filter(i => (i.collectibles?.collectible_rarities?.name || i.collectibles?.rarity || 'common').toLowerCase() === r).length;

  const filters = [
    { id: "all", label: "All", count: items.length },
    { id: "legendary", label: "Legendary", count: rarityCount("legendary") },
    { id: "epic", label: "Epic", count: rarityCount("epic") },
    { id: "rare", label: "Rare", count: rarityCount("rare") },
    { id: "common", label: "Common", count: rarityCount("common") },
  ];

  return (
    <>
      <FloatingHowItWorks title={"Mystery Box Rewards - How it works"} steps={[{ title: 'Open', desc: 'Access the Mystery Box Rewards section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Mystery Box Rewards.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={onBack} className="gap-2 text-yellow-400 hover:text-yellow-300">
        <ArrowLeft className="h-4 w-4" /> Back to Vault
      </Button>

      <Card className="p-6 max-w-4xl mx-auto bg-card/90 backdrop-blur-xl border-yellow-500/20 shadow-[0_0_40px_rgba(255,215,0,0.08)]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">My Collection</h2>
            <p className="text-muted-foreground text-xs">{items.length} items collected</p>
          </div>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[
            { label: "Legendary", count: rarityCount("legendary"), color: "text-yellow-400" },
            { label: "Epic", count: rarityCount("epic"), color: "text-purple-400" },
            { label: "Rare", count: rarityCount("rare"), color: "text-blue-400" },
            { label: "Common", count: rarityCount("common"), color: "text-slate-400" },
          ].map(s => (
            <Card key={s.label} className="p-3 text-center border-border/50">
              <p className={`text-xl font-black ${s.color}`}>{s.count}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {filters.map(f => (
            <Button
              key={f.id}
              size="sm"
              variant="outline"
              onClick={() => setFilter(f.id)}
              className={`text-xs ${filter === f.id ? "bg-yellow-500/15 border-yellow-500/50 text-yellow-400" : "border-border/50"}`}
            >
              {f.label} ({f.count})
            </Button>
          ))}
        </div>

        {filteredItems.length === 0 ? (
          <Card className="p-16 text-center border-yellow-500/10">
            <Package className="h-14 w-14 mx-auto text-yellow-500/30 mb-4" />
            <p className="text-muted-foreground font-medium">
              {items.length === 0 ? "No items yet. Open mystery boxes to start collecting!" : "No items in this category."}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredItems.map((item, i) => {
              const rarity = item.collectibles?.collectible_rarities?.name || item.collectibles?.rarity || 'common';
              const style = getRarityStyle(rarity);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: i * 0.03, type: "spring" }}
                  whileHover={{ scale: 1.06, y: -5 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Card className={`p-4 ${style.border} ${style.bg} hover:shadow-lg ${style.glow} transition-all`}>
                    <div className="text-center mb-2">
                      {rarity === 'legendary' ? <Crown className={`h-8 w-8 mx-auto ${style.text}`} /> :
                       rarity === 'epic' ? <Star className={`h-8 w-8 mx-auto ${style.text}`} /> :
                       rarity === 'rare' ? <Sparkles className={`h-8 w-8 mx-auto ${style.text}`} /> :
                       <Package className={`h-8 w-8 mx-auto ${style.text}`} />}
                    </div>
                    <p className="font-bold text-sm text-center truncate">{item.collectibles?.name || 'Unknown'}</p>
                    <div className="flex justify-center mt-2">
                      <Badge className={`${style.badge} text-white text-[10px] border-0`}>{rarity}</Badge>
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
    </>
  );
};
