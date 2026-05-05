import { motion } from "framer-motion";
import { Trophy, Skull, Swords, Star, Zap, Coins } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface BattleResultProps {
  result: {
    won: boolean;
    home_score: number;
    away_score: number;
    opponent_name: string;
    mvp?: string;
    mvp_stats?: string;
    highlights?: string[];
    coins_reward: number;
    home_power: number;
    away_power: number;
    /** Period/quarter/set breakdown — generic */
    breakdown?: { label: string; home: number; away: number }[];
  };
  homeName: string;
}

export function BattleResult({ result, homeName }: BattleResultProps) {
  const totalPower = Math.max(result.home_power + result.away_power, 1);
  const homePct = Math.round((result.home_power / totalPower) * 100);
  const awayPct = 100 - homePct;
  const margin = Math.abs(result.home_score - result.away_score);
  const dominance =
    margin === 0 ? "DRAW" : margin <= 2 ? "CLOSE FIGHT" : margin <= 6 ? "SOLID WIN" : "DOMINATION";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={`relative overflow-hidden rounded-xl border-2 p-5 ${
        result.won
          ? "bg-gradient-to-br from-emerald-500/15 via-background to-amber-500/10 border-emerald-500/40"
          : "bg-gradient-to-br from-red-500/15 via-background to-zinc-900/40 border-red-500/40"
      }`}
    >
      {/* Verdict banner */}
      <div className="text-center mb-4">
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex items-center gap-2 mb-2"
        >
          {result.won ? (
            <Trophy className="h-7 w-7 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]" />
          ) : (
            <Skull className="h-7 w-7 text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.6)]" />
          )}
          <span
            className={`text-2xl font-black tracking-wider ${
              result.won ? "text-emerald-300" : "text-red-300"
            }`}
          >
            {result.won ? "VICTORY" : "DEFEAT"}
          </span>
        </motion.div>
        <div className="flex justify-center items-center gap-3 text-3xl font-black">
          <span className={result.won ? "text-emerald-200" : "text-foreground"}>{result.home_score}</span>
          <Swords className="h-5 w-5 text-muted-foreground" />
          <span className={!result.won ? "text-red-200" : "text-foreground"}>{result.away_score}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {homeName} <span className="opacity-60">vs</span> {result.opponent_name}
        </p>
        <Badge variant="outline" className="mt-2 text-[10px] tracking-widest">
          {dominance}
        </Badge>
      </div>

      {/* Power bar — battle style */}
      <div className="mb-4">
        <div className="flex justify-between text-[11px] font-semibold mb-1">
          <span className="text-emerald-300 flex items-center gap-1">
            <Zap className="h-3 w-3" />
            {result.home_power}
          </span>
          <span className="text-muted-foreground">BATTLE POWER</span>
          <span className="text-red-300 flex items-center gap-1">
            {result.away_power}
            <Zap className="h-3 w-3" />
          </span>
        </div>
        <div className="relative h-3 rounded-full overflow-hidden bg-muted/40 border border-border/50">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${homePct}%` }}
            transition={{ duration: 1, delay: 0.3 }}
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${awayPct}%` }}
            transition={{ duration: 1, delay: 0.3 }}
            className="absolute right-0 top-0 h-full bg-gradient-to-l from-red-500 to-red-400"
          />
        </div>
      </div>

      {/* Breakdown */}
      {result.breakdown && result.breakdown.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mb-4">
          {result.breakdown.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              className="text-center p-2 rounded bg-muted/30 border border-border/40"
            >
              <p className="text-[10px] text-muted-foreground">{b.label}</p>
              <p className="text-sm font-bold">
                {b.home}-{b.away}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* MVP */}
      {result.mvp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 mb-3"
        >
          <Star className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-amber-300">MVP: {result.mvp}</p>
            {result.mvp_stats && <p className="text-muted-foreground">{result.mvp_stats}</p>}
          </div>
        </motion.div>
      )}

      {/* Highlights */}
      {result.highlights && result.highlights.length > 0 && (
        <div className="space-y-1 mb-3">
          <p className="text-[11px] font-semibold text-muted-foreground tracking-wider">HIGHLIGHTS</p>
          {result.highlights.map((h, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="text-xs text-muted-foreground"
            >
              ⚡ {h}
            </motion.p>
          ))}
        </div>
      )}

      <div className="flex items-center justify-center gap-1 pt-2 border-t border-border/40 text-primary font-bold">
        <Coins className="h-4 w-4" />
        <span>+{result.coins_reward} coins earned</span>
      </div>
    </motion.div>
  );
}
