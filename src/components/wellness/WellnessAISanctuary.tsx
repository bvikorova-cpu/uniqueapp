import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { DreamInterpreterCard } from "./DreamInterpreterCard";
import { PersonalizedMeditationCard } from "./PersonalizedMeditationCard";
import { MoodMirrorCard } from "./MoodMirrorCard";
import { AiSleepStoryCard } from "./AiSleepStoryCard";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export function WellnessAISanctuary() {
  return (
    <>
      <FloatingHowItWorks title="WellnessAISanctuary — How it works" steps={[{title:"Open this tool",desc:"Access WellnessAISanctuary within the Health & Wellness section."},{title:"Configure",desc:"Adjust preferences, choose duration or select goals."},{title:"Start & interact",desc:"Begin the session, log data or run an AI analysis (some cost 3–5 credits)."},{title:"Review results",desc:"Check outcomes, save to history and track progress over time."}]} />
      <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-10"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-teal-400" />
        <h2 className="text-xl sm:text-2xl font-black text-foreground">AI Sanctuary</h2>
        <span className="text-xs text-muted-foreground">— Premium AI tools, instantly personalized</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <DreamInterpreterCard />
        <PersonalizedMeditationCard />
        <MoodMirrorCard />
        <AiSleepStoryCard />
      </div>
    </motion.section>
    </>);
}
