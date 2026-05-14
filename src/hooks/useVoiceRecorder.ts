import { useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Voice recorder hook.
 * - useVoiceRecorder() → returns blob via stop()
 * - useVoiceRecorder(userId) → also exposes stopAndUpload() to upload to "media" bucket and return public URL
 */
export const useVoiceRecorder = (userId?: string | null) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [duration, setDuration] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const resolveRef = useRef<((blob: Blob | null) => void) | null>(null);

  const start = useCallback(async () => {
    if (isRecording) return;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
    chunksRef.current = [];
    mr.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
    mr.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      resolveRef.current?.(blob);
      resolveRef.current = null;
    };
    recorderRef.current = mr;
    mr.start();
    setIsRecording(true);
    setDuration(0);
    timerRef.current = window.setInterval(() => setDuration((d) => d + 1), 1000);
  }, [isRecording]);

  const stop = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!recorderRef.current || !isRecording) return resolve(null);
      resolveRef.current = resolve;
      recorderRef.current.stop();
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
      setIsRecording(false);
    });
  }, [isRecording]);

  const cancel = useCallback(() => {
    if (recorderRef.current && isRecording) {
      resolveRef.current = null;
      recorderRef.current.stop();
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
      setIsRecording(false);
      setDuration(0);
    }
  }, [isRecording]);

  const stopAndUpload = useCallback(async (): Promise<string | null> => {
    const blob = await stop();
    if (!blob || !userId) return null;
    setIsUploading(true);
    try {
      const path = `${userId}/voice/${Date.now()}.webm`;
      const { error } = await supabase.storage
        .from("media")
        .upload(path, blob, { contentType: "audio/webm" });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);
      return publicUrl;
    } finally {
      setIsUploading(false);
    }
  }, [stop, userId]);

  return { isRecording, isUploading, duration, start, stop, stopAndUpload, cancel };
};
