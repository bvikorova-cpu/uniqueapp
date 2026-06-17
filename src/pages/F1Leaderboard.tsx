import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Medal, Crown, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface LeaderboardEntry {
  id: string;
  username: string;
  total_points: number;
  wins: number;
  tier: string;
}

const F1Leaderboard = () => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('f1_leaderboard')
        .select('*')
        .order('total_points', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLeaderboard(data || []);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "pro":
        return <Badge className="bg-blue-600 text-white">Pro</Badge>;
      case "elite":
        return <Badge className="bg-yellow-600 text-white">Elite</Badge>;
      case "team":
        return <Badge className="bg-purple-600 text-white">Team</Badge>;
      default:
        return null;
    }
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-8 h-8 text-yellow-500" />;
      case 2:
        return <Medal className="w-8 h-8 text-gray-400" />;
      case 3:
        return <Medal className="w-8 h-8 text-orange-600" />;
      default:
        return <div className="w-8 h-8 flex items-center justify-center text-white font-bold">{position}</div>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading the F1 Global Leaderboard — please wait...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-black to-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/f1-racing')}
          className="mb-6 text-white hover:bg-white/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Racing
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-white mb-2 animate-fade-in">
            🏆 Global Leaderboard
          </h1>
          <p className="text-2xl text-gray-300">Top GP Fantasy Racing Players</p>
        </div>

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {/* 2nd Place */}
            <Card className="border-4 border-gray-400 bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl md:mt-8">
              <CardHeader>
                <div className="text-center">
                  <Medal className="w-16 h-16 mx-auto text-gray-400 mb-2" />
                  <CardTitle className="text-4xl text-white">2nd</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-2xl font-bold text-white mb-2">{leaderboard[1].username}</p>
                <Badge className="bg-yellow-500 text-black text-lg px-4 py-2 mb-2">
                  <Star className="w-4 h-4 mr-1 inline" />
                  {leaderboard[1].total_points} pts
                </Badge>
                <p className="text-gray-400">🏆 {leaderboard[1].wins} wins</p>
                <div className="mt-2">{getTierBadge(leaderboard[1].tier)}</div>
              </CardContent>
            </Card>

            {/* 1st Place */}
            <Card className="border-4 border-yellow-500 bg-gradient-to-br from-yellow-900 to-orange-900 shadow-2xl shadow-yellow-500/50">
              <CardHeader>
                <div className="text-center">
                  <Crown className="w-20 h-20 mx-auto text-yellow-500 mb-2 animate-pulse" />
                  <CardTitle className="text-5xl text-yellow-500">1st</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-3xl font-bold text-white mb-2">{leaderboard[0].username}</p>
                <Badge className="bg-yellow-500 text-black text-xl px-6 py-3 mb-2">
                  <Star className="w-5 h-5 mr-1 inline" />
                  {leaderboard[0].total_points} pts
                </Badge>
                <p className="text-gray-300 text-lg">🏆 {leaderboard[0].wins} wins</p>
                <div className="mt-2">{getTierBadge(leaderboard[0].tier)}</div>
              </CardContent>
            </Card>

            {/* 3rd Place */}
            <Card className="border-4 border-orange-600 bg-gradient-to-br from-orange-800 to-orange-900 shadow-2xl md:mt-8">
              <CardHeader>
                <div className="text-center">
                  <Medal className="w-16 h-16 mx-auto text-orange-600 mb-2" />
                  <CardTitle className="text-4xl text-white">3rd</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-2xl font-bold text-white mb-2">{leaderboard[2].username}</p>
                <Badge className="bg-yellow-500 text-black text-lg px-4 py-2 mb-2">
                  <Star className="w-4 h-4 mr-1 inline" />
                  {leaderboard[2].total_points} pts
                </Badge>
                <p className="text-gray-400">🏆 {leaderboard[2].wins} wins</p>
                <div className="mt-2">{getTierBadge(leaderboard[2].tier)}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Full Leaderboard */}
        <Card className="border-4 border-red-500 bg-black/90 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-3xl text-white text-center">
              Full Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <Card
                  key={entry.id}
                  className={`border-2 ${
                    index < 3
                      ? "border-yellow-500 bg-gradient-to-r from-yellow-900/30 to-black"
                      : "border-gray-600 bg-gray-900"
                  } hover:scale-102 transition-all duration-300`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 flex justify-center">
                          {getPositionIcon(index + 1)}
                        </div>
                        <div>
                          <p className="text-xl font-bold text-white">{entry.username}</p>
                          <div className="flex gap-2 items-center mt-1">
                            {getTierBadge(entry.tier)}
                            <span className="text-gray-400 text-sm">
                              🏆 {entry.wins} wins
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-red-600 text-white text-xl px-6 py-3">
                        <Star className="w-5 h-5 mr-2 inline" />
                        {entry.total_points}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {leaderboard.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  <p className="text-xl">No players yet. Be the first to compete!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default F1Leaderboard;
