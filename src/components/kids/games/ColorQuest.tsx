import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface ColorQuestProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

const colors = [
  { name: "Red", value: "#ef4444" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#22c55e" },
  { name: "Yellow", value: "#eab308" },
  { name: "Purple", value: "#a855f7" },
  { name: "Orange", value: "#f97316" },
  { name: "Pink", value: "#ec4899" },
  { name: "Brown", value: "#92400e" },
];

const shapes = [
  { id: 1, path: "M50,10 L90,90 L10,90 Z", name: "Triangle" },
  { id: 2, path: "M10,10 L90,10 L90,90 L10,90 Z", name: "Square" },
  { id: 3, path: "M50,50 m-40,0 a40,40 0 1,0 80,0 a40,40 0 1,0 -80,0", name: "Circle" },
  { id: 4, path: "M50,10 L90,30 L75,70 L25,70 L10,30 Z", name: "Star" },
  { id: 5, path: "M30,90 L50,10 L70,90 Z M20,50 L80,50", name: "Heart" },
  { id: 6, path: "M10,40 L40,10 L90,10 L90,60 L60,90 L10,90 Z", name: "Hexagon" },
];

export const ColorQuest = ({ onComplete, onBack }: ColorQuestProps) => {
  const [selectedColor, setSelectedColor] = useState(colors[0].value);
  const [coloredShapes, setColoredShapes] = useState<{ [key: number]: string }>({});
  const [coloredCount, setColoredCount] = useState(0);

  const handleShapeClick = (shapeId: number) => {
    if (!coloredShapes[shapeId]) {
      setColoredCount(coloredCount + 1);
    }
    
    setColoredShapes({
      ...coloredShapes,
      [shapeId]: selectedColor,
    });

    if (coloredCount + 1 === shapes.length) {
      toast.success("Excellent! You colored all the shapes! 🎨");
      setTimeout(() => onComplete(100), 1500);
    }
  };

  const handleClear = () => {
    setColoredShapes({});
    setColoredCount(0);
  };

  return (
    <>
      <FloatingHowItWorks title={"Color Quest - How it works"} steps={[{ title: 'Open', desc: 'Access the Color Quest section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Color Quest.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="min-h-screen bg-gradient-to-b from-red-100 via-pink-100 to-purple-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack} className="hover:bg-white/50">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="text-lg font-bold text-green-600">
            Colored: {coloredCount}/{shapes.length}
          </div>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm border-4 border-white/50 shadow-2xl mb-6">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold text-red-600 text-center mb-4">
              Color Quest 🎨
            </h2>
            <p className="text-center text-gray-700 mb-6">
              Choose a color and click on the shape you want to paint!
            </p>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Choose a color:</h3>
              <div className="flex flex-wrap gap-3 justify-center">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedColor(color.value)}
                    className={`w-16 h-16 rounded-full transition-all ${
                      selectedColor === color.value
                        ? "ring-4 ring-purple-500 scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border-4 border-purple-200 mb-6">
              <div className="grid grid-cols-3 gap-6">
                {shapes.map((shape) => (
                  <button
                    key={shape.id}
                    onClick={() => handleShapeClick(shape.id)}
                    className="aspect-square hover:scale-105 transition-transform"
                  >
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <path
                        d={shape.path}
                        fill={coloredShapes[shape.id] || "#e5e7eb"}
                        stroke="#9333ea"
                        strokeWidth="2"
                      />
                    </svg>
                    <p className="text-sm font-semibold text-gray-600 mt-2">
                      {shape.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button
                onClick={handleClear}
                variant="outline"
                className="border-2"
              >
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
};
