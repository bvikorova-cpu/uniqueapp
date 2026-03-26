import { motion } from "framer-motion";
import { Medal, Crown, User } from "lucide-react";

interface LeaderboardProps {
  playerScore: number;
  playerName?: string;
}

const MOCK_LEADERS = [
  { name: "StarKid", score: 850, avatar: "🌟" },
  { name: "GamePro", score: 720, avatar: "🎮" },
  { name: "WizardFox", score: 690, avatar: "🦊" },
  { name: "PixelPanda", score: 580, avatar: "🐼" },
  { name: "RocketBear", score: 440, avatar: "🚀" },
];

const RANK_STYLES = [
  "from-yellow-400 to-amber-500",
  "from-gray-300 to-gray-400",
  "from-orange-400 to-amber-600",
];

export function Leaderboard({ playerScore, playerName = "You" }: LeaderboardProps) {
  const allPlayers = [
    ...MOCK_LEADERS,
    { name: playerName, score: playerScore, avatar: "👤" },
  ].sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
        <Crown className="h-4 w-4 text-yellow-500" /> Leaderboard
      </h3>

      <div className="space-y-1.5">
        {allPlayers.slice(0, 5).map((player, i) => {
          const isPlayer = player.name === playerName;
          return (
            <motion.div
              key={player.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`flex items-center gap-2 p-2 rounded-xl text-sm ${
                isPlayer
                  ? "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm"
                  : "bg-gray-50"
              }`}
            >
              {/* Rank */}
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                i < 3
                  ? `bg-gradient-to-br ${RANK_STYLES[i]} text-white shadow-sm`
                  : "bg-gray-200 text-gray-500"
              }`}>
                {i + 1}
              </div>

              {/* Avatar & Name */}
              <span className="text-lg">{player.avatar}</span>
              <span className={`flex-1 font-medium truncate ${isPlayer ? "text-blue-700" : "text-gray-700"}`}>
                {player.name}
              </span>

              {/* Score */}
              <span className={`font-bold ${isPlayer ? "text-blue-600" : "text-gray-500"}`}>
                {player.score}
              </span>

              {/* Medal for top 3 */}
              {i === 0 && <span className="text-sm">👑</span>}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
