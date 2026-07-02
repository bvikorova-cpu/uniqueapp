import { useSocialGiftsProgress, calculateXPForLevel } from "@/hooks/useSocialGiftsProgress";
import { Progress } from "@/components/ui/progress";
import { Star, Zap, Gift, Target } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const LevelProgress = () => {
  const { progress, levelInfo, isLoading } = useSocialGiftsProgress();

  if (isLoading) {
    return (
    <>
      <FloatingHowItWorks title={"Level Progress - How it works"} steps={[{ title: 'Open', desc: 'Access the Level Progress section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Level Progress.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="bg-white/80 backdrop-blur-xl border border-amber-200 rounded-2xl p-4 shadow-lg animate-pulse">
        <div className="h-20 bg-amber-100 rounded-xl" />
      </div>
    </>
  );
  }

  const progressPercent = levelInfo.xpForNextLevel > 0 
    ? (levelInfo.currentXP / levelInfo.xpForNextLevel) * 100 
    : 100;

  const getLevelColor = (level: number) => {
    if (level >= 90) return "from-purple-500 to-pink-500";
    if (level >= 75) return "from-red-500 to-orange-500";
    if (level >= 50) return "from-amber-500 to-yellow-500";
    if (level >= 25) return "from-green-500 to-emerald-500";
    return "from-blue-500 to-cyan-500";
  };

  const getLevelTitle = (level: number) => {
    if (level >= 90) return "Gift Legend";
    if (level >= 75) return "Gift Master";
    if (level >= 50) return "Gift Expert";
    if (level >= 25) return "Gift Enthusiast";
    if (level >= 10) return "Gift Giver";
    return "Newcomer";
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-amber-200 rounded-2xl p-4 sm:p-6 shadow-lg">
      {/* Level display */}
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${getLevelColor(levelInfo.level)} flex items-center justify-center shadow-lg`}>
          <span className="text-white text-2xl sm:text-3xl font-bold">{levelInfo.level}</span>
        </div>
        <div className="flex-1">
          <h3 className="text-gray-800 font-bold text-lg sm:text-xl">Level {levelInfo.level}</h3>
          <p className="text-amber-600 font-medium">{getLevelTitle(levelInfo.level)}</p>
        </div>
        {levelInfo.level < 100 && (
          <div className="text-right">
            <p className="text-gray-400 text-xs">Next level</p>
            <p className="text-gray-600 font-medium">{levelInfo.level + 1}</p>
          </div>
        )}
      </div>

      {/* XP Progress bar */}
      {levelInfo.level < 100 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">
              <Zap className="h-4 w-4 inline mr-1 text-amber-500" />
              {levelInfo.currentXP} XP
            </span>
            <span className="text-gray-400">{levelInfo.xpForNextLevel} XP</span>
          </div>
          <Progress value={progressPercent} className="h-3 bg-gray-200" />
          <p className="text-center text-xs text-gray-400">
            {levelInfo.xpForNextLevel - levelInfo.currentXP} XP to level {levelInfo.level + 1}
          </p>
        </div>
      )}

      {levelInfo.level === 100 && (
        <div className="text-center py-2">
          <p className="text-amber-600 font-bold">🏆 Maximum Level Reached!</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-3 text-center border border-amber-200">
          <Gift className="h-5 w-5 mx-auto text-amber-500 mb-1" />
          <p className="text-gray-800 font-bold">{progress?.gifts_sent || 0}</p>
          <p className="text-gray-500 text-xs">Sent</p>
        </div>
        <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-3 text-center border border-rose-200">
          <Target className="h-5 w-5 mx-auto text-rose-500 mb-1" />
          <p className="text-gray-800 font-bold">{progress?.gifts_received || 0}</p>
          <p className="text-gray-500 text-xs">Received</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-3 text-center border border-purple-200">
          <Star className="h-5 w-5 mx-auto text-purple-500 mb-1" />
          <p className="text-gray-800 font-bold">{progress?.total_xp || 0}</p>
          <p className="text-gray-500 text-xs">Total XP</p>
        </div>
      </div>

      {/* Streak */}
      {(progress?.streak_days || 0) > 0 && (
        <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-orange-100 to-red-100 border border-orange-300">
          <p className="text-center">
            <span className="text-2xl mr-2">🔥</span>
            <span className="text-gray-800 font-bold">{progress?.streak_days} Day Streak!</span>
          </p>
        </div>
      )}
    </div>
  );
};
