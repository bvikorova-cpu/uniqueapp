import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Trash2 } from "lucide-react";

interface NailState {
  baseColor: string;
  pattern: string;
  decoration: string;
}

const COLORS = [
  { name: "Pink", value: "#FF69B4" },
  { name: "Red", value: "#DC143C" },
  { name: "Purple", value: "#9370DB" },
  { name: "Blue", value: "#4169E1" },
  { name: "Turquoise", value: "#40E0D0" },
  { name: "Green", value: "#32CD32" },
  { name: "Yellow", value: "#FFD700" },
  { name: "Orange", value: "#FF8C00" },
  { name: "Biela", value: "#FFFFFF" },
  { name: "Black", value: "#000000" },
];

const PATTERNS = [
  { name: "None", value: "none" },
  { name: "Bodky", value: "polka" },
  { name: "Pruhy", value: "stripes" },
  { name: "Stars", value: "stars" },
  { name: "Kvietky", value: "flowers" },
  { name: "Gradient", value: "gradient" },
];

const DECORATIONS = [
  { name: "None", value: "none" },
  { name: "Diamant", value: "💎" },
  { name: "Hviezda", value: "⭐" },
  { name: "Srdce", value: "❤️" },
  { name: "Kvet", value: "🌸" },
  { name: "Trblietky", value: "✨" },
];

