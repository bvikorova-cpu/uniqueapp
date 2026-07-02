import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Swords, Shield, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface LeaderboardCharacter {
  id: string;
  name: string;
  image_url: string;
  category: string;
  battle_wins: number;
  battle_losses: number;
  battle_rating: number;
  level: number;
}

export const CharacterLeaderboard = () => {
  const [leaders, setLeaders] = useState<LeaderboardCharacter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('characters')
        .select('id, name, image_url, category, battle_wins, battle_losses, battle_rating, level')
        .order('battle_rating', { ascending: false })
        .limit(10);

      if (error) throw error;
      setLeaders(data || []);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalEmoji = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return null;
  };

  const getWinRate = (wins: number, losses: number) => {
    const total = wins + losses;
    if (total === 0) return 0;
    return Math.round((wins / total) * 100);
  };

  if (loading) {
    return (
    <>
      <FloatingHowItWorks title={"Character Leaderboard - How it works"} steps={[{ title: 'Open', desc: 'Access the Character Leaderboard section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Character Leaderboard.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-black/40 backdrop-blur-lg border-yellow-500/50">
        <CardContent className="p-8">
          <p className="text-center text-white">Loading leaderboard...</p>
        </CardContent>
      </Card>
    </>
  );
  }

  return (
    <Card className="bg-black/40 backdrop-blur-lg border-yellow-500/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl text-white">
          <Trophy className="h-6 w-6 text-yellow-400" />
          Battle Champions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {leaders.length === 0 ? (
          <p className="text-center text-gray-400 py-8">
            No battles yet. Be the first to compete!
          </p>
        ) : (
          <div className="space-y-3">
            {leaders.map((character, index) => {
              const medal = getMedalEmoji(index);
              const winRate = getWinRate(character.battle_wins, character.battle_losses);
              const totalBattles = character.battle_wins + character.battle_losses;

              return (
                <div
                  key={character.id}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg transition-all
                    ${index < 3 
                      ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/50' 
                      : 'bg-white/5 border border-white/10'
                    }
                  `}
                >
                  <div className="w-8 text-center">
                    {medal ? (
                      <span className="text-2xl">{medal}</span>
                    ) : (
                      <span className="text-lg font-bold text-white">#{index + 1}</span>
                    )}
                  </div>

                  <Avatar className="h-12 w-12 border-2 border-yellow-400">
                    <AvatarImage src={character.image_url} alt={character.name} />
                    <AvatarFallback>{character.name[0]}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm truncate">
                      {character.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="secondary" className="text-xs py-0 px-1">
                        {character.category}
                      </Badge>
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs py-0 px-1">
                        Lv {character.level}
                      </Badge>
                      <span className="text-yellow-400 font-bold">
                        {character.battle_rating}
                      </span>
                    </div>
                  </div>

                  <div className="text-right text-xs">
                    <div className="text-green-400 font-semibold">
                      {character.battle_wins}W
                    </div>
                    <div className="text-red-400">
                      {character.battle_losses}L
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
