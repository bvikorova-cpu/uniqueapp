import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Brain, Zap, Timer, Trophy, Sparkles, Shield, Target, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface AIBot {
  id: string;
  name: string;
  avatar: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  description: string;
  accuracy: number;
  speed: number;
  icon: typeof Bot;
  color: string;
  bgGlow: string;
}

const AI_BOTS: AIBot[] = [
  {
    id: 'rookie', name: 'Rookie Bot', avatar: '🤖', difficulty: 'easy',
    description: 'Perfect for beginners. Makes mistakes often and answers slowly.',
    accuracy: 40, speed: 30, icon: Shield, color: 'text-green-400', bgGlow: 'from-green-500/10 to-green-600/5',
  },
  {
    id: 'scholar', name: 'Scholar Bot', avatar: '🧑‍🎓', difficulty: 'medium',
    description: 'A solid opponent. Good accuracy with moderate speed.',
    accuracy: 65, speed: 55, icon: Brain, color: 'text-blue-400', bgGlow: 'from-blue-500/10 to-blue-600/5',
  },
  {
    id: 'mastermind', name: 'Mastermind Bot', avatar: '🧠', difficulty: 'hard',
    description: 'A formidable challenger. High accuracy and quick reflexes.',
    accuracy: 85, speed: 75, icon: Target, color: 'text-purple-400', bgGlow: 'from-purple-500/10 to-purple-600/5',
  },
  {
    id: 'overlord', name: 'Overlord Bot', avatar: '👾', difficulty: 'extreme',
    description: 'Near-perfect AI. Only the best can defeat this opponent.',
    accuracy: 95, speed: 90, icon: Flame, color: 'text-red-400', bgGlow: 'from-red-500/10 to-red-600/5',
  },
];

const CATEGORIES = [
  'Random', 'Geography', 'History', 'Science', 'Film & TV',
  'Sports', 'Music', 'Food', 'Business', 'Art', 'Gaming'
];

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  hard: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  extreme: 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse',
};

