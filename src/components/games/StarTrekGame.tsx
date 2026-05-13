import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Star, Trophy, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MISSIONS = [
  { level: 1, name: "First Contact", enemies: 3, shields: 100 },
  { level: 2, name: "Ship Rescue", enemies: 5, shields: 90 },
  { level: 3, name: "Planet Exploration", enemies: 7, shields: 80 },
  { level: 4, name: "Diplomatic Mission", enemies: 9, shields: 70 },
  { level: 5, name: "Obrana stanice", enemies: 12, shields: 60 },
  { level: 6, name: "Temporal Paradox", enemies: 15, shields: 50 },
  { level: 7, name: "Borg Attack", enemies: 18, shields: 40 },
  { level: 8, name: "Warp Anomaly", enemies: 22, shields: 30 },
  { level: 9, name: "Final Battle", enemies: 25, shields: 20 },
  { level: 10, name: "Federation Triumphs", enemies: 30, shields: 10 },
];

interface StarTrekGameProps {
  onBack: () => void;
}

export const StarTrekGame = ({ onBack }: StarTrekGameProps) => {
  const { toast } = useToast();
  const [currentLevel, setCurrentLevel] = useState(0);
  const [shields, setShields] = useState(MISSIONS[0].shields);
  const [enemiesDestroyed, setEnemiesDestroyed] = useState(0);
  const [photonTorpedoes, setPhotonTorpedoes] = useState(10);

  const mission = MISSIONS[currentLevel];

  const fireWeapon = () => {
    if (photonTorpedoes <= 0) {
      toast({
        title: "⚠️ No torpedoes!",
        description: "Recharging weapons...",
      });
      setTimeout(() => setPhotonTorpedoes(5), 2000);
      return;
    }

    setPhotonTorpedoes(photonTorpedoes - 1);
    
    const hit = Math.random() > 0.3;
    if (hit) {
      const newDestroyed = enemiesDestroyed + 1;
      setEnemiesDestroyed(newDestroyed);

      if (newDestroyed >= mission.enemies) {
        toast({
          title: "🚀 Mission successful!",
          description: `${mission.name} completed!`,
        });

        setTimeout(() => {
          if (currentLevel < MISSIONS.length - 1) {
            nextLevel();
          } else {
            toast({
              title: "🏆 Hero of the Federation!",
              description: "You have completed all missions!",
            });
          }
        }, 1500);
      }
    } else {
      const damage = Math.floor(Math.random() * 15) + 5;
      const newShields = Math.max(0, shields - damage);
      setShields(newShields);
      
      if (newShields <= 0) {
        toast({
          title: "💥 Ship Destroyed!",
          description: "Try again!",
          variant: "destructive",
        });
        setTimeout(resetLevel, 1500);
      }
    }
  };

  const nextLevel = () => {
    const newLevel = currentLevel + 1;
    setCurrentLevel(newLevel);
    setShields(MISSIONS[newLevel].shields);
    setEnemiesDestroyed(0);
    setPhotonTorpedoes(10);
  };

  const resetLevel = () => {
    setShields(mission.shields);
    setEnemiesDestroyed(0);
    setPhotonTorpedoes(10);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={resetLevel} variant="secondary">
            Restart mission
          </Button>
        </div>

        <Card className="p-6 mb-6 bg-slate-800/90 backdrop-blur border-purple-500/50">
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div>
              <div className="text-sm text-purple-300 mb-1">Misia</div>
              <div className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                {mission.level}
              </div>
            </div>
            <div>
              <div className="text-sm text-purple-300 mb-1">Shields</div>
              <div className="text-2xl font-bold text-cyan-400">{shields}%</div>
              <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-cyan-400 h-2 rounded-full transition-all"
                  style={{ width: `${shields}%` }}
                />
              </div>
            </div>
            <div>
              <div className="text-sm text-purple-300 mb-1">Torpedoes</div>
              <div className="text-2xl font-bold text-yellow-400 flex items-center justify-center gap-2">
                <Zap className="h-5 w-5" />
                {photonTorpedoes}
              </div>
            </div>
          </div>

          <div className="border-t border-purple-500/30 pt-4">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-white mb-2">{mission.name}</h3>
              <p className="text-purple-300 text-sm">
                Enemies destroyed: {enemiesDestroyed} / {mission.enemies}
              </p>
            </div>

            <div className="relative h-64 bg-slate-900/50 rounded-lg mb-6 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl animate-pulse">🚀</div>
              </div>
              <div className="absolute inset-0 grid grid-cols-5 gap-4 p-4">
                {Array.from({ length: mission.enemies - enemiesDestroyed }).map((_, i) => (
                  <div key={i} className="text-4xl animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}>
                    👾
                  </div>
                ))}
              </div>
            </div>

            <Button 
              onClick={fireWeapon}
              className="w-full bg-red-600 hover:bg-red-700 text-white text-lg py-6"
              disabled={shields <= 0}
            >
              <Zap className="h-6 w-6 mr-2" />
              Fire torpedo!
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
