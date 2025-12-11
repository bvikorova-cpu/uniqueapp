import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Brain, Trophy, Clock, Target, Zap, Timer, Lightbulb, SkipForward, Sparkles } from 'lucide-react';
import { useBrainDuelCredits } from '@/hooks/useBrainDuelCredits';
import { useBrainDuelPowerups } from '@/hooks/useBrainDuelPowerups';
import { getUserFriendlyErrorMessage } from '@/utils/errorHandler';

interface Question {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
}

interface Match {
  id: string;
  status: string;
  category: string;
  player1_id: string;
  player2_id: string;
  player1_score: number;
  player2_score: number;
  winner_id: string | null;
}

export const BrainDuelGame = () => {
  const { toast } = useToast();
  const { credits } = useBrainDuelCredits();
  const { powerups, usePowerup: usePowerupHook } = useBrainDuelPowerups();
  const [category, setCategory] = useState<string>('');
  const [match, setMatch] = useState<Match | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gamePhase, setGamePhase] = useState<'category' | 'searching' | 'playing' | 'results'>('category');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [hiddenOptions, setHiddenOptions] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [activePowerup, setActivePowerup] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUser(user));
  }, []);

  const categories = [
    'General Knowledge',
    'Science',
    'History',
    'Geography',
    'Sports',
    'Entertainment',
    'Technology',
    'Mathematics',
    'Literature',
    'Music'
  ];

  // Timer for questions
  useEffect(() => {
    if (gamePhase === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gamePhase === 'playing') {
      handleAnswer('');
    }
  }, [timeLeft, gamePhase]);

  // Listen for match updates
  useEffect(() => {
    if (!match) return;

    const channel = supabase
      .channel(`match-${match.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'brain_duel_matches',
          filter: `id=eq.${match.id}`,
        },
        (payload) => {
          setMatch(payload.new as Match);
          
          if (payload.new.status === 'ready' && gamePhase === 'searching') {
            startGame();
          } else if (payload.new.status === 'finished') {
            setGamePhase('results');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [match?.id, gamePhase]);

  const findMatch = async (selectedCategory: string) => {
    if (credits < 10) {
      toast({
        title: 'Insufficient Credits',
        description: 'You need 10 credits to play. Purchase more credits to continue.',
        variant: 'destructive',
      });
      return;
    }

    setCategory(selectedCategory);
    setIsSearching(true);
    setGamePhase('searching');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('brain-duel-matchmaking', {
        body: { category: selectedCategory },
      });

      if (error) throw error;
      
      setMatch(data.match);

      if (data.match.status === 'ready') {
        startGame();
      }
    } catch (error: any) {
      console.error('Matchmaking error:', error);
      toast({
        title: 'Error',
        description: getUserFriendlyErrorMessage(error, 'Failed to find match'),
        variant: 'destructive',
      });
      setGamePhase('category');
      setIsSearching(false);
    }
  };

  const startGame = async () => {
    if (!match) return;

    try {
      const { data, error } = await supabase.functions.invoke('brain-duel-get-questions', {
        body: { match_id: match.id, category },
      });

      if (error) throw error;

      setQuestions(data.questions);
      setGamePhase('playing');
      setTimeLeft(15);
    } catch (error: any) {
      console.error('Error getting questions:', error);
      toast({
        title: 'Error',
        description: getUserFriendlyErrorMessage(error, 'Failed to load questions'),
        variant: 'destructive',
      });
    }
  };

  const handleAnswer = async (answer: string) => {
    if (!match || !questions[currentQuestionIndex]) return;

    setSelectedAnswer(answer);

    try {
      const { data, error } = await supabase.functions.invoke('brain-duel-submit-answer', {
        body: {
          match_id: match.id,
          question_id: questions[currentQuestionIndex].id,
          answer: answer || 'timeout',
        },
      });

      if (error) throw error;

      // Update local match state
      const { data: { user } } = await supabase.auth.getUser();
      const isPlayer1 = match.player1_id === user?.id;
      
      setMatch({
        ...match,
        [isPlayer1 ? 'player1_score' : 'player2_score']: data.new_score,
      });

      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setSelectedAnswer(null);
          setTimeLeft(15);
          setHiddenOptions([]);
          setShowHint(false);
        } else {
          finishMatch();
        }
      }, 1500);

    } catch (error: any) {
      console.error('Error submitting answer:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit answer',
        variant: 'destructive',
      });
    }
  };

  const finishMatch = async () => {
    if (!match) return;

    try {
      await supabase.functions.invoke('brain-duel-finish-match', {
        body: { match_id: match.id },
      });
    } catch (error) {
      console.error('Error finishing match:', error);
    }
  };

  const usePowerup = async (powerupType: string) => {
    const powerup = powerups.find(p => p.powerup_type === powerupType && p.quantity > 0);
    if (!powerup) {
      toast({
        title: 'Power-up not available',
        description: 'You don\'t have this power-up',
        variant: 'destructive',
      });
      return;
    }

    setActivePowerup(powerupType);
    
    try {
      switch (powerupType) {
        case 'fifty_fifty':
          // Remove 2 wrong answers
          const correctAnswer = await getCorrectAnswer();
          const allOptions = ['a', 'b', 'c', 'd'];
          const wrongOptions = allOptions.filter(opt => opt !== correctAnswer);
          const toHide = wrongOptions.slice(0, 2);
          setHiddenOptions(toHide);
          break;
          
        case 'extra_time':
          // Add 10 seconds
          setTimeLeft(prev => Math.min(prev + 10, 30));
          break;
          
        case 'hint':
          // Show hint
          setShowHint(true);
          break;
          
        case 'skip':
          // Skip to next question
          if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
            setTimeLeft(15);
            setHiddenOptions([]);
            setShowHint(false);
          }
          break;
      }

      // Deduct powerup from user's inventory using the hook
      await usePowerupHook({ powerupId: powerup.id, quantity: powerup.quantity });

      toast({
        title: 'Power-up activated! ⚡',
        description: getPowerupDescription(powerupType),
      });

      // Reset active powerup animation after 1 second
      setTimeout(() => setActivePowerup(null), 1000);
    } catch (error) {
      console.error('Error using powerup:', error);
      toast({
        title: 'Error',
        description: 'Failed to activate power-up',
        variant: 'destructive',
      });
    }
  };

  const getCorrectAnswer = async (): Promise<string> => {
    const { data } = await supabase
      .from('brain_duel_questions')
      .select('correct_answer')
      .eq('id', questions[currentQuestionIndex].id)
      .single();
    return data?.correct_answer || 'a';
  };

  const getPowerupDescription = (type: string): string => {
    switch (type) {
      case 'fifty_fifty':
        return '2 wrong answers removed!';
      case 'extra_time':
        return '+10 seconds added!';
      case 'hint':
        return 'Hint revealed!';
      case 'skip':
        return 'Question skipped!';
      default:
        return 'Power-up activated!';
    }
  };

  const resetGame = () => {
    setMatch(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setGamePhase('category');
    setTimeLeft(15);
    setHiddenOptions([]);
    setShowHint(false);
  };

  if (gamePhase === 'category') {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Brain className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Choose a Category</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Button
              key={cat}
              onClick={() => findMatch(cat)}
              variant="outline"
              className="h-auto min-h-[72px] sm:h-24 text-sm sm:text-lg p-3 sm:p-4 whitespace-normal text-center leading-tight"
            >
              {cat}
            </Button>
          ))}
        </div>
      </Card>
    );
  }

  if (gamePhase === 'searching') {
    return (
      <Card className="p-8 text-center">
        <Brain className="h-16 w-16 text-primary mx-auto mb-4 animate-pulse" />
        <h2 className="text-2xl font-bold mb-2">Finding Opponent...</h2>
        <p className="text-muted-foreground">Category: {category}</p>
      </Card>
    );
  }

  if (gamePhase === 'playing' && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    const isPlayer1 = match?.player1_id === currentUser?.id;
    const myScore = isPlayer1 ? match?.player1_score : match?.player2_score;
    const opponentScore = isPlayer1 ? match?.player2_score : match?.player1_score;

    const availablePowerups = [
      { type: 'fifty_fifty', icon: Zap, label: '50/50', color: 'text-yellow-500' },
      { type: 'extra_time', icon: Timer, label: '+Time', color: 'text-blue-500' },
      { type: 'hint', icon: Lightbulb, label: 'Hint', color: 'text-purple-500' },
      { type: 'skip', icon: SkipForward, label: 'Skip', color: 'text-green-500' },
    ];

    return (
      <div className="space-y-4">
        <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <span className="font-bold text-lg">{myScore}</span>
              </div>
              <span className="text-muted-foreground">vs</span>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="font-bold text-lg">{opponentScore}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-destructive" />
              <span className="text-2xl font-bold">{timeLeft}s</span>
            </div>
          </div>
        </Card>

        {/* Power-ups Panel */}
        <Card className="p-3 bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Power-ups</span>
          </div>
          <div className="flex gap-2">
            {availablePowerups.map((powerup) => {
              const userPowerup = powerups.find(p => p.powerup_type === powerup.type);
              const quantity = userPowerup?.quantity || 0;
              const isActive = activePowerup === powerup.type;
              
              return (
                <Button
                  key={powerup.type}
                  onClick={() => usePowerup(powerup.type)}
                  disabled={quantity === 0 || selectedAnswer !== null}
                  variant="outline"
                  size="sm"
                  className={`relative flex-1 transition-all ${
                    isActive ? 'animate-pulse scale-110 bg-primary text-primary-foreground' : ''
                  } ${quantity === 0 ? 'opacity-50' : 'hover-scale'}`}
                >
                  <powerup.icon className={`h-4 w-4 mr-1 ${powerup.color}`} />
                  <span className="text-xs">{powerup.label}</span>
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {quantity}
                  </span>
                </Button>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
          <h3 className="text-xl font-bold mb-6">{currentQuestion.question}</h3>

          {showHint && (
            <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg animate-fade-in">
              <div className="flex items-center gap-2 text-purple-500">
                <Lightbulb className="h-4 w-4" />
                <span className="text-sm font-semibold">Hint: The correct answer starts with the first letter of the correct option!</span>
              </div>
            </div>
          )}

          <div className="grid gap-3">
            {['a', 'b', 'c', 'd'].map((option) => {
              const isHidden = hiddenOptions.includes(option);
              
              if (isHidden) {
                return (
                  <div
                    key={option}
                    className="h-auto py-4 px-6 border border-dashed border-muted-foreground/30 rounded-md opacity-30 animate-fade-out"
                  >
                    <span className="font-bold mr-3">{option.toUpperCase()}.</span>
                    <span className="text-muted-foreground">Eliminated</span>
                  </div>
                );
              }
              
              return (
                <Button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  variant={selectedAnswer === option ? 'default' : 'outline'}
                  disabled={selectedAnswer !== null}
                  className="h-auto py-4 px-6 text-left justify-start hover-scale transition-all"
                >
                  <span className="font-bold mr-3">{option.toUpperCase()}.</span>
                  {currentQuestion[`option_${option}` as keyof Question]}
                </Button>
              );
            })}
          </div>
        </Card>
      </div>
    );
  }

  if (gamePhase === 'results' && match) {
    const isWinner = match.winner_id === currentUser?.id;
    const isDraw = match.winner_id === null;

    return (
      <Card className="p-8 text-center">
        <Trophy className={`h-20 w-20 mx-auto mb-4 ${isWinner ? 'text-yellow-500' : 'text-muted-foreground'}`} />
        
        <h2 className="text-3xl font-bold mb-2">
          {isDraw ? 'Draw!' : isWinner ? 'Victory!' : 'Defeat'}
        </h2>
        
        <div className="text-4xl font-bold mb-6">
          {match.player1_score} - {match.player2_score}
        </div>

        {isWinner && (
          <p className="text-green-500 font-semibold mb-4">
            You earned 20 credits! 🎉
          </p>
        )}

        <Button onClick={resetGame} size="lg">
          Play Again
        </Button>
      </Card>
    );
  }

  return null;
};
