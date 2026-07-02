import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface StoryQuickTemplatesProps {
  onSelect: (template: { title: string; characters: string; theme: string; category: string }) => void;
}

const TEMPLATES = [
  {
    emoji: "🐉",
    label: "Dragon Quest",
    title: "The Brave Little Dragon",
    characters: "A small dragon named Spark, a wise owl, a friendly fairy",
    theme: "A baby dragon afraid of flying learns courage in an enchanted mountain",
    category: "fantasy",
    color: "from-red-500/20 to-orange-500/20",
    border: "border-red-300",
  },
  {
    emoji: "🚀",
    label: "Space Mission",
    title: "Mission to Candy Planet",
    characters: "Astronaut cat Captain Whiskers, robot helper Beep, alien friend Ziggy",
    theme: "A candy planet where rivers flow with chocolate and mountains are cookies",
    category: "space",
    color: "from-blue-500/20 to-indigo-500/20",
    border: "border-blue-300",
  },
  {
    emoji: "👸",
    label: "Princess Inventor",
    title: "The Science Princess",
    characters: "Princess Luna who loves science, talking garden flowers, a magic butterfly",
    theme: "An enchanted garden where a princess invents machines that make flowers sing",
    category: "fairy-tale",
    color: "from-pink-500/20 to-purple-500/20",
    border: "border-pink-300",
  },
  {
    emoji: "🦕",
    label: "Dino World",
    title: "Little Dino's Journey Home",
    characters: "Baby dinosaur Rex, firefly friends, wise old turtle",
    theme: "A magical prehistoric forest where a lost dinosaur makes friends on his way home",
    category: "adventure",
    color: "from-green-500/20 to-emerald-500/20",
    border: "border-green-300",
  },
  {
    emoji: "🧙",
    label: "Magic School",
    title: "The Flying Library Books",
    characters: "Young wizard Finn, enchanted books, headmaster owl",
    theme: "A wizard school library where books come alive and fly around the castle",
    category: "fantasy",
    color: "from-violet-500/20 to-purple-500/20",
    border: "border-violet-300",
  },
  {
    emoji: "🌊",
    label: "Ocean Adventure",
    title: "The Singing Whales",
    characters: "Little mermaid Coral, a treasure chest, singing whales",
    theme: "A sunken treasure map leading to a lost city of musical sea creatures",
    category: "adventure",
    color: "from-cyan-500/20 to-blue-500/20",
    border: "border-cyan-300",
  },
];

export const StoryQuickTemplates = ({ onSelect }: StoryQuickTemplatesProps) => {
  return (
    <>
      <FloatingHowItWorks title={"Story Quick Templates - How it works"} steps={[{ title: 'Open', desc: 'Access the Story Quick Templates section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Story Quick Templates.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-2xl">💡</span>
        <h3 className="text-lg font-bold text-foreground">Quick Start Templates</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {TEMPLATES.map((t, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect({ title: t.title, characters: t.characters, theme: t.theme, category: t.category })}
            className={`bg-gradient-to-br ${t.color} border-2 ${t.border} rounded-xl p-4 text-left hover:shadow-lg transition-shadow`}
          >
            <div className="text-3xl mb-2">{t.emoji}</div>
            <div className="font-semibold text-foreground text-sm">{t.label}</div>
            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.theme.substring(0, 60)}...</div>
          </motion.button>
        ))}
      </div>
    </div>
    </>
  );
};
