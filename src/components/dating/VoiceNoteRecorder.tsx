import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const MAX_SECONDS = 60;

interface Props {
  userId: string;
  matchId: string;
  onSent: () => void;
}

export const VoiceNoteRecorder = ({ userId, matchId, onSent }: Props) => {
  const { toast } = useToast();
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);

  const cleanup = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setRecording(false);
  };

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm";
      const rec = new MediaRecorder(stream, { mimeType: mime });
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      rec.onstop = () => upload(new Blob(chunksRef.current, { type: mime }), elapsedRef.current);
      rec.start(250);
      recRef.current = rec;
      elapsedRef.current = 0;
      setElapsed(0);
      setRecording(true);
      timerRef.current = window.setInterval(() => {
        elapsedRef.current += 1; setElapsed(elapsedRef.current);
        if (elapsedRef.current >= MAX_SECONDS) stop();
      }, 1000);
    } catch (e: any) {
      toast({ title: "Microphone blocked", description: e.message, variant: "destructive" });
    }
  };

  const stop = () => {
    if (recRef.current && recRef.current.state !== "inactive") recRef.current.stop();
    cleanup();
  };

  const cancel = () => {
    chunksRef.current = [];
    if (recRef.current) recRef.current.onstop = null as any;
    if (recRef.current && recRef.current.state !== "inactive") recRef.current.stop();
    cleanup();
  };

  const upload = async (blob: Blob, duration: number) => {
    if (duration < 1) { toast({ title: "Too short", variant: "destructive" }); return; }
    setUploading(true);
    try {
      const path = `dating-voice-notes/${userId}/${Date.now()}.webm`;
      const { error: upErr } = await supabase.storage.from("media").upload(path, blob, { contentType: blob.type });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);
      const { error: dbErr } = await supabase.from("dating_messages").insert({
        match_id: matchId, sender_id: userId, content: "🎙️ Voice note", voice_url: publicUrl, voice_duration: duration,
      });
      if (dbErr) throw dbErr;
      onSent();
    } catch (e: any) {
      toast({ title: "Send failed", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  if (recording) {
    return (
      <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-full px-3 py-1.5">
        <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-xs font-mono text-red-500">{elapsed}s</span>
        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground" onClick={cancel}><X className="h-4 w-4" /></Button>
        <Button size="icon" className="h-7 w-7 rounded-full bg-red-500 hover:bg-red-600" onClick={stop}><Square className="h-3 w-3" /></Button>
      </div>
    );
  }

  return (
    <Button type="button" variant="ghost" size="icon" onClick={start} disabled={uploading} className="text-muted-foreground hover:text-primary">
      <Mic className="h-5 w-5" />
    </Button>
  );
};
