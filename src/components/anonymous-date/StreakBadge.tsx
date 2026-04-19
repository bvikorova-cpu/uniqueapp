import { motion } from "framer-motion";
import { Flame } from "lucide-react";

export const StreakBadge = ({ days }: { days: number }) => {
  if (days <= 0) return null;
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-[0_0_18px_rgba(249,115,22,0.45)]"
    >
      <Flame className="h-3.5 w-3.5" />
      <span className="text-xs font-black">{days}d streak</span>
    </motion.div>
  );
};
