import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useBattleReactions } from "@/hooks/useShadowArenaFeatures";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const EMOJIS = ["🩸", "💀", "🔥", "👻", "⚡", "🖤"];

export function LiveReactions({ battleId }: { battleId: string }) {
  const { counts, send, total } = useBattleReactions(battleId);

  return (
    <><FloatingHowItWorks title="LiveReactions — How it works" steps={[{title:"Open this section",desc:"Access LiveReactions from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<div className="rounded-xl border border-red-900/30 bg-gradient-to-br from-[hsl(0,30%,8%)] to-[hsl(280,25%,7%)] p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-red-100">Live Audience</h4>
        <span className="text-xs text-red-200/60">{total} reactions</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {EMOJIS.map((emoji) => (
          <Button
            key={emoji}
            variant="outline"
            size="sm"
            onClick={() => send.mutate(emoji)}
            disabled={send.isPending}
            className="relative h-12 px-3 border-red-900/30 hover:border-red-700/60 hover:bg-red-950/40"
          >
            <span className="text-2xl">{emoji}</span>
            <AnimatePresence>
              {counts[emoji] > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-red-700 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center"
                >
                  {counts[emoji]}
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        ))}
      </div>
    </div>
  </>
  );
}
