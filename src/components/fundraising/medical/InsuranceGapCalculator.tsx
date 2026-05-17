import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calculator, ShieldCheck, AlertCircle } from "lucide-react";

interface Props {
  treatmentTotalCost?: number | null;
  insuranceCoverage?: number | null;
  targetAmount: number;
  currentAmount: number;
}

/**
 * Visual breakdown: Treatment total cost = Insurance coverage + Funding gap.
 * Shows donors exactly why this campaign exists and where their money goes.
 */
export function InsuranceGapCalculator({
  treatmentTotalCost,
  insuranceCoverage,
  targetAmount,
  currentAmount,
}: Props) {
  // If no treatment cost is set, fall back to: target = gap, insurance = 0
  const total = treatmentTotalCost ?? targetAmount;
  const insurance = insuranceCoverage ?? 0;
  const gap = Math.max(total - insurance, targetAmount);
  const raised = currentAmount;
  const stillNeeded = Math.max(gap - raised, 0);

  const insurancePct = total > 0 ? (insurance / total) * 100 : 0;
  const raisedPct = total > 0 ? (raised / total) * 100 : 0;
  const gapPct = 100 - insurancePct - raisedPct;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="p-5 bg-gradient-to-br from-rose-500/5 via-background to-primary/5 border-rose-500/20">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-primary flex items-center justify-center">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base leading-tight">Treatment Cost Breakdown</h3>
            <p className="text-xs text-muted-foreground">How your donation closes the gap</p>
          </div>
        </div>

        {/* Stacked bar */}
        <div className="space-y-3 mb-4">
          <div className="relative h-3 rounded-full overflow-hidden bg-muted/40">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-emerald-400"
              style={{ width: `${insurancePct}%` }}
              title={`Insurance covers €${insurance.toFixed(0)}`}
            />
            <div
              className="absolute inset-y-0 bg-gradient-to-r from-primary to-accent"
              style={{ left: `${insurancePct}%`, width: `${raisedPct}%` }}
              title={`Raised so far €${raised.toFixed(0)}`}
            />
            <div
              className="absolute inset-y-0 bg-rose-500/30 border-l border-rose-500/60"
              style={{ left: `${insurancePct + raisedPct}%`, width: `${Math.max(gapPct, 0)}%` }}
              title={`Still needed €${stillNeeded.toFixed(0)}`}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
            <span>€0</span>
            <span>Total treatment cost: <strong className="text-foreground">€{total.toLocaleString()}</strong></span>
          </div>
        </div>

        {/* Legend rows */}
        <div className="grid grid-cols-1 gap-2 text-sm">
          <Row
            color="emerald"
            icon={<ShieldCheck className="w-4 h-4" />}
            label="Insurance coverage"
            value={insurance}
            hint={insurance === 0 ? "Not covered" : `${insurancePct.toFixed(0)}% of total`}
          />
          <Row
            color="primary"
            label="Raised so far"
            value={raised}
            hint={`${raisedPct.toFixed(0)}% of total`}
          />
          <Row
            color="rose"
            icon={<AlertCircle className="w-4 h-4" />}
            label="Still needed"
            value={stillNeeded}
            hint={stillNeeded === 0 ? "🎉 Fully funded!" : `Help close the gap`}
            bold
          />
        </div>
      </Card>
    </motion.div>
  );
}

function Row({
  color,
  icon,
  label,
  value,
  hint,
  bold,
}: {
  color: "emerald" | "primary" | "rose";
  icon?: React.ReactNode;
  label: string;
  value: number;
  hint: string;
  bold?: boolean;
}) {
  const dotClass = {
    emerald: "bg-emerald-500",
    primary: "bg-primary",
    rose: "bg-rose-500",
  }[color];
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 px-2 rounded-lg hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className={`w-2.5 h-2.5 rounded-full ${dotClass} shrink-0`} />
        {icon}
        <span className={`truncate ${bold ? "font-bold" : "font-medium"}`}>{label}</span>
      </div>
      <div className="text-right shrink-0">
        <div className={`font-bold ${bold ? "text-rose-600 dark:text-rose-400" : ""}`}>
          €{value.toLocaleString()}
        </div>
        <div className="text-[10px] text-muted-foreground">{hint}</div>
      </div>
    </div>
  );
}
