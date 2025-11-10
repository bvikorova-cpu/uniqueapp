import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Swords, Trophy, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { BattleArena } from "@/components/battle/BattleArena";
import { CharacterSelector } from "@/components/battle/CharacterSelector";
import { CharacterLeaderboard } from "@/components/battle/CharacterLeaderboard";

interface Character {
  id: string;
  name: string;
  image_url: string;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  category: string;
}

export default function CharacterBattle() {
  const navigate = useNavigate();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedChar1, setSelectedChar1] = useState<Character | null>(null);
  const [selectedChar2, setSelectedChar2] = useState<Character | null>(null);
  const [battleStarted, setBattleStarted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to battle characters");
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCharacters(data || []);
    } catch (error) {
      console.error('Error loading characters:', error);
      toast.error("Failed to load characters");
    } finally {
      setLoading(false);
    }
  };

  const handleStartBattle = () => {
    if (!selectedChar1 || !selectedChar2) {
      toast.error("Please select two characters to battle!");
      return;
    }
    if (selectedChar1.id === selectedChar2.id) {
      toast.error("Please select two different characters!");
      return;
    }
    setBattleStarted(true);
  };

  const handleBattleEnd = () => {
    setBattleStarted(false);
    setSelectedChar1(null);
    setSelectedChar2(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading characters...</div>
      </div>
    );
  }

  if (battleStarted && selectedChar1 && selectedChar2) {
    return (
      <BattleArena
        character1={selectedChar1}
        character2={selectedChar2}
        onBattleEnd={handleBattleEnd}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <Button
          variant="ghost"
          onClick={() => navigate("/kids-channel")}
          className="mb-6 text-white hover:bg-white/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="bg-black/40 backdrop-blur-lg border-purple-500/50 p-8 mb-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Swords className="h-12 w-12 text-yellow-500" />
              <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600">
                Character Battle Arena
              </h1>
              <Trophy className="h-12 w-12 text-yellow-500" />
            </div>
            <p className="text-xl text-gray-300">
              Select two characters and watch them battle!
            </p>
          </div>
        </Card>

        {characters.length < 2 ? (
          <Card className="bg-black/40 backdrop-blur-lg border-purple-500/50 p-12 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Not Enough Characters</h2>
            <p className="text-gray-300 mb-6">
              You need at least 2 characters to start a battle. Create more characters first!
            </p>
            <Button
              onClick={() => navigate("/kids-channel")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Zap className="mr-2 h-4 w-4" />
              Create Characters
            </Button>
          </Card>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <CharacterSelector
                characters={characters}
                selectedCharacter={selectedChar1}
                onSelect={setSelectedChar1}
                label="Fighter 1"
                position="left"
              />
              <CharacterSelector
                characters={characters}
                selectedCharacter={selectedChar2}
                onSelect={setSelectedChar2}
                label="Fighter 2"
                position="right"
              />
            </div>

            <div className="flex justify-center mb-8">
              <Button
                onClick={handleStartBattle}
                disabled={!selectedChar1 || !selectedChar2}
                size="lg"
                className="text-2xl px-12 py-8 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 hover:from-red-700 hover:via-yellow-600 hover:to-red-700 text-white font-bold shadow-2xl transform hover:scale-105 transition-all"
              >
                <Swords className="mr-3 h-8 w-8" />
                START BATTLE!
                <Swords className="ml-3 h-8 w-8" />
              </Button>
            </div>

            <CharacterLeaderboard />
          </>
        )}
      </div>
    </div>
  );
}
