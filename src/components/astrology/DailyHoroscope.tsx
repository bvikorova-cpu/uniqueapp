import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, Star, Heart, Briefcase, Activity, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const ZODIAC_SIGNS = [
  { value: 'aries', label: 'Aries ♈', emoji: '🐏' },
  { value: 'taurus', label: 'Taurus ♉', emoji: '🐂' },
  { value: 'gemini', label: 'Gemini ♊', emoji: '👯' },
  { value: 'cancer', label: 'Cancer ♋', emoji: '🦀' },
  { value: 'leo', label: 'Leo ♌', emoji: '🦁' },
  { value: 'virgo', label: 'Virgo ♍', emoji: '👰' },
  { value: 'libra', label: 'Libra ♎', emoji: '⚖️' },
  { value: 'scorpio', label: 'Scorpio ♏', emoji: '🦂' },
  { value: 'sagittarius', label: 'Sagittarius ♐', emoji: '🏹' },
  { value: 'capricorn', label: 'Capricorn ♑', emoji: '🐐' },
  { value: 'aquarius', label: 'Aquarius ♒', emoji: '🏺' },
  { value: 'pisces', label: 'Pisces ♓', emoji: '🐟' }
] as const;

type ZodiacSign = typeof ZODIAC_SIGNS[number]['value'];

export const DailyHoroscope = () => {
  const [selectedSign, setSelectedSign] = useState<ZodiacSign | ''>('');
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];

  const { data: todayHoroscope, isLoading } = useQuery({
    queryKey: ['daily-horoscope', selectedSign, today],
    queryFn: async () => {
      if (!selectedSign) return null;
      const { data, error } = await supabase.from('daily_horoscopes').select('*').eq('zodiac_sign', selectedSign).eq('date', today).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!selectedSign
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      if (!selectedSign) throw new Error('Sign required');
      const { data, error } = await supabase.functions.invoke('astrology-reading', {
        body: { type: 'daily_horoscope', data: { zodiacSign: selectedSign, date: today } }
      });
      if (error) throw error;
      const horoscopeData = {
        user_id: user.id, zodiac_sign: selectedSign, date: today, content: data.content,
        lucky_numbers: data.luckyNumbers, lucky_colors: data.luckyColors,
        compatibility_signs: data.compatibilitySigns?.map((s: string) => s.toLowerCase()),
        mood_score: data.moodScore, love_score: data.loveScore, career_score: data.careerScore, health_score: data.healthScore, is_premium: false
      };
      const { data: saved, error: saveError } = await supabase.from('daily_horoscopes').insert([horoscopeData]).select().single();
      if (saveError) throw saveError;
      return saved;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['daily-horoscope'] }); toast.success('Horoscope revealed! ✨'); },
    onError: (error: any) => { toast.error(error.message || 'Failed to generate horoscope'); }
  });

  const signData = ZODIAC_SIGNS.find(s => s.value === selectedSign);
  const scores = todayHoroscope ? [
    { icon: Star, label: "Mood", value: todayHoroscope.mood_score, color: "text-amber-500", bg: "from-amber-500 to-yellow-400" },
    { icon: Heart, label: "Love", value: todayHoroscope.love_score, color: "text-pink-500", bg: "from-pink-500 to-rose-400" },
    { icon: Briefcase, label: "Career", value: todayHoroscope.career_score, color: "text-blue-500", bg: "from-blue-500 to-cyan-400" },
    { icon: Activity, label: "Health", value: todayHoroscope.health_score, color: "text-emerald-500", bg: "from-emerald-500 to-green-400" },
  ] : [];

  return (
    <>
      <FloatingHowItWorks
        title='Daily Horoscope'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Daily Horoscope panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-4">
      <Card className="p-5 bg-card/90 backdrop-blur-xl border-border/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-purple-500 to-pink-500" />
        <div className="space-y-4">
          <label className="text-sm font-bold text-foreground block">Select Your Zodiac Sign</label>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {ZODIAC_SIGNS.map((sign) => (
              <motion.button key={sign.value} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedSign(sign.value)}
                className={`p-2 rounded-xl text-center transition-all border ${selectedSign === sign.value
                  ? 'bg-primary/10 border-primary shadow-lg shadow-primary/20' : 'bg-muted/30 border-border/30 hover:bg-muted/50'}`}>
                <span className="text-xl block">{sign.emoji}</span>
                <span className="text-[10px] text-muted-foreground font-medium">{sign.label.split(' ')[0]}</span>
              </motion.button>
            ))}
          </div>

          {selectedSign && !todayHoroscope && (
            <Button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}
              className="w-full bg-gradient-to-r from-amber-600 to-purple-600 hover:from-amber-700 hover:to-purple-700 text-white font-bold">
              {generateMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Consulting the stars...</> : <>✨ Get Today's Horoscope</>}
            </Button>
          )}
        </div>
      </Card>

      {todayHoroscope && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-5 bg-card/90 backdrop-blur-xl border-border/30 space-y-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-purple-500" />
            <div className="flex items-center gap-3">
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="text-4xl">{signData?.emoji}</motion.span>
              <div>
                <h3 className="text-xl font-black text-foreground">{signData?.label}</h3>
                <p className="text-xs text-muted-foreground">
                  {new Date(todayHoroscope.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            <p className="text-sm text-foreground leading-relaxed">{todayHoroscope.content}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {scores.map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                  className="bg-muted/30 rounded-xl p-3 border border-border/30 relative overflow-hidden">
                  <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${s.bg}`} />
                  <div className="flex items-center gap-1 mb-2">
                    <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                    <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${s.value * 10}%` }}
                        transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                        className={`h-full rounded-full bg-gradient-to-r ${s.bg}`} />
                    </div>
                    <span className="text-xs font-black text-foreground">{s.value}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/30">
              <div>
                <h4 className="text-xs font-bold text-foreground mb-2">Lucky Numbers</h4>
                <div className="flex gap-1.5 flex-wrap">
                  {todayHoroscope.lucky_numbers?.map((num: number) => (
                    <span key={num} className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-sm font-bold text-primary">{num}</span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground mb-2">Lucky Colors</h4>
                <div className="flex gap-1.5 flex-wrap">
                  {todayHoroscope.lucky_colors?.map((color: string) => (
                    <Badge key={color} variant="secondary" className="text-xs">{color}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
    </>
  );
};
