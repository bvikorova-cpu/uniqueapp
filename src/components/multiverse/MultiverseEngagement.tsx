import { motion } from "framer-motion";
import { Globe, Crown, Trophy } from "lucide-react";

interface MultiverseEngagementProps {
  universesCount: number;
  bestSelfScore: number;
  achievements: number;
}

export const MultiverseEngagement = ({ universesCount, bestSelfScore, achievements }: MultiverseEngagementProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-2xl p-5 backdrop-blur-sm"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-violet-500/20">
            <Globe className="w-5 h-5 text-violet-400" />
          </div>
          <h3 className="font-bold text-foreground">My Universes</h3>
        </div>
        <p className="text-3xl font-black text-violet-400">{universesCount}</p>
        <p className="text-xs text-muted-foreground mt-1">Parallel realities created</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-5 backdrop-blur-sm"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-amber-500/20">
            <Crown className="w-5 h-5 text-amber-400" />
          </div>
          <h3 className="font-bold text-foreground">Best Self Score</h3>
        </div>
        <p className="text-3xl font-black text-amber-400">{bestSelfScore}/100</p>
        <p className="text-xs text-muted-foreground mt-1">Across all dimensions</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-5 backdrop-blur-sm"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-emerald-500/20">
            <Trophy className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="font-bold text-foreground">Achievements</h3>
        </div>
        <p className="text-3xl font-black text-emerald-400">{achievements}</p>
        <p className="text-xs text-muted-foreground mt-1">Multiverse milestones</p>
      </motion.div>
    </div>
  );
};
