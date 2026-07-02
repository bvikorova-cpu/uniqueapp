import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Volume2, VolumeX, Heart, X, Shield, CheckCircle } from 'lucide-react';
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface VideoProfileProps {
  user: {
    id: string;
    name: string;
    age: number;
    videoUrl: string;
    thumbnailUrl?: string;
    isVerified: boolean;
    safetyScore: number;
    interests: string[];
  };
  onLike?: () => void;
  onPass?: () => void;
}

export const VideoProfile = ({ user, onLike, onPass }: VideoProfileProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="relative w-full max-w-sm mx-auto"
    >
      <FloatingHowItWorks
        title={"Video Profile"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <Card className="overflow-hidden rounded-3xl">
        <CardContent className="p-0 relative aspect-[3/4]">
          {/* Video Container */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60">
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">Video Profile</span>
            </div>
          </div>

          {/* Safety Badge */}
          {user.isVerified && (
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <Badge className="bg-green-500/90 text-white border-0 flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Verified
              </Badge>
              <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                Safety: {user.safetyScore}%
              </Badge>
            </div>
          )}

          {/* Video Controls */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>

          {/* User Info */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold">{user.name}, {user.age}</h3>
              {user.isVerified && <CheckCircle className="h-5 w-5 text-blue-400" />}
            </div>
            <div className="flex flex-wrap gap-1">
              {user.interests.slice(0, 3).map((interest, i) => (
                <Badge key={i} variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mt-4">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            variant="outline"
            size="icon"
            className="h-14 w-14 rounded-full border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={onPass}
          >
            <X className="h-6 w-6" />
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            variant="outline"
            size="icon"
            className="h-14 w-14 rounded-full border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
            onClick={onLike}
          >
            <Heart className="h-6 w-6" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export const AIMatchVisualization = ({ matchScore }: { matchScore: number }) => {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="relative w-32 h-32 mx-auto"
    >
      <svg className="w-full h-full -rotate-90">
        <circle
          cx="64"
          cy="64"
          r="56"
          strokeWidth="8"
          className="fill-none stroke-muted"
        />
        <motion.circle
          cx="64"
          cy="64"
          r="56"
          strokeWidth="8"
          className="fill-none stroke-primary"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: matchScore / 100 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{
            strokeDasharray: "352",
            strokeDashoffset: "0",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <motion.span
            className="text-2xl font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {matchScore}%
          </motion.span>
          <p className="text-xs text-muted-foreground">Match</p>
        </div>
      </div>
    </motion.div>
  );
};
