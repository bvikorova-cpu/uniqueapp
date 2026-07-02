import { Card } from "@/components/ui/card";
import { Trophy, Award, Medal, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface EarningsMilestonesProps {
  totalEarnings: number;
}

const MILESTONES = [
  { amount: 100, label: "First €100", icon: Medal, color: "from-zinc-400 to-zinc-600" },
  { amount: 500, label: "€500 Club", icon: Award, color: "from-amber-700 to-amber-900" },
  { amount: 1000, label: "€1K Earner", icon: Trophy, color: "from-amber-400 to-yellow-500" },
  { amount: 5000, label: "€5K Pro", icon: Trophy, color: "from-yellow-300 to-amber-500" },
  { amount: 10000, label: "€10K Elite", icon: Crown, color: "from-purple-400 to-pink-500" },
  { amount: 50000, label: "€50K Legend", icon: Crown, color: "from-fuchsia-400 to-rose-500" },
];

export const EarningsMilestones = ({ totalEarnings }: EarningsMilestonesProps) => {
  const next = MILESTONES.find((m) => m.amount > totalEarnings);
  const last = [...MILESTONES].reverse().find((m) => m.amount <= totalEarnings);
  const progress = next ? Math.min(100, ((totalEarnings - (last?.amount ?? 0)) / (next.amount - (last?.amount ?? 0))) * 100) : 100;

  return (
    <>
      <FloatingHowItWorks title={"Earnings Milestones - How it works"} steps={[{ title: 'Open', desc: 'Access the Earnings Milestones section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Earnings Milestones.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-6 bg-card/80 backdrop-blur-md border-amber-500/20">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-amber-500" />
        Earnings Milestones
      </h3>

      {next && (
        <div className="mb-5 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Next: {next.label}</span>
            <span className="text-sm font-bold text-amber-500">
              €{totalEarnings.toFixed(0)} / €{next.amount}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            €{(next.amount - totalEarnings).toFixed(2)} to unlock
          </p>
        </div>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {MILESTONES.map((m, i) => {
          const unlocked = totalEarnings >= m.amount;
          return (
            <motion.div
              key={m.amount}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`relative flex flex-col items-center p-3 rounded-xl border ${
                unlocked
                  ? "border-amber-500/40 bg-gradient-to-br from-amber-500/15 to-yellow-500/5"
                  : "border-border bg-muted/30 opacity-50"
              }`}
            >
              <div className={`p-2 rounded-full bg-gradient-to-br ${m.color} ${!unlocked && "grayscale"}`}>
                <m.icon className="h-4 w-4 text-white" />
              </div>
              <p className="text-[10px] mt-1.5 font-bold text-center">€{m.amount >= 1000 ? `${m.amount / 1000}K` : m.amount}</p>
              {unlocked && <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background" />}
            </motion.div>
          );
        })}
      </div>
    </Card>
    </>
  );
};
