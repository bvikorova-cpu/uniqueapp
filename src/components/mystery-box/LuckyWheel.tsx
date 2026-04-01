import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, RotateCw, Loader2, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface Props { onBack: () => void; }

const PRIZES = [
  { label: "5 Credits", value: 5, color: "#FFD700", chance: 25 },
  { label: "10 Credits", value: 10, color: "#C0C0C0", chance: 20 },
  { label: "25 Credits", value: 25, color: "#CD7F32", chance: 15 },
  { label: "50 Credits", value: 50, color: "#E5E4E2", chance: 12 },
  { label: "100 Credits", value: 100, color: "#B76E79", chance: 8 },
  { label: "Free Basic Box", value: 0, color: "#4169E1", chance: 10 },
  { label: "2x Luck Boost", value: 0, color: "#9B59B6", chance: 7 },
  { label: "250 Credits", value: 250, color: "#FF4500", chance: 3 },
];

export const LuckyWheel = ({ onBack }: Props) => {
  const { credits, refresh } = useAICredits();
  const navigate = useNavigate();
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [spinsToday, setSpinsToday] = useState(0);

  const SPIN_COST = 15;
  const segmentAngle = 360 / PRIZES.length;

  const spin = async () => {
    if (credits.credits_remaining < SPIN_COST) {
      toast.error(`You need ${SPIN_COST} credits. Redirecting...`);
      setTimeout(() => navigate("/ai-credits"), 1500);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth"); return; }

    setSpinning(true);
    setResult(null);

    // Deduct credits
    await supabase.from('ai_credits').update({ credits_remaining: credits.credits_remaining - SPIN_COST }).eq('user_id', user.id);
    await supabase.from('ai_usage_history').insert({ user_id: user.id, usage_type: 'lucky_wheel_spin', credits_used: SPIN_COST, description: 'Lucky Wheel spin' });

    // Determine prize by weighted random
    const rand = Math.random() * 100;
    let cumulative = 0;
    let prizeIndex = 0;
    for (let i = 0; i < PRIZES.length; i++) {
      cumulative += PRIZES[i].chance;
      if (rand <= cumulative) { prizeIndex = i; break; }
    }

    // Calculate rotation to land on prize
    const targetAngle = 360 - (prizeIndex * segmentAngle + segmentAngle / 2);
    const fullSpins = 5 + Math.floor(Math.random() * 3);
    const newRotation = rotation + fullSpins * 360 + targetAngle;
    setRotation(newRotation);

    // Award prize after animation
    setTimeout(async () => {
      const prize = PRIZES[prizeIndex];
      setResult(prize.label);
      
      if (prize.value > 0) {
        await supabase.from('ai_credits').update({ 
          credits_remaining: credits.credits_remaining - SPIN_COST + prize.value 
        }).eq('user_id', user.id);
      }
      
      await refresh();
      setSpinsToday(s => s + 1);
      setSpinning(false);
      toast.success(`🎰 You won: ${prize.label}!`);
    }, 4000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={onBack} className="gap-2 text-yellow-400 hover:text-yellow-300">
        <ArrowLeft className="h-4 w-4" /> Back to Vault
      </Button>

      <Card className="p-6 max-w-2xl mx-auto bg-card/80 backdrop-blur-xl border-yellow-500/20 shadow-[0_0_30px_rgba(255,215,0,0.08)]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
            <RotateCw className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">Lucky Wheel</h2>
            <p className="text-muted-foreground text-sm">Spin to win credits, boxes & boosts</p>
          </div>
          <span className="ml-auto text-xs font-bold text-yellow-400 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">{SPIN_COST} Credits/spin</span>
        </motion.div>

        {/* Wheel */}
        <div className="relative w-72 h-72 mx-auto mb-6">
          {/* Pointer */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[24px] border-l-transparent border-r-transparent border-t-yellow-400 drop-shadow-lg" />
          
          {/* Wheel SVG */}
          <motion.div
            className="w-full h-full"
            animate={{ rotate: rotation }}
            transition={{ duration: 4, ease: [0.17, 0.67, 0.12, 0.99] }}
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
                const largeArc = segmentAngle > 180 ? 1 : 0;
                const midRad = ((startAngle + endAngle) / 2 - 90) * Math.PI / 180;
                const textX = 150 + 90 * Math.cos(midRad);
                const textY = 150 + 90 * Math.sin(midRad);
                const textAngle = (startAngle + endAngle) / 2;

                return (
                  <g key={i}>
                    <path
                      d={`M150,150 L${x1},${y1} A140,140 0 ${largeArc},1 ${x2},${y2} Z`}
                      fill={prize.color}
                      stroke="rgba(0,0,0,0.3)"
                      strokeWidth="1"
                      opacity={0.85}
                    />
                    <text
                      x={textX}
                      y={textY}
                      fill="white"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                      style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
                    >
                      {prize.label}
                    </text>
                  </g>
                );
              })}
              <circle cx="150" cy="150" r="25" fill="#1a1a2e" stroke="#FFD700" strokeWidth="3" />
              <text x="150" y="150" fill="#FFD700" fontSize="10" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">SPIN</text>
            </svg>
          </motion.div>
        </div>

        {/* Result */}
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-4"
          >
            <Card className="inline-block px-6 py-3 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/30">
              <p className="text-lg font-black">
                🎰 You won: <span className="text-yellow-400">{result}</span>
              </p>
            </Card>
          </motion.div>
        )}

        <Button
          onClick={spin}
          disabled={spinning}
          className="w-full h-14 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-black font-bold text-lg shadow-lg shadow-yellow-500/20"
        >
          {spinning ? (
            <><Loader2 className="h-6 w-6 animate-spin mr-2" /> Spinning...</>
          ) : (
            <><Gift className="h-6 w-6 mr-2" /> Spin the Wheel — {SPIN_COST} Credits</>
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground mt-3">Spins today: {spinsToday} • No daily limit</p>
      </Card>
    </div>
  );
};
