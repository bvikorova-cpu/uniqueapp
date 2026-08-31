import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAICredits } from "@/hooks/useAICredits";
import { AIVideoClipPlayer } from "@/components/ai-video-creator/AIVideoClipPlayer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Clapperboard, Film, Loader2, Mic, Music, Sparkles, Wand2, Zap, ShieldCheck,
  Smartphone, Monitor, Clock, Trash2, BadgeCheck,
} from "lucide-react";
import heroAsset from "@/assets/section-videos/ai-video-creator.mp4.asset.json";

const DURATIONS = [
  { seconds: 8, credits: 25 },
  { seconds: 10, credits: 30 },
  { seconds: 15, credits: 38 },
  { seconds: 20, credits: 45 },
  { seconds: 25, credits: 52 },
  { seconds: 30, credits: 60 },
];

const STYLES = [
  "Cinematic film look",
  "Bright commercial ad",
  "Documentary / real life",
  "Dreamy pastel",
  "Neon night city",
  "Cozy warm indoor",
  "Luxury fashion editorial",
  "Playful cartoon energy",
];

const MUSIC_PRESETS = [
  "Uplifting pop",
  "Soft piano",
  "Cinematic orchestral",
  "Lo-fi chill beats",
  "Energetic electronic",
  "Acoustic guitar",
  "Emotional strings",
  "No music, ambient sound only",
];

interface Creation {
  id: string;
  topic: string;
  scene: string | null;
  style: string | null;
  narration: string | null;
  music: string | null;
  aspect_ratio: string;
  duration_seconds: number;
  credits_spent: number;
  status: string;
  error: string | null;
  segments: { path: string; seconds?: number }[] | null;
  segments_total: number;
  created_at: string;
}

