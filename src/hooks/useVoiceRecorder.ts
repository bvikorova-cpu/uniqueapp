import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Voice recorder hook.
 * - useVoiceRecorder() → returns blob via stop()
 * - useVoiceRecorder(userId) → also exposes stopAndUpload() to upload to "media" bucket
 * - Hard cap: maxDuration seconds (default 60). Recorder auto-stops at the cap.
 */
export const useVoiceRecorder = (userId?: string | null, maxDuration = 60) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [duration, setDuration] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const resolveRef = useRef<((blob: Blob | null) => void) | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  // Cleanup on unmount — release mic + timers even if user navigates away mid-record.
  useEffect(() => {
    return () => {
      try {
        if (recorderRef.current && recorderRef.current.state !== "inactive") {
          resolveRef.current = null;
          recorderRef.current.stop();
        }
      } catch { /* noop */ }
      cleanup();
    };
  }, [cleanup]);

  const start = useCallback(async () => {
    if (isRecording) return;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
    chunksRef.current = [];
    mr.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
    mr.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      resolveRef.current?.(blob);
      resolveRef.current = null;
    };
    recorderRef.current = mr;
    mr.start();
    setIsRecording(true);
    setDuration(0);
    timerRef.current = window.setInterval(() => {
      setDuration((d) => {
        const next = d + 1;
        if (next >= maxDuration && recorderRef.current?.state === "recording") {
          // Auto-stop at cap — resolves any pending stop() promise.
          try { recorderRef.current.stop(); } catch { /* noop */ }
          if (timerRef.current) window.clearInterval(timerRef.current);
          timerRef.current = null;
          setIsRecording(false);
        }
        return next;
      });
    }, 1000);
  }, [isRecording, maxDuration]);

  const stop = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!recorderRef.current || !isRecording) return resolve(null);
      resolveRef.current = resolve;
      try { recorderRef.current.stop(); } catch { /* noop */ }
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
      setIsRecording(false);
    });
  }, [isRecording]);

  const cancel = useCallback(() => {
    if (recorderRef.current && isRecording) {
      resolveRef.current = null;
      try { recorderRef.current.stop(); } catch { /* noop */ }
      cleanup();
      setIsRecording(false);
      setDuration(0);
    }
  }, [isRecording, cleanup]);

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

  return { isRecording, isUploading, duration, maxDuration, start, stop, stopAndUpload, cancel };
};
