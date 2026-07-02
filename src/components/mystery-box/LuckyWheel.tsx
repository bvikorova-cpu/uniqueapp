import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, RotateCw, Loader2, Gift, Zap, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

const PRIZES = [
  { label: "5 Credits", value: 5, color: "#4A5568", chance: 25 },
  { label: "10 Credits", value: 10, color: "#2D3748", chance: 20 },
  { label: "25 Credits", value: 25, color: "#553C9A", chance: 15 },
  { label: "50 Credits", value: 50, color: "#2C5282", chance: 12 },
  { label: "100 Credits", value: 100, color: "#9B2C2C", chance: 8 },
  { label: "Free Box", value: 0, color: "#276749", chance: 10 },
  { label: "2x Luck", value: 0, color: "#744210", chance: 7 },
  { label: "250 Credits", value: 250, color: "#B7791F", chance: 3 },
];

export const LuckyWheel = ({ onBack }: Props) => {
  const { credits, refresh } = useAICredits();
  const navigate = useNavigate();
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [spinsToday, setSpinsToday] = useState(0);
  const [totalWon, setTotalWon] = useState(0);

  const SPIN_COST = 15;
  const segmentAngle = 360 / PRIZES.length;

  const spin = async () => {
    if (spinning) return;
    if (credits.credits_remaining < SPIN_COST) {
      toast.error(`You need ${SPIN_COST} credits. Redirecting...`);
      setTimeout(() => navigate("/ai-credits"), 1500);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth"); return; }

    setSpinning(true);
    setResult(null);

    // Server picks the prize — client cannot influence outcome.
    const { data, error } = await supabase.rpc('lucky_wheel_spin_secure');
    if (error || !data) {
      setSpinning(false);
      toast.error(error?.message || "Spin failed");
      return;
    }
    const res = data as unknown as {
      error?: string;
      prize_index?: number;
      prize_value?: number;
      prize_label?: string;
      balance_after?: number;
    };
    if (res.error) {
      setSpinning(false);
      toast.error(res.error.replace(/_/g, " "));
      return;
    }

    const prizeIndex = Math.max(0, Math.min(PRIZES.length - 1, res.prize_index ?? 0));
    const prize = PRIZES[prizeIndex];
    const prizeLabel = res.prize_label ?? prize.label;
    const prizeValue = res.prize_value ?? prize.value;

    const targetAngle = 360 - (prizeIndex * segmentAngle + segmentAngle / 2);
    // Animation-only randomness (does not affect outcome).
    const fullSpins = 6 + Math.floor(Math.random() * 4);
    const newRotation = rotation + fullSpins * 360 + targetAngle;
    setRotation(newRotation);

    setTimeout(async () => {
      setResult(prizeLabel);
      if (prizeValue > 0) setTotalWon(t => t + prizeValue);
      if (prizeValue >= 100) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#FFD700', '#FFA500', '#FF4500'] });
      }
      await refresh();
      setSpinsToday(s => s + 1);
      setSpinning(false);
      toast.success(`🎰 You won: ${prizeLabel}!`);
    }, 4500);
  };

  return (
    <>
      <FloatingHowItWorks title={"Lucky Wheel - How it works"} steps={[{ title: 'Open', desc: 'Access the Lucky Wheel section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Lucky Wheel.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={onBack} className="gap-2 text-yellow-400 hover:text-yellow-300">
        <ArrowLeft className="h-4 w-4" /> Back to Vault
      </Button>

      <Card className="p-6 max-w-2xl mx-auto bg-card/90 backdrop-blur-xl border-yellow-500/20 shadow-[0_0_40px_rgba(255,215,0,0.08)]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
            <RotateCw className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">Lucky Wheel</h2>
            <p className="text-muted-foreground text-xs">Spin to win credits, boxes & boosts</p>
          </div>
          <span className="ml-auto text-xs font-bold text-yellow-400 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">{SPIN_COST} Credits</span>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="p-3 text-center bg-green-500/5 border-green-500/20">
            <Zap className="h-4 w-4 mx-auto text-green-400 mb-1" />
            <p className="text-lg font-black">{spinsToday}</p>
            <p className="text-[10px] text-muted-foreground">Spins Today</p>
          </Card>
          <Card className="p-3 text-center bg-yellow-500/5 border-yellow-500/20">
            <Trophy className="h-4 w-4 mx-auto text-yellow-400 mb-1" />
            <p className="text-lg font-black text-yellow-400">{totalWon}</p>
            <p className="text-[10px] text-muted-foreground">Total Won</p>
          </Card>
          <Card className="p-3 text-center bg-purple-500/5 border-purple-500/20">
            <Gift className="h-4 w-4 mx-auto text-purple-400 mb-1" />
            <p className="text-lg font-black">{PRIZES.length}</p>
            <p className="text-[10px] text-muted-foreground">Prize Slots</p>
          </Card>
        </div>

        {/* Wheel */}
        <div className="relative w-72 h-72 mx-auto mb-6">
          {/* Outer ring glow */}
          <div className="absolute inset-[-4px] rounded-full border-2 border-yellow-500/30 shadow-[0_0_20px_rgba(255,215,0,0.15)]" />
          
          {/* Pointer */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
            <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-t-[28px] border-l-transparent border-r-transparent border-t-yellow-400 drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]" />
          </div>

          <motion.div
            className="w-full h-full"
            animate={{ rotate: rotation }}
            transition={{ duration: 4.5, ease: [0.15, 0.65, 0.1, 0.99] }}
          >
            <svg viewBox="0 0 300 300" className="w-full h-full drop-shadow-2xl">
              {PRIZES.map((prize, i) => {
                const startAngle = i * segmentAngle;
                const endAngle = (i + 1) * segmentAngle;
                const startRad = (startAngle - 90) * Math.PI / 180;
                const endRad = (endAngle - 90) * Math.PI / 180;
                const x1 = 150 + 140 * Math.cos(startRad);
                const y1 = 150 + 140 * Math.sin(startRad);
                const x2 = 150 + 140 * Math.cos(endRad);
                const y2 = 150 + 140 * Math.sin(endRad);
                const midRad = ((startAngle + endAngle) / 2 - 90) * Math.PI / 180;
                const textX = 150 + 90 * Math.cos(midRad);
                const textY = 150 + 90 * Math.sin(midRad);
                const textAngle = (startAngle + endAngle) / 2;

                return (
                  <g key={i}>
                    <path
                      d={`M150,150 L${x1},${y1} A140,140 0 0,1 ${x2},${y2} Z`}
                      fill={prize.color}
                      stroke="rgba(255,215,0,0.3)"
                      strokeWidth="1.5"
                    />
                    <text
                      x={textX} y={textY}
                      fill="white" fontSize="9" fontWeight="bold"
                      textAnchor="middle" dominantBaseline="middle"
                      transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                      style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}
                    >
                      {prize.label}
                    </text>
                  </g>
                );
              })}
              <circle cx="150" cy="150" r="28" fill="#0a0a0a" stroke="#FFD700" strokeWidth="3" />
              <text x="150" y="150" fill="#FFD700" fontSize="11" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">SPIN</text>
            </svg>
          </motion.div>
        </div>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center mb-4"
            >
              <Card className="inline-block px-8 py-4 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/40 shadow-[0_0_20px_rgba(255,215,0,0.15)]">
                <p className="text-xl font-black">
                  🎰 You won: <span className="bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">{result}</span>
                </p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          onClick={spin}
          disabled={spinning}
          className="w-full h-14 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-black font-bold text-lg shadow-lg shadow-yellow-500/25 active:scale-[0.97] transition-transform"
        >
          {spinning ? (
            <><Loader2 className="h-6 w-6 animate-spin mr-2" /> Spinning...</>
          ) : (
            <><Gift className="h-6 w-6 mr-2" /> Spin the Wheel — {SPIN_COST} Credits</>
          )}
        </Button>

        {/* Prize table */}
        <div className="mt-6">
          <h4 className="text-sm font-bold text-muted-foreground mb-2">Prize Table</h4>
          <div className="grid grid-cols-2 gap-1.5">
            {PRIZES.map((p, i) => (
              <div key={i} className="flex items-center gap-2 text-xs p-1.5 rounded bg-card/50 border border-border/50">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                <span className="flex-1">{p.label}</span>
                <span className="text-muted-foreground">{p.chance}%</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
    </>
  );
};
