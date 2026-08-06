import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCw, Coins, Trophy, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const EMOTIONS = [
  { name: "Joy", color: "#facc15", emoji: "😄" },
  { name: "Love", color: "#ec4899", emoji: "❤️" },
  { name: "Motivation", color: "#3b82f6", emoji: "⚡" },
  { name: "Peace", color: "#10b981", emoji: "☮️" },
  { name: "Excitement", color: "#f97316", emoji: "🎉" },
  { name: "Curiosity", color: "#8b5cf6", emoji: "🔍" },
];

interface Props { onBack: () => void; }

export function EmotionRoulette({ onBack }: Props) {
  const { toast } = useToast();
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<{ emotion: string; won: boolean; payout: number } | null>(null);
  const [rotation, setRotation] = useState(0);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await (supabase as any)
      .from("emotion_roulette_spins")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);
    if (data) setHistory(data);
  };

  const handleSpin = async () => {
    if (!selectedEmotion || isSpinning) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Sign in required", variant: "destructive" });
      return;
    }

    // Check unified AI credits
    const { data: credits } = await supabase
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!credits || credits.credits_remaining < 1) {
      toast({ title: "Insufficient Credits", description: "You need 1 AI credit to spin. Top up your AI credits first.", variant: "destructive" });
      return;
    }

    setIsSpinning(true);
    setResult(null);

    const { data, error } = await supabase.functions.invoke("emotion-roulette-spin", {
      body: { bet_emotion: selectedEmotion.toLowerCase() } });

    if (error || (data as any)?.error) { setIsSpinning(false);
      toast({
        title: "Spin failed",
        description: (data as any)?.error || error?.message || "Try again",
        variant: "destructive" });
      return;
    }

    const resultEmotionName = String((data as any)?.result_emotion ?? "");
    const won = !!(data as any)?.won;
    const payout = Number((data as any)?.payout ?? 0);
    const idx = Math.max(0, EMOTIONS.findIndex((e) => e.name.toLowerCase() === resultEmotionName));
    const displayName = EMOTIONS[idx]?.name ?? resultEmotionName;

    // Spin the wheel so the winning slice ends under the top pointer
    const seg = 360 / EMOTIONS.length;
    const current = rotation;
    const fullSpins = 6 * 360;
    const targetAngle = 360 - (idx * seg + seg / 2);
    const base = current + fullSpins;
    const final = base + ((targetAngle - (base % 360)) + 360) % 360;
    setRotation(final);

    await new Promise((r) => setTimeout(r, 4200));

    setResult({ emotion: displayName, won, payout });
    window.dispatchEvent(new Event("ai-credits-updated"));
    setIsSpinning(false);
    fetchHistory();

    toast({
      title: won ? "🎉 You Won!" : "Better luck next time!",
      description: won
        ? `The wheel landed on ${displayName}! You won ${payout} credits!`
        : `The wheel landed on ${displayName}. You bet on ${selectedEmotion}.` });
  };


  return (
    <div className="space-y-6">
      <FloatingHowItWorks
        title={"Emotion Roulette"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Hub
      </Button>

      <Card className="border-pink-500/20 bg-gradient-to-br from-pink-500/5 via-violet-500/5 to-cyan-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCw className="h-6 w-6 text-pink-400" />
            Emotion Roulette
          </CardTitle>
          <CardDescription>Pick an emotion and spin the wheel! Match to win 2x. Costs 1 credit per spin.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Emotion selector */}
          <div>
            <p className="text-sm font-medium mb-3">Select your bet:</p>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {EMOTIONS.map((e) => (
                <motion.button
                  key={e.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedEmotion(e.name)}
                  className={`
                    p-3 rounded-xl border text-center transition-all
                    ${selectedEmotion === e.name
                      ? "border-pink-500 bg-pink-500/20 shadow-[0_0_20px_rgba(236,72,153,0.3)]"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                    }
                  `}
                >
                  <span className="text-2xl block mb-1">{e.emoji}</span>
                  <span className="text-xs font-medium">{e.name}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Wheel */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-64 h-64">
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 z-20 text-3xl drop-shadow">▼</div>

              <motion.div
                className="w-full h-full rounded-full border-4 border-white/20 shadow-[0_0_40px_rgba(236,72,153,0.25)] relative"
                animate={{ rotate: rotation }}
                transition={{ duration: 4, ease: [0.13, 0.79, 0.09, 0.99] }}
              >
                <svg viewBox="0 0 100 100" className="w-full h-full rounded-full">
                  {EMOTIONS.map((e, i) => {
                    const seg = 360 / EMOTIONS.length;
                    const a0 = (i * seg * Math.PI) / 180;
                    const a1 = ((i + 1) * seg * Math.PI) / 180;
                    const r = 50;
                    const x0 = 50 + r * Math.sin(a0);
                    const y0 = 50 - r * Math.cos(a0);
                    const x1 = 50 + r * Math.sin(a1);
                    const y1 = 50 - r * Math.cos(a1);
                    const mid = ((i + 0.5) * seg * Math.PI) / 180;
                    const lx = 50 + 32 * Math.sin(mid);
                    const ly = 50 - 32 * Math.cos(mid);
                    return (
                      <g key={e.name}>
                        <path
                          d={`M50 50 L ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1} Z`}
                          fill={e.color}
                          fillOpacity={0.85}
                          stroke="rgba(255,255,255,0.4)"
                          strokeWidth={0.5}
                        />
                        <text
                          x={lx}
                          y={ly}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="10"
                        >
                          {e.emoji}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-background/90 border border-white/20 flex items-center justify-center">
                    <Sparkles className={`h-5 w-5 text-pink-400 ${isSpinning ? "animate-pulse" : ""}`} />
                  </div>
                </div>
              </motion.div>
            </div>


            <Button
              size="lg"
              onClick={handleSpin}
              disabled={!selectedEmotion || isSpinning}
              className="bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white shadow-[0_4px_20px_rgba(236,72,153,0.4)]"
            >
              {isSpinning ? (
                <RotateCw className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <Coins className="h-5 w-5 mr-2" />
              )}
              {isSpinning ? "Spinning..." : "Spin (1 Credit)"}
            </Button>

            {/* Result */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className={`text-center p-4 rounded-xl border ${
                    result.won
                      ? "border-emerald-500/40 bg-emerald-500/10"
                      : "border-red-500/40 bg-red-500/10"
                  }`}
                >
                  <p className="text-lg font-bold">
                    {result.won ? "🎉 Winner!" : "😔 Not this time"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Landed on: {result.emotion}
                    {result.won && ` — Won ${result.payout} credits!`}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* History */}
      <Card className="border-white/10">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-violet-400" />
            Recent Spins
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No spins yet. Try your luck!</p>
          ) : (
            <div className="space-y-2">
              {history.map((spin: any) => (
                <div key={spin.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{spin.bet_emotion}</Badge>
                    <span className="text-xs text-muted-foreground">→</span>
                    <Badge variant="outline" className="text-xs">{spin.result_emotion}</Badge>
                  </div>
                  <Badge className={spin.won ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}>
                    {spin.won ? `+${spin.payout}` : "-1"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
