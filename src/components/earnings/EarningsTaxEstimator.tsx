import { Card } from "@/components/ui/card";
import { Calculator, Info } from "lucide-react";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface EarningsTaxEstimatorProps {
  totalEarnings: number;
}

/**
 * Indicative tax estimator — for informational purposes only.
 * Uses an adjustable effective rate (EU default 19%).
 */
export const EarningsTaxEstimator = ({ totalEarnings }: EarningsTaxEstimatorProps) => {
  const [rate, setRate] = useState(19);
  const taxOwed = (totalEarnings * rate) / 100;
  const net = totalEarnings - taxOwed;

  return (
    <>
      <FloatingHowItWorks title={"Earnings Tax Estimator - How it works"} steps={[{ title: 'Open', desc: 'Access the Earnings Tax Estimator section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Earnings Tax Estimator.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-6 bg-card/80 backdrop-blur-md border-amber-500/20">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
        <Calculator className="h-5 w-5 text-amber-500" />
        Tax Estimator (Indicative)
      </h3>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Effective tax rate</label>
            <span className="text-sm font-bold text-amber-500">{rate}%</span>
          </div>
          <Slider value={[rate]} onValueChange={(v) => setRate(v[0])} min={0} max={50} step={1} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-muted/50 text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Gross</p>
            <p className="text-lg font-black">€{totalEarnings.toFixed(2)}</p>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-center">
            <p className="text-[10px] uppercase tracking-wider text-rose-400">Tax owed</p>
            <p className="text-lg font-black text-rose-400">€{taxOwed.toFixed(2)}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
            <p className="text-[10px] uppercase tracking-wider text-emerald-400">Net</p>
            <p className="text-lg font-black text-emerald-400">€{net.toFixed(2)}</p>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground flex items-start gap-1.5">
          <Info className="h-3 w-3 mt-0.5 shrink-0" />
          Estimate only. Consult a tax advisor for your jurisdiction (SK 19/25%, AT 27.5%, DE up to 45%).
        </p>
      </div>
    </Card>
    </>
  );
};
