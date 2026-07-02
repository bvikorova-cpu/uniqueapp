import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Sparkles, Coins, Zap, Clock, Star, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import confetti from 'canvas-confetti';
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const WHEEL_SEGMENTS = [
  { label: '5 Credits', value: 5, color: 'hsl(var(--primary))', icon: Coins, rarity: 'common' },
  { label: '10 Credits', value: 10, color: 'hsl(220 70% 50%)', icon: Coins, rarity: 'common' },
  { label: '25 Credits', value: 25, color: 'hsl(280 70% 50%)', icon: Star, rarity: 'uncommon' },
  { label: '50 Credits', value: 50, color: 'hsl(340 70% 50%)', icon: Zap, rarity: 'rare' },
  { label: '2× Power-up', value: 0, type: 'powerup', color: 'hsl(160 70% 40%)', icon: Sparkles, rarity: 'uncommon' },
  { label: '15 Credits', value: 15, color: 'hsl(30 70% 50%)', icon: Coins, rarity: 'common' },
  { label: '100 Credits', value: 100, color: 'hsl(50 80% 45%)', icon: Trophy, rarity: 'legendary' },
  { label: '+30s Power-up', value: 0, type: 'time_powerup', color: 'hsl(200 70% 45%)', icon: Clock, rarity: 'rare' },
];

