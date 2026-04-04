import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Maximize2, Minimize2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface EmbeddedGameProps {
  onBack: () => void;
  title: string;
  gameUrl: string;
  sport: "football" | "basketball" | "hockey" | "tennis" | "american-football";
}

const sportColors: Record<string, string> = {
  football: "from-emerald-600 to-green-600",
  basketball: "from-orange-600 to-amber-600",
  hockey: "from-cyan-600 to-blue-600",
  tennis: "from-lime-600 to-green-600",
  "american-football": "from-green-600 to-emerald-600",
};

const sportBorders: Record<string, string> = {
  football: "border-emerald-500/30",
  basketball: "border-orange-500/30",
  hockey: "border-cyan-500/30",
  tennis: "border-lime-500/30",
  "american-football": "border-green-500/30",
};

export const EmbeddedGame = ({ onBack, title, gameUrl, sport }: EmbeddedGameProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 backdrop-blur-sm">
          <h3 className="text-white font-mono text-sm">{title}</h3>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={toggleFullscreen} className="text-white hover:bg-white/10">
              <Minimize2 className="h-4 w-4 mr-1" /> Exit Fullscreen
            </Button>
            <Button size="sm" variant="ghost" onClick={onBack} className="text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </div>
        </div>
        <iframe
          src={gameUrl}
          className="flex-1 w-full border-0"
          allow="autoplay; fullscreen; gamepad"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h2 className="text-xl font-bold font-mono">{title}</h2>
          <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full text-[10px] font-mono text-purple-300 uppercase tracking-wider">
            HTML5 Game
          </span>
        </div>
        <Button size="sm" variant="outline" onClick={toggleFullscreen} className={sportBorders[sport]}>
          <Maximize2 className="h-4 w-4 mr-1" /> Fullscreen
        </Button>
      </div>

      <div className={`relative rounded-xl overflow-hidden border ${sportBorders[sport]} bg-black aspect-[16/10] md:aspect-[16/9]`}>
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-white/60" />
            <p className="text-white/40 font-mono text-sm">Loading game...</p>
          </div>
        )}
        <iframe
          src={gameUrl}
          className="w-full h-full border-0"
          allow="autoplay; fullscreen; gamepad"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
        />
      </div>

      <p className="text-xs text-muted-foreground/50 font-mono text-center">
        Game provided by GameDistribution. Use mouse/touch to play.
      </p>
    </motion.div>
  );
};
