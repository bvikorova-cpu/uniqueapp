import { useCallback, useRef, useState } from "react";

export const useVoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
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

  return { isRecording, duration, start, stop, cancel };
};
