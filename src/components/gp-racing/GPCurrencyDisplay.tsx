import { Button } from "@/components/ui/button";
import { Sparkles, ShoppingCart, Zap } from "lucide-react";
import { useGPCredits, GP_CREDIT_COSTS } from "@/hooks/useGPRacing";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

/**
 * GP Racing Arena credit HUD — the whole arena runs on the unified AI credit pool.
 */
export function GPCurrencyDisplay() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { credits, isLoading } = useGPCredits();

  if (isLoading && user) {
    return <div className="h-16 bg-cyan-950/20 animate-pulse rounded-xl border border-cyan-500/20" />;
  }

  const balance = user ? (credits?.credits_remaining ?? 0) : 0;

  return (
    <>
      <FloatingHowItWorks
        title="GP Racing Credits - How it works"
        steps={[
          { title: "One currency", desc: "The whole arena runs on AI credits — no coins, no gems, no subscription." },
          { title: "Costs", desc: `Buy car ${GP_CREDIT_COSTS.buyCar} • Join race ${GP_CREDIT_COSTS.joinRace} • Upgrade ${GP_CREDIT_COSTS.upgrade} • Livery ${GP_CREDIT_COSTS.livery} • Shop part ${GP_CREDIT_COSTS.shopPurchase}` },
          { title: "Top up", desc: "Tap Top up credits to buy a credit pack in EUR." },
          { title: "Track spending", desc: "Every spend is recorded in your credit history." },
        ]}
      />
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl border border-cyan-500/30 bg-gradient-to-r from-slate-900/90 via-cyan-950/40 to-slate-900/90 backdrop-blur-sm"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-pulse" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
        </div>

        <div className="relative flex flex-wrap items-center gap-3 sm:gap-6 p-3 sm:p-4">
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-cyan-400/60 font-mono">
            <Zap className="h-3 w-3" />
            <span>Balance</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <div className="relative">
              <Sparkles className="h-5 w-5 text-cyan-300" />
              <div className="absolute -inset-1 bg-cyan-400/20 rounded-full blur-sm" />
            </div>
            <span className="font-mono font-bold text-lg text-cyan-200">{balance.toLocaleString()}</span>
            <span className="text-cyan-400/60 text-xs uppercase tracking-wider">AI Credits</span>
          </div>

          <div className="hidden md:flex items-center gap-3 text-[10px] font-mono text-cyan-400/50 uppercase tracking-wider">
            <span>Car {GP_CREDIT_COSTS.buyCar}</span>
            <span>Race {GP_CREDIT_COSTS.joinRace}</span>
            <span>Upgrade {GP_CREDIT_COSTS.upgrade}</span>
            <span>Livery {GP_CREDIT_COSTS.livery}</span>
          </div>

          <Button
            size="sm"
            className="ml-auto bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border border-cyan-400/30 shadow-lg shadow-cyan-500/20 font-mono uppercase tracking-wider text-xs"
            onClick={() => navigate(user ? "/ai-credits-store" : "/auth")}
          >
            <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
            Top up credits
          </Button>
        </div>
      </motion.div>
    </>
  );
}
