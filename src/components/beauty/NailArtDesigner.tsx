import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Paintbrush, ArrowLeft, Clock, Star } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface NailArtDesignerProps {
  onBack: () => void;
}

export const NailArtDesigner = ({ onBack }: NailArtDesignerProps) => {
  const [style, setStyle] = useState("french");
  const [occasion, setOccasion] = useState("everyday");
  const [shape, setShape] = useState("almond");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { credits, refresh } = useAICredits();

  const handleDesign = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in"); return; }

      const { data, error } = await supabase.functions.invoke('beauty-nail-art', {
        body: { style, occasion, shape }
      });
      if (error) throw error;
      setResult(data.design);
      refresh();
      toast.success("Nail design created!");
    } catch (error: any) {
      toast.error(error.message || "Design failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How Nail Art Designer works" steps={[
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
            <Paintbrush className="h-6 w-6 text-pink-500" />
            AI Nail Art Designer
          </h2>
          <p className="text-muted-foreground mb-6">Generate custom nail art designs for any occasion • 5 Credits</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="french">💅 French</SelectItem>
                  <SelectItem value="geometric">🔷 Geometric</SelectItem>
                  <SelectItem value="floral">🌸 Floral</SelectItem>
                  <SelectItem value="abstract">🎨 Abstract</SelectItem>
                  <SelectItem value="minimalist">✨ Minimalist</SelectItem>
                  <SelectItem value="glitter">💎 Glitter Glam</SelectItem>
                  <SelectItem value="marble">🪨 Marble</SelectItem>
                  <SelectItem value="ombre">🌅 Ombre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Occasion</Label>
              <Select value={occasion} onValueChange={setOccasion}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyday">Daily Wear</SelectItem>
                  <SelectItem value="wedding">Wedding</SelectItem>
                  <SelectItem value="party">Party</SelectItem>
                  <SelectItem value="date">Date Night</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="festival">Festival</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nail Shape</Label>
              <Select value={shape} onValueChange={setShape}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="almond">Almond</SelectItem>
                  <SelectItem value="oval">Oval</SelectItem>
                  <SelectItem value="square">Square</SelectItem>
                  <SelectItem value="coffin">Coffin/Ballerina</SelectItem>
                  <SelectItem value="stiletto">Stiletto</SelectItem>
                  <SelectItem value="round">Round</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleDesign} disabled={loading || (credits?.credits_remaining ?? 0) < 5} className="w-full mt-4">
            {loading ? "Designing..." : "Generate Design (5 Credits)"}
          </Button>
          {credits && <p className="text-sm text-muted-foreground mt-2">Credits: {credits.credits_remaining}</p>}
        </Card>
      </motion.div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <Card className="p-6 bg-card/80 backdrop-blur-xl border-pink-500/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{result.designName}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {result.estimatedTime}</span>
                <span className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-500" /> {result.trendingScore}/10</span>
              </div>
            </div>
            <p className="text-muted-foreground mb-4">{result.description}</p>
            <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">{result.difficulty}</span>
          </Card>

          {result.nailByNail?.length > 0 && (
            <Card className="p-6 bg-card/80 backdrop-blur-xl">
              <h3 className="text-lg font-bold mb-4">💅 Nail-by-Nail Design</h3>
              <div className="space-y-3">
                {result.nailByNail.map((nail: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                    <span className="font-bold text-pink-500 min-w-[60px]">{nail.finger}</span>
                    <div className="flex-1">
                      <p className="text-sm">{nail.design}</p>
                      <p className="text-xs text-muted-foreground mt-1">Technique: {nail.technique}</p>
                      {nail.colors?.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {nail.colors.map((c: string, ci: number) => (
                            <div key={ci} className="w-5 h-5 rounded-full border border-border" style={{ backgroundColor: c }} title={c} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {result.productsNeeded?.length > 0 && (
            <Card className="p-6 bg-card/80 backdrop-blur-xl">
              <h3 className="text-lg font-bold mb-3">🛍️ Products Needed</h3>
              <ul className="space-y-2 text-sm">
                {result.productsNeeded.map((p: any, i: number) => (
                  <li key={i}><strong>{p.product}</strong> by {p.brand} <span className="text-muted-foreground">({p.priceRange})</span></li>
                ))}
              </ul>
            </Card>
          )}

          {result.proTips?.length > 0 && (
            <Card className="p-6 bg-card/80 backdrop-blur-xl">
              <h3 className="text-lg font-bold mb-3">✨ Pro Tips</h3>
              <ul className="space-y-1 text-sm">{result.proTips.map((t: string, i: number) => <li key={i}>• {t}</li>)}</ul>
            </Card>
          )}
        </motion.div>
      )}
    </div>
    </>
    );
};