export const DailySpinWheel = () => {
  const [spinning, setSpinning] = useState(false);
  const [canSpin, setCanSpin] = useState(false);
  const [lastSpinDate, setLastSpinDate] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<typeof WHEEL_SEGMENTS[0] | null>(null);
  const [timeUntilNext, setTimeUntilNext] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    checkSpinEligibility();
  }, []);

  useEffect(() => {
    if (!canSpin && lastSpinDate) {
      const interval = setInterval(() => {
        const now = new Date();
        const lastSpin = new Date(lastSpinDate);
        const nextSpin = new Date(lastSpin);
        nextSpin.setDate(nextSpin.getDate() + 1);
        nextSpin.setHours(0, 0, 0, 0);

        const diff = nextSpin.getTime() - now.getTime();
        if (diff <= 0) {
          setCanSpin(true);
          setTimeUntilNext('');
          clearInterval(interval);
          return;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeUntilNext(`${hours}h ${mins}m ${secs}s`);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [canSpin, lastSpinDate]);

  const checkSpinEligibility = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    const { data } = await supabase
      .from('brain_duel_daily_spins' as any)
      .select('*')
      .eq('user_id', user.id)
      .order('spin_date', { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      const lastSpin = (data[0] as any).spin_date;
      setLastSpinDate((data[0] as any).created_at);
      setCanSpin(lastSpin !== today);
    } else {
      setCanSpin(true);
    }
  };

  const spin = async () => {
    if (spinning || !canSpin) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please log in to spin');
      return;
    }

    setSpinning(true);
    setResult(null);

    // Weighted random selection
    const weights = WHEEL_SEGMENTS.map(s => {
      if (s.rarity === 'legendary') return 2;
      if (s.rarity === 'rare') return 8;
      if (s.rarity === 'uncommon') return 15;
      return 25;
    });
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    let selectedIndex = 0;
    for (let i = 0; i < weights.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        selectedIndex = i;
        break;
      }
    }

    const segmentAngle = 360 / WHEEL_SEGMENTS.length;
    const targetAngle = 360 - (selectedIndex * segmentAngle + segmentAngle / 2);
    const totalRotation = rotation + 1440 + targetAngle;
    setRotation(totalRotation);

    setTimeout(async () => {
      const selected = WHEEL_SEGMENTS[selectedIndex];
      setResult(selected);
      setSpinning(false);
      setCanSpin(false);
      setLastSpinDate(new Date().toISOString());

      // Award the prize
      const today = new Date().toISOString().split('T')[0];

      try {
        await supabase.from('brain_duel_daily_spins' as any).insert({
          user_id: user.id,
          spin_date: today,
          reward_type: selected.type || 'credits',
          reward_value: selected.value,
          reward_label: selected.label,
        } as any);

        if (selected.value > 0 && !selected.type) {
          // Add credits
          const { data: credits } = await supabase
            .from('brain_duel_credits')
            .select('credits')
            .eq('user_id', user.id)
            .maybeSingle();

          if (credits) {
            await supabase
              .from('brain_duel_credits')
              .update({ credits: credits.credits + selected.value })
              .eq('user_id', user.id);
          }
          queryClient.invalidateQueries({ queryKey: ['brain-duel-credits'] });
        }

        if (selected.rarity === 'legendary' || selected.rarity === 'rare') {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        }

        toast.success(`🎉 You won: ${selected.label}!`, {
          description: selected.rarity === 'legendary' ? 'JACKPOT! Incredible luck!' : 'Come back tomorrow for another spin!',
        });
      } catch (err) {
        console.error('Error saving spin:', err);
      }
    }, 4000);
  };

  const rarityColors: Record<string, string> = {
    common: 'bg-muted text-muted-foreground',
    uncommon: 'bg-green-500/20 text-green-400 border-green-500/30',
    rare: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    legendary: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 animate-pulse',
  };

  return (
    <Card className="relative overflow-hidden border-primary/20 backdrop-blur-xl bg-card/80">
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-primary/5 to-purple-500/5" />
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-yellow-500/10">
            <Gift className="h-5 w-5 text-yellow-500" />
          </div>
          Daily Spin Wheel
          {canSpin && (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 animate-pulse ml-2">
              FREE SPIN!
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative flex flex-col items-center gap-6 pb-8">
        {/* Wheel */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[24px] border-t-primary drop-shadow-lg" />
          </div>

          {/* Wheel SVG */}
          <motion.div
            className="w-full h-full rounded-full shadow-2xl shadow-primary/20 border-4 border-primary/30"
            animate={{ rotate: rotation }}
            transition={{ duration: 4, ease: [0.17, 0.67, 0.12, 0.99] }}
            style={{ transformOrigin: 'center center' }}
          >
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {WHEEL_SEGMENTS.map((segment, i) => {
                const angle = 360 / WHEEL_SEGMENTS.length;
                const startAngle = i * angle - 90;
                const endAngle = startAngle + angle;
                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;
                const midRad = ((startAngle + endAngle) / 2 * Math.PI) / 180;

                const x1 = 100 + 95 * Math.cos(startRad);
                const y1 = 100 + 95 * Math.sin(startRad);
                const x2 = 100 + 95 * Math.cos(endRad);
                const y2 = 100 + 95 * Math.sin(endRad);
                const largeArc = angle > 180 ? 1 : 0;

                const textX = 100 + 60 * Math.cos(midRad);
                const textY = 100 + 60 * Math.sin(midRad);
                const textAngle = (startAngle + endAngle) / 2 + 90;

                return (
                  <g key={i}>
                    <path
                      d={`M 100 100 L ${x1} ${y1} A 95 95 0 ${largeArc} 1 ${x2} ${y2} Z`}
                      fill={segment.color}
                      stroke="hsl(var(--background))"
                      strokeWidth="1"
                      opacity={0.85}
                    />
                    <text
                      x={textX}
                      y={textY}
                      fill="white"
                      fontSize="6"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                    >
                      {segment.label}
                    </text>
                  </g>
                );
              })}
              <circle cx="100" cy="100" r="18" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="2" />
              <text x="100" y="100" fill="hsl(var(--primary))" fontSize="8" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
                SPIN
              </text>
            </svg>
          </motion.div>
        </div>

        {/* Prizes Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
          {WHEEL_SEGMENTS.map((seg, i) => {
            const Icon = seg.icon;
            return (
              <div key={i} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs border ${rarityColors[seg.rarity]}`}>
                <Icon className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{seg.label}</span>
              </div>
            );
          })}
        </div>

        {/* Spin Button */}
        <Button
          onClick={spin}
          disabled={spinning || !canSpin}
          size="lg"
          className="w-full max-w-xs relative overflow-hidden group"
        >
          {spinning ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="h-5 w-5" />
            </motion.span>
          ) : canSpin ? (
            <>
              <Gift className="h-5 w-5 mr-2" />
              Spin the Wheel!
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </>
          ) : (
            <>
              <Clock className="h-5 w-5 mr-2" />
              Next spin in {timeUntilNext}
            </>
          )}
        </Button>

        {/* Result Display */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`text-center p-4 rounded-2xl border w-full max-w-xs ${rarityColors[result.rarity]}`}
            >
              <p className="text-lg font-bold">🎉 {result.label}</p>
              <p className="text-xs mt-1 opacity-75 capitalize">{result.rarity} reward</p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
