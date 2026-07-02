import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface CategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const CATEGORIES = [
  { value: "adventure", emoji: "🗺️", label: "Adventure", color: "from-orange-500/20 to-amber-500/20", border: "border-orange-400/50", glow: "shadow-orange-500/20" },
  { value: "fantasy", emoji: "✨", label: "Fantasy", color: "from-purple-500/20 to-violet-500/20", border: "border-purple-400/50", glow: "shadow-purple-500/20" },
  { value: "educational", emoji: "📚", label: "Educational", color: "from-blue-500/20 to-sky-500/20", border: "border-blue-400/50", glow: "shadow-blue-500/20" },
  { value: "mystery", emoji: "🔍", label: "Mystery", color: "from-slate-500/20 to-gray-500/20", border: "border-slate-400/50", glow: "shadow-slate-500/20" },
  { value: "friendship", emoji: "🤝", label: "Friendship", color: "from-pink-500/20 to-rose-500/20", border: "border-pink-400/50", glow: "shadow-pink-500/20" },
  { value: "animal", emoji: "🐾", label: "Animal", color: "from-green-500/20 to-emerald-500/20", border: "border-green-400/50", glow: "shadow-green-500/20" },
  { value: "space", emoji: "🚀", label: "Space", color: "from-indigo-500/20 to-blue-500/20", border: "border-indigo-400/50", glow: "shadow-indigo-500/20" },
  { value: "fairy-tale", emoji: "👑", label: "Fairy Tale", color: "from-amber-500/20 to-yellow-500/20", border: "border-amber-400/50", glow: "shadow-amber-500/20" },
];

export const CategorySelector = ({ value, onChange }: CategorySelectorProps) => {
  return (
    <>
      <FloatingHowItWorks title={"Category Selector - How it works"} steps={[{ title: 'Open', desc: 'Access the Category Selector section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Category Selector.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground">Choose Your World</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CATEGORIES.map((cat, i) => (
          <motion.button
            key={cat.value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(cat.value)}
            className={`relative p-4 rounded-xl text-center transition-all border-2 ${
              value === cat.value
                ? `bg-gradient-to-br ${cat.color} ${cat.border} shadow-lg ${cat.glow}`
                : "bg-card/50 border-border/50 hover:border-border"
            }`}
          >
            {value === cat.value && (
              <motion.div
                layoutId="category-glow"
                className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10"
                transition={{ type: "spring", bounce: 0.2 }}
              />
            )}
            <span className="relative text-3xl block mb-1">{cat.emoji}</span>
            <span className={`relative text-xs font-bold ${value === cat.value ? "text-foreground" : "text-muted-foreground"}`}>
              {cat.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
    </>
  );
};
