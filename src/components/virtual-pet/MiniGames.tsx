import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gamepad2, Trophy, Zap } from "lucide-react";

interface MiniGamesProps {
  selectedPetId: string | null;
}

export const MiniGames = ({ selectedPetId }: MiniGamesProps) => {
  const [score, setScore] = useState(0);

  const games = [
    {
      id: 'catch',
      name: 'Catch the Treats',
      description: 'Help your pet catch falling treats!',
      icon: '🍖',
      rewards: '+10 XP, +5 Happiness'
    },
    {
      id: 'memory',
      name: 'Memory Match',
      description: 'Match pairs to train your pet\'s memory',
      icon: '🧠',
      rewards: '+8 XP, +3 Happiness'
    },
    {
      id: 'race',
      name: 'Speed Race',
      description: 'Race against time and other pets!',
      icon: '🏃',
      rewards: '+12 XP, +6 Happiness'
    },
    {
      id: 'puzzle',
      name: 'Puzzle Master',
      description: 'Solve puzzles to level up faster',
      icon: '🧩',
      rewards: '+15 XP, +4 Happiness'
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mini Games</h2>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span className="font-semibold">High Score: {score}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {games.map((game) => (
          <Card key={game.id} className="p-6 space-y-4">
            <div className="text-center">
              <div className="text-6xl mb-4">{game.icon}</div>
              <h3 className="text-xl font-bold mb-2">{game.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{game.description}</p>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>{game.rewards}</span>
            </div>

            <Button className="w-full gap-2" variant="outline">
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
        <p className="text-sm text-muted-foreground">Coming soon! Compete with other players globally.</p>
      </Card>
    </div>
  );
};