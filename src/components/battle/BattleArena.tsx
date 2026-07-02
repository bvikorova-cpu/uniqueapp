import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Skull, ArrowLeft } from "lucide-react";
import confetti from "canvas-confetti";
import { supabase } from "@/integrations/supabase/client";
import { LevelBadge } from "@/components/character/LevelBadge";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Character {
  id: string;
  name: string;
  image_url: string;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  category: string;
  level?: number;
  experience?: number;
  experience_to_next_level?: number;
}

interface BattleArenaProps {
  character1: Character;
  character2: Character;
  onBattleEnd: () => void;
}

interface BattleLog {
  message: string;
  type: 'attack' | 'damage' | 'victory';
}

export const BattleArena = ({ character1, character2, onBattleEnd }: BattleArenaProps) => {
  const [char1Hp, setChar1Hp] = useState(character1.hp);
  const [char2Hp, setChar2Hp] = useState(character2.hp);
  const [battleLog, setBattleLog] = useState<BattleLog[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [attackingChar, setAttackingChar] = useState<1 | 2 | null>(null);
  const [winner, setWinner] = useState<1 | 2 | null>(null);

  const addLog = (message: string, type: BattleLog['type'] = 'attack') => {
    setBattleLog(prev => [...prev, { message, type }]);
  };

  const calculateDamage = (attacker: Character, defender: Character) => {
    const baseDamage = attacker.attack;
    const reduction = defender.defense * 0.5;
    const finalDamage = Math.max(1, Math.floor(baseDamage - reduction + Math.random() * 10));
    return finalDamage;
  };

  const performAttack = async (attacker: 1 | 2) => {
    if (winner) return;
    
    setIsAnimating(true);
    setAttackingChar(attacker);

    const attackerChar = attacker === 1 ? character1 : character2;
    const defenderChar = attacker === 1 ? character2 : character1;
    const damage = calculateDamage(attackerChar, defenderChar);

    addLog(`${attackerChar.name} attacks ${defenderChar.name}!`, 'attack');
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (attacker === 1) {
      setChar2Hp(prev => Math.max(0, prev - damage));
    } else {
      setChar1Hp(prev => Math.max(0, prev - damage));
    }
    
    addLog(`${defenderChar.name} takes ${damage} damage!`, 'damage');
    
    await new Promise(resolve => setTimeout(resolve, 600));
    setAttackingChar(null);
    setIsAnimating(false);
  };

  const startAutoBattle = async () => {
    // Determine first attacker based on speed
    let currentAttacker: 1 | 2 = character1.speed >= character2.speed ? 1 : 2;
    
    while (char1Hp > 0 && char2Hp > 0 && !winner) {
      await performAttack(currentAttacker);
      await new Promise(resolve => setTimeout(resolve, 1000));
      currentAttacker = currentAttacker === 1 ? 2 : 1;
    }
  };

  useEffect(() => {
    const saveBattleResult = async (winnerId: string, loserId: string) => {
      try {
        await supabase.rpc('update_battle_stats', {
          winner_id: winnerId,
          loser_id: loserId
        });
      } catch (error) {
        console.error('Error saving battle result:', error);
      }
    };

    // Check for winner
    if (char1Hp <= 0 && !winner) {
      setWinner(2);
      addLog(`${character2.name} wins!`, 'victory');
      saveBattleResult(character2.id, character1.id);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else if (char2Hp <= 0 && !winner) {
      setWinner(1);
      addLog(`${character1.name} wins!`, 'victory');
      saveBattleResult(character1.id, character2.id);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [char1Hp, char2Hp, winner, character1.name, character2.name, character1.id, character2.id]);

  useEffect(() => {
    startAutoBattle();
  }, []);

  const char1HpPercent = (char1Hp / character1.hp) * 100;
  const char2HpPercent = (char2Hp / character2.hp) * 100;

  return (
    <>
      <FloatingHowItWorks title={"Battle Arena - How it works"} steps={[{ title: 'Open', desc: 'Access the Battle Arena section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Battle Arena.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 p-8">
      <Button
        onClick={onBattleEnd}
        variant="ghost"
        className="mb-6 text-white hover:bg-white/10"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Selection
      </Button>

      {/* Battle Arena */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Character 1 */}
        <div className={`relative transition-all duration-300 ${attackingChar === 1 ? 'scale-110 translate-x-8' : ''} ${char1Hp <= 0 ? 'opacity-50 grayscale' : ''}`}>
          <Card className="bg-black/40 backdrop-blur-lg border-blue-500/50 p-6">
            <div className="relative">
              <img
                src={character1.image_url}
                alt={character1.name}
                className="w-full h-96 object-cover rounded-lg"
              />
              {attackingChar === 1 && (
                <div className="absolute inset-0 bg-yellow-400/30 rounded-lg animate-pulse" />
              )}
            </div>
            <div className="mt-4 space-y-3">
              <h3 className="text-3xl font-bold text-white text-center">
                {character1.name}
              </h3>
              
              {character1.level && (
                <LevelBadge 
                  level={character1.level}
                  experience={character1.experience || 0}
                  experienceToNextLevel={character1.experience_to_next_level || 100}
                />
              )}
              
              <div className="space-y-2">
                <div className="flex justify-between text-white mb-1">
                  <span>HP</span>
                  <span className="font-bold">{char1Hp} / {character1.hp}</span>
                </div>
                <Progress value={char1HpPercent} className="h-4" />
              </div>
            </div>
          </Card>
          {winner === 1 && (
            <div className="absolute -top-4 -right-4 animate-bounce">
              <Trophy className="h-20 w-20 text-yellow-400" />
            </div>
          )}
          {char1Hp <= 0 && (
            <div className="absolute -top-4 -right-4">
              <Skull className="h-20 w-20 text-gray-400" />
            </div>
          )}
        </div>

        {/* Character 2 */}
        <div className={`relative transition-all duration-300 ${attackingChar === 2 ? 'scale-110 -translate-x-8' : ''} ${char2Hp <= 0 ? 'opacity-50 grayscale' : ''}`}>
          <Card className="bg-black/40 backdrop-blur-lg border-red-500/50 p-6">
            <div className="relative">
              <img
                src={character2.image_url}
                alt={character2.name}
                className="w-full h-96 object-cover rounded-lg"
              />
              {attackingChar === 2 && (
                <div className="absolute inset-0 bg-yellow-400/30 rounded-lg animate-pulse" />
              )}
            </div>
            <div className="mt-4 space-y-3">
              <h3 className="text-3xl font-bold text-white text-center">
                {character2.name}
              </h3>
              
              {character2.level && (
                <LevelBadge 
                  level={character2.level}
                  experience={character2.experience || 0}
                  experienceToNextLevel={character2.experience_to_next_level || 100}
                />
              )}
              
              <div className="space-y-2">
                <div className="flex justify-between text-white mb-1">
                  <span>HP</span>
                  <span className="font-bold">{char2Hp} / {character2.hp}</span>
                </div>
                <Progress value={char2HpPercent} className="h-4" />
              </div>
            </div>
          </Card>
          {winner === 2 && (
            <div className="absolute -top-4 -left-4 animate-bounce">
              <Trophy className="h-20 w-20 text-yellow-400" />
            </div>
          )}
          {char2Hp <= 0 && (
            <div className="absolute -top-4 -left-4">
              <Skull className="h-20 w-20 text-gray-400" />
            </div>
          )}
        </div>
      </div>

      {/* Battle Log */}
      <Card className="bg-black/60 backdrop-blur-lg border-purple-500/50 p-6 max-w-2xl mx-auto">
        <h3 className="text-2xl font-bold text-white mb-4 text-center">Battle Log</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {battleLog.map((log, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg animate-fade-in ${
                log.type === 'attack' ? 'bg-yellow-500/20 text-yellow-200' :
                log.type === 'damage' ? 'bg-red-500/20 text-red-200' :
                'bg-green-500/20 text-green-200'
              }`}
            >
              {log.message}
            </div>
          ))}
        </div>
      </Card>

      {winner && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in">
          <Card className="bg-gradient-to-br from-yellow-400 to-orange-500 p-12 text-center max-w-md">
            <Trophy className="h-32 w-32 mx-auto mb-6 text-white animate-bounce" />
            <h2 className="text-5xl font-bold text-white mb-4">Victory!</h2>
            <p className="text-3xl text-white mb-8">
              {winner === 1 ? character1.name : character2.name} wins!
            </p>
            <Button
              onClick={onBattleEnd}
              size="lg"
              className="bg-white text-orange-600 hover:bg-gray-100 font-bold text-xl px-8 py-6"
            >
              Battle Again
            </Button>
          </Card>
        </div>
      )}
    </div>
    </>
  );
};
