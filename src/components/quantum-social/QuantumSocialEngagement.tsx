import { motion } from "framer-motion";
import { Flame, Atom, Trophy } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export function QuantumSocialEngagement() {
  const items = [
    {
      icon: Flame,
      label: "Daily Streak",
      value: "0 days",
      sub: "Visit daily to build your streak",
      gradient: "from-cyan-500/20 to-cyan-500/5",
      iconColor: "text-cyan-400",
    },
    {
      icon: Atom,
      label: "Quantum Posts",
      value: "0",
      sub: "Posts existing in superposition",
      gradient: "from-violet-500/20 to-violet-500/5",
      iconColor: "text-violet-400",
    },
    {
      icon: Trophy,
      label: "Achievements",
      value: "0 / 12",
      sub: "Unlock by exploring realities",
      gradient: "from-pink-500/20 to-pink-500/5",
      iconColor: "text-pink-400",
    },
  ];

  return (
    <>
      <FloatingHowItWorks
        title='Quantum Social Engagement'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Quantum Social Engagement panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * i }}
          className={`rounded-xl border border-cyan-500/20 bg-gradient-to-br ${item.gradient} backdrop-blur-sm p-4`}
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
    </>
  );
}
