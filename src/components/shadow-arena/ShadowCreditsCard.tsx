import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Zap } from "lucide-react";
import { useShadowArenaCredits } from "@/hooks/useShadowArenaAI";
import { motion } from "framer-motion";

const PACKAGES = [
  { id: "starter" as const, credits: 30, price: "€4.99", label: "Starter" },
  { id: "creator" as const, credits: 100, price: "€12.99", label: "Creator", popular: true },
  { id: "pro" as const, credits: 280, price: "€29.99", label: "Pro" },
];

export function ShadowCreditsCard() {
  const { credits, buyCredits, isLoading } = useShadowArenaCredits();
  const balance = credits?.credits_balance ?? 0;

  return (
    <Card className="p-5 bg-gradient-to-br from-[hsl(0,30%,8%)] via-[hsl(280,25%,7%)] to-[hsl(0,0%,4%)] border-red-900/30 mb-6 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-48 h-48 bg-red-700/10 rounded-full blur-3xl" />

      <div className="relative z-10 flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-700 to-purple-900 flex items-center justify-center shadow-[0_0_25px_rgba(127,29,29,0.5)]"
          >
            <Zap className="w-6 h-6 text-yellow-200" />
          </motion.div>
          <div>
            <p className="text-xs text-red-200/60">Shadow AI Credits</p>
            <p className="text-3xl font-black text-red-100">
              {isLoading ? "—" : balance}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-red-200/60">Cost per use</p>
          <div className="flex gap-1.5 text-[11px] text-red-100/80 mt-1">
            <span className="px-2 py-0.5 rounded bg-red-950/40 border border-red-900/40">Story 4</span>
            <span className="px-2 py-0.5 rounded bg-red-950/40 border border-red-900/40">Voice 6</span>
            <span className="px-2 py-0.5 rounded bg-red-950/40 border border-red-900/40">Predict 5</span>
            <span className="px-2 py-0.5 rounded bg-red-950/40 border border-red-900/40">Avatar 8</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-3 gap-2">
        {PACKAGES.map((pkg) => (
          <Button
            key={pkg.id}
            variant="outline"
            disabled={buyCredits.isPending}
            onClick={() => buyCredits.mutate(pkg.id)}
            className={`relative h-auto flex-col py-3 border-red-900/30 hover:border-red-700/50 hover:bg-red-950/30 transition-all ${
              pkg.popular ? "ring-1 ring-red-700/50 bg-red-950/20" : ""
            }`}
          >
            {pkg.popular && (
              <span className="absolute -top-2 right-2 text-[9px] px-1.5 py-0.5 rounded-full bg-red-700 text-white font-bold">
                POPULAR
              </span>
            )}
            <Coins className="w-4 h-4 text-yellow-400 mb-1" />
            <span className="font-bold text-red-100 text-sm">{pkg.credits} cr</span>
            <span className="text-[11px] text-red-200/60">{pkg.price}</span>
            <span className="text-[10px] text-muted-foreground mt-0.5">{pkg.label}</span>
          </Button>
        ))}
      </div>
    </Card>
  );
}
