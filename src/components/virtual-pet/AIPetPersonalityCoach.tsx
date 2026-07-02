import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Brain, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { handleEdgeError } from "@/lib/handleEdgeError";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export const AIPetPersonalityCoach = ({ onBack }: Props) => {
  const [selectedPetId, setSelectedPetId] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { credits } = useAICredits();
  const navigate = useNavigate();

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
    if (credits.credits_remaining < 5) return toast.error("Not enough credits (5 required)");
    setLoading(true);
    try {
      const pet = pets?.find(p => p.id === selectedPetId);
      const { data, error } = await supabase.functions.invoke('pet-personality-coach', {
        body: { petName: pet?.name, species: pet?.pet_types?.species, level: pet?.level, happiness: pet?.happiness, energy: pet?.energy, hunger: pet?.hunger }
      });
      if (error) throw error;
      setResult(data.result);
    } catch (e: any) { handleEdgeError(e, { navigate, context: "AI Pet" }); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title="How AIPet Personality Coach works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="w-4 h-4" />Back to Dashboard</Button>
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-2">
          <Brain className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">AI Pet Personality Coach</h2>
        <p className="text-muted-foreground text-sm">Get personalized care routines based on your pet's personality & stats</p>
        <p className="text-xs text-primary font-semibold">5 Credits per analysis</p>
      </div>

      <Card className="border-border/40 bg-card/80 backdrop-blur-xl">
        <CardContent className="p-6 space-y-4">
          <Select value={selectedPetId} onValueChange={setSelectedPetId}>
            <SelectTrigger><SelectValue placeholder="Select your pet..." /></SelectTrigger>
            <SelectContent>
              {pets?.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} (Lv.{p.level} {p.pet_types?.name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={analyze} disabled={loading || !selectedPetId} className="w-full gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Analyze Personality
          </Button>
        </CardContent>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
            <CardContent className="p-6">
              <h3 className="font-bold mb-3 flex items-center gap-2"><Brain className="w-5 h-5 text-primary" />Personality Analysis</h3>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap">{result}</div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
    </>
    );
};
