import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Lock } from "lucide-react";
import { useCurseWheel } from "@/hooks/useShadowArenaFeatures";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const SEGMENTS = [
  "+5 cr", "+10 cr", "2x votes", "Lucky badge", "Nothing", "+20 cr", "JACKPOT", "Cursed",
];

export function CurseWheelCard() {
  const { lastSpin, spin, hasSpunToday } = useCurseWheel();
  const [rotation, setRotation] = useState(0);

  const handleSpin = () => {
    if (hasSpunToday || spin.isPending) return;
    const turns = 5 + Math.random() * 3;
    setRotation((r) => r + turns * 360);
    spin.mutate();
  };

  return (
    <><FloatingHowItWorks title="CurseWheelCard — How it works" steps={[{title:"Open this section",desc:"Access CurseWheelCard from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<Card className="p-5 bg-gradient-to-br from-[hsl(280,30%,8%)] via-[hsl(0,30%,7%)] to-[hsl(0,0%,4%)] border-red-900/30 mb-6 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-48 h-48 bg-purple-700/10 rounded-full blur-3xl" />
      <div className="relative z-10 flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="text-xl font-black text-red-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Daily Curse Wheel
          </h3>
          <p className="text-xs text-red-200/60">One free spin every 24h. Win credits, badges, multipliers.</p>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center my-6">
        <div className="relative w-48 h-48">
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-red-700/50 bg-gradient-conic from-red-900 via-purple-900 to-black shadow-[0_0_40px_rgba(127,29,29,0.6)]"
            animate={{ rotate: rotation }}
            transition={{ duration: 4, ease: [0.17, 0.67, 0.16, 0.99] }}
            style={{ backgroundImage: "conic-gradient(from 0deg, hsl(0,60%,20%), hsl(280,40%,15%), hsl(0,80%,25%), hsl(280,50%,20%), hsl(0,60%,20%))" }}
          >
            {SEGMENTS.map((s, i) => (
              <div
                key={i}
                className="absolute top-1/2 left-1/2 text-[9px] font-bold text-red-100 origin-left"
                style={{
                  transform: `rotate(${(360 / SEGMENTS.length) * i}deg) translateX(60px)`,
                }}
              >
                {s}
              </div>
            ))}
          </motion.div>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-[16px] border-l-transparent border-r-transparent border-t-yellow-400 z-10" />
        </div>
      </div>

      <div className="relative z-10 flex flex-col gap-2">
        <Button
          onClick={handleSpin}
          disabled={hasSpunToday || spin.isPending}
          className="w-full bg-gradient-to-r from-red-700 to-purple-800 hover:from-red-600 hover:to-purple-700 text-white font-bold"
        >
          {hasSpunToday ? <><Lock className="w-4 h-4 mr-2" /> Already Spun Today</> : spin.isPending ? "Spinning..." : "Spin the Cursed Wheel"}
        </Button>
        {lastSpin && (
          <p className="text-xs text-center text-yellow-200/80">
            Today's prize: <span className="font-bold">{lastSpin.prize_label}</span>
          </p>
        )}
      </div>
    </Card>
  </>
  );
}
