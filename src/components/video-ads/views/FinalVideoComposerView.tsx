import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Film, Download, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { handleEdgeError } from "@/lib/handleEdgeError";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface SceneImg { id: string; file: File; preview: string; }
interface Sfx { id: string; prompt: string; duration: number; volume: number; audio?: Uint8Array; previewUrl?: string; loading?: boolean; }

export const FinalVideoComposerView = ({ onBack }: { onBack: () => void }) => {
  const [scenes, setScenes] = useState<SceneImg[]>([]);
  const [perScene, setPerScene] = useState(3);
  const SFX_VOL_KEY = 'video-ad:sfx-volumes';
  const SFX_DEFAULT_VOL_KEY = 'video-ad:sfx-default-volume';
  const readVolMap = (): Record<string, number> => {
    try { return JSON.parse(localStorage.getItem(SFX_VOL_KEY) || '{}'); } catch { return {}; }
  };
  const [sfxList, setSfxList] = useState<Sfx[]>([]);
  const [rendering, setRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [ffmpegReady, setFfmpegReady] = useState(false);
  const [loadingFfmpeg, setLoadingFfmpeg] = useState(false);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const map: Record<string, number> = {};
      sfxList.forEach(s => { map[s.id] = s.volume; });
      localStorage.setItem(SFX_VOL_KEY, JSON.stringify(map));
    } catch {}
  }, [sfxList]);

  const loadFfmpeg = async () => {
    if (ffmpegRef.current) return ffmpegRef.current;
    setLoadingFfmpeg(true);
    try {
      const ff = new FFmpeg();
      ff.on("progress", ({ progress }) => setProgress(Math.round(progress * 100)));
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";
      await ff.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm") });
      ffmpegRef.current = ff;
      setFfmpegReady(true);
      return ff;
    } finally { setLoadingFfmpeg(false); }
  };

  useEffect(() => () => {
    scenes.forEach(s => URL.revokeObjectURL(s.preview));
    sfxList.forEach(s => s.previewUrl && URL.revokeObjectURL(s.previewUrl));
    if (outputUrl) URL.revokeObjectURL(outputUrl);
  }, []);

  const addImages = (files: FileList | null) => { if (!files) return;
    const imgs: SceneImg[] = Array.from(files).filter(f => f.type.startsWith("image/")).map(f => ({
      id: crypto.randomUUID(), file: f, preview: URL.createObjectURL(f) }));
    setScenes(s => [...s, ...imgs]);
  };

  const removeScene = (id: string) => setScenes(s => s.filter(x => x.id !== id));

  const addSfx = () => {
    const id = crypto.randomUUID();
    const map = readVolMap();
    const def = parseFloat(localStorage.getItem(SFX_DEFAULT_VOL_KEY) || '');
    const volume = map[id] ?? (isNaN(def) ? 0.6 : def);
    setSfxList(l => [...l, { id, prompt: "", duration: 3, volume }]);
  };
  const updateSfx = (id: string, patch: Partial<Sfx>) => {
    if (typeof patch.volume === 'number') {
      try { localStorage.setItem(SFX_DEFAULT_VOL_KEY, String(patch.volume)); } catch {}
    }
    setSfxList(l => l.map(s => s.id === id ? { ...s, ...patch } : s));
  };
  const removeSfx = (id: string) => setSfxList(l => l.filter(s => s.id !== id));

  const DEFAULT_SFX_VOL = 0.6;
  const resetSfxVolume = (id: string) => {
    setSfxList(l => l.map(s => s.id === id ? { ...s, volume: DEFAULT_SFX_VOL } : s));
    try { localStorage.setItem(SFX_DEFAULT_VOL_KEY, String(DEFAULT_SFX_VOL)); } catch {}
  };
  const resetAllSfxVolumes = () => {
    setSfxList(l => l.map(s => ({ ...s, volume: DEFAULT_SFX_VOL })));
    try { localStorage.setItem(SFX_DEFAULT_VOL_KEY, String(DEFAULT_SFX_VOL)); } catch {}
    toast.success("SFX volumes restored to 60%");
  };

  const generateSfx = async (id: string) => {
    const sfx = sfxList.find(s => s.id === id);
    if (!sfx || !sfx.prompt.trim()) { toast.error("Enter an SFX description"); return; }
    updateSfx(id, { loading: true });
    try {
      const { data, error } = await supabase.functions.invoke('video-ad-sfx', {
        body: { prompt: sfx.prompt, durationSeconds: sfx.duration } });
      if (error || data?.error) { handleEdgeError(error || data, { context: 'SFX' }); return; }
      const bin = atob(data.audioBase64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const previewUrl = URL.createObjectURL(new Blob([bytes], { type: data.mimeType }));
      updateSfx(id, { audio: bytes, previewUrl, loading: false });
      toast.success(`SFX finished (${data.credits_used} CR)`);
    } catch (e) { handleEdgeError(e, { context: 'SFX' }); updateSfx(id, { loading: false }); }
  };

  const render = async () => {
    if (scenes.length === 0) { toast.error("Add at least 1 scene image"); return; }
    setRendering(true); setProgress(0); setOutputUrl(null);
    try {
      const ff = await loadFfmpeg();
      // Write images
      for (let i = 0; i < scenes.length; i++) {
        const ext = scenes[i].file.name.split('.').pop() || 'jpg';
        await ff.writeFile(`img${i}.${ext}`, await fetchFile(scenes[i].file));
      }
      // Concat list — slideshow with per-scene duration
      const lines: string[] = [];
      for (let i = 0; i < scenes.length; i++) {
        const ext = scenes[i].file.name.split('.').pop() || 'jpg';
        lines.push(`file 'img${i}.${ext}'`);
        lines.push(`duration ${perScene}`);
      }
      // Repeat last image (concat demuxer quirk)
      const lastExt = scenes[scenes.length - 1].file.name.split('.').pop() || 'jpg';
      lines.push(`file 'img${scenes.length - 1}.${lastExt}'`);
      await ff.writeFile("list.txt", new TextEncoder().encode(lines.join("\n")));

      const totalDuration = scenes.length * perScene;

      // Build silent video first (scaled, padded to 1080x1920 vertical 9:16)
      await ff.exec([
        "-f", "concat", "-safe", "0", "-i", "list.txt",
        "-vf", "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black,format=yuv420p,fps=30",
        "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p",
        "-t", String(totalDuration),
        "video.mp4",
      ]);

      // Audio mix
      const audioInputs: string[] = [];
      const filterParts: string[] = [];
      let inputIdx = 0;

      const validSfx = sfxList.filter(s => s.audio);
      for (let i = 0; i < validSfx.length; i++) {
        await ff.writeFile(`sfx${i}.mp3`, validSfx[i].audio!);
        audioInputs.push("-i", `sfx${i}.mp3`);
        filterParts.push(`[${inputIdx}:a]volume=${(validSfx[i].volume ?? 0.6).toFixed(2)}[a${inputIdx}]`);
        inputIdx++;
      }

      if (inputIdx > 0) {
        const mixInputs = Array.from({ length: inputIdx }, (_, i) => `[a${i}]`).join("");
        const filter = `${filterParts.join(";")};${mixInputs}amix=inputs=${inputIdx}:duration=longest:dropout_transition=0[aout]`;
        await ff.exec([
          "-i", "video.mp4",
          ...audioInputs,
          "-filter_complex", filter,
          "-map", "0:v", "-map", "[aout]",
          "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
          "-shortest",
          "final.mp4",
        ]);
      } else {
        await ff.exec(["-i", "video.mp4", "-c", "copy", "final.mp4"]);
      }

      const out = await ff.readFile("final.mp4");
      const blob = new Blob([(out as Uint8Array).buffer as ArrayBuffer], { type: "video/mp4" });
      setOutputUrl(URL.createObjectURL(blob));
      toast.success("Final video finished!");
    } catch (e: any) {
      console.error(e); toast.error("Render zlyhal: " + (e?.message || e));
    } finally { setRendering(false); }
  };

  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4">← Back</Button>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center"><Film className="w-6 h-6 text-white" /></div>
        <div><h2 className="text-2xl font-black">Final Video Composer</h2><p className="text-sm text-muted-foreground">Combine scene images + SFX → MP4 (9:16)</p></div>
        <Badge className="ml-auto bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white">Render in browser</Badge>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* SCENES */}
        <Card>
          <CardHeader><CardTitle className="text-base">1. Scenes (images)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={e => addImages(e.target.files)} className="hidden" />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full"><Upload className="mr-2 h-4 w-4" />Add images</Button>
            <div><Label className="text-xs">Scene duration (s)</Label><Input type="number" min={1} max={15} value={perScene} onChange={e => setPerScene(Number(e.target.value) || 3)} /></div>
            {scenes.length > 0 && (
              <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                {scenes.map((s, i) => (
                  <div key={s.id} className="relative group">
                    <img src={s.preview} className="w-full h-20 object-cover rounded" alt={`Scene ${i + 1}`} />
                    <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1 rounded">#{i + 1}</div>
                    <button onClick={() => removeScene(s.id)} className="absolute top-1 right-1 bg-red-500 text-white rounded p-1 opacity-0 group-hover:opacity-100"><Trash2 className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">{scenes.length} scenes • {scenes.length * perScene}s total</p>
          </CardContent>
        </Card>

        {/* SFX */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">2. Sound Effects</CardTitle>
            <div className="flex gap-2">
              {sfxList.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="ghost">Reset volumes</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reset all SFX volumes?</AlertDialogTitle>
                      <AlertDialogDescription>The volume of each of the {sfxList.length} effects will be set to the default 60%.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={resetAllSfxVolumes}>Reset</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Button size="sm" variant="outline" onClick={addSfx}><Plus className="h-4 w-4 mr-1" />Add SFX</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {sfxList.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No SFX. Add an effect (whoosh, applause, ding...)</p>}
            {sfxList.map(s => (
              <div key={s.id} className="p-3 bg-muted/30 rounded space-y-2">
                <div className="grid grid-cols-12 gap-2 items-center">
                  <Input className="col-span-5" placeholder="napr. cinematic whoosh" value={s.prompt} onChange={e => updateSfx(s.id, { prompt: e.target.value })} />
                  <Input className="col-span-2" type="number" min={0.5} max={22} step={0.5} value={s.duration} onChange={e => updateSfx(s.id, { duration: Number(e.target.value) || 3 })} />
                  <Button size="sm" variant="outline" className="col-span-2" onClick={() => generateSfx(s.id)} disabled={s.loading}>{s.loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Gen (5 CR)"}</Button>
                  <div className="col-span-2">{s.previewUrl && <audio src={s.previewUrl} controls className="w-full h-8" />}</div>
                  <Button size="sm" variant="ghost" className="col-span-1" onClick={() => removeSfx(s.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs w-16">🔊 Vol</span>
                  <input type="range" min={0} max={2} step={0.05} value={s.volume} onChange={e => updateSfx(s.id, { volume: Number(e.target.value) })} className="flex-1 accent-fuchsia-500" />
                  <span className="text-xs font-mono w-12 text-right">{Math.round(s.volume * 100)}%</span>
                  <button type="button" onClick={() => resetSfxVolume(s.id)} className="text-[10px] underline text-muted-foreground hover:text-foreground">Reset</button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* RENDER */}
        <Card className="lg:col-span-2 border-fuchsia-500/30">
          <CardHeader><CardTitle className="text-base">3. Render final video</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={render} disabled={rendering || loadingFfmpeg || scenes.length === 0} className="w-full bg-gradient-to-r from-fuchsia-500 to-purple-600">
              {loadingFfmpeg ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading ffmpeg.wasm...</> :
                rendering ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Renderujem... {progress}%</> :
                <><Film className="mr-2 h-4 w-4" />Render MP4</>}
            </Button>
            {outputUrl && (
              <div className="space-y-3">
                <video src={outputUrl} controls className="w-full max-w-sm mx-auto rounded-lg" />
                <Button variant="outline" onClick={() => { const a = document.createElement('a'); a.href = outputUrl; a.download = `video-ad-${Date.now()}.mp4`; a.click(); }} className="w-full">
                  <Download className="mr-2 h-4 w-4" />Download MP4
                </Button>
              </div>
            )}
                      </CardContent>
        </Card>
      </div>
    </div>
  );
};
