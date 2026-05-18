import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, TrendingUp, Users } from "lucide-react";
import { usePresenceChannel } from "@/hooks/usePresenceChannel";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface LiveSocialProofProps {
  /** Unique channel key, e.g. `megatalent:${entryId}` or `hub:megatalent` */
  channelKey: string;
  /** Optional rotating messages e.g. ["Anna just voted", "Marek joined"] */
  recentActions?: string[];
  /** Compact pill vs. full card */
  variant?: "pill" | "card";
  className?: string;
  /** Minimum count shown — for FOMO smoothing (default 1) */
  floor?: number;
}

export function LiveSocialProof({
  channelKey,
  recentActions = [],
  variant = "pill",
  className,
  floor = 1,
}: LiveSocialProofProps) {
  const { user } = useAuth();
  const { count } = usePresenceChannel({
    channelKey,
    user: user ? { id: user.id } : null,
  });
  const display = Math.max(floor, count);

  const [actionIdx, setActionIdx] = useState(0);
  useEffect(() => {
    if (recentActions.length < 2) return;
    const t = setInterval(() => setActionIdx((i) => (i + 1) % recentActions.length), 3500);
    return () => clearInterval(t);
  }, [recentActions.length]);

  if (variant === "pill") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-md",
          className
        )}
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <Eye className="h-3.5 w-3.5 text-emerald-500" />
        <span className="text-xs font-semibold">
          {display.toLocaleString()} viewing now
        </span>
      </motion.div>
    );
  }

  return (
    <div className={cn("rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-card/80 backdrop-blur-md p-3 space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="text-sm font-semibold">Live now</span>
        </div>
        <span className="flex items-center gap-1 text-sm font-bold text-emerald-500">
          <Users className="h-4 w-4" /> {display.toLocaleString()}
        </span>
      </div>
      {recentActions.length > 0 && (
        <div className="text-xs text-muted-foreground flex items-center gap-1.5 h-4 overflow-hidden">
          <TrendingUp className="h-3 w-3 shrink-0" />
          <AnimatePresence mode="wait">
            <motion.span
              key={actionIdx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="truncate"
            >
              {recentActions[actionIdx]}
            </motion.span>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default LiveSocialProof;
