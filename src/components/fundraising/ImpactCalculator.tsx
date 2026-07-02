import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const IMPACT_TIERS = [
  { min: 0, max: 10, items: [{ emoji: "🍞", text: "1 meal for someone in need" }] },
  { min: 11, max: 25, items: [{ emoji: "🍞", text: "5 meals" }, { emoji: "📚", text: "1 textbook" }] },
  { min: 26, max: 50, items: [{ emoji: "🍞", text: "12 meals" }, { emoji: "📚", text: "3 textbooks" }, { emoji: "💊", text: "Basic medical supplies" }] },
  { min: 51, max: 100, items: [{ emoji: "🍞", text: "25 meals" }, { emoji: "🐾", text: "1 month pet shelter care" }, { emoji: "🎓", text: "School supplies for a child" }] },
];

function getImpact(amount: number) {
  return IMPACT_TIERS.find((t) => amount >= t.min && amount <= t.max) || IMPACT_TIERS[IMPACT_TIERS.length - 1];
}

export function ImpactCalculator() {
  const [amount, setAmount] = useState(20);
  const impact = getImpact(amount);

  return (
    <>
      <FloatingHowItWorks title={"Impact Calculator - How it works"} steps={[{ title: 'Open', desc: 'Access the Impact Calculator section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Impact Calculator.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <section className="py-12 px-4">
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 shadow-lg"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Impact Calculator</h2>
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            See what your contribution could achieve
          </p>

          {/* Amount display */}
          <div className="text-center mb-4">
            <motion.span
              key={amount}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-4xl font-black text-primary"
            >
              €{amount}
            </motion.span>
          </div>

          {/* Slider */}
          <Slider
            value={[amount]}
            onValueChange={(v) => setAmount(v[0])}
            min={5}
            max={100}
            step={5}
            className="mb-6"
          />

          {/* Impact items */}
          <div className="space-y-2">
            {impact.items.map((item, i) => (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10"
              >
                <span className="text-xl">{item.emoji}</span>
                <span className="text-sm font-medium text-foreground">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
    </>
  );
}
