import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Palette, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAICredits } from "@/hooks/useAICredits";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function AIColorHarmony() {
  const { credits } = useAICredits();
  const [baseColor, setBaseColor] = useState("");
  const [occasion, setOccasion] = useState("everyday");
  const [skinTone, setSkinTone] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!baseColor) { toast.error("Enter a base color"); return; }
    if ((credits?.credits_remaining || 0) < 5) { toast.error("You need 5 credits"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("fashion-ai", {
        body: { action: "color-harmony", baseColor, occasion, skinTone }
      });
      if (error) throw error;
      setResult(data);
      toast.success("Color harmony analysis complete!");
    } catch (e: any) {
      toast.error(e.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How AIColor Harmony works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <Card className="p-4 sm:p-6 bg-gradient-to-br from-red-500/10 to-rose-500/10 border-red-500/20">
        <div className="flex items-center gap-3 mb-4">
          <Palette className="h-7 w-7 text-red-400" />
          <div>
            <h2 className="text-xl sm:text-2xl font-black">AI Color Harmony</h2>
            <p className="text-sm text-muted-foreground">Perfect color palettes for outfits — 5 credits</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <Label>Base Color</Label>
            <Input value={baseColor} onChange={e => setBaseColor(e.target.value)} placeholder="E.g., navy blue, burgundy, olive green..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Occasion</Label>
              <Select value={occasion} onValueChange={setOccasion}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyday">Everyday</SelectItem>
                  <SelectItem value="work">Work / Office</SelectItem>
                  <SelectItem value="formal">Formal Event</SelectItem>
                  <SelectItem value="party">Party / Night Out</SelectItem>
                  <SelectItem value="summer">Summer / Beach</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Skin Tone</Label>
              <Select value={skinTone} onValueChange={setSkinTone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="olive">Olive</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="deep">Deep</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleAnalyze} disabled={loading} className="w-full gap-2">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</> : <><Sparkles className="h-4 w-4" /> Generate Color Harmony (5 Credits)</>}
          </Button>
          <p className="text-xs text-center text-muted-foreground">Available: {credits?.credits_remaining || 0} credits</p>
        </div>
      </Card>

      {result && (
        <div className="space-y-4">
          {result.harmonicPalette && <Card className="p-5"><h3 className="font-bold text-lg mb-2">🎨 Harmonic Color Palette</h3><p className="text-sm whitespace-pre-wrap">{result.harmonicPalette}</p></Card>}
          {result.outfitCombinations && <Card className="p-5"><h3 className="font-bold text-lg mb-2">👔 Outfit Combinations</h3><p className="text-sm whitespace-pre-wrap">{result.outfitCombinations}</p></Card>}
          {result.avoidColors && <Card className="p-5"><h3 className="font-bold text-lg mb-2">🚫 Colors to Avoid</h3><p className="text-sm whitespace-pre-wrap">{result.avoidColors}</p></Card>}
          {result.seasonalAdaptation && <Card className="p-5 bg-primary/5 border-primary/20"><h3 className="font-bold text-lg mb-2">🌸 Seasonal Adaptation</h3><p className="text-sm whitespace-pre-wrap">{result.seasonalAdaptation}</p></Card>}
        </div>
      )}
    </div>
    </>
    );
}
