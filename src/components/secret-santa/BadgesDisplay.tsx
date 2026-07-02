import { useSocialGiftsProgress } from "@/hooks/useSocialGiftsProgress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Award, Lock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const BadgesDisplay = () => {
  const { allBadges, earnedBadgeIds, progress, isLoading } = useSocialGiftsProgress();

  if (isLoading) {
    return (
    <>
      <FloatingHowItWorks title={"Badges Display - How it works"} steps={[{ title: 'Open', desc: 'Access the Badges Display section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Badges Display.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="bg-white/80 backdrop-blur-xl border border-amber-200 rounded-2xl p-6 shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-amber-100 rounded w-1/3" />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-24 bg-amber-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </>
  );
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "from-yellow-400 via-amber-500 to-orange-500 border-yellow-400";
      case "epic":
        return "from-purple-400 via-violet-500 to-purple-600 border-purple-400";
      case "rare":
        return "from-blue-400 via-sky-500 to-blue-600 border-blue-400";
      case "uncommon":
        return "from-green-400 via-emerald-500 to-green-600 border-green-400";
      default:
        return "from-gray-300 via-gray-400 to-gray-500 border-gray-300";
    }
  };

  const getRarityLabel = (rarity: string) => {
    return rarity.charAt(0).toUpperCase() + rarity.slice(1);
  };

  const checkProgress = (badge: any) => {
    if (!progress) return 0;
    
    switch (badge.requirement_type) {
      case "gifts_sent":
        return progress.gifts_sent || 0;
      case "gifts_received":
        return progress.gifts_received || 0;
      case "streak":
        return progress.streak_days || 0;
      case "credits_spent":
        return progress.total_credits_spent || 0;
      case "level":
        return progress.level || 1;
      default:
        return 0;
    }
  };

  const earnedCount = earnedBadgeIds.length;
  const totalCount = allBadges.length;

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-amber-200 rounded-2xl p-4 sm:p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Award className="h-5 w-5 text-amber-500" />
          Achievement Badges
        </h3>
        <div className="text-sm text-gray-500">
          <span className="font-bold text-amber-600">{earnedCount}</span> / {totalCount} earned
        </div>
      </div>

      {/* Badges grid */}
      <ScrollArea className="h-[400px]">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {allBadges.map((badge, index) => {
            const isEarned = earnedBadgeIds.includes(badge.id);
            const currentProgress = checkProgress(badge);
            const progressPercent = Math.min((currentProgress / badge.requirement_value) * 100, 100);

            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  isEarned
                    ? `bg-gradient-to-br ${getRarityColor(badge.rarity)} border-opacity-50`
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                {/* Badge icon */}
                <div className={`text-center ${isEarned ? "" : "opacity-50 grayscale"}`}>
                  <span className="text-4xl block mb-2">{badge.icon}</span>
                  <p className={`font-bold text-sm truncate ${isEarned ? "text-white" : "text-gray-700"}`}>
                    {badge.name}
                  </p>
                  <p className={`text-xs mt-1 ${isEarned ? "text-white/80" : "text-gray-500"}`}>
                    {badge.description}
                  </p>
                </div>

                {/* Progress or earned indicator */}
                {isEarned ? (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                ) : (
                  <div className="mt-3">
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 text-center mt-1">
                      {currentProgress}/{badge.requirement_value}
                    </p>
                  </div>
                )}

                {/* Rarity label */}
                <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isEarned 
                    ? "bg-white/30 text-white" 
                    : "bg-gray-200 text-gray-500"
                }`}>
                  {getRarityLabel(badge.rarity)}
                </div>

                {/* XP reward */}
                <div className={`text-center mt-2 text-xs ${isEarned ? "text-white/80" : "text-gray-400"}`}>
                  +{badge.xp_reward} XP
                </div>

                {/* Lock icon for unearned */}
                {!isEarned && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-xl opacity-0 hover:opacity-100 transition-opacity">
                    <Lock className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
