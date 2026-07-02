import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, Loader2, Copy, Check, Puzzle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function AIPuzzleGeneratorView({ onBack }: Props) {
  const { toast } = useToast();
  const [theme, setTheme] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [puzzleType, setPuzzleType] = useState("riddle");
  const [count, setCount] = useState("3");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (theme.trim().length < 3) {
      toast({ title: "Too Short", description: "Enter at least 3 characters for the theme", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("stock-content-ai", {
        body: { action: "escape-puzzle-gen", theme, difficulty, puzzleType, count: parseInt(count) }
      });
      if (error) throw error;
      setResult(data.result);
      toast({ title: "Puzzles Generated!", description: "4 credits used" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed", variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Puzzle Generator View - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Puzzle Generator View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Puzzle Generator View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">AI Puzzle Generator</h2>
            <p className="text-muted-foreground">Generate unique escape room puzzles with AI</p>
          </div>
          <Badge className="ml-auto bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0 shadow-md">
            <Sparkles className="w-3 h-3 mr-1" />4 Credits
          </Badge>
        </div>

        <Card className="mb-4 border-violet-500/20 bg-violet-500/5">
          <CardContent className="py-3 px-4">
            <div className="flex gap-2 items-start">
              <Puzzle className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground"><strong>Pro tip:</strong> Specify a detailed theme like "haunted Victorian mansion" for more immersive puzzles. AI generates riddles, codes, logic puzzles, and pattern challenges.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 border-violet-500/10">
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Room Theme</label>
              <Input value={theme} onChange={e => setTheme(e.target.value)} placeholder="e.g., Ancient Egyptian tomb, Cyberpunk heist, Haunted asylum..." className="h-11" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Difficulty</label>
                <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2.5 text-sm">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Puzzle Type</label>
                <select value={puzzleType} onChange={e => setPuzzleType(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2.5 text-sm">
                  <option value="riddle">Riddle</option>
                  <option value="code">Code Breaking</option>
                  <option value="logic">Logic Puzzle</option>
                  <option value="pattern">Pattern Recognition</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Count</label>
                <select value={count} onChange={e => setCount(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2.5 text-sm">
                  <option value="1">1 Puzzle</option>
                  <option value="3">3 Puzzles</option>
                  <option value="5">5 Puzzles</option>
                  <option value="10">10 Puzzles</option>
                </select>
              </div>
            </div>
            <Button onClick={generate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><Sparkles className="w-4 h-4 mr-2" />Generate Puzzles (4 Credits)</>}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card className="border-emerald-500/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-500" />Generated Puzzles</CardTitle>
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
