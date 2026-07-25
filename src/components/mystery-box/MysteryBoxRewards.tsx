import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Calendar, Crown, Package, PackageOpen, Sparkles, Star, Trophy } from "lucide-react";
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
  const [selectedReward, setSelectedReward] = useState<any>(null);

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data, error } = await supabase.from('mystery_box_rewards')
      .select('*, mystery_box_items(item_name, item_type, item_data, rarity, duration_days), user_mystery_boxes(mystery_boxes(name, icon, price))')
      .eq('user_id', user.id)
      .order('received_at', { ascending: false })
      .limit(200);

    if (error) {
      console.error('Failed to load mystery box rewards', error);
      setItems([]);
      setLoading(false);
      return;
    }

    setItems(data || []);
    setLoading(false);
  };

  const rewardItem = (i: any) => {
    const joined = i?.mystery_box_items;
    return Array.isArray(joined) ? joined[0] : joined;
  };
  const rewardBox = (i: any) => {
    const joinedBox = i?.user_mystery_boxes;
    const userBox = Array.isArray(joinedBox) ? joinedBox[0] : joinedBox;
    const joinedMysteryBox = userBox?.mystery_boxes;
    return Array.isArray(joinedMysteryBox) ? joinedMysteryBox[0] : joinedMysteryBox;
  };
  const itemRarity = (i: any) => (rewardItem(i)?.rarity || 'common').toString().toLowerCase();
  const filteredItems = filter === "all" ? items : items.filter(i => itemRarity(i) === filter);
  const rarityCount = (r: string) => items.filter(i => itemRarity(i) === r).length;
  const selectedItem = selectedReward ? rewardItem(selectedReward) : null;
  const selectedBox = selectedReward ? rewardBox(selectedReward) : null;
  const selectedRarity = (selectedItem?.rarity || 'common').toString();
  const selectedType = selectedItem?.item_type ? selectedItem.item_type.replace(/_/g, ' ') : 'item';

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

        {loading ? (
          <Card className="p-16 text-center border-yellow-500/10">
            <Package className="h-14 w-14 mx-auto text-yellow-500/30 mb-4 animate-pulse" />
            <p className="text-muted-foreground font-medium">Loading your collection...</p>
          </Card>
        ) : filteredItems.length === 0 ? (
          <Card className="p-16 text-center border-yellow-500/10">
            <Package className="h-14 w-14 mx-auto text-yellow-500/30 mb-4" />
            <p className="text-muted-foreground font-medium">
              {items.length === 0 ? "No items yet. Open mystery boxes to start collecting!" : "No items in this category."}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredItems.map((item, i) => {
              const rarity = itemRarity(item);
              const style = getRarityStyle(rarity);
              const details = rewardItem(item);
              const name = details?.item_name || 'Mystery reward';
              const type = details?.item_type ? details.item_type.replace(/_/g, ' ') : 'item';
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: i * 0.03, type: "spring" }}
                  whileHover={{ scale: 1.06, y: -5 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Card
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedReward(item)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedReward(item);
                      }
                    }}
                    className={`p-4 ${style.border} ${style.bg} hover:shadow-lg ${style.glow} transition-all cursor-pointer`}
                  >
                    <div className="text-center mb-2">
                      {rarity === 'legendary' ? <Crown className={`h-8 w-8 mx-auto ${style.text}`} /> :
                       rarity === 'epic' ? <Star className={`h-8 w-8 mx-auto ${style.text}`} /> :
                       rarity === 'rare' ? <Sparkles className={`h-8 w-8 mx-auto ${style.text}`} /> :
                       <Package className={`h-8 w-8 mx-auto ${style.text}`} />}
                    </div>
                    <p className="font-bold text-sm text-center truncate">{name}</p>
                    <p className="text-[10px] text-muted-foreground text-center capitalize">{type}</p>
                    <p className="text-[10px] text-muted-foreground text-center truncate mt-1">
                      from {rewardBox(item)?.name || 'Mystery Box'}
                    </p>
                    <div className="flex justify-center mt-2">
                      <Badge className={`${style.badge} text-white text-[10px] border-0`}>{rarity}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center mt-1">
                      {new Date(item.received_at).toLocaleDateString()}
                    </p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>
      <Dialog open={Boolean(selectedReward)} onOpenChange={(open) => !open && setSelectedReward(null)}>
        <DialogContent className="max-w-sm border-yellow-500/30 bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-yellow-400">
              <PackageOpen className="h-5 w-5" /> Box reward
            </DialogTitle>
            <DialogDescription>
              {selectedBox?.name ? `Opened from ${selectedBox.name}` : "Mystery Box collection item"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-5 text-center">
              <div className="text-5xl mb-3">{selectedBox?.icon || "🎁"}</div>
              <p className="text-xl font-black">{selectedItem?.item_name || "Mystery reward"}</p>
              <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
                <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-black border-0 capitalize">
                  {selectedRarity}
                </Badge>
                <Badge variant="outline" className="capitalize border-yellow-500/30">
                  {selectedType}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <Card className="p-3 border-yellow-500/10">
                <p className="text-muted-foreground">Box</p>
                <p className="font-bold truncate">{selectedBox?.name || "Mystery Box"}</p>
              </Card>
              <Card className="p-3 border-yellow-500/10">
                <p className="text-muted-foreground">Collected</p>
                <p className="font-bold flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {selectedReward?.received_at ? new Date(selectedReward.received_at).toLocaleDateString() : "Now"}
                </p>
              </Card>
            </div>

            <Button onClick={() => setSelectedReward(null)} className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
};
