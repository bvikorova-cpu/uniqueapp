import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Brain, Loader2, Copy, Check, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function AIDifficultyTunerView({ onBack }: Props) {
  const { toast } = useToast();
  const [puzzleDesc, setPuzzleDesc] = useState("");
  const [targetDifficulty, setTargetDifficulty] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (puzzleDesc.trim().length < 15) {
      toast({ title: "Too Short", description: "Describe the puzzle in at least 15 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("stock-content-ai", {
        body: { action: "escape-difficulty-tune", puzzleDesc, targetDifficulty }
      });
      if (error) throw error;
      setResult(data.result);
      toast({ title: "Difficulty Adjusted!", description: "3 credits used" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed", variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Difficulty Tuner View - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Difficulty Tuner View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Difficulty Tuner View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">AI Difficulty Tuner</h2>
            <p className="text-muted-foreground">Auto-balance puzzle difficulty with AI analysis</p>
          </div>
          <Badge className="ml-auto bg-gradient-to-r from-red-500 to-rose-500 text-white border-0 shadow-md">
            <Sparkles className="w-3 h-3 mr-1" />3 Credits
          </Badge>
        </div>

        <Card className="mb-6 border-red-500/10">
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Your Puzzle(s)</label>
              <Textarea value={puzzleDesc} onChange={e => setPuzzleDesc(e.target.value)} placeholder="Paste your puzzle descriptions here. The AI will analyze complexity, suggest tweaks, and re-balance for your target difficulty..." rows={6} />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Target Difficulty</label>
              <select value={targetDifficulty} onChange={e => setTargetDifficulty(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2.5 text-sm">
                <option value="easy">Easy (Beginners)</option>
                <option value="medium">Medium (Casual)</option>
                <option value="hard">Hard (Experienced)</option>
                <option value="expert">Expert (Hardcore)</option>
              </select>
            </div>
            <Button onClick={generate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-lg">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing...</> : <><Brain className="w-4 h-4 mr-2" />Tune Difficulty (3 Credits)</>}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card className="border-emerald-500/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-500" />Difficulty Analysis</CardTitle>
              <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                {copied ? <Check className="w-4 h-4 mr-1 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1" />}{copied ? "Copied!" : "Copy"}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm bg-muted/50 rounded-xl p-5 border">{result}</div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </>
  );
}
