import { Card } from "@/components/ui/card";
import { Lightbulb, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const TIPS = [
  { icon: "💰", title: "Stack income streams", body: "Creators with 3+ income sources earn 4× more on average." },
  { icon: "📅", title: "Set weekly goals", body: "Users who set a weekly target earn 32% more than those who don't." },
  { icon: "🎯", title: "Promote your top product", body: "Boost your best-selling item — it usually delivers 60% of revenue." },
  { icon: "🔁", title: "Auto-withdraw", body: "Schedule monthly auto-payouts to keep cash flow predictable." },
  { icon: "🤝", title: "Refer & earn", body: "Invite a creator — get +20 credits when they make their first sale." },
  { icon: "📊", title: "Track tax weekly", body: "Review the tax estimator every Sunday — no year-end surprises." },
];

export const EarningsTipsBanner = () => {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % TIPS.length), 6000);
    return (
    <>
      <FloatingHowItWorks title={"Earnings Tips Banner - How it works"} steps={[{ title: 'Open', desc: 'Access the Earnings Tips Banner section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Earnings Tips Banner.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => clearInterval(t);
  }, []);

  const tip = TIPS[i];

  return (
    <Card className="relative overflow-hidden p-5 bg-gradient-to-r from-amber-500/10 via-card to-purple-500/10 border-amber-500/30">
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl" />
      <div className="relative flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 shadow-lg shadow-amber-500/30 shrink-0">
          <Lightbulb className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-[10px] uppercase tracking-wider font-bold text-amber-500">Pro Tip #{i + 1}</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.4 }}
            >
              <h4 className="font-black text-sm">
                {tip.icon} {tip.title}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">{tip.body}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Card>
  );
};