export const NailSalonGame = () => {
  const [selectedNail, setSelectedNail] = useState<number>(0);
  const [nails, setNails] = useState<NailState[]>(
    Array(10).fill(null).map(() => ({
      baseColor: "#FFB6C1",
      pattern: "none",
      decoration: "none",
    }))
  );
  const [selectedColor, setSelectedColor] = useState<string>("#FF69B4");
  const [selectedPattern, setSelectedPattern] = useState<string>("none");
  const [selectedDecoration, setSelectedDecoration] = useState<string>("none");

  const applyToNail = () => {
    const newNails = [...nails];
    newNails[selectedNail] = {
      baseColor: selectedColor,
      pattern: selectedPattern,
      decoration: selectedDecoration,
    };
    setNails(newNails);
  };

  const applyToAll = () => {
    const newNails = Array(10).fill(null).map(() => ({
      baseColor: selectedColor,
      pattern: selectedPattern,
      decoration: selectedDecoration,
    }));
    setNails(newNails);
  };

  const resetNails = () => {
    const newNails = Array(10).fill(null).map(() => ({
      baseColor: "#FFB6C1",
      pattern: "none",
      decoration: "none",
    }));
    setNails(newNails);
  };

  const getNailStyle = (nail: NailState) => {
    let background = nail.baseColor;
    
    if (nail.pattern === "polka") {
      background = `radial-gradient(circle at 25% 25%, white 2px, transparent 2px),
                    radial-gradient(circle at 75% 75%, white 2px, transparent 2px),
                    ${nail.baseColor}`;
    } else if (nail.pattern === "stripes") {
      background = `repeating-linear-gradient(45deg, ${nail.baseColor}, ${nail.baseColor} 10px, white 10px, white 12px)`;
    } else if (nail.pattern === "stars") {
      background = `${nail.baseColor}`;
    } else if (nail.pattern === "gradient") {
      const lighterColor = adjustBrightness(nail.baseColor, 40);
      background = `linear-gradient(135deg, ${nail.baseColor}, ${lighterColor})`;
    }

    return { background };
  };

  const adjustBrightness = (color: string, percent: number) => {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;
    return `#${(
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-pink-600 mb-2 flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8" />
            Barbie Summer Nail Salon
            <Sparkles className="w-8 h-8" />
          </h1>
          <p className="text-gray-600">Create beautiful summer nails!</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Hands Display */}
          <Card className="bg-white/80 backdrop-blur">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-center">Tvoje Nechty</h2>
              
              {/* Left Hand */}
              <div className="mb-8">
                <p className="text-sm text-gray-500 mb-3 text-center">Left hand</p>
                <div className="flex justify-center gap-2">
                  {nails.slice(0, 5).map((nail, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedNail(index)}
                      className={`relative cursor-pointer transition-transform hover:scale-110 ${
                        selectedNail === index ? "scale-110 ring-4 ring-pink-400" : ""
                      }`}
                    >
                      <div
                        className="w-16 h-24 rounded-t-full rounded-b-lg shadow-lg border-2 border-gray-200"
                        style={getNailStyle(nail)}
                      >
                        {nail.pattern === "stars" && (
                          <div className="absolute inset-0 flex items-center justify-center text-2xl">
                            ⭐
                          </div>
                        )}
                        {nail.pattern === "flowers" && (
                          <div className="absolute inset-0 flex items-center justify-center text-2xl">
                            🌸
                          </div>
                        )}
                        {nail.decoration !== "none" && (
                          <div className="absolute top-1 right-1 text-xl">
                            {nail.decoration}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Hand */}
              <div>
                <p className="text-sm text-gray-500 mb-3 text-center">Right hand</p>
                <div className="flex justify-center gap-2">
                  {nails.slice(5, 10).map((nail, index) => (
                    <div
                      key={index + 5}
                      onClick={() => setSelectedNail(index + 5)}
                      className={`relative cursor-pointer transition-transform hover:scale-110 ${
                        selectedNail === index + 5 ? "scale-110 ring-4 ring-pink-400" : ""
                      }`}
                    >
                      <div
                        className="w-16 h-24 rounded-t-full rounded-b-lg shadow-lg border-2 border-gray-200"
                        style={getNailStyle(nail)}
                      >
                        {nail.pattern === "stars" && (
                          <div className="absolute inset-0 flex items-center justify-center text-2xl">
                            ⭐
                          </div>
                        )}
                        {nail.pattern === "flowers" && (
                          <div className="absolute inset-0 flex items-center justify-center text-2xl">
                            🌸
                          </div>
                        )}
                        {nail.decoration !== "none" && (
                          <div className="absolute top-1 right-1 text-xl">
                            {nail.decoration}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Controls */}
          <Card className="bg-white/80 backdrop-blur">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-xl font-semibold text-center">Tools</h2>

              {/* Color Picker */}
              <div>
                <h3 className="font-semibold mb-3 text-sm">Farba laku</h3>
                <div className="grid grid-cols-5 gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setSelectedColor(color.value)}
                      className={`w-full h-12 rounded-lg border-2 transition-all hover:scale-110 ${
                        selectedColor === color.value
                          ? "border-pink-500 scale-110 ring-2 ring-pink-300"
                          : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Pattern Picker */}
              <div>
                <h3 className="font-semibold mb-3 text-sm">Vzor</h3>
                <div className="grid grid-cols-3 gap-2">
                  {PATTERNS.map((pattern) => (
                    <Button
                      key={pattern.value}
                      onClick={() => setSelectedPattern(pattern.value)}
                      variant={selectedPattern === pattern.value ? "default" : "outline"}
                      className="text-xs h-auto py-2"
                    >
                      {pattern.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Decoration Picker */}
              <div>
                <h3 className="font-semibold mb-3 text-sm">Decoration</h3>
                <div className="grid grid-cols-3 gap-2">
                  {DECORATIONS.map((deco) => (
                    <Button
                      key={deco.value}
                      onClick={() => setSelectedDecoration(deco.value)}
                      variant={selectedDecoration === deco.value ? "default" : "outline"}
                      className="text-xs h-auto py-2"
                    >
                      {deco.name === "None" ? deco.name : `${deco.value} ${deco.name}`}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4 border-t">
                <Button onClick={applyToNail} className="w-full" size="lg">
                  Apply to selected nail
                </Button>
                <Button onClick={applyToAll} variant="secondary" className="w-full">
                  Apply to all nails
                </Button>
                <Button onClick={resetNails} variant="outline" className="w-full">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear all
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
