import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useVoiceRecorder(userId: string | null) {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const startedAtRef = useRef<number>(0);
  const tickRef = useRef<number | null>(null);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.start();
      mediaRecorderRef.current = mr;
      startedAtRef.current = Date.now();
      setIsRecording(true);
      setDuration(0);
      tickRef.current = window.setInterval(() => {
        setDuration(Math.floor((Date.now() - startedAtRef.current) / 1000));
      }, 250);
    } catch (e: any) {
      toast({ title: "Mic error", description: e?.message ?? "Cannot access microphone", variant: "destructive" });
    }
  }, [toast]);

  const cancel = useCallback(() => {
    if (tickRef.current) window.clearInterval(tickRef.current);
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach(t => t.stop());
    chunksRef.current = [];
    setIsRecording(false);
    setDuration(0);
  }, []);

  const stopAndUpload = useCallback(async (): Promise<string | null> => {
    if (!userId || !mediaRecorderRef.current) return null;
    return new Promise((resolve) => {
      const mr = mediaRecorderRef.current!;
      mr.onstop = async () => {
        if (tickRef.current) window.clearInterval(tickRef.current);
        streamRef.current?.getTracks().forEach(t => t.stop());
        setIsRecording(false);
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        chunksRef.current = [];
        if (blob.size < 500) { setDuration(0); resolve(null); return; }
        setIsUploading(true);
        const path = `${userId}/${Date.now()}.webm`;
        const { error } = await supabase.storage.from("anonymous-date-voice").upload(path, blob, { contentType: "audio/webm" });
        setIsUploading(false);
        setDuration(0);
        if (error) {
          toast({ title: "Upload failed", description: error.message, variant: "destructive" });
          resolve(null);
          return;
        }
        const { data } = supabase.storage.from("anonymous-date-voice").getPublicUrl(path);
        resolve(data.publicUrl);
      };
      mr.stop();
    });
  }, [userId, toast]);

  return { isRecording, isUploading, duration, start, stopAndUpload, cancel };
}
