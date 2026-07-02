import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const levels = [
  { id: "young", label: "Young Scientist", age: "6-8 years", icon: "🌱", color: "from-green-500/20 to-lime-500/20", border: "border-green-500/40" },
  { id: "explorer", label: "Explorer", age: "9-10 years", icon: "🔍", color: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/40" },
  { id: "researcher", label: "Researcher", age: "11-12 years", icon: "🎓", color: "from-purple-500/20 to-pink-500/20", border: "border-purple-500/40" },
];

interface DifficultySelectorProps {
  selected: string;
  onSelect: (id: string) => void;
}

export const DifficultySelector = ({ selected, onSelect }: DifficultySelectorProps) => {
  return (
    <>
      <FloatingHowItWorks title={"Difficulty Selector - How it works"} steps={[{ title: 'Open', desc: 'Access the Difficulty Selector section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Difficulty Selector.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
        🎯 Choose Your Level
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {levels.map((level, i) => (
          <motion.button
            key={level.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(level.id)}
            className={`
              p-4 rounded-2xl border-2 text-left transition-all
              bg-gradient-to-br ${level.color} ${level.border}
              ${selected === level.id ? "ring-2 ring-offset-2 ring-offset-background shadow-lg" : ""}
            `}
          >
            <div className="text-2xl mb-1">{level.icon}</div>
            <div className="font-bold text-sm">{level.label}</div>
            <div className="text-xs text-muted-foreground">{level.age}</div>
          </motion.button>
        ))}
      </div>
    </div>
    </>
  );
};