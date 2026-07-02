import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calculator, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const NumerologyCalculator = () => {
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [result, setResult] = useState<any>(null);

  const calculateLifePath = (date: string) => {
    const digits = date.replace(/-/g, '').split('').map(Number);
    let sum = digits.reduce((a, b) => a + b, 0);
    while (sum > 9 && ![11, 22, 33].includes(sum)) { sum = sum.toString().split('').map(Number).reduce((a, b) => a + b, 0); }
    return sum;
  };

  const calculateNameNumber = (name: string) => {
    const values: Record<string, number> = { a:1,b:2,c:3,d:4,e:5,f:6,g:7,h:8,i:9,j:1,k:2,l:3,m:4,n:5,o:6,p:7,q:8,r:9,s:1,t:2,u:3,v:4,w:5,x:6,y:7,z:8 };
    let sum = name.toLowerCase().split('').reduce((acc, ch) => acc + (values[ch] || 0), 0);
    while (sum > 9 && ![11, 22, 33].includes(sum)) { sum = sum.toString().split('').map(Number).reduce((a, b) => a + b, 0); }
    return sum;
  };

  const readingMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const lifePathNumber = calculateLifePath(birthDate);
      const destinyNumber = calculateNameNumber(fullName);
      const soulUrgeNumber = calculateNameNumber(fullName.replace(/[^aeiouAEIOU]/g, ''));
      const personalityNumber = calculateNameNumber(fullName.replace(/[aeiouAEIOU]/g, ''));
      const { data, error } = await supabase.functions.invoke('astrology-reading', {
        body: { type: 'numerology', data: { fullName, birthDate, lifePathNumber, destinyNumber, soulUrgeNumber, personalityNumber } }
      });
      if (error) throw error;
      await supabase.from('numerology_readings').insert([{
        user_id: user.id, full_name: fullName, birth_date: birthDate, life_path_number: lifePathNumber,
        destiny_number: destinyNumber, soul_urge_number: soulUrgeNumber, personality_number: personalityNumber,
        interpretation: data.interpretation, lucky_numbers: data.luckyNumbers, is_premium: false
      }]);
      return { ...data, lifePathNumber, destinyNumber, soulUrgeNumber, personalityNumber };
    },
    onSuccess: (data) => { setResult(data); toast.success('Numbers revealed! 🔢'); },
    onError: (error: any) => { toast.error(error.message || 'Failed to calculate'); }
  });

  const numberCards = result ? [
    { label: "Life Path", value: result.lifePathNumber, gradient: "from-amber-500 to-yellow-400" },
    { label: "Destiny", value: result.destinyNumber, gradient: "from-purple-500 to-violet-400" },
    { label: "Soul Urge", value: result.soulUrgeNumber, gradient: "from-pink-500 to-rose-400" },
    { label: "Personality", value: result.personalityNumber, gradient: "from-blue-500 to-cyan-400" },
  ] : [];

  return (
    <>
      <FloatingHowItWorks
        title='Numerology Calculator'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Numerology Calculator panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-4">
      <Card className="p-5 bg-card/90 backdrop-blur-xl border-border/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500" />
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="h-5 w-5 text-pink-500" />
          <h3 className="text-lg font-black text-foreground">Numerology Calculator</h3>
        </div>
        <div className="space-y-3">
          <div>
            <Label className="text-xs font-bold">Full Name</Label>
            <Input placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-muted/30 border-border/30" />
          </div>
          <div>
            <Label className="text-xs font-bold">Birth Date</Label>
            <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="bg-muted/30 border-border/30" />
          </div>
          <Button onClick={() => readingMutation.mutate()} disabled={!fullName || !birthDate || readingMutation.isPending}
            className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold">
            {readingMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Calculating...</> : <>🔢 Calculate Numbers</>}
          </Button>
        </div>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-5 bg-card/90 backdrop-blur-xl border-border/30 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-blue-500" />
            <h4 className="text-sm font-black text-foreground">Your Core Numbers</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {numberCards.map((n, i) => (
                <motion.div key={n.label} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1, type: "spring" }}
                  className="text-center p-3 bg-muted/30 rounded-xl border border-border/30 relative overflow-hidden">
                  <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${n.gradient}`} />
                  <p className="text-[10px] text-muted-foreground mb-1">{n.label}</p>
                  <p className="text-3xl font-black text-foreground">{n.value}</p>
                </motion.div>
              ))}
            </div>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{result.interpretation}</p>
            {result.luckyNumbers && (
              <div>
                <h4 className="text-xs font-bold text-foreground mb-2">Lucky Numbers</h4>
                <div className="flex gap-1.5 flex-wrap">
                  {result.luckyNumbers.map((num: number) => (
                    <span key={num} className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-sm font-bold text-primary">{num}</span>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      )}
    </div>
    </>
  );
};
