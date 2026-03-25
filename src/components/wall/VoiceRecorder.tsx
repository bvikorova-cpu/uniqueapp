import { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, Trash2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useVoicePosts } from "@/hooks/useVoicePosts";

interface VoiceRecorderProps {
  postId?: string;
  onRecorded?: (file: File) => void;
  onCancel?: () => void;
}

export const VoiceRecorder = ({ postId, onRecorded, onCancel }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [waveform, setWaveform] = useState<number[]>(new Array(40).fill(0.1));
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { createVoicePost } = useVoicePosts();

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
        audioContext.close();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);

      const updateWaveform = () => {
        if (!analyserRef.current) return;
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        const bars = Array.from({ length: 40 }, (_, i) => {
          const idx = Math.floor((i / 40) * data.length);
          return Math.max(0.08, data[idx] / 255);
        });
        setWaveform(bars);
        animFrameRef.current = requestAnimationFrame(updateWaveform);
      };
      updateWaveform();
    } catch (error) {
      console.error("Microphone error:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      setIsRecording(false);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const playAudio = () => {
    if (audioBlob && !audioRef.current) {
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audioRef.current = audio;
      audio.onended = () => setIsPlaying(false);
    }
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleSend = () => {
    if (!audioBlob) return;
    const file = new File([audioBlob], "voice-note.webm", { type: "audio/webm" });
    if (postId) {
      createVoicePost({ postId, audioFile: file }, { onSuccess: () => { setAudioBlob(null); onCancel?.(); } });
    } else {
      onRecorded?.(file);
      setAudioBlob(null);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="rounded-2xl bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border border-white/10 backdrop-blur-xl p-4"
    >
      <div className="flex items-center gap-3">
        {/* Record / Stop button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={isRecording ? stopRecording : audioBlob ? playAudio : startRecording}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            isRecording
              ? "bg-destructive text-destructive-foreground shadow-[0_0_20px_rgba(239,68,68,0.5)]"
              : audioBlob
              ? "bg-primary text-primary-foreground"
              : "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(139,92,246,0.4)]"
          }`}
        >
          {isRecording ? (
            <Square className="w-5 h-5" />
          ) : audioBlob ? (
            isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </motion.button>

        {/* Waveform visualization */}
        <div className="flex-1 flex items-center gap-[2px] h-10 overflow-hidden">
          {waveform.map((val, i) => (
            <motion.div
              key={i}
              animate={{ 
                height: `${val * 100}%`,
                backgroundColor: isRecording 
                  ? `hsl(var(--destructive) / ${0.4 + val * 0.6})`
                  : `hsl(var(--primary) / ${0.3 + val * 0.7})`
              }}
              transition={{ duration: 0.05 }}
              className="flex-1 min-w-[2px] rounded-full"
              style={{ minHeight: 3 }}
            />
          ))}
        </div>

        {/* Timer */}
        <span className="text-sm font-mono font-semibold text-foreground/70 min-w-[40px] text-right tabular-nums">
          {formatTime(duration)}
        </span>

        {/* Actions */}
        {audioBlob && (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => { setAudioBlob(null); audioRef.current = null; setWaveform(new Array(40).fill(0.1)); setDuration(0); }}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
            <Button size="icon" className="h-9 w-9 rounded-full bg-primary" onClick={handleSend}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        )}

        {!audioBlob && !isRecording && (
          <Button variant="ghost" size="sm" onClick={onCancel} className="text-xs text-muted-foreground">
            Cancel
          </Button>
        )}
      </div>

      {isRecording && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 mt-2"
        >
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-destructive"
          />
          <span className="text-xs text-destructive font-medium">Recording...</span>
        </motion.div>
      )}
    </motion.div>
  );
};
