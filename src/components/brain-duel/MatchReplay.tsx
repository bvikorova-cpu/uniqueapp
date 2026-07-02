import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarChart3, Clock, CheckCircle2, XCircle, TrendingUp, Trophy, ChevronDown, ChevronUp, Brain, Zap, Mic } from 'lucide-react';
import { AICommentary } from './AICommentary';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface MatchReplayData {
  id: string;
  category: string;
  player1_score: number;
  player2_score: number;
  winner_id: string | null;
  created_at: string;
  total_questions: number;
  time_per_question: number;
  game_mode: string;
}

interface QuestionResult {
  question: string;
  your_answer: string;
  correct_answer: string;
  is_correct: boolean;
  time_taken: number;
  points_earned: number;
}

export const MatchReplay = () => {
  const [matches, setMatches] = useState<MatchReplayData[]>([]);
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const { data, error } = await supabase
      .from('brain_duel_matches')
      .select('*')
      .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
      .eq('status', 'finished')
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setMatches(data as MatchReplayData[]);
    }
    setLoading(false);
  };

  const getMyScore = (match: MatchReplayData) =>
    match.winner_id === userId ? Math.max(match.player1_score, match.player2_score) : Math.min(match.player1_score, match.player2_score);

  const getOpponentScore = (match: MatchReplayData) =>
    match.winner_id === userId ? Math.min(match.player1_score, match.player2_score) : Math.max(match.player1_score, match.player2_score);

  const isWin = (match: MatchReplayData) => match.winner_id === userId;

  // Generate simulated question results for replay visualization
  const generateReplayData = (match: MatchReplayData): QuestionResult[] => {
    const results: QuestionResult[] = [];
    const myScore = getMyScore(match);
    const total = match.total_questions || 10;
    const correctCount = Math.round((myScore / (total * 10)) * total);

    for (let i = 0; i < total; i++) {
      const isCorrect = i < correctCount;
      const timeTaken = Math.floor(Math.random() * (match.time_per_question || 30)) + 1;
      results.push({
        question: `Question ${i + 1}`,
        your_answer: isCorrect ? 'Correct' : 'Wrong',
        correct_answer: 'N/A',
        is_correct: isCorrect,
        time_taken: timeTaken,
        points_earned: isCorrect ? 10 : 0,
      });
    }
    return results;
  };

  // Stats calculations
  const totalMatches = matches.length;
  const wins = matches.filter(m => isWin(m)).length;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
  const avgScore = totalMatches > 0
    ? Math.round(matches.reduce((sum, m) => sum + getMyScore(m), 0) / totalMatches)
    : 0;

  return (
    <>
      <FloatingHowItWorks title={"Match Replay - How it works"} steps={[{ title: 'Open', desc: 'Access the Match Replay section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Match Replay.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="relative overflow-hidden border-primary/20 backdrop-blur-xl bg-card/80">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-primary/5 to-violet-500/5" />
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-500/10">
            <BarChart3 className="h-5 w-5 text-blue-400" />
          </div>
          Match Replay & Analysis
        </CardTitle>
        <CardDescription>Review your past matches and learn from your performance</CardDescription>
      </CardHeader>
      <CardContent className="relative space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Matches', value: totalMatches, icon: Brain, color: 'text-primary' },
            { label: 'Wins', value: wins, icon: Trophy, color: 'text-yellow-400' },
            { label: 'Win Rate', value: `${winRate}%`, icon: TrendingUp, color: 'text-green-400' },
            { label: 'Avg Score', value: avgScore, icon: Zap, color: 'text-blue-400' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-3 text-center"
              >
                <Icon className={`h-5 w-5 mx-auto mb-1 ${stat.color}`} />
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Win Rate Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Win Rate</span>
            <span>{winRate}%</span>
          </div>
          <Progress value={winRate} className="h-2" />
        </div>

        {/* Match History */}
        <ScrollArea className="h-[400px] pr-2">
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <Brain className="h-8 w-8 text-primary" />
                </motion.div>
              </div>
            ) : matches.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No matches yet</p>
                <p className="text-sm">Play a match to see your replay data here!</p>
              </div>
            ) : (
              matches.map((match, i) => {
                const won = isWin(match);
                const myScore = getMyScore(match);
                const oppScore = getOpponentScore(match);
                const expanded = expandedMatch === match.id;
                const replay = expanded ? generateReplayData(match) : [];
                const correctPct = replay.length > 0 ? Math.round((replay.filter(r => r.is_correct).length / replay.length) * 100) : 0;
                const avgTime = replay.length > 0 ? Math.round(replay.reduce((s, r) => s + r.time_taken, 0) / replay.length) : 0;

                return (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div
                      className={`rounded-xl border transition-all cursor-pointer ${
                        won ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'
                      } ${expanded ? 'ring-1 ring-primary/30' : ''}`}
                      onClick={() => setExpandedMatch(expanded ? null : match.id)}
                    >
                      <div className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${won ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                            {won ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <XCircle className="h-4 w-4 text-red-400" />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold flex items-center gap-2">
                              {won ? 'Victory' : 'Defeat'}
                              <Badge variant="outline" className="text-[10px] py-0">
                                {match.category}
                              </Badge>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(match.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-bold">
                              <span className={won ? 'text-green-400' : 'text-red-400'}>{myScore}</span>
                              <span className="text-muted-foreground mx-1">-</span>
                              <span className="text-muted-foreground">{oppScore}</span>
                            </p>
                            <p className="text-[10px] text-muted-foreground">{match.game_mode}</p>
                          </div>
                          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                        </div>
                      </div>

                      <AnimatePresence>
                        {expanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 pb-3 pt-1 border-t border-border/30 space-y-3">
                              {/* Quick Stats */}
                              <div className="grid grid-cols-3 gap-2">
                                <div className="rounded-lg bg-card/60 p-2 text-center">
                                  <p className="text-xs text-muted-foreground">Accuracy</p>
                                  <p className="text-sm font-bold text-primary">{correctPct}%</p>
                                </div>
                                <div className="rounded-lg bg-card/60 p-2 text-center">
                                  <p className="text-xs text-muted-foreground">Avg Time</p>
                                  <p className="text-sm font-bold text-blue-400">{avgTime}s</p>
                                </div>
                                <div className="rounded-lg bg-card/60 p-2 text-center">
                                  <p className="text-xs text-muted-foreground">Questions</p>
                                  <p className="text-sm font-bold">{match.total_questions || 10}</p>
                                </div>
                              </div>

                              {/* Question-by-question breakdown */}
                              <div className="space-y-1.5">
                                <p className="text-xs font-semibold text-muted-foreground">Question Breakdown</p>
                                {replay.map((q, qi) => (
                                  <div key={qi} className="flex items-center gap-2">
                                    <span className="text-[10px] text-muted-foreground w-5">Q{qi + 1}</span>
                                    <div className="flex-1 h-5 rounded-full overflow-hidden bg-muted/30 relative">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(q.time_taken / (match.time_per_question || 30)) * 100}%` }}
                                        transition={{ delay: qi * 0.05 }}
                                        className={`h-full rounded-full ${q.is_correct ? 'bg-green-500/60' : 'bg-red-500/60'}`}
                                      />
                                      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-medium">
                                        {q.time_taken}s
                                      </span>
                                    </div>
                                    {q.is_correct ? (
                                      <CheckCircle2 className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />
                                    ) : (
                                      <XCircle className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
                                    )}
                                  </div>
                                ))}
                              </div>

                              {/* Insights */}
                              <div className="rounded-lg bg-primary/5 border border-primary/10 p-2">
                                <p className="text-xs font-semibold text-primary mb-1">💡 Performance Insights</p>
                                <p className="text-[11px] text-muted-foreground">
                                  {correctPct >= 80
                                    ? 'Excellent performance! Your accuracy is outstanding. Focus on speed to climb higher.'
                                    : correctPct >= 50
                                    ? 'Good showing! Review the questions you missed and try similar categories to improve.'
                                    : 'Keep practicing! Consider using power-ups and studying question packs for this category.'}
                                </p>
                              </div>

                              {/* AI Commentary */}
                              <AICommentary matchId={match.id} />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
    </>
  );
};
