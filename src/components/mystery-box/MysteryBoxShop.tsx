import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Gift, Loader2, Sparkles, Crown, Star, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onBack: () => void;
  onOpenBox?: (reward: any) => void;
}

interface MysteryBox {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
}

const defaultBoxes: MysteryBox[] = [
  { id: 'basic', name: 'Basic Box', description: 'Common & uncommon items. Great for starters.', price: 50, icon: '📦' },
  { id: 'silver', name: 'Silver Box', description: 'Higher rare drop rates. Better value.', price: 100, icon: '🥈' },
  { id: 'gold', name: 'Gold Box', description: 'Guaranteed rare or better. Premium rewards.', price: 200, icon: '🥇' },
  { id: 'platinum', name: 'Platinum Box', description: 'Epic drop rates. Exclusive limited items.', price: 350, icon: '💎' },
  { id: 'diamond', name: 'Diamond Box', description: 'Legendary chances. Ultra-rare content.', price: 500, icon: '💠' },
  { id: 'cosmic', name: 'Cosmic Box', description: 'Guaranteed epic or legendary item.', price: 750, icon: '🌟' },
  { id: 'supreme', name: 'Supreme Box', description: 'Multiple legendary items possible.', price: 1000, icon: '👑' },
  { id: 'celestial', name: 'Celestial Box', description: 'Divine rewards. Limited edition content.', price: 1500, icon: '✨' },
  { id: 'universe', name: 'Universe Box', description: 'The rarest box. Universe-exclusive mega rewards.', price: 2500, icon: '🌌' },
];

const getRarityGradient = (price: number) => {
  if (price <= 100) return "from-gray-500/20 to-gray-600/10";
  if (price <= 350) return "from-blue-500/20 to-blue-600/10";
  if (price <= 750) return "from-purple-500/20 to-purple-600/10";
  return "from-yellow-500/20 to-yellow-600/10";
};

const getRarityBorder = (price: number) => {
  if (price <= 100) return "border-gray-500/30 hover:border-gray-400/50";
  if (price <= 350) return "border-blue-500/30 hover:border-blue-400/50";
  if (price <= 750) return "border-purple-500/30 hover:border-purple-400/50";
  return "border-yellow-500/30 hover:border-yellow-400/50";
};

