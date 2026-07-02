import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, HeartHandshake, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { handleEdgeError } from "@/lib/handleEdgeError";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export const AIPetCompatibilityChecker = ({ onBack }: Props) => {
  const [pet1Id, setPet1Id] = useState("");
  const [pet2Id, setPet2Id] = useState("");
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

  const check = async () => {
    if (!pet1Id || !pet2Id) return toast.error("Select two pets");
    if (pet1Id === pet2Id) return toast.error("Select two different pets");
    if (credits.credits_remaining < 6) return toast.error("Not enough credits (6 required)");
    setLoading(true);
    try {
      const p1 = pets?.find(p => p.id === pet1Id);
      const p2 = pets?.find(p => p.id === pet2Id);
      const { data, error } = await supabase.functions.invoke('pet-compatibility-checker', {
        body: {
          pet1: { name: p1?.name, species: p1?.pet_types?.species, level: p1?.level, happiness: p1?.happiness, energy: p1?.energy },
          pet2: { name: p2?.name, species: p2?.pet_types?.species, level: p2?.level, happiness: p2?.happiness, energy: p2?.energy }
        }
      });
      if (error) throw error;
      setResult(data.result);
    } catch (e: any) { handleEdgeError(e, { navigate, context: "AI Pet" }); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title="How AIPet Compatibility Checker works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="w-4 h-4" />Back to Dashboard</Button>
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-pink-500/10 border border-pink-500/20 mb-2">
          <HeartHandshake className="w-8 h-8 text-pink-500" />
        </div>
        <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">AI Compatibility Checker</h2>
        <p className="text-muted-foreground text-sm">Check breeding compatibility & predict offspring traits</p>
        <p className="text-xs text-primary font-semibold">6 Credits per check</p>
      </div>

      <Card className="border-border/40 bg-card/80 backdrop-blur-xl">
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold mb-1 block">Pet 1</label>
              <Select value={pet1Id} onValueChange={setPet1Id}>
                <SelectTrigger><SelectValue placeholder="First pet..." /></SelectTrigger>
                <SelectContent>
                  {pets?.map(p => <SelectItem key={p.id} value={p.id} disabled={p.id === pet2Id}>{p.name} (Lv.{p.level})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-bold mb-1 block">Pet 2</label>
              <Select value={pet2Id} onValueChange={setPet2Id}>
                <SelectTrigger><SelectValue placeholder="Second pet..." /></SelectTrigger>
                <SelectContent>
                  {pets?.map(p => <SelectItem key={p.id} value={p.id} disabled={p.id === pet1Id}>{p.name} (Lv.{p.level})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={check} disabled={loading || !pet1Id || !pet2Id} className="w-full gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Check Compatibility
          </Button>
        </CardContent>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="border-pink-500/20 bg-gradient-to-br from-pink-500/5 to-background">
            <CardContent className="p-6">
              <h3 className="font-bold mb-3 flex items-center gap-2"><HeartHandshake className="w-5 h-5 text-pink-500" />Compatibility Report</h3>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap">{result}</div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
    </>
    );
};
