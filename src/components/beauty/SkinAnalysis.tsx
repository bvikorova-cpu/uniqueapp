import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, ArrowLeft, Droplets, Sun, Moon, Sparkles } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface SkinAnalysisProps {
  onBack: () => void;
}

export const SkinAnalysis = ({ onBack }: SkinAnalysisProps) => {
  const [skinType, setSkinType] = useState("normal");
  const [age, setAge] = useState("");
  const [concerns, setConcerns] = useState<string[]>([]);
  const [currentRoutine, setCurrentRoutine] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { credits, refresh } = useAICredits();

  const concernOptions = ["Acne", "Wrinkles", "Dark spots", "Large pores", "Redness", "Dryness", "Oiliness", "Sensitivity", "Uneven texture", "Dark circles"];

  const toggleConcern = (c: string) => setConcerns(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in"); return; }

      const { data, error } = await supabase.functions.invoke('beauty-skin-analysis', {
        body: { skinType, age, concerns, currentRoutine }
      });
      if (error) throw error;
      setResult(data.recommendations);
      refresh();
      toast.success("Skin analysis complete!");
    } catch (error: any) {
      toast.error(error.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How Skin Analysis works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Hub
      </Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-6 bg-card/80 backdrop-blur-xl border-pink-500/20">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Search className="h-6 w-6 text-pink-500" />
            AI Skin Analysis
          </h2>
          <p className="text-muted-foreground mb-6">Get a personalized skincare routine & product recommendations • 8 Credits</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Skin Type</Label>
              <Select value={skinType} onValueChange={setSkinType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="dry">Dry</SelectItem>
                  <SelectItem value="oily">Oily</SelectItem>
                  <SelectItem value="combination">Combination</SelectItem>
                  <SelectItem value="sensitive">Sensitive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Age</Label>
              <Input placeholder="e.g., 28" value={age} onChange={e => setAge(e.target.value)} />
            </div>
          </div>

          <div className="mt-4">
            <Label className="mb-3 block">Skin Concerns</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {concernOptions.map(c => (
                <div key={c} className="flex items-center gap-2">
                  <Checkbox checked={concerns.includes(c)} onCheckedChange={() => toggleConcern(c)} />
                  <span className="text-sm">{c}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <Label>Current Skincare Routine (optional)</Label>
            <Textarea placeholder="Describe your current routine..." value={currentRoutine} onChange={e => setCurrentRoutine(e.target.value)} />
          </div>

          <Button onClick={handleAnalyze} disabled={loading || (credits?.credits_remaining ?? 0) < 8} className="w-full mt-4">
            {loading ? "Analyzing..." : "Analyze My Skin (8 Credits)"}
          </Button>
          {credits && <p className="text-sm text-muted-foreground mt-2">Credits: {credits.credits_remaining}</p>}
        </Card>
      </motion.div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <Card className="p-6 bg-card/80 backdrop-blur-xl border-pink-500/20">
            <h3 className="text-xl font-bold mb-2">🔬 Skin Assessment</h3>
            <p className="text-muted-foreground">{result.skinAssessment}</p>
            {result.skinScore && (
              <div className="mt-3 flex items-center gap-3">
                <span className="text-3xl font-black text-pink-500">{result.skinScore}/100</span>
                <span className="text-sm text-muted-foreground">Skin Health Score</span>
              </div>
            )}
          </Card>

          {result.morningRoutine?.length > 0 && (
            <Card className="p-6 bg-card/80 backdrop-blur-xl">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><Sun className="h-5 w-5 text-yellow-500" /> Morning Routine</h3>
              <ol className="space-y-3">
                {result.morningRoutine.map((s: any, i: number) => (
                  <li key={i} className="flex gap-3">
                    <span className="font-bold text-pink-500 text-lg">{s.step}</span>
                    <div>
                      <p className="font-semibold">{s.product} <span className="text-xs text-muted-foreground">({s.type})</span></p>
                      <p className="text-sm text-muted-foreground">{s.why}</p>
                      {s.application && <p className="text-xs text-primary mt-1">💡 {s.application}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </Card>
          )}

          {result.eveningRoutine?.length > 0 && (
            <Card className="p-6 bg-card/80 backdrop-blur-xl">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><Moon className="h-5 w-5 text-indigo-500" /> Evening Routine</h3>
              <ol className="space-y-3">
                {result.eveningRoutine.map((s: any, i: number) => (
                  <li key={i} className="flex gap-3">
                    <span className="font-bold text-indigo-500 text-lg">{s.step}</span>
                    <div>
                      <p className="font-semibold">{s.product} <span className="text-xs text-muted-foreground">({s.type})</span></p>
                      <p className="text-sm text-muted-foreground">{s.why}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Card>
          )}

          {result.ingredientsToSeek?.length > 0 && (
            <Card className="p-6 bg-card/80 backdrop-blur-xl">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><Sparkles className="h-5 w-5 text-green-500" /> Key Ingredients</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-green-500 text-sm mb-2">✅ Seek</h4>
                  <ul className="text-sm space-y-1">{result.ingredientsToSeek.map((i: string, idx: number) => <li key={idx}>• {i}</li>)}</ul>
                </div>
                {result.ingredientsToAvoid?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-red-500 text-sm mb-2">❌ Avoid</h4>
                    <ul className="text-sm space-y-1">{result.ingredientsToAvoid.map((i: string, idx: number) => <li key={idx}>• {i}</li>)}</ul>
                  </div>
                )}
              </div>
            </Card>
          )}

          {result.lifestyleTips?.length > 0 && (
            <Card className="p-6 bg-card/80 backdrop-blur-xl">
              <h3 className="text-lg font-bold mb-3">💡 Lifestyle Tips</h3>
              <ul className="space-y-1 text-sm">{result.lifestyleTips.map((t: string, i: number) => <li key={i}>• {t}</li>)}</ul>
            </Card>
          )}
        </motion.div>
      )}
    </div>
    </>
    );
};
