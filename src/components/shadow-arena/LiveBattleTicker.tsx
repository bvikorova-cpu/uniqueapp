import { motion } from "framer-motion";
import { Swords, Clock, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Battle {
  id: string;
  challenge_theme: string;
  status: string;
  ends_at: string | null;
  total_prize_pool: number;
}

function CountdownTimer({ endsAt }: { endsAt: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("Ended"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  return <span className="font-mono text-sm text-red-400">{timeLeft}</span>;
}

export function LiveBattleTicker({ battles }: { battles: Battle[] }) {
  const navigate = useNavigate();
  const isExpired = (b: Battle) => b.ends_at && new Date(b.ends_at).getTime() <= Date.now();
  const activeBattles = battles.filter(b =>
    (b.status === "active" || b.status === "waiting_for_participants") && !isExpired(b)
  );

  if (activeBattles.length === 0) return null;

  return (
    <><FloatingHowItWorks title="LiveBattleTicker — How it works" steps={[{title:"Open this section",desc:"Access LiveBattleTicker from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<div className="mb-8 overflow-hidden rounded-2xl border border-red-900/30 bg-gradient-to-r from-red-950/40 via-card/20 to-purple-950/40">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-red-900/20 bg-red-950/30">
        <motion.div
          className="w-2 h-2 rounded-full bg-red-500"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Live Battles</span>
      </div>
      <div className="divide-y divide-red-900/15">
        {activeBattles.map((battle) => (
          <motion.div
            key={battle.id}
            className="flex items-center justify-between px-4 py-3 hover:bg-red-950/20 cursor-pointer transition-colors"
            onClick={() => navigate(`/shadow-arena/battle/${battle.id}`)}
            whileHover={{ x: 4 }}
          >
            <div className="flex items-center gap-3">
              <Swords className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-foreground">{battle.challenge_theme}</span>
              <Badge variant="outline" className="text-xs border-red-800/40 text-red-400">
                {battle.status === "active" ? "LIVE" : "Open"}
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              {battle.ends_at && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <CountdownTimer endsAt={battle.ends_at} />
                </div>
              )}
              <div className="flex items-center gap-1">
                <Trophy className="w-3 h-3 text-yellow-500" />
                <span className="text-sm font-bold text-yellow-400">€{battle.total_prize_pool.toFixed(2)}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </>
  );
}
