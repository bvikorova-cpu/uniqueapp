import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useState } from "react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const ERAS = [
  { id: "ancient-egypt", icon: "𓂀", label: "Ancient Egypt", years: "3000 BCE", color: "from-amber-500 to-yellow-400" },
  { id: "rome", icon: "🏛️", label: "Roman Empire", years: "27 BCE", color: "from-rose-500 to-red-400" },
  { id: "medieval", icon: "🏰", label: "Medieval Europe", years: "500 CE", color: "from-slate-500 to-zinc-400" },
  { id: "feudal-japan", icon: "⛩️", label: "Feudal Japan", years: "1185 CE", color: "from-pink-500 to-rose-400" },
  { id: "renaissance", icon: "🎨", label: "Renaissance", years: "1400 CE", color: "from-violet-500 to-purple-400" },
  { id: "victorian", icon: "🎩", label: "Victorian Era", years: "1837 CE", color: "from-indigo-500 to-blue-400" },
  { id: "wild-west", icon: "🤠", label: "Wild West", years: "1865 CE", color: "from-orange-500 to-amber-400" },
  { id: "roaring-20s", icon: "🍾", label: "Roaring 20s", years: "1920 CE", color: "from-yellow-500 to-amber-400" },
];

interface PastLifeEraWheelProps {
  onEraSelect?: (eraId: string) => void;
}

export const PastLifeEraWheel = ({ onEraSelect }: PastLifeEraWheelProps) => {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelected(id);
    onEraSelect?.(id);
  };

  return (
    <>
      <FloatingHowItWorks
        title='Past Life Era Wheel'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Past Life Era Wheel panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <Card className="p-5 bg-card/80 backdrop-blur-xl border-border/50 overflow-hidden">
      <div className="mb-3">
        <h3 className="font-black text-base flex items-center gap-2">
          <span className="text-lg">🌀</span>
          Era Compass
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Tap an era to focus your reading on a specific period
        </p>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {ERAS.map((era, i) => (
          <motion.button
            key={era.id}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelect(era.id)}
            className={`relative p-2 rounded-xl border text-center transition-all ${
              selected === era.id
                ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                : "border-border/40 bg-muted/10 hover:border-border"
            }`}
          >
            <div
              className={`text-2xl mb-1 inline-block bg-gradient-to-br ${era.color} bg-clip-text`}
              style={{ filter: "drop-shadow(0 2px 6px hsl(var(--primary)/0.25))" }}
            >
              {era.icon}
            </div>
            <p className="text-[9px] font-bold leading-tight">{era.label}</p>
            <p className="text-[8px] text-muted-foreground">{era.years}</p>
          </motion.button>
        ))}
      </div>
      {selected && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[11px] text-primary mt-3 text-center font-medium"
        >
          ✨ {ERAS.find((e) => e.id === selected)?.label} focus activated
        </motion.p>
      )}
    </Card>
    </>
  );
};
