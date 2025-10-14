import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calculator } from "lucide-react";
import { toast } from "sonner";

export const NumerologyCalculator = () => {
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [result, setResult] = useState<any>(null);

  const calculateLifePath = (date: string) => {
    const digits = date.replace(/-/g, '').split('').map(Number);
    let sum = digits.reduce((a, b) => a + b, 0);
    while (sum > 9 && ![11, 22, 33].includes(sum)) {
      sum = sum.toString().split('').map(Number).reduce((a, b) => a + b, 0);
    }
    return sum;
  };

  const calculateNameNumber = (name: string) => {
    const values: { [key: string]: number } = {
      a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
      j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
      s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8
    };
    
    let sum = name.toLowerCase().split('').reduce((acc, char) => {
      return acc + (values[char] || 0);
    }, 0);
    
    while (sum > 9 && ![11, 22, 33].includes(sum)) {
      sum = sum.toString().split('').map(Number).reduce((a, b) => a + b, 0);
    }
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
        body: {
          type: 'numerology',
          data: {
            fullName,
            birthDate,
            lifePathNumber,
            destinyNumber,
            soulUrgeNumber,
            personalityNumber
          }
        }
      });

      if (error) throw error;

      const numData = {
        user_id: user.id,
        full_name: fullName,
        birth_date: birthDate,
        life_path_number: lifePathNumber,
        destiny_number: destinyNumber,
        soul_urge_number: soulUrgeNumber,
        personality_number: personalityNumber,
        interpretation: data.interpretation,
        lucky_numbers: data.luckyNumbers,
        is_premium: false
      };

      await supabase.from('numerology_readings').insert([numData]);
      return { ...data, lifePathNumber, destinyNumber, soulUrgeNumber, personalityNumber };
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success('Numerology reading complete!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to calculate numerology');
    }
  });

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="h-5 w-5 text-blue-500" />
            <h3 className="text-xl font-semibold">Numerology Calculator</h3>
          </div>

          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
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

          <Button
            onClick={() => readingMutation.mutate()}
            disabled={!fullName || !birthDate || readingMutation.isPending}
            className="w-full"
          >
            {readingMutation.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Calculating...</>
            ) : (
              <>Calculate Numerology</>
            )}
          </Button>
        </div>
      </Card>

      {result && (
        <Card className="p-6 space-y-6">
          <h4 className="font-semibold text-lg">Your Numbers</h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Life Path</p>
              <p className="text-3xl font-bold text-primary">{result.lifePathNumber}</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Destiny</p>
              <p className="text-3xl font-bold text-primary">{result.destinyNumber}</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Soul Urge</p>
              <p className="text-3xl font-bold text-primary">{result.soulUrgeNumber}</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Personality</p>
              <p className="text-3xl font-bold text-primary">{result.personalityNumber}</p>
            </div>
          </div>

          <div className="prose prose-sm max-w-none">
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">{result.interpretation}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Your Lucky Numbers</h4>
            <div className="flex gap-2 flex-wrap">
              {result.luckyNumbers?.map((num: number) => (
                <Badge key={num} variant="outline" className="text-lg px-4 py-2">
                  {num}
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
