import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Crown, Loader2, ThumbsUp, Sparkles, Trophy } from "lucide-react";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { motion } from "framer-motion";

interface Props { onBack: () => void; }

const categories = ["Cutest Outfit", "Most Creative", "Best Accessories", "Royal Elegance", "Battle Ready", "Fantasy Theme"];

export const PetFashionShow = ({ onBack }: Props) => {
  const [selectedPetId, setSelectedPetId] = useState("");
  const [category, setCategory] = useState("");
  const [outfitDescription, setOutfitDescription] = useState("");
  const [aiJudgement, setAiJudgement] = useState<string | null>(null);
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

  const submitEntry = async () => {
    if (!selectedPetId) return toast.error("Select a pet");
    if (!category) return toast.error("Pick a category");
    if (!outfitDescription.trim()) return toast.error("Describe your pet's outfit");
    if (credits.credits_remaining < 4) return toast.error("Not enough credits (4 required)");

    setLoading(true);
    try {
      const pet = pets?.find(p => p.id === selectedPetId);
      const { data, error } = await supabase.functions.invoke('pet-fashion-show', {
        body: {
          petName: pet?.name,
          species: pet?.pet_types?.species,
          level: pet?.level,
          category,
          outfitDescription
        }
      });
      if (error) throw error;
      for (let i = 0; i < 4; i++) await useCredit("custom_generation", "Pet Fashion Show");
      setAiJudgement(data.result);
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="w-4 h-4" />Back to Dashboard</Button>
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 mb-2">
          <Crown className="w-8 h-8 text-fuchsia-500" />
        </div>
        <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Pet Fashion Show</h2>
        <p className="text-muted-foreground text-sm">Enter your pet in AI-judged fashion competitions</p>
        <p className="text-xs text-primary font-semibold">4 Credits per entry</p>
      </div>

      <Card className="border-border/40 bg-card/80 backdrop-blur-xl">
        <CardContent className="p-6 space-y-4">
          <Select value={selectedPetId} onValueChange={setSelectedPetId}>
            <SelectTrigger><SelectValue placeholder="Select your pet model..." /></SelectTrigger>
            <SelectContent>
              {pets?.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name} (Lv.{p.level} {p.pet_types?.name})</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue placeholder="Fashion category..." /></SelectTrigger>
            <SelectContent>
              {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>

          <Input
            placeholder="Describe your pet's outfit & accessories..."
            value={outfitDescription}
            onChange={e => setOutfitDescription(e.target.value)}
          />

          <Button onClick={submitEntry} disabled={loading || !selectedPetId || !category || !outfitDescription.trim()} className="w-full gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
            Submit to Fashion Show
          </Button>
        </CardContent>
      </Card>

      {aiJudgement && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-500/5 to-background">
            <CardContent className="p-6">
              <h3 className="font-bold mb-3 flex items-center gap-2"><Trophy className="w-5 h-5 text-fuchsia-500" />AI Judge's Verdict</h3>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{aiJudgement}</div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};
