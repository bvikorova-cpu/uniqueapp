import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Activity, Loader2, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { handleEdgeError } from "@/lib/handleEdgeError";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export const AIPetHealthPredictor = ({ onBack }: Props) => {
  const [selectedPetId, setSelectedPetId] = useState("");
  const [timeframe, setTimeframe] = useState("7");
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

  const predict = async () => {
    if (!selectedPetId) return toast.error("Select a pet first");
    if (credits.credits_remaining < 8) return toast.error("Not enough credits (8 required)");
    setLoading(true);
    try {
      const pet = pets?.find(p => p.id === selectedPetId);
      const { data, error } = await supabase.functions.invoke('pet-health-predictor', {
        body: { petName: pet?.name, species: pet?.pet_types?.species, level: pet?.level, happiness: pet?.happiness, energy: pet?.energy, hunger: pet?.hunger, experience: pet?.experience, timeframeDays: parseInt(timeframe) }
      });
      if (error) throw error;
      setResult(data.result);
    } catch (e: any) { handleEdgeError(e, { navigate, context: "AI Pet" }); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title="How AIPet Health Predictor works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="w-4 h-4" />Back to Dashboard</Button>
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-2">
          <Activity className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">AI Pet Health Predictor</h2>
        <p className="text-muted-foreground text-sm">Predict evolution paths, health trends & optimal care strategies</p>
        <p className="text-xs text-primary font-semibold">8 Credits per prediction</p>
      </div>

      <Card className="border-border/40 bg-card/80 backdrop-blur-xl">
        <CardContent className="p-6 space-y-4">
          <Select value={selectedPetId} onValueChange={setSelectedPetId}>
            <SelectTrigger><SelectValue placeholder="Select your pet..." /></SelectTrigger>
            <SelectContent>
              {pets?.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name} (Lv.{p.level} {p.pet_types?.name})</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger><SelectValue placeholder="Prediction timeframe" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7-Day Forecast</SelectItem>
              <SelectItem value="14">14-Day Forecast</SelectItem>
              <SelectItem value="30">30-Day Forecast</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={predict} disabled={loading || !selectedPetId} className="w-full gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
            Predict Health Trends
          </Button>
        </CardContent>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-background">
            <CardContent className="p-6">
              <h3 className="font-bold mb-3 flex items-center gap-2"><Activity className="w-5 h-5 text-emerald-500" />Health Prediction</h3>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap">{result}</div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
    </>
    );
};
