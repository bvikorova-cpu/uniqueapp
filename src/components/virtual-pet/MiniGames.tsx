import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Gamepad2, Trophy, Zap, Star, Target, Clock, Heart } from "lucide-react";
import { toast } from "sonner";

interface MiniGamesProps {
  selectedPetId: string | null;
}

type GameType = 'catch' | 'memory' | 'race' | 'puzzle';

export const MiniGames = ({ selectedPetId }: MiniGamesProps) => {
  const queryClient = useQueryClient();
  const [activeGame, setActiveGame] = useState<GameType | null>(null);
  const [gameScore, setGameScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  
  // Memory game state
  const [memoryCards, setMemoryCards] = useState<number[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedCards, setMatchedCards] = useState<number[]>([]);
  
  // Catch game state
  const [fallingItems, setFallingItems] = useState<Array<{id: number, x: number, y: number}>>([]);
  const [catcherPosition, setCatcherPosition] = useState(50);

  const { data: pet } = useQuery({
    queryKey: ['pet-for-game', selectedPetId],
    queryFn: async () => {
      if (!selectedPetId) return null;
      const { data, error } = await supabase
        .from('pets')
        .select('*, pet_types(*)')
        .eq('id', selectedPetId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!selectedPetId
  });

  const { data: leaderboard } = useQuery({
    queryKey: ['game-leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pet_game_scores')
        .select('*, pets(name), profiles:user_id(full_name)')
        .order('score', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    }
  });

  const saveScoreMutation = useMutation({
    mutationFn: async ({ gameType, score, rewards }: { gameType: string; score: number; rewards: any }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !selectedPetId) throw new Error('Not authenticated or no pet selected');

      // Save game score
      const { error: scoreError } = await supabase
        .from('pet_game_scores')
        .insert([{
          user_id: user.id,
          pet_id: selectedPetId,
          game_type: gameType,
          score,
          rewards
        }]);

      if (scoreError) throw scoreError;

      // Update pet stats
      const { error: petError } = await supabase
        .from('pets')
        .update({
          experience: (pet?.experience || 0) + rewards.xp,
          happiness: Math.min((pet?.happiness || 50) + rewards.happiness, 100),
          energy: Math.max((pet?.energy || 100) - 5, 0)
        })
        .eq('id', selectedPetId);

      if (petError) throw petError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pet-for-game'] });
      queryClient.invalidateQueries({ queryKey: ['game-leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['my-pets'] });
      toast.success(`Game completed! +${gameScore} points`);
    }
  });

  // Memory Game Logic
  const initMemoryGame = () => {
    const cards = [...Array(8)].flatMap((_, i) => [i, i]);
    setMemoryCards(cards.sort(() => Math.random() - 0.5));
    setFlippedCards([]);
    setMatchedCards([]);
    setGameScore(0);
    setTimeLeft(60);
    setGameActive(true);
  };

  const handleCardFlip = (index: number) => {
    if (flippedCards.length === 2 || flippedCards.includes(index) || matchedCards.includes(index)) return;
    
    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (memoryCards[first] === memoryCards[second]) {
        setMatchedCards([...matchedCards, first, second]);
        setFlippedCards([]);
        setGameScore(prev => prev + 10);
        
        if (matchedCards.length + 2 === memoryCards.length) {
          endGame('memory', { xp: 15, happiness: 5 });
        }
      } else {
        setTimeout(() => setFlippedCards([]), 1000);
      }
    }
  };

  // Catch Game Logic
  const initCatchGame = () => {
    setGameScore(0);
    setTimeLeft(30);
    setCatcherPosition(50);
    setFallingItems([]);
    setGameActive(true);
  };

  useEffect(() => {
    if (!gameActive || activeGame !== 'catch') return;

    const spawnInterval = setInterval(() => {
      setFallingItems(prev => [...prev, {
        id: Date.now(),
        x: Math.random() * 80 + 10,
        y: 0
      }]);
    }, 1000);

    const moveInterval = setInterval(() => {
      setFallingItems(prev => 
        prev.map(item => ({ ...item, y: item.y + 5 }))
          .filter(item => {
            if (item.y > 90 && Math.abs(item.x - catcherPosition) < 10) {
              setGameScore(s => s + 1);
              return false;
            }
            return item.y < 100;
          })
      );
    }, 100);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(moveInterval);
    };
  }, [gameActive, activeGame, catcherPosition]);

  // Timer
  useEffect(() => {
    if (!gameActive) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame(activeGame!, {
            xp: Math.floor(gameScore / 2),
            happiness: Math.min(gameScore, 10)
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameActive]);

  const endGame = (gameType: GameType, rewards: { xp: number; happiness: number }) => {
    setGameActive(false);
    saveScoreMutation.mutate({ gameType, score: gameScore, rewards });
    setTimeout(() => setActiveGame(null), 2000);
  };

  const startGame = (gameType: GameType) => {
    if (!pet || pet.energy < 5) {
      toast.error('Your pet is too tired! Let it rest.');
      return;
    }
    
    setActiveGame(gameType);
    
    if (gameType === 'memory') {
      initMemoryGame();
    } else if (gameType === 'catch') {
      initCatchGame();
    }
  };

  const games = [
    {
      id: 'catch' as GameType,
      name: 'Catch the Treats',
      description: 'Help your pet catch falling treats!',
      icon: '🍖',
      rewards: '+10 XP, +5 Happiness',
      energyCost: 5
    },
    {
      id: 'memory' as GameType,
      name: 'Memory Match',
      description: 'Match pairs to train your pet\'s memory',
      icon: '🧠',
      rewards: '+15 XP, +5 Happiness',
      energyCost: 5
    }
  ];

  if (!selectedPetId) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Gamepad2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Select a pet from "My Pets" tab to play games!</p>
      </div>
    );
  }

  // Memory Game Render
  if (activeGame === 'memory') {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => { setActiveGame(null); setGameActive(false); }}>
                ← Back
              </Button>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <span className="font-bold text-xl">{gameScore}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Clock className="h-5 w-5" />
              {timeLeft}s
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
            {memoryCards.map((card, index) => (
              <button
                key={index}
                onClick={() => handleCardFlip(index)}
                disabled={!gameActive}
                className={`aspect-square rounded-lg text-4xl flex items-center justify-center transition-all duration-300 ${
                  flippedCards.includes(index) || matchedCards.includes(index)
                    ? 'bg-primary text-primary-foreground scale-105'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {(flippedCards.includes(index) || matchedCards.includes(index)) ? 
                  ['🐶', '🐱', '🐰', '🐹', '🐨', '🐻', '🦊', '🐼'][card] : '❓'}
              </button>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // Catch Game Render
  if (activeGame === 'catch') {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => { setActiveGame(null); setGameActive(false); }}>
                ← Back
              </Button>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="font-bold text-xl">{gameScore}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Clock className="h-5 w-5" />
              {timeLeft}s
            </div>
          </div>

          <div className="relative h-96 bg-gradient-to-b from-sky-200 to-green-100 rounded-lg overflow-hidden border-4 border-primary">
            {fallingItems.map(item => (
              <div
                key={item.id}
                className="absolute text-4xl transition-all duration-100"
                style={{ left: `${item.x}%`, top: `${item.y}%` }}
              >
                🍖
              </div>
            ))}
            
            <div
              className="absolute bottom-2 text-6xl transition-all duration-100"
              style={{ left: `${catcherPosition}%`, transform: 'translateX(-50%)' }}
            >
              🐕
            </div>

            <div className="absolute bottom-4 left-4 right-4">
              <input
                type="range"
                min="10"
                max="90"
                value={catcherPosition}
                onChange={(e) => setCatcherPosition(Number(e.target.value))}
                className="w-full"
                disabled={!gameActive}
              />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Main Menu
  return (
    <div className="space-y-6">
      {pet && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-4xl">
                {pet.pet_types?.species === 'dog' ? '🐕' :
                 pet.pet_types?.species === 'cat' ? '🐱' :
                 pet.pet_types?.species === 'rabbit' ? '🐰' :
                 pet.pet_types?.species === 'hamster' ? '🐹' :
                 pet.pet_types?.species === 'bird' ? '🐦' :
                 pet.pet_types?.species === 'dragon' ? '🐉' :
                 pet.pet_types?.species === 'phoenix' ? '🔥' :
                 pet.pet_types?.species === 'unicorn' ? '🦄' : '🐾'}
              </div>
              <div>
                <p className="font-semibold">{pet.name}</p>
                <p className="text-sm text-muted-foreground">Level {pet.level}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span className="font-semibold">{pet.energy}/100</span>
            </div>
          </div>
        </Card>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mini Games</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {games.map((game) => (
          <Card key={game.id} className="p-6 space-y-4 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="text-6xl mb-4">{game.icon}</div>
              <h3 className="text-xl font-bold mb-2">{game.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{game.description}</p>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>{game.rewards}</span>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-orange-500">
              <Heart className="h-4 w-4" />
              <span>Costs {game.energyCost} energy</span>
            </div>

            <Button 
              className="w-full gap-2" 
              onClick={() => startGame(game.id)}
              disabled={!pet || pet.energy < game.energyCost}
            >
              <Gamepad2 className="h-4 w-4" />
              Play Game
            </Button>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Leaderboard
        </h3>
        {leaderboard && leaderboard.length > 0 ? (
          <div className="space-y-2">
            {leaderboard.map((entry, index) => (
              <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg w-6">#{index + 1}</span>
                  <div>
                    <p className="font-semibold">{entry.pets?.name || 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground capitalize">{entry.game_type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-bold">{entry.score}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No scores yet. Be the first to play!</p>
        )}
      </Card>
    </div>
  );
};