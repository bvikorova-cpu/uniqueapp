import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, Heart, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Decoration {
  id: number;
  name: string;
  emoji: string;
  category: string;
}

interface Theme {
  id: number;
  name: string;
  emoji: string;
  baseColor: string;
}

const decorations: Decoration[] = [
  { id: 1, name: "Cherry", emoji: "🍒", category: "topping" },
  { id: 2, name: "Strawberry", emoji: "🍓", category: "topping" },
  { id: 3, name: "Candle", emoji: "🕯️", category: "topping" },
  { id: 4, name: "Flower", emoji: "🌸", category: "topping" },
  { id: 5, name: "Star", emoji: "⭐", category: "topping" },
  { id: 6, name: "Heart", emoji: "💖", category: "topping" },
  { id: 7, name: "Sprinkles", emoji: "✨", category: "topping" },
  { id: 8, name: "Chocolate", emoji: "🍫", category: "topping" }
];

const themes: Theme[] = [
  { id: 1, name: "Birthday", emoji: "🎂", baseColor: "from-pink-200 to-pink-300" },
  { id: 2, name: "Wedding", emoji: "💒", baseColor: "from-white to-blue-100" },
  { id: 3, name: "Christmas", emoji: "🎄", baseColor: "from-red-200 to-green-200" },
  { id: 4, name: "Valentine", emoji: "💝", baseColor: "from-red-200 to-pink-200" }
];

const CakeDecorating = () => {
  const navigate = useNavigate();
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [cakeDecorations, setCakeDecorations] = useState<Decoration[]>([]);
  const [score, setScore] = useState(0);
  const [votes, setVotes] = useState(0);

  const addDecoration = (decoration: Decoration) => {
    if (cakeDecorations.length < 10) {
      setCakeDecorations([...cakeDecorations, decoration]);
      toast.success(`Added ${decoration.name}!`);
    } else {
      toast.error("Cake is full! Submit your design!");
    }
  };

  const removeLastDecoration = () => {
    if (cakeDecorations.length > 0) {
      const newDecorations = [...cakeDecorations];
      newDecorations.pop();
      setCakeDecorations(newDecorations);
      toast.info("Removed last decoration");
    }
  };

  const submitCake = () => {
    if (!selectedTheme || cakeDecorations.length === 0) {
      toast.error("Select a theme and add decorations!");
      return;
    }

    // Simulate audience voting
    const audienceVotes = Math.floor(Math.random() * 50) + 50;
    const pointsEarned = cakeDecorations.length * 10 + audienceVotes;
    
    setVotes(votes + audienceVotes);
    setScore(score + pointsEarned);
    
    toast.success(`🎉 ${audienceVotes} votes! You earned ${pointsEarned} points!`);
    
    // Reset for next cake
    setCakeDecorations([]);
    setSelectedTheme(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-fuchsia-50 p-4">
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
          <h1 className="text-5xl font-bold text-pink-700 mb-2">
            🎂 Cake Decorating Championship 🎨
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Create the most beautiful cakes!
          </p>

          <div className="flex justify-center gap-4">
            <Badge className="bg-pink-500 text-white text-xl px-6 py-3">
              <Star className="w-5 h-5 mr-2 inline" />
              {score} Points
            </Badge>
            <Badge className="bg-purple-500 text-white text-xl px-6 py-3">
              <Heart className="w-5 h-5 mr-2 inline" />
              {votes} Votes
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left side - Theme & Decorations */}
          <div className="space-y-6">
            {/* Theme Selection */}
            <Card className="border-4 border-pink-300 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-pink-700">
                  Choose a Theme
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {themes.map((theme) => (
                    <Card
                      key={theme.id}
                      className={`bg-gradient-to-br ${theme.baseColor} cursor-pointer border-4 transition-all duration-300 hover:scale-105 ${
                        selectedTheme?.id === theme.id
                          ? "border-pink-600 shadow-xl"
                          : "border-gray-300"
                      }`}
                      onClick={() => {
                        setSelectedTheme(theme);
                        toast.success(`${theme.name} theme selected!`);
                      }}
                    >
                      <CardContent className="text-center p-6">
                        <div className="text-5xl mb-2">{theme.emoji}</div>
                        <p className="font-bold text-gray-700">{theme.name}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Decorations */}
            <Card className="border-4 border-pink-300 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-pink-700">
                  Decoration Tools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-3">
                  {decorations.map((decoration) => (
                    <Button
                      key={decoration.id}
                      onClick={() => addDecoration(decoration)}
                      className="h-20 text-4xl bg-white hover:bg-pink-100 border-2 border-pink-200"
                      variant="outline"
                    >
                      {decoration.emoji}
                    </Button>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    onClick={removeLastDecoration}
                    variant="outline"
                    className="flex-1 border-2 border-pink-300"
                  >
                    Undo Last
                  </Button>
                  <Button
                    onClick={() => setCakeDecorations([])}
                    variant="outline"
                    className="flex-1 border-2 border-pink-300"
                  >
                    Clear All
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right side - Cake Preview */}
          <Card className="border-4 border-pink-300 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-pink-700 text-center">
                Your Cake Design
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`min-h-[400px] rounded-lg p-8 ${
                selectedTheme 
                  ? `bg-gradient-to-br ${selectedTheme.baseColor}` 
                  : "bg-gray-100"
              } border-4 border-pink-200 flex flex-col items-center justify-center`}>
                {!selectedTheme ? (
                  <div className="text-center text-gray-500">
                    <Sparkles className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-lg">Select a theme to start!</p>
                  </div>
                ) : (
                  <>
                    {/* Base Cake */}
                    <div className="relative w-48 h-48 bg-yellow-100 rounded-lg border-4 border-yellow-300 flex items-center justify-center mb-4">
                      <div className="text-6xl">{selectedTheme.emoji}</div>
                    </div>

                    {/* Decorations Display */}
                    {cakeDecorations.length > 0 && (
                      <div className="flex flex-wrap gap-2 justify-center mt-4">
                        {cakeDecorations.map((dec, index) => (
                          <span key={index} className="text-4xl">
                            {dec.emoji}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="mt-6 text-center">
                      <Badge className="bg-pink-500 text-white text-lg px-4 py-2">
                        {cakeDecorations.length}/10 Decorations
                      </Badge>
                    </div>
                  </>
                )}
              </div>

              <Button
                onClick={submitCake}
                disabled={!selectedTheme || cakeDecorations.length === 0}
                className="w-full mt-6 bg-pink-500 hover:bg-pink-600 text-white py-6 text-xl"
              >
                Submit to Judges! 🏆
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CakeDecorating;
