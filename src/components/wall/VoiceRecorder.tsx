import { useState, useRef } from "react";
import { Mic, Square, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useVoicePosts } from "@/hooks/useVoicePosts";

interface VoiceRecorderProps {
  postId: string;
  onRecorded?: () => void;
}

export const VoiceRecorder = ({ postId, onRecorded }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { createVoicePost } = useVoicePosts();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
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

  const handleSave = () => {
    if (audioBlob) {
      const file = new File([audioBlob], "voice-note.webm", { type: "audio/webm" });
      createVoicePost(
        { postId, audioFile: file },
        {
          onSuccess: () => {
            setAudioBlob(null);
            onRecorded?.();
          },
        }
      );
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        {!audioBlob ? (
          <>
            <Button
              variant={isRecording ? "destructive" : "default"}
              size="icon"
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <span className="text-sm text-muted-foreground">
              {isRecording ? "Recording..." : "Click to record voice note"}
            </span>
          </>
        ) : (
          <>
            <Button variant="outline" size="icon" onClick={playAudio}>
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button onClick={handleSave}>Save Voice Note</Button>
            <Button variant="ghost" onClick={() => setAudioBlob(null)}>
              Cancel
            </Button>
          </>
        )}
      </div>
    </Card>
  );
};
