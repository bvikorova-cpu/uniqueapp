import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Film, Play, Loader2, Video } from "lucide-react";
import { toast } from "sonner";
import { useHorrorReels } from "@/hooks/useShadowArenaFeatures";
import { shadowArenaCall } from "@/hooks/useShadowArenaRouter";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Scene { time?: string; visual?: string; voiceover?: string }
interface Reel {
  id: string;
  title: string;
  prompt?: string | null;
  duration_seconds?: number | null;
  video_url?: string | null;
  status?: string | null;
  script?: { hook?: string; scenes?: Scene[] } | null;
}

export function HorrorReelsCard() {
  const { reels, generate } = useHorrorReels();
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [selected, setSelected] = useState<Reel | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);
  const pollRef = useRef<number | null>(null);

  const scenes = selected?.script?.scenes ?? [];

  const stopPolling = () => {
    if (pollRef.current) { window.clearInterval(pollRef.current); pollRef.current = null; }
  };

  // Whenever a reel is opened: fetch its video (or existing render progress).
  useEffect(() => {
    stopPolling();
    setVideoUrl(null);
    setRendering(false);
    if (!selected) return;
    let cancelled = false;

    const check = async () => {
      try {
        const res = await shadowArenaCall<{ status: string; videoUrl?: string | null; error?: string }>(
          "horror_reel_video_status",
          { reelId: selected.id },
        );
        if (cancelled) return false;
        if (res.status === "ready" && res.videoUrl) {
          setVideoUrl(res.videoUrl);
          setRendering(false);
          stopPolling();
          return true;
        }
        if (res.status === "failed") {
          setRendering(false);
          stopPolling();
          toast.error(res.error || "Video generation failed.");
          return true;
        }
        setRendering(res.status === "rendering");
        return false;
      } catch {
        return false;
      }
    };

    check().then((done) => {
      if (cancelled || done) return;
      pollRef.current = window.setInterval(check, 10000);
    });

    return () => { cancelled = true; stopPolling(); };
  }, [selected?.id]);

  const startVideo = async () => {
    if (!selected) return;
    setRendering(true);
    try {
      await shadowArenaCall("horror_reel_video_start", { reelId: selected.id });
      toast.success("Video is rendering — this takes about 1–3 minutes.");
      stopPolling();
      pollRef.current = window.setInterval(async () => {
        const res = await shadowArenaCall<{ status: string; videoUrl?: string | null; error?: string }>(
          "horror_reel_video_status",
          { reelId: selected.id },
        ).catch(() => null);
        if (!res) return;
        if (res.status === "ready" && res.videoUrl) {
          setVideoUrl(res.videoUrl);
          setRendering(false);
          stopPolling();
          toast.success("Your horror reel video is ready!");
        } else if (res.status === "failed") {
          setRendering(false);
          stopPolling();
          toast.error(res.error || "Video generation failed.");
        }
      }, 10000);
    } catch (e) {
      setRendering(false);
      toast.error(e instanceof Error ? e.message : "Could not start video generation.");
    }
  };

  return (
    <><FloatingHowItWorks title="Horror Reels — How it works" steps={[{title:"Describe your scene",desc:"Write a horror idea and a title, then generate the reel (15 credits)."},{title:"Read the script",desc:"Tap a reel to open its hook and 5 cinematic scenes."},{title:"Generate the video",desc:"Inside the reel, press Generate video — AI renders an 8s vertical horror clip (1–3 min)."},{title:"Watch & share",desc:"The finished video plays right in the reel dialog."}]} />
<Card className="p-5 bg-gradient-to-br from-[hsl(0,30%,8%)] to-[hsl(280,25%,7%)] border-red-900/30 mb-6">
      <h3 className="text-xl font-black text-red-100 flex items-center gap-2 mb-1">
        <Film className="w-5 h-5 text-red-400" />
        Horror Reels
      </h3>
      <p className="text-xs text-red-200/60 mb-4">AI-generated 30s horror video scripts. 15 credits per reel.</p>

      <div className="space-y-2 mb-4">
        <Input placeholder="Reel title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea placeholder="Describe the horror scene..." rows={3} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        <Button
          disabled={!prompt || generate.isPending}
          onClick={() => generate.mutate({ prompt, title }, { onSuccess: () => { setPrompt(""); setTitle(""); } })}
          className="w-full bg-gradient-to-r from-red-700 to-pink-700 hover:from-red-600 hover:to-pink-600"
        >
          {generate.isPending ? "Generating..." : "Generate Reel (15 cr)"}
        </Button>
      </div>

      {reels && reels.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {reels.slice(0, 4).map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelected(r as Reel)}
              aria-label={`Open reel: ${r.title}`}
              className="aspect-[9/16] w-full rounded-lg bg-black/60 border border-red-900/30 relative overflow-hidden flex items-center justify-center group text-left focus:outline-none focus:ring-2 focus:ring-red-500 hover:border-red-500/60 transition"
            >
              <Play className="w-8 h-8 text-red-400 opacity-60 group-hover:opacity-100 transition" />
              <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black to-transparent">
                <p className="text-[10px] font-bold text-red-100 truncate">{r.title}</p>
                <p className="text-[9px] text-red-200/60">
                  {(r as Reel).video_url ? "Video ready · tap to watch" : "Tap to open"}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </Card>

    <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Film className="w-4 h-4 text-red-500" />
            {selected?.title}
          </DialogTitle>
        </DialogHeader>

        {videoUrl ? (
          <video
            src={videoUrl}
            controls
            autoPlay
            playsInline
            className="w-full rounded-xl border border-red-900/40 bg-black aspect-[9/16] object-cover"
          />
        ) : (
          <div className="rounded-xl border border-red-900/40 bg-black/60 p-4 text-center space-y-3">
            {rendering ? (
              <div className="flex flex-col items-center gap-2 py-6">
                <Loader2 className="w-6 h-6 animate-spin text-red-500" />
                <p className="text-sm text-muted-foreground">Rendering your horror video… (1–3 min)</p>
                <p className="text-xs text-muted-foreground">You can keep this open — it appears automatically.</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">No video yet for this reel.</p>
                <Button onClick={startVideo} className="bg-gradient-to-r from-red-700 to-pink-700">
                  <Video className="w-4 h-4 mr-2" />
                  Generate video
                </Button>
              </>
            )}
          </div>
        )}

        {selected?.script?.hook && (
          <p className="text-sm italic text-muted-foreground border-l-2 border-red-600/50 pl-3">
            {selected.script.hook}
          </p>
        )}
        {scenes.length > 0 ? (
          <ol className="space-y-3">
            {scenes.map((s, i) => (
              <li key={i} className="rounded-lg border border-border/40 p-3 bg-muted/20">
                <p className="text-xs font-bold text-red-500 mb-1">Scene {i + 1}{s.time ? ` · ${s.time}` : ""}</p>
                {s.visual && <p className="text-sm text-foreground">{s.visual}</p>}
                {s.voiceover && <p className="text-sm italic text-muted-foreground mt-1">“{s.voiceover}”</p>}
              </li>
            ))}
          </ol>
        ) : (
          <div className="text-sm text-muted-foreground space-y-2">
            <p>No script was saved for this reel.</p>
            {selected?.prompt && <p className="italic">Prompt: {selected.prompt}</p>}
          </div>
        )}
      </DialogContent>
    </Dialog>
  </>
  );
}
