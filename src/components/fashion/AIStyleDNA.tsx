import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAICredits } from "@/hooks/useAICredits";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function AIStyleDNA() {
  const { credits } = useAICredits();
  const [preferences, setPreferences] = useState("");
  const [bodyType, setBodyType] = useState("average");
  const [lifestyle, setLifestyle] = useState("casual");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!preferences) { toast.error("Please describe your style preferences"); return; }
    if ((credits?.credits_remaining || 0) < 8) { toast.error("You need 8 credits for Style DNA analysis"); return; }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("fashion-ai", {
        body: { action: "style-dna", preferences, bodyType, lifestyle }
      });
      if (error) throw error;
      setResult(data);
      toast.success("Style DNA analysis complete!");
    } catch (e: any) {
      toast.error(e.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How AIStyle DNA works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <Card className="p-4 sm:p-6 bg-gradient-to-br from-fuchsia-500/10 to-pink-500/10 border-fuchsia-500/20">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="h-7 w-7 text-fuchsia-400" />
          <div>
            <h2 className="text-xl sm:text-2xl font-black">AI Style DNA</h2>
            <p className="text-sm text-muted-foreground">Discover your unique fashion personality — 8 credits</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Describe Your Style Preferences</Label>
            <Textarea value={preferences} onChange={e => setPreferences(e.target.value)} placeholder="E.g., I love minimalist designs, earth tones, comfortable fabrics..." rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Body Type</Label>
              <Select value={bodyType} onValueChange={setBodyType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="petite">Petite</SelectItem>
                  <SelectItem value="average">Average</SelectItem>
                  <SelectItem value="tall">Tall</SelectItem>
                  <SelectItem value="athletic">Athletic</SelectItem>
                  <SelectItem value="curvy">Curvy</SelectItem>
                  <SelectItem value="plus-size">Plus Size</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Lifestyle</Label>
              <Select value={lifestyle} onValueChange={setLifestyle}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="glamorous">Glamorous</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleAnalyze} disabled={loading} className="w-full gap-2">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</> : <><Sparkles className="h-4 w-4" /> Analyze My Style DNA (8 Credits)</>}
          </Button>
          <p className="text-xs text-center text-muted-foreground">Available: {credits?.credits_remaining || 0} credits</p>
        </div>
      </Card>

      {result && (
        <div className="space-y-4">
          {result.styleProfile && <Card className="p-5"><h3 className="font-bold text-lg mb-2">🧬 Your Style Profile</h3><p className="text-sm whitespace-pre-wrap">{result.styleProfile}</p></Card>}
          {result.colorPalette && <Card className="p-5"><h3 className="font-bold text-lg mb-2">🎨 Your Color Palette</h3><p className="text-sm whitespace-pre-wrap">{result.colorPalette}</p></Card>}
          {result.wardrobeEssentials && <Card className="p-5"><h3 className="font-bold text-lg mb-2">👗 Wardrobe Essentials</h3><p className="text-sm whitespace-pre-wrap">{result.wardrobeEssentials}</p></Card>}
          {result.styleIcons && <Card className="p-5 bg-primary/5 border-primary/20"><h3 className="font-bold text-lg mb-2">⭐ Style Icons Like You</h3><p className="text-sm whitespace-pre-wrap">{result.styleIcons}</p></Card>}
        </div>
      )}
    </div>
    </>
    );
}
