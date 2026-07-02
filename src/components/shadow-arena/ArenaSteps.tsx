import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const steps = [
  { num: 1, title: "Subscribe", desc: "Unlock full access for €2/month", color: "from-red-700 to-red-900" },
  { num: 2, title: "Write Horror", desc: "Submit stories — AI generates 3 atmospheric illustrations", color: "from-purple-700 to-purple-900" },
  { num: 3, title: "Join & Stream", desc: "Pay €1 entry, go live, viewers send gifts to vote", color: "from-red-700 to-red-900" },
  { num: 4, title: "Win Prizes", desc: "Top 3 split 80% of pool — instant Stripe payouts", color: "from-purple-700 to-purple-900" },
  { num: 5, title: "Build Following", desc: "Gain fans, archive streams, earn from past performances", color: "from-red-700 to-red-900" },
];

export function ArenaSteps() {
  return (
    <><FloatingHowItWorks title="ArenaSteps — How it works" steps={[{title:"Open this section",desc:"Access ArenaSteps from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<div className="relative mb-8">
      <h2 className="text-2xl font-bold text-red-400 mb-6 text-center">How It Works</h2>

      {/* Progress line */}
      <div className="absolute left-1/2 top-16 bottom-4 w-px bg-gradient-to-b from-red-800/60 via-purple-800/60 to-transparent hidden md:block" />

      <div className="grid gap-4 md:gap-6 max-w-2xl mx-auto">
        {steps.map((step, i) => (
          <motion.div
            key={step.num}
            className="relative flex items-start gap-4 p-4 rounded-xl bg-card/30 border border-red-900/20 backdrop-blur-sm hover:border-red-600/40 transition-colors group"
            initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
          >
            <motion.div
              className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold shadow-lg`}
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              {step.num}
            </motion.div>
            <div>
              <h3 className="font-bold text-red-300 group-hover:text-red-200 transition-colors">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </>
  );
}
