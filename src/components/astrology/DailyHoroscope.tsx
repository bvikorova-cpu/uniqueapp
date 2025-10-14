import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Star, Heart, Briefcase, Activity } from "lucide-react";
import { toast } from "sonner";

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
      const { data, error } = await supabase
        .from('daily_horoscopes')
        .select('*')
        .eq('zodiac_sign', selectedSign)
        .eq('date', today)
        .maybeSingle();
      
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
        body: {
          type: 'daily_horoscope',
          data: {
            zodiacSign: selectedSign,
            date: today
          }
        }
      });

      if (error) throw error;

      const horoscopeData = {
        user_id: user.id,
        zodiac_sign: selectedSign,
        date: today,
        content: data.content,
        lucky_numbers: data.luckyNumbers,
        lucky_colors: data.luckyColors,
        compatibility_signs: data.compatibilitySigns,
        mood_score: data.moodScore,
        love_score: data.loveScore,
        career_score: data.careerScore,
        health_score: data.healthScore,
        is_premium: false
      };

      const { data: savedData, error: saveError } = await supabase
        .from('daily_horoscopes')
        .insert([horoscopeData])
        .select()
        .single();

      if (saveError) throw saveError;
      return savedData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-horoscope'] });
      toast.success('Daily horoscope generated!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to generate horoscope');
    }
  });

  const signData = ZODIAC_SIGNS.find(s => s.value === selectedSign);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Your Zodiac Sign</label>
            <Select value={selectedSign} onValueChange={(v) => setSelectedSign(v as ZodiacSign)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose your sign..." />
              </SelectTrigger>
              <SelectContent>
                {ZODIAC_SIGNS.map((sign) => (
                  <SelectItem key={sign.value} value={sign.value}>
                    {sign.emoji} {sign.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedSign && !todayHoroscope && (
            <Button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="w-full"
            >
              {generateMutation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Consulting the stars...</>
              ) : (
                <>Get Today's Horoscope</>
              )}
            </Button>
          )}
        </div>
      </Card>

      {todayHoroscope && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">{signData?.emoji} {signData?.label}</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(todayHoroscope.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          <div className="prose prose-sm max-w-none">
            <p className="text-foreground leading-relaxed">{todayHoroscope.content}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>Mood</span>
              </div>
              <Progress value={todayHoroscope.mood_score * 10} className="h-2" />
              <p className="text-xs text-muted-foreground">{todayHoroscope.mood_score}/10</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Heart className="h-4 w-4 text-red-500" />
                <span>Love</span>
              </div>
              <Progress value={todayHoroscope.love_score * 10} className="h-2" />
              <p className="text-xs text-muted-foreground">{todayHoroscope.love_score}/10</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Briefcase className="h-4 w-4 text-blue-500" />
                <span>Career</span>
              </div>
              <Progress value={todayHoroscope.career_score * 10} className="h-2" />
              <p className="text-xs text-muted-foreground">{todayHoroscope.career_score}/10</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Activity className="h-4 w-4 text-green-500" />
                <span>Health</span>
              </div>
              <Progress value={todayHoroscope.health_score * 10} className="h-2" />
              <p className="text-xs text-muted-foreground">{todayHoroscope.health_score}/10</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <h4 className="font-semibold mb-2">Lucky Numbers</h4>
              <div className="flex gap-2 flex-wrap">
                {todayHoroscope.lucky_numbers?.map((num: number) => (
                  <Badge key={num} variant="outline" className="text-lg">
                    {num}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Lucky Colors</h4>
              <div className="flex gap-2 flex-wrap">
                {todayHoroscope.lucky_colors?.map((color: string) => (
                  <Badge key={color} variant="secondary">
                    {color}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
