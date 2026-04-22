import { useState } from "react";
import { motion } from "framer-motion";
import { Music, Play, Pause, ExternalLink, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface MusicTrack {
  title: string;
  artist: string;
  coverUrl?: string;
  previewUrl?: string;
  platform: "spotify" | "apple" | "youtube" | "soundcloud";
  externalUrl?: string;
}

interface MusicShareCardProps {
  track: MusicTrack;
}

const platformColors: Record<string, string> = {
  spotify: "from-emerald-500 to-emerald-700",
  apple: "from-rose-500 to-pink-600",
  youtube: "from-red-500 to-red-700",
  soundcloud: "from-orange-500 to-amber-600",
};

const platformIcons: Record<string, string> = {
  spotify: "🎵",
  apple: "🍎",
  youtube: "▶️",
  soundcloud: "☁️",
};

export const MusicShareCard = ({ track }: MusicShareCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      // Simulate progress
      const interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(interval);
            setIsPlaying(false);
            return 0;
          }
          return p + 0.5;
        });
      }, 150);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="rounded-2xl overflow-hidden border border-white/10 bg-accent/10 backdrop-blur-sm"
    >
      <div className="flex items-stretch">
        {/* Cover Art */}
        <div className="relative w-24 h-24 flex-shrink-0">
          {track.coverUrl ? (
            <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${platformColors[track.platform]} flex items-center justify-center`}>
              <Music className="w-8 h-8 text-white/80" />
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-white drop-shadow-lg" />
            ) : (
              <Play className="w-8 h-8 text-white drop-shadow-lg ml-1" />
            )}
          </motion.button>
        </div>

        {/* Track info */}
        <div className="flex-1 p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base">{platformIcons[track.platform]}</span>
              <h4 className="font-semibold text-sm line-clamp-1">{track.title}</h4>
            </div>
            <p className="text-xs text-muted-foreground">{track.artist}</p>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1 bg-accent/30 rounded-full overflow-hidden mt-2">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${platformColors[track.platform]}`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center gap-2 mt-1">
            {track.externalUrl && (
              <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 px-2" asChild>
                <a href={track.externalUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3 h-3" /> Open
                </a>
              </Button>
            )}
            <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 px-2" onClick={() => toast.info("Share — coming soon")}>
              <Share2 className="w-3 h-3" /> Share
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Input component for sharing music in create post
interface MusicShareInputProps {
  onShare: (track: MusicTrack) => void;
}

export const MusicShareInput = ({ onShare }: MusicShareInputProps) => {
  const [url, setUrl] = useState("");

  const detectPlatform = (url: string): MusicTrack["platform"] => {
    if (url.includes("spotify")) return "spotify";
    if (url.includes("apple")) return "apple";
    if (url.includes("soundcloud")) return "soundcloud";
    return "youtube";
  };

  const handleSubmit = () => {
    if (!url.trim()) return;
    onShare({
      title: "Shared Track",
      artist: "Artist",
      platform: detectPlatform(url),
      externalUrl: url,
    });
    setUrl("");
  };

  return (
    <div className="flex gap-2 p-3 rounded-xl bg-accent/20 border border-white/5">
      <Music className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <input
          type="url"
          placeholder="Paste music link (Spotify, YouTube, SoundCloud...)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
      </div>
      <Button size="sm" variant="secondary" onClick={handleSubmit} disabled={!url.trim()} className="h-7 text-xs rounded-lg">
        Share
      </Button>
    </div>
  );
};
