import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Sparkles, Heart, Star, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FashionDesignerGameProps {
  onBack: () => void;
}

const DRESS_STYLES = [
  { name: "A-línia", emoji: "👗", color: "#FF1493" },
  { name: "Morská panna", emoji: "👗", color: "#9370DB" },
  { name: "Princezná", emoji: "👗", color: "#FFD700" },
  { name: "Puzdrové", emoji: "👗", color: "#00CED1" },
];

const COLORS = [
  { name: "Červená", color: "#DC143C" },
  { name: "Modrá", color: "#1E90FF" },
  { name: "Fialová", color: "#9370DB" },
  { name: "Ružová", color: "#FF69B4" },
  { name: "Zelená", color: "#00FA9A" },
  { name: "Zlatá", color: "#FFD700" },
  { name: "Strieborná", color: "#C0C0C0" },
  { name: "Čierna", color: "#000000" },
];

const ACCESSORIES = [
  { name: "Náušnice", icon: "💎", category: "jewelry" },
  { name: "Náhrdelník", icon: "📿", category: "jewelry" },
  { name: "Náramok", icon: "⌚", category: "jewelry" },
  { name: "Koruna", icon: "👑", category: "head" },
  { name: "Kabelka", icon: "👜", category: "bag" },
  { name: "Topánky", icon: "👠", category: "shoes" },
];

export const FashionDesignerGame = ({ onBack }: FashionDesignerGameProps) => {
  const { toast } = useToast();
  const [selectedStyle, setSelectedStyle] = useState(DRESS_STYLES[0]);
  const [selectedColor, setSelectedColor] = useState(COLORS[0].color);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [designName, setDesignName] = useState("");
  const [savedDesigns, setSavedDesigns] = useState<number>(0);

  const toggleAccessory = (accessory: string) => {
    if (selectedAccessories.includes(accessory)) {
      setSelectedAccessories(selectedAccessories.filter(a => a !== accessory));
    } else {
      setSelectedAccessories([...selectedAccessories, accessory]);
    }
  };

  const saveDesign = () => {
    if (!designName.trim()) {
      toast({
        title: "⚠️ Chyba",
        description: "Zadaj názov tvojho dizajnu!",
        variant: "destructive",
      });
      return;
    }

    setSavedDesigns(savedDesigns + 1);
    toast({
      title: "✨ Dizajn uložený!",
      description: `"${designName}" bol úspešne uložený do galérie.`,
    });
    
    // Reset
    setDesignName("");
  };

  const resetDesign = () => {
    setSelectedStyle(DRESS_STYLES[0]);
    setSelectedColor(COLORS[0].color);
    setSelectedAccessories([]);
    setDesignName("");
    
    toast({
      title: "🔄 Reset",
      description: "Dizajn bol vymazaný",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-rose-400 pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Späť
          </Button>
          <h1 className="text-3xl font-bold text-white">✨ Fashion Designer Gala</h1>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-lg">
            <Crown className="h-5 w-5 text-yellow-300" />
            <span className="text-white font-semibold">{savedDesigns} dizajnov</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Model Display */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-white/95 backdrop-blur">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Tvoj dizajn</h2>
                <input
                  type="text"
                  value={designName}
                  onChange={(e) => setDesignName(e.target.value)}
                  placeholder="Názov dizajnu..."
                  className="text-lg text-center border-b-2 border-pink-300 focus:border-pink-500 outline-none px-4 py-2 w-64"
                />
              </div>

              {/* Model */}
              <div className="relative mx-auto w-64 h-96 flex flex-col items-center justify-center bg-gradient-to-b from-pink-50 to-purple-50 rounded-lg border-4 border-pink-200 shadow-xl">
                {/* Head */}
                <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-pink-300"></div>
                  {selectedAccessories.includes("Koruna") && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-3xl">
                      👑
                    </div>
                  )}
                </div>

                {/* Dress */}
                <div className="relative">
                  <div
                    className="text-8xl transition-all duration-300 filter drop-shadow-lg"
                    style={{ color: selectedColor }}
                  >
                    {selectedStyle.emoji}
                  </div>
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-sm font-semibold text-white bg-pink-500 px-2 py-1 rounded-full">
                    {selectedStyle.name}
                  </div>
                </div>

                {/* Accessories */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {selectedAccessories.includes("Topánky") && (
                    <span className="text-3xl">👠</span>
                  )}
                </div>

                <div className="absolute top-1/2 left-2 transform -translate-y-1/2 flex flex-col gap-2">
                  {selectedAccessories.includes("Kabelka") && (
                    <span className="text-2xl">👜</span>
                  )}
                </div>

                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 flex gap-3">
                  {selectedAccessories.includes("Náhrdelník") && (
                    <span className="text-2xl">📿</span>
                  )}
                </div>

                <div className="absolute top-16 left-6 flex gap-1">
                  {selectedAccessories.includes("Náušnice") && (
                    <span className="text-xl">💎</span>
                  )}
                </div>

                <div className="absolute top-16 right-6 flex gap-1">
                  {selectedAccessories.includes("Náušnice") && (
                    <span className="text-xl">💎</span>
                  )}
                </div>

                <div className="absolute top-32 right-4">
                  {selectedAccessories.includes("Náramok") && (
                    <span className="text-xl">⌚</span>
                  )}
                </div>
              </div>

              <div className="mt-6 flex gap-3 justify-center">
                <Button onClick={saveDesign} className="flex-1 max-w-xs" size="lg">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Uložiť dizajn
                </Button>
                <Button onClick={resetDesign} variant="secondary" size="lg">
                  🔄 Reset
                </Button>
              </div>
            </Card>
          </div>

          {/* Design Tools */}
          <div className="space-y-4">
            {/* Dress Styles */}
            <Card className="p-4 bg-white/95 backdrop-blur">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                Štýl šiat
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {DRESS_STYLES.map((style) => (
                  <button
                    key={style.name}
                    onClick={() => setSelectedStyle(style)}
                    className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                      selectedStyle.name === style.name
                        ? 'border-pink-500 bg-pink-50 scale-105'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    <div className="text-3xl mb-1">{style.emoji}</div>
                    <p className="text-xs font-semibold">{style.name}</p>
                  </button>
                ))}
              </div>
            </Card>

            {/* Colors */}
            <Card className="p-4 bg-white/95 backdrop-blur">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                Farba
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

            {/* Accessories */}
            <Card className="p-4 bg-white/95 backdrop-blur">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                Doplnky
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {ACCESSORIES.map((accessory) => (
                  <button
                    key={accessory.name}
                    onClick={() => toggleAccessory(accessory.name)}
                    className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                      selectedAccessories.includes(accessory.name)
                        ? 'border-pink-500 bg-pink-50 scale-105'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    <div className="text-2xl mb-1">{accessory.icon}</div>
                    <p className="text-xs">{accessory.name}</p>
                  </button>
                ))}
              </div>
            </Card>

            {/* Instructions */}
            <Card className="p-4 bg-white/95 backdrop-blur">
              <h3 className="font-semibold mb-2 text-sm">Návod:</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>1. Vyber štýl šiat</li>
                <li>2. Vyber farbu</li>
                <li>3. Pridaj doplnky</li>
                <li>4. Pomenuj dizajn</li>
                <li>5. Ulož do galérie!</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};