import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface AICreditsFlashSaleProps {
  onClaim: () => void;
}

/**
 * 24-hour rolling flash-sale countdown for a discounted credit bundle.
 * 100 credits for €25 instead of €40 (-37%).
 */
export const AICreditsFlashSale = ({ onClaim }: AICreditsFlashSaleProps) => {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date();
      end.setHours(24, 0, 0, 0);
      const diff = Math.max(0, end.getTime() - now.getTime());
      setTime({
        h: Math.floor(diff / 3_600_000),
        m: Math.floor((diff % 3_600_000) / 60_000),
        s: Math.floor((diff % 60_000) / 1000),
      });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border-2 border-orange-400/50 bg-gradient-to-br from-orange-500/15 via-red-500/10 to-purple-500/10 p-5 sm:p-6 mb-6 shadow-xl"
    >
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-400/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-red-500/20 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/40">
            <Flame className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-500 text-white shadow">
                FLASH SALE
              </span>
              <span className="text-[10px] font-bold text-orange-300">−37% TODAY</span>
            </div>
            <p className="text-lg sm:text-xl font-black text-foreground">
              100 credits for <span className="text-orange-400">€25</span>{" "}
              <span className="text-sm text-muted-foreground line-through font-medium">€40</span>
            </p>
            <p className="text-xs text-muted-foreground">Top-up bundle — best value, today only</p>
          </div>
        </div>

        <div className="flex flex-col items-stretch sm:items-end gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 font-mono text-foreground self-start sm:self-auto">
            {[
              { v: time.h, l: "h" },
              { v: time.m, l: "m" },
              { v: time.s, l: "s" },
            ].map((u, i) => (
              <div key={u.l} className="flex items-center gap-1.5">
                <div className="px-2.5 py-1.5 rounded-lg bg-background/80 border border-orange-400/40 text-base sm:text-lg font-black tabular-nums shadow-inner">
                  {pad(u.v)}
                </div>
                {i < 2 && <span className="text-orange-400 font-black">:</span>}
              </div>
            ))}
          </div>
          <Button
            onClick={onClaim}
            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-500/90 hover:to-red-600/90 text-white font-bold shadow-lg shadow-orange-500/40"
            size="sm"
          >
            <Zap className="mr-1.5 h-4 w-4" /> Grab the deal
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
