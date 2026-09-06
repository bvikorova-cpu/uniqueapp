import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Film, Loader2, Download, Sparkles, Play } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Scene = {
  description: string;
  caption: string;
  visuals: string;
  imageUrl?: string;
  durationMs: number;
};

const ASPECTS: Record<string, { w: number; h: number; ratio: string; label: string }> = {
  "9:16": { w: 720, h: 1280, ratio: "9:16", label: "9:16 — TikTok / Reels" },
  "16:9": { w: 1280, h: 720, ratio: "16:9", label: "16:9 — YouTube" },
  "1:1": { w: 1024, h: 1024, ratio: "1:1", label: "1:1 — Instagram" },
};

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 4);
};

export const AiVideoBuilderView = ({ onBack }: { onBack: () => void }) => {
  const [form, setForm] = useState({
    product: "",
    audience: "",
    message: "",
    tone: "energetic",
    aspect: "9:16",
    sceneCount: "4",
  });
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const buildScenes = async () => {
    if (!form.product || !form.audience || !form.message) {
      toast.error("Fill in product, audience and key message");
      return;
    }
    setBusy(true);
    setVideoUrl(null);
    setScenes([]);
    setProgress(5);
    try {
      setStatus("Writing the storyboard…");
      const { data, error } = await supabase.functions.invoke("video-ad-tools", {
        body: {
          action: "generate_script",
          productService: form.product,
          targetAudience: form.audience,
          keyMessage: form.message,
          tone: form.tone,
          duration: Number(form.sceneCount) * 5,
          platform: form.aspect === "16:9" ? "youtube" : "tiktok",
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const result = data?.result ?? data;
      const raw: any[] = Array.isArray(result?.scenes) ? result.scenes : [];
      if (!raw.length) throw new Error("No scenes returned");

      const planned: Scene[] = raw.slice(0, Number(form.sceneCount)).map((s) => ({
        description: String(s.description ?? ""),
        caption: String(s.voiceover ?? s.description ?? ""),
        visuals: String(s.visuals ?? s.description ?? ""),
        durationMs: 3500,
      }));

      const total = planned.length;
      for (let i = 0; i < total; i++) {
        setStatus(`Generating visual ${i + 1}/${total}…`);
        setProgress(10 + Math.round((i / total) * 60));
        const { data: img, error: imgErr } = await supabase.functions.invoke("ai-image-tools", {
          body: {
            action: "generate",
            prompt: `Cinematic advertising frame for "${form.product}". Scene: ${planned[i].visuals}. ${form.tone} mood, professional commercial photography, no text overlays.`,
            aspectRatio: ASPECTS[form.aspect].ratio,
          },
        });
        if (imgErr) throw imgErr;
        if (img?.error) throw new Error(img.error);
        planned[i].imageUrl = img?.imageUrl ?? img?.result?.imageUrl;
      }

      setScenes(planned);
      setProgress(100);
      setStatus("Storyboard ready — render your video");
      toast.success("Scenes generated");
    } catch (e: any) {
      toast.error(e?.message || "Generation failed");
      setStatus("");
    } finally {
      setBusy(false);
    }
  };

  const renderVideo = async () => {
    if (!scenes.length) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { w, h } = ASPECTS[form.aspect];
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setBusy(true);
    setVideoUrl(null);
    setStatus("Rendering video…");
    setProgress(0);

    try {
      const images = await Promise.all(
        scenes.map((s) => (s.imageUrl ? loadImage(s.imageUrl).catch(() => null) : Promise.resolve(null)))
      );

      const prepared = [...scenes];

      const canvasStream = canvas.captureStream(30);
      const stream = canvasStream;

      const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";
      const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 4_000_000 });
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      const done = new Promise<Blob>((resolve) => {
        recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));
      });
      recorder.start();

      const totalMs = prepared.reduce((a, s) => a + s.durationMs, 0);
      let elapsedBefore = 0;

      for (let i = 0; i < prepared.length; i++) {
        const scene = prepared[i];
        const img = images[i];

        const start = performance.now();
        await new Promise<void>((resolve) => {
          const draw = () => {
            const t = performance.now() - start;
            const p = Math.min(1, t / scene.durationMs);

            ctx.fillStyle = "#0b0b12";
            ctx.fillRect(0, 0, w, h);

            if (img) {
              const zoom = 1.06 + p * 0.12;
              const scale = Math.max(w / img.width, h / img.height) * zoom;
              const dw = img.width * scale;
              const dh = img.height * scale;
              const dx = (w - dw) / 2 + Math.sin(p * Math.PI) * (w * 0.02);
              const dy = (h - dh) / 2;
              ctx.drawImage(img, dx, dy, dw, dh);
            }

            // bottom gradient for caption legibility
            const grad = ctx.createLinearGradient(0, h * 0.55, 0, h);
            grad.addColorStop(0, "rgba(0,0,0,0)");
            grad.addColorStop(1, "rgba(0,0,0,0.82)");
            ctx.fillStyle = grad;
            ctx.fillRect(0, h * 0.55, w, h * 0.45);

            const fade = Math.min(1, p * 6) * Math.min(1, (1 - p) * 6 + 0.3);
            ctx.globalAlpha = Math.max(0, Math.min(1, fade));
            const fontSize = Math.round(w * 0.052);
            ctx.font = `800 ${fontSize}px Inter, Arial, sans-serif`;
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            const lines = wrapText(ctx, scene.caption || scene.description, w * 0.84);
            lines.forEach((line, idx) => {
              ctx.fillText(line, w / 2, h * 0.86 + idx * fontSize * 1.22 - (lines.length - 1) * fontSize * 0.6);
            });
            ctx.globalAlpha = 1;

            setProgress(Math.round(((elapsedBefore + t) / totalMs) * 100));

            if (p >= 1) resolve();
            else requestAnimationFrame(draw);
          };
          requestAnimationFrame(draw);
        });
        elapsedBefore += scene.durationMs;
      }

      recorder.stop();
      const blob = await done;
      setVideoUrl(URL.createObjectURL(blob));
      setProgress(100);
      setStatus("Video ready");
      toast.success("Video rendered");
    } catch (e: any) {
      toast.error(e?.message || "Render failed");
      setStatus("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <span className="mr-2">←</span>Back
      </Button>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Film className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">AI Video Generator</h2>
            <p className="text-muted-foreground text-sm">Script → AI scenes → animated video</p>
          </div>
          <Badge className="ml-auto bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white border-0">
            <Sparkles className="w-3 h-3 mr-1" />1 + 5 CR / scene
          </Badge>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />Video setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Product / Service *</Label>
              <Input value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} placeholder="e.g. Fitness app" />
            </div>
            <div>
              <Label>Target Audience *</Label>
              <Input value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} placeholder="e.g. Young adults 18-30" />
            </div>
            <div>
              <Label>Key Message *</Label>
              <Textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="What should viewers remember?" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tone</Label>
                <Select value={form.tone} onValueChange={(v) => setForm({ ...form, tone: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="energetic">Energetic</SelectItem>
                    <SelectItem value="emotional">Emotional</SelectItem>
                    <SelectItem value="humorous">Humorous</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Scenes</Label>
                <Select value={form.sceneCount} onValueChange={(v) => setForm({ ...form, sceneCount: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 scenes</SelectItem>
                    <SelectItem value="4">4 scenes</SelectItem>
                    <SelectItem value="5">5 scenes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Format</Label>
              <Select value={form.aspect} onValueChange={(v) => setForm({ ...form, aspect: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(ASPECTS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={buildScenes} disabled={busy}>
              {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Generate scenes
            </Button>
            {scenes.length > 0 && (
              <Button className="w-full" variant="secondary" onClick={renderVideo} disabled={busy}>
                <Play className="w-4 h-4 mr-2" />Render video
              </Button>
            )}
            {(busy || status) && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-xs text-muted-foreground">{status}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Preview</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <canvas ref={canvasRef} className={videoUrl ? "hidden" : "w-full max-w-sm mx-auto rounded-xl border bg-muted"} />
            {videoUrl && (
              <div className="space-y-3">
                <video src={videoUrl} controls className="w-full max-w-sm mx-auto rounded-xl border" />
                <Button
                  className="w-full"
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = videoUrl;
                    a.download = `ai-video-ad-${Date.now()}.webm`;
                    a.click();
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />Download video (.webm)
                </Button>
              </div>
            )}
            {scenes.length > 0 && (
              <div className="grid sm:grid-cols-2 gap-3">
                {scenes.map((s, i) => (
                  <div key={i} className="rounded-xl border overflow-hidden">
                    {s.imageUrl && <img src={s.imageUrl} alt={`Scene ${i + 1}`} className="w-full aspect-video object-cover" />}
                    <div className="p-3">
                      <p className="text-xs font-bold mb-1">Scene {i + 1}</p>
                      <p className="text-xs text-muted-foreground">{s.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!scenes.length && !busy && (
              <p className="text-sm text-muted-foreground text-center py-10">
                Fill in the setup and generate scenes — the AI writes the storyboard, creates every visual, and renders a downloadable video.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
