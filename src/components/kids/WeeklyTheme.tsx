import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const themes = [
  { name: "Pirate Week", emoji: "🏴‍☠️", color: "from-red-400 to-orange-400", active: true },
  { name: "Space Week", emoji: "🚀", color: "from-purple-400 to-blue-400", active: false },
  { name: "Princess Week", emoji: "👑", color: "from-pink-400 to-rose-400", active: false },
  { name: "Dinosaur Week", emoji: "🦕", color: "from-green-400 to-emerald-400", active: false },
];

export const WeeklyTheme = () => {
  const activeTheme = themes.find(t => t.active);

  return (
    <>
      <FloatingHowItWorks title={"Weekly Theme - How it works"} steps={[{ title: 'Open', desc: 'Access the Weekly Theme section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Weekly Theme.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <Card className={`bg-gradient-to-r ${activeTheme?.color} border-2 border-white/50 overflow-hidden relative`}>
        <div className="absolute inset-0 bg-white/10" />
        <CardContent className="p-4 relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-3xl">{activeTheme?.emoji}</span>
              <div>
                <p className="font-black text-white text-lg drop-shadow">{activeTheme?.name}</p>
                <p className="text-white/80 text-xs font-medium">This week's special theme!</p>
              </div>
            </div>
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              Active Now
            </Badge>
          </div>

          <div className="flex gap-2 mt-3">
            {themes.map((theme, i) => (
              <motion.div
                key={theme.name}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1, type: "spring" }}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl
                  ${theme.active
                    ? "bg-white/30 ring-2 ring-white/50"
                    : "bg-white/10 opacity-50"
                  }
                `}
                title={theme.name}
              >
                {theme.emoji}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
    </>
  );
};
