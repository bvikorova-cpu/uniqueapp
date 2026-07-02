import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Film, Wand2, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { handleEdgeError } from "@/lib/handleEdgeError";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface SceneSplit {
  scenes: Array<{ sceneNumber: number; durationSeconds: number; visualPrompt: string; cameraMove: string; lighting: string; mood: string; voiceoverLine: string; textOverlay?: string }>;
  totalScenes: number; totalDuration: number; suggestedAspect: string; styleGuide: string;
}

export const TextToVideoScenesView = ({ onBack }: { onBack: () => void }) => {
  const [script, setScript] = useState("");
  const [aspect, setAspect] = useState("9:16");
  const [style, setStyle] = useState("cinematic modern");
  const [sceneCount, setSceneCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [splitResult, setSplitResult] = useState<SceneSplit | null>(null);
  const [genVideo, setGenVideo] = useState(false);
  const [frames, setFrames] = useState<string[]>([]);
  const [activeFrame, setActiveFrame] = useState(0);

  const split = async () => {
    if (!script.trim()) { toast.error("Zadaj script"); return; }
    setLoading(true); setSplitResult(null); setFrames([]);
    try {
      const { data, error } = await supabase.functions.invoke('video-ad-tools', {
        body: { action: 'text_to_video_split', script, aspect, style, sceneCount },
      });
      if (error || data?.error) { handleEdgeError(error || data, { context: 'Text-to-Video' }); return; }
      setSplitResult(data.result);
      toast.success(`${data.result.totalScenes} scenes ready (${data.credits_used} CR)`);
    } catch (e) { handleEdgeError(e, { context: 'Text-to-Video' }); }
    finally { setLoading(false); }
  };

  const renderVideo = async () => {
    if (!splitResult) return;
    setGenVideo(true); setFrames([]);
    try {
      const scenes = splitResult.scenes.slice(0, 6).map(s => `${s.visualPrompt}. Lighting: ${s.lighting}. Mood: ${s.mood}. Camera: ${s.cameraMove}.`);
      const { data, error } = await supabase.functions.invoke('video-ad-scenes', { body: { scenes, aspectRatio: aspect } });
      if (error || data?.error) { handleEdgeError(error || data, { context: 'Video Frames' }); return; }
      const dataUrls = data.frames.map((f: { b64: string }) => `data:image/png;base64,${f.b64}`);
      setFrames(dataUrls);
      toast.success(`${dataUrls.length} scenes generated (${data.credits_used} CR)`);
      let i = 0;
      const t = setInterval(() => { i = (i + 1) % dataUrls.length; setActiveFrame(i); }, 2000);
      setTimeout(() => clearInterval(t), 60000);
    } catch (e) { handleEdgeError(e, { context: 'Video Frames' }); }
    finally { setGenVideo(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Text To Video Scenes View - How it works"} steps={[{ title: 'Open', desc: 'Access the Text To Video Scenes View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Text To Video Scenes View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4">← Back</Button>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center"><Film className="w-6 h-6 text-white" /></div>
        <div><h2 className="text-2xl font-black">Text-to-Video Scenes</h2><p className="text-sm text-muted-foreground">Runway/Sora-style B-roll from text</p></div>
        <Badge className="ml-auto bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white">3+5 CR</Badge>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Script *</Label><Textarea rows={6} value={script} onChange={e => setScript(e.target.value)} placeholder="Insert whole voiceover/script..." /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Aspect</Label>
                <select className="w-full mt-1 p-2 rounded-md border bg-background" value={aspect} onChange={e => setAspect(e.target.value)}>
                  <option value="9:16">9:16</option><option value="16:9">16:9</option><option value="1:1">1:1</option>
                </select>
              </div>
              <div><Label>Number of scenes</Label>
                <select className="w-full mt-1 p-2 rounded-md border bg-background" value={sceneCount} onChange={e => setSceneCount(Number(e.target.value))}>
                  {[3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <div><Label>Style</Label><input className="w-full mt-1 p-2 rounded-md border bg-background" value={style} onChange={e => setStyle(e.target.value)} /></div>
            <Button onClick={split} disabled={loading} className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-600">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Wand2 className="mr-2 h-4 w-4" />1
    </>
  ) Split into scenes (3 CR)</>}
            </Button>
            {splitResult && (
              <Button onClick={renderVideo} disabled={genVideo} variant="outline" className="w-full">
                {genVideo ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Play className="mr-2 h-4 w-4" />2) Generate frames (5 CR)</>}
              </Button>
            )}
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Scenes</CardTitle></CardHeader>
          <CardContent className="max-h-[700px] overflow-y-auto space-y-3">
            {!splitResult ? <p className="text-muted-foreground text-center py-12">Insert script and split into scenes</p> : (
              <>
                {frames.length > 0 && (
                  <div className={`relative ${aspect === '9:16' ? 'aspect-[9/16] max-w-xs mx-auto' : aspect === '1:1' ? 'aspect-square' : 'aspect-video'} bg-black rounded-lg overflow-hidden mb-4`}>
                    <AnimatePresence mode="wait">
                      <motion.img key={activeFrame} src={frames[activeFrame]} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="w-full h-full object-cover" />
                    </AnimatePresence>
                    <Badge className="absolute top-2 right-2 bg-black/60">Scene {activeFrame + 1}/{frames.length}</Badge>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 text-xs"><Badge variant="outline">📐 {splitResult.suggestedAspect}</Badge><Badge variant="outline">⏱ {splitResult.totalDuration}s</Badge><Badge variant="outline">🎬 {splitResult.totalScenes} scenes</Badge></div>
                <p className="text-sm italic text-muted-foreground">{splitResult.styleGuide}</p>
                {splitResult.scenes.map(s => (
                  <Card key={s.sceneNumber} className="bg-muted/30"><CardContent className="pt-3 text-sm space-y-1">
                    <div className="font-bold flex justify-between">Scene {s.sceneNumber} <Badge variant="secondary">{s.durationSeconds}s</Badge></div>
                    <p>{s.visualPrompt}</p>
                    <div className="flex flex-wrap gap-1 text-xs"><Badge variant="outline">📷 {s.cameraMove}</Badge><Badge variant="outline">💡 {s.lighting}</Badge><Badge variant="outline">😊 {s.mood}</Badge></div>
                    <p className="text-muted-foreground">VO: "{s.voiceoverLine}"</p>
                    {s.textOverlay && <Badge variant="secondary">Text: {s.textOverlay}</Badge>}
                  </CardContent></Card>
                ))}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
