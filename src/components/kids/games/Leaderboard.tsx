import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Crown, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface LeaderboardProps {
  playerScore: number;
  playerName?: string;
}

interface Entry {
  name: string;
  score: number;
  avatar: string;
}

const RANK_STYLES = [
  "from-yellow-400 to-amber-500",
  "from-gray-300 to-gray-400",
  "from-orange-400 to-amber-600",
];

const AVATARS = ["🌟", "🎮", "🦊", "🐼", "🚀", "🐯", "🐸", "🦁"];

export function Leaderboard({ playerScore, playerName = "You" }: LeaderboardProps) {
  const [leaders, setLeaders] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("kids_academy_xp")
        .select("child_id, total_xp")
        .order("total_xp", { ascending: false })
        .limit(5);

      const ids = (data || []).map((r: any) => r.child_id).filter(Boolean);
      const { data: profs } = ids.length
        ? await (supabase as any).from("profiles_public").select("id, full_name").in("id", ids)
        : { data: [] as any[] };
      const pmap = new Map<string, any>((profs || []).map((p: any) => [p.id, p.full_name]));

      const entries: Entry[] = (data || []).map((r: any, i: number) => ({
        name: pmap.get(r.child_id) || `Player ${i + 1}`,
        score: Number(r.total_xp) || 0,
        avatar: AVATARS[i % AVATARS.length],
      }));

      if (!cancelled) {
        setLeaders(entries);
        setLoading(false);
      }
    })();
    return (
    <>
      <FloatingHowItWorks title={"Leaderboard - How it works"} steps={[{ title: 'Open', desc: 'Access the Leaderboard section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Leaderboard.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => {
      cancelled = true;
    };
  }, []);

  const allPlayers = [...leaders, { name: playerName, score: playerScore, avatar: "👤" }].sort(
    (a, b) => b.score - a.score
  );

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
        <Crown className="h-4 w-4 text-yellow-500" /> Leaderboard
      </h3>

      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="space-y-1.5">
          {allPlayers.slice(0, 5).map((player, i) => {
            const isPlayer = player.name === playerName;
            return (
              <motion.div
                key={`${player.name}-${i}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`flex items-center gap-2 p-2 rounded-xl text-sm ${
                  isPlayer
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm"
                    : "bg-gray-50"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                    i < 3
                      ? `bg-gradient-to-br ${RANK_STYLES[i]} text-white shadow-sm`
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {i + 1}
                </div>
                <span className="text-lg">{player.avatar}</span>
                <span
                  className={`flex-1 font-medium truncate ${
                    isPlayer ? "text-blue-700" : "text-gray-700"
                  }`}
                >
                  {player.name}
                </span>
                <span className={`font-bold ${isPlayer ? "text-blue-600" : "text-gray-500"}`}>
                  {player.score}
                </span>
                {i === 0 && <span className="text-sm">👑</span>}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
