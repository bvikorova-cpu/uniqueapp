import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Film, Download, Plus, Trash2, Upload, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { handleEdgeError } from "@/lib/handleEdgeError";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const VOICES = [
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George (M)' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah (F)' },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie (M)' },
  { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda (F)' },
];

interface SceneImg { id: string; file: File; preview: string; }
interface Sfx { id: string; prompt: string; duration: number; audio?: Uint8Array; previewUrl?: string; loading?: boolean; }

interface ClonedVoice { voiceId: string; name: string; description?: string; createdAt: number; }

export const FinalVideoComposerView = ({ onBack }: { onBack: () => void }) => {
  const [scenes, setScenes] = useState<SceneImg[]>([]);
  const [perScene, setPerScene] = useState(3);
  const [voText, setVoText] = useState("");
  const [voiceId, setVoiceId] = useState(VOICES[0].id);
  const [customVoiceId, setCustomVoiceId] = useState("");
  const [clonedVoices, setClonedVoices] = useState<ClonedVoice[]>([]);
  const [voAudio, setVoAudio] = useState<Uint8Array | null>(null);
  const [voUrl, setVoUrl] = useState<string | null>(null);
  const [voLoading, setVoLoading] = useState(false);
  const [sfxList, setSfxList] = useState<Sfx[]>([]);
  const [rendering, setRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [ffmpegReady, setFfmpegReady] = useState(false);
  const [loadingFfmpeg, setLoadingFfmpeg] = useState(false);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const KEY = 'video-ad:cloned-voices';
    const load = () => {
      try {
        const list: ClonedVoice[] = JSON.parse(localStorage.getItem(KEY) || '[]');
        setClonedVoices(list);
        if (list.length > 0 && !customVoiceId) setCustomVoiceId(list[0].voiceId);
      } catch {}
    };
    load();
    window.addEventListener('cloned-voices-updated', load);
    window.addEventListener('storage', load);
    return () => {
      window.removeEventListener('cloned-voices-updated', load);
      window.removeEventListener('storage', load);
    };
  }, []);

  const loadFfmpeg = async () => {
    if (ffmpegRef.current) return ffmpegRef.current;
    setLoadingFfmpeg(true);
    try {
      const ff = new FFmpeg();
      ff.on("progress", ({ progress }) => setProgress(Math.round(progress * 100)));
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";
      await ff.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });
      ffmpegRef.current = ff;
      setFfmpegReady(true);
      return ff;
    } finally { setLoadingFfmpeg(false); }
  };

  useEffect(() => () => {
    scenes.forEach(s => URL.revokeObjectURL(s.preview));
    sfxList.forEach(s => s.previewUrl && URL.revokeObjectURL(s.previewUrl));
    if (voUrl) URL.revokeObjectURL(voUrl);
    if (outputUrl) URL.revokeObjectURL(outputUrl);
  }, []);

  const addImages = (files: FileList | null) => {
    if (!files) return;
    const imgs: SceneImg[] = Array.from(files).filter(f => f.type.startsWith("image/")).map(f => ({
      id: crypto.randomUUID(), file: f, preview: URL.createObjectURL(f),
    }));
    setScenes(s => [...s, ...imgs]);
  };

  const removeScene = (id: string) => setScenes(s => s.filter(x => x.id !== id));

  const generateVoice = async () => {
    if (!voText.trim()) { toast.error("Zadaj text voiceoveru"); return; }
    setVoLoading(true); setVoAudio(null); setVoUrl(null);
    try {
      const finalVoiceId = customVoiceId.trim() || voiceId;
      const { data, error } = await supabase.functions.invoke('video-ad-tts', {
        body: { text: voText, voiceId: finalVoiceId },
      });
      if (error || data?.error) { handleEdgeError(error || data, { context: 'TTS' }); return; }
      const bin = atob(data.audioBase64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      setVoAudio(bytes);
      setVoUrl(URL.createObjectURL(new Blob([bytes], { type: data.mimeType })));
      toast.success(`Voiceover hotový (${data.credits_used} CR)`);
    } catch (e) { handleEdgeError(e, { context: 'TTS' }); }
    finally { setVoLoading(false); }
  };

  const addSfx = () => setSfxList(l => [...l, { id: crypto.randomUUID(), prompt: "", duration: 3 }]);
  const updateSfx = (id: string, patch: Partial<Sfx>) => setSfxList(l => l.map(s => s.id === id ? { ...s, ...patch } : s));
  const removeSfx = (id: string) => setSfxList(l => l.filter(s => s.id !== id));

  const generateSfx = async (id: string) => {
    const sfx = sfxList.find(s => s.id === id);
    if (!sfx || !sfx.prompt.trim()) { toast.error("Zadaj popis SFX"); return; }
    updateSfx(id, { loading: true });
    try {
      const { data, error } = await supabase.functions.invoke('video-ad-sfx', {
        body: { prompt: sfx.prompt, durationSeconds: sfx.duration },
      });
      if (error || data?.error) { handleEdgeError(error || data, { context: 'SFX' }); return; }
      const bin = atob(data.audioBase64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const previewUrl = URL.createObjectURL(new Blob([bytes], { type: data.mimeType }));
      updateSfx(id, { audio: bytes, previewUrl, loading: false });
      toast.success(`SFX hotový (${data.credits_used} CR)`);
    } catch (e) { handleEdgeError(e, { context: 'SFX' }); updateSfx(id, { loading: false }); }
  };

  const render = async () => {
    if (scenes.length === 0) { toast.error("Pridaj aspoň 1 obrázok scény"); return; }
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

      if (voAudio) {
        await ff.writeFile("vo.mp3", voAudio);
        audioInputs.push("-i", "vo.mp3");
        filterParts.push(`[${inputIdx}:a]volume=1.0[a${inputIdx}]`);
        inputIdx++;
      }
      const validSfx = sfxList.filter(s => s.audio);
      for (let i = 0; i < validSfx.length; i++) {
        await ff.writeFile(`sfx${i}.mp3`, validSfx[i].audio!);
        audioInputs.push("-i", `sfx${i}.mp3`);
        filterParts.push(`[${inputIdx}:a]volume=0.6[a${inputIdx}]`);
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
      toast.success("Finálne video hotové!");
    } catch (e: any) {
      console.error(e); toast.error("Render zlyhal: " + (e?.message || e));
    } finally { setRendering(false); }
  };

  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4">← Späť</Button>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center"><Film className="w-6 h-6 text-white" /></div>
        <div><h2 className="text-2xl font-black">Final Video Composer</h2><p className="text-sm text-muted-foreground">Spoj obrázky scén + cloned voice + SFX → MP4 (9:16)</p></div>
        <Badge className="ml-auto bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white">Render in browser</Badge>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* SCENES */}
        <Card>
          <CardHeader><CardTitle className="text-base">1. Scény (obrázky)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={e => addImages(e.target.files)} className="hidden" />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full"><Upload className="mr-2 h-4 w-4" />Pridať obrázky</Button>
            <div><Label className="text-xs">Trvanie scény (s)</Label><Input type="number" min={1} max={15} value={perScene} onChange={e => setPerScene(Number(e.target.value) || 3)} /></div>
            {scenes.length > 0 && (
              <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                {scenes.map((s, i) => (
                  <div key={s.id} className="relative group">
                    <img src={s.preview} className="w-full h-20 object-cover rounded" alt={`Scéna ${i + 1}`} />
                    <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1 rounded">#{i + 1}</div>
                    <button onClick={() => removeScene(s.id)} className="absolute top-1 right-1 bg-red-500 text-white rounded p-1 opacity-0 group-hover:opacity-100"><Trash2 className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">{scenes.length} scén • {scenes.length * perScene}s total</p>
          </CardContent>
        </Card>

        {/* VOICE */}
        <Card>
          <CardHeader><CardTitle className="text-base">2. Voiceover (vlastný hlas)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Textarea rows={4} maxLength={5000} placeholder="Text na nahovorenie..." value={voText} onChange={e => setVoText(e.target.value)} />
            <div>
              <Label className="text-xs">Hlas</Label>
              <select className="w-full p-2 rounded-md border bg-background text-sm" value={voiceId} onChange={e => setVoiceId(e.target.value)}>
                {VOICES.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            {clonedVoices.length > 0 && (
              <div>
                <Label className="text-xs flex items-center justify-between">
                  <span>🎤 Tvoje cloned voices ({clonedVoices.length})</span>
                  <button type="button" onClick={() => setCustomVoiceId("")} className="text-xs text-muted-foreground hover:text-foreground underline">Vyčistiť</button>
                </Label>
                <select className="w-full p-2 rounded-md border bg-background text-sm" value={customVoiceId} onChange={e => setCustomVoiceId(e.target.value)}>
                  <option value="">— použiť hlas vyššie —</option>
                  {clonedVoices.map(v => <option key={v.voiceId} value={v.voiceId}>{v.name}</option>)}
                </select>
              </div>
            )}
            <div>
              <Label className="text-xs">Vlastný cloned voiceId (manuálne)</Label>
              <Input className="font-mono text-xs" placeholder="z Voice Cloning karty" value={customVoiceId} onChange={e => setCustomVoiceId(e.target.value)} />
            </div>
            <Button onClick={generateVoice} disabled={voLoading} className="w-full bg-gradient-to-r from-pink-500 to-rose-600">
              {voLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Wand2 className="mr-2 h-4 w-4" />Generovať VO (5 CR)</>}
            </Button>
            {voUrl && <audio src={voUrl} controls className="w-full" />}
          </CardContent>
        </Card>

        {/* SFX */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">3. Zvukové efekty</CardTitle>
            <Button size="sm" variant="outline" onClick={addSfx}><Plus className="h-4 w-4 mr-1" />Pridať SFX</Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {sfxList.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Žiadne SFX. Pridaj efekt (whoosh, applause, ding...)</p>}
            {sfxList.map(s => (
              <div key={s.id} className="grid grid-cols-12 gap-2 items-center p-2 bg-muted/30 rounded">
                <Input className="col-span-5" placeholder="napr. cinematic whoosh" value={s.prompt} onChange={e => updateSfx(s.id, { prompt: e.target.value })} />
                <Input className="col-span-2" type="number" min={0.5} max={22} step={0.5} value={s.duration} onChange={e => updateSfx(s.id, { duration: Number(e.target.value) || 3 })} />
                <Button size="sm" variant="outline" className="col-span-2" onClick={() => generateSfx(s.id)} disabled={s.loading}>{s.loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Gen (5 CR)"}</Button>
                <div className="col-span-2">{s.previewUrl && <audio src={s.previewUrl} controls className="w-full h-8" />}</div>
                <Button size="sm" variant="ghost" className="col-span-1" onClick={() => removeSfx(s.id)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* RENDER */}
        <Card className="lg:col-span-2 border-fuchsia-500/30">
          <CardHeader><CardTitle className="text-base">4. Render finálneho videa</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={render} disabled={rendering || loadingFfmpeg || scenes.length === 0} className="w-full bg-gradient-to-r from-fuchsia-500 to-purple-600">
              {loadingFfmpeg ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Načítam ffmpeg.wasm...</> :
                rendering ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Renderujem... {progress}%</> :
                <><Film className="mr-2 h-4 w-4" />Vyrenderovať MP4</>}
            </Button>
            {outputUrl && (
              <div className="space-y-3">
                <video src={outputUrl} controls className="w-full max-w-sm mx-auto rounded-lg" />
                <Button variant="outline" onClick={() => { const a = document.createElement('a'); a.href = outputUrl; a.download = `video-ad-${Date.now()}.mp4`; a.click(); }} className="w-full">
                  <Download className="mr-2 h-4 w-4" />Stiahnuť MP4
                </Button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">Tip: Najprv naklonuj hlas v "Voice Cloning", skopíruj voiceId, vlož sem do "Vlastný cloned voiceId" a vygeneruj voiceover svojím hlasom.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
