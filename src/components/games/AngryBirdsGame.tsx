import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Star, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LEVELS = [
  { level: 1, name: "First Mission", pigs: 2, birds: 3, structures: 2 },
  { level: 2, name: "Wooden Fortress", pigs: 3, birds: 4, structures: 3 },
  { level: 3, name: "Glass Castle", pigs: 4, birds: 4, structures: 4 },
  { level: 4, name: "Stone Bastion", pigs: 5, birds: 5, structures: 5 },
  { level: 5, name: "Mixed Structure", pigs: 6, birds: 5, structures: 6 },
  { level: 6, name: "Double Tower", pigs: 7, birds: 6, structures: 7 },
  { level: 7, name: "Labyrinth", pigs: 8, birds: 6, structures: 8 },
  { level: 8, name: "High Fortress", pigs: 9, birds: 7, structures: 9 },
  { level: 9, name: "Final Battle", pigs: 10, birds: 7, structures: 10 },
  { level: 10, name: "Kingdom of Pigs", pigs: 12, birds: 8, structures: 12 },
];

interface AngryBirdsGameProps {
  onBack: () => void;
}

export const AngryBirdsGame = ({ onBack }: AngryBirdsGameProps) => {
  const { toast } = useToast();
  const [currentLevel, setCurrentLevel] = useState(0);
  const [pigsLeft, setPigsLeft] = useState(LEVELS[0].pigs);
  const [birdsLeft, setBirdsLeft] = useState(LEVELS[0].birds);
  const [structuresLeft, setStructuresLeft] = useState(LEVELS[0].structures);
  const [power, setPower] = useState(50);
  const [angle, setAngle] = useState(45);

  const levelData = LEVELS[currentLevel];

  const launchBird = () => {
    if (birdsLeft <= 0) {
      toast({
        title: "💥 No birds left!",
        description: "You lost this level!",
        variant: "destructive",
      });
      setTimeout(resetLevel, 1500);
      return;
    }

    setBirdsLeft(birdsLeft - 1);

    // Simulate hit calculation based on power and angle
    const hitChance = (power / 100) * (1 - Math.abs(angle - 45) / 90);
    const hit = Math.random() < hitChance;

    if (hit) {
      const destroyedStructures = Math.floor(Math.random() * 2) + 1;
      const newStructures = Math.max(0, structuresLeft - destroyedStructures);
      setStructuresLeft(newStructures);

      if (newStructures === 0 || Math.random() < 0.4) {
        const destroyedPigs = Math.floor(Math.random() * 2) + 1;
        const newPigs = Math.max(0, pigsLeft - destroyedPigs);
        setPigsLeft(newPigs);

        if (newPigs === 0) {
          toast({
            title: "🎉 Level completed!",
            description: `${levelData.name} - all pigs defeated!`,
          });

          setTimeout(() => {
            if (currentLevel < LEVELS.length - 1) {
              nextLevel();
            } else {
              toast({
                title: "🏆 Winner!",
                description: "You've completed all levels!",
              });
            }
          }, 1500);
        }
      }
    }
  };

  const nextLevel = () => {
    const newLevel = currentLevel + 1;
    setCurrentLevel(newLevel);
    setPigsLeft(LEVELS[newLevel].pigs);
    setBirdsLeft(LEVELS[newLevel].birds);
    setStructuresLeft(LEVELS[newLevel].structures);
    setPower(50);
    setAngle(45);
  };

  const resetLevel = () => {
    setPigsLeft(levelData.pigs);
    setBirdsLeft(levelData.birds);
    setStructuresLeft(levelData.structures);
    setPower(50);
    setAngle(45);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-600 pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={resetLevel} variant="secondary">
            Restart
          </Button>
        </div>

        <Card className="p-6 mb-6 bg-white/95 backdrop-blur">
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Level</div>
              <div className="text-2xl font-bold flex items-center justify-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                {levelData.level}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Birds</div>
              <div className="text-2xl font-bold text-red-500">{birdsLeft}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Pigs</div>
              <div className="text-2xl font-bold text-green-600">{pigsLeft}</div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-xl font-bold text-center mb-4">{levelData.name}</h3>

            <div className="relative h-64 bg-gradient-to-b from-sky-200 to-green-200 rounded-lg mb-6 overflow-hidden">
              {/* Slingshot */}
              <div className="absolute bottom-4 left-8 text-6xl">
                🎯
              </div>

              {/* Structures */}
              <div className="absolute right-12 bottom-4 flex gap-2">
                {Array.from({ length: structuresLeft }).map((_, i) => (
                  <div key={i} className="text-4xl" style={{ marginTop: `${i * -20}px` }}>
                    🧱
                  </div>
                ))}
              </div>

              {/* Pigs */}
              <div className="absolute right-8 bottom-8 flex flex-wrap gap-2 max-w-[200px]">
                {Array.from({ length: pigsLeft }).map((_, i) => (
                  <div key={i} className="text-5xl animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>
                    🐷
                  </div>
                ))}
              </div>

              {/* Birds available */}
              <div className="absolute top-4 left-4 flex gap-2">
                {Array.from({ length: birdsLeft }).map((_, i) => (
                  <div key={i} className="text-3xl">
                    🐦
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 mb-4">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">Power: {power}%</label>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={power}
                  onChange={(e) => setPower(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">Angle: {angle}°</label>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  value={angle}
                  onChange={(e) => setAngle(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            <Button 
              onClick={launchBird}
              className="w-full bg-red-600 hover:bg-red-700 text-white text-lg py-6"
              disabled={birdsLeft <= 0}
            >
              🎯 Launch bird!
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
