import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Disc3, Gift, Star, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const prizes = [
  { label: "+25 XP", emoji: "⭐", color: "text-yellow-400", weight: 30 },
  { label: "+50 XP", emoji: "💫", color: "text-amber-400", weight: 25 },
  { label: "+100 XP", emoji: "🔥", color: "text-orange-500", weight: 15 },
  { label: "Mystery Badge", emoji: "🏅", color: "text-purple-400", weight: 8 },
  { label: "Streak Shield", emoji: "🛡️", color: "text-blue-400", weight: 10 },
  { label: "+200 XP", emoji: "💎", color: "text-cyan-400", weight: 5 },
  { label: "1 Free AI Credit", emoji: "🤖", color: "text-emerald-400", weight: 5 },
  { label: "JACKPOT +500 XP", emoji: "👑", color: "text-amber-300", weight: 2 },
];

export default function RewardsLuckyWheel() {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<typeof prizes[0] | null>(null);
  const [spinsLeft, setSpinsLeft] = useState(1);
  const [rotation, setRotation] = useState(0);
  const { toast } = useToast();

  const spin = () => {
    if (spinning || spinsLeft <= 0) return;
    setSpinning(true);
    setResult(null);

    const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);
    let random = Math.random() * totalWeight;
    let selected = prizes[0];
    for (const prize of prizes) {
      random -= prize.weight;
      if (random <= 0) { selected = prize; break; }
    }

    const newRotation = rotation + 1440 + Math.random() * 360;
    setRotation(newRotation);

    setTimeout(() => {
      setResult(selected);
      setSpinning(false);
      setSpinsLeft(prev => prev - 1);
      toast({ title: `🎉 You won: ${selected.label}!`, description: `${selected.emoji} Prize added to your account!` });
    }, 3000);
  };

  return (
    <div className="space-y-4">
      <Card className="p-6 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border-amber-400/20 backdrop-blur-md text-center">
        <h3 className="font-bold text-lg flex items-center justify-center gap-2 mb-4">
          <Disc3 className="h-5 w-5 text-amber-500" /> Daily Lucky Spin
        </h3>

        {/* Wheel */}
        <div className="relative w-48 h-48 mx-auto mb-6">
          <motion.div
            className="w-full h-full rounded-full border-4 border-amber-400/40 bg-gradient-to-br from-amber-900/30 to-yellow-900/20 flex items-center justify-center relative overflow-hidden"
            animate={{ rotate: rotation }}
            transition={{ duration: 3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {prizes.map((prize, i) => {
              const angle = (i / prizes.length) * 360;
              return (
                <div
                  key={i}
                  className="absolute text-lg"
                  style={{
                    transform: `rotate(${angle}deg) translateY(-70px)`,
                    transformOrigin: "center center",
                  }}
                >
                  {prize.emoji}
                </div>
              );
            })}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/30 z-10">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </div>
          </motion.div>
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 text-2xl z-20">▼</div>
        </div>

        <Button
          onClick={spin}
          disabled={spinning || spinsLeft <= 0}
          className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold hover:opacity-90 w-full"
        >
          {spinning ? "Spinning..." : spinsLeft > 0 ? `Spin the Wheel (${spinsLeft} left)` : "Come Back Tomorrow!"}
        </Button>

        <p className="text-xs text-muted-foreground mt-2">1 free spin daily • Login streak adds bonus spins</p>
      </Card>

      {/* Prize result */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <Card className="p-4 bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border-amber-400/30 text-center">
              <span className="text-4xl block mb-2">{result.emoji}</span>
              <p className={`font-black text-lg ${result.color}`}>{result.label}</p>
              <p className="text-xs text-muted-foreground mt-1">Added to your account!</p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prize table */}
      <Card className="p-4 bg-card/80 backdrop-blur-md border-amber-400/15">
        <h4 className="font-bold text-sm mb-3 flex items-center gap-2"><Gift className="h-4 w-4 text-amber-500" /> Possible Prizes</h4>
        <div className="grid grid-cols-2 gap-2">
          {prizes.map((prize, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20">
              <span className="text-lg">{prize.emoji}</span>
              <span className="text-xs font-medium">{prize.label}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
