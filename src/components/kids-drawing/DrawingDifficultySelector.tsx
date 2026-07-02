import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const DIFFICULTIES = [
  {
    value: "easy",
    label: "Easy",
    emoji: "⭐",
    description: "Simple shapes, 3-4 steps",
    color: "from-green-500/20 to-emerald-500/20 border-green-500/30",
    age: "Ages 4-6",
  },
  {
    value: "medium",
    label: "Medium",
    emoji: "⭐⭐",
    description: "More detail, 5-6 steps",
    color: "from-yellow-500/20 to-orange-500/20 border-yellow-500/30",
    age: "Ages 7-9",
  },
  {
    value: "hard",
    label: "Hard",
    emoji: "⭐⭐⭐",
    description: "Complex shapes, 7+ steps",
    color: "from-red-500/20 to-pink-500/20 border-red-500/30",
    age: "Ages 10+",
  },
];

interface Props {
  selected: string;
  onSelect: (value: string) => void;
}

export const DrawingDifficultySelector = ({ selected, onSelect }: Props) => {
  return (
    <>
      <FloatingHowItWorks title={"Drawing Difficulty Selector - How it works"} steps={[{ title: 'Open', desc: 'Access the Drawing Difficulty Selector section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Drawing Difficulty Selector.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Difficulty Level
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {DIFFICULTIES.map((d, i) => (
          <motion.button
            key={d.value}
            onClick={() => onSelect(d.value)}
            className={`relative p-4 rounded-xl border-2 transition-all text-center bg-gradient-to-br ${d.color} ${
              selected === d.value
                ? "ring-2 ring-primary shadow-lg scale-[1.02]"
                : "hover:shadow-md"
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <div className="text-xl mb-1">{d.emoji}</div>
            <div className="text-sm font-bold">{d.label}</div>
            <div className="text-xs text-muted-foreground mt-1">{d.description}</div>
            <div className="text-xs text-muted-foreground/70 mt-1">{d.age}</div>
          </motion.button>
        ))}
      </div>
    </div>
    </>
  );
};
