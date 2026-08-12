import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Zap } from "lucide-react";
import { useShadowArenaCredits } from "@/hooks/useShadowArenaAI";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";


export function ShadowCreditsCard() {
  const { credits, isLoading } = useShadowArenaCredits();
  const balance = credits?.credits_remaining ?? 0;

  return (
    <><FloatingHowItWorks title="ShadowCreditsCard — How it works" steps={[{title:"Open this section",desc:"Access ShadowCreditsCard from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
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
            
            <span className="px-2 py-0.5 rounded bg-red-950/70 border border-red-700/50 font-medium">{"Predict 5"}</span>
            <span className="px-2 py-0.5 rounded bg-red-950/70 border border-red-700/50 font-medium">{"Avatar 8"}</span>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <Button asChild className="w-full bg-gradient-to-r from-red-800 to-purple-900 border border-red-600/50 hover:from-red-700 hover:to-purple-800">
          <Link to="/ai-credits-store">
            <Coins className="w-4 h-4 mr-2 text-yellow-300" /> Top up AI credits
          </Link>
        </Button>
        <p className="mt-2 text-[11px] text-red-200/70 text-center">
          Shadow Arena uses your platform-wide AI credits — no subscription, pay only for what you use.
        </p>
      </div>
    </Card>
  </>
  );
}
