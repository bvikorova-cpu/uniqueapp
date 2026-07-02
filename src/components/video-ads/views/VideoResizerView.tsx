import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Crop, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { handleEdgeError } from "@/lib/handleEdgeError";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface ResizeResult {
  source: string;
  targets: Array<{ ratio: string; platform: string; reframingStrategy: string; focalPoint: string; cropZones: Array<{ scene: string; instruction: string }>; textRepositioning: string; ctaPlacement: string; durationAdjustment: string }>;
  commonMistakes: string[]; ffmpegCommandHint: string;
}

export const VideoResizerView = ({ onBack }: { onBack: () => void }) => {
  const [sourceRatio, setSourceRatio] = useState("16:9");
  const [subject, setSubject] = useState("center");
  const [hasText, setHasText] = useState("yes");
  const [targets, setTargets] = useState("TikTok 9:16, Instagram Reels 9:16, YouTube Shorts 9:16, Square 1:1");
  const [loading, setLoading] = useState(false);
  const [r, setR] = useState<ResizeResult | null>(null);

  const go = async () => {
    setLoading(true); setR(null);
    try {
      const { data, error } = await supabase.functions.invoke('video-ad-tools', {
        body: { action: 'resize_advice', sourceRatio, subject, hasText, targets },
      });
      if (error || data?.error) { handleEdgeError(error || data, { context: 'Video Resizer' }); return; }
      setR(data.result);
      toast.success(`${data.result.targets.length} formats prepared (${data.credits_used} CR)`);
    } catch (e) { handleEdgeError(e, { context: 'Video Resizer' }); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Video Resizer View - How it works"} steps={[{ title: 'Open', desc: 'Access the Video Resizer View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Video Resizer View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4">← Back</Button>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center"><Crop className="w-6 h-6 text-white" /></div>
        <div><h2 className="text-2xl font-black">Video Resizer / Auto-Crop</h2><p className="text-sm text-muted-foreground">Reframing for all platforms</p></div>
        <Badge className="ml-auto bg-gradient-to-r from-orange-500 to-pink-600 text-white">3 CR</Badge>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Source aspect ratio</Label>
              <select className="w-full mt-1 p-2 rounded-md border bg-background" value={sourceRatio} onChange={e => setSourceRatio(e.target.value)}>
                <option>16:9</option><option>9:16</option><option>1:1</option><option>4:5</option><option>21:9</option>
              </select>
            </div>
            <div><Label>Main subject</Label><input className="w-full mt-1 p-2 rounded-md border bg-background" value={subject} onChange={e => setSubject(e.target.value)} placeholder="center, left third, person face..." /></div>
            <div><Label>On-screen text</Label>
              <select className="w-full mt-1 p-2 rounded-md border bg-background" value={hasText} onChange={e => setHasText(e.target.value)}>
                <option value="yes">Yes</option><option value="no">No</option>
              </select>
            </div>
            <div><Label>Target formats</Label><textarea className="w-full mt-1 p-2 rounded-md border bg-background" rows={2} value={targets} onChange={e => setTargets(e.target.value)} /></div>
            <Button onClick={go} disabled={loading} className="w-full bg-gradient-to-r from-orange-500 to-pink-600">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Generate plan (3 CR)'}
            </Button>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Reframing plan</CardTitle></CardHeader>
          <CardContent className="max-h-[700px] overflow-y-auto space-y-3">
            {!r ? <p className="text-muted-foreground text-center py-12">Fill in and generate</p> : (
              <>
                <Badge variant="outline">Zdroj: {r.source}</Badge>
                {r.targets.map((t, i) => (
                  <Card key={i} className="bg-muted/30"><CardContent className="pt-3 space-y-2 text-sm">
                    <div className="font-bold flex items-center gap-2">{t.platform} <Badge>{t.ratio}</Badge></div>
                    <p><strong>Strategy:</strong> {t.reframingStrategy}</p>
                    <p><strong>Focal point:</strong> {t.focalPoint}</p>
                    <p><strong>Text:</strong> {t.textRepositioning}</p>
                    <p><strong>CTA:</strong> {t.ctaPlacement}</p>
                    <p><strong>Duration:</strong> {t.durationAdjustment}</p>
                    {t.cropZones?.length > 0 && <details><summary className="cursor-pointer font-medium">Crop zones</summary><ul className="mt-1 pl-4">{t.cropZones.map((c, j) => <li key={j}>• <strong>{c.scene}:</strong> {c.instruction}</li>)}</ul></details>}
                  </CardContent></Card>
                ))}
                <div><h4 className="font-semibold mb-1">⚠️ Common mistakes</h4><ul className="text-sm">{r.commonMistakes.map((m, i) => <li key={i}>• {m}</li>)}</ul></div>
                <div><h4 className="font-semibold mb-1 flex justify-between items-center">FFmpeg command <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(r.ffmpegCommandHint); toast.success('Copied'); }}><Copy className="w-3 h-3" /></Button></h4>
                  <pre className="text-xs bg-muted p-2 rounded overflow-x-auto whitespace-pre-wrap">{r.ffmpegCommandHint}</pre></div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
};
