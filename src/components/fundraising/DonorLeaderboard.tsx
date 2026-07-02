import { motion } from "framer-motion";
import { Crown, Heart, Users } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const TIERS = [
  { name: "Diamond", min: 500, color: "from-cyan-400 to-blue-500", emoji: "💎" },
  { name: "Gold", min: 200, color: "from-yellow-400 to-amber-500", emoji: "🥇" },
  { name: "Silver", min: 100, color: "from-gray-300 to-gray-400", emoji: "🥈" },
  { name: "Bronze", min: 0, color: "from-orange-400 to-amber-600", emoji: "🥉" },
];

export function DonorLeaderboard() {
  return (
    <>
      <FloatingHowItWorks title={"Donor Leaderboard - How it works"} steps={[{ title: 'Open', desc: 'Access the Donor Leaderboard section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Donor Leaderboard.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <section className="py-12 px-4">
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 shadow-lg"
        >
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Donor Tiers</h2>
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            Every donation earns recognition — climb the tiers!
          </p>

          <div className="space-y-3">
            {TIERS.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/30"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center shadow-sm`}>
                  <span className="text-lg">{tier.emoji}</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-foreground">{tier.name} Donor</div>
                  <div className="text-xs text-muted-foreground">
                    {tier.min > 0 ? `€${tier.min}+ total donations` : "Any contribution"}
                  </div>
                </div>
                <Heart className="w-4 h-4 text-muted-foreground/50" />
              </motion.div>
            ))}
          </div>

          <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/10 text-center">
            <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>Be among the first to join the leaderboard!</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
    </>
  );
}
