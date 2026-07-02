import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2, Subtitles, Download, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { handleEdgeError } from "@/lib/handleEdgeError";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface CapResult {
  captions: Array<{ startTime: number; endTime: number; text: string; style: string; position: string; animation: string; color: string; emoji?: string }>;
  totalDuration: number; recommendedFont: string; srtFormat: string;
  styleGuide: Record<string, string>; engagementTips: string[];
}

export const CaptionsView = ({ onBack }: { onBack: () => void }) => {
  const [script, setScript] = useState("");
  const [duration, setDuration] = useState(30);
  const [style, setStyle] = useState("modern bold");
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CapResult | null>(null);

  const generate = async () => {
    if (!script.trim()) { toast.error("Zadaj script"); return; }
    setLoading(true); setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('video-ad-tools', {
        body: { action: 'caption_generator', script, duration, style, language, platform: 'tiktok' },
      });
      if (error || data?.error) { handleEdgeError(error || data, { context: 'Captions' }); return; }
      setResult(data.result);
      toast.success(`${data.result.captions.length} captions created (${data.credits_used} CR)`);
    } catch (e) { handleEdgeError(e, { context: 'Captions' }); }
    finally { setLoading(false); }
  };

  const downloadSrt = () => {
    if (!result) return;
    const blob = new Blob([result.srtFormat], { type: 'text/plain' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `captions-${Date.now()}.srt`; a.click();
  };

  return (
    <>
      <FloatingHowItWorks title={"Captions View - How it works"} steps={[{ title: 'Open', desc: 'Access the Captions View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Captions View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4">← Back</Button>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center"><Subtitles className="w-6 h-6 text-white" /></div>
        <div><h2 className="text-2xl font-black">Auto Captions Generator</h2><p className="text-sm text-muted-foreground">Animated captions in CapCut style + SRT export</p></div>
        <Badge className="ml-auto bg-gradient-to-r from-amber-500 to-orange-600 text-white">3 CR</Badge>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Script / Voiceover *</Label><Textarea rows={6} value={script} onChange={e => setScript(e.target.value)} placeholder="Paste the entire voiceover..." /></div>
            <div><Label>Duration (s)</Label><Input type="number" value={duration} onChange={e => setDuration(parseInt(e.target.value) || 30)} min={5} max={300} /></div>
            <div><Label>Style</Label><Input value={style} onChange={e => setStyle(e.target.value)} placeholder="modern bold, minimal, neon..." /></div>
            <div><Label>Jazyk</Label>
              <select className="w-full mt-1 p-2 rounded-md border bg-background" value={language} onChange={e => setLanguage(e.target.value)}>
                {['Slovak','English','Czech','Hungarian','Polish','German','Spanish','French','Italian','Portuguese'].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <Button onClick={generate} disabled={loading} className="w-full bg-gradient-to-r from-amber-500 to-orange-600">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</> : <>Generate (3 CR)</>}
            </Button>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="flex justify-between items-center"><span>Captions</span>{result && <Button size="sm" variant="outline" onClick={downloadSrt}><Download className="w-4 h-4 mr-1" />SRT</Button>}</CardTitle></CardHeader>
          <CardContent className="max-h-[700px] overflow-y-auto">
            {!result ? <p className="text-muted-foreground text-center py-12">Enter the script and generate captions</p> : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2"><Badge variant="outline">Font: {result.recommendedFont}</Badge><Badge variant="outline">Trvanie: {result.totalDuration}s</Badge></div>
                {result.captions.map((c, i) => (
                  <Card key={i} className="bg-muted/30">
                    <CardContent className="pt-3 flex items-center gap-3">
                      <Badge variant="secondary">{c.startTime.toFixed(1)}s → {c.endTime.toFixed(1)}s</Badge>
                      <span className="font-bold text-lg" style={{ color: c.color }}>{c.emoji} {c.text}</span>
                      <div className="ml-auto flex gap-1 text-xs"><Badge variant="outline">{c.position}</Badge><Badge variant="outline">{c.animation}</Badge></div>
                    </CardContent>
                  </Card>
                ))}
                <div><h4 className="font-semibold mt-4 mb-2">💡 Engagement Tips</h4>
                  <ul className="text-sm space-y-1">{result.engagementTips.map((t, i) => <li key={i}>• {t}</li>)}</ul>
                </div>
                <details className="mt-4"><summary className="cursor-pointer font-semibold">📄 SRT preview</summary><pre className="text-xs bg-muted p-3 rounded mt-2 overflow-x-auto whitespace-pre-wrap">{result.srtFormat}</pre></details>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
};
