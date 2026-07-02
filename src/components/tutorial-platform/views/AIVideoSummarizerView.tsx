import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileVideo, Loader2, Copy, Check, Sparkles, ListOrdered, Clock, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTutorialAICredits } from "@/hooks/useTutorialAICredits";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const CREDITS_COST = 5;

interface Props { onBack: () => void; }

export function AIVideoSummarizerView({ onBack }: Props) {
  const { toast } = useToast();
  const { credits, isDeducting, checkAndDeduct } = useTutorialAICredits();
  const [transcript, setTranscript] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [summaryType, setSummaryType] = useState("detailed");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const summarize = async () => {
    if (transcript.trim().length < 30) {
      toast({ title: "Too Short", description: "Enter at least 30 characters of transcript", variant: "destructive" });
      return;
    }
    const creditOk = await checkAndDeduct(CREDITS_COST);
    if (!creditOk) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stock-content-ai', {
        body: { action: 'summarize-video', transcript, videoTitle, summaryType }
      });
      if (error) throw error;
      setResult(data.result);
      toast({ title: "Summary Generated!", description: "5 credits used" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Video Summarizer View - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Video Summarizer View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Video Summarizer View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg">
            <FileVideo className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">AI Video Summarizer</h2>
            <p className="text-muted-foreground">Convert video lessons into structured text notes</p>
          </div>
          <Badge className="ml-auto bg-gradient-to-r from-rose-500 to-red-500 text-white border-0 shadow-md">
            <Sparkles className="w-3 h-3 mr-1" />5 Credits
          </Badge>
        </div>

        <Card className="mb-4 border-rose-500/20 bg-rose-500/5">
          <CardContent className="py-3 px-4">
            <div className="flex gap-2 items-start">
              <BookOpen className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground"><strong>How it works:</strong> Paste a video transcript or lesson content, and AI will generate structured notes with key takeaways, summaries, and action items.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 border-rose-500/10">
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Video Title (optional)</label>
              <Input value={videoTitle} onChange={e => setVideoTitle(e.target.value)} placeholder="e.g., React Hooks Deep Dive - Lesson 5" className="h-11" />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Summary Style</label>
              <select value={summaryType} onChange={e => setSummaryType(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2.5 text-sm">
                <option value="detailed">Detailed Notes (with timestamps)</option>
                <option value="bullet">Bullet Point Summary</option>
                <option value="outline">Structured Outline</option>
                <option value="flashcards">Flashcard-Style Q&A</option>
              </select>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-semibold">Video Transcript / Content</label>
                <span className="text-xs text-muted-foreground">{transcript.length} chars (min 30)</span>
              </div>
              <Textarea value={transcript} onChange={e => setTranscript(e.target.value)} placeholder="Paste the video transcript or detailed lesson content here..." rows={8} className="resize-none" />
            </div>
            <Button onClick={summarize} disabled={loading} className="w-full h-11 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-lg">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Summarizing...</> : <><FileVideo className="w-4 h-4 mr-2" />Summarize Video (5 Credits)</>}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card className="border-emerald-500/20 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-emerald-500" />
                Video Summary
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                {copied ? <Check className="w-4 h-4 mr-1 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1" />}{copied ? "Copied!" : "Copy Notes"}
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