import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ArrowLeft, BookOpen, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { handleEdgeError } from "@/lib/handleEdgeError";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

const genres = ["Epic Adventure", "Comedy", "Mystery", "Romance", "Sci-Fi", "Fantasy Quest", "Horror", "Slice of Life"];

export const AIPetStoryGenerator = ({ onBack }: Props) => {
  const [selectedPetIds, setSelectedPetIds] = useState<string[]>([]);
  const [genre, setGenre] = useState("");
  const [setting, setSetting] = useState("");
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

  const togglePet = (id: string) => {
    setSelectedPetIds(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const generate = async () => {
    if (selectedPetIds.length === 0) return toast.error("Select at least one pet");
    if (!genre) return toast.error("Pick a genre");
    if (credits.credits_remaining < 6) return toast.error("Not enough credits (6 required)");
    setLoading(true);
    try {
      const selectedPets = pets?.filter(p => selectedPetIds.includes(p.id)).map(p => ({
        name: p.name, species: p.pet_types?.species, level: p.level
      }));
      const { data, error } = await supabase.functions.invoke('pet-story-generator', {
        body: { pets: selectedPets, genre, setting }
      });
      if (error) throw error;
      setResult(data.result);
    } catch (e: any) { handleEdgeError(e, { navigate, context: "AI Pet" }); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title="How AIPet Story Generator works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="w-4 h-4" />Back to Dashboard</Button>
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-2">
          <BookOpen className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">AI Pet Story Generator</h2>
        <p className="text-muted-foreground text-sm">Generate unique adventure stories starring your pets</p>
        <p className="text-xs text-primary font-semibold">6 Credits per story</p>
      </div>

      <Card className="border-border/40 bg-card/80 backdrop-blur-xl">
        <CardContent className="p-6 space-y-4">
          <div>
            <p className="text-sm font-semibold mb-2">Select up to 3 pets as characters:</p>
            <div className="grid grid-cols-2 gap-2">
              {pets?.map(p => (
                <Button key={p.id} variant={selectedPetIds.includes(p.id) ? "default" : "outline"} size="sm" className="justify-start text-xs" onClick={() => togglePet(p.id)}>
                  {p.name} (Lv.{p.level})
                </Button>
              ))}
            </div>
          </div>
          <Select value={genre} onValueChange={setGenre}>
            <SelectTrigger><SelectValue placeholder="Story genre..." /></SelectTrigger>
            <SelectContent>
              {genres.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input placeholder="Setting (optional: e.g. 'Enchanted Forest')" value={setting} onChange={e => setSetting(e.target.value)} />
          <Button onClick={generate} disabled={loading || selectedPetIds.length === 0 || !genre} className="w-full gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generate Story
          </Button>
        </CardContent>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-background">
            <CardContent className="p-6">
              <h3 className="font-bold mb-3 flex items-center gap-2"><BookOpen className="w-5 h-5 text-amber-500" />Your Pet's Adventure</h3>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{result}</div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
    </>
    );
};
