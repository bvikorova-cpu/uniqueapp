import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface OptionItem {
  id: string;
  name: string;
  emoji: string;
}

interface MagicalOptionCardProps {
  label: string;
  labelEmoji: string;
  options: OptionItem[];
  selected: string;
  onSelect: (id: string) => void;
  columns?: number;
  accentColor?: string;
}

const colorMap: Record<string, string> = {
  pink: "from-pink-500 to-rose-500 border-pink-300 shadow-pink-500/30",
  blue: "from-blue-500 to-cyan-500 border-blue-300 shadow-blue-500/30",
  purple: "from-purple-500 to-violet-500 border-purple-300 shadow-purple-500/30",
  yellow: "from-yellow-500 to-amber-500 border-yellow-300 shadow-yellow-500/30",
  green: "from-green-500 to-emerald-500 border-green-300 shadow-green-500/30",
  orange: "from-orange-500 to-red-500 border-orange-300 shadow-orange-500/30",
  amber: "from-amber-500 to-yellow-600 border-amber-300 shadow-amber-500/30",
  indigo: "from-indigo-500 to-purple-600 border-indigo-300 shadow-indigo-500/30",
};

export function MagicalOptionCard({
  label,
  labelEmoji,
  options,
  selected,
  onSelect,
  columns = 3,
  accentColor = "purple",
}: MagicalOptionCardProps) {
  const accent = colorMap[accentColor] || colorMap.purple;

  return (
    <>
      <FloatingHowItWorks title={"Magical Option Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Magical Option Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Magical Option Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 border-2 border-white/60 shadow-lg"
    >
      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
        <span className="text-2xl">{labelEmoji}</span> {label}
      </h3>
      <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {options.map((opt) => {
          const isSelected = selected === opt.id;
          return (
            <motion.button
              key={opt.id}
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(opt.id)}
              className={`relative rounded-xl p-3 flex flex-col items-center gap-1 transition-all duration-200 overflow-hidden ${
                isSelected
                  ? `bg-gradient-to-br ${accent} text-white border-2 shadow-lg`
                  : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent text-gray-700"
              }`}
            >
              {isSelected && (
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  initial={{ scale: 0, borderRadius: "50%" }}
                  animate={{ scale: 2, borderRadius: "0%", opacity: 0 }}
                  transition={{ duration: 0.6 }}
                />
              )}
              <span className={`text-2xl ${isSelected ? "animate-bounce" : ""}`}>
                {opt.emoji}
              </span>
              <span className="text-xs font-semibold leading-tight text-center">
                {opt.name}
              </span>
              {isSelected && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 text-sm"
                >
                  ✅
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
    </>
  );
}
