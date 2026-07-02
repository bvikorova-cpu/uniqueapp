import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Medal, Loader2, ArrowLeft, Crown, Star, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface MultiverseLeaderboardProps {
  onBack: () => void;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  universes: number;
  bestScore: number;
  specialty: string;
  badge: string;
}

const MultiverseLeaderboard = ({ onBack }: MultiverseLeaderboardProps) => {
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data } = await supabase.functions.invoke('multiverse-ai-tool', {
          body: { tool: 'leaderboard' }
        });

        if (data?.leaderboard) {
          setLeaderboard(data.leaderboard);
        } else {
          setLeaderboard([
            { rank: 1, name: "QuantumArchitect", universes: 47, bestScore: 98, specialty: "Tech Empires", badge: "Grandmaster" },
            { rank: 2, name: "DimensionWeaver", universes: 38, bestScore: 96, specialty: "Creative Arts", badge: "Master" },
            { rank: 3, name: "RealityShaper", universes: 31, bestScore: 94, specialty: "Business Mogul", badge: "Expert" },
            { rank: 4, name: "CosmicDrifter", universes: 25, bestScore: 91, specialty: "Adventure Life", badge: "Adept" },
            { rank: 5, name: "TimelineHacker", universes: 22, bestScore: 89, specialty: "Science Research", badge: "Adept" },
            { rank: 6, name: "ParallelPioneer", universes: 19, bestScore: 87, specialty: "Philanthropy", badge: "Explorer" },
            { rank: 7, name: "VoidNavigator", universes: 16, bestScore: 85, specialty: "Space Travel", badge: "Explorer" },
            { rank: 8, name: "NexusRunner", universes: 14, bestScore: 82, specialty: "Athletics", badge: "Seeker" },
            { rank: 9, name: "FateBreaker", universes: 11, bestScore: 79, specialty: "Politics", badge: "Seeker" },
            { rank: 10, name: "InfiniteWanderer", universes: 8, bestScore: 76, specialty: "Music & Art", badge: "Novice" },
          ]);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const rankColors = ["text-amber-400", "text-violet-300", "text-amber-600"];
  const rankBg = ["bg-amber-500/20 border-amber-500/40", "bg-violet-500/20 border-violet-500/40", "bg-amber-700/20 border-amber-700/40"];
  const badgeColors: Record<string, string> = {
    Grandmaster: "bg-gradient-to-r from-amber-500 to-orange-500 text-black",
    Master: "bg-gradient-to-r from-violet-500 to-purple-500",
    Expert: "bg-gradient-to-r from-cyan-500 to-blue-500",
    Adept: "bg-gradient-to-r from-emerald-500 to-teal-500",
    Explorer: "bg-violet-500/30 text-violet-300 border border-violet-500/30",
    Seeker: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    Novice: "bg-black/40 text-violet-300/60 border border-violet-500/20",
  };

  return (
    <>
      <FloatingHowItWorks
        title='Multiverse Leaderboard'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Multiverse Leaderboard panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="text-violet-300 hover:text-violet-100">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Hub
      </Button>

      <Card className="border-amber-500/30 bg-gradient-to-br from-amber-950/20 to-black/70 backdrop-blur-xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl text-amber-200">
            <Medal className="w-6 h-6 text-amber-400" />
            Multiverse Leaderboard
          </CardTitle>
          <CardDescription className="text-violet-300/70">Top multiverse explorers ranked by universe count and success scores</CardDescription>
        </CardHeader>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-amber-400" /></div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((entry, i) => (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, type: "spring", damping: 15 }}
            >
              <Card className={`border-violet-500/20 bg-black/50 backdrop-blur-xl hover:border-violet-400/40 transition-all ${i < 3 ? 'ring-1 ring-amber-500/20' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <motion.div 
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg border ${i < 3 ? rankBg[i] : 'bg-violet-950/40 border-violet-500/20'}`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <span className={i < 3 ? rankColors[i] : 'text-violet-300/60'}>
                        {i === 0 ? <Crown className="w-5 h-5" /> : `#${entry.rank}`}
                      </span>
                    </motion.div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-violet-100">{entry.name}</span>
                        <Badge className={`text-[10px] px-2 py-0 ${badgeColors[entry.badge] || ''}`}>{entry.badge}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-violet-300/60">
                        <span>{entry.universes} universes</span>
                        <span>·</span>
                        <span>{entry.specialty}</span>
                      </div>
                    </div>
                    
                    {/* Score */}
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400" />
                        <span className="font-black text-lg text-amber-300">{entry.bestScore}</span>
                      </div>
                      <Progress value={entry.bestScore} className="h-1 w-16 mt-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
    </>
  );
};

export default MultiverseLeaderboard;
