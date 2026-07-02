import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Palette, Loader2, Copy, Check, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function AIThemeDesignerView({ onBack }: Props) {
  const { toast } = useToast();
  const [concept, setConcept] = useState("");
  const [mood, setMood] = useState("dark");
  const [era, setEra] = useState("modern");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (concept.trim().length < 5) {
      toast({ title: "Too Short", description: "Enter at least 5 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("stock-content-ai", {
        body: { action: "escape-theme-gen", concept, mood, era }
      });
      if (error) throw error;
      setResult(data.result);
      toast({ title: "Theme Designed!", description: "5 credits used" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed", variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Theme Designer View - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Theme Designer View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Theme Designer View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
            <Palette className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">AI Theme Designer</h2>
            <p className="text-muted-foreground">Design complete room atmospheres & visual themes</p>
          </div>
          <Badge className="ml-auto bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0 shadow-md">
            <Sparkles className="w-3 h-3 mr-1" />5 Credits
          </Badge>
        </div>

        <Card className="mb-6 border-pink-500/10">
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Room Concept</label>
              <Input value={concept} onChange={e => setConcept(e.target.value)} placeholder="e.g., Abandoned submarine deep underwater, Victorian séance parlor..." className="h-11" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Mood</label>
                <select value={mood} onChange={e => setMood(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2.5 text-sm">
                  <option value="dark">Dark & Sinister</option>
                  <option value="mysterious">Mysterious</option>
                  <option value="whimsical">Whimsical</option>
                  <option value="futuristic">Futuristic</option>
                  <option value="ancient">Ancient & Sacred</option>
                  <option value="steampunk">Steampunk</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Era</label>
                <select value={era} onChange={e => setEra(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2.5 text-sm">
                  <option value="ancient">Ancient</option>
                  <option value="medieval">Medieval</option>
                  <option value="victorian">Victorian</option>
                  <option value="modern">Modern</option>
                  <option value="futuristic">Futuristic</option>
                  <option value="post-apocalyptic">Post-Apocalyptic</option>
                </select>
              </div>
            </div>
            <Button onClick={generate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 shadow-lg">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Designing...</> : <><Palette className="w-4 h-4 mr-2" />Design Theme (5 Credits)</>}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card className="border-emerald-500/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-500" />Room Theme Design</CardTitle>
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
