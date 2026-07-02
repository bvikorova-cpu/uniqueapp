import { motion } from "framer-motion";
import { Flame, Wallet, Trophy } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export function EmotionEconomyEngagement() {
  const items = [
    {
      icon: Flame,
      label: "Daily Streak",
      value: "0 days",
      sub: "Start trading to build your streak",
      gradient: "from-pink-500/20 to-pink-500/5",
      iconColor: "text-pink-400",
    },
    {
      icon: Wallet,
      label: "Portfolio Value",
      value: "€0.00",
      sub: "Total emotional asset value",
      gradient: "from-violet-500/20 to-violet-500/5",
      iconColor: "text-violet-400",
    },
    {
      icon: Trophy,
      label: "Achievements",
      value: "0 / 12",
      sub: "Unlock by trading & mining",
      gradient: "from-cyan-500/20 to-cyan-500/5",
      iconColor: "text-cyan-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <FloatingHowItWorks
        title={"Emotion Economy Engagement"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * i }}
          className={`rounded-xl border border-white/10 bg-gradient-to-br ${item.gradient} backdrop-blur-sm p-4`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-background/50 ${item.iconColor}`}>
              <item.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-lg font-bold">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.sub}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
