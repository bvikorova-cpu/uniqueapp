import { motion } from "framer-motion";
import { Trophy, Medal, Award, Star } from "lucide-react";

const tiers = [
  { name: "Diamond", min: 1000, color: "from-cyan-400 to-blue-500", icon: "💎" },
  { name: "Gold", min: 500, color: "from-yellow-400 to-amber-500", icon: "🥇" },
  { name: "Silver", min: 200, color: "from-gray-300 to-gray-400", icon: "🥈" },
  { name: "Bronze", min: 50, color: "from-orange-400 to-orange-600", icon: "🥉" },
];

const topDonors = [
  { name: "Alexander V.", total: 2450, campaigns: 12, tier: "Diamond" },
  { name: "Maria S.", total: 1820, campaigns: 8, tier: "Diamond" },
  { name: "Thomas K.", total: 980, campaigns: 15, tier: "Gold" },
  { name: "Elena R.", total: 640, campaigns: 6, tier: "Gold" },
  { name: "Jan M.", total: 420, campaigns: 9, tier: "Silver" },
  { name: "Sophie W.", total: 350, campaigns: 4, tier: "Silver" },
  { name: "David L.", total: 180, campaigns: 7, tier: "Bronze" },
  { name: "Anna P.", total: 95, campaigns: 3, tier: "Bronze" },
];

const getTierData = (tierName: string) => tiers.find((t) => t.name === tierName) || tiers[3];

export const DonorLeaderboard = () => {
  return (
    <section className="py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-black text-center mb-2">
          <span className="bg-gradient-to-r from-yellow-500 to-accent bg-clip-text text-transparent">🏆 Top Donors This Month</span>
        </h2>
        <p className="text-center text-sm text-muted-foreground mb-4">Generosity leaderboard</p>

        {/* Tier legend */}
        <div className="flex justify-center gap-3 mb-6 flex-wrap">
          {tiers.map((tier) => (
            <span key={tier.name} className="text-xs flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-full">
              {tier.icon} {tier.name} (€{tier.min}+)
            </span>
          ))}
        </div>

        <div className="space-y-2">
          {topDonors.map((donor, i) => {
            const tierData = getTierData(donor.tier);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-3 bg-card border rounded-xl p-3 ${
                  i < 3 ? "border-primary/30 shadow-sm" : "border-border/50"
                }`}
              >
                {/* Rank */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${
                  i === 0 ? "bg-yellow-500 text-white" :
                  i === 1 ? "bg-gray-400 text-white" :
                  i === 2 ? "bg-orange-500 text-white" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {i + 1}
                </div>

                {/* Avatar */}
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${tierData.color} flex items-center justify-center text-white font-bold text-sm`}>
                  {donor.name.charAt(0)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm truncate">{donor.name}</span>
                    <span className="text-xs">{tierData.icon}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{donor.campaigns} campaigns supported</span>
                </div>

                {/* Total */}
                <div className="text-right">
                  <div className="font-black text-sm text-primary">€{donor.total.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{donor.tier}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
