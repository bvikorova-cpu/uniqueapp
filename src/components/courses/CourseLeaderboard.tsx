import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Award, Clock, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface LeaderboardEntry {
  user_id: string;
  student_name: string;
  score: number;
  completion_date: string;
  time_spent_minutes: number;
  rank: number;
}

interface CourseLeaderboardProps {
  courseId: string;
}

export const CourseLeaderboard = ({ courseId }: CourseLeaderboardProps) => {
  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ["course-leaderboard", courseId],
    queryFn: async () => {
      // First get the course name to match with completed_courses
      const { data: course } = await supabase
        .from("courses")
        .select("title")
        .eq("id", courseId)
        .single();

      if (!course) return [];

      const { data, error } = await supabase
        .from("completed_courses")
        .select("*")
        .eq("course_name", course.title)
        .order("test_score", { ascending: false })
        .order("completion_date", { ascending: true })
        .limit(50);

      if (error) throw error;

      return (data || []).map((entry, index) => ({
        user_id: entry.user_id,
        student_name: `Student ${index + 1}`,
        score: entry.test_score || 0,
        completion_date: entry.completion_date,
        time_spent_minutes: entry.time_spent_minutes || 0,
        rank: index + 1,
      })) as LeaderboardEntry[];
    },
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
    if (rank === 2) return "bg-gray-400/10 text-gray-700 border-gray-400/20";
    if (rank === 3) return "bg-amber-600/10 text-amber-700 border-amber-600/20";
    return "";
  };

  if (isLoading) {
    return (
      <>
        <FloatingHowItWorks title="How Course Leaderboard works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
        <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Loading leaderboard...</p>
        </CardContent>
      </Card>
      </>
      );
  }

  if (leaderboard.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No completions yet. Be the first to complete this course!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Top Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaderboard.map((entry) => (
              <Card
                key={entry.user_id}
                className={`${entry.rank <= 3 ? getRankBadge(entry.rank) : ""}`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="flex items-center justify-center w-12 h-12">
                      {getRankIcon(entry.rank)}
                    </div>

                    {/* Avatar */}
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {entry.student_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{entry.student_name}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{entry.score}% score</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{Math.round(entry.time_spent_minutes / 60)}h</span>
                        </div>
                      </div>
                    </div>

                    {/* Badges */}
                    {entry.rank === 1 && (
                      <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700">
                        Top Student
                      </Badge>
                    )}
                    {entry.score === 100 && (
                      <Badge variant="secondary" className="bg-green-500/10 text-green-700">
                        Perfect Score
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <Trophy className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{leaderboard[0]?.score || 0}%</p>
                <p className="text-sm text-muted-foreground">Top Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {Math.round(leaderboard.reduce((acc, e) => acc + e.score, 0) / leaderboard.length)}%
                </p>
                <p className="text-sm text-muted-foreground">Avg Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Clock className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {Math.round(
                    leaderboard.reduce((acc, e) => acc + e.time_spent_minutes, 0) /
                      leaderboard.length /
                      60
                  )}h
                </p>
                <p className="text-sm text-muted-foreground">Avg Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
