import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWellnessProgress } from "@/hooks/useWellnessProgress";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, Clock, Heart, Brain, Sparkles, Target, Flame } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const WellnessProgressDashboard = () => {
  const { sessions, journalEntries, stats, isLoading } = useWellnessProgress();

  if (isLoading) {
    return (
      <Card className="mt-4 relative overflow-hidden border-primary/20 backdrop-blur-xl bg-card/80">
      <FloatingHowItWorks title="WellnessProgressDashboard — How it works" steps={[{title:"Open this tool",desc:"Access WellnessProgressDashboard within the Health & Wellness section."},{title:"Configure",desc:"Adjust preferences, choose duration or select goals."},{title:"Start & interact",desc:"Begin the session, log data or run an AI analysis (some cost 3–5 credits)."},{title:"Review results",desc:"Check outcomes, save to history and track progress over time."}]} />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <CardContent className="relative py-12 text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
            <Brain className="h-8 w-8 mx-auto text-primary" />
          </motion.div>
          <p className="text-sm text-muted-foreground mt-3">Loading your progress...</p>
        </CardContent>
      </Card>
    );
  }

  const totalSessions = sessions.length;
  const totalJournalEntries = journalEntries.length;
  const completedSessions = sessions.filter(s => s.completed).length;
  const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
  const totalMeditationTime = sessions.reduce((acc, session) => acc + session.duration_seconds, 0);
  const meditationHours = Math.floor(totalMeditationTime / 3600);
  const meditationMinutes = Math.floor((totalMeditationTime % 3600) / 60);
  const recentSessions = sessions.slice(0, 5);
  const recentJournalEntries = journalEntries.slice(0, 3);

  const activityStats = stats.reduce((acc, stat) => {
    acc[stat.activity_type] = { count: stat.activity_count, duration: stat.total_duration_seconds, lastActivity: stat.last_activity_at };
    return acc;
  }, {} as Record<string, { count: number; duration: number; lastActivity: string }>);

  const formatSessionType = (type: string) => type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const statCards = [
    { icon: Brain, label: "Total Sessions", value: totalSessions.toString(), sub: `${completedSessions} completed`, color: "text-violet-400", bg: "from-violet-500/10 to-purple-500/5" },
    { icon: Clock, label: "Meditation Time", value: `${meditationHours}h ${meditationMinutes}m`, sub: "Total practice time", color: "text-sky-400", bg: "from-sky-500/10 to-blue-500/5" },
    { icon: Heart, label: "Journal Entries", value: totalJournalEntries.toString(), sub: "Reflections written", color: "text-pink-400", bg: "from-pink-500/10 to-rose-500/5" },
  ];

  return (
    <div className="space-y-6 mt-4">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`relative overflow-hidden border-primary/20 backdrop-blur-xl bg-card/80 hover:shadow-lg transition-shadow`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bg}`} />
                <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                  <div className="p-2 rounded-lg bg-card/60">
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-3xl font-black">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Completion Rate */}
      <Card className="relative overflow-hidden border-primary/20 backdrop-blur-xl bg-card/80">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-primary/5 to-transparent" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10">
              <Target className="h-5 w-5 text-emerald-400" />
            </div>
            Completion Rate
          </CardTitle>
          <CardDescription>Your consistency in completing meditation sessions</CardDescription>
        </CardHeader>
        <CardContent className="relative space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Overall Progress</span>
            <span className="text-lg font-bold">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-3" />
          <div className="flex gap-4 pt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground">Completed: {completedSessions}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-muted" />
              <span className="text-xs text-muted-foreground">Incomplete: {totalSessions - completedSessions}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Breakdown */}
      {Object.keys(activityStats).length > 0 && (
        <Card className="relative overflow-hidden border-primary/20 backdrop-blur-xl bg-card/80">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10">
                <Flame className="h-5 w-5 text-amber-400" />
              </div>
              Activity Breakdown
            </CardTitle>
            <CardDescription>Your wellness activities over time</CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <div className="space-y-3">
              {Object.entries(activityStats).map(([type, data], index) => (
                <motion.div
                  key={type}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-card/60 backdrop-blur-sm border border-border/30"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">{formatSessionType(type)}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {data.count} {data.count === 1 ? 'time' : 'times'}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(data.lastActivity), { addSuffix: true })}
                  </span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <Card className="relative overflow-hidden border-primary/20 backdrop-blur-xl bg-card/80">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-500/10">
                <Calendar className="h-5 w-5 text-blue-400" />
              </div>
              Recent Meditation Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="space-y-2">
              {recentSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-card/60 backdrop-blur-sm border border-border/30"
                >
                  <div>
                    <div className="font-medium text-sm">{formatSessionType(session.session_type)}</div>
                    <div className="text-xs text-muted-foreground">
                      {Math.floor(session.duration_seconds / 60)} minutes
                      {session.notes && ` • ${session.notes}`}
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <Badge variant={session.completed ? "default" : "secondary"} className="text-[10px]">
                      {session.completed ? "✓ Completed" : "Incomplete"}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Journal Entries */}
      {recentJournalEntries.length > 0 && (
        <Card className="relative overflow-hidden border-primary/20 backdrop-blur-xl bg-card/80">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-pink-500/10">
                <Heart className="h-5 w-5 text-pink-400" />
              </div>
              Recent Journal Entries
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="space-y-3">
              {recentJournalEntries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-xl bg-card/60 backdrop-blur-sm border border-border/30"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                    </span>
                    {entry.mood_rating && (
                      <Badge variant="outline" className="text-xs">
                        Mood: {"😊".repeat(entry.mood_rating)}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm line-clamp-2 text-muted-foreground">{entry.entry_text}</p>
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {entry.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-[10px]">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {totalSessions === 0 && totalJournalEntries === 0 && (
        <Card className="relative overflow-hidden border-primary/20 backdrop-blur-xl bg-card/80">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <CardContent className="relative py-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
            </motion.div>
            <h3 className="text-xl font-bold mb-2">Start Your Wellness Journey</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Begin tracking your progress by using the wellness tools. Every session counts towards building a healthier, calmer you.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
