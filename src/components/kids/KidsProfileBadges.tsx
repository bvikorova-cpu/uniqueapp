import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const badges = [
  { name: "First Story", icon: "📖", description: "Read your first story", unlocked: false },
  { name: "Game Player", icon: "🎮", description: "Play your first game", unlocked: false },
  { name: "Star Collector", icon: "⭐", description: "Collect 10 stars", unlocked: false },
  { name: "Explorer", icon: "🗺️", description: "Visit all sections", unlocked: false },
  { name: "Dream Reader", icon: "🌙", description: "Finish 5 bedtime stories", unlocked: false },
  { name: "Hero Creator", icon: "🦸", description: "Create your character", unlocked: false },
];

export const KidsProfileBadges = () => {
  return (
    <>
      <FloatingHowItWorks title={"Kids Profile Badges - How it works"} steps={[{ title: 'Open', desc: 'Access the Kids Profile Badges section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Kids Profile Badges.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="bg-white/90 backdrop-blur-sm border-2 border-white/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-purple-700">
            <Award className="w-5 h-5 text-yellow-500" />
            My Badges 🏅
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {badges.map((badge, i) => (
              <motion.div
                key={badge.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.55 + i * 0.06, type: "spring" }}
                className={`flex flex-col items-center p-2.5 rounded-xl border-2 text-center transition-all
                  ${badge.unlocked
                    ? "bg-yellow-50 border-yellow-300"
                    : "bg-gray-50 border-gray-200 opacity-60"
                  }
                `}
              >
                <div className="text-2xl mb-1">
                  {badge.unlocked ? badge.icon : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <Lock className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  )}
                </div>
                <p className="text-[9px] font-bold text-gray-600">{badge.name}</p>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-500 mt-3 font-medium">
            Start exploring to unlock your first badge! 🎉
          </p>
        </CardContent>
      </Card>
    </motion.div>
    </>
  );
};
