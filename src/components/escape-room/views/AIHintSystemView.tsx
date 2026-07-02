import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Lightbulb, Loader2, Copy, Check, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function AIHintSystemView({ onBack }: Props) {
  const { toast } = useToast();
  const [puzzleDesc, setPuzzleDesc] = useState("");
  const [hintLevel, setHintLevel] = useState("subtle");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (puzzleDesc.trim().length < 10) {
      toast({ title: "Too Short", description: "Describe the puzzle in at least 10 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("stock-content-ai", {
        body: { action: "escape-hint-gen", puzzleDesc, hintLevel }
      });
      if (error) throw error;
      setResult(data.result);
      toast({ title: "Hints Generated!", description: "3 credits used" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed", variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Hint System View - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Hint System View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Hint System View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">AI Hint System</h2>
            <p className="text-muted-foreground">Generate progressive hints for any puzzle</p>
          </div>
          <Badge className="ml-auto bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 shadow-md">
            <Sparkles className="w-3 h-3 mr-1" />3 Credits
          </Badge>
        </div>

        <Card className="mb-6 border-cyan-500/10">
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Puzzle Description & Solution</label>
              <Textarea value={puzzleDesc} onChange={e => setPuzzleDesc(e.target.value)} placeholder="Describe the puzzle and its solution. The AI will generate progressive hints that guide without spoiling..." rows={5} />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Hint Style</label>
              <select value={hintLevel} onChange={e => setHintLevel(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2.5 text-sm">
                <option value="subtle">Subtle - Gentle nudge</option>
                <option value="moderate">Moderate - Clear direction</option>
                <option value="progressive">Progressive - 3 levels (subtle → obvious)</option>
                <option value="narrative">Narrative - Hints woven into story</option>
              </select>
            </div>
            <Button onClick={generate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><Lightbulb className="w-4 h-4 mr-2" />Generate Hints (3 Credits)</>}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card className="border-emerald-500/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-500" />Generated Hints</CardTitle>
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
