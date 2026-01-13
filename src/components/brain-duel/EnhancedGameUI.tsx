import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Brain, Trophy, Clock, Target, Zap, Timer, Lightbulb, 
  SkipForward, Sparkles, TrendingUp, Users, Radio
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useBrainDuelPowerups } from '@/hooks/useBrainDuelPowerups';

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
  game_mode: string;
  total_questions: number;
  time_per_question: number;
  entry_cost: number;
  win_reward: number;
}

interface Player {
  id: string;
  full_name: string;
  avatar_url: string;
}

interface EnhancedGameUIProps {
  match: Match;
  questions: Question[];
  currentQuestionIndex: number;
  timeLeft: number;
  myScore: number;
  opponentScore: number;
  currentUser: any;
  opponentProfile?: Player;
  spectatorCount?: number;
  onAnswer: (answer: string) => void;
  onUsePowerup: (type: string) => void;
  selectedAnswer: string | null;
  hiddenOptions: string[];
  showHint: boolean;
  activePowerup: string | null;
  doublePointsActive: boolean;
}

export const EnhancedGameUI = ({
  match,
  questions,
  currentQuestionIndex,
  timeLeft,
  myScore,
  opponentScore,
  currentUser,
  opponentProfile,
  spectatorCount = 0,
  onAnswer,
  onUsePowerup,
  selectedAnswer,
  hiddenOptions,
  showHint,
  activePowerup,
  doublePointsActive,
}: EnhancedGameUIProps) => {
  const { toast } = useToast();
  const { powerups } = useBrainDuelPowerups();
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const timeProgress = (timeLeft / match.time_per_question) * 100;

  const availablePowerups = [
    { type: 'fifty_fifty', icon: Zap, label: '50/50', color: 'text-yellow-500', description: 'Remove 2 wrong answers' },
    { type: 'extra_time', icon: Timer, label: '+Time', color: 'text-blue-500', description: '+15 seconds' },
    { type: 'hint', icon: Lightbulb, label: 'Hint', color: 'text-purple-500', description: 'Get a hint' },
    { type: 'double_points', icon: TrendingUp, label: '2×', color: 'text-green-500', description: 'Double points' },
  ];

  return (
    <div className="space-y-4">
      {/* Top Bar - Scores & Timer */}
      <Card className="p-4 bg-gradient-to-r from-primary/10 via-transparent to-primary/10">
        <div className="flex items-center justify-between">
          {/* My Score */}
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 ring-2 ring-primary">
              <AvatarImage src={currentUser?.user_metadata?.avatar_url} />
              <AvatarFallback>ME</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-muted-foreground">You</p>
              <p className="text-3xl font-bold text-primary">{myScore}</p>
            </div>
          </div>

          {/* Center - Timer & Progress */}
          <div className="flex flex-col items-center gap-2">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              timeLeft <= 5 ? 'bg-destructive/20 animate-pulse' : 'bg-muted'
            }`}>
              <Clock className={`h-5 w-5 ${timeLeft <= 5 ? 'text-destructive' : 'text-muted-foreground'}`} />
              <span className={`text-2xl font-bold ${timeLeft <= 5 ? 'text-destructive' : ''}`}>
                {timeLeft}s
              </span>
            </div>
            <Badge variant="outline" className="text-xs">
              Q {currentQuestionIndex + 1} / {questions.length}
            </Badge>
          </div>

          {/* Opponent Score */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                {opponentProfile?.full_name || 'Opponent'}
              </p>
              <p className="text-3xl font-bold text-orange-500">{opponentScore}</p>
            </div>
            <Avatar className="h-12 w-12 ring-2 ring-orange-500">
              <AvatarImage src={opponentProfile?.avatar_url} />
              <AvatarFallback>OP</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Time Progress Bar */}
        <Progress 
          value={timeProgress} 
          className={`h-1 mt-3 ${timeLeft <= 5 ? 'bg-destructive/20' : ''}`}
        />
      </Card>

      {/* Game Info Bar */}
      <div className="flex items-center justify-between text-sm">
        <Badge variant="secondary" className="gap-1">
          <Brain className="h-3 w-3" />
          {match.category}
        </Badge>
        <Badge variant="outline" className="gap-1">
          {match.game_mode === 'quick' ? '⚡ Quick' : match.game_mode === 'classic' ? '🏆 Classic' : '👑 Championship'}
        </Badge>
        {spectatorCount > 0 && (
          <Badge variant="secondary" className="gap-1">
            <Users className="h-3 w-3" />
            {spectatorCount} watching
          </Badge>
        )}
        {doublePointsActive && (
          <Badge className="bg-green-500 gap-1 animate-pulse">
            <TrendingUp className="h-3 w-3" />
            2× ACTIVE
          </Badge>
        )}
      </div>

      {/* Power-ups Panel */}
      <Card className="p-3 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Power-ups</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {availablePowerups.map((powerup) => {
            const userPowerup = powerups.find(p => p.powerup_type === powerup.type);
            const quantity = userPowerup?.quantity || 0;
            const isActive = activePowerup === powerup.type;
            
            return (
              <Button
                key={powerup.type}
                onClick={() => onUsePowerup(powerup.type)}
                disabled={quantity === 0 || selectedAnswer !== null}
                variant="outline"
                size="sm"
                className={`relative flex flex-col h-auto py-2 transition-all ${
                  isActive ? 'animate-pulse scale-105 bg-primary text-primary-foreground' : ''
                } ${quantity === 0 ? 'opacity-50' : 'hover:scale-105'}`}
                title={powerup.description}
              >
                <powerup.icon className={`h-5 w-5 ${powerup.color}`} />
                <span className="text-[10px] mt-1">{powerup.label}</span>
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {quantity}
                </span>
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Question Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
          <Progress value={progress} className="w-32 h-2" />
        </div>

        <h3 className="text-xl font-bold mb-6">{currentQuestion.question}</h3>

        {showHint && (
          <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg animate-fade-in">
            <div className="flex items-center gap-2 text-purple-500">
              <Lightbulb className="h-4 w-4" />
              <span className="text-sm font-semibold">
                Hint: Look for the most specific or technically accurate answer!
              </span>
            </div>
          </div>
        )}

        <div className="grid gap-3">
          {['a', 'b', 'c', 'd'].map((option) => {
            const isHidden = hiddenOptions.includes(option);
            const optionText = currentQuestion[`option_${option}` as keyof Question];
            
            if (isHidden) {
              return (
                <div
                  key={option}
                  className="h-auto py-4 px-6 border border-dashed border-muted-foreground/30 rounded-md opacity-30 animate-fade-out"
                >
                  <span className="font-bold mr-3 text-lg">{option.toUpperCase()}.</span>
                  <span className="text-muted-foreground line-through">Eliminated</span>
                </div>
              );
            }
            
            return (
              <Button
                key={option}
                onClick={() => onAnswer(option)}
                variant={selectedAnswer === option ? 'default' : 'outline'}
                disabled={selectedAnswer !== null}
                className={`h-auto py-4 px-6 text-left justify-start transition-all ${
                  selectedAnswer === null ? 'hover:scale-[1.02] hover:shadow-md' : ''
                } ${selectedAnswer === option ? 'ring-2 ring-primary' : ''}`}
              >
                <span className="font-bold mr-3 text-lg bg-primary/10 px-2 py-1 rounded">
                  {option.toUpperCase()}
                </span>
                <span className="flex-1">{optionText}</span>
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Bottom Info */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span>Entry: {match.entry_cost} credits</span>
        <span>•</span>
        <span className="text-green-500 font-semibold">Win: +{match.win_reward} credits</span>
      </div>
    </div>
  );
};
