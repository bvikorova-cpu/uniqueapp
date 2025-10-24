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
    <div className="min-h-screen bg-gradient-to-b from-blue-100 via-cyan-100 to-purple-100">
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

        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/90 backdrop-blur-sm border-4 border-white/50 shadow-2xl mb-8">
            <CardHeader className="text-center">
              <CardTitle className="text-4xl font-bold text-blue-600 mb-2">
                Create Your Hero! 🦸‍♀️
              </CardTitle>
              <CardDescription className="text-lg text-gray-700">
                Design your own character and become the star of your story!
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Character Preview */}
            <Card className="bg-gradient-to-br from-white to-blue-50 border-4 border-blue-200 shadow-xl">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="bg-gradient-to-br from-blue-200 to-purple-200 rounded-full w-48 h-48 mx-auto mb-6 flex items-center justify-center shadow-lg">
                    <div className="text-8xl">
                      {selectedPower === "flying" && "🦅"}
                      {selectedPower === "super-strength" && "💪"}
                      {selectedPower === "invisibility" && "👻"}
                      {selectedPower === "talking-to-animals" && "🦊"}
                      {selectedPower === "magic-spells" && "✨"}
                      {selectedPower === "super-speed" && "⚡"}
                    </div>
                  </div>
                  
                  <h3 className="text-3xl font-bold text-blue-600 mb-2">
                    {characterName || "Your Hero"}
                  </h3>
                  
                  <div className="space-y-2 text-lg">
                    <p className="text-gray-700">
                      Hair: {hairColors.find(h => h.id === selectedHair)?.emoji} {hairColors.find(h => h.id === selectedHair)?.name}
                    </p>
                    <p className="text-gray-700">
                      Power: {superPowers.find(p => p.id === selectedPower)?.emoji} {superPowers.find(p => p.id === selectedPower)?.name}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Character Customization */}
            <div className="space-y-6">
              {/* Name Input */}
              <Card className="bg-white border-2 border-blue-200">
                <CardContent className="p-6">
                  <Label className="text-lg font-bold text-blue-600 mb-2">
                    What's your hero's name? 📝
                  </Label>
                  <Input
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    placeholder="Enter a cool name..."
                    className="text-lg mt-2"
                  />
                </CardContent>
              </Card>

              {/* Hair Color Selection */}
              <Card className="bg-white border-2 border-blue-200">
                <CardContent className="p-6">
                  <Label className="text-lg font-bold text-blue-600 mb-4 block">
                    Choose Hair Color 💇‍♀️
                  </Label>
                  <div className="grid grid-cols-4 gap-3">
                    {hairColors.map((hair) => (
                      <Button
                        key={hair.id}
                        variant={selectedHair === hair.id ? "default" : "outline"}
                        onClick={() => setSelectedHair(hair.id)}
                        className="h-20 text-2xl flex flex-col items-center justify-center"
                      >
                        <span className="text-3xl mb-1">{hair.emoji}</span>
                        <span className="text-xs">{hair.name}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Superpower Selection */}
              <Card className="bg-white border-2 border-blue-200">
                <CardContent className="p-6">
                  <Label className="text-lg font-bold text-blue-600 mb-4 block">
                    Choose Superpower 🦸‍♀️
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {superPowers.map((power) => (
                      <Button
                        key={power.id}
                        variant={selectedPower === power.id ? "default" : "outline"}
                        onClick={() => setSelectedPower(power.id)}
                        className="h-20 flex flex-col items-center justify-center"
                      >
                        <span className="text-3xl mb-1">{power.emoji}</span>
                        <span className="text-xs text-center">{power.name}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Create Story Button */}
              <Button
                onClick={handleCreateStory}
                disabled={isGenerating}
                className="w-full text-xl py-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="mr-2 h-6 w-6 animate-spin" />
                    Creating Your Adventure...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-6 w-6" />
                    Start My Adventure!
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
