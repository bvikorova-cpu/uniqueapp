import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Heart, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const ZODIAC_SIGNS = [
  { value: 'aries', label: 'Aries ♈', emoji: '🐏' }, { value: 'taurus', label: 'Taurus ♉', emoji: '🐂' },
  { value: 'gemini', label: 'Gemini ♊', emoji: '👯' }, { value: 'cancer', label: 'Cancer ♋', emoji: '🦀' },
  { value: 'leo', label: 'Leo ♌', emoji: '🦁' }, { value: 'virgo', label: 'Virgo ♍', emoji: '👰' },
  { value: 'libra', label: 'Libra ♎', emoji: '⚖️' }, { value: 'scorpio', label: 'Scorpio ♏', emoji: '🦂' },
  { value: 'sagittarius', label: 'Sagittarius ♐', emoji: '🏹' }, { value: 'capricorn', label: 'Capricorn ♑', emoji: '🐐' },
  { value: 'aquarius', label: 'Aquarius ♒', emoji: '🏺' }, { value: 'pisces', label: 'Pisces ♓', emoji: '🐟' }
] as const;

type ZodiacSign = typeof ZODIAC_SIGNS[number]['value'];

export const CompatibilityChecker = () => {
  const [sign1, setSign1] = useState<ZodiacSign | ''>('');
  const [sign2, setSign2] = useState<ZodiacSign | ''>('');
  const [result, setResult] = useState<any>(null);

  const checkMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      if (!sign1 || !sign2) return;
      const { data, error } = await supabase.functions.invoke('astrology-reading', {
        body: { type: 'compatibility', data: { sign1, sign2 } }
      });
      if (error) throw error;
      await supabase.from('compatibility_readings').insert([{
        user_id: user.id, sign1, sign2, compatibility_score: data.compatibilityScore,
        analysis: data.analysis, strengths: data.strengths, challenges: data.challenges, advice: data.advice, is_premium: false
      }]);
      return data;
    },
    onSuccess: (data) => { setResult(data); toast.success('Compatibility revealed! 💕'); },
    onError: (error: any) => { toast.error(error.message || 'Failed to analyze'); }
  });

  const s1 = ZODIAC_SIGNS.find(s => s.value === sign1);
  const s2 = ZODIAC_SIGNS.find(s => s.value === sign2);

  return (
    <>
      <FloatingHowItWorks
        title='Compatibility Checker'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Compatibility Checker panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-4">
      <Card className="p-5 bg-card/90 backdrop-blur-xl border-border/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-red-500 to-rose-500" />
        <div className="flex items-center gap-2 mb-4">
          <Heart className="h-5 w-5 text-pink-500" />
          <h3 className="text-lg font-black text-foreground">Love Compatibility</h3>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs font-bold text-foreground mb-1 block">First Sign</label>
            <Select value={sign1} onValueChange={(v) => setSign1(v as ZodiacSign)}>
              <SelectTrigger className="bg-muted/30 border-border/30"><SelectValue placeholder="Choose..." /></SelectTrigger>
              <SelectContent>
                {ZODIAC_SIGNS.map((s) => <SelectItem key={s.value} value={s.value}>{s.emoji} {s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-bold text-foreground mb-1 block">Second Sign</label>
            <Select value={sign2} onValueChange={(v) => setSign2(v as ZodiacSign)}>
              <SelectTrigger className="bg-muted/30 border-border/30"><SelectValue placeholder="Choose..." /></SelectTrigger>
              <SelectContent>
                {ZODIAC_SIGNS.map((s) => <SelectItem key={s.value} value={s.value}>{s.emoji} {s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={() => checkMutation.mutate()} disabled={!sign1 || !sign2 || checkMutation.isPending}
          className="w-full bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white font-bold">
          {checkMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</> : <>💕 Check Compatibility</>}
        </Button>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-5 bg-card/90 backdrop-blur-xl border-border/30 space-y-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-rose-500" />
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <span className="text-3xl">{s1?.emoji}</span>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/30">
                  <span className="text-2xl font-black text-white">{result.compatibilityScore}%</span>
                </motion.div>
                <span className="text-3xl">{s2?.emoji}</span>
              </div>
              <h3 className="text-lg font-black text-foreground">{s1?.label} ❤️ {s2?.label}</h3>
            </div>

            <p className="text-sm text-foreground leading-relaxed">{result.analysis}</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-500/5 rounded-xl p-3 border border-emerald-500/20">
                <h4 className="text-xs font-black text-emerald-600 dark:text-emerald-400 mb-2">💪 Strengths</h4>
                <ul className="space-y-1">
                  {result.strengths?.map((s: string, i: number) => (
                    <li key={i} className="text-xs text-foreground flex items-start gap-1"><span className="text-emerald-500">✓</span>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-amber-500/5 rounded-xl p-3 border border-amber-500/20">
                <h4 className="text-xs font-black text-amber-600 dark:text-amber-400 mb-2">⚠️ Challenges</h4>
                <ul className="space-y-1">
                  {result.challenges?.map((c: string, i: number) => (
                    <li key={i} className="text-xs text-foreground flex items-start gap-1"><span className="text-amber-500">!</span>{c}</li>
                  ))}
                </ul>
              </div>
            </div>

            {result.advice && (
              <div className="p-3 bg-muted/30 rounded-xl border border-border/30">
                <h4 className="text-xs font-black text-foreground mb-1">💡 Advice</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{result.advice}</p>
              </div>
            )}
          </Card>
        </motion.div>
      )}
    </div>
    </>
  );
};
