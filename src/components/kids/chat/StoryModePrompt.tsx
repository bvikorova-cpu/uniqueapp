import { motion } from "framer-motion";
import { BookOpen, Sword, Map, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface StoryModePromptProps {
  characterName: string;
  onSelectStory: (prompt: string) => void;
}

const STORY_PROMPTS = [
  {
    id: "adventure",
    title: "Epic Adventure",
    icon: <Sword className="h-5 w-5" />,
    prompt: "Let's go on an exciting adventure together! Start an interactive story where I make choices. Begin the adventure!",
    color: "from-red-400 to-orange-400",
    emoji: "⚔️",
  },
  {
    id: "mystery",
    title: "Solve a Mystery",
    icon: <Map className="h-5 w-5" />,
    prompt: "Let's solve a mystery together! Create an interactive mystery where I help find clues and solve the case!",
    color: "from-purple-400 to-indigo-400",
    emoji: "🔍",
  },
  {
    id: "fairy-tale",
    title: "Fairy Tale",
    icon: <BookOpen className="h-5 w-5" />,
    prompt: "Tell me a magical fairy tale where I can make choices and be part of the story!",
    color: "from-pink-400 to-rose-400",
    emoji: "🧚",
  },
  {
    id: "space",
    title: "Space Mission",
    icon: <Sparkles className="h-5 w-5" />,
    prompt: "Let's go on a space mission together! Create an interactive space adventure where I make decisions!",
    color: "from-blue-400 to-cyan-400",
    emoji: "🚀",
  },
];

export function StoryModePrompt({ characterName, onSelectStory }: StoryModePromptProps) {
  return (
    <>
      <FloatingHowItWorks title={"Story Mode Prompt - How it works"} steps={[{ title: 'Open', desc: 'Access the Story Mode Prompt section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Story Mode Prompt.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100"
    >
      <h4 className="text-sm font-bold text-indigo-700 mb-3 flex items-center gap-2">
        <BookOpen className="h-4 w-4" />
        Story Mode — Choose an adventure with {characterName}!
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {STORY_PROMPTS.map((story) => (
          <motion.div key={story.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              variant="ghost"
              onClick={() => onSelectStory(story.prompt)}
              className={`w-full h-auto py-3 px-3 bg-gradient-to-r ${story.color} text-white hover:opacity-90 rounded-xl flex flex-col items-center gap-1 shadow-md`}
            >
              <span className="text-xl">{story.emoji}</span>
              <span className="text-xs font-bold">{story.title}</span>
            </Button>
          </motion.div>
        ))}
      </div>
    </motion.div>
    </>
  );
}
