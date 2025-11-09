import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Gamepad2, Star, Trophy } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MemoryMatch } from "@/components/kids/games/MemoryMatch";
import { WordPuzzle } from "@/components/kids/games/WordPuzzle";
import { HiddenObjects } from "@/components/kids/games/HiddenObjects";
import { StorySequence } from "@/components/kids/games/StorySequence";
import { ColorQuest } from "@/components/kids/games/ColorQuest";
import { NumberAdventure } from "@/components/kids/games/NumberAdventure";

export default function StoryGames() {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [activeGame, setActiveGame] = useState<string | null>(null);

  const games = [
    {
      id: 1,
      title: "Memory Match",
      emoji: "🎴",
      description: "Match the story characters to unlock the next chapter!",
      difficulty: "Easy",
      stars: 3
    },
    {
      id: 2,
      title: "Word Puzzle",
      emoji: "🔤",
      description: "Find hidden words to continue the adventure!",
      difficulty: "Medium",
      stars: 5
    },
    {
      id: 3,
      title: "Hidden Objects",
      emoji: "🔍",
      description: "Find all the magical items in the scene!",
      difficulty: "Easy",
      stars: 3
    },
    {
      id: 4,
      title: "Story Sequence",
      emoji: "📚",
      description: "Put the story events in the right order!",
      difficulty: "Medium",
      stars: 4
    },
    {
      id: 5,
      title: "Color Quest",
      emoji: "🎨",
      description: "Color the scene to bring it to life!",
      difficulty: "Easy",
      stars: 3
    },
    {
      id: 6,
      title: "Number Adventure",
      emoji: "🔢",
      description: "Solve math puzzles to help the hero!",
      difficulty: "Hard",
      stars: 6
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-500";
      case "Medium":
        return "bg-yellow-500";
      case "Hard":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleGameComplete = (gameScore: number) => {
    setScore(score + gameScore);
    setActiveGame(null);
  };

  const handleGameStart = (gameId: number) => {
    const gameMap: { [key: number]: string } = {
      1: "memory",
      2: "word",
      3: "hidden",
      4: "sequence",
      5: "color",
      6: "number",
    };
    setActiveGame(gameMap[gameId]);
  };

  // Render active game
  if (activeGame === "memory") {
    return <MemoryMatch onComplete={handleGameComplete} onBack={() => setActiveGame(null)} />;
  }
  if (activeGame === "word") {
    return <WordPuzzle onComplete={handleGameComplete} onBack={() => setActiveGame(null)} />;
  }
  if (activeGame === "hidden") {
    return <HiddenObjects onComplete={handleGameComplete} onBack={() => setActiveGame(null)} />;
  }
  if (activeGame === "sequence") {
    return <StorySequence onComplete={handleGameComplete} onBack={() => setActiveGame(null)} />;
  }
  if (activeGame === "color") {
    return <ColorQuest onComplete={handleGameComplete} onBack={() => setActiveGame(null)} />;
  }
  if (activeGame === "number") {
    return <NumberAdventure onComplete={handleGameComplete} onBack={() => setActiveGame(null)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-100 via-pink-100 to-purple-100">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
          <Button
            variant="ghost"
            onClick={() => navigate("/kids-channel")}
            className="mb-6 hover:bg-white/50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Kids Channel
          </Button>

        <div className="max-w-6xl mx-auto">
          <Card className="bg-white/90 backdrop-blur-sm border-4 border-white/50 shadow-2xl mb-8">
            <CardHeader className="text-center">
              <CardTitle className="text-4xl font-bold text-red-600 mb-2">
                Story Games! 🎮
              </CardTitle>
              <CardDescription className="text-lg text-gray-700">
                Play fun games to unlock the next part of your story!
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Score Section */}
          <Card className="bg-gradient-to-r from-yellow-100 to-orange-100 border-4 border-yellow-300 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-orange-600 mb-1">Your Score</h3>
                  <p className="text-gray-600">Keep playing to earn more stars!</p>
                </div>
                <div className="flex items-center gap-3">
                  <Trophy className="w-12 h-12 text-yellow-500" />
                  <div className="text-center">
                    <div className="text-4xl font-bold text-orange-600">{score}</div>
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i <= Math.floor(score / 20)
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game, index) => (
              <Card
                key={game.id}
                className="group relative overflow-hidden bg-gradient-to-br from-white to-pink-50 border-4 border-pink-200 hover:border-red-300 transition-all duration-300 hover:scale-105 cursor-pointer shadow-xl"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-7xl mb-4">{game.emoji}</div>
                  
                  <h3 className="text-xl font-bold text-red-600 mb-2">
                    {game.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    {game.description}
                  </p>

                  {/* Difficulty Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs px-3 py-1 rounded-full text-white font-semibold ${getDifficultyColor(game.difficulty)}`}>
                      {game.difficulty}
                    </span>
                    <div className="flex gap-1">
                      {[...Array(game.stars)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
                    onClick={() => handleGameStart(game.id)}
                  >
                    <Gamepad2 className="mr-2 h-4 w-4" />
                    Play Now!
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Achievements Section */}
          <Card className="bg-gradient-to-br from-white to-red-50 border-4 border-red-200 mt-8">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                  <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-red-600 mb-2">
                    Achievements 🏆
                  </h3>
                  <p className="text-gray-700">
                    Complete games to earn special badges!
                  </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { emoji: "🎯", name: "Perfect Match", achieved: true },
                  { emoji: "🧩", name: "Puzzle Master", achieved: true },
                  { emoji: "⭐", name: "Star Collector", achieved: false },
                  { emoji: "🏅", name: "Game Champion", achieved: false }
                ].map((achievement, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl text-center transition-all ${
                      achievement.achieved
                        ? "bg-gradient-to-br from-yellow-200 to-orange-200 border-2 border-yellow-400"
                        : "bg-gray-100 border-2 border-gray-300 opacity-50"
                    }`}
                  >
                    <div className="text-4xl mb-2">{achievement.emoji}</div>
                    <p className="text-xs font-semibold text-gray-700">{achievement.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
