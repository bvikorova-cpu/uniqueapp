import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Trophy, Zap, Star, Target, Clock, Heart } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface MiniGamesProps { selectedPetId: string | null; }
type GameType = 'catch' | 'memory';

export const MiniGames = ({ selectedPetId }: MiniGamesProps) => {
  const queryClient = useQueryClient();
  const [activeGame, setActiveGame] = useState<GameType | null>(null);
  const [gameScore, setGameScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [memoryCards, setMemoryCards] = useState<number[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedCards, setMatchedCards] = useState<number[]>([]);
  const [fallingItems, setFallingItems] = useState<Array<{id: number, x: number, y: number}>>([]);
  const [catcherPosition, setCatcherPosition] = useState(50);

  const { data: pet } = useQuery({
    queryKey: ['pet-for-game', selectedPetId],
    queryFn: async () => {
      if (!selectedPetId) return null;
      const { data, error } = await supabase.from('pets').select('*, pet_types(*)').eq('id', selectedPetId).single();
      if (error) throw error;
      return data;
    },
    enabled: !!selectedPetId
  });

  const { data: leaderboard } = useQuery({
    queryKey: ['game-leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase.from('pet_game_scores').select('*, pets(name)').order('score', { ascending: false }).limit(10);
      if (error) throw error;
      return data;
    }
  });

  const saveScoreMutation = useMutation({
    mutationFn: async ({ gameType, score, rewards }: { gameType: string; score: number; rewards: any }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !selectedPetId) throw new Error('Not authenticated');
      await supabase.from('pet_game_scores').insert([{ user_id: user.id, pet_id: selectedPetId, game_type: gameType, score, rewards }]);
      await supabase.from('pets').update({
        experience: (pet?.experience || 0) + rewards.xp,
        happiness: Math.min((pet?.happiness || 50) + rewards.happiness, 100),
        energy: Math.max((pet?.energy || 100) - 5, 0)
      }).eq('id', selectedPetId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pet-for-game'] });
      queryClient.invalidateQueries({ queryKey: ['game-leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['my-pets'] });
      toast.success(`Game completed! +${gameScore} points 🎮`);
    }
  });

  const initMemoryGame = () => {
    const cards = [...Array(8)].flatMap((_, i) => [i, i]);
    setMemoryCards(cards.sort(() => Math.random() - 0.5));
    setFlippedCards([]); setMatchedCards([]); setGameScore(0); setTimeLeft(60); setGameActive(true);
  };

  const handleCardFlip = (index: number) => {
    if (flippedCards.length === 2 || flippedCards.includes(index) || matchedCards.includes(index)) return;
    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);
    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (memoryCards[first] === memoryCards[second]) {
        setMatchedCards([...matchedCards, first, second]); setFlippedCards([]); setGameScore(prev => prev + 10);
        if (matchedCards.length + 2 === memoryCards.length) endGame('memory', { xp: 15, happiness: 5 });
      } else setTimeout(() => setFlippedCards([]), 1000);
    }
  };

  const initCatchGame = () => { setGameScore(0); setTimeLeft(30); setCatcherPosition(50); setFallingItems([]); setGameActive(true); };

  useEffect(() => {
    if (!gameActive || activeGame !== 'catch') return;
    const spawnInterval = setInterval(() => {
      setFallingItems(prev => [...prev, { id: Date.now(), x: Math.random() * 80 + 10, y: 0 }]);
    }, 1000);
    const moveInterval = setInterval(() => {
      setFallingItems(prev => prev.map(item => ({ ...item, y: item.y + 5 })).filter(item => {
        if (item.y > 90 && Math.abs(item.x - catcherPosition) < 10) { setGameScore(s => s + 1); return false; }
        return item.y < 100;
      }));
    }, 100);
    return () => { clearInterval(spawnInterval); clearInterval(moveInterval); };
  }, [gameActive, activeGame, catcherPosition]);

  useEffect(() => {
    if (!gameActive) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { endGame(activeGame!, { xp: Math.floor(gameScore / 2), happiness: Math.min(gameScore, 10) }); return 0; }
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
    if (!pet || pet.energy < 5) return toast.error('Your pet is too tired! Let it rest.');
    setActiveGame(gameType);
    if (gameType === 'memory') initMemoryGame();
    else if (gameType === 'catch') initCatchGame();
  };

  const games = [
    { id: 'catch' as GameType, name: 'Catch the Treats', description: 'Help your pet catch falling treats!', icon: '🍖', rewards: '+10 XP, +5 Happiness', energyCost: 5 },
    { id: 'memory' as GameType, name: 'Memory Match', description: "Match pairs to train your pet's memory", icon: '🧠', rewards: '+15 XP, +5 Happiness', energyCost: 5 },
  ];

  if (!selectedPetId) {
    return (
      <>
        <FloatingHowItWorks title="How Mini Games works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
          <Gamepad2 className="h-8 w-8 text-cyan-500" />
        </div>
        <h3 className="text-lg font-black mb-2">No Pet Selected</h3>
        <p className="text-sm text-muted-foreground">Select a pet from "My Pets" to play games!</p>
      </motion.div>
      </>
      );
  }

  if (activeGame === 'memory') {
    return (
      <Card className="border-border/40 bg-card/80 backdrop-blur-xl">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => { setActiveGame(null); setGameActive(false); }}>← Back</Button>
              <Badge variant="outline" className="gap-1"><Target className="h-3 w-3" />{gameScore}</Badge>
            </div>
            <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />{timeLeft}s</Badge>
          </div>
          <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
            {memoryCards.map((card, index) => (
              <motion.button key={index} onClick={() => handleCardFlip(index)} disabled={!gameActive}
                whileTap={{ scale: 0.95 }}
                className={`aspect-square rounded-xl text-2xl flex items-center justify-center transition-all ${
                  flippedCards.includes(index) || matchedCards.includes(index) ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                }`}>
                {(flippedCards.includes(index) || matchedCards.includes(index)) ? ['🐶','🐱','🐰','🐹','🐨','🐻','🦊','🐼'][card] : '❓'}
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeGame === 'catch') {
    return (
      <Card className="border-border/40 bg-card/80 backdrop-blur-xl">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => { setActiveGame(null); setGameActive(false); }}>← Back</Button>
              <Badge variant="outline" className="gap-1"><Star className="h-3 w-3 text-amber-500" />{gameScore}</Badge>
            </div>
            <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />{timeLeft}s</Badge>
          </div>
          <div className="relative h-80 bg-gradient-to-b from-sky-200/50 to-emerald-100/50 rounded-xl overflow-hidden border-2 border-primary/20">
            {fallingItems.map(item => (
              <div key={item.id} className="absolute text-3xl transition-all duration-100" style={{ left: `${item.x}%`, top: `${item.y}%` }}>🍖</div>
            ))}
            <div className="absolute bottom-2 text-5xl transition-all duration-100" style={{ left: `${catcherPosition}%`, transform: 'translateX(-50%)' }}>🐕</div>
            <div className="absolute bottom-3 left-3 right-3">
              <input type="range" min="10" max="90" value={catcherPosition} onChange={(e) => setCatcherPosition(Number(e.target.value))} className="w-full" disabled={!gameActive} />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Pet Status */}
      {pet && (
        <Card className="border-border/40 bg-card/80 backdrop-blur-xl">
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">
                {pet.pet_types?.species === 'dog' ? '🐕' : pet.pet_types?.species === 'cat' ? '🐱' :
                 pet.pet_types?.species === 'rabbit' ? '🐰' : pet.pet_types?.species === 'dragon' ? '🐉' :
                 pet.pet_types?.species === 'unicorn' ? '🦄' : pet.pet_types?.species === 'phoenix' ? '🔥' : '🐾'}
              </div>
              <div>
                <p className="font-black text-sm">{pet.name}</p>
                <p className="text-[10px] text-muted-foreground">Level {pet.level}</p>
              </div>
            </div>
            <Badge variant="outline" className="gap-1"><Zap className="h-3 w-3 text-amber-500" />{pet.energy}/100</Badge>
          </CardContent>
        </Card>
      )}

      <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Mini Games</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {games.map((game, i) => (
          <motion.div key={game.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
            <Card className="border-border/40 bg-card/80 backdrop-blur-xl hover:border-primary/30 transition-all">
              <CardContent className="p-5 text-center space-y-3">
                <div className="text-5xl mb-2">{game.icon}</div>
                <h3 className="text-base font-black">{game.name}</h3>
                <p className="text-xs text-muted-foreground">{game.description}</p>
                <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
                  <Zap className="h-3 w-3 text-amber-500" />{game.rewards}
                </div>
                <div className="flex items-center justify-center gap-1 text-[10px] text-orange-500">
                  <Heart className="h-3 w-3" />Costs {game.energyCost} energy
                </div>
                <Button className="w-full gap-2 active:scale-[0.97]" onClick={() => startGame(game.id)}
                  disabled={!pet || pet.energy < game.energyCost}>
                  <Gamepad2 className="h-4 w-4" />Play Game
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Leaderboard */}
      <Card className="border-border/40 bg-card/80 backdrop-blur-xl">
        <CardContent className="p-4">
          <h3 className="font-black text-sm mb-3 flex items-center gap-2"><Trophy className="h-4 w-4 text-amber-500" />Leaderboard</h3>
          {leaderboard && leaderboard.length > 0 ? (
            <div className="space-y-1.5">
              {leaderboard.map((entry, index) => (
                <div key={entry.id} className="flex items-center justify-between p-2 rounded-lg bg-background/30">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm w-6">#{index + 1}</span>
                    <div>
                      <p className="font-bold text-xs">{entry.pets?.name || 'Unknown'}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">{entry.game_type}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="gap-1"><Star className="h-3 w-3 text-amber-500" />{entry.score}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">No scores yet. Be the first to play!</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
