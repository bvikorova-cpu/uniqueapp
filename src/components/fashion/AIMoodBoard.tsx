import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layers, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAICredits } from "@/hooks/useAICredits";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function AIMoodBoard() {
  const { credits } = useAICredits();
  const [theme, setTheme] = useState("");
  const [aesthetic, setAesthetic] = useState("modern-minimal");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    if (!theme) { toast.error("Please describe your mood/theme"); return; }
    if ((credits?.credits_remaining || 0) < 12) { toast.error("You need 12 credits"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("fashion-ai", {
        body: { action: "mood-board", theme, aesthetic }
      });
      if (error) throw error;
      setResult(data);
      toast.success("Mood board generated!");
    } catch (e: any) {
      toast.error(e.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How AIMood Board works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <Card className="p-4 sm:p-6 bg-gradient-to-br from-sky-500/10 to-cyan-500/10 border-sky-500/20">
        <div className="flex items-center gap-3 mb-4">
          <Layers className="h-7 w-7 text-sky-400" />
          <div>
            <h2 className="text-xl sm:text-2xl font-black">AI Fashion Mood Board</h2>
            <p className="text-sm text-muted-foreground">Generate visual inspiration boards — 12 credits</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <Label>Theme / Inspiration</Label>
            <Textarea value={theme} onChange={e => setTheme(e.target.value)} placeholder="E.g., Parisian chic meets Tokyo street style, romantic garden party, 90s grunge revival..." rows={3} />
          </div>
          <div>
            <Label>Aesthetic</Label>
            <Select value={aesthetic} onValueChange={setAesthetic}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="modern-minimal">Modern Minimal</SelectItem>
                <SelectItem value="bohemian">Bohemian</SelectItem>
                <SelectItem value="streetwear">Streetwear</SelectItem>
                <SelectItem value="vintage">Vintage</SelectItem>
                <SelectItem value="haute-couture">Haute Couture</SelectItem>
                <SelectItem value="cottagecore">Cottagecore</SelectItem>
                <SelectItem value="dark-academia">Dark Academia</SelectItem>
                <SelectItem value="y2k">Y2K Revival</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleGenerate} disabled={loading} className="w-full gap-2">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4" /> Generate Mood Board (12 Credits)</>}
          </Button>
          <p className="text-xs text-center text-muted-foreground">Available: {credits?.credits_remaining || 0} credits</p>
        </div>
      </Card>

      {result && (
        <div className="space-y-4">
          {result.moodDescription && <Card className="p-5"><h3 className="font-bold text-lg mb-2">✨ Mood & Atmosphere</h3><p className="text-sm whitespace-pre-wrap">{result.moodDescription}</p></Card>}
          {result.keyPieces && <Card className="p-5"><h3 className="font-bold text-lg mb-2">👗 Key Pieces</h3><p className="text-sm whitespace-pre-wrap">{result.keyPieces}</p></Card>}
          {result.textures && <Card className="p-5"><h3 className="font-bold text-lg mb-2">🧵 Textures & Materials</h3><p className="text-sm whitespace-pre-wrap">{result.textures}</p></Card>}
          {result.styling && <Card className="p-5 bg-primary/5 border-primary/20"><h3 className="font-bold text-lg mb-2">💄 Styling Direction</h3><p className="text-sm whitespace-pre-wrap">{result.styling}</p></Card>}
        </div>
      )}
    </div>
    </>
    );
}
