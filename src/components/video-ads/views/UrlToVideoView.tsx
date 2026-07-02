import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Link2, Video, Wand2, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { handleEdgeError } from "@/lib/handleEdgeError";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface UrlResult {
  productName: string; valueProposition: string; targetAudience: string;
  suggestedPlatform: string; suggestedDuration: number; script: string;
  scenes: Array<{ duration: string; description: string; voiceover: string; visuals: string; textOverlay?: string }>;
  callToAction: string; hooks: string[]; musicSuggestion: string; brandTone: string;
}

export const UrlToVideoView = ({ onBack }: { onBack: () => void }) => {
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState("auto");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UrlResult | null>(null);
  const [genVideo, setGenVideo] = useState(false);
  const [frames, setFrames] = useState<string[]>([]);
  const [activeFrame, setActiveFrame] = useState(0);

  const generate = async () => {
    if (!url.trim()) { toast.error("Zadaj URL"); return; }
    setLoading(true); setResult(null); setFrames([]);
    try {
      const { data, error } = await supabase.functions.invoke('video-ad-tools', {
        body: { action: 'url_to_video', url, platform },
      });
      if (error || data?.error) { handleEdgeError(error || data, { context: 'URL to Video' }); return; }
      setResult(data.result);
      toast.success("Video ad prepared! (" + data.credits_used + " CR)");
    } catch (e) { handleEdgeError(e, { context: 'URL to Video' }); }
    finally { setLoading(false); }
  };

  const generateVideoFrames = async () => {
    if (!result) return;
    setGenVideo(true); setFrames([]);
    try {
      const scenes = result.scenes.slice(0, 5).map(s => s.visuals || s.description);
      const { data, error } = await supabase.functions.invoke('video-ad-scenes', {
        body: { scenes, aspectRatio: result.suggestedPlatform === 'tiktok' || result.suggestedPlatform === 'instagram' ? '9:16' : '16:9' },
      });
      if (error || data?.error) { handleEdgeError(error || data, { context: 'Video Frames' }); return; }
      const dataUrls = data.frames.map((f: { b64: string }) => `data:image/png;base64,${f.b64}`);
      setFrames(dataUrls);
      toast.success(`${dataUrls.length} scenes generated (${data.credits_used} CR)`);
      // Auto-play frame sequence
      let i = 0;
      const interval = setInterval(() => {
        i++; if (i >= dataUrls.length) i = 0;
        setActiveFrame(i);
      }, 2000);
      setTimeout(() => clearInterval(interval), 60000);
    } catch (e) { handleEdgeError(e, { context: 'Video Frames' }); }
    finally { setGenVideo(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Url To Video View - How it works"} steps={[{ title: 'Open', desc: 'Access the Url To Video View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Url To Video View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4">← Back</Button>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center"><Link2 className="w-6 h-6 text-white" /></div>
        <div><h2 className="text-2xl font-black">URL to Video Ad</h2><p className="text-sm text-muted-foreground">Insert link → complete video ad</p></div>
        <Badge className="ml-auto bg-gradient-to-r from-cyan-500 to-blue-600 text-white">5 CR</Badge>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>URL produktu / landing page *</Label><Input placeholder="https://..." value={url} onChange={e => setUrl(e.target.value)} /></div>
            <div><Label>Platforma</Label>
              <select className="w-full mt-1 p-2 rounded-md border bg-background" value={platform} onChange={e => setPlatform(e.target.value)}>
                <option value="auto">Auto-detekcia</option><option value="tiktok">TikTok</option><option value="instagram">Instagram</option><option value="youtube">YouTube</option><option value="facebook">Facebook</option>
              </select>
            </div>
            <Button onClick={generate} disabled={loading} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing page...</> : <><Wand2 className="mr-2 h-4 w-4" />Create (5 CR)</>}
            </Button>
            {result && (
              <Button onClick={generateVideoFrames} disabled={genVideo} className="w-full bg-gradient-to-r from-purple-500 to-pink-600">
                {genVideo ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating frames...</> : <><Video className="mr-2 h-4 w-4" />Generate video frames (+5 CR)</>}
              </Button>
            )}
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Result</CardTitle></CardHeader>
          <CardContent className="max-h-[700px] overflow-y-auto space-y-4">
            {!result ? <p className="text-muted-foreground text-center py-12">Insert URL to generate</p> : (
              <>
                {frames.length > 0 && (
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
                    <AnimatePresence mode="wait">
                      <motion.img key={activeFrame} src={frames[activeFrame]} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="w-full h-full object-cover" />
                    </AnimatePresence>
                    <div className="absolute bottom-2 left-2 right-2 flex gap-1">
                      {frames.map((_, i) => <div key={i} className={`h-1 flex-1 rounded ${i === activeFrame ? 'bg-white' : 'bg-white/30'}`} />)}
                    </div>
                    <Badge className="absolute top-2 right-2 bg-black/60"><Play className="w-3 h-3 mr-1" />Scene {activeFrame + 1}/{frames.length}</Badge>
                  </div>
                )}
                <div><h3 className="font-bold text-lg">{result.productName}</h3><p className="text-sm text-muted-foreground">{result.valueProposition}</p></div>
                <div className="grid grid-cols-2 gap-2 text-xs"><Badge variant="outline">🎯 {result.targetAudience}</Badge><Badge variant="outline">📱 {result.suggestedPlatform}</Badge><Badge variant="outline">⏱ {result.suggestedDuration}s</Badge><Badge variant="outline">🎵 {result.musicSuggestion}</Badge></div>
                <div><h4 className="font-semibold mb-1">📝 Script</h4><p className="text-sm whitespace-pre-wrap">{result.script}</p></div>
                <div><h4 className="font-semibold mb-2">🪝 Alternative Hooks</h4>{result.hooks.map((h, i) => <p key={i} className="text-sm pl-3 border-l-2 border-cyan-500 mb-1">{h}</p>)}</div>
                <div><h4 className="font-semibold mb-2">🎬 Scenes</h4>{result.scenes.map((s, i) => (
                  <Card key={i} className="mb-2 bg-muted/30"><CardContent className="pt-3 text-sm space-y-1">
                    <div className="font-medium">Scene {i + 1} ({s.duration})</div>
                    <p>{s.description}</p>
                    <p className="text-muted-foreground">VO: "{s.voiceover}"</p>
                    {s.textOverlay && <Badge variant="secondary">Text: {s.textOverlay}</Badge>}
                  </CardContent></Card>
                ))}</div>
                <div><h4 className="font-semibold">📢 CTA</h4><p className="text-sm">{result.callToAction}</p></div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
};
