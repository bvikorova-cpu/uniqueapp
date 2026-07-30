import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Brain, Check, Loader2, PawPrint, Sparkles } from "lucide-react";
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

  const { data: pets = [], isLoading: petsLoading, isError: petsError, refetch } = useQuery({
    queryKey: ['my-pets', 'personality-coach'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Login required");
      const { data, error } = await supabase.from('pets').select('*, pet_types(*)').order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    }
  });

  useEffect(() => {
    if (!selectedPetId && pets.length > 0) setSelectedPetId(pets[0].id);
  }, [pets, selectedPetId]);

  const analyze = async () => {
    if (!selectedPetId) return toast.error("Select a pet first");
    if (credits.credits_remaining < 5) return toast.error("Not enough credits (5 required)");
    setLoading(true);
    try {
      const pet = pets.find(p => p.id === selectedPetId);
      if (!pet) return toast.error("Select a pet first");
      const { data, error } = await supabase.functions.invoke('pet-translator-ai', {
        body: { action: 'vp_personality_coach', petName: pet?.name, species: pet?.pet_types?.species, level: pet?.level, happiness: pet?.happiness, energy: pet?.energy, hunger: pet?.hunger }
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
          {petsLoading ? (
            <div className="flex min-h-20 items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading your pets...
            </div>
          ) : petsError ? (
            <div className="space-y-3 text-center">
              <p className="text-sm text-destructive">Your pets could not be loaded.</p>
              <Button type="button" variant="outline" onClick={() => refetch()}>Try again</Button>
            </div>
          ) : pets.length === 0 ? (
            <div className="space-y-3 text-center">
              <PawPrint className="mx-auto h-7 w-7 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Create a pet before using the coach.</p>
              <Button type="button" variant="outline" onClick={() => navigate('/virtual-pet?tab=pets')}>Go to My Pets</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2" role="radiogroup" aria-label="Select your pet">
              {pets.map(p => {
                const selected = selectedPetId === p.id;
                return (
                  <Button
                    key={p.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    variant={selected ? "default" : "outline"}
                    className="h-auto min-h-12 w-full justify-between gap-3 px-4 py-3 text-left"
                    onClick={() => setSelectedPetId(p.id)}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{p.name}</span>
                      <span className="block text-xs opacity-80">Level {p.level} · {p.pet_types?.name ?? p.pet_types?.species ?? "Pet"}</span>
                    </span>
                    {selected && <Check className="h-5 w-5 shrink-0" />}
                  </Button>
                );
              })}
            </div>
          )}
          <Button onClick={analyze} disabled={loading || petsLoading || petsError || !selectedPetId} className="w-full gap-2">
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
