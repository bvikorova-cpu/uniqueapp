import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, CheckCircle, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const adventures = [
  { name: "Forest of Stories", emoji: "🌲", completed: false },
  { name: "Ocean of Games", emoji: "🌊", completed: false },
  { name: "Mountain of Knowledge", emoji: "⛰️", completed: false },
  { name: "Castle of Characters", emoji: "🏰", completed: false },
  { name: "Sky of Dreams", emoji: "☁️", completed: false },
  { name: "Star Galaxy", emoji: "🌟", completed: false },
];

export const AdventureMap = () => {
  return (
    <>
      <FloatingHowItWorks title={"Adventure Map - How it works"} steps={[{ title: 'Open', desc: 'Access the Adventure Map section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Adventure Map.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="bg-white/90 backdrop-blur-sm border-2 border-white/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-purple-700">
            <MapPin className="w-5 h-5 text-purple-500" />
            Adventure Map 🗺️
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {adventures.map((adv, i) => (
              <motion.div
                key={adv.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.08, type: "spring" }}
                className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all
                  ${adv.completed
                    ? "bg-green-100 border-green-300"
                    : "bg-gray-50 border-gray-200 opacity-70"
                  }
                `}
              >
                <span className="text-2xl mb-1">{adv.emoji}</span>
                {adv.completed ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Lock className="w-4 h-4 text-gray-400" />
                )}
                <p className="text-[9px] font-bold text-center mt-1 text-gray-600">{adv.name}</p>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-500 mt-3 font-medium">
            Complete activities to unlock new adventures! 🎯
          </p>
        </CardContent>
      </Card>
    </motion.div>
    </>
  );
};
