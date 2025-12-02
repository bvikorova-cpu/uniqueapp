import { useSecretSanta } from "@/hooks/useSecretSanta";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Crown, Medal, Award } from "lucide-react";

export const SecretSantaLeaderboard = () => {
  const { leaderboard, leaderboardLoading } = useSecretSanta();

  if (leaderboardLoading) {
    return (
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-white/10 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-300" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <Award className="h-5 w-5 text-white/40" />;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/30 via-amber-500/30 to-yellow-500/30 border-yellow-500/50";
      case 2:
        return "bg-gradient-to-r from-gray-400/20 to-gray-300/20 border-gray-400/40";
      case 3:
        return "bg-gradient-to-r from-amber-700/20 to-amber-600/20 border-amber-600/40";
      default:
        return "bg-white/5 border-white/10";
    }
  };

  if (leaderboard.length === 0) {
    return (
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-500/20 to-amber-500/20 flex items-center justify-center">
          <Trophy className="h-10 w-10 text-yellow-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No leaders yet</h3>
        <p className="text-white/60">
          Be the first to send gifts and claim the top spot!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-yellow-400" />
        Top Gift Givers
      </h3>

      {/* Top 3 podium */}
      {leaderboard.length >= 3 && (
        <div className="flex justify-center items-end gap-2 sm:gap-4 mb-8">
          {/* 2nd place */}
          <div className="text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2 rounded-full bg-gradient-to-br from-gray-400/30 to-gray-300/30 border-2 border-gray-400/50 flex items-center justify-center overflow-hidden">
              <Avatar className="w-full h-full">
                <AvatarImage src={leaderboard[1]?.avatarUrl || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-gray-400 to-gray-500 text-white text-xl">
                  {leaderboard[1]?.username?.[0]?.toUpperCase() || "2"}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="h-20 sm:h-24 w-16 sm:w-20 bg-gradient-to-t from-gray-500/20 to-gray-400/10 rounded-t-lg flex flex-col items-center justify-center">
              <Medal className="h-5 w-5 text-gray-300 mb-1" />
              <span className="text-white/80 text-xs sm:text-sm font-medium truncate max-w-full px-1">
                {leaderboard[1]?.username}
              </span>
              <span className="text-gray-300 text-xs">
                💎 {leaderboard[1]?.totalGiftsValue}
              </span>
            </div>
          </div>

          {/* 1st place */}
          <div className="text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-2 rounded-full bg-gradient-to-br from-yellow-400/40 to-amber-500/40 border-2 border-yellow-400/60 flex items-center justify-center overflow-hidden animate-pulse">
              <Avatar className="w-full h-full">
                <AvatarImage src={leaderboard[0]?.avatarUrl || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-amber-500 text-white text-2xl">
                  {leaderboard[0]?.username?.[0]?.toUpperCase() || "1"}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="h-28 sm:h-32 w-20 sm:w-24 bg-gradient-to-t from-yellow-500/20 to-amber-400/10 rounded-t-lg flex flex-col items-center justify-center">
              <Crown className="h-6 w-6 text-yellow-400 mb-1" />
              <span className="text-white font-bold text-sm sm:text-base truncate max-w-full px-1">
                {leaderboard[0]?.username}
              </span>
              <span className="text-yellow-300 text-sm font-semibold">
                💎 {leaderboard[0]?.totalGiftsValue}
              </span>
            </div>
          </div>

          {/* 3rd place */}
          <div className="text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2 rounded-full bg-gradient-to-br from-amber-700/30 to-amber-600/30 border-2 border-amber-600/50 flex items-center justify-center overflow-hidden">
              <Avatar className="w-full h-full">
                <AvatarImage src={leaderboard[2]?.avatarUrl || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-amber-700 to-amber-600 text-white text-xl">
                  {leaderboard[2]?.username?.[0]?.toUpperCase() || "3"}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="h-16 sm:h-20 w-16 sm:w-20 bg-gradient-to-t from-amber-700/20 to-amber-600/10 rounded-t-lg flex flex-col items-center justify-center">
              <Medal className="h-5 w-5 text-amber-600 mb-1" />
              <span className="text-white/80 text-xs sm:text-sm font-medium truncate max-w-full px-1">
                {leaderboard[2]?.username}
              </span>
              <span className="text-amber-400 text-xs">
                💎 {leaderboard[2]?.totalGiftsValue}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Full list */}
      <ScrollArea className="h-[300px]">
        <div className="space-y-2">
          {leaderboard.map((entry) => (
            <div
              key={entry.userId}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:scale-[1.02] ${getRankBg(entry.rank)}`}
            >
              <div className="w-8 flex justify-center">
                {getRankIcon(entry.rank)}
              </div>

              <Avatar className="h-10 w-10">
                <AvatarImage src={entry.avatarUrl || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                  {entry.username?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{entry.username}</p>
                <p className="text-white/50 text-xs">Rank #{entry.rank}</p>
              </div>

              <div className="text-right">
                <p className="text-amber-300 font-bold">💎 {entry.totalGiftsValue}</p>
                <p className="text-white/40 text-xs">total given</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