const AIVideoCreator = () => {
  const { user } = useAuth();
  const { totalBalance, refresh } = useAICredits();

  const [topic, setTopic] = useState("");
  const [scene, setScene] = useState("");
  const [style, setStyle] = useState(STYLES[0]);
  const [narration, setNarration] = useState("");
  const [music, setMusic] = useState(MUSIC_PRESETS[0]);
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "16:9">("9:16");
  const [duration, setDuration] = useState(8);
  const [submitting, setSubmitting] = useState(false);
  const [creations, setCreations] = useState<Creation[]>([]);
  const pollRef = useRef<number | null>(null);

  const cost = DURATIONS.find((d) => d.seconds === duration)?.credits ?? 25;

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("ai_video_creations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    setCreations((data as unknown as Creation[]) ?? []);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  // Poll active jobs (generation takes 1-3 minutes per part).
  useEffect(() => {
    const active = creations.filter((c) => c.status === "processing");
    if (!active.length) {
      if (pollRef.current) { window.clearInterval(pollRef.current); pollRef.current = null; }
      return;
    }
    if (pollRef.current) return;
    pollRef.current = window.setInterval(async () => {
      const pending = creations.filter((c) => c.status === "processing");
      for (const job of pending) {
        try {
          await supabase.functions.invoke("ai-video-creator", { body: { action: "poll", id: job.id } });
        } catch { /* keep polling */ }
      }
      await load();
      await refresh();
    }, 10000);
    return () => {
      if (pollRef.current) { window.clearInterval(pollRef.current); pollRef.current = null; }
    };
  }, [creations, load, refresh]);

  const handleGenerate = async () => {
    if (!user) { toast.error("Please log in first."); return; }
    if (topic.trim().length < 3) { toast.error("Describe what the video should be about."); return; }
    if (totalBalance < cost) { toast.error(`You need ${cost} credits for a ${duration}s clip.`); return; }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-video-creator", {
        body: { action: "create", topic, scene, style, narration, music, aspectRatio, duration },
      });
      if (error) throw new Error(error.message);
      if ((data as any)?.error) throw new Error((data as any).error);
      toast.success(`Generating your ${duration}s clip — ${cost} credits used. This takes a few minutes.`);
      await load();
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start the video.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("ai_video_creations").delete().eq("id", id);
    setCreations((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto max-w-6xl px-4 py-6">
        {/* HERO */}
        <div className="relative mb-6 h-[280px] w-full overflow-hidden rounded-3xl sm:h-[380px]">
          <video
            autoPlay muted loop playsInline
            src={heroAsset.url}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: "brightness(1.1) saturate(1.15)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/25 to-transparent" />
          <div className="relative z-10 flex h-full flex-col justify-between p-4 sm:p-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
              className="max-w-lg space-y-3"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-background/50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-primary backdrop-blur-sm">
                <Sparkles className="h-3 w-3" /> Veo 3.1 Lite · with sound
              </span>
              <div className="rounded-2xl border-2 border-primary/30 bg-background/40 p-4 backdrop-blur-md shadow-xl">
                <h1 className="text-3xl font-black leading-none text-foreground sm:text-5xl">
                  AI Video <span className="text-primary">Creator</span>
                </h1>
                <p className="mt-3 text-sm font-semibold text-foreground/85 sm:text-base">
                  Pick a topic, a scene and a style — add what should be said and which music should play.
                  AI films it for you in 8 to 30 seconds.
                </p>
              </div>
            </motion.div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="gap-1 bg-primary/15 text-primary hover:bg-primary/20">
                <Zap className="h-3 w-3" /> {totalBalance} credits
              </Badge>
              <Badge variant="outline" className="gap-1 bg-background/60 backdrop-blur-sm">
                <BadgeCheck className="h-3 w-3 text-primary" /> No watermark
              </Badge>
              <Badge variant="outline" className="gap-1 bg-background/60 backdrop-blur-sm">
                <Music className="h-3 w-3" /> Voice + music included
              </Badge>
            </div>
          </div>
        </div>

        {/* HOW IT WORKS */}
        <Card className="mb-6 border-primary/20 bg-card/70 backdrop-blur-xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Film className="h-5 w-5 text-primary" /> How it works
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-4">
            {[
              { icon: Wand2, t: "1. Describe it", d: "Topic, scene and visual style." },
              { icon: Mic, t: "2. Add a voice", d: "Type what should be spoken in the video." },
              { icon: Music, t: "3. Pick music", d: "Choose a soundtrack mood." },
              { icon: Clapperboard, t: "4. Get your clip", d: "Ready in a few minutes, watermark-free MP4." },
            ].map((s) => (
              <div key={s.t} className="rounded-xl border border-border bg-background/60 p-3">
                <s.icon className="mb-1.5 h-4 w-4 text-primary" />
                <p className="font-bold text-foreground">{s.t}</p>
                <p className="text-xs">{s.d}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          {/* FORM */}
          <Card className="border-primary/20 bg-card/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Create a new video
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-1.5">
                <Label>Topic — what is the video about?</Label>
                <Textarea
                  value={topic} onChange={(e) => setTopic(e.target.value)}
                  placeholder="A woman feeding pigeons in the park, then coming home to a warm cup of tea"
                  rows={3} maxLength={600}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Scene — where does it happen?</Label>
                <Input
                  value={scene} onChange={(e) => setScene(e.target.value)}
                  placeholder="Autumn city park at golden hour, then a cozy living room"
                  maxLength={300}
                />
              </div>

              <div className="space-y-2">
                <Label>Style</Label>
                <div className="flex flex-wrap gap-2">
                  {STYLES.map((s) => (
                    <button
                      key={s} type="button" onClick={() => setStyle(s)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                        style === s
                          ? "border-primary bg-primary/15 text-primary shadow-sm"
                          : "border-border bg-background/60 text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5">
                  <Mic className="h-4 w-4 text-primary" /> What should be said (voiceover)
                </Label>
                <Textarea
                  value={narration} onChange={(e) => setNarration(e.target.value)}
                  placeholder="Every small moment deserves a warm ending. Come home to yourself."
                  rows={3} maxLength={1200}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty for a clip without speech. Longer clips split the text across the parts.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Music className="h-4 w-4 text-primary" /> Music
                </Label>
                <div className="flex flex-wrap gap-2">
                  {MUSIC_PRESETS.map((m) => (
                    <button
                      key={m} type="button" onClick={() => setMusic(m)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                        music === m
                          ? "border-primary bg-primary/15 text-primary shadow-sm"
                          : "border-border bg-background/60 text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <Input
                  value={music} onChange={(e) => setMusic(e.target.value)}
                  placeholder="Or describe your own music"
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <Label>Format</Label>
                <div className="flex gap-2">
                  {([["9:16", Smartphone, "Vertical"], ["16:9", Monitor, "Horizontal"]] as const).map(
                    ([value, Icon, label]) => (
                      <button
                        key={value} type="button" onClick={() => setAspectRatio(value)}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold transition-all ${
                          aspectRatio === value
                            ? "border-primary bg-primary/15 text-primary"
                            : "border-border bg-background/60 text-muted-foreground hover:border-primary/40"
                        }`}
                      >
                        <Icon className="h-4 w-4" /> {label} {value}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Length &amp; price</Label>
                <div className="grid grid-cols-3 gap-2">
                  {DURATIONS.map((d) => (
                    <button
                      key={d.seconds} type="button" onClick={() => setDuration(d.seconds)}
                      className={`rounded-xl border p-3 text-center transition-all ${
                        duration === d.seconds
                          ? "border-primary bg-primary/15 shadow-md"
                          : "border-border bg-background/60 hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1 text-base font-black text-foreground">
                        <Clock className="h-3.5 w-3.5 text-primary" /> {d.seconds}s
                      </div>
                      <div className="text-xs font-semibold text-primary">{d.credits} credits</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-primary/25 bg-primary/5 p-3 text-xs text-muted-foreground">
                <p className="flex items-center gap-1.5 font-bold text-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Delivered without any watermark
                </p>
                <p className="mt-1">
                  Powered by Veo 3.1 Lite with generated sound. Credits are refunded automatically if a
                  generation fails. Adult, nude or sexual content is blocked.
                </p>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={submitting || !topic.trim()}
                className="h-12 w-full text-base font-bold"
              >
                {submitting
                  ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Starting…</>
                  : <><Clapperboard className="mr-2 h-5 w-5" /> Generate {duration}s video · {cost} credits</>}
              </Button>
              {totalBalance < cost && (
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/ai-credits">Buy credits</Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* LIBRARY */}
          <div className="space-y-4">
            <Card className="border-primary/20 bg-card/80 backdrop-blur-xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Film className="h-5 w-5 text-primary" /> My videos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!creations.length && (
                  <p className="text-sm text-muted-foreground">
                    Your generated clips are saved here in your account.
                  </p>
                )}
                {creations.map((c) => (
                  <div key={c.id} className="space-y-2 rounded-2xl border border-border bg-background/60 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="line-clamp-2 text-sm font-bold text-foreground">{c.topic}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.duration_seconds}s · {c.aspect_ratio} · {c.credits_spent} credits
                        </p>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(c.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>

                    {c.status === "processing" && (
                      <div className="flex items-center gap-2 rounded-xl bg-primary/10 p-3 text-xs font-semibold text-primary">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Rendering {(c.segments?.length ?? 0) + 1} / {c.segments_total} — a few minutes per part
                      </div>
                    )}
                    {c.status === "failed" && (
                      <p className="rounded-xl bg-destructive/10 p-3 text-xs font-semibold text-destructive">
                        {c.error ?? "Generation failed."}
                      </p>
                    )}
                    {c.status === "completed" && !!c.segments?.length && (
                      <AIVideoClipPlayer segments={c.segments} />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border bg-card/70 backdrop-blur-xl">
              <CardContent className="space-y-2 p-4 text-xs text-muted-foreground">
                <p className="font-bold text-foreground">Credit price list</p>
                {DURATIONS.map((d) => (
                  <div key={d.seconds} className="flex justify-between">
                    <span>{d.seconds} second clip</span>
                    <span className="font-semibold text-primary">{d.credits} credits</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIVideoCreator;
