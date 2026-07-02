import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Target, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { handleEdgeError } from "@/lib/handleEdgeError";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export const AIPetBattleStrategy = ({ onBack }: Props) => {
  const [selectedPetIds, setSelectedPetIds] = useState<string[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { credits } = useAICredits();
  const navigate = useNavigate();

  const { data: pets } = useQuery({
    queryKey: ['my-pets'],
    queryFn: async () => {
      const { data, error } = await supabase.from('pets').select('*, pet_types(*)').order('level', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const togglePet = (id: string) => {
    setSelectedPetIds(prev => prev.includes(id) ? prev.filter(p => p !== id) : prev.length < 4 ? [...prev, id] : prev);
  };

  const strategize = async () => {
    if (selectedPetIds.length === 0) return toast.error("Select at least one pet");
    if (credits.credits_remaining < 4) return toast.error("Not enough credits (4 required)");
    setLoading(true);
    try {
      const selectedPets = pets?.filter(p => selectedPetIds.includes(p.id)).map(p => ({
        name: p.name, species: p.pet_types?.species, level: p.level,
        happiness: p.happiness, energy: p.energy, battleWins: p.battle_wins, battleLosses: p.battle_losses
      }));
      const { data, error } = await supabase.functions.invoke('pet-battle-strategy', {
        body: { pets: selectedPets }
      });
      if (error) throw error;
      setResult(data.result);
    } catch (e: any) { handleEdgeError(e, { navigate, context: "AI Pet" }); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title="How AIPet Battle Strategy works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="w-4 h-4" />Back to Dashboard</Button>
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 mb-2">
          <Target className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">AI Battle Strategy</h2>
        <p className="text-muted-foreground text-sm">Get optimal battle formations & tactical advice</p>
        <p className="text-xs text-primary font-semibold">4 Credits per strategy</p>
      </div>

      <Card className="border-border/40 bg-card/80 backdrop-blur-xl">
        <CardContent className="p-6 space-y-4">
          <p className="text-sm font-semibold">Select up to 4 pets for battle analysis:</p>
          <div className="grid grid-cols-2 gap-2">
            {pets?.map(p => (
              <Button key={p.id} variant={selectedPetIds.includes(p.id) ? "default" : "outline"} size="sm"
                className="justify-start text-xs active:scale-[0.95]" onClick={() => togglePet(p.id)}>
                {p.name} (Lv.{p.level})
              </Button>
            ))}
          </div>
          <Button onClick={strategize} disabled={loading || selectedPetIds.length === 0} className="w-full gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generate Battle Strategy
          </Button>
        </CardContent>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="border-red-500/20 bg-gradient-to-br from-red-500/5 to-background">
            <CardContent className="p-6">
              <h3 className="font-bold mb-3 flex items-center gap-2"><Target className="w-5 h-5 text-red-500" />Battle Strategy</h3>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap">{result}</div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
    </>
    );
};
