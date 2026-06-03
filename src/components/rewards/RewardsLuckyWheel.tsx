import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Disc3, Gift, Sparkles, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const prizes = [
  { label: "0 CR", emoji: "💨", color: "text-muted-foreground" },
  { label: "2 CR", emoji: "🪙", color: "text-emerald-400" },
  { label: "5 CR", emoji: "🪙", color: "text-emerald-400" },
  { label: "10 CR", emoji: "💰", color: "text-yellow-400" },
  { label: "25 CR", emoji: "💰", color: "text-amber-400" },
  { label: "100 CR", emoji: "👑", color: "text-amber-300" },
];

export default function RewardsLuckyWheel() {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{
    label: string;
    emoji: string;
    color: string;
    prize: number;
    net: number;
    balanceAfter: number;
  } | null>(null);
  // Default false — guard against pre-check spin races. Enabled only after DB check returns 0.
  const [canSpin, setCanSpin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [rotation, setRotation] = useState(0);
  const { toast } = useToast();
  const qc = useQueryClient();
  const spinLock = useRef(false);
  const mounted = useRef(true);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (revealTimer.current) clearTimeout(revealTimer.current);
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !mounted.current) return;
        const start = new Date();
        start.setUTCHours(0, 0, 0, 0);
        const { count, error } = await supabase
          .from("lucky_spin_log")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("created_at", start.toISOString());
        if (!mounted.current) return;
        if (error) {
          // Fail closed — if we cannot verify, do not allow client-side spin.
          setCanSpin(false);
        } else {
          setCanSpin((count ?? 0) === 0);
        }
      } finally {
        if (mounted.current) setChecking(false);
      }
    })();
  }, []);

  const spin = async () => {
    if (spinLock.current || spinning || !canSpin) return;
    spinLock.current = true;
    setSpinning(true);
    setResult(null);
    setRotation((r) => r + 1440 + Math.random() * 360);

    try {
      const { data, error } = await supabase.rpc("spin_lucky_wheel");
      if (error) throw error;
      const res = (data ?? {}) as {
        error?: string;
        prize?: number;
        net?: number;
        balance_after?: number;
      };
      if (res.error) {
        const isCooldown = res.error === "already_spun_today";
        toast({
          title: isCooldown ? "Come back tomorrow!" : "Spin failed",
          description: isCooldown
            ? "You've already spun the wheel today. New spin available tomorrow."
            : res.error.replace(/_/g, " "),
          variant: isCooldown ? "default" : "destructive",
        });
        if (isCooldown && mounted.current) setCanSpin(false);
        if (mounted.current) setSpinning(false);
        return;
      }
      const prizeNum = res.prize ?? 0;
      const netNum = res.net ?? prizeNum - 5;
      const balanceAfter = res.balance_after ?? 0;
      const prizeLabel = prizeNum > 0 ? `+${prizeNum} CR` : "0 CR";
      const matched =
        prizes.find((p) => p.label === prizeLabel) ??
        (prizeNum > 0
          ? { label: prizeLabel, emoji: "🪙", color: "text-emerald-400" }
          : { label: prizeLabel, emoji: "💨", color: "text-muted-foreground" });
      revealTimer.current = setTimeout(() => {
        if (!mounted.current) return;
        setResult({ ...matched, prize: prizeNum, net: netNum, balanceAfter });
        setSpinning(false);
        setCanSpin(false);
        toast({
          title:
            prizeNum > 0
              ? `🎉 You won: ${prizeLabel}!`
              : "💨 No win this time",
          description:
            prizeNum > 0
              ? `Net: ${netNum >= 0 ? "+" : ""}${netNum} CR · Balance: ${balanceAfter} CR`
              : `Lost 5 CR · Balance: ${balanceAfter} CR`,
        });
        qc.invalidateQueries({ queryKey: ["rewards-stats"] });
        qc.invalidateQueries({ queryKey: ["gamification"] });
      }, 3000);
    } catch (e) {
      if (mounted.current) setSpinning(false);
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Spin failed",
        variant: "destructive",
      });
    } finally {
      spinLock.current = false;
    }
  };

  const buttonLabel = checking
    ? "Checking…"
    : spinning
    ? "Spinning..."
    : canSpin
    ? "Spin the Wheel"
    : "Come Back Tomorrow!";

  return (
    <div className="space-y-4">
      <Card className="p-6 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border-amber-400/20 backdrop-blur-md text-center">
        <h3 className="font-bold text-lg flex items-center justify-center gap-2 mb-4">
          <Disc3 className="h-5 w-5 text-amber-500" /> Daily Lucky Spin
        </h3>

        <div className="relative w-48 h-48 mx-auto mb-6">
          <motion.div
            className="w-full h-full rounded-full border-4 border-amber-400/40 bg-gradient-to-br from-amber-900/30 to-yellow-900/20 flex items-center justify-center relative overflow-hidden"
            animate={{ rotate: rotation }}
            transition={{ duration: 3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {prizes.map((prize, i) => {
              const angle = (i / prizes.length) * 360;
              return (
                <div
                  key={i}
                  className="absolute text-lg"
                  style={{
                    transform: `rotate(${angle}deg) translateY(-70px) rotate(${-angle}deg)`,
                    transformOrigin: "center center",
                  }}
                >
                  {prize.emoji}
                </div>
              );
            })}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/30 z-10">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </div>
          </motion.div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 text-2xl z-20">▼</div>
        </div>

        <Button
          onClick={spin}
          disabled={spinning || !canSpin || checking}
          type="button"
          className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold hover:opacity-90 w-full"
        >
          {checking && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {buttonLabel}
        </Button>

        <p className="text-xs text-muted-foreground mt-2">
          1 free spin daily • Real XP and items credited instantly
        </p>
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <Card className="p-4 bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border-amber-400/30 text-center">
              <span className="text-4xl block mb-2">{result.emoji}</span>
              <p className={`font-black text-lg ${result.color}`}>{result.label}</p>
              <p className="text-xs text-muted-foreground mt-1">Added to your account!</p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="p-4 bg-card/80 backdrop-blur-md border-amber-400/15">
        <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
          <Gift className="h-4 w-4 text-amber-500" /> Possible Prizes
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {prizes.map((prize, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20">
              <span className="text-lg">{prize.emoji}</span>
              <span className="text-xs font-medium">{prize.label}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
