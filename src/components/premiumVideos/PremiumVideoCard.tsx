import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Eye, Loader2, Lock, Sparkles, Unlock } from "lucide-react";
import type { PremiumVideo } from "@/hooks/usePremiumVideos";

interface Props {
  video: PremiumVideo;
  unlocking: boolean;
  onUnlock: (id: string) => Promise<boolean>;
  onFirstPlay: (id: string) => void;
}

export default function PremiumVideoCard({ video, unlocking, onUnlock, onFirstPlay }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [locked, setLocked] = useState(false);
  const [viewed, setViewed] = useState(false);

  const handlePlay = () => {
    if (!viewed) {
      setViewed(true);
      onFirstPlay(video.id);
    }
  };

  const handleTimeUpdate = () => {
    const el = ref.current;
    if (!el || video.unlocked) return;
    const half = (el.duration || 0) / 2;
    if (half > 0 && el.currentTime >= half) {
      el.pause();
      el.currentTime = half;
      setLocked(true);
    }
  };

  const handleUnlock = async () => {
    const ok = await onUnlock(video.id);
    if (ok) {
      setLocked(false);
      ref.current?.play().catch(() => {});
    }
  };

  return (
    <Card className="overflow-hidden border-border/50 bg-card/60 backdrop-blur-xl shadow-lg">
      <div className="relative aspect-video bg-black">
        <video
          ref={ref}
          src={video.video_url}
          poster={video.thumbnail_url || undefined}
          controls={!locked}
          playsInline
          preload="metadata"
          className="h-full w-full object-contain"
          onPlay={handlePlay}
          onTimeUpdate={handleTimeUpdate}
        />

        {locked && !video.unlocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/85 backdrop-blur-md px-6 text-center">
            <div className="rounded-full bg-primary/15 p-3">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <p className="font-semibold">You reached the halfway point</p>
            <p className="text-sm text-muted-foreground">
              Unlock the rest of this video for {video.unlock_cost} credit
              {video.unlock_cost > 1 ? "s" : ""}. Half of it goes to the creator.
            </p>
            <Button onClick={handleUnlock} disabled={unlocking} className="mt-1">
              {unlocking ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Unlock className="mr-2 h-4 w-4" />
              )}
              Unlock for {video.unlock_cost} credit{video.unlock_cost > 1 ? "s" : ""}
            </Button>
          </div>
        )}

        {!video.unlocked && !locked && (
          <Badge className="absolute left-3 top-3 gap-1 bg-primary/90">
            <Sparkles className="h-3 w-3" /> Locks at 50%
          </Badge>
        )}
      </div>

      <div className="space-y-2 p-4">
        <h3 className="font-semibold leading-tight">{video.title}</h3>
        {video.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
        )}
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex min-w-0 items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarImage src={video.author_avatar || undefined} alt={video.author_name || "Creator"} />
              <AvatarFallback>{(video.author_name || "U").charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="truncate text-sm text-muted-foreground">
              {video.author_name || "Unique creator"}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" /> {video.views_count}
            </span>
            <span className="flex items-center gap-1">
              <Unlock className="h-3.5 w-3.5" /> {video.unlocks_count}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
