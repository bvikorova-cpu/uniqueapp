import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Pause, Play, Sparkles, UserCog, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroVideo from "@/assets/edit-profile-hero.mp4.asset.json";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface EditProfileHeroProps {
  onBack: () => void;
  completeness: number; // 0-100
  unlockedBadges: number;
  totalBadges: number;
}

export const EditProfileHero = ({ onBack, completeness, unlockedBadges, totalBadges }: EditProfileHeroProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (videoRef.current) videoRef.current.play().catch(() => setIsPlaying(false));
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play();
    setIsPlaying(!isPlaying);
  };
  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <>
      <FloatingHowItWorks title={"Edit Profile Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Edit Profile Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Edit Profile Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="relative h-[60vh] min-h-[420px] w-full overflow-hidden rounded-3xl border border-border/40 mb-6">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover brightness-110 saturate-110"
        autoPlay
        muted
        loop
        playsInline
        src={heroVideo.url}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/35 to-background/80" />

      <div className="relative z-10 h-full flex flex-col justify-between px-6 sm:px-10 py-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="bg-card/40 backdrop-blur-md border border-border/50 text-foreground hover:bg-card/60"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/40 backdrop-blur-md text-foreground text-xs font-semibold border border-border/50">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Personal Profile Studio
          </span>
        </div>

        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.7, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.5 }}
            className="relative mb-3"
          >
            <div className="absolute -inset-3 bg-gradient-to-tr from-amber-400/40 to-violet-400/30 rounded-full blur-xl" />
            <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500/30 to-violet-500/30 border border-amber-400/40 backdrop-blur-md flex items-center justify-center">
              <UserCog className="h-7 w-7 text-amber-300" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-foreground via-amber-100 to-amber-300 bg-clip-text text-transparent leading-tight"
            style={{ textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
          >
            Edit Your Profile
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base text-foreground/85 mt-2 max-w-xl"
          >
            Curate your identity. Tell the world who you are — your story, your skills, your style.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-2 sm:gap-3 max-w-2xl mx-auto w-full"
        >
          <div className="bg-card/50 backdrop-blur-md rounded-xl p-3 text-center border border-border/60">
            <p className="text-2xl font-black bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
              {completeness}%
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wide mt-0.5">
              Profile Complete
            </p>
          </div>
          <div className="bg-card/50 backdrop-blur-md rounded-xl p-3 text-center border border-border/60">
            <p className="text-2xl font-black bg-gradient-to-r from-violet-300 to-fuchsia-400 bg-clip-text text-transparent">
              {unlockedBadges}/{totalBadges}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wide mt-0.5">
              Badges Unlocked
            </p>
          </div>
          <div className="bg-card/50 backdrop-blur-md rounded-xl p-3 text-center border border-border/60">
            <p className="text-2xl font-black bg-gradient-to-r from-emerald-300 to-teal-400 bg-clip-text text-transparent">
              Live
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wide mt-0.5">
              Auto-Save Off
            </p>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-4 right-4 flex gap-2 z-20">
        <Button variant="ghost" size="icon" className="bg-card/50 backdrop-blur-md hover:bg-card/70 border border-border/50" onClick={togglePlay}>
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" className="bg-card/50 backdrop-blur-md hover:bg-card/70 border border-border/50" onClick={toggleMute}>
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>
    </div>
    </>
  );
};
