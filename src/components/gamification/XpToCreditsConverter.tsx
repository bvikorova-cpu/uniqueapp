import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Coins, GraduationCap, Vote, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserXp } from "@/hooks/useUserXp";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

type Target = "free_tier" | "tutoring" | "brand_votes";

const RATE = 1000; // 1000 XP = 1 credit

const TARGETS: { id: Target; label: string; desc: string; icon: any; gradient: string }[] = [
  { id: "free_tier", label: "AI Credits", desc: "Use across all AI tools", icon: Coins, gradient: "from-amber-500 to-orange-500" },
  { id: "tutoring", label: "Tutoring Credits", desc: "1 credit = 1 tutoring message", icon: GraduationCap, gradient: "from-blue-500 to-cyan-500" },
  { id: "brand_votes", label: "Brand Votes", desc: "Vote in Brand Collabs", icon: Vote, gradient: "from-pink-500 to-purple-500" },
];

interface Props {
  userId: string;
}

export const XpToCreditsConverter = ({ userId }: Props) => {
  const { xp, refresh } = useUserXp(userId);
  const qc = useQueryClient();
  const [target, setTarget] = useState<Target>("free_tier");
  const [credits, setCredits] = useState(1);
  const [loading, setLoading] = useState(false);

  const maxCredits = Math.floor(xp / RATE);
  const xpCost = credits * RATE;
  const canConvert = maxCredits >= 1 && credits >= 1 && credits <= maxCredits;

  const handleConvert = async () => {
    if (!canConvert) return;
    setLoading(true);
    try {
      const { data, error } = await (supabase as any).rpc("convert_xp_to_credits", {
        p_xp_amount: xpCost,
        p_target: target,
      });
      if (error) throw error;
      toast.success(`Converted ${xpCost} XP → ${credits} ${TARGETS.find(t => t.id === target)?.label}!`);
      await refresh();
      qc.invalidateQueries({ queryKey: ["free-tier-credits"] });
      qc.invalidateQueries({ queryKey: ["tutoring-credits"] });
      setCredits(1);
    } catch (e: any) {
      const msg = e?.message ?? "Conversion failed";
      if (msg.includes("INSUFFICIENT_XP")) toast.error("Not enough XP");
      else toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20 bg-gradient-to-br from-primary/10 via-accent/5 to-amber-500/10 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Convert XP → Credits</CardTitle>
                <CardDescription>1,000 XP = 1 credit. No daily limit.</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-sm px-3 py-1 bg-primary/10 border-primary/40">
              {xp.toLocaleString()} XP
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {TARGETS.map((t) => {
              const Icon = t.icon;
              const active = target === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTarget(t.id)}
                  className={`relative rounded-xl p-3 text-left transition-all border ${
                    active
                      ? "border-primary bg-primary/10 scale-[1.02]"
                      : "border-border/50 bg-card/40 hover:border-primary/40"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${t.gradient} flex items-center justify-center mb-2`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-sm font-semibold text-foreground">{t.label}</div>
                  <div className="text-xs text-muted-foreground">{t.desc}</div>
                </button>
              );
            })}
          </div>

          <div className="rounded-xl bg-background/40 p-4 border border-border/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Credits to receive</span>
              <span className="text-xs text-muted-foreground">Max: {maxCredits}</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCredits(Math.max(1, credits - 1))}
                disabled={credits <= 1}
              >−</Button>
              <input
                type="number"
                min={1}
                max={maxCredits || 1}
                value={credits}
                onChange={(e) => setCredits(Math.max(1, Math.min(maxCredits || 1, Number(e.target.value) || 1)))}
                className="flex-1 bg-transparent text-center text-2xl font-bold outline-none"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCredits(Math.min(maxCredits || 1, credits + 1))}
                disabled={credits >= maxCredits}
              >+</Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCredits(maxCredits || 1)}
                disabled={maxCredits < 1}
              >Max</Button>
            </div>
            <div className="flex items-center justify-center gap-3 mt-3 text-sm">
              <span className="font-semibold text-primary">{xpCost.toLocaleString()} XP</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-amber-500">{credits} credits</span>
            </div>
          </div>

          <Button
            onClick={handleConvert}
            disabled={!canConvert || loading}
            className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground"
            size="lg"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Converting…</>
            ) : maxCredits < 1 ? (
              <>Need {(RATE - xp).toLocaleString()} more XP</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" /> Convert</>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default XpToCreditsConverter;
