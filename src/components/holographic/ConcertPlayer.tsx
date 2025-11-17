import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Maximize, X } from "lucide-react";
import Hls from "hls.js";

interface ConcertPlayerProps {
  concert: {
    id: string;
    title: string;
    artist_name: string;
    video_url?: string;
  } | null;
  open: boolean;
  onClose: () => void;
}

const ConcertPlayer = ({ concert, open, onClose }: ConcertPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    if (!concert?.video_url || !videoRef.current || !open) return;

    const video = videoRef.current;
    const videoUrl = concert.video_url;

    // Demo URL for testing (můžeš nahradit skutočnou URL)
    const demoUrl = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hlsRef.current = hls;
      hls.loadSource(videoUrl || demoUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("HLS manifest parsed, ready to play");
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS error:", data);
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari native HLS support
      video.src = videoUrl || demoUrl;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [concert, open]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  if (!concert) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl p-0 bg-black border-purple-500/30">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 animate-gradient">
                {concert.title}
              </DialogTitle>
              <p className="text-lg text-purple-300">{concert.artist_name}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-purple-500/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </DialogHeader>

        <div className="relative aspect-video bg-black holographic-container">
          {/* Holographic Effect Overlays */}
          <div className="holographic-effect"></div>
          <div className="holographic-scanlines"></div>
          <div className="holographic-glow"></div>
          
          <video
            ref={videoRef}
            className="w-full h-full relative z-10 holographic-video"
            playsInline
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {/* Custom Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center gap-4">
              <Button
                size="icon"
                variant="ghost"
                onClick={togglePlay}
                className="text-white hover:bg-white/10"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>

              <div className="flex items-center gap-2 flex-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/10"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-24"
                />
              </div>

              <Button
                size="icon"
                variant="ghost"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/10"
              >
                <Maximize className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-purple-950/30 to-black">
          <p className="text-sm text-muted-foreground">
            🎵 Holographic Concert Experience - Premium Quality Stream
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConcertPlayer;
