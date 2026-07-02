import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Star, Hash, Flame, Droplets, Wind, Mountain, Sparkles, Loader2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const ZODIAC_SIGNS = [
  { value: 'aries', label: 'Aries ♈', element: 'Fire', emoji: '🐏' },
  { value: 'taurus', label: 'Taurus ♉', element: 'Earth', emoji: '🐂' },
  { value: 'gemini', label: 'Gemini ♊', element: 'Air', emoji: '👯' },
  { value: 'cancer', label: 'Cancer ♋', element: 'Water', emoji: '🦀' },
  { value: 'leo', label: 'Leo ♌', element: 'Fire', emoji: '🦁' },
  { value: 'virgo', label: 'Virgo ♍', element: 'Earth', emoji: '👰' },
  { value: 'libra', label: 'Libra ♎', element: 'Air', emoji: '⚖️' },
  { value: 'scorpio', label: 'Scorpio ♏', element: 'Water', emoji: '🦂' },
  { value: 'sagittarius', label: 'Sagittarius ♐', element: 'Fire', emoji: '🏹' },
  { value: 'capricorn', label: 'Capricorn ♑', element: 'Earth', emoji: '🐐' },
  { value: 'aquarius', label: 'Aquarius ♒', element: 'Air', emoji: '🏺' },
  { value: 'pisces', label: 'Pisces ♓', element: 'Water', emoji: '🐟' },
];

const ELEMENT_ICONS: Record<string, typeof Flame> = { Fire: Flame, Water: Droplets, Air: Wind, Earth: Mountain };

const calculateLifePath = (date: string) => {
  if (!date) return 0;
  const digits = date.replace(/-/g, '').split('').map(Number);
  let sum = digits.reduce((a, b) => a + b, 0);
  while (sum > 9 && ![11, 22, 33].includes(sum)) {
    sum = sum.toString().split('').map(Number).reduce((a, b) => a + b, 0);
  }
  return sum;
};

export const MysticalProfile = () => {
  const [birthDate, setBirthDate] = useState("");
  const [zodiacSign, setZodiacSign] = useState("");
  const [showProfile, setShowProfile] = useState(false);

  const { data: readingHistory } = useQuery({
    queryKey: ['astrology-reading-history'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { tarot: 0, horoscopes: 0, dreams: 0, runes: 0 };

      const [tarot, horoscopes, dreams, runes] = await Promise.all([
        supabase.from('tarot_readings').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('daily_horoscopes').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('dream_interpretations').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('rune_readings').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);

      return {
        tarot: tarot.count || 0,
        horoscopes: horoscopes.count || 0,
        dreams: dreams.count || 0,
        runes: runes.count || 0,
      };
    }
  });

  const signData = ZODIAC_SIGNS.find(s => s.value === zodiacSign);
  const lifePathNumber = calculateLifePath(birthDate);
  const ElementIcon = signData ? ELEMENT_ICONS[signData.element] || Star : Star;
  const totalReadings = readingHistory ? (readingHistory.tarot + readingHistory.horoscopes + readingHistory.dreams + readingHistory.runes) : 0;

  return (
    <>
      <FloatingHowItWorks
        title='Mystical Profile'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Mystical Profile panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <Card className="p-5 sm:p-6 bg-card/90 backdrop-blur-xl border-border/30 overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500" />

      <div className="flex items-center gap-2 mb-4">
        <User className="h-5 w-5 text-purple-500" />
        <h3 className="text-lg font-black text-foreground">Mystical Profile</h3>
      </div>

      {!showProfile ? (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Birth Date</Label>
            <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="bg-muted/50" />
          </div>
          <div>
            <Label className="text-xs">Zodiac Sign</Label>
            <Select value={zodiacSign} onValueChange={setZodiacSign}>
              <SelectTrigger className="bg-muted/50"><SelectValue placeholder="Select sign..." /></SelectTrigger>
              <SelectContent>
                {ZODIAC_SIGNS.map(s => <SelectItem key={s.value} value={s.value}>{s.emoji} {s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => { if (birthDate && zodiacSign) setShowProfile(true); else toast.error("Fill in all fields"); }}
            disabled={!birthDate || !zodiacSign}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
            Reveal Profile ✨
          </Button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
              className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center mb-2">
              <span className="text-3xl">{signData?.emoji}</span>
            </motion.div>
            <h4 className="font-bold text-foreground">{signData?.label}</h4>
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <ElementIcon className="w-3 h-3" /> {signData?.element} Element
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted/50 rounded-lg p-2.5 text-center border border-border/30">
              <Hash className="w-3.5 h-3.5 mx-auto text-amber-500 mb-1" />
              <p className="text-xs text-muted-foreground">Life Path</p>
              <p className="text-lg font-black text-foreground">{lifePathNumber}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-2.5 text-center border border-border/30">
              <Sparkles className="w-3.5 h-3.5 mx-auto text-purple-500 mb-1" />
              <p className="text-xs text-muted-foreground">Total Readings</p>
              <p className="text-lg font-black text-foreground">{totalReadings}</p>
            </div>
          </div>

          {readingHistory && totalReadings > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground">Reading History</p>
              {[
                { label: "Tarot", count: readingHistory.tarot, color: "bg-amber-500" },
                { label: "Horoscopes", count: readingHistory.horoscopes, color: "bg-purple-500" },
                { label: "Dreams", count: readingHistory.dreams, color: "bg-blue-500" },
                { label: "Runes", count: readingHistory.runes, color: "bg-emerald-500" },
              ].filter(r => r.count > 0).map(r => (
                <div key={r.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${r.color}`} />
                    <span className="text-muted-foreground">{r.label}</span>
                  </div>
                  <span className="font-bold text-foreground">{r.count}</span>
                </div>
              ))}
            </div>
          )}

          <Button variant="ghost" size="sm" onClick={() => setShowProfile(false)} className="w-full text-xs">
            Edit Profile
          </Button>
        </motion.div>
      )}
    </Card>
    </>
  );
};