export const AIOpponent = () => {
  const [selectedBot, setSelectedBot] = useState<AIBot | null>(null);
  const [category, setCategory] = useState('Random');
  const [questionCount, setQuestionCount] = useState([10]);
  const [timePerQuestion, setTimePerQuestion] = useState([30]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [playerScore, setPlayerScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [gamePhase, setGamePhase] = useState<'setup' | 'playing' | 'results'>('setup');

  const startPractice = () => {
    if (!selectedBot) {
      toast.error('Select an AI opponent first!');
      return;
    }
    setGamePhase('playing');
    setCurrentQuestion(0);
    setPlayerScore(0);
    setBotScore(0);
    setIsPlaying(true);

    // Simulate a match
    simulateMatch();
  };

  const simulateMatch = () => {
    if (!selectedBot) return;
    const total = questionCount[0];
    let pScore = 0;
    let bScore = 0;

    // Simulate each question with delays
    let q = 0;
    const interval = setInterval(() => {
      q++;
      setCurrentQuestion(q);

      // Bot answers based on accuracy
      const botCorrect = Math.random() * 100 < selectedBot.accuracy;
      if (botCorrect) {
        bScore += 10;
        setBotScore(bScore);
      }

      // Player gets a random result (simulated for demo)
      const playerCorrect = Math.random() * 100 < 60;
      if (playerCorrect) {
        pScore += 10;
        setPlayerScore(pScore);
      }

      if (q >= total) {
        clearInterval(interval);
        setTimeout(() => {
          setGamePhase('results');
          setIsPlaying(false);
        }, 500);
      }
    }, 800);
  };

  const resetGame = () => {
    setGamePhase('setup');
    setCurrentQuestion(0);
    setPlayerScore(0);
    setBotScore(0);
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Opponent - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Opponent section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Opponent.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="relative overflow-hidden border-primary/20 backdrop-blur-xl bg-card/80">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-primary/5 to-violet-500/5" />
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/10">
            <Bot className="h-5 w-5 text-cyan-400" />
          </div>
          AI Training Arena
          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 ml-2">
            Practice Mode
          </Badge>
        </CardTitle>
        <CardDescription>Train against AI opponents of varying difficulty — no credits required!</CardDescription>
      </CardHeader>
      <CardContent className="relative space-y-6">
        <AnimatePresence mode="wait">
          {gamePhase === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Bot Selection */}
              <div className="space-y-3">
                <p className="text-sm font-semibold">Choose Your Opponent</p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {AI_BOTS.map((bot) => {
                    const Icon = bot.icon;
                    const isSelected = selectedBot?.id === bot.id;
                    return (
                      <motion.div
                        key={bot.id}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedBot(bot)}
                        className={`rounded-xl border p-3 cursor-pointer transition-all bg-gradient-to-br ${bot.bgGlow} ${
                          isSelected ? 'ring-2 ring-primary border-primary/40' : 'border-border/50 hover:border-primary/30'
                        }`}
                      >
                        <div className="text-center space-y-2">
                          <span className="text-3xl">{bot.avatar}</span>
                          <p className="text-sm font-bold">{bot.name}</p>
                          <Badge className={`text-[10px] ${difficultyColors[bot.difficulty]}`}>
                            {bot.difficulty.toUpperCase()}
                          </Badge>
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-muted-foreground">
                              <span>Accuracy</span>
                              <span>{bot.accuracy}%</span>
                            </div>
                            <div className="h-1 bg-muted/30 rounded-full overflow-hidden">
                              <div className="h-full bg-primary/60 rounded-full" style={{ width: `${bot.accuracy}%` }} />
                            </div>
                            <div className="flex justify-between text-[10px] text-muted-foreground">
                              <span>Speed</span>
                              <span>{bot.speed}%</span>
                            </div>
                            <div className="h-1 bg-muted/30 rounded-full overflow-hidden">
                              <div className="h-full bg-cyan-500/60 rounded-full" style={{ width: `${bot.speed}%` }} />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                {selectedBot && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-muted-foreground text-center italic"
                  >
                    {selectedBot.description}
                  </motion.p>
                )}
              </div>

              {/* Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Questions: {questionCount[0]}</label>
                  <Slider value={questionCount} onValueChange={setQuestionCount} min={5} max={20} step={5} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Time per Question: {timePerQuestion[0]}s</label>
                <Slider value={timePerQuestion} onValueChange={setTimePerQuestion} min={10} max={60} step={5} />
              </div>

              <Button onClick={startPractice} size="lg" className="w-full" disabled={!selectedBot}>
                <Zap className="h-5 w-5 mr-2" />
                Start Practice Match
              </Button>
            </motion.div>
          )}

          {gamePhase === 'playing' && selectedBot && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Question {currentQuestion} of {questionCount[0]}
                </p>
                <Progress value={(currentQuestion / questionCount[0]) * 100} className="h-2" />
              </div>

              <div className="flex items-center justify-between px-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">You</p>
                  <motion.p
                    key={playerScore}
                    initial={{ scale: 1.3 }}
                    animate={{ scale: 1 }}
                    className="text-3xl font-black text-primary"
                  >
                    {playerScore}
                  </motion.p>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <motion.span
                    className="text-4xl"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                  >
                    {selectedBot.avatar}
                  </motion.span>
                  <span className="text-lg font-bold text-muted-foreground">VS</span>
                </div>

                <div className="text-center">
                  <p className="text-xs text-muted-foreground">{selectedBot.name}</p>
                  <motion.p
                    key={botScore}
                    initial={{ scale: 1.3 }}
                    animate={{ scale: 1 }}
                    className="text-3xl font-black text-orange-500"
                  >
                    {botScore}
                  </motion.p>
                </div>
              </div>

              <div className="flex justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Brain className="h-8 w-8 text-primary/40" />
                </motion.div>
              </div>
              <p className="text-center text-sm text-muted-foreground">Simulating match...</p>
            </motion.div>
          )}

          {gamePhase === 'results' && selectedBot && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 text-center"
            >
              <div className="space-y-2">
                <motion.span
                  className="text-5xl inline-block"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  {playerScore > botScore ? '🏆' : playerScore === botScore ? '🤝' : '😤'}
                </motion.span>
                <h3 className="text-2xl font-black">
                  {playerScore > botScore ? 'Victory!' : playerScore === botScore ? 'Draw!' : 'Defeat!'}
                </h3>
                <p className="text-muted-foreground text-sm">
                  vs {selectedBot.name} ({selectedBot.difficulty})
                </p>
              </div>

              <div className="flex items-center justify-center gap-8">
                <div>
                  <p className="text-xs text-muted-foreground">You</p>
                  <p className="text-3xl font-black text-primary">{playerScore}</p>
                </div>
                <span className="text-2xl text-muted-foreground">-</span>
                <div>
                  <p className="text-xs text-muted-foreground">{selectedBot.name}</p>
                  <p className="text-3xl font-black text-orange-500">{botScore}</p>
                </div>
              </div>

              <div className="rounded-xl bg-primary/5 border border-primary/10 p-3">
                <p className="text-xs font-semibold text-primary mb-1">💡 Training Tip</p>
                <p className="text-[11px] text-muted-foreground">
                  {playerScore > botScore
                    ? `Great win! Try challenging ${selectedBot.difficulty === 'extreme' ? 'yourself with speed rounds' : 'a harder bot'} next.`
                    : `Keep practicing! Focus on ${category === 'Random' ? 'specific categories' : category} to improve.`}
                </p>
              </div>

              <div className="flex gap-3">
                <Button onClick={resetGame} variant="outline" className="flex-1">
                  Change Settings
                </Button>
                <Button onClick={startPractice} className="flex-1">
                  <Zap className="h-4 w-4 mr-2" />
                  Rematch
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
    </>
  );
};
