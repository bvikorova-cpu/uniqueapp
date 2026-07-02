import { motion } from "framer-motion";
import { Globe, Crown, Trophy, Flame } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface MultiverseEngagementProps {
  universesCount: number;
  bestSelfScore: number;
  achievements: number;
}

export const MultiverseEngagement = ({ universesCount, bestSelfScore, achievements }: MultiverseEngagementProps) => {
  return (
    <>
      <FloatingHowItWorks
        title='Multiverse Engagement'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Multiverse Engagement panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, type: "spring", damping: 12 }}
        whileHover={{ scale: 1.03 }}
        className="relative overflow-hidden bg-gradient-to-br from-violet-950/40 to-black/60 border border-violet-500/30 rounded-2xl p-5 backdrop-blur-xl group"
        style={{ boxShadow: '0 0 20px rgba(139,92,246,0.15)' }}
      >
        {/* Plasma glow effect */}
        <motion.div 
          className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-violet-500/20 blur-2xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <motion.div 
              className="p-2.5 rounded-xl bg-violet-500/20 border border-violet-500/30"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Globe className="w-5 h-5 text-violet-400" />
            </motion.div>
            <h3 className="font-bold text-violet-100">My Universes</h3>
          </div>
          <motion.p 
            className="text-4xl font-black bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent"
            animate={{ textShadow: ['0 0 10px rgba(139,92,246,0.5)', '0 0 20px rgba(139,92,246,0.8)', '0 0 10px rgba(139,92,246,0.5)'] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {universesCount}
          </motion.p>
          <p className="text-xs text-violet-300/60 mt-1">Parallel realities created</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: "spring", damping: 12 }}
        whileHover={{ scale: 1.03 }}
        className="relative overflow-hidden bg-gradient-to-br from-cyan-950/40 to-black/60 border border-cyan-500/30 rounded-2xl p-5 backdrop-blur-xl group"
        style={{ boxShadow: '0 0 20px rgba(34,211,238,0.15)' }}
      >
        <motion.div 
          className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-cyan-500/20 blur-2xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <motion.div 
              className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/30"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Crown className="w-5 h-5 text-cyan-400" />
            </motion.div>
            <h3 className="font-bold text-cyan-100">Best Self Score</h3>
          </div>
          <motion.p className="text-4xl font-black bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">
            {bestSelfScore}/100
          </motion.p>
          <p className="text-xs text-cyan-300/60 mt-1">Across all dimensions</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, type: "spring", damping: 12 }}
        whileHover={{ scale: 1.03 }}
        className="relative overflow-hidden bg-gradient-to-br from-amber-950/40 to-black/60 border border-amber-500/30 rounded-2xl p-5 backdrop-blur-xl group"
        style={{ boxShadow: '0 0 20px rgba(245,158,11,0.15)' }}
      >
        <motion.div 
          className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-amber-500/20 blur-2xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, delay: 2 }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <motion.div 
              className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Trophy className="w-5 h-5 text-amber-400" />
            </motion.div>
            <h3 className="font-bold text-amber-100">Achievements</h3>
          </div>
          <motion.p className="text-4xl font-black bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
            {achievements}
          </motion.p>
          <p className="text-xs text-amber-300/60 mt-1">Multiverse milestones</p>
        </div>
      </motion.div>
    </div>
    </>
  );
};
