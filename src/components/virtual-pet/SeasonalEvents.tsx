import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, CalendarHeart, Loader2, Sparkles, Gift, Snowflake, Sun, Leaf, Flower } from "lucide-react";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { motion } from "framer-motion";

interface Props { onBack: () => void; }

const seasons = [
  { id: "spring", name: "Spring Festival", icon: Flower, color: "text-pink-400", desc: "Cherry blossom pets & garden quests" },
  { id: "summer", name: "Summer Beach Bash", icon: Sun, color: "text-amber-400", desc: "Tropical pets & surfing challenges" },
  { id: "autumn", name: "Autumn Harvest", icon: Leaf, color: "text-orange-400", desc: "Harvest pets & pumpkin adventures" },
  { id: "winter", name: "Winter Wonderland", icon: Snowflake, color: "text-cyan-400", desc: "Ice pets & holiday gift exchanges" },
];

export const SeasonalEvents = ({ onBack }: Props) => {
  const [selectedSeason, setSelectedSeason] = useState("");
  const [selectedPetId, setSelectedPetId] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { credits, useCredit } = useAICredits();

  const { data: pets } = useQuery({
    queryKey: ['my-pets'],
    queryFn: async () => {
      const { data, error } = await supabase.from('pets').select('*, pet_types(*)').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const joinEvent = async () => {
    if (!selectedSeason) return toast.error("Select a seasonal event");
    if (!selectedPetId) return toast.error("Select a pet to participate");
    if (credits.credits_remaining < 5) return toast.error("Not enough credits (5 required)");

    setLoading(true);
    try {
      const pet = pets?.find(p => p.id === selectedPetId);
      const season = seasons.find(s => s.id === selectedSeason);
      const { data, error } = await supabase.functions.invoke('pet-seasonal-event', {
        body: {
          petName: pet?.name,
          species: pet?.pet_types?.species,
          level: pet?.level,
          happiness: pet?.happiness,
          energy: pet?.energy,
          seasonName: season?.name,
          seasonId: selectedSeason
        }
      });
      if (error) throw error;
      for (let i = 0; i < 5; i++) await useCredit("custom_generation", "Seasonal Event");
      setResult(data.result);
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="w-4 h-4" />Back to Dashboard</Button>
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-2">
          <CalendarHeart className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Seasonal Events</h2>
        <p className="text-muted-foreground text-sm">Join limited-time seasonal adventures with exclusive rewards</p>
        <p className="text-xs text-primary font-semibold">5 Credits per event</p>
      </div>

      {/* Season Cards */}
      <div className="grid grid-cols-2 gap-3">
        {seasons.map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
            <Card className={`border-border/40 bg-card/80 backdrop-blur-sm cursor-pointer transition-all active:scale-[0.97] ${selectedSeason === s.id ? "border-primary ring-1 ring-primary/30" : "hover:border-primary/30"}`}
              onClick={() => setSelectedSeason(s.id)}>
              <CardContent className="p-4 text-center space-y-2">
                <s.icon className={`w-8 h-8 mx-auto ${s.color}`} />
                <h3 className="font-bold text-xs">{s.name}</h3>
                <p className="text-[10px] text-muted-foreground">{s.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="border-border/40 bg-card/80 backdrop-blur-xl">
        <CardContent className="p-6 space-y-4">
          <Select value={selectedPetId} onValueChange={setSelectedPetId}>
            <SelectTrigger><SelectValue placeholder="Select pet to join event..." /></SelectTrigger>
            <SelectContent>
              {pets?.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name} (Lv.{p.level} {p.pet_types?.name})</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={joinEvent} disabled={loading || !selectedSeason || !selectedPetId} className="w-full gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
            Join Seasonal Event
          </Button>
        </CardContent>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-background">
            <CardContent className="p-6">
              <h3 className="font-bold mb-3 flex items-center gap-2"><Sparkles className="w-5 h-5 text-emerald-500" />Event Adventure</h3>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{result}</div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};
