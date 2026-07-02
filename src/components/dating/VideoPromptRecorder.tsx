import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Square, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export interface VideoPrompt {
  question: string;
  video_url: string;
  duration: number;
}

const PRESET_QUESTIONS = [
  "What's your dream first date?",
  "Tell me your most embarrassing story.",
  "What makes you laugh hardest?",
  "Your hidden talent — show me.",
  "Describe yourself in 30 seconds.",
];

const MAX_SECONDS = 30;

interface Props {
  userId: string;
  value: VideoPrompt[];
  onChange: (next: VideoPrompt[]) => void;
}

export const VideoPromptRecorder = ({ userId, value, onChange }: Props) => {
  const { toast } = useToast();
  const [question, setQuestion] = useState(PRESET_QUESTIONS[0]);
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const previewRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const blobRef = useRef<Blob | null>(null);
  const durationRef = useRef(0);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 720 } },
        audio: true,
      });
      streamRef.current = stream;
      if (previewRef.current) {
        previewRef.current.srcObject = stream;
        previewRef.current.muted = true;
        await previewRef.current.play();
      }
      const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? "video/webm;codecs=vp9,opus"
        : MediaRecorder.isTypeSupported("video/webm")
        ? "video/webm"
        : "video/mp4";
      const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 1_200_000 });
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mime });
        blobRef.current = blob;
        durationRef.current = elapsedRef.current;
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        stopStream();
      };
      rec.start(250);
      recorderRef.current = rec;
      setRecording(true);
      setElapsed(0);
      elapsedRef.current = 0;
      timerRef.current = window.setInterval(() => {
        elapsedRef.current += 1;
        setElapsed(elapsedRef.current);
        if (elapsedRef.current >= MAX_SECONDS) stopRecording();
      }, 1000);
    } catch (e: any) {
      toast({ title: "Camera blocked", description: e.message ?? "Allow camera + mic", variant: "destructive" });
    }
  };

  const elapsedRef = useRef(0);

  const stopRecording = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (recorderRef.current && recorderRef.current.state !== "inactive") recorderRef.current.stop();
    setRecording(false);
  };

  const discard = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    blobRef.current = null;
  };

  const save = async () => {
    if (!blobRef.current) return;
    if (value.length >= 3) { toast({ title: "Max 3 video prompts", variant: "destructive" }); return; }
    setUploading(true);
    try {
      const ext = blobRef.current.type.includes("mp4") ? "mp4" : "webm";
      const path = `dating-video-prompts/${userId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("media").upload(path, blobRef.current, {
        contentType: blobRef.current.type, upsert: false,
      });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);

      const next: VideoPrompt[] = [...value, { question, video_url: publicUrl, duration: durationRef.current }];
      const { error: dbErr } = await supabase.from("dating_profiles")
        .update({ video_prompts: next as any }).eq("user_id", userId);
      if (dbErr) throw dbErr;

      onChange(next);
      toast({ title: "Video prompt saved" });
      discard();
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const remove = async (idx: number) => {
    const next = value.filter((_, i) => i !== idx);
    const { error } = await supabase.from("dating_profiles")
      .update({ video_prompts: next as any }).eq("user_id", userId);
    if (error) { toast({ title: "Could not remove", variant: "destructive" }); return; }
    onChange(next);
  };

  return (
    <Card>
      <FloatingHowItWorks
        title={"Video Prompt Recorder"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Video className="h-4 w-4 text-primary" /> Video Prompts
          <span className="ml-auto text-xs text-muted-foreground font-normal">{value.length}/3</span>
        </CardTitle>
        <p className="text-xs text-muted-foreground">Record up to {MAX_SECONDS}s answering a prompt. Way more memorable than text.</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {value.map((vp, i) => (
          <div key={i} className="rounded-lg border border-border overflow-hidden bg-muted/30">
            <div className="px-3 py-2 text-xs font-medium flex justify-between items-center">
              <span className="truncate">{vp.question}</span>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => remove(i)}><Trash2 className="h-3 w-3" /></Button>
            </div>
            <video src={vp.video_url} controls playsInline className="w-full aspect-square bg-black object-cover" />
          </div>
        ))}

        {value.length < 3 && (
          <div className="space-y-2 border-t border-border pt-3">
            <select className="w-full p-2 border rounded-lg bg-background text-foreground text-sm" value={question} onChange={(e) => setQuestion(e.target.value)} disabled={recording || uploading}>
              {PRESET_QUESTIONS.map((q) => <option key={q} value={q}>{q}</option>)}
            </select>

            <div className="relative rounded-lg overflow-hidden bg-black aspect-square">
              <video ref={previewRef} src={previewUrl ?? undefined} controls={!!previewUrl && !recording} playsInline className="w-full h-full object-cover" />
              {recording && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-white animate-pulse" /> REC {elapsed}s / {MAX_SECONDS}s
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {!recording && !previewUrl && (
                <Button onClick={startRecording} size="sm" className="flex-1"><Video className="h-4 w-4 mr-1" /> Start</Button>
              )}
              {recording && (
                <Button onClick={stopRecording} size="sm" variant="destructive" className="flex-1"><Square className="h-4 w-4 mr-1" /> Stop</Button>
              )}
              {previewUrl && !recording && (
                <>
                  <Button onClick={discard} size="sm" variant="outline" className="flex-1"><Trash2 className="h-4 w-4 mr-1" /> Discard</Button>
                  <Button onClick={save} size="sm" disabled={uploading} className="flex-1"><Upload className="h-4 w-4 mr-1" /> {uploading ? "Uploading..." : "Save"}</Button>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
