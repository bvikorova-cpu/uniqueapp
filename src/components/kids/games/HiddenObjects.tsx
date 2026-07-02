import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Star } from "lucide-react";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface HiddenObjectsProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

const objects = [
  { emoji: "⭐", name: "star", x: 20, y: 30 },
  { emoji: "🌙", name: "moon", x: 70, y: 20 },
  { emoji: "🎈", name: "balloon", x: 40, y: 60 },
  { emoji: "🎁", name: "gift", x: 80, y: 70 },
  { emoji: "🦋", name: "butterfly", x: 15, y: 80 },
  { emoji: "🌸", name: "flower", x: 60, y: 45 },
];

export const HiddenObjects = ({ onComplete, onBack }: HiddenObjectsProps) => {
  const [foundObjects, setFoundObjects] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      setGameOver(true);
      const score = foundObjects.size * 20;
      toast.error(`Time's up! Score: ${score}`);
      setTimeout(() => onComplete(score), 2000);
      return;
    }

    if (foundObjects.size === objects.length) {
      setGameOver(true);
      const bonus = timeLeft * 2;
      const score = foundObjects.size * 20 + bonus;
      toast.success(`Amazing! Found everything! +${bonus} bonus`);
      setTimeout(() => onComplete(score), 2000);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return (
    <>
      <FloatingHowItWorks title={"Hidden Objects - How it works"} steps={[{ title: 'Open', desc: 'Access the Hidden Objects section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Hidden Objects.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => clearInterval(timer);
  }, [timeLeft, foundObjects]);

  const handleObjectClick = (index: number) => {
    if (gameOver || foundObjects.has(index)) return;

    const newFound = new Set(foundObjects);
    newFound.add(index);
    setFoundObjects(newFound);
    toast.success(`Found the ${objects[index].name}! 🎉`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-100 via-pink-100 to-purple-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack} className="hover:bg-white/50">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex gap-6 text-lg font-bold">
            <span className="text-red-600">Time: {timeLeft}s</span>
            <span className="text-green-600">
              Found: {foundObjects.size}/{objects.length}
            </span>
          </div>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm border-4 border-white/50 shadow-2xl mb-6">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold text-red-600 text-center mb-4">
              Hidden Objects 🔍
            </h2>
            <p className="text-center text-gray-700 mb-6">
              Find all the hidden objects before time runs out!
            </p>

            <div className="mb-6 flex flex-wrap justify-center gap-3">
              {objects.map((obj, index) => (
                <div
                  key={index}
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    foundObjects.has(index)
                      ? "bg-green-200 text-green-700 line-through"
                      : "bg-yellow-200 text-yellow-700"
                  }`}
                >
                  {obj.emoji} {obj.name}
                </div>
              ))}
            </div>

            <div className="relative bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 rounded-xl h-96 overflow-hidden border-4 border-purple-300">
              {objects.map((obj, index) => (
                <button
                  key={index}
                  onClick={() => handleObjectClick(index)}
                  disabled={foundObjects.has(index)}
                  className={`absolute text-4xl transition-all duration-300 ${
                    foundObjects.has(index)
                      ? "opacity-30 scale-75"
                      : "hover:scale-125 cursor-pointer animate-pulse"
                  }`}
                  style={{
                    left: `${obj.x}%`,
                    top: `${obj.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {obj.emoji}
                </button>
              ))}

              <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <Star
                    key={i}
                    className="absolute text-yellow-300 opacity-30"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      fontSize: `${Math.random() * 20 + 10}px`,
                    }}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
