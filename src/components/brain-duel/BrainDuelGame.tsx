import { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Brain, Trophy, Clock, Target, Zap, Timer, Lightbulb, SkipForward, Sparkles, Bot, BarChart3, Loader2, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { useBrainDuelCredits } from '@/hooks/useBrainDuelCredits';
import { useBrainDuelPowerups } from '@/hooks/useBrainDuelPowerups';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { useQueryClient } from '@tanstack/react-query';
import { LiveDuelChat } from './LiveDuelChat';
import { MatchStatusIndicator, type MatchStatus } from './MatchStatusIndicator';
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Question {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  difficulty?: string;
}

interface MatchResult {
  match: any;
  is_winner: boolean;
  is_draw: boolean;
  credits_earned: number;
  stats: {
    total_questions: number;
    correct_answers: number;
    accuracy: number;
  };
}

interface AnswerResult {
  is_correct: boolean;
  correct_answer: string;
  points_earned: number;
  new_score: number;
  opponent_score: number;
}

const CATEGORIES = [
  { id: 'General Knowledge', emoji: '🧠', color: 'from-violet-500/20 to-purple-600/10' },
  { id: 'Science', emoji: '🔬', color: 'from-cyan-500/20 to-blue-600/10' },
  { id: 'History', emoji: '📜', color: 'from-amber-500/20 to-yellow-600/10' },
  { id: 'Geography', emoji: '🌍', color: 'from-emerald-500/20 to-green-600/10' },
  { id: 'Sports', emoji: '⚽', color: 'from-orange-500/20 to-red-600/10' },
  { id: 'Entertainment', emoji: '🎬', color: 'from-rose-500/20 to-pink-600/10' },
  { id: 'Technology', emoji: '💻', color: 'from-sky-500/20 to-indigo-600/10' },
  { id: 'Mathematics', emoji: '📐', color: 'from-teal-500/20 to-cyan-600/10' },
  { id: 'Literature', emoji: '📚', color: 'from-fuchsia-500/20 to-purple-600/10' },
  { id: 'Music', emoji: '🎵', color: 'from-pink-500/20 to-rose-600/10' },
];

// Keep in sync with supabase/functions/brain-duel-matchmaking MODES
export const MODE_CONFIG: Record<string, { entry: number; reward: number; questions: number; time: number; label: string }> = {
  quick: { entry: 10, reward: 20, questions: 10, time: 30, label: 'Quick Duel' },
  classic: { entry: 20, reward: 50, questions: 20, time: 30, label: 'Classic Battle' },
  championship: { entry: 50, reward: 150, questions: 30, time: 24, label: 'Championship' },
  mystery: { entry: 30, reward: 90, questions: 10, time: 20, label: 'Mystery Category' },
  blitz: { entry: 15, reward: 30, questions: 5, time: 10, label: 'Blitz' },
  ranked: { entry: 20, reward: 40, questions: 10, time: 15, label: 'Ranked' },
};

export interface StartRequest {
  nonce: number;
  mode: string;
  category?: string;
}

export const BrainDuelGame = ({
  startRequest,
  resumeMatchId,
  resumeToken,
}: {
  startRequest?: StartRequest | null;
  resumeMatchId?: string | null;
  resumeToken?: string | null;
}) => {
  const queryClient = useQueryClient();
  const { credits, isLoading: creditsLoading } = useBrainDuelCredits();
  const { powerups, consumePowerup: triggerPowerup } = useBrainDuelPowerups();
  const [gamePhase, setGamePhase] = useState<'category' | 'loading' | 'playing' | 'answer-reveal' | 'results' | 'analysis' | 'waiting'>('category');
  const [category, setCategory] = useState('');
  const [gameMode, setGameMode] = useState<string>('quick');

  const [matchId, setMatchId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  // TEMP DEBUG: ?slow=1 extends timer to 60s for end-to-end testing (Nathalie)
  const defaultQuestionTime = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('slow') === '1' ? 60 : 30;
  const [questionTime, setQuestionTime] = useState(defaultQuestionTime);
  const [timeLeft, setTimeLeft] = useState(defaultQuestionTime);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [answerStartTime, setAnswerStartTime] = useState<number>(Date.now());
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [matchStatus, setMatchStatus] = useState<MatchStatus>('ready');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUser(user));
  }, []);

  // React to external start requests (game mode selector / mystery card)
  const lastNonceRef = useRef<number>(0);
  useEffect(() => {
    if (!startRequest || startRequest.nonce === lastNonceRef.current) return;
    if (!currentUser) return;
    lastNonceRef.current = startRequest.nonce;
    setGameMode(startRequest.mode);
    if (startRequest.category) {
      startMatch(startRequest.category, startRequest.mode);
    } else if (startRequest.mode === 'mystery') {
      const random = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)].id;
      toast.info(`🔮 Mystery category: ${random}`);
      startMatch(random, 'mystery');
    } else {
      setGamePhase('category');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startRequest?.nonce, currentUser]);


  // Timer
  useEffect(() => {
    if (gamePhase !== 'playing' || timeLeft <= 0) return;
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, gamePhase]);

  // Auto-submit on timeout
  useEffect(() => {
    if (timeLeft === 0 && gamePhase === 'playing' && !selectedAnswer) {
      handleAnswer('timeout');
    }
  }, [timeLeft, gamePhase, selectedAnswer]);

  const startMatch = async (cat: string, mode: string = gameMode) => {
    if (!currentUser) {
      toast.error('Please sign in to play');
      return;
    }
    const cfg = MODE_CONFIG[mode] ?? MODE_CONFIG.quick;
    if (credits < cfg.entry) {
      toast.error(`You need at least ${cfg.entry} credits for ${cfg.label}`);
      return;
    }

    setCategory(cat);
    setGameMode(mode);
    setGamePhase('loading');
    setMyScore(0);
    setOpponentScore(0);
    setCurrentIndex(0);
    setMatchResult(null);
    setAiAnalysis(null);
    setMatchStatus('ready');

    // Extract a readable message from a non-2xx edge function response
    const readEdgeError = async (err: any, fallback: string) => {
      try {
        const body = await err?.context?.json?.();
        if (body?.error) return String(body.error);
      } catch { /* ignore */ }
      const msg = String(err?.message || '');
      return msg && !msg.includes('non-2xx') ? msg : fallback;
    };

    try {
      // 1. Create match
      const { data: matchData, error: matchError } = await supabase.functions.invoke('brain-duel-matchmaking', {
        body: { category: cat, gameMode: mode } });
      if (matchError) throw new Error(await readEdgeError(matchError, 'Could not start the match. Please try again.'));
      if (matchData?.error) throw new Error(matchData.error);
      if (!matchData?.match?.id) throw new Error('Could not create the match. Please try again.');

      setMatchId(matchData.match.id);
      const matchQuestionTime = typeof matchData.match.time_per_question === 'number'
        ? matchData.match.time_per_question
        : cfg.time;
      setQuestionTime(matchQuestionTime);
      queryClient.invalidateQueries({ queryKey: ['brain-duel-credits'] });
      queryClient.invalidateQueries({ queryKey: ['ai-credits'] });

      // 2. Get questions (AI generated, with server-side question-bank fallback).
      //    Retry once — transient AI hiccups should never end the duel.
      let qData: any = null;
      let lastErr: any = null;
      for (let attempt = 0; attempt < 2; attempt++) {
        const { data, error } = await supabase.functions.invoke('brain-duel-get-questions', {
          body: { match_id: matchData.match.id, category: cat } });
        if (!error && !data?.error && Array.isArray(data?.questions) && data.questions.length > 0) {
          qData = data;
          break;
        }
        lastErr = error || new Error(data?.error || 'No questions returned');
        if (attempt === 0) await new Promise((r) => setTimeout(r, 1200));
      }
      if (!qData) throw new Error(await readEdgeError(lastErr, 'Questions are temporarily unavailable. Please try again in a moment.'));

      setQuestions(qData.questions);
      setMatchStatus('in_progress');
      setGamePhase('playing');
      setTimeLeft(matchQuestionTime);
      setAnswerStartTime(Date.now());
      toast.success(
        qData.source === 'bank' ? 'Match started! Questions loaded.' : 'Match started! AI generated unique questions for you.',
        { duration: 2000 }
      );
    } catch (err: any) {
      console.error('Start match error:', err);
      toast.error(err.message || 'Failed to start match');
      setMatchStatus('failed');
      setGamePhase('category');
    }
  };

  // Shared finisher so both the live flow and the "waiting for opponent" screen
  // can close a match without duplicating logic.
  const finishMatchById = useCallback(async (id: string) => {
    setGamePhase('results');
    try {
      const { data, error } = await supabase.functions.invoke('brain-duel-finish-match', {
        body: { match_id: id } });
      if (error) throw error;
      setMatchResult(data);
      setMatchStatus('finished');
      queryClient.invalidateQueries({ queryKey: ['brain-duel-credits'] });
      queryClient.invalidateQueries({ queryKey: ['ai-credits'] });
      queryClient.invalidateQueries({ queryKey: ['brain-duel-overview'] });
    } catch (err: any) {
      console.error('Finish match error:', err);
      setMatchStatus('failed');
      toast.error('Failed to finish match');
    }
  }, [queryClient]);

  const countAnswers = async (mid: string, playerId: string) => {
    const { count } = await supabase
      .from('brain_duel_answers')
      .select('id', { count: 'exact', head: true })
      .eq('match_id', mid)
      .eq('player_id', playerId);
    return count ?? 0;
  };

  // Poll opponent progress while waiting; auto-finish once they are done.
  const [waitingInfo, setWaitingInfo] = useState<{ answered: number; total: number } | null>(null);
  const checkOpponentProgress = useCallback(async (silent = false) => {
    if (!resumeMatchId || !currentUser) return;
    const { data: match } = await supabase
      .from('brain_duel_matches')
      .select('*')
      .eq('id', resumeMatchId)
      .maybeSingle();
    if (!match) return;
    const isP1 = match.player1_id === currentUser.id;
    const oppId = isP1 ? match.player2_id : match.player1_id;
    const total = match.total_questions ?? 10;
    setMyScore(isP1 ? match.player1_score ?? 0 : match.player2_score ?? 0);
    setOpponentScore(isP1 ? match.player2_score ?? 0 : match.player1_score ?? 0);
    const oppAnswered = oppId ? await countAnswers(match.id, oppId) : 0;
    setWaitingInfo({ answered: oppAnswered, total });
    if (match.status === 'completed' || match.status === 'finished' || match.finished_at) {
      await finishMatchById(match.id);
      return;
    }
    if (oppAnswered >= total) {
      await finishMatchById(match.id);
    } else if (!silent) {
      toast.info(`Opponent answered ${oppAnswered}/${total} questions.`);
    }
  }, [resumeMatchId, currentUser, finishMatchById]);

  useEffect(() => {
    if (gamePhase !== 'waiting') return;
    const id = setInterval(() => { void checkOpponentProgress(true); }, 8000);
    return () => clearInterval(id);
  }, [gamePhase, checkOpponentProgress]);

  // Resume an already-created match (e.g. an accepted friend challenge).
  // Credits were already deducted when the match was created — never charge again here.
  const resumedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!resumeMatchId || !currentUser) return;
    const resumeKey = `${resumeMatchId}:${resumeToken ?? ''}`;
    if (resumedRef.current === resumeKey) return;
    resumedRef.current = resumeKey;

    (async () => {
      setGamePhase('loading');
      setMyScore(0);
      setOpponentScore(0);
      setCurrentIndex(0);
      setMatchResult(null);
      setAiAnalysis(null);
      setSelectedAnswer(null);
      setAnswerResult(null);
      setMatchStatus('ready');

      const { data: match, error } = await supabase
        .from('brain_duel_matches')
        .select('*')
        .eq('id', resumeMatchId)
        .maybeSingle();

      if (error || !match) {
        toast.error('Match not found');
        setGamePhase('category');
        return;
      }
      if (match.status === 'completed' || match.status === 'finished' || match.finished_at) {
        toast.info('This duel is already finished');
        setGamePhase('category');
        return;
      }

      const t = typeof match.time_per_question === 'number' ? match.time_per_question : 30;
      setMatchId(match.id);
      setCategory(match.category || 'General Knowledge');
      setGameMode(match.game_mode === 'friend' ? 'quick' : (match.game_mode || 'quick'));
      setQuestionTime(t);

      let qData: any = null;
      for (let attempt = 0; attempt < 2; attempt++) {
        const { data, error: qErr } = await supabase.functions.invoke('brain-duel-get-questions', {
          body: { match_id: match.id, category: match.category } });
        if (!qErr && !data?.error && Array.isArray(data?.questions) && data.questions.length > 0) {
          qData = data;
          break;
        }
        if (attempt === 0) await new Promise((r) => setTimeout(r, 1200));
      }

      if (!qData) {
        toast.error('Questions are temporarily unavailable. Please try again in a moment.');
        setMatchStatus('failed');
        setGamePhase('category');
        return;
      }

      setQuestions(qData.questions);
      setMatchStatus('in_progress');
      setGamePhase('playing');
      setTimeLeft(t);
      setAnswerStartTime(Date.now());
      toast.success('Duel started! Good luck 🎯', { duration: 2000 });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeMatchId, resumeToken, currentUser]);

  const handleAnswer = async (answer: string) => {
    if (selectedAnswer || !matchId || !questions[currentIndex]) return;
    setSelectedAnswer(answer);

    const timeTaken = Math.round((Date.now() - answerStartTime) / 1000);

    try {
      const { data, error } = await supabase.functions.invoke('brain-duel-submit-answer', { body: {
          match_id: matchId,
          question_id: questions[currentIndex].id,
          answer: answer === 'timeout' ? '' : answer,
          time_taken: timeTaken } });
      if (error) throw error;

      setAnswerResult(data);
      setMyScore(data.new_score);
      setOpponentScore(data.opponent_score);
      setGamePhase('answer-reveal');

    } catch (err: any) {
      console.error('Submit answer error:', err);
      toast.error('Failed to submit answer');
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedAnswer(null);
      setAnswerResult(null);
      setHiddenOptions([]);
      setShowHint(false);
      setTimeLeft(questionTime);
      setAnswerStartTime(Date.now());
      setGamePhase('playing');
    } else {
      finishMatch();
    }
  };

  const finishMatch = async () => {
    if (!matchId) return;
    setGamePhase('results');

    try {
      const { data, error } = await supabase.functions.invoke('brain-duel-finish-match', {
        body: { match_id: matchId } });
      if (error) throw error;
      setMatchResult(data);
      setMatchStatus('finished');
      queryClient.invalidateQueries({ queryKey: ['brain-duel-credits'] });
      queryClient.invalidateQueries({ queryKey: ['ai-credits'] });
      queryClient.invalidateQueries({ queryKey: ['brain-duel-overview'] });
    } catch (err: any) {
      console.error('Finish match error:', err);
      setMatchStatus('failed');
      toast.error('Failed to finish match');
    }
  };

  const requestAiAnalysis = async () => {
    if (!matchId) return;
    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke('brain-duel-match-analysis', {
        body: { match_id: matchId } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setAiAnalysis(data.analysis);
      setGamePhase('analysis');
      queryClient.invalidateQueries({ queryKey: ['brain-duel-credits'] });
      queryClient.invalidateQueries({ queryKey: ['ai-credits'] });
      if (data?.analysis_source === 'fallback') {
        toast.warning(data.warning || 'Backup match analysis ready — no credits charged.');
      } else {
        toast.success(`AI Analysis complete! (${data.credits_spent} credits used)`);
      }
    } catch (err: any) {
      console.error('AI analysis error:', err);
      toast.error(err.message || 'Failed to get AI analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const consumePowerup = async (type: string) => {
    const powerup = powerups.find(p => p.powerup_type === type && p.quantity > 0);
    if (!powerup) { toast.error("You don't have this power-up"); return; }

    try {
      if (type === 'fifty_fifty') {
        // Server-side: never expose the correct answer to the browser and
        // works for every signed-in user (question table is admin-only).
        const { data, error } = await (supabase as any).rpc('brain_duel_fifty_fifty', {
          _question_id: questions[currentIndex].id });
        if (error) throw error;
        const wrong = (data as string[] | null) ?? [];
        setHiddenOptions(wrong.slice(0, 2));
      } else if (type === 'extra_time') {
        setTimeLeft(t => Math.min(t + 15, questionTime + 15));
      } else if (type === 'hint') {
        setShowHint(true);
      } else if (type === 'skip') {
        nextQuestion();
      }

      await triggerPowerup({ powerupId: powerup.id, quantity: powerup.quantity });
      toast.success(`Power-up activated! ⚡`);
    } catch (err) {
      toast.error('Failed to use power-up');
    }
  };

  const resetGame = () => {
    setGamePhase('category');
    setMatchId(null);
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswerResult(null);
    setMyScore(0);
    setOpponentScore(0);
    setMatchResult(null);
    setAiAnalysis(null);
    setHiddenOptions([]);
    setShowHint(false);
    setMatchStatus('ready');
  };

  // ===== CATEGORY SELECT =====
  if (gamePhase === 'category') {
    return (
      <Card className="p-4 sm:p-6 backdrop-blur-xl bg-card/80 border-primary/10">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Brain className="h-6 w-6 text-primary" />
          <h2 className="text-xl sm:text-2xl font-bold">Choose Category</h2>
          <Badge variant="outline" className="ml-auto text-xs">{credits} credits</Badge>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {Object.entries(MODE_CONFIG).filter(([id]) => id !== 'mystery').map(([id, cfg]) => (
            <Button
              key={id}
              size="sm"
              variant={gameMode === id ? 'default' : 'outline'}
              className="text-xs"
              onClick={() => setGameMode(id)}
            >
              {cfg.label} · {cfg.entry}
            </Button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          AI generates unique questions each game • {(MODE_CONFIG[gameMode] ?? MODE_CONFIG.quick).entry} credits entry • Winner takes {(MODE_CONFIG[gameMode] ?? MODE_CONFIG.quick).reward}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
          {CATEGORIES.map((cat) => (
            <motion.div key={cat.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => startMatch(cat.id)}
                variant="outline"
                disabled={credits < (MODE_CONFIG[gameMode] ?? MODE_CONFIG.quick).entry || creditsLoading}
                className={`h-auto min-h-[72px] sm:min-h-[80px] py-3 flex-col gap-1.5 px-2 whitespace-normal w-full bg-gradient-to-br ${cat.color} border-border/50 hover:border-primary/30`}
              >

                <span className="text-2xl">{cat.emoji}</span>
                <span className="text-[10px] sm:text-xs font-semibold text-center leading-tight">{cat.id}</span>
              </Button>
            </motion.div>
          ))}
        </div>
      </Card>
    );
  }

  // ===== LOADING =====
  if (gamePhase === 'loading') {
    return (
      <Card className="p-8 text-center backdrop-blur-xl bg-card/80 border-primary/10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 mx-auto mb-4"
        >
          <Brain className="w-16 h-16 text-primary" />
        </motion.div>
        <h2 className="text-2xl font-bold mb-2">Generating Questions...</h2>
        <p className="text-muted-foreground">AI is creating unique {category} questions</p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Bot className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-xs text-muted-foreground">Powered by OpenAI</span>
        </div>
      </Card>
    );
  }

  // ===== PLAYING =====
  if (gamePhase === 'playing' && questions[currentIndex]) {
    const q = questions[currentIndex];
    const timerColor = timeLeft <= 5 ? 'text-destructive' : timeLeft <= 10 ? 'text-yellow-500' : 'text-primary';
    const timerBg = timeLeft <= 5 ? 'bg-destructive/20' : 'bg-primary/10';

    const availablePowerups = [
      { type: 'fifty_fifty', icon: Zap, label: '50/50' },
      { type: 'extra_time', icon: Timer, label: '+Time' },
      { type: 'hint', icon: Lightbulb, label: 'Hint' },
      { type: 'skip', icon: SkipForward, label: 'Skip' },
    ];

    return (
      <div className="space-y-3">
        {/* Score bar */}
        <Card className="p-3 backdrop-blur-xl bg-card/80 border-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className="text-xs text-muted-foreground">You</div>
                <div className="text-xl font-black text-primary">{myScore}</div>
              </div>
              <span className="text-muted-foreground font-bold">VS</span>
              <div className="text-center">
                <div className="text-xs text-muted-foreground flex items-center gap-1"><Bot className="w-3 h-3" />AI</div>
                <div className="text-xl font-black">{opponentScore}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MatchStatusIndicator status={matchStatus} matchId={matchId} />
              <Badge variant="outline" className="text-xs">Q{currentIndex + 1}/{questions.length}</Badge>
              <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${timerBg}`}>
                <Clock className={`w-4 h-4 ${timerColor}`} />
                <span className={`text-lg font-black ${timerColor}`}>{timeLeft}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Power-ups */}
        <div className="flex gap-1.5">
          {availablePowerups.map(p => {
            const qty = powerups.find(up => up.powerup_type === p.type)?.quantity || 0;
            return (
              <Button key={p.type} onClick={() => consumePowerup(p.type)} disabled={qty === 0 || !!selectedAnswer}
                variant="outline" size="sm" className="flex-1 relative text-xs py-1.5 h-auto">
                <p.icon className="w-3.5 h-3.5 mr-1" />
                {p.label}
                {qty > 0 && <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{qty}</span>}
              </Button>
            );
          })}
        </div>

        {/* Question */}
        <Card className="p-4 sm:p-6 backdrop-blur-xl bg-card/80 border-primary/10">
          {q.difficulty && (
            <Badge variant="outline" className="mb-2 text-[10px]">
              {q.difficulty.toUpperCase()}
            </Badge>
          )}
          <h3 className="text-base sm:text-lg font-bold mb-4 leading-snug">{q.question}</h3>

          {showHint && (
            <div className="mb-3 p-2.5 bg-violet-500/10 border border-violet-500/20 rounded-lg text-xs">
              <Lightbulb className="w-3.5 h-3.5 inline mr-1 text-violet-400" />
              Think carefully — the answer relates to a key fact in this category!
            </div>
          )}

          <div className="grid gap-2.5">
            {(['a', 'b', 'c', 'd'] as const).map((opt) => {
              if (hiddenOptions.includes(opt)) {
                return (
                  <div key={opt} className="py-3 px-4 border border-dashed border-muted-foreground/20 rounded-lg opacity-30 text-sm">
                    <span className="font-bold mr-2">{opt.toUpperCase()}.</span> Eliminated
                  </div>
                );
              }
              return (
                <motion.div key={opt} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => handleAnswer(opt)}
                    variant={selectedAnswer === opt ? 'default' : 'outline'}
                    disabled={!!selectedAnswer}
                    className="w-full h-auto py-3 px-4 text-left justify-start text-sm"
                  >
                    <span className="font-bold mr-2">{opt.toUpperCase()}.</span>
                    {q[`option_${opt}` as keyof Question]}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </Card>
        <LiveDuelChat matchId={matchId || undefined} />
      </div>
    );
  }

  // ===== ANSWER REVEAL =====
  if (gamePhase === 'answer-reveal' && answerResult) {
    const q = questions[currentIndex];
    return (
      <Card className="p-4 sm:p-6 backdrop-blur-xl bg-card/80 border-primary/10 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key="result"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            {answerResult.is_correct ? (
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-3" />
            ) : (
              <XCircle className="w-16 h-16 text-destructive mx-auto mb-3" />
            )}
            <h3 className="text-2xl font-black mb-1">
              {answerResult.is_correct ? 'Correct! 🎉' : 'Wrong! 😢'}
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              {answerResult.is_correct
                ? `+${answerResult.points_earned} points!`
                : `The correct answer was ${answerResult.correct_answer.toUpperCase()}: ${q[`option_${answerResult.correct_answer}` as keyof Question]}`
              }
            </p>

            <div className="flex items-center justify-center gap-6 my-4">
              <div className="text-center">
                <div className="text-xs text-muted-foreground">You</div>
                <div className="text-2xl font-black text-primary">{answerResult.new_score}</div>
              </div>
              <span className="text-muted-foreground">vs</span>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">AI Bot</div>
                <div className="text-2xl font-black">{answerResult.opponent_score}</div>
              </div>
            </div>

            <Button onClick={nextQuestion} className="gap-2 mt-2">
              {currentIndex < questions.length - 1 ? (
                <>Next Question <ArrowRight className="w-4 h-4" /></>
              ) : (
                <>See Results <Trophy className="w-4 h-4" /></>
              )}
            </Button>
          </motion.div>
        </AnimatePresence>
      </Card>
    );
  }

  // ===== RESULTS =====
  if (gamePhase === 'results') {
    if (!matchResult) {
      return (
        <Card className="p-8 text-center backdrop-blur-xl bg-card/80 border-primary/10">
          <Loader2 className="w-10 h-10 text-primary mx-auto animate-spin mb-3" />
          <p>Calculating results...</p>
          <div className="mt-3 flex justify-center">
            <MatchStatusIndicator status={matchStatus} matchId={matchId} showHint />
          </div>
        </Card>
      );
    }

    return (
      <Card className="p-6 sm:p-8 text-center backdrop-blur-xl bg-card/80 border-primary/10">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
          <Trophy className={`w-20 h-20 mx-auto mb-4 ${matchResult.is_winner ? 'text-yellow-500' : matchResult.is_draw ? 'text-muted-foreground' : 'text-destructive/50'}`} />
        </motion.div>

        <div className="flex justify-center mb-3">
          <MatchStatusIndicator status={matchStatus} matchId={matchId} showHint />
        </div>

        <h2 className="text-3xl font-black mb-1">
          {matchResult.is_winner ? '🏆 Victory!' : matchResult.is_draw ? '🤝 Draw!' : '😤 Defeat!'}
        </h2>
        
        <div className="text-4xl font-black my-3">
          {myScore} <span className="text-muted-foreground text-2xl">-</span> {opponentScore}
        </div>

        <div className="grid grid-cols-3 gap-3 my-4">
          <div className="p-3 rounded-xl bg-muted/50">
            <div className="text-xs text-muted-foreground">Accuracy</div>
            <div className="text-lg font-black">{matchResult.stats.accuracy}%</div>
          </div>
          <div className="p-3 rounded-xl bg-muted/50">
            <div className="text-xs text-muted-foreground">Correct</div>
            <div className="text-lg font-black">{matchResult.stats.correct_answers}/{matchResult.stats.total_questions}</div>
          </div>
          <div className="p-3 rounded-xl bg-muted/50">
            <div className="text-xs text-muted-foreground">Earned</div>
            <div className="text-lg font-black text-primary">+{matchResult.credits_earned}</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Button onClick={requestAiAnalysis} disabled={isAnalyzing || credits < 5} variant="outline" className="flex-1 gap-2 border-primary/20">
            {isAnalyzing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
            ) : (
              <><BarChart3 className="w-4 h-4" /> AI Analysis (5 credits)</>
            )}
          </Button>
          <Button onClick={resetGame} className="flex-1 gap-2">
            <Sparkles className="w-4 h-4" /> Play Again
          </Button>
        </div>
      </Card>
    );
  }

  // ===== AI ANALYSIS =====
  if (gamePhase === 'analysis' && aiAnalysis) {
    return (
      <div className="space-y-4">
        <Card className="p-5 sm:p-6 backdrop-blur-xl bg-card/80 border-primary/10">
          <div className="flex items-center gap-2 mb-4">
            <Bot className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">AI Match Analysis</h2>
            <Badge variant="outline" className="ml-auto text-[10px]">OpenAI Powered</Badge>
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
            <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
          </div>
        </Card>

        <div className="flex gap-3">
          <Button onClick={() => setGamePhase('results')} variant="outline" className="flex-1">
            Back to Results
          </Button>
          <Button onClick={resetGame} className="flex-1 gap-2">
            <Sparkles className="w-4 h-4" /> Play Again
          </Button>
        </div>
      </div>
    );
  }

  return <LiveDuelChat matchId={matchId || undefined} />;
};
