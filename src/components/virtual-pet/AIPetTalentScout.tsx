import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, Loader2, Sparkles, Gem } from "lucide-react";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { motion } from "framer-motion";

interface Props { onBack: () => void; }

export const AIPetTalentScout = ({ onBack }: Props) => {
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

  const scout = async () => {
    if (!selectedPetId) return toast.error("Select a pet first");
    if (credits.credits_remaining < 5) return toast.error("Not enough credits (5 required)");
    setLoading(true);
    try {
      const pet = pets?.find(p => p.id === selectedPetId);
      const { data, error } = await supabase.functions.invoke('pet-talent-scout', {
        body: {
          petName: pet?.name, species: pet?.pet_types?.species, level: pet?.level,
          happiness: pet?.happiness, energy: pet?.energy, hunger: pet?.hunger,
          experience: pet?.experience, battleWins: pet?.battle_wins, battleLosses: pet?.battle_losses
        }
      });
      if (error) throw error;
      for (let i = 0; i < 5; i++) await useCredit("custom_generation", "AI Pet Talent Scout");
      setResult(data.result);
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="w-4 h-4" />Back to Dashboard</Button>
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 mb-2">
          <Search className="w-8 h-8 text-teal-500" />
        </div>
        <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">AI Talent Scout</h2>
        <p className="text-muted-foreground text-sm">Discover hidden abilities, special moves & rare talents</p>
        <p className="text-xs text-primary font-semibold">5 Credits per scouting report</p>
      </div>

      <Card className="border-border/40 bg-card/80 backdrop-blur-xl">
        <CardContent className="p-6 space-y-4">
          <Select value={selectedPetId} onValueChange={setSelectedPetId}>
            <SelectTrigger><SelectValue placeholder="Select pet to scout..." /></SelectTrigger>
            <SelectContent>
              {pets?.map(p => <SelectItem key={p.id} value={p.id}>{p.name} (Lv.{p.level} {p.pet_types?.name})</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={scout} disabled={loading || !selectedPetId} className="w-full gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gem className="w-4 h-4" />}
            Scout Hidden Talents
          </Button>
        </CardContent>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="border-teal-500/20 bg-gradient-to-br from-teal-500/5 to-background">
            <CardContent className="p-6">
              <h3 className="font-bold mb-3 flex items-center gap-2"><Gem className="w-5 h-5 text-teal-500" />Talent Report</h3>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{result}</div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};
