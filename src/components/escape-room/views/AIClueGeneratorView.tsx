import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Wand2, Loader2, Copy, Check, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function AIClueGeneratorView({ onBack }: Props) {
  const { toast } = useToast();
  const [theme, setTheme] = useState("");
  const [clueCount, setClueCount] = useState("5");
  const [style, setStyle] = useState("cryptic");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (theme.trim().length < 3) {
      toast({ title: "Too Short", description: "Enter at least 3 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("stock-content-ai", {
        body: { action: "escape-clue-gen", theme, clueCount: parseInt(clueCount), style }
      });
      if (error) throw error;
      setResult(data.result);
      toast({ title: "Clues Generated!", description: "4 credits used" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed", variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Clue Generator View - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Clue Generator View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Clue Generator View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Wand2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">AI Clue Generator</h2>
            <p className="text-muted-foreground">Generate interconnected clue chains</p>
          </div>
          <Badge className="ml-auto bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white border-0 shadow-md">
            <Sparkles className="w-3 h-3 mr-1" />4 Credits
          </Badge>
        </div>

        <Card className="mb-6 border-fuchsia-500/10">
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Theme / Room Setting</label>
              <Input value={theme} onChange={e => setTheme(e.target.value)} placeholder="e.g., Medieval castle, Space station, Pirate ship..." className="h-11" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Clue Count</label>
                <select value={clueCount} onChange={e => setClueCount(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2.5 text-sm">
                  <option value="3">3 Clues</option>
                  <option value="5">5 Clues</option>
                  <option value="8">8 Clues</option>
                  <option value="10">10 Clues</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Style</label>
                <select value={style} onChange={e => setStyle(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2.5 text-sm">
                  <option value="cryptic">Cryptic Riddles</option>
                  <option value="visual">Visual / Symbol-Based</option>
                  <option value="narrative">Embedded in Story</option>
                  <option value="physical">Physical Interaction</option>
                </select>
              </div>
            </div>
            <Button onClick={generate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 shadow-lg">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><Wand2 className="w-4 h-4 mr-2" />Generate Clues (4 Credits)</>}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card className="border-emerald-500/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-500" />Clue Chain</CardTitle>
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