export const MysteryBoxShop = ({ onBack, onOpenBox }: Props) => {
  const { credits, refresh } = useAICredits();
  const navigate = useNavigate();
  const [boxes, setBoxes] = useState<MysteryBox[]>(defaultBoxes);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [userBoxes, setUserBoxes] = useState<any[]>([]);
  const [opening, setOpening] = useState<string | null>(null);
  const [revealedReward, setRevealedReward] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [boxesRes, userBoxesRes] = await Promise.all([
      supabase.from('mystery_boxes').select('*').order('price'),
      supabase.from('user_mystery_boxes').select('*, mystery_boxes(*)'),
    ]);
    if (boxesRes.data?.length) setBoxes(boxesRes.data);
    if (userBoxesRes.data) setUserBoxes(userBoxesRes.data);
  };

  const handlePurchase = async (box: MysteryBox) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth"); return; }

    if (credits.credits_remaining < box.price) {
      toast.error(`You need ${box.price} credits. Redirecting...`);
      setTimeout(() => navigate("/ai-credits"), 1500);
      return;
    }

    setPurchasing(box.id);
    try {
      await supabase.from('ai_credits').update({ credits_remaining: credits.credits_remaining - box.price }).eq('user_id', user.id);
      await supabase.from('user_mystery_boxes').insert({ user_id: user.id, box_id: box.id });
      await supabase.from('ai_usage_history').insert({ user_id: user.id, usage_type: 'mystery_box_purchase', credits_used: box.price, description: `Purchased ${box.name}` });
      toast.success(`${box.name} purchased!`);
      await Promise.all([loadData(), refresh()]);
    } catch (e: any) {
      toast.error(e.message || "Purchase failed");
    } finally {
      setPurchasing(null);
    }
  };

  const handleOpen = async (userBox: any) => {
    setOpening(userBox.id);
    try {
      const { data, error } = await supabase.functions.invoke('open-mystery-box', {
        body: { boxId: userBox.box_id },
      });
      if (error) throw error;
      setRevealedReward(data);
      if (onOpenBox) onOpenBox(data);
      await loadData();
      toast.success("🎉 Box opened! Check your reward!");
    } catch (e: any) {
      toast.error(e.message || "Failed to open box");
    } finally {
      setOpening(null);
    }
  };

  const unopenedBoxes = userBoxes.filter(ub => !ub.is_opened);

  return (
    <div className="space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={onBack} className="gap-2 text-yellow-400 hover:text-yellow-300">
        <ArrowLeft className="h-4 w-4" /> Back to Vault
      </Button>

      <Card className="p-6 max-w-5xl mx-auto bg-card/80 backdrop-blur-xl border-yellow-500/20 shadow-[0_0_30px_rgba(255,215,0,0.08)]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/20">
            <Gift className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">Mystery Box Shop</h2>
            <p className="text-muted-foreground text-sm">Choose your tier — higher price, better odds</p>
          </div>
        </motion.div>

        {/* Available Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {boxes.map((box, i) => (
            <motion.div
              key={box.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 200 }}
            >
              <Card className={`p-4 bg-gradient-to-br ${getRarityGradient(box.price)} ${getRarityBorder(box.price)} hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]`}>
                <div className="text-center mb-3">
                  <span className="text-5xl">{box.icon}</span>
                </div>
                <h3 className="font-black text-lg text-center mb-1">{box.name}</h3>
                <p className="text-xs text-muted-foreground text-center mb-3">{box.description}</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-black text-yellow-400">{box.price}</span>
                  <span className="text-xs text-muted-foreground">credits</span>
                </div>
                <Button
                  onClick={() => handlePurchase(box)}
                  disabled={purchasing === box.id}
                  className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-black font-bold shadow-lg shadow-yellow-500/20"
                  size="sm"
                >
                  {purchasing === box.id ? <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Buying...</> : "Buy Box"}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Unopened Boxes */}
        {unopenedBoxes.length > 0 && (
          <>
            <h3 className="text-xl font-black mb-4 bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">Your Unopened Boxes ({unopenedBoxes.length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {unopenedBoxes.map((ub) => (
                <motion.div key={ub.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Card className="p-4 text-center border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10 transition-colors">
                    <span className="text-4xl block mb-2 animate-bounce">{ub.mystery_boxes?.icon || '📦'}</span>
                    <p className="text-xs font-bold mb-2">{ub.mystery_boxes?.name || 'Mystery Box'}</p>
                    <Button
                      size="sm"
                      onClick={() => handleOpen(ub)}
                      disabled={opening === ub.id}
                      className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold"
                    >
                      {opening === ub.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Open"}
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* Reward Reveal Modal */}
        <AnimatePresence>
          {revealedReward && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setRevealedReward(null)}
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0, rotateY: 180 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                transition={{ type: "spring", damping: 12, stiffness: 200 }}
                className="max-w-sm w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <Card className="p-8 text-center bg-gradient-to-br from-yellow-500/10 to-amber-600/10 border-yellow-500/30 shadow-[0_0_60px_rgba(255,215,0,0.2)]">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: 2, duration: 0.5 }}
                    className="text-6xl mb-4"
                  >
                    🎉
                  </motion.div>
                  <h3 className="text-2xl font-black mb-2 bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
                    Congratulations!
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {revealedReward.rarity?.name && (
                      <span className="font-bold text-yellow-400">{revealedReward.rarity.name} </span>
                    )}
                    item unlocked!
                  </p>
                  <Button onClick={() => setRevealedReward(null)} className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold">
                    Collect
                  </Button>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
};
