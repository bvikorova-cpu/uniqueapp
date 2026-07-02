import { motion } from "framer-motion";
import { Trophy, DollarSign } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface ArenaPrizePoolProps {
  totalPool: number;
}

const segments = [
  { label: "1st Place", pct: 40, color: "bg-yellow-500" },
  { label: "2nd Place", pct: 24, color: "bg-purple-500" },
  { label: "3rd Place", pct: 16, color: "bg-red-500" },
  { label: "Platform", pct: 20, color: "bg-muted" },
];

export function ArenaPrizePool({ totalPool }: ArenaPrizePoolProps) {
  return (
    <><FloatingHowItWorks title="ArenaPrizePool — How it works" steps={[{title:"Open this section",desc:"Access ArenaPrizePool from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<div className="mb-8 rounded-2xl border border-yellow-900/30 bg-gradient-to-br from-yellow-950/20 via-card/30 to-red-950/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Prize Pool
        </h2>
        <motion.div
          className="flex items-center gap-1 text-2xl font-black text-yellow-400"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <DollarSign className="w-5 h-5" />
          €{totalPool.toFixed(2)}
        </motion.div>
      </div>

      {/* Animated bar */}
      <div className="h-4 rounded-full overflow-hidden flex bg-muted/20 mb-4">
        {segments.map((seg, i) => (
          <motion.div
            key={seg.label}
            className={`${seg.color} h-full`}
            initial={{ width: 0 }}
            animate={{ width: `${seg.pct}%` }}
            transition={{ duration: 0.8, delay: 0.15 * i, ease: "easeOut" }}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2 text-sm">
            <div className={`w-3 h-3 rounded-full ${seg.color}`} />
            <span className="text-muted-foreground">{seg.label}</span>
            <span className="font-bold text-foreground ml-auto">{seg.pct}%</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-4 text-center">
        Payouts processed via Stripe within 48 hours of battle completion
      </p>
    </div>
  </>
  );
}
