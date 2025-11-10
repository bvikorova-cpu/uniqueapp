import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Sparkles, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function CreateCharacter() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [characterName, setCharacterName] = useState("");
  const [selectedHair, setSelectedHair] = useState("brown");
  const [selectedPower, setSelectedPower] = useState("flying");
  const [isGenerating, setIsGenerating] = useState(false);

  const hairColors = [
    { id: "brown", name: "Brown", emoji: "🟤" },
    { id: "black", name: "Black", emoji: "⚫" },
    { id: "blonde", name: "Blonde", emoji: "🟡" },
    { id: "red", name: "Red", emoji: "🔴" },
    { id: "blue", name: "Blue", emoji: "🔵" },
    { id: "pink", name: "Pink", emoji: "💗" },
    { id: "rainbow", name: "Rainbow", emoji: "🌈" }
  ];

  const superPowers = [
    { id: "flying", name: "Flying", emoji: "🦅" },
    { id: "super-strength", name: "Super Strength", emoji: "💪" },
    { id: "invisibility", name: "Invisibility", emoji: "👻" },
    { id: "talking-to-animals", name: "Talk to Animals", emoji: "🦊" },
    { id: "magic-spells", name: "Magic Spells", emoji: "✨" },
    { id: "super-speed", name: "Super Speed", emoji: "⚡" }
  ];

  const handleCreateStory = async () => {
    if (!characterName.trim()) {
      toast({
        title: "Name Required",
        description: "Please give your hero a name!",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate story generation
    setTimeout(() => {
      toast({
        title: "Character Created! 🎉",
        description: `${characterName} is ready for adventure!`
      });
      setIsGenerating(false);
      // In real app, navigate to story with character
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 animate-fade-in">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <Button
          variant="ghost"
          onClick={() => navigate("/kids-channel")}
          className="mb-6 hover:bg-white/70 hover-scale transition-all"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Kids Channel
        </Button>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/95 backdrop-blur-sm border-4 border-yellow-300 shadow-2xl mb-8 animate-scale-in overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-yellow-300/30 to-transparent rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-300/30 to-transparent rounded-full -ml-12 -mb-12" />
            <CardHeader className="text-center relative z-10">
              <CardTitle className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 animate-fade-in">
                Create Your Hero! 🦸‍♀️✨
              </CardTitle>
              <CardDescription className="text-xl text-gray-700 font-medium">
                Design your own character and become the star of your story!
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Character Preview */}
            <Card className="bg-gradient-to-br from-white to-purple-50 border-4 border-purple-300 shadow-2xl hover-scale transition-all duration-300">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="bg-gradient-to-br from-yellow-200 via-pink-200 to-purple-300 rounded-full w-52 h-52 mx-auto mb-6 flex items-center justify-center shadow-xl animate-scale-in relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full" />
                    <div className="text-9xl animate-pulse relative z-10">
                      {selectedPower === "flying" && "🦅"}
                      {selectedPower === "super-strength" && "💪"}
                      {selectedPower === "invisibility" && "👻"}
                      {selectedPower === "talking-to-animals" && "🦊"}
                      {selectedPower === "magic-spells" && "✨"}
                      {selectedPower === "super-speed" && "⚡"}
                    </div>
                  </div>
                  
                  <h3 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                    {characterName || "Your Hero"}
                  </h3>
                  
                  <div className="space-y-3 text-lg">
                    <div className="bg-white/60 rounded-full px-4 py-2 inline-block shadow-md">
                      <p className="text-gray-800 font-semibold">
                        Hair: {hairColors.find(h => h.id === selectedHair)?.emoji} {hairColors.find(h => h.id === selectedHair)?.name}
                      </p>
                    </div>
                    <div className="bg-white/60 rounded-full px-4 py-2 inline-block shadow-md">
                      <p className="text-gray-800 font-semibold">
                        Power: {superPowers.find(p => p.id === selectedPower)?.emoji} {superPowers.find(p => p.id === selectedPower)?.name}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Character Customization */}
            <div className="space-y-6">
              {/* Name Input */}
              <Card className="bg-white/95 border-3 border-blue-300 shadow-lg hover-scale transition-all">
                <CardContent className="p-6">
                  <Label className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 block">
                    What's your hero's name? 📝
                  </Label>
                  <Input
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    placeholder="Enter a cool name..."
                    className="text-lg mt-2 border-2 border-blue-200 focus:border-purple-400 transition-colors"
                  />
                </CardContent>
              </Card>

              {/* Hair Color Selection */}
              <Card className="bg-white/95 border-3 border-pink-300 shadow-lg hover-scale transition-all">
                <CardContent className="p-6">
                  <Label className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4 block">
                    Choose Hair Color 🎨
                  </Label>
                  <div className="grid grid-cols-4 gap-3">
                    {hairColors.map((hair) => (
                      <Button
                        key={hair.id}
                        variant={selectedHair === hair.id ? "default" : "outline"}
                        onClick={() => setSelectedHair(hair.id)}
                        className={`h-20 text-2xl flex flex-col items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg ${
                          selectedHair === hair.id ? "bg-gradient-to-br from-purple-500 to-pink-500 border-3 border-yellow-300 scale-105 shadow-xl" : "border-2 border-gray-300 hover:border-purple-400"
                        }`}
                      >
                        <span className="text-3xl mb-1 animate-pulse">{hair.emoji}</span>
                        <span className="text-xs font-semibold">{hair.name}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Superpower Selection */}
              <Card className="bg-white/95 border-3 border-yellow-300 shadow-lg hover-scale transition-all">
                <CardContent className="p-6">
                  <Label className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-4 block">
                    Choose Superpower 🦸‍♀️
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {superPowers.map((power) => (
                      <Button
                        key={power.id}
                        variant={selectedPower === power.id ? "default" : "outline"}
                        onClick={() => setSelectedPower(power.id)}
                        className={`h-24 flex flex-col items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg ${
                          selectedPower === power.id ? "bg-gradient-to-br from-blue-500 to-purple-500 border-3 border-yellow-300 scale-105 shadow-xl" : "border-2 border-gray-300 hover:border-yellow-400"
                        }`}
                      >
                        <span className="text-4xl mb-1 animate-pulse">{power.emoji}</span>
                        <span className="text-xs text-center font-semibold">{power.name}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Create Story Button */}
              <Button
                onClick={handleCreateStory}
                disabled={isGenerating}
                className="w-full text-2xl py-9 bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 hover:from-green-500 hover:via-blue-600 hover:to-purple-600 text-white font-bold shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 border-4 border-white/50 rounded-2xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/20 via-pink-300/20 to-purple-300/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                {isGenerating ? (
                  <>
                    <Sparkles className="mr-2 h-7 w-7 animate-spin" />
                    Creating Your Adventure...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-7 w-7 animate-bounce" />
                    Start My Adventure! 🚀
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
