import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Target, Brain, Clock, TrendingUp, Sparkles, Loader2 } from "lucide-react";
import { useBrainDuelCredits } from "@/hooks/useBrainDuelCredits";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const POWERUPS = [
  { id: "fifty-fifty", name: "50:50", icon: Target, color: "text-yellow-400", bg: "bg-yellow-500/10" },
  { id: "ask-ai", name: "Ask AI", icon: Brain, color: "text-blue-400", bg: "bg-blue-500/10" },
  { id: "extra-time", name: "Extra Time", icon: Clock, color: "text-green-400", bg: "bg-green-500/10" },
  { id: "double-points", name: "2× Points", icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-500/10" },
];

const COMBOS = [
  { id: "brain-blitz", p1: "ask-ai", p2: "extra-time", name: "Brain Blitz", effect: "AI hint + 20s extra time bonus", cost: 8, emoji: "🧠⚡" },
  { id: "sniper-shot", p1: "fifty-fifty", p2: "ask-ai", name: "Sniper Shot", effect: "Remove 2 wrong + AI narrows to answer", cost: 12, emoji: "🎯🔫" },
  { id: "time-warp", p1: "extra-time", p2: "double-points", name: "Time Warp", effect: "+20s and 2× points for this round", cost: 15, emoji: "⏰✨" },
  { id: "nuclear", p1: "fifty-fifty", p2: "double-points", name: "Nuclear Option", effect: "50:50 elimination + 3× points!", cost: 20, emoji: "☢️💥" },
];

export const PowerUpCombos = () => {
  const { credits, spendCredits } = useBrainDuelCredits();
  const [activating, setActivating] = useState<string | null>(null);
  const [lastActivated, setLastActivated] = useState<string | null>(null);

  const activateCombo = async (combo: typeof COMBOS[0]) => {
    if (credits < combo.cost) {
      toast.error("Not enough credits for this combo!");
      return;
    }

    setActivating(combo.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Please sign in"); return; }

      spendCredits(combo.cost);

      await supabase.from("brain_duel_powerup_combos").insert({
        user_id: user.id,
        combo_type: combo.id,
        powerup_1: combo.p1,
        powerup_2: combo.p2,
        effect_description: combo.effect,
        credits_cost: combo.cost,
      });

      setLastActivated(combo.id);
      toast.success(`${combo.emoji} ${combo.name} activated!`, { description: combo.effect });
      setTimeout(() => setLastActivated(null), 3000);
    } catch (e) {
      toast.error("Failed to activate combo");
    } finally {
      setActivating(null);
    }
  };

  const getIcon = (id: string) => POWERUPS.find(p => p.id === id);

  return (
    <>
      <FloatingHowItWorks title={"Power Up Combos - How it works"} steps={[{ title: 'Open', desc: 'Access the Power Up Combos section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Power Up Combos.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="border-primary/20 backdrop-blur-xl bg-card/80 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-primary/5 to-cyan-500/5" />
      <CardHeader className="relative pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="p-1.5 rounded-lg bg-violet-500/10">
            <Zap className="h-4 w-4 text-violet-400" />
          </div>
          Power-Up Combos
          <Badge variant="outline" className="text-[10px] border-violet-500/30 text-violet-400">NEW</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="relative space-y-3">
        {COMBOS.map((combo) => {
          const p1 = getIcon(combo.p1);
          const p2 = getIcon(combo.p2);
          const P1Icon = p1?.icon || Sparkles;
          const P2Icon = p2?.icon || Sparkles;
          const isActive = lastActivated === combo.id;

          return (
            <motion.div
              key={combo.id}
              whileHover={{ scale: 1.02 }}
              className={`relative rounded-xl border p-3 transition-all ${
                isActive ? "border-primary/50 bg-primary/10 shadow-lg shadow-primary/10" : "border-border/50 bg-card/40"
              }`}
            >
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-gradient-to-r from-primary/10 via-violet-500/10 to-primary/10 rounded-xl animate-pulse"
                  />
                )}
              </AnimatePresence>
              <div className="relative flex items-center gap-3">
                <div className="flex items-center gap-1 shrink-0">
                  <div className={`p-1.5 rounded-lg ${p1?.bg}`}>
                    <P1Icon className={`h-4 w-4 ${p1?.color}`} />
                  </div>
                  <span className="text-xs font-bold text-primary">+</span>
                  <div className={`p-1.5 rounded-lg ${p2?.bg}`}>
                    <P2Icon className={`h-4 w-4 ${p2?.color}`} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold">{combo.emoji} {combo.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{combo.effect}</p>
                </div>
                <Button
                  size="sm"
                  variant={isActive ? "default" : "outline"}
                  disabled={!!activating || credits < combo.cost || isActive}
                  onClick={() => activateCombo(combo)}
                  className="shrink-0 text-xs"
                >
                  {activating === combo.id ? <Loader2 className="h-3 w-3 animate-spin" /> : isActive ? "Active!" : `${combo.cost}c`}
                </Button>
              </div>
            </motion.div>
          );
        })}
        <p className="text-[10px] text-muted-foreground text-center">
          Combine 2 power-ups for a special effect during your next match
        </p>
      </CardContent>
    </Card>
    </>
  );
};
