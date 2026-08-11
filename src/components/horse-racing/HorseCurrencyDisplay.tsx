import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus } from "lucide-react";
import { useHorseCurrency, HORSE_CREDIT_COSTS } from "@/hooks/useHorseRacing";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

/**
 * Credit balance panel for the Horse Racing arena.
 * The whole arena runs on the unified AI credits pool — no coins, no gems.
 */
export const HorseCurrencyDisplay = () => {
  const { currency, isLoading } = useHorseCurrency();

  return (
    <>
      <FloatingHowItWorks
        title={"Horse Racing Credits - How it works"}
        steps={[
          { title: "One currency", desc: "Everything in the arena is paid with AI credits — no coins, no gems." },
          { title: "Spend", desc: `Buy a horse for ${HORSE_CREDIT_COSTS.buyHorse} credits, train for ${HORSE_CREDIT_COSTS.training}, breed for ${HORSE_CREDIT_COSTS.breeding}.` },
          { title: "Race", desc: `Race entry costs ${HORSE_CREDIT_COSTS.raceEntry} credit, championship entry ${HORSE_CREDIT_COSTS.championship}.` },
          { title: "Top up", desc: "Out of credits? Open the AI Credits page and top up instantly." },
        ]}
      />
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card className="relative overflow-hidden bg-white border-emerald-500/20 backdrop-blur-sm p-4 sm:p-6">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Sparkles className="h-7 w-7 text-amber-700" />
                <div className="absolute -inset-2 bg-amber-400/10 rounded-full blur-md" />
              </div>
              <div>
                <p className="text-[10px] font-mono text-emerald-400/40 uppercase tracking-wider">AI Credits</p>
                <p className="text-2xl font-bold font-mono text-slate-900">
                  {isLoading ? "…" : (currency?.credits ?? 0)}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button asChild className="bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 text-white border border-emerald-400/30 shadow-lg shadow-emerald-500/20 font-mono uppercase tracking-wider text-xs">
                <Link to="/ai-credits">
                  <Plus className="mr-2 h-4 w-4" /> Top up credits
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-500/10 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: "Buy horse", value: HORSE_CREDIT_COSTS.buyHorse },
              { label: "Training", value: HORSE_CREDIT_COSTS.training },
              { label: "Breeding", value: HORSE_CREDIT_COSTS.breeding },
              { label: "Race entry", value: HORSE_CREDIT_COSTS.raceEntry },
            ].map((c) => (
              <div key={c.label} className="rounded-lg bg-amber-50/70 border border-emerald-500/10 p-2">
                <p className="text-[10px] font-mono text-emerald-400/40 uppercase">{c.label}</p>
                <p className="text-sm font-mono font-bold text-slate-900">{c.value} cr</p>
              </div>
            ))}
          </div>

          <p className="mt-3 text-[10px] text-emerald-400/40 font-mono">
            All arena actions are paid with AI credits. Credits cannot be exchanged for real money.
          </p>
        </Card>
      </motion.div>
    </>
  );
};
