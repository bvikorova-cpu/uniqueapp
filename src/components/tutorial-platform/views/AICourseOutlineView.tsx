import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Loader2, Copy, Check, Sparkles, Lightbulb, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTutorialAICredits } from "@/hooks/useTutorialAICredits";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const CREDITS_COST = 4;

interface Props { onBack: () => void; }

export function AICourseOutlineView({ onBack }: Props) {
  const { toast } = useToast();
  const { credits, isLoading: creditsLoading, isDeducting, checkAndDeduct } = useTutorialAICredits();
  const [title, setTitle] = useState("");
  const [audience, setAudience] = useState("beginners");
  const [modules, setModules] = useState("6");
  const [loading, setLoading] = useState(false);
  const [outline, setOutline] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateOutline = async () => {
    if (!title.trim()) {
      toast({ title: "Missing Title", description: "Enter a course title", variant: "destructive" });
      return;
    }

    const ok = await checkAndDeduct(CREDITS_COST);
    if (!ok) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stock-content-ai', {
        body: { action: 'generate-outline', title, audience, modules: parseInt(modules) }
      });
      if (error) throw error;
      setOutline(data.result);
      toast({ title: "Outline Generated!", description: `${CREDITS_COST} credits used` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Course Outline View - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Course Outline View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Course Outline View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">AI Course Outline</h2>
            <p className="text-muted-foreground">AI designs your complete course structure</p>
          </div>
          <Badge className="ml-auto bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0 shadow-md">
            <Sparkles className="w-3 h-3 mr-1" />4 Credits
          </Badge>
        </div>

        <Card className="mb-4 border-violet-500/20 bg-violet-500/5">
          <CardContent className="py-3 px-4">
            <div className="flex gap-2 items-start">
              <Lightbulb className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground"><strong>Pro tip:</strong> Include desired skills in the title for better results. E.g., "Complete React Development with TypeScript & Testing".</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 border-violet-500/10">
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Course Title</label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Complete React Development" className="h-11" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Target Audience</label>
                <select value={audience} onChange={e => setAudience(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2.5 text-sm">
                  <option value="beginners">Beginners</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="professionals">Professionals</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Number of Modules</label>
                <select value={modules} onChange={e => setModules(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2.5 text-sm">
                  <option value="4">4 Modules</option>
                  <option value="6">6 Modules</option>
                  <option value="8">8 Modules</option>
                  <option value="12">12 Modules</option>
                </select>
              </div>
            </div>
            <Button onClick={generateOutline} disabled={loading} className="w-full h-11 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><FileText className="w-4 h-4 mr-2" />Generate Outline (4 Credits)</>}
            </Button>
          </CardContent>
        </Card>

        {outline && (
          <Card className="border-emerald-500/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-500" />Course Outline
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(outline); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                {copied ? <Check className="w-4 h-4 mr-1 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1" />}{copied ? "Copied!" : "Copy"}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm bg-muted/50 rounded-xl p-5 border">{outline}</div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </>
  );
}