import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Loader2, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export default function IQCertificate() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!fullName.trim()) {
      toast({ title: "Please enter your full name", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast({ title: "Please login first", variant: "destructive" }); return; }

      const { data, error } = await supabase.functions.invoke("iq-platform-ai", {
        body: { action: "generate_certificate", fullName },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
      toast({ title: "Certificate generated!", description: `Used ${data.credits_used} credits` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How IQCertificate works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <>
      <div className="mb-8">
        <h2 className="text-xl sm:text-2xl font-black mb-4">📜 IQ Certificate</h2>
        <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border-indigo-500/20">
          <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shrink-0">
              <GraduationCap className="h-8 w-8" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-bold text-base mb-1">Generate Your IQ Certificate</h3>
              <p className="text-xs text-muted-foreground mb-2">
                Get a professional AI-generated certificate with your IQ score, percentile rank, cognitive breakdown, and personalized insights.
              </p>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <Badge variant="outline" className="text-xs">5 Credits</Badge>
                <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 text-xs">AI Generated</Badge>
              </div>
            </div>
            <Button onClick={() => setOpen(true)} className="bg-gradient-to-r from-indigo-600 to-purple-600 shrink-0">
              <FileText className="h-4 w-4 mr-2" /> Generate
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-indigo-500" />
              IQ Certificate Generator
              <Badge variant="outline" className="ml-auto">5 Credits</Badge>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[65vh] pr-4">
            {!result ? (
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Full Name (as it will appear on the certificate)</label>
                  <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. John Smith" />
                </div>
                <Button onClick={handleGenerate} disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600">
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating Certificate...</> : "Generate Certificate (5 Credits)"}
                </Button>
              </div>
            ) : (
              <div className="py-2">
                <div className="border-2 border-indigo-500/30 rounded-xl p-6 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 text-center mb-4">
                  <GraduationCap className="h-10 w-10 text-indigo-500 mx-auto mb-2" />
                  <h3 className="text-lg font-black">Certificate of Intelligence</h3>
                  <p className="text-sm text-muted-foreground mb-4">This certifies that</p>
                  <p className="text-xl font-black text-indigo-500 mb-2">{result.full_name || fullName}</p>
                  <p className="text-3xl font-black mb-1">IQ: {result.iq_score || "—"}</p>
                  <p className="text-sm text-muted-foreground">Percentile: {result.percentile || "—"}th</p>
                  <p className="text-sm text-muted-foreground">Classification: {result.classification || "—"}</p>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{formatCertResult(result)}</ReactMarkdown>
                </div>
                <div className="mt-4 text-xs text-muted-foreground">
                  Credits used: {result.credits_used} | Remaining: {result.credits_remaining}
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
    </>
    );
}

function formatCertResult(data: any): string {
  const lines: string[] = [];
  if (data.cognitive_breakdown) {
    lines.push("## Cognitive Breakdown");
    if (Array.isArray(data.cognitive_breakdown)) {
      data.cognitive_breakdown.forEach((item: any) => {
        lines.push(`- **${item.domain || item.area}**: ${item.score || item.level} — ${item.description || ""}`);
      });
    }
  }
  if (data.strengths) {
    lines.push("\n## Key Strengths");
    (Array.isArray(data.strengths) ? data.strengths : [data.strengths]).forEach((s: string) => lines.push(`- ${s}`));
  }
  if (data.recommendations) {
    lines.push("\n## Recommendations");
    (Array.isArray(data.recommendations) ? data.recommendations : [data.recommendations]).forEach((r: string) => lines.push(`- ${r}`));
  }
  if (data.insights) {
    lines.push(`\n## Insights\n${data.insights}`);
  }
  return lines.join("\n");
}
