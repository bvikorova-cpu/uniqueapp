import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Brain, Trophy, Clock, Target } from 'lucide-react';
import { useBrainDuelCredits } from '@/hooks/useBrainDuelCredits';

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
  const [category, setCategory] = useState<string>('');
  const [match, setMatch] = useState<Match | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gamePhase, setGamePhase] = useState<'category' | 'searching' | 'playing' | 'results'>('category');
  const [currentUser, setCurrentUser] = useState<any>(null);

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
        description: error.message || 'Failed to find match',
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
        description: 'Failed to load questions',
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

  const resetGame = () => {
    setMatch(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setGamePhase('category');
    setTimeLeft(15);
  };

  if (gamePhase === 'category') {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Brain className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Choose a Category</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Button
              key={cat}
              onClick={() => findMatch(cat)}
              variant="outline"
              className="h-20 text-lg"
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

        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
          <h3 className="text-xl font-bold mb-6">{currentQuestion.question}</h3>

          <div className="grid gap-3">
            {['a', 'b', 'c', 'd'].map((option) => (
              <Button
                key={option}
                onClick={() => handleAnswer(option)}
                variant={selectedAnswer === option ? 'default' : 'outline'}
                disabled={selectedAnswer !== null}
                className="h-auto py-4 px-6 text-left justify-start"
              >
                <span className="font-bold mr-3">{option.toUpperCase()}.</span>
                {currentQuestion[`option_${option}` as keyof Question]}
              </Button>
            ))}
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
