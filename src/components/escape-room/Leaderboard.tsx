import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Clock, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface LeaderboardEntry {
  id: string;
  team_name: string;
  completion_time_seconds: number;
  score: number;
  hints_used: number;
  created_at: string;
}

const Leaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from("escape_room_leaderboard")
        .select("*")
        .order("score", { ascending: false })
        .limit(50);

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRankColor = (index: number) => {
    if (index === 0) return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300";
    if (index === 1) return "bg-gray-400/20 text-gray-700 dark:text-gray-300";
    if (index === 2) return "bg-orange-500/20 text-orange-700 dark:text-orange-300";
    return "";
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
  };

  return (
    <>
      <FloatingHowItWorks title={"Leaderboard - How it works"} steps={[{ title: 'Open', desc: 'Access the Leaderboard section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Leaderboard.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          <CardTitle>Global Leaderboard</CardTitle>
        </div>
        <CardDescription>
          Top players across all escape rooms
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading leaderboard...</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No entries yet. Be the first to complete a room!
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                className={`flex items-center gap-4 p-4 rounded-lg ${getRankColor(index)}`}
              >
                <div className="text-2xl font-bold w-12 text-center">
                  {getRankIcon(index)}
                </div>

                <div className="flex-1">
                  <div className="font-semibold">{entry.team_name}</div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(entry.completion_time_seconds)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Lightbulb className="h-3 w-3" />
                      {entry.hints_used}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold">{entry.score}</div>
                  <div className="text-xs text-muted-foreground">points</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
};

export default Leaderboard;
