import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Gift, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

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

const getTierStyle = (price: number) => {
  if (price <= 100) return { gradient: "from-slate-500/20 to-slate-600/10", border: "border-slate-500/30 hover:border-slate-400/60", glow: "hover:shadow-slate-500/20", ring: "ring-slate-500/20" };
  if (price <= 350) return { gradient: "from-blue-500/20 to-cyan-600/10", border: "border-blue-500/30 hover:border-blue-400/60", glow: "hover:shadow-blue-500/20", ring: "ring-blue-500/20" };
  if (price <= 750) return { gradient: "from-purple-500/20 to-violet-600/10", border: "border-purple-500/30 hover:border-purple-400/60", glow: "hover:shadow-purple-500/20", ring: "ring-purple-500/20" };
  return { gradient: "from-yellow-500/20 to-amber-600/10", border: "border-yellow-500/30 hover:border-yellow-400/60", glow: "hover:shadow-yellow-500/20", ring: "ring-yellow-500/20" };
};

export const MysteryBoxShop = ({ onBack, onOpenBox }: Props) => {
  const { credits, refresh } = useAICredits();
  const navigate = useNavigate();
  const [boxes, setBoxes] = useState<MysteryBox[]>(defaultBoxes);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [userBoxes, setUserBoxes] = useState<any[]>([]);
  const [opening, setOpening] = useState<string | null>(null);
  const [revealedReward, setRevealedReward] = useState<any>(null);
  const [openingPhase, setOpeningPhase] = useState<"idle" | "shaking" | "burst" | "reveal">("idle");

  useEffect(() => { loadData(); }, []);

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
      const { error } = await supabase.rpc('purchase_mystery_box', { p_box_id: box.id });
      if (error) throw error;
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
    setOpeningPhase("shaking");

    // Shaking phase
    await new Promise(r => setTimeout(r, 1500));
    setOpeningPhase("burst");

    // Burst phase
    await new Promise(r => setTimeout(r, 800));

    try {
      const { data, error } = await supabase.rpc('open_mystery_box', { p_user_box_id: userBox.id });
      if (error) throw error;

      setOpeningPhase("reveal");
      setRevealedReward(data);
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#FFD700', '#FFA500', '#FF4500', '#9B59B6', '#3498DB'] });
      if (onOpenBox) onOpenBox(data);
      await loadData();
      toast.success("🎉 Box opened! Check your reward!");
    } catch (e: any) {
      toast.error(e.message || "Failed to open box");
    } finally {
      setOpening(null);
      setOpeningPhase("idle");
    }
  };

  const unopenedBoxes = userBoxes.filter(ub => !ub.is_opened);

  return (
    <>
      <FloatingHowItWorks title={"Mystery Box Shop - How it works"} steps={[{ title: 'Open', desc: 'Access the Mystery Box Shop section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Mystery Box Shop.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={onBack} className="gap-2 text-yellow-400 hover:text-yellow-300">
        <ArrowLeft className="h-4 w-4" /> Back to Vault
      </Button>

      <Card className="p-6 max-w-5xl mx-auto bg-card/90 backdrop-blur-xl border-yellow-500/20 shadow-[0_0_40px_rgba(255,215,0,0.08)]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/30">
            <Gift className="h-6 w-6 text-black" />
          </div>
          <div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent">Mystery Box Shop</h2>
            <p className="text-muted-foreground text-xs">9 Tiers • Choose your risk, claim your reward</p>
          </div>
        </motion.div>

        {/* Box Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {boxes.map((box, i) => {
            const style = getTierStyle(box.price);
            return (
              <motion.div
                key={box.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.04, type: "spring", stiffness: 250 }}
                whileHover={{ scale: 1.04, y: -6 }}
                whileTap={{ scale: 0.97 }}
              >
                <Card className={`p-4 bg-gradient-to-br ${style.gradient} ${style.border} ${style.glow} hover:shadow-lg transition-all relative overflow-hidden group`}>
                  {box.price >= 1000 && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-500 to-amber-600 text-black text-[9px] font-black px-2 py-0.5 rounded-bl-lg">
                      PREMIUM
                    </div>
                  )}
                  <div className="text-center mb-3">
                    <motion.span 
                      className="text-5xl block"
                      animate={{ rotateY: [0, 10, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 3, delay: i * 0.3 }}
                    >
                      {box.icon}
                    </motion.span>
                  </div>
                  <h3 className="font-black text-base text-center mb-0.5">{box.name}</h3>
                  <p className="text-[11px] text-muted-foreground text-center mb-3 leading-relaxed">{box.description}</p>
                  <div className="flex items-center justify-center gap-1.5 mb-3">
                    <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
                    <span className="text-xl font-black bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">{box.price}</span>
                    <span className="text-[10px] text-muted-foreground">credits</span>
                  </div>
                  <Button
                    onClick={() => handlePurchase(box)}
                    disabled={purchasing === box.id}
                    className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-black font-bold shadow-lg shadow-yellow-500/20 active:scale-[0.97] transition-transform"
                    size="sm"
                  >
                    {purchasing === box.id ? <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Buying...</> : "Buy Box"}
                  </Button>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Unopened Boxes */}
        {unopenedBoxes.length > 0 && (
          <>
            <h3 className="text-xl font-black mb-4 bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
              Your Unopened Boxes ({unopenedBoxes.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {unopenedBoxes.map((ub) => (
                <motion.div
                  key={ub.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={opening === ub.id && openingPhase === "shaking" ? {
                    x: [0, -4, 4, -4, 4, -2, 2, 0],
                    rotate: [0, -3, 3, -3, 3, -1, 1, 0],
                  } : {}}
                  transition={opening === ub.id && openingPhase === "shaking" ? {
                    duration: 0.5, repeat: 3
                  } : {}}
                >
                  <Card className={`p-4 text-center border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10 transition-all ${
                    opening === ub.id && openingPhase === "burst" ? "ring-2 ring-yellow-400 shadow-[0_0_30px_rgba(255,215,0,0.4)]" : ""
                  }`}>
                    <span className="text-4xl block mb-2">{ub.mystery_boxes?.icon || '📦'}</span>
                    <p className="text-xs font-bold mb-2">{ub.mystery_boxes?.name || 'Mystery Box'}</p>
                    <Button
                      size="sm"
                      onClick={() => handleOpen(ub)}
                      disabled={opening === ub.id}
                      className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold active:scale-[0.95]"
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
              className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4"
              onClick={() => setRevealedReward(null)}
            >
              <motion.div
                initial={{ scale: 0.3, opacity: 0, rotateY: 180 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: "spring", damping: 12, stiffness: 200 }}
                className="max-w-sm w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <Card className="p-8 text-center bg-gradient-to-br from-yellow-500/15 to-amber-600/10 border-yellow-500/40 shadow-[0_0_80px_rgba(255,215,0,0.25)] relative overflow-hidden">
                  {/* Animated glow rings */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-40 h-40 rounded-full border border-yellow-500/30"
                    />
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: 3, duration: 0.6 }}
                    className="text-7xl mb-4 relative z-10"
                  >
                    🎉
                  </motion.div>
                  <h3 className="text-2xl font-black mb-2 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent relative z-10">
                    Congratulations!
                  </h3>
                  <p className="text-muted-foreground mb-4 relative z-10">
                    {revealedReward.rarity?.name && (
                      <span className="font-black text-yellow-400 uppercase tracking-wider">{revealedReward.rarity.name} </span>
                    )}
                    item unlocked!
                  </p>
                  <Button onClick={() => setRevealedReward(null)} className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold shadow-lg shadow-yellow-500/30 relative z-10">
                    Collect Reward
                  </Button>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
    </>
  );
};
