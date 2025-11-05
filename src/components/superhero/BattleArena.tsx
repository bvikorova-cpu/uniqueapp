import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Zap, Shield, Flame, Sparkles, Heart, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Hero {
  id: string;
  name: string;
  imageUrl: string;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  position: { x: number; y: number };
}

interface Attack {
  id: string;
  name: string;
  damage: number;
  energyCost: number;
  icon: any;
  color: string;
  effect: string;
}

const attacks: Attack[] = [
  { id: "lightning", name: "Lightning Strike", damage: 35, energyCost: 25, icon: Zap, color: "#fbbf24", effect: "⚡" },
  { id: "shield", name: "Power Shield", damage: 15, energyCost: 15, icon: Shield, color: "#3b82f6", effect: "🛡️" },
  { id: "fire", name: "Fire Blast", damage: 50, energyCost: 40, icon: Flame, color: "#ef4444", effect: "🔥" },
  { id: "cosmic", name: "Cosmic Ray", damage: 45, energyCost: 35, icon: Sparkles, color: "#a855f7", effect: "✨" },
];

export const BattleArena = () => {
  const { toast } = useToast();
  const [hero1, setHero1] = useState<Hero>({
    id: "hero1",
    name: "Shadow Storm",
    imageUrl: "/placeholder.svg",
    health: 100,
    maxHealth: 100,
    energy: 100,
    maxEnergy: 100,
    position: { x: 20, y: 50 }
  });

  const [hero2, setHero2] = useState<Hero>({
    id: "hero2",
    name: "Crimson Fury",
    imageUrl: "/placeholder.svg",
    health: 100,
    maxHealth: 100,
    energy: 100,
    maxEnergy: 100,
    position: { x: 80, y: 50 }
  });

  const [currentTurn, setCurrentTurn] = useState<"hero1" | "hero2">("hero1");
  const [isAttacking, setIsAttacking] = useState(false);
  const [attackEffect, setAttackEffect] = useState<{ effect: string; position: { x: number; y: number } } | null>(null);
  const [combo, setCombo] = useState(0);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [winner, setWinner] = useState<string | null>(null);

  // Energy regeneration
  useEffect(() => {
    const interval = setInterval(() => {
      if (!winner) {
        setHero1(prev => ({ ...prev, energy: Math.min(prev.energy + 5, prev.maxEnergy) }));
        setHero2(prev => ({ ...prev, energy: Math.min(prev.energy + 5, prev.maxEnergy) }));
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [winner]);

  const handleAttack = async (attack: Attack) => {
    if (isAttacking || winner) return;

    const attacker = currentTurn === "hero1" ? hero1 : hero2;
    const defender = currentTurn === "hero1" ? hero2 : hero1;

    if (attacker.energy < attack.energyCost) {
      toast({
        title: "Not Enough Energy! ⚡",
        description: `Need ${attack.energyCost} energy. Wait for regeneration.`,
        variant: "destructive"
      });
      return;
    }

    setIsAttacking(true);

    // Update attacker energy
    if (currentTurn === "hero1") {
      setHero1(prev => ({ ...prev, energy: prev.energy - attack.energyCost }));
    } else {
      setHero2(prev => ({ ...prev, energy: prev.energy - attack.energyCost }));
    }

    // Move attacker forward
    const targetX = currentTurn === "hero1" ? 45 : 55;
    if (currentTurn === "hero1") {
      setHero1(prev => ({ ...prev, position: { ...prev.position, x: targetX } }));
    } else {
      setHero2(prev => ({ ...prev, position: { ...prev.position, x: targetX } }));
    }

    // Wait for move animation
    await new Promise(resolve => setTimeout(resolve, 300));

    // Show attack effect
    setAttackEffect({
      effect: attack.effect,
      position: { x: defender.position.x, y: defender.position.y }
    });

    // Calculate damage with combo bonus
    const comboBonus = combo * 5;
    const totalDamage = attack.damage + comboBonus;

    // Apply damage
    await new Promise(resolve => setTimeout(resolve, 400));
    if (currentTurn === "hero1") {
      setHero2(prev => ({ ...prev, health: Math.max(0, prev.health - totalDamage) }));
    } else {
      setHero1(prev => ({ ...prev, health: Math.max(0, prev.health - totalDamage) }));
    }

    // Update combo and battle log
    setCombo(prev => prev + 1);
    setBattleLog(prev => [
      `${attacker.name} used ${attack.name}! Dealt ${totalDamage} damage! ${comboBonus > 0 ? `(+${comboBonus} combo bonus)` : ''}`,
      ...prev.slice(0, 4)
    ]);

    // Clear attack effect
    await new Promise(resolve => setTimeout(resolve, 600));
    setAttackEffect(null);

    // Move attacker back
    if (currentTurn === "hero1") {
      setHero1(prev => ({ ...prev, position: { x: 20, y: 50 } }));
    } else {
      setHero2(prev => ({ ...prev, position: { x: 80, y: 50 } }));
    }

    // Check for winner
    const newDefenderHealth = currentTurn === "hero1" ? hero2.health - totalDamage : hero1.health - totalDamage;
    if (newDefenderHealth <= 0) {
      setWinner(attacker.name);
      toast({
        title: `${attacker.name} Wins! 🏆`,
        description: `Victory with ${combo + 1} combo chain!`,
      });
    } else {
      // Switch turn
      setCurrentTurn(currentTurn === "hero1" ? "hero2" : "hero1");
    }

    setIsAttacking(false);
  };

  const resetBattle = () => {
    setHero1(prev => ({ ...prev, health: prev.maxHealth, energy: prev.maxEnergy, position: { x: 20, y: 50 } }));
    setHero2(prev => ({ ...prev, health: prev.maxHealth, energy: prev.maxEnergy, position: { x: 80, y: 50 } }));
    setCurrentTurn("hero1");
    setCombo(0);
    setBattleLog([]);
    setWinner(null);
  };

  return (
    <div className="relative w-full h-full min-h-[600px] bg-gradient-to-br from-black via-zinc-950 to-black rounded-2xl overflow-hidden border-2 border-red-900/30">
      {/* Battle Arena Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
      </div>

      {/* Particle Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-red-500/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Combo Counter */}
      {combo > 0 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
          <Badge className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white text-2xl px-6 py-2 animate-bounce">
            {combo}x COMBO! 🔥
          </Badge>
        </div>
      )}

      {/* Battle Arena */}
      <div className="relative h-96 flex items-center justify-between px-8">
        {/* Hero 1 */}
        <div
          className="absolute transition-all duration-300 ease-out"
          style={{ left: `${hero1.position.x}%`, top: `${hero1.position.y}%`, transform: 'translate(-50%, -50%)' }}
        >
          <div className={`relative ${currentTurn === "hero1" && !winner ? "ring-4 ring-blue-500 ring-offset-4 ring-offset-black" : ""} rounded-lg transition-all duration-300`}>
            <img
              src={hero1.imageUrl}
              alt={hero1.name}
              className="w-32 h-32 object-cover rounded-lg shadow-2xl"
            />
            {currentTurn === "hero1" && !winner && (
              <div className="absolute -top-2 -right-2">
                <Target className="w-8 h-8 text-blue-400 animate-pulse" />
              </div>
            )}
          </div>
        </div>

        {/* Hero 2 */}
        <div
          className="absolute transition-all duration-300 ease-out"
          style={{ left: `${hero2.position.x}%`, top: `${hero2.position.y}%`, transform: 'translate(-50%, -50%) scaleX(-1)' }}
        >
          <div className={`relative ${currentTurn === "hero2" && !winner ? "ring-4 ring-red-500 ring-offset-4 ring-offset-black" : ""} rounded-lg transition-all duration-300`}>
            <img
              src={hero2.imageUrl}
              alt={hero2.name}
              className="w-32 h-32 object-cover rounded-lg shadow-2xl"
            />
            {currentTurn === "hero2" && !winner && (
              <div className="absolute -top-2 -right-2">
                <Target className="w-8 h-8 text-red-400 animate-pulse" />
              </div>
            )}
          </div>
        </div>

        {/* Attack Effect */}
        {attackEffect && (
          <div
            className="absolute text-6xl animate-ping z-30"
            style={{
              left: `${attackEffect.position.x}%`,
              top: `${attackEffect.position.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {attackEffect.effect}
          </div>
        )}
      </div>

      {/* Hero Stats */}
      <div className="absolute top-4 left-4 right-4 flex justify-between gap-4 z-10">
        {/* Hero 1 Stats */}
        <Card className="bg-black/80 backdrop-blur-md border-blue-500/30 p-4 flex-1">
          <h3 className="text-white font-bold mb-2 flex items-center gap-2">
            <Heart className="w-5 h-5 text-blue-400" />
            {hero1.name}
          </h3>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Health</span>
                <span>{hero1.health}/{hero1.maxHealth}</span>
              </div>
              <Progress value={(hero1.health / hero1.maxHealth) * 100} className="h-3 bg-gray-800">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300"
                  style={{ width: `${(hero1.health / hero1.maxHealth) * 100}%` }}
                />
              </Progress>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Energy</span>
                <span>{hero1.energy}/{hero1.maxEnergy}</span>
              </div>
              <Progress value={(hero1.energy / hero1.maxEnergy) * 100} className="h-2 bg-gray-800">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300"
                  style={{ width: `${(hero1.energy / hero1.maxEnergy) * 100}%` }}
                />
              </Progress>
            </div>
          </div>
        </Card>

        {/* Hero 2 Stats */}
        <Card className="bg-black/80 backdrop-blur-md border-red-500/30 p-4 flex-1">
          <h3 className="text-white font-bold mb-2 flex items-center gap-2 justify-end">
            {hero2.name}
            <Heart className="w-5 h-5 text-red-400" />
          </h3>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{hero2.health}/{hero2.maxHealth}</span>
                <span>Health</span>
              </div>
              <Progress value={(hero2.health / hero2.maxHealth) * 100} className="h-3 bg-gray-800">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300"
                  style={{ width: `${(hero2.health / hero2.maxHealth) * 100}%` }}
                />
              </Progress>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{hero2.energy}/{hero2.maxEnergy}</span>
                <span>Energy</span>
              </div>
              <Progress value={(hero2.energy / hero2.maxEnergy) * 100} className="h-2 bg-gray-800">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300"
                  style={{ width: `${(hero2.energy / hero2.maxEnergy) * 100}%` }}
                />
              </Progress>
            </div>
          </div>
        </Card>
      </div>

      {/* Attack Controls */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <Card className="bg-black/90 backdrop-blur-md border-zinc-800 p-6">
          {winner ? (
            <div className="text-center">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-4">
                🏆 {winner} WINS! 🏆
              </h2>
              <Button onClick={resetBattle} size="lg" className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                New Battle
              </Button>
            </div>
          ) : (
            <>
              <div className="text-center mb-4">
                <Badge className={`${currentTurn === "hero1" ? "bg-blue-600" : "bg-red-600"} text-white text-lg px-4 py-1`}>
                  {currentTurn === "hero1" ? hero1.name : hero2.name}'s Turn
                </Badge>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {attacks.map(attack => {
                  const Icon = attack.icon;
                  const currentHero = currentTurn === "hero1" ? hero1 : hero2;
                  const canUse = currentHero.energy >= attack.energyCost;
                  
                  return (
                    <Button
                      key={attack.id}
                      onClick={() => handleAttack(attack)}
                      disabled={!canUse || isAttacking}
                      className={`relative overflow-hidden h-24 flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
                        canUse
                          ? "bg-gradient-to-br from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 hover:scale-105"
                          : "bg-zinc-900/50 opacity-50 cursor-not-allowed"
                      }`}
                      style={{
                        boxShadow: canUse ? `0 0 20px ${attack.color}40` : 'none'
                      }}
                    >
                      <Icon className="w-8 h-8" style={{ color: attack.color }} />
                      <span className="text-xs font-bold text-white">{attack.name}</span>
                      <span className="text-xs text-gray-400">{attack.energyCost} energy</span>
                      <span className="absolute top-1 right-1 text-xs text-yellow-400 font-bold">
                        {attack.damage}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Battle Log */}
      <div className="absolute bottom-32 left-4 w-80 z-10">
        <Card className="bg-black/70 backdrop-blur-md border-zinc-800 p-3">
          <h4 className="text-white font-bold text-sm mb-2">Battle Log</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {battleLog.map((log, i) => (
              <p key={i} className="text-xs text-gray-300">{log}</p>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
