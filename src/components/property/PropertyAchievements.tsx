import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const badges = [
  { name: "First View", icon: "👁️", description: "View your first property", unlocked: false, color: "from-blue-500/20 to-cyan-500/20", borderColor: "border-blue-500/30" },
  { name: "Explorer", icon: "🔍", description: "Search 10 properties", unlocked: false, color: "from-sky-500/20 to-blue-500/20", borderColor: "border-sky-500/30" },
  { name: "Saver", icon: "💾", description: "Save 5 favorites", unlocked: false, color: "from-green-500/20 to-emerald-500/20", borderColor: "border-green-500/30" },
  { name: "Seller", icon: "🏷️", description: "List your first property", unlocked: false, color: "from-purple-500/20 to-violet-500/20", borderColor: "border-purple-500/30" },
  { name: "Networker", icon: "🤝", description: "Contact 5 sellers", unlocked: false, color: "from-orange-500/20 to-amber-500/20", borderColor: "border-orange-500/30" },
  { name: "Pro Agent", icon: "⭐", description: "Complete 3 transactions", unlocked: false, color: "from-yellow-500/20 to-amber-500/20", borderColor: "border-yellow-500/30" },
];

export const PropertyAchievements = () => {
  return (
    <>
      <FloatingHowItWorks title={"Property Achievements - How it works"} steps={[{ title: 'Open', desc: 'Access the Property Achievements section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Property Achievements.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
      <Card className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-300/30 h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Award className="w-4 h-4 text-amber-500" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {badges.map((badge, i) => (
              <motion.div
                key={badge.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.45 + i * 0.05 }}
                className={`relative flex flex-col items-center p-2.5 rounded-xl border text-center transition-all hover:scale-105
                  ${badge.unlocked
                    ? `bg-gradient-to-br ${badge.color} ${badge.borderColor}`
                    : "bg-muted/30 border-border/30 opacity-60"
                  }
                `}
              >
                <div className="text-xl mb-1">
                  {badge.unlocked ? badge.icon : (
                    <div className="w-7 h-7 rounded-full bg-muted/50 flex items-center justify-center">
                      <Lock className="w-3 h-3 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <p className="text-[10px] font-semibold line-clamp-1">{badge.name}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
    </>
  );
};
