import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Shield, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props { onBack: () => void; }

export function PlagiarismCheckerView({ onBack }: Props) {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const checkPlagiarism = async () => {
    if (text.trim().length < 50) {
      toast({ title: "Too Short", description: "Enter at least 50 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('tutorial-ai-tools', {
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
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-slate-500" />
          <div>
            <h2 className="text-2xl font-black">Plagiarism Checker</h2>
            <p className="text-muted-foreground">Check content originality before publishing</p>
          </div>
          <Badge className="ml-auto">3 Credits</Badge>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6 space-y-4">
            <Textarea value={text} onChange={e => setText(e.target.value)} placeholder="Paste your course content here (min 50 characters)..." rows={8} />
            <Button onClick={checkPlagiarism} disabled={loading} className="w-full">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Scanning...</> : <><Shield className="w-4 h-4 mr-2" />Check Plagiarism (3 Credits)</>}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                {typeof result === 'string' && result.toLowerCase().includes('original') ? (
                  <CheckCircle className="w-8 h-8 text-green-500" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-yellow-500" />
                )}
                <h3 className="text-lg font-semibold">Scan Results</h3>
              </div>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm bg-muted/50 rounded-lg p-4">
                {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
