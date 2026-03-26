import { motion } from "framer-motion";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Heart, BookOpen, Stethoscope, PawPrint } from "lucide-react";

const impacts = [
  { icon: Stethoscope, threshold: 5, label: "medical checkups", per: 10, emoji: "🏥" },
  { icon: BookOpen, threshold: 10, label: "textbooks for students", per: 8, emoji: "📚" },
  { icon: PawPrint, threshold: 5, label: "vet visits for rescued animals", per: 15, emoji: "🐾" },
  { icon: Heart, threshold: 5, label: "meals for families in crisis", per: 4, emoji: "🍲" },
];

export const ImpactCalculator = () => {
  const [amount, setAmount] = useState(20);

  return (
    <section className="py-8 px-4">
      <div className="max-w-lg mx-auto">
        <h2 className="text-2xl font-black text-center mb-2">
          <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">🌟 Impact Calculator</span>
        </h2>
        <p className="text-center text-sm text-muted-foreground mb-6">See what your donation can achieve</p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border/50 rounded-2xl p-5 shadow-lg"
        >
          <div className="text-center mb-6">
            <motion.div
              key={amount}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-4xl font-black text-primary mb-2"
            >
              €{amount}
            </motion.div>
            <Slider
              value={[amount]}
              onValueChange={(v) => setAmount(v[0])}
              min={5}
              max={200}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>€5</span>
              <span>€200</span>
            </div>
          </div>

          <p className="text-sm font-semibold mb-3">Your €{amount} can provide:</p>
          <div className="space-y-3">
            {impacts.map((impact, i) => {
              const count = Math.floor(amount / impact.per);
              if (count < 1) return null;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 bg-muted/50 rounded-lg p-3"
                >
                  <span className="text-xl">{impact.emoji}</span>
                  <div className="flex-1">
                    <span className="font-bold text-primary">{count}</span>
                    <span className="text-sm text-muted-foreground ml-1">{impact.label}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
