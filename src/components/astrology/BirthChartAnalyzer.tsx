import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Eye, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const ZODIAC_SIGNS = [
  { value: 'aries', label: 'Aries ♈' }, { value: 'taurus', label: 'Taurus ♉' },
  { value: 'gemini', label: 'Gemini ♊' }, { value: 'cancer', label: 'Cancer ♋' },
  { value: 'leo', label: 'Leo ♌' }, { value: 'virgo', label: 'Virgo ♍' },
  { value: 'libra', label: 'Libra ♎' }, { value: 'scorpio', label: 'Scorpio ♏' },
  { value: 'sagittarius', label: 'Sagittarius ♐' }, { value: 'capricorn', label: 'Capricorn ♑' },
  { value: 'aquarius', label: 'Aquarius ♒' }, { value: 'pisces', label: 'Pisces ♓' }
] as const;

type ZodiacSign = typeof ZODIAC_SIGNS[number]['value'];

export const BirthChartAnalyzer = () => {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [sunSign, setSunSign] = useState<ZodiacSign | ''>('');
  const [moonSign, setMoonSign] = useState<ZodiacSign | ''>('');
  const [risingSign, setRisingSign] = useState<ZodiacSign | ''>('');
  const [result, setResult] = useState<any>(null);

  const { data: birthCharts } = useQuery({
    queryKey: ['birth-charts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('birth_charts').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      if (!sunSign) throw new Error('Sun sign required');
      const { data, error } = await supabase.functions.invoke('astrology-reading', {
        body: { type: 'birth_chart', data: { sunSign, moonSign, risingSign, birthPlace, birthDate, birthTime } }
      });
      if (error) throw error;
      await supabase.from('birth_charts').insert([{
        user_id: user.id, name, birth_date: birthDate, birth_time: birthTime || null,
        birth_place: birthPlace, sun_sign: sunSign, moon_sign: moonSign || null,
        rising_sign: risingSign || null, chart_data: { interpretation: data.interpretation }
      }]);
      return data;
    },
    onSuccess: (data) => { setResult(data); toast.success('Chart revealed! 🌌'); },
    onError: (error: any) => { toast.error(error.message || 'Failed to analyze'); }
  });

  return (
    <>
      <FloatingHowItWorks
        title='Birth Chart Analyzer'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Birth Chart Analyzer panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-4">
      <Card className="p-5 bg-card/90 backdrop-blur-xl border-border/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500" />
        <div className="flex items-center gap-2 mb-4">
          <Eye className="h-5 w-5 text-violet-500" />
          <h3 className="text-lg font-black text-foreground">Birth Chart Analysis</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div><Label className="text-xs font-bold">Name</Label><Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="bg-muted/30 border-border/30" /></div>
          <div><Label className="text-xs font-bold">Birth Place</Label><Input placeholder="City, Country" value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)} className="bg-muted/30 border-border/30" /></div>
          <div><Label className="text-xs font-bold">Birth Date</Label><Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="bg-muted/30 border-border/30" /></div>
          <div><Label className="text-xs font-bold">Birth Time (Optional)</Label><Input type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} className="bg-muted/30 border-border/30" /></div>
          <div><Label className="text-xs font-bold">Sun Sign</Label>
            <Select value={sunSign} onValueChange={setSunSign as (v: string) => void}>
              <SelectTrigger className="bg-muted/30 border-border/30"><SelectValue placeholder="Choose..." /></SelectTrigger>
              <SelectContent>{ZODIAC_SIGNS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs font-bold">Moon Sign (Optional)</Label>
            <Select value={moonSign} onValueChange={setMoonSign as (v: string) => void}>
              <SelectTrigger className="bg-muted/30 border-border/30"><SelectValue placeholder="Choose..." /></SelectTrigger>
              <SelectContent>{ZODIAC_SIGNS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2"><Label className="text-xs font-bold">Rising Sign (Optional)</Label>
            <Select value={risingSign} onValueChange={setRisingSign as (v: string) => void}>
              <SelectTrigger className="bg-muted/30 border-border/30"><SelectValue placeholder="Choose..." /></SelectTrigger>
              <SelectContent>{ZODIAC_SIGNS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={() => analyzeMutation.mutate()} disabled={!name || !birthDate || !birthPlace || !sunSign || analyzeMutation.isPending}
          className="w-full mt-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold">
          {analyzeMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</> : <>🌌 Analyze Birth Chart</>}
        </Button>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-5 bg-card/90 backdrop-blur-xl border-border/30 space-y-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-500" />
            <h4 className="text-sm font-black text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-500" /> Chart Analysis
            </h4>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{result.interpretation}</p>
          </Card>
        </motion.div>
      )}

      {birthCharts && birthCharts.length > 0 && (
        <Card className="p-5 bg-card/90 backdrop-blur-xl border-border/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500/50 to-purple-500/50" />
          <h4 className="text-sm font-black text-foreground mb-3">Saved Charts</h4>
          <div className="space-y-2">
            {birthCharts.map((chart) => (
              <div key={chart.id} className="p-3 bg-muted/30 rounded-xl flex justify-between items-center border border-border/30">
                <div>
                  <p className="text-sm font-bold text-foreground">{chart.name}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(chart.birth_date).toLocaleDateString()} • {chart.birth_place}</p>
                </div>
                <Badge variant="secondary" className="text-xs">{ZODIAC_SIGNS.find(s => s.value === chart.sun_sign)?.label}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
    </>
  );
};
