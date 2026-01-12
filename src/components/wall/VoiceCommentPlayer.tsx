import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceCommentPlayerProps {
  voiceUrl: string;
  duration?: number;
  compact?: boolean;
}

export const VoiceCommentPlayer = ({ 
  voiceUrl, 
  duration: initialDuration,
  compact = false 
}: VoiceCommentPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(initialDuration || 0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(voiceUrl);
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => {
      if (!initialDuration) {
        setDuration(audio.duration);
      }
    });

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [voiceUrl, initialDuration]);

  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration === 0) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={cn(
      "flex items-center gap-2 p-2 rounded-lg",
      "bg-gradient-to-r from-primary/10 to-purple-500/10",
      "border border-primary/20",
      compact && "p-1.5"
    )}>
      <Button
        variant="ghost"
        size="icon"
        className={cn("flex-shrink-0", compact ? "h-6 w-6" : "h-8 w-8")}
        onClick={togglePlayback}
      >
        {isPlaying ? (
          <Pause className={cn(compact ? "h-3 w-3" : "h-4 w-4")} />
        ) : (
          <Play className={cn(compact ? "h-3 w-3" : "h-4 w-4")} />
        )}
      </Button>

      <div className="flex-1 min-w-0 space-y-0.5">
        {/* Waveform visualization (simplified) */}
        <div 
          className="relative h-6 flex items-center gap-px cursor-pointer"
          onClick={handleProgressClick}
        >
          {Array.from({ length: 30 }).map((_, i) => {
            const barProgress = (i / 30) * 100;
            const isActive = barProgress <= progress;
            const height = 8 + Math.sin(i * 0.5) * 6 + Math.random() * 4;
            
            return (
              <div
                key={i}
                className={cn(
                  "w-1 rounded-full transition-all duration-150",
                  isActive 
                    ? "bg-gradient-to-t from-primary to-purple-500" 
                    : "bg-muted-foreground/30"
                )}
                style={{ height: `${height}px` }}
              />
            );
          })}
        </div>

        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <div className="flex items-center gap-1">
            <Volume2 className="h-3 w-3" />
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
