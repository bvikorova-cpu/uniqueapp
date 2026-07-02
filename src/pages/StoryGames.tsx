import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MemoryMatch } from "@/components/kids/games/MemoryMatch";
import { WordPuzzle } from "@/components/kids/games/WordPuzzle";
import { HiddenObjects } from "@/components/kids/games/HiddenObjects";
import { StorySequence } from "@/components/kids/games/StorySequence";
import { ColorQuest } from "@/components/kids/games/ColorQuest";
import { NumberAdventure } from "@/components/kids/games/NumberAdventure";
import { MagicalParticles } from "@/components/kids/chat/MagicalParticles";

// New components
import { GameHero } from "@/components/kids/games/GameHero";
import { EnhancedGameCard } from "@/components/kids/games/EnhancedGameCard";
import { XPSystem } from "@/components/kids/games/XPSystem";
import { DailyStreak } from "@/components/kids/games/DailyStreak";
import { Leaderboard } from "@/components/kids/games/Leaderboard";
import { UnlockableRewards } from "@/components/kids/games/UnlockableRewards";
import { BonusRounds } from "@/components/kids/games/BonusRounds";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export default function StoryGames() {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [bestScores, setBestScores] = useState<Record<number, number>>({});
  const [userId, setUserId] = useState<string | null>(null);

  const level = Math.floor(score / 50) + 1;
  const streak = 0;

  // Load persisted progress on mount
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data } = await supabase
        .from("kids_game_progress")
        .select("game_id, best_score, total_plays, total_xp")
        .eq("user_id", user.id);
      if (data) {
        const scores: Record<number, number> = {};
        let totalXP = 0;
        let totalPlays = 0;
        data.forEach(row => {
          scores[row.game_id] = row.best_score;
          totalXP += row.total_xp;
          totalPlays += row.total_plays;
        });
        setBestScores(scores);
        setScore(totalXP);
        setGamesPlayed(totalPlays);
      }
    })();
  }, []);

  const games = [
    { id: 1, title: "Memory Match", emoji: "🎴", description: "Match the story characters to unlock the next chapter!", difficulty: "Easy", stars: 3 },
    { id: 2, title: "Word Puzzle", emoji: "🔤", description: "Find hidden words to continue the adventure!", difficulty: "Medium", stars: 5 },
    { id: 3, title: "Hidden Objects", emoji: "🔍", description: "Find all the magical items in the scene!", difficulty: "Easy", stars: 3 },
    { id: 4, title: "Story Sequence", emoji: "📚", description: "Put the story events in the right order!", difficulty: "Medium", stars: 4 },
    { id: 5, title: "Color Quest", emoji: "🎨", description: "Color the scene to bring it to life!", difficulty: "Easy", stars: 3 },
    { id: 6, title: "Number Adventure", emoji: "🔢", description: "Solve math puzzles to help the hero!", difficulty: "Hard", stars: 6 },
  ];

  const handleGameComplete = async (gameScore: number) => {
    setScore(prev => prev + gameScore);
    setGamesPlayed(prev => prev + 1);

    const gameMap: Record<string, number> = { memory: 1, word: 2, hidden: 3, sequence: 4, color: 5, number: 6 };
    if (activeGame) {
      const gameId = gameMap[activeGame];
      if (gameId) {
        const newBest = Math.max(bestScores[gameId] || 0, gameScore);
        setBestScores(prev => ({ ...prev, [gameId]: newBest }));

        // Persist to DB (upsert)
        if (userId) {
          try {
            const { data: existing } = await supabase
              .from("kids_game_progress")
              .select("total_plays, total_xp")
              .eq("user_id", userId)
              .eq("game_id", gameId)
              .maybeSingle();
            await supabase.from("kids_game_progress").upsert({
              user_id: userId,
              game_id: gameId,
              best_score: newBest,
              total_plays: (existing?.total_plays || 0) + 1,
              total_xp: (existing?.total_xp || 0) + gameScore,
              last_played_at: new Date().toISOString(),
            }, { onConflict: "user_id,game_id" });
          } catch (e) {
            console.error("Failed to save game progress:", e);
            toast.error("Couldn't save your score");
          }
        }
      }
    }
    setActiveGame(null);
  };

  const handleGameStart = (gameId: number) => {
    const gameMap: Record<number, string> = { 1: "memory", 2: "word", 3: "hidden", 4: "sequence", 5: "color", 6: "number" };
    setActiveGame(gameMap[gameId]);
  };

  // Render active game
  if (activeGame === "memory") return <MemoryMatch onComplete={handleGameComplete} onBack={() => setActiveGame(null)} />;
  if (activeGame === "word") return <WordPuzzle onComplete={handleGameComplete} onBack={() => setActiveGame(null)} />;
  if (activeGame === "hidden") return <HiddenObjects onComplete={handleGameComplete} onBack={() => setActiveGame(null)} />;
  if (activeGame === "sequence") return <StorySequence onComplete={handleGameComplete} onBack={() => setActiveGame(null)} />;
  if (activeGame === "color") return <ColorQuest onComplete={handleGameComplete} onBack={() => setActiveGame(null)} />;
  if (activeGame === "number") return <NumberAdventure onComplete={handleGameComplete} onBack={() => setActiveGame(null)} />;

  return (
    <>
      <FloatingHowItWorks title="How Story Games works" steps={[
          { title: 'Explore', desc: 'Browse the learning content or tool.' },
          { title: 'Start / generate', desc: 'Take a course, quiz or AI action (2-5 credits where applicable).' },
          { title: 'Track progress', desc: 'Your XP, badges and completion are saved.' },
          { title: 'Level up', desc: 'Unlock next lessons, leaderboards and rewards.' },
        ]} />
      <div className="min-h-screen bg-gradient-to-b from-violet-100 via-pink-50 to-cyan-100 relative overflow-hidden">
      <Navbar />
      <MagicalParticles count={8} />

      <div className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <Button variant="ghost" onClick={() => navigate("/kids-channel")} className="mb-6 hover:bg-white/50">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Kids Channel
        </Button>

        <div className="max-w-7xl mx-auto">
          {/* Hero */}
          <GameHero totalScore={score} level={level} gamesPlayed={gamesPlayed} />

          <HeroRewardedAd sectionKey="page_storygames" />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Bonus Events */}
              <Card className="p-5 bg-white/85 backdrop-blur-md border-white/50 shadow-xl">
                <BonusRounds onPlay={(theme) => console.log("Bonus round:", theme)} />
              </Card>

              {/* Games Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {games.map((game, index) => (
                  <EnhancedGameCard
                    key={game.id}
                    game={game}
                    index={index}
                    isUnlocked={game.id <= level + 2}
                    bestScore={bestScores[game.id] || 0}
                    onPlay={() => handleGameStart(game.id)}
                  />
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <Card className="p-4 bg-white/85 backdrop-blur-md border-white/50 shadow-xl">
                <XPSystem totalXP={score} level={level} />
              </Card>

              <Card className="p-4 bg-white/85 backdrop-blur-md border-white/50 shadow-xl">
                <DailyStreak currentStreak={streak} longestStreak={0} />
              </Card>

              <Card className="p-4 bg-white/85 backdrop-blur-md border-white/50 shadow-xl">
                <Leaderboard playerScore={score} />
              </Card>

              <Card className="p-4 bg-white/85 backdrop-blur-md border-white/50 shadow-xl">
                <UnlockableRewards level={level} />
              </Card>
            </div>
          </div>
        </div>
      </div>

    </div>
    </>
    );
}
