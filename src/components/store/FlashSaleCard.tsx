import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
interface FlashSaleCardProps {
  name: string;
  description: string;
  emoji: string;
  originalPrice: number;
  discountPercent: number;
  onBuy: () => void;
  disabled?: boolean;
}

/** Daily Flash Sale — 24h rolling countdown + heavy discount. */
export const FlashSaleCard = ({
  name,
  description,
  emoji,
  originalPrice,
  discountPercent,
  onBuy,
  disabled,
}: FlashSaleCardProps) => {
  const [remaining, setRemaining] = useState({ h: 0, m: 0, s: 0 });
  const salePrice = Math.round(originalPrice * (1 - discountPercent / 100));

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setHours(24, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();
      setRemaining({
        h: Math.floor(diff / 3.6e6),
        m: Math.floor((diff % 3.6e6) / 6e4),
        s: Math.floor((diff % 6e4) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
<motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-2xl border-2 border-orange-500/50 bg-gradient-to-br from-orange-500/15 via-red-500/10 to-amber-500/15 backdrop-blur-xl p-5"
    >
      <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-orange-500/30 blur-3xl pointer-events-none" />
      <div className="absolute top-3 right-3">
        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg animate-pulse">
          <Flame className="h-3 w-3 mr-1" /> -{discountPercent}% TODAY
        </Badge>
      </div>

      <div className="relative">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-5xl">{emoji}</span>
          <div>
            <h3 className="text-xl font-black">{name}</h3>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="flex items-end gap-3 mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Today only</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                {salePrice}
              </span>
              <span className="text-sm line-through text-muted-foreground">{originalPrice}</span>
              <Sparkles className="h-4 w-4 text-amber-400" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 mb-4 px-3 py-2 rounded-lg bg-background/60 border border-orange-500/30">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-400">
            <Clock className="h-3.5 w-3.5" /> Ends in
          </div>
          <div className="flex items-center gap-1 font-mono font-black tabular-nums">
            <span className="px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300">{String(remaining.h).padStart(2, "0")}</span>:
            <span className="px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300">{String(remaining.m).padStart(2, "0")}</span>:
            <span className="px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300">{String(remaining.s).padStart(2, "0")}</span>
          </div>
        </div>

        <Button
          onClick={onBuy}
          disabled={disabled}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-500/90 hover:to-red-500/90 text-white font-bold shadow-lg"
        >
          <Flame className="mr-2 h-4 w-4" /> Grab the deal
        </Button>
      </div>
    </motion.div>
    </>
    );
};
