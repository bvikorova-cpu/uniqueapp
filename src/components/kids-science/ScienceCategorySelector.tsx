import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const categories = [
  { id: "physics", label: "Physics", icon: "⚡", color: "from-yellow-500/20 to-orange-500/20", border: "border-yellow-500/40", glow: "shadow-yellow-500/20" },
  { id: "chemistry", label: "Chemistry", icon: "🧪", color: "from-green-500/20 to-emerald-500/20", border: "border-green-500/40", glow: "shadow-green-500/20" },
  { id: "biology", label: "Biology", icon: "🧬", color: "from-pink-500/20 to-rose-500/20", border: "border-pink-500/40", glow: "shadow-pink-500/20" },
  { id: "earth", label: "Earth Science", icon: "🌍", color: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/40", glow: "shadow-blue-500/20" },
  { id: "astronomy", label: "Astronomy", icon: "🔭", color: "from-purple-500/20 to-indigo-500/20", border: "border-purple-500/40", glow: "shadow-purple-500/20" },
];

interface ScienceCategorySelectorProps {
  selected: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

export const ScienceCategorySelector = ({ selected, onSelect, disabled }: ScienceCategorySelectorProps) => {
  return (
    <>
      <FloatingHowItWorks title={"Science Category Selector - How it works"} steps={[{ title: 'Open', desc: 'Access the Science Category Selector section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Science Category Selector.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
        🔬 Choose a Category
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {categories.map((cat, i) => (
          <motion.button
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
            disabled={disabled}
            onClick={() => onSelect(cat.id)}
            className={`
              relative p-4 rounded-2xl border-2 transition-all cursor-pointer
              bg-gradient-to-br ${cat.color} ${cat.border}
              ${selected === cat.id ? `ring-2 ring-offset-2 ring-offset-background ${cat.border} shadow-lg ${cat.glow}` : "hover:shadow-md"}
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            <div className="text-3xl mb-2">{cat.icon}</div>
            <div className="text-sm font-semibold">{cat.label}</div>
            {selected === cat.id && (
              <motion.div
                layoutId="science-cat-indicator"
                className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs"
              >
                ✓
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
    </>
  );
};