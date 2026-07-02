import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Presentation, Loader2, Copy, Check, Sparkles, Monitor } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTutorialAICredits } from "@/hooks/useTutorialAICredits";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const CREDITS_COST = 5;

interface Props { onBack: () => void; }

export function AIPresentationBuilderView({ onBack }: Props) {
  const { toast } = useToast();
  const { credits, isDeducting, checkAndDeduct } = useTutorialAICredits();
  const [title, setTitle] = useState("");
  const [outline, setOutline] = useState("");
  const [slideCount, setSlideCount] = useState("10");
  const [style, setStyle] = useState("professional");
  const [audience, setAudience] = useState("general");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generatePresentation = async () => {
    if (!title.trim()) {
      toast({ title: "Missing Title", description: "Please enter a presentation title", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('stock-content-ai', {
        body: { action: 'generate-presentation', title, outline, slideCount: parseInt(slideCount), style, audience }
      });
      if (error) throw error;
      setResult(data?.result || "No content generated");
    } catch (err: any) {
      toast({ title: "Generation Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Presentation Builder View - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Presentation Builder View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Presentation Builder View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Presentation className="h-6 w-6 text-rose-500" /> AI Presentation Builder
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-[10px]">5 CR</Badge>
          </h1>
          <p className="text-sm text-muted-foreground">Generate complete slide decks from course outlines</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-rose-500/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Monitor className="h-5 w-5 text-rose-500" /> Presentation Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-1 block">Presentation Title</label>
              <Input placeholder="e.g. Introduction to Machine Learning..." value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Outline / Key Points (optional)</label>
              <Textarea placeholder="Enter key topics, bullet points, or paste a course outline..." value={outline} onChange={e => setOutline(e.target.value)} rows={5} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold mb-1 block">Slides</label>
                <Select value={slideCount} onValueChange={setSlideCount}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[5, 8, 10, 15, 20].map(n => <SelectItem key={n} value={n.toString()}>{n} slides</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">Style</label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Target Audience</label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="students">Students</SelectItem>
                  <SelectItem value="professionals">Professionals</SelectItem>
                  <SelectItem value="executives">Executives</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={generatePresentation} disabled={loading} className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Building...</> : <><Presentation className="h-4 w-4 mr-2" /> Build Presentation</>}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-rose-500/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-rose-500" /> Slide Content</span>
              {result && <Button variant="ghost" size="sm" onClick={handleCopy}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap text-sm leading-relaxed max-h-[600px] overflow-y-auto">{result}</div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <Presentation className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm">Configure and generate your presentation</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
