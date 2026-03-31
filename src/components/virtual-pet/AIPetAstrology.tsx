import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Moon, Loader2, Sparkles, Star } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Props { onBack: () => void; }

const zodiacSigns = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const species = ["Dog", "Cat", "Dragon", "Phoenix", "Unicorn", "Wolf", "Fox", "Rabbit", "Parrot", "Hamster"];

export const AIPetAstrology = ({ onBack }: Props) => {
  const [petName, setPetName] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [reading, setReading] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { useCredit } = useAICredits();

  const handleReading = async () => {
    if (!petName || !selectedSpecies || !birthMonth) return toast.error("Fill in all required fields");

    const hasCredits = await useCredit("custom_generation", "Pet Astrology");
    if (!hasCredits) return toast.error("Not enough credits! Purchase more to continue.");

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("pet-astrology", {
        body: { petName, species: selectedSpecies, birthMonth, birthDay: birthDay || "15" },
      });
      if (error) throw error;
      setReading(data);
      toast.success("Horoscope revealed!");
    } catch (e: any) {
      toast.error(e.message || "Reading failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" />Back to Dashboard</Button>

      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20">
          <Star className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-black">AI Pet Astrology</h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Discover your pet's cosmic destiny based on their adoption date. Get personality insights, lucky days, and compatibility with other zodiac pets.
        </p>
        <span className="inline-block text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">4 Credits per reading</span>
      </div>

      <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Moon className="w-5 h-5" />Pet Birth Chart</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input value={petName} onChange={e => setPetName(e.target.value)} placeholder="Pet name..." />
          <Select value={selectedSpecies} onValueChange={setSelectedSpecies}>
            <SelectTrigger><SelectValue placeholder="Species..." /></SelectTrigger>
            <SelectContent>{species.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Select value={birthMonth} onValueChange={setBirthMonth}>
              <SelectTrigger><SelectValue placeholder="Birth month..." /></SelectTrigger>
              <SelectContent>
                {["January","February","March","April","May","June","July","August","September","October","November","December"].map(m =>
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                )}
              </SelectContent>
            </Select>
            <Input type="number" min="1" max="31" value={birthDay} onChange={e => setBirthDay(e.target.value)} placeholder="Day (1-31)" />
          </div>
          <Button onClick={handleReading} disabled={loading} className="w-full gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Reading stars..." : "Generate Horoscope"}
          </Button>
        </CardContent>
      </Card>

      {reading && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
            <CardContent className="p-6 space-y-4">
              <div className="text-center">
                <p className="text-3xl mb-1">{reading.zodiac_emoji}</p>
                <h3 className="font-black text-xl">{reading.zodiac_sign}</h3>
                <p className="text-xs text-muted-foreground">{reading.element} Element • {reading.ruling_planet}</p>
              </div>

              {[
                { label: "🌟 Personality Profile", value: reading.personality },
                { label: "💫 Daily Horoscope", value: reading.daily_horoscope },
                { label: "❤️ Love & Compatibility", value: reading.compatibility },
                { label: "🍀 Lucky Traits", value: reading.lucky_traits },
                { label: "⚔️ Battle Prediction", value: reading.battle_prediction },
                { label: "🔮 Cosmic Advice", value: reading.cosmic_advice },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-lg bg-background/80 border border-border/40">
                  <p className="text-xs font-bold mb-1">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground">{item.value}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};
