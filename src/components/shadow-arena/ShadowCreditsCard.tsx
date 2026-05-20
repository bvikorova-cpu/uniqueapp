import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Zap } from "lucide-react";
import { useShadowArenaCredits } from "@/hooks/useShadowArenaAI";
import { motion } from "framer-motion";


const PACKAGES = [
  { credits: 30 as const, price: "€4.99", labelKey: "shadow.credits.pack_starter" },
  { credits: 100 as const, price: "€12.99", labelKey: "shadow.credits.pack_creator", popular: true },
  { credits: 280 as const, price: "€29.99", labelKey: "shadow.credits.pack_pro" },
];

export function ShadowCreditsCard() {
  const { credits, buyCredits, isLoading } = useShadowArenaCredits();
  const balance = credits?.credits_remaining ?? 0;

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
            <Zap className="w-6 h-6 text-yellow-100" />
          </motion.div>
          <div>
            <p className="text-sm text-red-200 font-semibold">{"Shadow AI Credits"}</p>
            <p className="text-3xl font-black text-white drop-shadow-[0_0_10px_rgba(248,113,113,0.5)]">
              {isLoading ? "—" : balance}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-red-200 font-semibold mb-1">{"Cost per use"}</p>
          <div className="flex flex-wrap gap-1.5 text-[11px] text-red-50 justify-end">
            <span className="px-2 py-0.5 rounded bg-red-950/70 border border-red-700/50 font-medium">{"Story 4"}</span>
            <span className="px-2 py-0.5 rounded bg-red-950/70 border border-red-700/50 font-medium">{"Voice 6"}</span>
            <span className="px-2 py-0.5 rounded bg-red-950/70 border border-red-700/50 font-medium">{"Predict 5"}</span>
            <span className="px-2 py-0.5 rounded bg-red-950/70 border border-red-700/50 font-medium">{"Avatar 8"}</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-3 gap-2">
        {PACKAGES.map((pkg) => (
          <Button
            key={pkg.credits}
            disabled={buyCredits.isPending}
            onClick={() => buyCredits.mutate(pkg.credits)}
            className={`relative h-auto flex-col py-3 border transition-all ${
              pkg.popular
                ? "bg-gradient-to-br from-red-800 to-red-950 border-red-600 ring-2 ring-red-500/40 hover:from-red-700 hover:to-red-900 shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                : "bg-black/60 border-red-800/50 hover:bg-red-950/50 hover:border-red-600"
            }`}
          >
            {pkg.popular && (
              <span className="absolute -top-2 right-2 text-[9px] px-1.5 py-0.5 rounded-full bg-red-500 text-white font-bold shadow-md">
                {"POPULAR"}
              </span>
            )}
            <Coins className="w-4 h-4 text-yellow-300 mb-1" />
            <span className="font-black text-white text-base">{pkg.credits} {"cr"}</span>
            <span className="text-[11px] text-red-100 font-semibold">{pkg.price}</span>
            <span className="text-[10px] text-red-200/90 mt-0.5 font-medium">{t(pkg.labelKey)}</span>
          </Button>
        ))}
      </div>
    </Card>
  );
}
