import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Camera, Loader2, Sparkles, Download } from "lucide-react";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { motion } from "framer-motion";

interface Props { onBack: () => void; }

const styles = [
  "Anime Portrait", "Watercolor Painting", "Pixel Art", "Fantasy Oil Painting",
  "Cyberpunk Neon", "Studio Photograph", "Comic Book Style", "Stained Glass"
];

export const AIPetPhotoStudio = ({ onBack }: Props) => {
  const [selectedPetId, setSelectedPetId] = useState("");
  const [style, setStyle] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
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

  const generate = async () => {
    if (!selectedPetId) return toast.error("Select a pet first");
    if (!style) return toast.error("Pick an art style");
    if (credits.credits_remaining < 7) return toast.error("Not enough credits (7 required)");
    setLoading(true);
    try {
      const pet = pets?.find(p => p.id === selectedPetId);
      const { data, error } = await supabase.functions.invoke('pet-photo-studio', {
        body: {
          petName: pet?.name,
          species: pet?.pet_types?.species,
          level: pet?.level,
          style,
          customPrompt
        }
      });
      if (error) throw error;
      for (let i = 0; i < 7; i++) await useCredit("custom_generation", "AI Pet Photo Studio");
      setResult(data.result);
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="w-4 h-4" />Back to Dashboard</Button>
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 mb-2">
          <Camera className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">AI Pet Photo Studio</h2>
        <p className="text-muted-foreground text-sm">Generate stunning AI art portraits of your pets</p>
        <p className="text-xs text-primary font-semibold">7 Credits per portrait</p>
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

          <div>
            <p className="text-sm font-semibold mb-2">Choose Art Style:</p>
            <div className="grid grid-cols-2 gap-2">
              {styles.map(s => (
                <Button key={s} variant={style === s ? "default" : "outline"} size="sm"
                  className="text-xs justify-start" onClick={() => setStyle(s)}>
                  {s}
                </Button>
              ))}
            </div>
          </div>

          <Input placeholder="Custom details (optional: 'wearing a crown, magical forest')" value={customPrompt} onChange={e => setCustomPrompt(e.target.value)} />

          <Button onClick={generate} disabled={loading || !selectedPetId || !style} className="w-full gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            Generate Portrait
          </Button>
        </CardContent>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="border-rose-500/20 bg-gradient-to-br from-rose-500/5 to-background">
            <CardContent className="p-6">
              <h3 className="font-bold mb-3 flex items-center gap-2"><Sparkles className="w-5 h-5 text-rose-500" />Portrait Description</h3>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{result}</div>
              <p className="text-xs text-muted-foreground mt-4 italic">💡 Tip: Use this description with any AI image generator to create the actual artwork!</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};
