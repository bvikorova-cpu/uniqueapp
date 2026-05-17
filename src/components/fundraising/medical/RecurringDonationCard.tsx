import { motion } from "framer-motion";
import { Calendar, Heart, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface Props {
  isMonthly: boolean;
  onChange: (v: boolean) => void;
  amount: number;
}

/**
 * Visual upgrade for the existing monthly-donation toggle.
 * Shows the impact of recurring giving with a "12× impact" framing —
 * mirrors GoFundMe / JustGiving / Donorbox recurring patterns.
 */
export function RecurringDonationCard({ isMonthly, onChange, amount }: Props) {
  const yearly = amount * 12;
  return (
    <motion.label
      htmlFor="recurring-toggle"
      animate={{
        scale: isMonthly ? 1.01 : 1,
      }}
      className={`block cursor-pointer rounded-xl border-2 p-4 transition-all ${
        isMonthly
          ? "border-primary bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 shadow-lg shadow-primary/10"
          : "border-border bg-card hover:border-primary/40"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
            isMonthly
              ? "bg-gradient-to-br from-primary to-accent text-white"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {isMonthly ? <Sparkles className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-bold text-sm">
              Make it monthly
              {isMonthly && (
                <span className="ml-2 text-[10px] uppercase tracking-wider bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-black">
                  12× impact
                </span>
              )}
            </span>
            <Switch id="recurring-toggle" checked={isMonthly} onCheckedChange={onChange} />
          </div>
          <p className="text-xs text-muted-foreground leading-snug">
            {isMonthly && amount > 0 ? (
              <>
                <Heart className="inline w-3 h-3 text-rose-500 mr-0.5" />
                <strong className="text-foreground">€{amount}</strong> every month ={" "}
                <strong className="text-primary">€{yearly}</strong> per year of ongoing support. Cancel anytime.
              </>
            ) : (
              "Recurring donors provide steady support through long treatments — many patients can't fight one-off battles."
            )}
          </p>
        </div>
      </div>
    </motion.label>
  );
}
