import { motion } from "framer-motion";
import type { Character } from "@/data/kidsCharacters";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

type Mood = "happy" | "excited" | "curious" | "thoughtful" | "surprised";

const MOOD_CONFIG: Record<Mood, { emoji: string; label: string; bg: string }> = {
  happy: { emoji: "😊", label: "Happy", bg: "from-yellow-200 to-orange-200" },
  excited: { emoji: "🤩", label: "Excited", bg: "from-pink-200 to-red-200" },
  curious: { emoji: "🤔", label: "Curious", bg: "from-blue-200 to-cyan-200" },
  thoughtful: { emoji: "💭", label: "Thinking", bg: "from-purple-200 to-indigo-200" },
  surprised: { emoji: "😲", label: "Surprised", bg: "from-green-200 to-teal-200" },
};

interface CharacterMoodIndicatorProps {
  character: Character;
  messageCount: number;
  lastMessage?: string;
}

function detectMood(messageCount: number, lastMessage?: string): Mood {
  if (!lastMessage) return "happy";
  const lower = lastMessage.toLowerCase();
  if (lower.includes("?") || lower.includes("how") || lower.includes("why") || lower.includes("what")) return "curious";
  if (lower.includes("!") || lower.includes("wow") || lower.includes("amazing") || lower.includes("cool")) return "excited";
  if (lower.includes("think") || lower.includes("maybe") || lower.includes("hmm")) return "thoughtful";
  if (lower.includes("really") || lower.includes("no way") || lower.includes("whoa")) return "surprised";
  return "happy";
}

export function CharacterMoodIndicator({ character, messageCount, lastMessage }: CharacterMoodIndicatorProps) {
  const mood = detectMood(messageCount, lastMessage);
  const config = MOOD_CONFIG[mood];

  return (
    <>
      <FloatingHowItWorks title={"Character Mood Indicator - How it works"} steps={[{ title: 'Open', desc: 'Access the Character Mood Indicator section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Character Mood Indicator.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      key={mood}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r ${config.bg} shadow-sm`}
    >
      <motion.span
        animate={{ rotate: [0, -10, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="text-lg"
      >
        {config.emoji}
      </motion.span>
      <span className="text-xs font-medium text-gray-700">{character.name} is {config.label}</span>
    </motion.div>
    </>
  );
}
