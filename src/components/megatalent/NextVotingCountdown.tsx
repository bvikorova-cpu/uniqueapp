import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Clock, Flame } from "lucide-react";

/**
 * Countdown to the next MegaTalent voting round / €10,000 prize draw.
 * Round ends at the last day of the current calendar month at 23:59:59 local time.
 */
function getTimeLeft() {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const diff = Math.max(0, end.getTime() - now.getTime());
  return {
    end,
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
  };
}

export default function NextVotingCountdown() {
  const [t, setT] = useState(getTimeLeft());

  useEffect(() => {
    const id = setInterval(() => setT(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const Box = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center min-w-[56px]">
      <div className="px-2 py-1.5 rounded-lg bg-black/40 border border-yellow-500/30 text-xl sm:text-2xl font-black tabular-nums text-yellow-300">
        {value.toString().padStart(2, "0")}
      </div>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{label}</span>
    </div>
  );

  const drawDate = t.end.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 py-4 rounded-2xl bg-gradient-to-r from-yellow-500/15 via-amber-500/10 to-orange-500/15 border border-yellow-500/30"
    >
      <div className="flex items-center gap-3 text-center sm:text-left">
        <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <Trophy className="h-6 w-6 text-yellow-400" />
        </motion.div>
        <div>
          <div className="text-sm sm:text-base font-black flex items-center gap-1.5 justify-center sm:justify-start">
            <Flame className="h-4 w-4 text-orange-400" />
            Next voting round & €10,000 prize draw
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1 justify-center sm:justify-start mt-0.5">
            <Clock className="h-3 w-3" /> Ends {drawDate}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Box value={t.days} label="Days" />
        <span className="text-xl font-black opacity-50">:</span>
        <Box value={t.hours} label="Hrs" />
        <span className="text-xl font-black opacity-50">:</span>
        <Box value={t.minutes} label="Min" />
        <span className="text-xl font-black opacity-50">:</span>
        <Box value={t.seconds} label="Sec" />
      </div>
    </motion.div>
  );
}
