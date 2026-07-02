import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Shield, Loader2, CheckCircle, AlertTriangle, Sparkles, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTutorialAICredits } from "@/hooks/useTutorialAICredits";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const CREDITS_COST = 3;

interface Props { onBack: () => void; }

export function PlagiarismCheckerView({ onBack }: Props) {
  const { toast } = useToast();
  const { credits, isDeducting, checkAndDeduct } = useTutorialAICredits();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const checkPlagiarism = async () => {
    if (text.trim().length < 50) {
      toast({ title: "Too Short", description: "Enter at least 50 characters", variant: "destructive" });
      return;
    }
    const creditOk = await checkAndDeduct(CREDITS_COST);
    if (!creditOk) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stock-content-ai', {
        body: { action: 'plagiarism-check', text }
      });
      if (error) throw error;
      setResult(data.result);
      toast({ title: "Scan Complete!", description: "3 credits used" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Plagiarism Checker View - How it works"} steps={[{ title: 'Open', desc: 'Access the Plagiarism Checker View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Plagiarism Checker View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Plagiarism Checker</h2>
            <p className="text-muted-foreground">Check content originality before publishing</p>
          </div>
          <Badge className="ml-auto bg-gradient-to-r from-slate-500 to-gray-600 text-white border-0 shadow-md">
            <Sparkles className="w-3 h-3 mr-1" />3 Credits
          </Badge>
        </div>

        <Card className="mb-4 border-blue-500/20 bg-blue-500/5">
          <CardContent className="py-3 px-4">
            <div className="flex gap-2 items-start">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground"><strong>How it works:</strong> AI analyzes your text for originality, flags suspicious sections, and provides an overall originality score with improvement recommendations.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 border-slate-500/10">
          <CardContent className="pt-6 space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-semibold">Content to Check</label>
                <span className="text-xs text-muted-foreground">{text.length} characters (min 50)</span>
              </div>
              <Textarea value={text} onChange={e => setText(e.target.value)} placeholder="Paste your course content here..." rows={8} className="resize-none" />
            </div>
            <Button onClick={checkPlagiarism} disabled={loading} className="w-full h-11 bg-gradient-to-r from-slate-600 to-gray-700 hover:from-slate-700 hover:to-gray-800 shadow-lg">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Scanning...</> : <><Shield className="w-4 h-4 mr-2" />Check Plagiarism (3 Credits)</>}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card className="border-emerald-500/20 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                {typeof result === 'string' && result.toLowerCase().includes('original') ? (
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                  </div>
                )}
                <h3 className="text-lg font-bold">Scan Results</h3>
              </div>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm bg-muted/50 rounded-xl p-5 border">
                {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </>
  );
}