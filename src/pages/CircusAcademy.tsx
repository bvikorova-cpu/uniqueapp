import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Star, Trophy, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Trick {
  id: number;
  name: string;
  emoji: string;
  difficulty: number;
  stars: number;
  completed: boolean;
}

const CircusAcademy = () => {
  const navigate = useNavigate();
  const [totalStars, setTotalStars] = useState(0);
  const [tricks, setTricks] = useState<Trick[]>([
    { id: 1, name: "Juggling", emoji: "🤹", difficulty: 1, stars: 3, completed: false },
    { id: 2, name: "Tightrope Walking", emoji: "🎪", difficulty: 2, stars: 5, completed: false },
    { id: 3, name: "Magic Hat Trick", emoji: "🎩", difficulty: 1, stars: 3, completed: false },
    { id: 4, name: "Clown Performance", emoji: "🤡", difficulty: 1, stars: 3, completed: false },
    { id: 5, name: "Ring of Fire", emoji: "🔥", difficulty: 3, stars: 8, completed: false },
    { id: 6, name: "Acrobatics", emoji: "🤸", difficulty: 2, stars: 5, completed: false },
    { id: 7, name: "Lion Taming", emoji: "🦁", difficulty: 3, stars: 10, completed: false },
    { id: 8, name: "Balloon Animals", emoji: "🎈", difficulty: 1, stars: 3, completed: false }
  ]);

  const practiceTrick = (trickId: number) => {
    const trick = tricks.find(t => t.id === trickId);
    if (!trick || trick.completed) return;

    // Simulate practice result (70% success rate)
    const success = Math.random() > 0.3;

    if (success) {
      setTricks(tricks.map(t => 
        t.id === trickId ? { ...t, completed: true } : t
      ));
      setTotalStars(totalStars + trick.stars);
      toast.success(`🎉 You mastered ${trick.name}! +${trick.stars} stars!`);
    } else {
      toast.error("Oops! Try again!");
    }
  };

  const completedTricks = tricks.filter(t => t.completed).length;
  const progressPercentage = (completedTricks / tricks.length) * 100;

  const getDifficultyBadge = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return <Badge className="bg-green-500">Easy</Badge>;
      case 2:
        return <Badge className="bg-yellow-500">Medium</Badge>;
      case 3:
        return <Badge className="bg-red-500">Hard</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 p-4">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/kids-channel')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Kids Channel
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-yellow-700 mb-2">
            🎪 Circus Academy 🎭
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Learn amazing circus tricks and become a star performer!
          </p>
          
          <Card className="max-w-md mx-auto bg-gradient-to-r from-yellow-100 to-orange-100 border-4 border-yellow-400">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <Badge className="bg-yellow-500 text-white text-xl px-4 py-2">
                  <Star className="w-5 h-5 mr-2 inline" />
                  {totalStars} Stars
                </Badge>
                <Badge className="bg-orange-500 text-white text-xl px-4 py-2">
                  <Trophy className="w-5 h-5 mr-2 inline" />
                  {completedTricks}/{tricks.length} Tricks
                </Badge>
              </div>
              <Progress value={progressPercentage} className="h-4" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tricks.map((trick) => (
            <Card
              key={trick.id}
              className={`border-4 shadow-xl transition-all duration-300 hover:scale-105 ${
                trick.completed
                  ? "bg-gradient-to-br from-green-100 to-emerald-100 border-green-400"
                  : "bg-gradient-to-br from-white to-gray-50 border-yellow-300"
              }`}
            >
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <div className="text-6xl">{trick.emoji}</div>
                  {trick.completed && (
                    <Badge className="bg-green-500 text-white">
                      ✓ Mastered
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-2xl text-gray-800">
                  {trick.name}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex gap-2 items-center">
                  {getDifficultyBadge(trick.difficulty)}
                  <Badge className="bg-yellow-500 text-white">
                    <Star className="w-4 h-4 mr-1 inline" />
                    {trick.stars} stars
                  </Badge>
                </div>

                <Button
                  onClick={() => practiceTrick(trick.id)}
                  disabled={trick.completed}
                  className={`w-full ${
                    trick.completed
                      ? "bg-gray-400"
                      : "bg-yellow-500 hover:bg-yellow-600"
                  } text-white py-6 text-lg`}
                >
                  {trick.completed ? (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Completed!
                    </>
                  ) : (
                    <>Practice Trick</>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {completedTricks === tricks.length && (
          <Card className="mt-8 bg-gradient-to-r from-yellow-200 via-orange-200 to-red-200 border-4 border-yellow-500">
            <CardContent className="text-center py-8">
              <Trophy className="w-24 h-24 mx-auto text-yellow-600 mb-4" />
              <h2 className="text-4xl font-bold text-yellow-800 mb-4">
                🎉 Congratulations! 🎉
              </h2>
              <p className="text-2xl text-gray-700 mb-2">
                You've mastered all circus tricks!
              </p>
              <p className="text-xl text-gray-600">
                You're now a Circus Star! ⭐
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CircusAcademy;
