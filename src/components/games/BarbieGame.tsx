import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Sparkles, Heart, Star, Circle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BarbieGameProps {
  onBack: () => void;
}

const COLORS = [
  { name: "Ružová", color: "#FF69B4" },
  { name: "Červená", color: "#FF0000" },
  { name: "Fialová", color: "#9370DB" },
  { name: "Modrá", color: "#00BFFF" },
  { name: "Zelená", color: "#00FF7F" },
  { name: "Žltá", color: "#FFD700" },
  { name: "Oranžová", color: "#FF8C00" },
  { name: "Biela", color: "#FFFFFF" },
];

const PATTERNS = [
  { name: "Hviezdička", icon: Star },
  { name: "Srdiečko", icon: Heart },
  { name: "Bodka", icon: Circle },
  { name: "Trblietky", icon: Sparkles },
];

type NailDesign = {
  color: string;
  pattern?: string;
};

export const BarbieGame = ({ onBack }: BarbieGameProps) => {
  const { toast } = useToast();
  const [selectedColor, setSelectedColor] = useState(COLORS[0].color);
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [nails, setNails] = useState<NailDesign[]>(
    Array(10).fill({ color: "#FFB6C1" })
  );
  const [selectedNail, setSelectedNail] = useState<number | null>(null);

  const applyToNail = (index: number) => {
    const newNails = [...nails];
    newNails[index] = {
      color: selectedColor,
      pattern: selectedPattern || undefined,
    };
    setNails(newNails);
    setSelectedNail(index);
    
    toast({
      title: "✨ Krásne!",
      description: "Necht bol upravený",
    });
  };

  const applyToAll = () => {
    const newNails = Array(10).fill({
      color: selectedColor,
      pattern: selectedPattern || undefined,
    });
    setNails(newNails);
    
    toast({
      title: "💅 Perfektné!",
      description: "Všetky nechty boli upravené",
    });
  };

  const resetNails = () => {
    setNails(Array(10).fill({ color: "#FFB6C1" }));
    setSelectedNail(null);
    
    toast({
      title: "🔄 Reset",
      description: "Nechty boli vyčistené",
    });
  };

  const getPatternIcon = (patternName?: string) => {
    if (!patternName) return null;
    return PATTERNS.find(p => p.name === patternName)?.icon || null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 to-rose-500 pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Späť
          </Button>
          <h1 className="text-3xl font-bold text-white">💅 Barbie Summer Nails</h1>
          <div className="w-20"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hands Display */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-white/95 backdrop-blur">
              <h2 className="text-xl font-bold mb-6 text-center">Tvoje ruky</h2>
              
              {/* Left Hand */}
              <div className="mb-8">
                <p className="text-sm text-muted-foreground mb-3">Ľavá ruka</p>
                <div className="flex justify-center gap-2">
                  {[0, 1, 2, 3, 4].map((index) => {
                    const PatternIcon = getPatternIcon(nails[index].pattern);
                    return (
                      <button
                        key={index}
                        onClick={() => applyToNail(index)}
                        className={`relative group ${
                          selectedNail === index ? 'scale-110' : ''
                        } transition-transform`}
                      >
                        <div
                          className="w-16 h-24 rounded-t-full rounded-b-lg border-2 border-pink-300 hover:scale-105 transition-all cursor-pointer shadow-lg"
                          style={{ backgroundColor: nails[index].color }}
                        >
                          {PatternIcon && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <PatternIcon className="h-6 w-6 text-white/80" />
                            </div>
                          )}
                        </div>
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Sparkles className="h-4 w-4 text-yellow-400" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Hand */}
              <div>
                <p className="text-sm text-muted-foreground mb-3">Pravá ruka</p>
                <div className="flex justify-center gap-2">
                  {[5, 6, 7, 8, 9].map((index) => {
                    const PatternIcon = getPatternIcon(nails[index].pattern);
                    return (
                      <button
                        key={index}
                        onClick={() => applyToNail(index)}
                        className={`relative group ${
                          selectedNail === index ? 'scale-110' : ''
                        } transition-transform`}
                      >
                        <div
                          className="w-16 h-24 rounded-t-full rounded-b-lg border-2 border-pink-300 hover:scale-105 transition-all cursor-pointer shadow-lg"
                          style={{ backgroundColor: nails[index].color }}
                        >
                          {PatternIcon && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <PatternIcon className="h-6 w-6 text-white/80" />
                            </div>
                          )}
                        </div>
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Sparkles className="h-4 w-4 text-yellow-400" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>

          {/* Tools Panel */}
          <div className="space-y-4">
            {/* Colors */}
            <Card className="p-4 bg-white/95 backdrop-blur">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Circle className="h-4 w-4" />
                Farby laku
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {COLORS.map((colorObj) => (
                  <button
                    key={colorObj.color}
                    onClick={() => setSelectedColor(colorObj.color)}
                    className={`w-12 h-12 rounded-full border-4 transition-all hover:scale-110 ${
                      selectedColor === colorObj.color
                        ? 'border-pink-500 scale-110 shadow-lg'
                        : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: colorObj.color }}
                    title={colorObj.name}
                  />
                ))}
              </div>
            </Card>

            {/* Patterns */}
            <Card className="p-4 bg-white/95 backdrop-blur">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Vzory
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {PATTERNS.map((pattern) => {
                  const Icon = pattern.icon;
                  return (
                    <button
                      key={pattern.name}
                      onClick={() => setSelectedPattern(
                        selectedPattern === pattern.name ? null : pattern.name
                      )}
                      className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                        selectedPattern === pattern.name
                          ? 'border-pink-500 bg-pink-50 scale-105'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      <Icon className="h-6 w-6 mx-auto mb-1" />
                      <p className="text-xs">{pattern.name}</p>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Actions */}
            <Card className="p-4 bg-white/95 backdrop-blur space-y-2">
              <Button
                onClick={applyToAll}
                className="w-full"
                variant="default"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Aplikovať na všetky
              </Button>
              <Button
                onClick={resetNails}
                className="w-full"
                variant="secondary"
              >
                🔄 Reset
              </Button>
            </Card>

            {/* Instructions */}
            <Card className="p-4 bg-white/95 backdrop-blur">
              <h3 className="font-semibold mb-2 text-sm">Ako hrať:</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>1. Vyber farbu laku</li>
                <li>2. Vyber vzor (voliteľne)</li>
                <li>3. Klikni na necht</li>
                <li>4. Alebo aplikuj na všetky</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};