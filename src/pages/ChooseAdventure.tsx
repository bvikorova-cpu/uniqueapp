import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface StoryChoice {
  text: string;
  nextStep: number;
}

interface StoryStep {
  id: number;
  text: string;
  image?: string;
  choices: StoryChoice[];
  isEnding?: boolean;
}

export default function ChooseAdventure() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [storyPath, setStoryPath] = useState<number[]>([0]);

  // Sample story - this will be AI generated
  const [story, setStory] = useState<StoryStep[]>([
    {
      id: 0,
      text: "🌟 Welcome brave adventurer! You find yourself at the edge of an enchanted forest. The trees are sparkling with magical lights, and you hear mysterious sounds. What would you like to do?",
      choices: [
        { text: "🌲 Enter the magical forest", nextStep: 1 },
        { text: "🏰 Follow the path to the castle", nextStep: 2 },
        { text: "🌊 Walk towards the glowing lake", nextStep: 3 }
      ]
    },
    {
      id: 1,
      text: "🌲 You step into the magical forest and discover a friendly talking squirrel! 'Hello friend!' it says. 'I know where the treasure is hidden!' What do you do?",
      choices: [
        { text: "🐿️ Follow the squirrel", nextStep: 4 },
        { text: "🔍 Explore on your own", nextStep: 5 }
      ]
    },
    {
      id: 2,
      text: "🏰 As you approach the castle, a kind dragon appears! 'Welcome,' she says gently. 'Would you like to see my treasure collection or join me for tea?'",
      choices: [
        { text: "✨ See the treasure", nextStep: 6 },
        { text: "🫖 Have tea with the dragon", nextStep: 7 }
      ]
    },
    {
      id: 3,
      text: "🌊 The glowing lake is magical! You see beautiful mermaids swimming and waving at you. They invite you to explore their underwater kingdom!",
      choices: [
        { text: "🧜‍♀️ Dive in and explore", nextStep: 8 },
        { text: "🏖️ Stay on the shore and watch", nextStep: 9 }
      ]
    },
    {
      id: 4,
      text: "🎉 Amazing! The squirrel leads you to a chest full of magical toys and candies! You've found the treasure! 🏆",
      choices: [],
      isEnding: true
    },
    {
      id: 5,
      text: "🔍 While exploring, you discover a secret garden filled with singing flowers! They teach you a magical song! 🎵",
      choices: [],
      isEnding: true
    },
    {
      id: 6,
      text: "💎 The dragon shows you sparkling gems and magical artifacts! She lets you choose one to keep! You're rich! 🌟",
      choices: [],
      isEnding: true
    },
    {
      id: 7,
      text: "🫖 You have the most wonderful tea party! The dragon becomes your best friend and promises to visit you! 🎊",
      choices: [],
      isEnding: true
    },
    {
      id: 8,
      text: "🐠 You discover the most beautiful underwater palace! The mermaids give you a magic pearl that grants wishes! ✨",
      choices: [],
      isEnding: true
    },
    {
      id: 9,
      text: "🌅 The mermaids perform a magical water dance just for you! It's the most beautiful thing you've ever seen! 🌈",
      choices: [],
      isEnding: true
    }
  ]);

  const handleChoice = (nextStep: number) => {
    setStoryPath([...storyPath, nextStep]);
    setCurrentStep(nextStep);
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setStoryPath([0]);
  };

  const currentStoryStep = story[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 via-purple-100 to-blue-100">
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
              <CardTitle className="text-4xl font-bold text-purple-600 mb-2">
                Choose Your Own Adventure! 🎭
              </CardTitle>
              <CardDescription className="text-lg text-gray-700">
                Make choices and create your own unique story!
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Story Progress */}
          <div className="mb-8 flex items-center justify-center gap-2">
            {storyPath.map((step, index) => (
              <div
                key={index}
                className="w-4 h-4 rounded-full bg-purple-500 animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              />
            ))}
          </div>

          {/* Story Content */}
          <Card className="bg-gradient-to-br from-white to-purple-50 border-4 border-purple-200 shadow-xl mb-8 animate-fade-in">
            <CardContent className="p-12">
              <div className="text-center mb-8">
                <Sparkles className="w-16 h-16 text-purple-500 mx-auto mb-6 animate-pulse" />
                <p className="text-2xl leading-relaxed text-gray-800 font-medium">
                  {currentStoryStep.text}
                </p>
              </div>

              {/* Choices */}
              {!currentStoryStep.isEnding && (
                <div className="space-y-4 mt-8">
                  {currentStoryStep.choices.map((choice, index) => (
                    <Button
                      key={index}
                      onClick={() => handleChoice(choice.nextStep)}
                      className="w-full text-lg py-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {choice.text}
                    </Button>
                  ))}
                </div>
              )}

              {/* Ending Options */}
              {currentStoryStep.isEnding && (
                <div className="space-y-4 mt-8">
                  <div className="text-center mb-6">
                    <p className="text-3xl font-bold text-purple-600 mb-4">
                      🎉 The End! 🎉
                    </p>
                    <p className="text-lg text-gray-700">
                      What an amazing adventure! Would you like to try a different path?
                    </p>
                  </div>
                  <Button
                    onClick={handleRestart}
                    className="w-full text-lg py-8 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    🔄 Start a New Adventure!
                  </Button>
                  <Button
                    onClick={() => navigate("/kids-channel")}
                    variant="outline"
                    className="w-full text-lg py-8 border-2 border-purple-300 hover:bg-purple-50"
                  >
                    🏠 Back to Kids Channel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
