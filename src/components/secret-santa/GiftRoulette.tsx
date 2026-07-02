import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSecretSanta, GIFT_CATALOG } from "@/hooks/useSecretSanta";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle, Gift, Sparkles, Loader2, Users, Zap } from "lucide-react";
import { GiftConfetti } from "./GiftConfetti";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const ROULETTE_TIERS = [
  { id: "casual", label: "Casual Roulette", cost: 10, minValue: 5, maxValue: 30, emoji: "🎲", color: "from-green-500 to-emerald-600", desc: "Random gift worth 5-30 credits" },
  { id: "premium", label: "Premium Roulette", cost: 30, minValue: 20, maxValue: 80, emoji: "🎰", color: "from-blue-500 to-indigo-600", desc: "Random gift worth 20-80 credits" },
  { id: "legendary", label: "Legendary Roulette", cost: 75, minValue: 50, maxValue: 250, emoji: "👑", color: "from-amber-500 to-orange-600", desc: "Random gift worth 50-250 credits" },
  { id: "divine", label: "Divine Roulette", cost: 150, minValue: 100, maxValue: 500, emoji: "⚡", color: "from-purple-500 to-pink-600", desc: "Random gift worth 100-500 credits" },
];

export const GiftRoulette = () => {
  const { credits } = useSecretSanta();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTier, setSelectedTier] = useState<string>("casual");
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<{ gift: any; matchedUser: string } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [spinEmojis, setSpinEmojis] = useState<string[]>([]);

  const tier = ROULETTE_TIERS.find(t => t.id === selectedTier)!;

  const spinRoulette = async () => {
    if (credits < tier.cost) {
      toast({ title: "Not enough credits!", description: `You need ${tier.cost} credits.`, variant: "destructive" });
      return;
    }

    setIsSpinning(true);
    setResult(null);

    // Animate random emojis
    const eligibleGifts = GIFT_CATALOG.filter(g => g.value >= tier.minValue && g.value <= tier.maxValue);
    const animInterval = setInterval(() => {
      const randomGifts = Array.from({ length: 3 }, () => eligibleGifts[Math.floor(Math.random() * eligibleGifts.length)]);
      setSpinEmojis(randomGifts.map(g => g.emoji));
    }, 100);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get random active user
      const { data: randomUsers } = await supabase
        .from("profiles")
        .select("id, full_name")
        .neq("id", user.id)
        .limit(50);

      const matchedUser = randomUsers && randomUsers.length > 0
        ? randomUsers[Math.floor(Math.random() * randomUsers.length)]
        : null;

      // Pick random gift
      const randomGift = eligibleGifts[Math.floor(Math.random() * eligibleGifts.length)];

      // Send gift atomically (deducts credits + inserts gift + notifies)
      if (matchedUser) {
        const { error: rpcErr } = await supabase.rpc("send_secret_santa_gift", {
          p_recipient_id: matchedUser.id,
          p_gift_type: randomGift.type,
          p_gift_emoji: randomGift.emoji,
          p_gift_value: tier.cost,
          p_message: `🎲 Gift Roulette surprise! You received a ${randomGift.label}!`,
          p_is_anonymous: true,
          p_animation_type: "roulette",
        });
        if (rpcErr) throw rpcErr;
      } else {
        // No match — just deduct cost (still pays for the spin)
        const { error: dedErr } = await supabase.rpc("deduct_secret_santa_credits", {
          p_user_id: user.id,
          p_amount: tier.cost,
        });
        if (dedErr) throw dedErr;
      }

      // Stop animation after delay
      setTimeout(() => {
        clearInterval(animInterval);
        setIsSpinning(false);
        setResult({
          gift: randomGift,
          matchedUser: matchedUser?.full_name || "a random user",
        });
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 100);
        queryClient.invalidateQueries({ queryKey: ["secret-santa-credits"] });
        queryClient.invalidateQueries({ queryKey: ["secret-santa-sent"] });
      }, 2500);
    } catch (error: any) {
      clearInterval(animInterval);
      setIsSpinning(false);
      toast({ title: error.message || "Roulette failed", variant: "destructive" });
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Gift Roulette - How it works"} steps={[{ title: 'Open', desc: 'Access the Gift Roulette section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Gift Roulette.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <GiftConfetti trigger={showConfetti} type="mystery" />

      {/* Header */}
      <Card className="p-6 bg-white/80 backdrop-blur-xl border-amber-200 text-center shadow-lg">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
          <Shuffle className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Gift Roulette</h2>
        <p className="text-gray-500 text-sm">Get randomly matched with a user and send them a surprise gift! Pure anonymous generosity.</p>
      </Card>

      {/* Tier selection */}
      <div className="grid grid-cols-2 gap-3">
        {ROULETTE_TIERS.map(t => (
          <motion.div key={t.id} whileTap={{ scale: 0.97 }}>
            <Card
              onClick={() => setSelectedTier(t.id)}
              className={`p-4 cursor-pointer transition-all text-center ${
                selectedTier === t.id
                  ? `bg-gradient-to-br ${t.color} text-white shadow-lg border-transparent`
                  : "bg-white border-gray-200 hover:border-amber-300"
              }`}
            >
              <span className="text-3xl block mb-2">{t.emoji}</span>
              <p className={`font-bold text-sm ${selectedTier === t.id ? "text-white" : "text-gray-800"}`}>{t.label}</p>
              <p className={`text-xs mt-1 ${selectedTier === t.id ? "text-white/80" : "text-gray-500"}`}>{t.desc}</p>
              <p className={`font-bold mt-2 ${selectedTier === t.id ? "text-white" : credits >= t.cost ? "text-amber-600" : "text-red-500"}`}>
                💎 {t.cost}
              </p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Spin area */}
      <Card className="p-8 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 text-center shadow-lg">
        {isSpinning ? (
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
            <div className="text-6xl flex justify-center gap-4">
              {spinEmojis.map((e, i) => (
                <motion.span key={i} animate={{ y: [0, -20, 0] }} transition={{ duration: 0.3, delay: i * 0.1, repeat: Infinity }}>
                  {e}
                </motion.span>
              ))}
            </div>
          </motion.div>
        ) : result ? (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="space-y-3">
            <motion.span animate={{ y: [0, -15, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-7xl block">
              {result.gift.emoji}
            </motion.span>
            <h3 className="text-xl font-bold text-gray-800">{result.gift.label}</h3>
            <p className="text-amber-600 font-bold">Worth 💎 {result.gift.value} credits!</p>
            <p className="text-gray-500 text-sm">Sent anonymously to <span className="font-semibold">{result.matchedUser}</span></p>
            <Button onClick={() => setResult(null)} variant="outline" className="mt-4">
              <Shuffle className="h-4 w-4 mr-2" /> Spin Again
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <div className="text-6xl">🎲</div>
            <p className="text-gray-600">Select a tier and spin to anonymously gift a random user!</p>
          </div>
        )}
      </Card>

      {/* Spin button */}
      {!result && (
        <Button
          onClick={spinRoulette}
          disabled={isSpinning || credits < tier.cost}
          className="w-full py-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-lg rounded-2xl shadow-lg shadow-amber-500/30"
        >
          {isSpinning ? (
            <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Matching & Spinning...</>
          ) : credits < tier.cost ? (
            "Not enough credits"
          ) : (
            <><Zap className="h-5 w-5 mr-2" /> Spin Roulette — 💎 {tier.cost}</>
          )}
        </Button>
      )}

      {/* How it works */}
      <Card className="p-4 bg-white/80 border-amber-200 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-amber-500" /> How Gift Roulette Works
        </h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>1. 🎯 Choose a roulette tier based on your budget</p>
          <p>2. 🎲 Spin to get randomly matched with a platform user</p>
          <p>3. 🎁 A random gift from the tier range is auto-selected</p>
          <p>4. ✨ The gift is sent anonymously — spreading joy!</p>
        </div>
      </Card>
    </div>
    </>
  );
};
