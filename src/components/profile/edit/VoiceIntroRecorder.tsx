import { useEffect, useRef, useState } from "react";
import { getReadableUrl } from "@/lib/storageSigned";
import { Loader2, Mic, Pause, Play, Sparkles, Square, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  userId: string;
  audioUrl: string | null;
  transcript: string | null;
  onSaved: (url: string, transcript: string, duration: number) => void;
  onRemove: () => void;
}

const MAX_SECONDS = 30;

export const VoiceIntroRecorder = ({ userId, audioUrl, transcript, onSaved, onRemove }: Props) => {
  const { toast } = useToast();
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [aiText, setAiText] = useState("");
  const [playing, setPlaying] = useState(false);

  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => chunksRef.current.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await uploadBlob(blob);
      };
      rec.start();
      mediaRef.current = rec;
      setRecording(true);
      setSeconds(0);
      timerRef.current = window.setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_SECONDS) { stopRecording(); return MAX_SECONDS; }
          return s + 1;
        });
      }, 1000);
    } catch {
      toast({ title: "Mic permission denied", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    if (mediaRef.current && mediaRef.current.state !== "inactive") mediaRef.current.stop();
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setRecording(false);
  };

  const uploadBlob = async (blob: Blob) => {
    setUploading(true);
    try {
      const path = `${userId}/voice-intro-${Date.now()}.webm`;
      const { error } = await supabase.storage.from("voice-intros").upload(path, blob, { contentType: "audio/webm", upsert: true });
      if (error) throw error;
      const pub = { publicUrl: await getReadableUrl("voice-intros", path) };
      const dur = Math.min(seconds || 30, MAX_SECONDS);
      await supabase.from("profile_voice_intros").upsert({
        user_id: userId, audio_url: pub.publicUrl, duration_seconds: dur, transcript: null,
      }, { onConflict: "user_id" });
      onSaved(pub.publicUrl, "", dur);
      toast({ title: "Voice intro saved" });
    } catch (e: any) {
      toast({ title: "Upload error", description: e.message, variant: "destructive" });
    } finally { setUploading(false); }
  };

  const generateAI = async () => {
    if (!aiText.trim()) { toast({ title: "Write what you want to say", variant: "destructive" }); return; }
    if (aiText.length > 300) { toast({ title: "Max 300 characters", variant: "destructive" }); return; }
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-voice-intro", {
        body: { text: aiText },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      onSaved(data.audio_url, data.transcript, data.duration_seconds);
      setAiText("");
      toast({ title: "AI voice intro created" });
    } catch (e: any) {
      toast({ title: "AI voice error", description: e.message, variant: "destructive" });
    } finally { setGenerating(false); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) { toast({ title: "Max 5MB", variant: "destructive" }); return; }
    await uploadBlob(file);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  };

  const removeIntro = async () => {
    await supabase.from("profile_voice_intros").delete().eq("user_id", userId);
    onRemove();
    toast({ title: "Voice intro removed" });
  };

  return (
    <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl p-5 sm:p-6 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Mic className="h-5 w-5 text-rose-400" />
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Voice Intro</p>
          <p className="text-base font-black bg-gradient-to-r from-rose-300 to-pink-400 bg-clip-text text-transparent">
            Up to 30 seconds — let visitors hear you
          </p>
        </div>
      </div>

      {audioUrl && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/40 mb-4">
          <Button size="icon" variant="ghost" onClick={togglePlay}>
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{transcript || "Your voice intro"}</p>
            <audio ref={audioRef} src={audioUrl} onEnded={() => setPlaying(false)} className="hidden" />
          </div>
          <Button size="icon" variant="ghost" onClick={removeIntro}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs">Record</Label>
          <Button
            onClick={recording ? stopRecording : startRecording}
            disabled={uploading}
            className="w-full"
            variant={recording ? "destructive" : "outline"}
          >
            {recording ? <><Square className="h-4 w-4 mr-2" /> Stop ({MAX_SECONDS - seconds}s left)</>
              : uploading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading…</>
              : <><Mic className="h-4 w-4 mr-2" /> Record (max 30s)</>}
          </Button>
          <Label htmlFor="voice-upload" className="cursor-pointer block">
            <Button variant="outline" size="sm" className="w-full" asChild disabled={uploading}>
              <span><Upload className="h-3.5 w-3.5 mr-1.5" /> Upload audio file</span>
            </Button>
          </Label>
          <Input id="voice-upload" type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-1.5 text-xs">
            <Sparkles className="h-3 w-3 text-amber-400" /> Generate with AI voice
          </Label>
          <Textarea
            placeholder="e.g. Hi! I'm Anna — designer & coffee lover from Bratislava. Let's connect!"
            rows={3}
            value={aiText}
            onChange={(e) => setAiText(e.target.value)}
            maxLength={300}
            className="text-sm"
          />
          <Button onClick={generateAI} disabled={generating} className="w-full">
            {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Generate AI voice
          </Button>
        </div>
      </div>
    </div>
  );
};
