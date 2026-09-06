import { motion } from 'framer-motion';
import { StoryVideoPlayer } from '@/components/kids/StoryVideoPlayer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface TheaterPlayerProps {
  storyData: {
    scenes: string[];
    images: string[];
    audioFiles?: string[];
  };
  sceneDuration: number;
  onBack: () => void;
}

export const TheaterPlayer = ({ storyData, sceneDuration, onBack }: TheaterPlayerProps) => {
  return (
    <>
      <FloatingHowItWorks title={"Theater Player - How it works"} steps={[{ title: 'Open', desc: 'Access the Theater Player section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Theater Player.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Cinema backdrop */}
      <div className="relative">
        <div className="absolute -inset-4 bg-gradient-to-b from-indigo-950 via-purple-950 to-black rounded-3xl -z-10" />
        <div className="absolute -inset-4 rounded-3xl border border-amber-400/20 -z-10" />

        {/* Glowing border effect */}
        <div className="relative rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(139,92,246,0.3)]">
          <StoryVideoPlayer
            scenes={storyData.scenes}
            images={storyData.images}
            audioFiles={storyData.audioFiles}
            sceneDuration={sceneDuration}
          />
        </div>
      </div>

      <div className="text-center">
        <Button
          onClick={onBack}
          variant="outline"
          size="lg"
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Create Another Story
        </Button>
      </div>
    </motion.div>
    </>
  );
};
