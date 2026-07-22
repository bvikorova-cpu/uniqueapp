import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Pause, Trash2, Loader2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface VoiceCommentRecorderProps {
  postId?: string;
  parentCommentId?: string;
  onCommentAdded?: () => void;
  onRecordingComplete?: (url: string, duration: number) => void;
  onCancel?: () => void;
  compact?: boolean;
}

export const VoiceCommentRecorder = ({ 
  postId, 
  parentCommentId, 
  onCommentAdded,
  onRecordingComplete,
  onCancel,
  compact = false 
}: VoiceCommentRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [uploading, setUploading] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
      
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } catch (error) { toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to record voice comments",
        variant: "destructive" });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const discardRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setCurrentTime(0);
  };

  const submitVoiceComment = async () => {
    if (!audioBlob) return;

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload audio file
      const fileName = `voice-comments/${user.id}/${Date.now()}.webm`;
      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(fileName, audioBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(fileName);

      // If using callback mode, return the URL
      if (onRecordingComplete) {
        onRecordingComplete(publicUrl, duration);
        discardRecording();
        return;
      }

      // Otherwise, create comment directly
      if (postId) {
        const { error: commentError } = await supabase
          .from("post_comments")
          .insert({ post_id: postId,
            user_id: user.id,
            content: "🎤 Voice comment",
            voice_url: publicUrl,
            voice_duration: duration,
            parent_comment_id: parentCommentId || null });

        if (commentError) throw commentError;
      }

      toast({ title: "Success!", description: "Voice comment added" });
      discardRecording();
      onCommentAdded?.();
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    discardRecording();
    onCancel?.();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn("space-y-2", compact && "scale-90 origin-left")}>
      {/* Hidden audio element for playback */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleAudioTimeUpdate}
          onEnded={handleAudioEnded}
        />
      )}

      {/* Recording/Playback UI */}
      {!audioBlob ? (
        <Button
          type="button"
          variant={isRecording ? "destructive" : "outline"}
          size={compact ? "sm" : "default"}
          onClick={isRecording ? stopRecording : startRecording}
          className={cn(
            "gap-2 transition-all",
            isRecording && "animate-pulse"
          )}
        >
          {isRecording ? (
            <>
              <Square className="h-4 w-4" />
              Stop ({formatTime(duration)})
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              Record Voice
            </>
          )}
        </Button>
      ) : (
        <div className={cn(
          "flex items-center gap-2 p-3 rounded-lg",
          "bg-gradient-to-r from-primary/10 to-purple-500/10",
          "border border-primary/20"
        )}>
          {/* Playback controls */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={togglePlayback}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>

          {/* Progress bar */}
          <div className="flex-1 space-y-1">
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Actions */}
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              onClick={handleCancel}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          {!onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={discardRecording}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}

          <Button
            type="button"
            size="sm"
            onClick={submitVoiceComment}
            disabled={uploading}
            className="gap-1 bg-gradient-to-r from-primary to-purple-600"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Send
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
