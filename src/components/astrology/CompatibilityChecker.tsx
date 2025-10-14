import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Loader2, Heart } from "lucide-react";
import { toast } from "sonner";

const ZODIAC_SIGNS = [
  { value: 'aries', label: 'Aries ♈' },
  { value: 'taurus', label: 'Taurus ♉' },
  { value: 'gemini', label: 'Gemini ♊' },
  { value: 'cancer', label: 'Cancer ♋' },
  { value: 'leo', label: 'Leo ♌' },
  { value: 'virgo', label: 'Virgo ♍' },
  { value: 'libra', label: 'Libra ♎' },
  { value: 'scorpio', label: 'Scorpio ♏' },
  { value: 'sagittarius', label: 'Sagittarius ♐' },
  { value: 'capricorn', label: 'Capricorn ♑' },
  { value: 'aquarius', label: 'Aquarius ♒' },
  { value: 'pisces', label: 'Pisces ♓' }
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
        body: {
          type: 'compatibility',
          data: { sign1, sign2 }
        }
      });

      if (error) throw error;

      const compatData = {
        user_id: user.id,
        sign1,
        sign2,
        compatibility_score: data.compatibilityScore,
        analysis: data.analysis,
        strengths: data.strengths,
        challenges: data.challenges,
        advice: data.advice,
        is_premium: false
      };

      await supabase.from('compatibility_readings').insert([compatData]);
      return data;
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success('Compatibility analysis complete!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to analyze compatibility');
    }
  });

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Love Compatibility Analyzer
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">First Sign</label>
              <Select value={sign1} onValueChange={(v) => setSign1(v as ZodiacSign)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose sign..." />
                </SelectTrigger>
                <SelectContent>
                  {ZODIAC_SIGNS.map((sign) => (
                    <SelectItem key={sign.value} value={sign.value}>
                      {sign.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Second Sign</label>
              <Select value={sign2} onValueChange={(v) => setSign2(v as ZodiacSign)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose sign..." />
                </SelectTrigger>
                <SelectContent>
                  {ZODIAC_SIGNS.map((sign) => (
                    <SelectItem key={sign.value} value={sign.value}>
                      {sign.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={() => checkMutation.mutate()}
            disabled={!sign1 || !sign2 || checkMutation.isPending}
            className="w-full"
          >
            {checkMutation.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing compatibility...</>
            ) : (
              <>Check Compatibility</>
            )}
          </Button>
        </div>
      </Card>

      {result && (
        <Card className="p-6 space-y-6">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-pink-500 to-purple-600">
              <span className="text-5xl font-bold text-white">{result.compatibilityScore}%</span>
            </div>
            <h3 className="text-2xl font-bold">
              {ZODIAC_SIGNS.find(s => s.value === sign1)?.label} ❤️ {ZODIAC_SIGNS.find(s => s.value === sign2)?.label}
            </h3>
            <Progress value={result.compatibilityScore} className="h-3" />
          </div>

          <div className="prose prose-sm max-w-none">
            <p className="text-foreground leading-relaxed">{result.analysis}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-green-600 dark:text-green-400">💪 Strengths</h4>
              <ul className="space-y-2">
                {result.strengths?.map((strength: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-amber-600 dark:text-amber-400">⚠️ Challenges</h4>
              <ul className="space-y-2">
                {result.challenges?.map((challenge: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">!</span>
                    <span className="text-sm">{challenge}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {result.advice && (
            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-2">💡 Relationship Advice</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{result.advice}</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
