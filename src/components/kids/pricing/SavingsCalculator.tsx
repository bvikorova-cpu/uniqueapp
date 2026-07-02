import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, TrendingDown } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const modules = [
  { name: "Story Creator", monthlyPrice: 12 },
  { name: "Homework Helper", monthlyPrice: 16 },
  { name: "Drawing Buddy", monthlyPrice: 10 },
  { name: "Science Lab", monthlyPrice: 14 },
  { name: "Reading Companion", monthlyPrice: 12 },
  { name: "Character Chat", monthlyPrice: 10 },
  { name: "Bedtime Stories", monthlyPrice: 10 },
  { name: "Coloring Pages", monthlyPrice: 8 },
];

const GOLD_PASS_PRICE = 79;

export function SavingsCalculator() {
  const [selectedCount, setSelectedCount] = useState([5]);

  const count = selectedCount[0];
  const totalIndividual = modules.slice(0, count).reduce((sum, m) => sum + m.monthlyPrice, 0);
  const savings = totalIndividual - GOLD_PASS_PRICE;
  const savingsPercent = totalIndividual > 0 ? Math.round((savings / totalIndividual) * 100) : 0;

  return (
    <>
      <FloatingHowItWorks title={"Savings Calculator - How it works"} steps={[{ title: 'Open', desc: 'Access the Savings Calculator section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Savings Calculator.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="w-full max-w-xl mx-auto rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-8 shadow-lg"
    >
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="h-6 w-6 text-primary" />
        <h3 className="text-2xl font-bold">Savings Calculator</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        How many modules would your kids use? Slide to see your savings:
      </p>

      <Slider
        value={selectedCount}
        onValueChange={setSelectedCount}
        min={1}
        max={8}
        step={1}
        className="mb-6"
      />

      <div className="text-center mb-4">
        <span className="text-sm text-muted-foreground">{count} of {modules.length} modules selected</span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl bg-muted/50 p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Individual Pricing</p>
          <p className="text-2xl font-bold text-destructive line-through">€{totalIndividual}/mo</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 p-4 text-center">
          <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">Gold Pass</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">€{GOLD_PASS_PRICE}/mo</p>
        </div>
      </div>

      {savings > 0 && (
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="flex items-center justify-center gap-2 bg-green-500/10 border border-green-500/30 rounded-xl p-3"
        >
          <TrendingDown className="h-5 w-5 text-green-500" />
          <span className="font-bold text-green-600 dark:text-green-400">
            You save €{savings}/mo ({savingsPercent}% off!)
          </span>
        </motion.div>
      )}
    </motion.div>
    </>
  );
}
