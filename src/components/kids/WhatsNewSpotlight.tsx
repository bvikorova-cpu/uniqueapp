import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const newItems = [
  { title: "Frozen Adventures 2", type: "New Story", emoji: "❄️", color: "bg-blue-500" },
  { title: "Pirate Treasure Hunt", type: "New Game", emoji: "🏴‍☠️", color: "bg-red-500" },
  { title: "Space Explorer Badge", type: "New Badge", emoji: "🚀", color: "bg-purple-500" },
];

export const WhatsNewSpotlight = () => {
  return (
    <>
      <FloatingHowItWorks title={"Whats New Spotlight - How it works"} steps={[{ title: 'Open', desc: 'Access the Whats New Spotlight section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Whats New Spotlight.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mb-8"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-yellow-300" />
        <h2 className="text-xl font-bold text-white drop-shadow-lg">What's New!</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {newItems.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + i * 0.1 }}
          >
            <Card className="bg-white/90 backdrop-blur-sm border-2 border-white/50 hover:scale-105 transition-all cursor-pointer overflow-hidden">
              <CardContent className="p-4 flex items-center gap-3">
                <span className="text-3xl">{item.emoji}</span>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-gray-800 truncate">{item.title}</p>
                  <Badge className={`${item.color} text-white text-[10px] mt-1`}>{item.type}</Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
    </>
  );
};
