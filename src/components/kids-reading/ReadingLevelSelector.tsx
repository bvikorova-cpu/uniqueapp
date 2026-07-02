import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const levels = [
  {
    id: "beginner",
    label: "Beginner",
    emoji: "🌱",
    age: "Ages 5-7",
    description: "Simple words, short sentences",
    color: "from-green-500/20 to-emerald-500/20",
    border: "border-green-500/30",
  },
  {
    id: "intermediate",
    label: "Intermediate",
    emoji: "📗",
    age: "Ages 8-10",
    description: "Longer texts, new vocabulary",
    color: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-500/30",
  },
  {
    id: "advanced",
    label: "Advanced",
    emoji: "🎓",
    age: "Ages 11-13",
    description: "Complex texts, critical thinking",
    color: "from-purple-500/20 to-pink-500/20",
    border: "border-purple-500/30",
  },
];

interface Props {
  selected: string;
  onSelect: (level: string) => void;
}

export const ReadingLevelSelector = ({ selected, onSelect }: Props) => {
  return (
    <>
      <FloatingHowItWorks title={"Reading Level Selector - How it works"} steps={[{ title: 'Open', desc: 'Access the Reading Level Selector section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Reading Level Selector.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="mb-6">
      <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
        Reading Level
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {levels.map((level) => (
          <motion.button
            key={level.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(level.id)}
            className={`relative p-3 rounded-xl border-2 transition-all text-left ${
              selected === level.id
                ? `${level.border} bg-gradient-to-br ${level.color} shadow-lg`
                : "border-border/50 hover:border-primary/30"
            }`}
          >
            <div className="text-2xl mb-1">{level.emoji}</div>
            <div className="font-bold text-xs">{level.label}</div>
            <div className="text-[10px] text-muted-foreground">{level.age}</div>
          </motion.button>
        ))}
      </div>
    </div>
    </>
  );
};
