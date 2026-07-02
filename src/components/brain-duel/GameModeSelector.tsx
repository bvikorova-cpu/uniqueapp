import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Trophy, Crown, Clock, Users, Brain } from 'lucide-react';
import { useBrainDuelCredits } from '@/hooks/useBrainDuelCredits';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export interface GameMode {
  id: string;
  name: string;
  duration: string;
  questions: number;
  timePerQuestion: number;
  entry: number;
  reward: number;
  icon: typeof Zap;
  color: string;
  featured?: boolean;
}

const gameModes: GameMode[] = [
  {
    id: "quick",
    name: "Quick Duel",
    duration: "5 min",
    questions: 10,
    timePerQuestion: 30,
    entry: 10,
    reward: 20,
    icon: Zap,
    color: "text-yellow-500"
  },
  {
    id: "classic",
    name: "Classic Battle",
    duration: "10 min",
    questions: 20,
    timePerQuestion: 30,
    entry: 20,
    reward: 50,
    icon: Trophy,
    color: "text-blue-500"
  },
  {
    id: "championship",
    name: "Championship",
    duration: "20 min",
    questions: 50,
    timePerQuestion: 24,
    entry: 50,
    reward: 150,
    icon: Crown,
    color: "text-purple-500",
    featured: true
  }
];

interface GameModeSelectorProps {
  onSelectMode?: (mode: GameMode) => void;
  isSearching?: boolean;
}

export const GameModeSelector = ({ onSelectMode, isSearching = false }: GameModeSelectorProps) => {
  const { credits } = useBrainDuelCredits();
  const { toast } = useToast();
  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  const handleSelectMode = (mode: GameMode) => {
    if (credits < mode.entry) {
      toast({
        title: 'Insufficient Credits',
        description: `You need ${mode.entry} credits for ${mode.name}. You have ${credits}.`,
        variant: 'destructive',
      });
      return;
    }
    setSelectedMode(mode.id);
    onSelectMode?.(mode);
  };

  return (
    <>
      <FloatingHowItWorks title={"Game Mode Selector - How it works"} steps={[{ title: 'Open', desc: 'Access the Game Mode Selector section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Game Mode Selector.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Brain className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Select Game Mode</h3>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4">
        {gameModes.map((mode, i) => {
          const Icon = mode.icon;
          const canAfford = credits >= mode.entry;
          
          return (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card 
                className={`relative backdrop-blur-xl bg-card/80 hover:shadow-lg transition-all cursor-pointer ${
                  mode.featured ? 'border-primary/50 ring-2 ring-primary/20' : 'border-primary/10'
                } ${selectedMode === mode.id ? 'ring-2 ring-primary shadow-primary/10' : ''} ${
                  !canAfford ? 'opacity-60' : ''
                }`}
                onClick={() => !isSearching && handleSelectMode(mode)}
              >
                {mode.featured && (
                  <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground shadow-md">
                    POPULAR
                  </Badge>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Icon className={`h-5 w-5 ${mode.color}`} />
                    {mode.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    {mode.duration} • {mode.questions} questions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time/question:</span>
                      <span className="font-medium">{mode.timePerQuestion}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Entry cost:</span>
                      <Badge variant={canAfford ? "default" : "destructive"} className="font-bold">
                        {mode.entry} credits
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Win reward:</span>
                      <Badge variant="outline" className="font-bold text-green-500 border-green-500/30">
                        +{mode.reward} credits
                      </Badge>
                    </div>
                  </div>
                  <Button 
                    className="w-full"
                    disabled={isSearching || !canAfford}
                    variant={selectedMode === mode.id ? "default" : "outline"}
                  >
                    {isSearching && selectedMode === mode.id ? (
                      <span className="flex items-center gap-2">
                        <Users className="h-4 w-4 animate-pulse" />
                        Finding opponent...
                      </span>
                    ) : (
                      'Select Mode'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
    </>
  );
};

export { gameModes };