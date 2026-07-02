import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Languages, Loader2, Copy, Check, Sparkles, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTutorialAICredits } from "@/hooks/useTutorialAICredits";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const CREDITS_COST = 4;

interface Props { onBack: () => void; }

const languages = [
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "pt", label: "Portuguese" },
  { code: "it", label: "Italian" },
  { code: "zh", label: "Chinese (Simplified)" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "ar", label: "Arabic" },
  { code: "hi", label: "Hindi" },
  { code: "ru", label: "Russian" },
  { code: "pl", label: "Polish" },
];

export function AICourseTranslatorView({ onBack }: Props) {
  const { toast } = useToast();
  const { credits, isDeducting, checkAndDeduct } = useTutorialAICredits();
  const [content, setContent] = useState("");
  const [targetLang, setTargetLang] = useState("es");
  const [contentType, setContentType] = useState("lesson");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const translate = async () => {
    if (content.trim().length < 10) {
      toast({ title: "Too Short", description: "Enter at least 10 characters", variant: "destructive" });
      return;
    }
    const creditOk = await checkAndDeduct(CREDITS_COST);
    if (!creditOk) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stock-content-ai', {
        body: { action: 'translate-course', content, targetLang, contentType }
      });
      if (error) throw error;
      setResult(data.result);
      toast({ title: "Translation Complete!", description: "4 credits used" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Course Translator View - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Course Translator View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Course Translator View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <Languages className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">AI Course Translator</h2>
            <p className="text-muted-foreground">Auto-translate course content into any language</p>
          </div>
          <Badge className="ml-auto bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 shadow-md">
            <Sparkles className="w-3 h-3 mr-1" />4 Credits
          </Badge>
        </div>

        <Card className="mb-4 border-blue-500/20 bg-blue-500/5">
          <CardContent className="py-3 px-4">
            <div className="flex gap-2 items-start">
              <Globe className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground"><strong>Pro tip:</strong> Translate lesson descriptions, quiz questions, or entire module outlines. The AI preserves formatting and educational context.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 border-blue-500/10">
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Target Language</label>
                <select value={targetLang} onChange={e => setTargetLang(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2.5 text-sm">
                  {languages.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Content Type</label>
                <select value={contentType} onChange={e => setContentType(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2.5 text-sm">
                  <option value="lesson">Lesson Content</option>
                  <option value="quiz">Quiz Questions</option>
                  <option value="description">Course Description</option>
                  <option value="subtitles">Video Subtitles</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Content to Translate</label>
              <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Paste your course content here..." rows={6} />
            </div>
            <Button onClick={translate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Translating...</> : <><Languages className="w-4 h-4 mr-2" />Translate (4 Credits)</>}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card className="border-emerald-500/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-500" />Translation Result
              </CardTitle>
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