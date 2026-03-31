import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Zap, Loader2, Sparkles, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { motion } from "framer-motion";

interface Props { onBack: () => void; }

export const AIPetEvolutionAdvisor = ({ onBack }: Props) => {
  const [selectedPetId, setSelectedPetId] = useState("");
  const [strategy, setStrategy] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { credits, useCredit } = useAICredits();

  const strategies = ["Fastest Evolution", "Strongest Form", "Rarest Mutation", "Balanced Stats", "Elemental Mastery", "Legendary Path"];

  const { data: pets } = useQuery({
    queryKey: ['my-pets'],
    queryFn: async () => {
      const { data, error } = await supabase.from('pets').select('*, pet_types(*)').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const analyze = async () => {
    if (!selectedPetId) return toast.error("Select a pet first");
    if (!strategy) return toast.error("Choose an evolution strategy");
    if (credits.credits_remaining < 5) return toast.error("Not enough credits (5 required)");
    setLoading(true);
    try {
      const pet = pets?.find(p => p.id === selectedPetId);
      const { data, error } = await supabase.functions.invoke('pet-evolution-advisor', {
        body: {
          petName: pet?.name, species: pet?.pet_types?.species, level: pet?.level,
          happiness: pet?.happiness, energy: pet?.energy, hunger: pet?.hunger,
          experience: pet?.experience, battleWins: pet?.battle_wins, battleLosses: pet?.battle_losses,
          strategy
        }
      });
      if (error) throw error;
      for (let i = 0; i < 5; i++) await useCredit("custom_generation", "AI Pet Evolution Advisor");
      setResult(data.result);
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="w-4 h-4" />Back to Dashboard</Button>
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-2">
          <Zap className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">AI Evolution Advisor</h2>
        <p className="text-muted-foreground text-sm">Predict optimal evolution paths & unlock hidden forms</p>
        <p className="text-xs text-primary font-semibold">5 Credits per analysis</p>
      </div>

      <Card className="border-border/40 bg-card/80 backdrop-blur-xl">
        <CardContent className="p-6 space-y-4">
          <Select value={selectedPetId} onValueChange={setSelectedPetId}>
            <SelectTrigger><SelectValue placeholder="Select your pet..." /></SelectTrigger>
            <SelectContent>
              {pets?.map(p => <SelectItem key={p.id} value={p.id}>{p.name} (Lv.{p.level} {p.pet_types?.name})</SelectItem>)}
            </SelectContent>
          </Select>
          <div>
            <p className="text-sm font-semibold mb-2">Evolution Strategy:</p>
            <div className="grid grid-cols-2 gap-2">
              {strategies.map(s => (
                <Button key={s} variant={strategy === s ? "default" : "outline"} size="sm"
                  className="text-xs justify-start" onClick={() => setStrategy(s)}>
                  <TrendingUp className="w-3 h-3 mr-1" />{s}
                </Button>
              ))}
            </div>
          </div>
          <Button onClick={analyze} disabled={loading || !selectedPetId || !strategy} className="w-full gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Analyze Evolution Path
          </Button>
        </CardContent>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-background">
            <CardContent className="p-6">
              <h3 className="font-bold mb-3 flex items-center gap-2"><Zap className="w-5 h-5 text-amber-500" />Evolution Roadmap</h3>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{result}</div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};
