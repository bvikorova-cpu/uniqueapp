import { useSecretSanta } from "@/hooks/useSecretSanta";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Crown, Medal, Award } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const SecretSantaLeaderboard = () => {
  const { leaderboard, leaderboardLoading } = useSecretSanta();

  if (leaderboardLoading) {
    return (
    <>
      <FloatingHowItWorks title={"Secret Santa Leaderboard - How it works"} steps={[{ title: 'Open', desc: 'Access the Secret Santa Leaderboard section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Secret Santa Leaderboard.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="bg-white/80 backdrop-blur-xl border border-amber-200 rounded-2xl p-6 shadow-lg">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-amber-100 rounded-xl" />
          ))}
        </div>
      </div>
    </>
  );
  }

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-100 via-amber-100 to-yellow-100 border-yellow-400";
      case 2:
        return "bg-gradient-to-r from-gray-100 to-gray-50 border-gray-300";
      case 3:
        return "bg-gradient-to-r from-amber-100 to-orange-50 border-amber-400";
      default:
        return "bg-white border-gray-200";
    }
  };

  if (leaderboard.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-xl border border-amber-200 rounded-2xl p-8 text-center shadow-lg">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-100 to-amber-100 flex items-center justify-center">
          <Trophy className="h-10 w-10 text-yellow-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No leaders yet</h3>
        <p className="text-gray-500">
          Be the first to send gifts and claim the top spot!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-amber-200 rounded-2xl p-4 sm:p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-yellow-500" />
        Top Gift Givers
      </h3>

      {/* Top 3 podium */}
      {leaderboard.length >= 3 && (
        <div className="flex justify-center items-end gap-2 sm:gap-4 mb-8">
          {/* 2nd place */}
          <div className="text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2 rounded-full bg-gradient-to-br from-gray-200 to-gray-100 border-2 border-gray-300 flex items-center justify-center overflow-hidden shadow-md">
              <Avatar className="w-full h-full">
                <AvatarImage src={leaderboard[1]?.avatarUrl || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-gray-400 to-gray-500 text-white text-xl">
                  {leaderboard[1]?.username?.[0]?.toUpperCase() || "2"}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="h-20 sm:h-24 w-16 sm:w-20 bg-gradient-to-t from-gray-200 to-gray-100 rounded-t-lg flex flex-col items-center justify-center shadow-sm">
              <Medal className="h-5 w-5 text-gray-400 mb-1" />
              <span className="text-gray-700 text-xs sm:text-sm font-medium truncate max-w-full px-1">
                {leaderboard[1]?.username}
              </span>
              <span className="text-gray-500 text-xs">
                💎 {leaderboard[1]?.totalGiftsValue}
              </span>
            </div>
          </div>

          {/* 1st place */}
          <div className="text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-2 rounded-full bg-gradient-to-br from-yellow-200 to-amber-200 border-2 border-yellow-400 flex items-center justify-center overflow-hidden animate-pulse shadow-lg">
              <Avatar className="w-full h-full">
                <AvatarImage src={leaderboard[0]?.avatarUrl || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-amber-500 text-white text-2xl">
                  {leaderboard[0]?.username?.[0]?.toUpperCase() || "1"}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="h-28 sm:h-32 w-20 sm:w-24 bg-gradient-to-t from-yellow-200 to-amber-100 rounded-t-lg flex flex-col items-center justify-center shadow-md">
              <Crown className="h-6 w-6 text-yellow-500 mb-1" />
              <span className="text-gray-800 font-bold text-sm sm:text-base truncate max-w-full px-1">
                {leaderboard[0]?.username}
              </span>
              <span className="text-amber-600 text-sm font-semibold">
                💎 {leaderboard[0]?.totalGiftsValue}
              </span>
            </div>
          </div>

          {/* 3rd place */}
          <div className="text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2 rounded-full bg-gradient-to-br from-amber-200 to-orange-100 border-2 border-amber-400 flex items-center justify-center overflow-hidden shadow-md">
              <Avatar className="w-full h-full">
                <AvatarImage src={leaderboard[2]?.avatarUrl || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white text-xl">
                  {leaderboard[2]?.username?.[0]?.toUpperCase() || "3"}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="h-16 sm:h-20 w-16 sm:w-20 bg-gradient-to-t from-amber-200 to-orange-100 rounded-t-lg flex flex-col items-center justify-center shadow-sm">
              <Medal className="h-5 w-5 text-amber-500 mb-1" />
              <span className="text-gray-700 text-xs sm:text-sm font-medium truncate max-w-full px-1">
                {leaderboard[2]?.username}
              </span>
              <span className="text-amber-600 text-xs">
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
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:scale-[1.02] shadow-sm ${getRankBg(entry.rank)}`}
            >
              <div className="w-8 flex justify-center">
                {entry.rank === 1 ? (
                  <Crown className="h-6 w-6 text-yellow-500" />
                ) : entry.rank === 2 ? (
                  <Medal className="h-6 w-6 text-gray-400" />
                ) : entry.rank === 3 ? (
                  <Medal className="h-6 w-6 text-amber-500" />
                ) : (
                  <Award className="h-5 w-5 text-gray-400" />
                )}
              </div>

              <Avatar className="h-10 w-10">
                <AvatarImage src={entry.avatarUrl || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                  {entry.username?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="text-gray-800 font-medium truncate">{entry.username}</p>
                <p className="text-gray-400 text-xs">Rank #{entry.rank}</p>
              </div>

              <div className="text-right">
                <p className="text-amber-600 font-bold">💎 {entry.totalGiftsValue}</p>
                <p className="text-gray-400 text-xs">total given</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
