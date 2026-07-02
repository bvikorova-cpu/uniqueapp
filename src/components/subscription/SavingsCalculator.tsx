import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, TrendingUp } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const SavingsCalculator = () => {
  const [monthlySales, setMonthlySales] = useState([1000]);
  const sales = monthlySales[0];
  const basicCommission = sales * 0.03; // 3% Basic fee
  const premiumSavings = basicCommission * 12; // yearly saved on Premium (0%)
  const aiValue = 30 * 0.5; // 30 extra generations × €0.50 perceived value
  const totalSaved = premiumSavings + aiValue * 12;

  return (
    <>
      <FloatingHowItWorks title={"Savings Calculator - How it works"} steps={[{ title: 'Open', desc: 'Access the Savings Calculator section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Savings Calculator.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mt-20 max-w-4xl mx-auto"
    >
      <div className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-purple-500/5 to-amber-400/5 p-8 sm:p-12 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-primary/20">
            <Calculator className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-black">How much will you save?</h3>
            <p className="text-sm text-muted-foreground">Move the slider to estimate your annual savings on Premium.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-baseline justify-between mb-3">
              <label className="text-sm font-semibold">Monthly sales (€)</label>
              <span className="text-3xl font-black bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                €{sales.toLocaleString()}
              </span>
            </div>
            <Slider
              value={monthlySales}
              onValueChange={setMonthlySales}
              min={100}
              max={20000}
              step={100}
              className="my-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>€100</span>
              <span>€20,000</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border/50">
            <div className="text-center p-4 rounded-2xl bg-background/40">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Basic fees</div>
              <div className="text-2xl font-black text-red-400">−€{Math.round(basicCommission * 12).toLocaleString()}/yr</div>
            </div>
            <div className="text-center p-4 rounded-2xl bg-background/40">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Premium cost</div>
              <div className="text-2xl font-black">€180/yr</div>
            </div>
            <div className="text-center p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="text-xs uppercase tracking-wider text-emerald-400 mb-1 flex items-center justify-center gap-1">
                <TrendingUp className="h-3 w-3" /> You save
              </div>
              <div className="text-2xl font-black text-emerald-400">
                €{Math.max(0, Math.round(totalSaved - 180)).toLocaleString()}/yr
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
    </>
  );
};
