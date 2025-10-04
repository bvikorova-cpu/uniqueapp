import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Star, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LEVELS = [
  { level: 1, theme: "Plážový outfit", target: ["👙", "🩴", "😎"] },
  { level: 2, theme: "Večerná róba", target: ["👗", "👠", "💄"] },
  { level: 3, theme: "Športový štýl", target: ["👟", "🏃‍♀️", "⚽"] },
  { level: 4, theme: "Zimný outfit", target: ["🧥", "🧤", "🎿"] },
  { level: 5, theme: "Jarný look", target: ["🌸", "👒", "🌺"] },
  { level: 6, theme: "Letná párty", target: ["🎉", "🍹", "🕺"] },
  { level: 7, theme: "Biznis štýl", target: ["💼", "👔", "📊"] },
  { level: 8, theme: "Romantika", target: ["💕", "🌹", "💐"] },
  { level: 9, theme: "Halloween", target: ["🎃", "👻", "🦇"] },
  { level: 10, theme: "Vianočný outfit", target: ["🎄", "🎅", "⛄"] },
];

const ITEMS = {
  clothes: ["👗", "👙", "👚", "👕", "🧥", "👔"],
  shoes: ["👠", "👟", "🩴", "🥾"],
  accessories: ["😎", "💄", "👒", "🧤", "💼"],
  activities: ["🏃‍♀️", "⚽", "🎿", "🕺", "📊"],
  decorations: ["🌸", "🌺", "🎉", "🍹", "💕", "🌹", "💐", "🎃", "👻", "🦇", "🎄", "🎅", "⛄"],
};

interface BarbieGameProps {
  onBack: () => void;
}

export const BarbieGame = ({ onBack }: BarbieGameProps) => {
  const { toast } = useToast();
  const [currentLevel, setCurrentLevel] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);

  const levelData = LEVELS[currentLevel];

  const handleItemClick = (item: string) => {
    if (selected.includes(item)) {
      setSelected(selected.filter((i) => i !== item));
    } else if (selected.length < 3) {
      const newSelected = [...selected, item];
      setSelected(newSelected);

      if (newSelected.length === 3) {
        checkOutfit(newSelected);
      }
    }
  };

  const checkOutfit = (outfit: string[]) => {
    const isCorrect = levelData.target.every((item) => outfit.includes(item));

    setTimeout(() => {
      if (isCorrect) {
        toast({
          title: "🎉 Perfektný outfit!",
          description: `Dokončila si úroveň ${levelData.level}!`,
        });

        setTimeout(() => {
          if (currentLevel < LEVELS.length - 1) {
            setCurrentLevel(currentLevel + 1);
            setSelected([]);
          } else {
            toast({
              title: "👑 Módna ikona!",
              description: "Dokončila si všetky úrovne!",
            });
          }
        }, 1500);
      } else {
        toast({
          title: "Skús znova",
          description: "Tento outfit nesedí k téme.",
          variant: "destructive",
        });
        setSelected([]);
      }
    }, 500);
  };

  const resetLevel = () => {
    setSelected([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 to-rose-500 pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Späť
          </Button>
          <Button onClick={resetLevel} variant="secondary">
            Resetovať
          </Button>
        </div>

        <Card className="p-6 mb-6 bg-white/95 backdrop-blur">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="h-6 w-6 text-yellow-500" />
              <h2 className="text-2xl font-bold">Úroveň {levelData.level}</h2>
            </div>
            <p className="text-lg text-muted-foreground">{levelData.theme}</p>
          </div>

          <div className="bg-pink-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground mb-2">Vyber 3 položky pre tento outfit:</p>
            <div className="flex justify-center gap-4">
              {selected.map((item, i) => (
                <div key={i} className="text-5xl">{item}</div>
              ))}
              {Array(3 - selected.length)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="w-16 h-16 border-2 border-dashed border-pink-300 rounded-lg" />
                ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Oblečenie</h3>
              <div className="grid grid-cols-6 gap-2">
                {ITEMS.clothes.map((item) => (
                  <button
                    key={item}
                    onClick={() => handleItemClick(item)}
                    className={`aspect-square text-3xl bg-white rounded-lg hover:scale-110 transition-all ${
                      selected.includes(item) ? "ring-4 ring-pink-500 scale-110" : ""
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Topánky</h3>
              <div className="grid grid-cols-6 gap-2">
                {ITEMS.shoes.map((item) => (
                  <button
                    key={item}
                    onClick={() => handleItemClick(item)}
                    className={`aspect-square text-3xl bg-white rounded-lg hover:scale-110 transition-all ${
                      selected.includes(item) ? "ring-4 ring-pink-500 scale-110" : ""
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Doplnky</h3>
              <div className="grid grid-cols-6 gap-2">
                {[...ITEMS.accessories, ...ITEMS.activities, ...ITEMS.decorations].map((item) => (
                  <button
                    key={item}
                    onClick={() => handleItemClick(item)}
                    className={`aspect-square text-3xl bg-white rounded-lg hover:scale-110 transition-all ${
                      selected.includes(item) ? "ring-4 ring-pink-500 scale-110" : ""
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
