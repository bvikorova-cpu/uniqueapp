import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Clock } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

/**
 * 24-hour rolling launch offer timer. Resets every day at midnight UTC.
 * Pure UI / persuasion — does not gate any real discount.
 */
export const UrgencyTimer = () => {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date(now);
      end.setUTCHours(24, 0, 0, 0);
      const diff = Math.max(0, end.getTime() - now.getTime());
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1000);
      setTime({ h, m, s });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const Box = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center min-w-[52px]">
      <div className="px-2 py-1.5 rounded-lg bg-background/70 border border-border/60 text-xl sm:text-2xl font-black tabular-nums">
        {value.toString().padStart(2, "0")}
      </div>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{label}</span>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mb-6 flex flex-col sm:flex-row items-center justify-center gap-4 px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-rose-500/15 border border-amber-500/30"
    >
      <div className="flex items-center gap-2">
        <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <Flame className="h-5 w-5 text-amber-500" />
        </motion.div>
        <div>
          <div className="text-sm font-black">Launch Offer — Save 20% on Yearly</div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" /> Ends in
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Box value={time.h} label="Hours" />
        <span className="text-xl font-black opacity-50">:</span>
        <Box value={time.m} label="Min" />
        <span className="text-xl font-black opacity-50">:</span>
        <Box value={time.s} label="Sec" />
      </div>
    </motion.div>
  );
};
