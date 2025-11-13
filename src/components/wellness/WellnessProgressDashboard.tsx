import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWellnessProgress } from "@/hooks/useWellnessProgress";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, Clock, Heart, Brain } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const WellnessProgressDashboard = () => {
  const { sessions, journalEntries, stats, isLoading } = useWellnessProgress();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading your progress...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const totalSessions = sessions.length;
  const totalJournalEntries = journalEntries.length;
  const completedSessions = sessions.filter(s => s.completed).length;
  const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

  // Calculate total meditation time
  const totalMeditationTime = sessions.reduce((acc, session) => acc + session.duration_seconds, 0);
  const meditationHours = Math.floor(totalMeditationTime / 3600);
  const meditationMinutes = Math.floor((totalMeditationTime % 3600) / 60);

  // Get recent activity
  const recentSessions = sessions.slice(0, 5);
  const recentJournalEntries = journalEntries.slice(0, 3);

  // Calculate stats by activity type
  const activityStats = stats.reduce((acc, stat) => {
    acc[stat.activity_type] = {
      count: stat.activity_count,
      duration: stat.total_duration_seconds,
      lastActivity: stat.last_activity_at
    };
    return acc;
  }, {} as Record<string, { count: number; duration: number; lastActivity: string }>);

  const formatSessionType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              {completedSessions} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meditation Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {meditationHours}h {meditationMinutes}m
            </div>
            <p className="text-xs text-muted-foreground">
              Total practice time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Journal Entries</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalJournalEntries}</div>
            <p className="text-xs text-muted-foreground">
              Reflections written
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Completion Rate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Completion Rate
          </CardTitle>
          <CardDescription>Your consistency in completing meditation sessions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Overall Progress</span>
            <span className="text-sm font-medium">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </CardContent>
      </Card>

      {/* Activity Breakdown */}
      {Object.keys(activityStats).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Activity Breakdown</CardTitle>
            <CardDescription>Your wellness activities over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(activityStats).map(([type, data]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{formatSessionType(type)}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {data.count} {data.count === 1 ? 'time' : 'times'}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(data.lastActivity), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Meditation Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <div className="font-medium text-sm">{formatSessionType(session.session_type)}</div>
                    <div className="text-xs text-muted-foreground">
                      {Math.floor(session.duration_seconds / 60)} minutes
                      {session.notes && ` • ${session.notes}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={session.completed ? "default" : "secondary"}>
                      {session.completed ? "Completed" : "Incomplete"}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Journal Entries */}
      {recentJournalEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Journal Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentJournalEntries.map((entry) => (
                <div key={entry.id} className="border-b pb-3 last:border-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                    </div>
                    {entry.mood_rating && (
                      <Badge variant="outline">
                        Mood: {"😊".repeat(entry.mood_rating)}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm line-clamp-2">{entry.entry_text}</p>
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {entry.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {totalSessions === 0 && totalJournalEntries === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Start Your Wellness Journey</h3>
            <p className="text-muted-foreground">
              Begin tracking your progress by using the wellness tools above
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
