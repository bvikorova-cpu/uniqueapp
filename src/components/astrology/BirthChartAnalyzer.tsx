import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, MapPin } from "lucide-react";
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
      const { data, error } = await supabase
        .from('birth_charts')
        .select('*')
        .order('created_at', { ascending: false });
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
        body: {
          type: 'birth_chart',
          data: {
            sunSign,
            moonSign,
            risingSign,
            birthPlace,
            birthDate,
            birthTime
          }
        }
      });

      if (error) throw error;

      const chartData = {
        user_id: user.id,
        name,
        birth_date: birthDate,
        birth_time: birthTime || null,
        birth_place: birthPlace,
        sun_sign: sunSign,
        moon_sign: moonSign || null,
        rising_sign: risingSign || null,
        chart_data: { interpretation: data.interpretation }
      };

      await supabase.from('birth_charts').insert([chartData]);
      return data;
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success('Birth chart analysis complete!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to analyze birth chart');
    }
  });

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-green-500" />
            <h3 className="text-xl font-semibold">Birth Chart Analysis</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="birthPlace">Birth Place</Label>
              <Input
                id="birthPlace"
                placeholder="City, Country"
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="birthDate">Birth Date</Label>
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="birthTime">Birth Time (Optional)</Label>
              <Input
                id="birthTime"
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="sunSign">Sun Sign</Label>
              <Select value={sunSign} onValueChange={setSunSign as (value: string) => void}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose..." />
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
              <Label htmlFor="moonSign">Moon Sign (Optional)</Label>
              <Select value={moonSign} onValueChange={setMoonSign as (value: string) => void}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose..." />
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

            <div className="md:col-span-2">
              <Label htmlFor="risingSign">Rising Sign (Optional)</Label>
              <Select value={risingSign} onValueChange={setRisingSign as (value: string) => void}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose..." />
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
            onClick={() => analyzeMutation.mutate()}
            disabled={!name || !birthDate || !birthPlace || !sunSign || analyzeMutation.isPending}
            className="w-full"
          >
            {analyzeMutation.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing chart...</>
            ) : (
              <>Analyze Birth Chart</>
            )}
          </Button>
        </div>
      </Card>

      {result && (
        <Card className="p-6 space-y-4">
          <h4 className="font-semibold text-lg">Your Birth Chart Analysis</h4>
          <div className="prose prose-sm max-w-none">
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">{result.interpretation}</p>
          </div>
        </Card>
      )}

      {birthCharts && birthCharts.length > 0 && (
        <Card className="p-6">
          <h4 className="font-semibold mb-4">Saved Birth Charts</h4>
          <div className="space-y-2">
            {birthCharts.map((chart) => (
              <div key={chart.id} className="p-3 bg-muted rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-medium">{chart.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(chart.birth_date).toLocaleDateString()} • {chart.birth_place}
                  </p>
                </div>
                <Badge>{ZODIAC_SIGNS.find(s => s.value === chart.sun_sign)?.label}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
