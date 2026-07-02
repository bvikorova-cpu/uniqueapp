import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Video, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAICredits } from "@/hooks/useAICredits";
import { toast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export default function AIRecipeVideoGenerator({ onBack }: Props) {
  const { credits, spendCredit } = useAICredits();
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!input.trim()) return;
    if (credits.credits_remaining < 5) { toast({ title: "Not enough credits", description: "You need 5 credits for video script generation.", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const ok = await spendCredit("custom_generation", "AI Recipe Video Generator");
      if (!ok) throw new Error("Failed to use credit");
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: { prompt: `You are a professional food videographer and content creator. Create a detailed recipe video script and production plan for the following recipe. Include:
1) VIDEO TITLE & THUMBNAIL CONCEPT (clickbait-worthy but honest)
2) INTRO SEQUENCE (5-10 seconds hook, what makes this recipe special)
3) SHOT-BY-SHOT BREAKDOWN (camera angles, close-ups, overhead shots for each step)
4) B-ROLL SUGGESTIONS (ingredient beauty shots, steam, sizzling sounds)
5) VOICEOVER/NARRATION SCRIPT (conversational, engaging tone)
6) MUSIC & SOUND DESIGN RECOMMENDATIONS
7) EDITING NOTES (transitions, speed ramps, slow-motion moments)
8) SOCIAL MEDIA CUTS (15s Instagram Reel, 60s TikTok, 3-5 min YouTube)
9) HASHTAG & SEO SUGGESTIONS
10) ESTIMATED PRODUCTION TIME

Recipe: ${input}` },
      });
      if (error) throw error;
      setResult(data?.message || data?.text || "No result");
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title="How AIRecipe Video Generator works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30">
          <Video className="h-5 w-5 text-red-400" />
          <span className="font-bold text-red-400">AI Recipe Video Generator</span>
          <span className="text-xs bg-red-500/20 px-2 py-0.5 rounded-full text-red-300">5 Credits</span>
        </div>
        <p className="text-muted-foreground text-sm">Get a professional video script & production plan for any recipe</p>
      </div>
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-border/60">
        <Textarea placeholder="E.g. Homemade pasta carbonara with crispy guanciale, egg yolk sauce, and fresh pecorino. Target audience: food enthusiasts on YouTube/TikTok..." value={input} onChange={(e) => setInput(e.target.value)} rows={4} className="mb-4" />
        <Button onClick={generate} disabled={loading || !input.trim()} className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white">
          {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating Script...</> : <><Sparkles className="h-4 w-4 mr-2" /> Generate Video Plan (5 Credits)</>}
        </Button>
      </Card>
      {result && (
        <Card className="p-6 bg-card/80 backdrop-blur-xl border-red-500/30">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><Video className="h-5 w-5 text-red-400" /> Video Production Plan</h3>
          <div className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">{result}</div>
        </Card>
      )}
    </div>
    </>
    );
}
