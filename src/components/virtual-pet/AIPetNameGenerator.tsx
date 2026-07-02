import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Wand2, Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { handleEdgeError } from "@/lib/handleEdgeError";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

const themes = ["Cute & Playful", "Mythical & Epic", "Funny & Quirky", "Royal & Elegant", "Dark & Mysterious", "Nature-Inspired"];

export const AIPetNameGenerator = ({ onBack }: Props) => {
  const [species, setSpecies] = useState("");
  const [theme, setTheme] = useState("");
  const [personality, setPersonality] = useState("");
  const [names, setNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const { credits } = useAICredits();
  const navigate = useNavigate();

  const generate = async () => {
    if (!species) return toast.error("Enter a species");
    if (credits.credits_remaining < 3) return toast.error("Not enough credits (3 required)");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('pet-name-generator', {
        body: { species, theme, personality }
      });
      if (error) throw error;
      setNames(data.names || []);
    } catch (e: any) { handleEdgeError(e, { navigate, context: "AI Pet" }); }
    finally { setLoading(false); }
  };

  const copyName = (name: string, idx: number) => {
    navigator.clipboard.writeText(name);
    setCopiedIdx(idx);
    toast.success("Copied!");
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <>
      <FloatingHowItWorks title="How AIPet Name Generator works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="w-4 h-4" />Back to Dashboard</Button>
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-pink-500/10 border border-pink-500/20 mb-2">
          <Wand2 className="w-8 h-8 text-pink-500" />
        </div>
        <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">AI Pet Name Generator</h2>
        <p className="text-muted-foreground text-sm">Generate creative, unique names for your companions</p>
        <p className="text-xs text-primary font-semibold">3 Credits per generation</p>
      </div>

      <Card className="border-border/40 bg-card/80 backdrop-blur-xl">
        <CardContent className="p-6 space-y-4">
          <Input placeholder="Species (e.g. Dragon, Kitten, Phoenix)" value={species} onChange={e => setSpecies(e.target.value)} />
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger><SelectValue placeholder="Name theme..." /></SelectTrigger>
            <SelectContent>
              {themes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input placeholder="Personality traits (optional)" value={personality} onChange={e => setPersonality(e.target.value)} />
          <Button onClick={generate} disabled={loading || !species} className="w-full gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            Generate Names
          </Button>
        </CardContent>
      </Card>

      {names.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-3">
          {names.map((name, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
              <Card className="border-border/40 bg-card/80 backdrop-blur-sm hover:border-primary/30 transition-all cursor-pointer active:scale-[0.97]" onClick={() => copyName(name, i)}>
                <CardContent className="p-4 flex items-center justify-between">
                  <span className="font-bold text-sm">{name}</span>
                  {copiedIdx === i ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
    </>
    );
};
