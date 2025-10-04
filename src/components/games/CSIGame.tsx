import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Star, Search, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CASES = [
  { 
    level: 1, 
    name: "Krádež v múzeu", 
    clues: ["🔍", "👟", "🔑"], 
    scene: "🏛️",
    required: 3 
  },
  { 
    level: 2, 
    name: "Zmiznutie podnikateľa", 
    clues: ["📱", "💼", "🚗", "🔐"], 
    scene: "🏢",
    required: 4 
  },
  { 
    level: 3, 
    name: "Tajomný požiar", 
    clues: ["🔥", "⛽", "🧯", "👣", "📸"], 
    scene: "🏭",
    required: 5 
  },
  { 
    level: 4, 
    name: "Únos celebrity", 
    clues: ["📧", "💰", "🎥", "🚙", "📍", "🧤"], 
    scene: "🎬",
    required: 6 
  },
  { 
    level: 5, 
    name: "Vražda v penthouse", 
    clues: ["🔪", "💉", "🍷", "📄", "👔", "🩸", "⌚"], 
    scene: "🏙️",
    required: 7 
  },
  { 
    level: 6, 
    name: "Kybernetický útok", 
    clues: ["💻", "🔌", "📡", "💾", "🔐", "📊", "🖥️", "🔑"], 
    scene: "🏦",
    required: 8 
  },
  { 
    level: 7, 
    name: "Sériový lupič", 
    clues: ["💎", "🎭", "🧰", "🔦", "📹", "🚨", "🧲", "🗝️", "📋"], 
    scene: "💍",
    required: 9 
  },
  { 
    level: 8, 
    name: "Falšovanie dokumentov", 
    clues: ["🖊️", "📜", "🔬", "💵", "🖨️", "📑", "🔍", "✒️", "🎨", "📏"], 
    scene: "⚖️",
    required: 10 
  },
  { 
    level: 9, 
    name: "Organizovaný zločin", 
    clues: ["💰", "📞", "🔫", "🚁", "💼", "🗂️", "📡", "🎰", "🚢", "🌐", "💳"], 
    scene: "🏴‍☠️",
    required: 11 
  },
  { 
    level: 10, 
    name: "Záverečný prípad", 
    clues: ["🕵️", "🔐", "💻", "📸", "🧬", "🔬", "📊", "🗝️", "💡", "🎯", "🏆", "⚡"], 
    scene: "🏛️",
    required: 12 
  },
];

interface CSIGameProps {
  onBack: () => void;
}

export const CSIGame = ({ onBack }: CSIGameProps) => {
  const { toast } = useToast();
  const [currentLevel, setCurrentLevel] = useState(0);
  const [foundClues, setFoundClues] = useState<string[]>([]);
  const [hiddenClues, setHiddenClues] = useState<Array<{ clue: string; x: number; y: number }>>([]);
  const [timeLeft, setTimeLeft] = useState(60);

  const caseData = CASES[currentLevel];

  useState(() => {
    generateHiddenClues();
  });

  useState(() => {
    if (timeLeft <= 0) {
      toast({
        title: "⏰ Čas vypršal!",
        description: "Skús prípad znova!",
        variant: "destructive",
      });
      setTimeout(resetLevel, 1500);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  });

  const generateHiddenClues = () => {
    const clues = caseData.clues.map((clue) => ({
      clue,
      x: Math.random() * 80,
      y: Math.random() * 70,
    }));
    setHiddenClues(clues);
  };

  const handleClueClick = (clue: string) => {
    if (foundClues.includes(clue)) return;

    const newFoundClues = [...foundClues, clue];
    setFoundClues(newFoundClues);

    if (newFoundClues.length >= caseData.required) {
      toast({
        title: "🎉 Prípad vyriešený!",
        description: `${caseData.name} uzavretý!`,
      });

      setTimeout(() => {
        if (currentLevel < CASES.length - 1) {
          nextLevel();
        } else {
          toast({
            title: "🏆 Hlavný detektív!",
            description: "Vyriešil si všetky prípady!",
          });
        }
      }, 1500);
    }
  };

  const nextLevel = () => {
    const newLevel = currentLevel + 1;
    setCurrentLevel(newLevel);
    setFoundClues([]);
    setTimeLeft(60);
    generateHiddenClues();
  };

  const resetLevel = () => {
    setFoundClues([]);
    setTimeLeft(60);
    generateHiddenClues();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900 pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Späť
          </Button>
          <Button onClick={resetLevel} variant="secondary">
            Nový pokus
          </Button>
        </div>

        <Card className="p-6 mb-6 bg-slate-800/90 backdrop-blur border-blue-500/50">
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div>
              <div className="text-sm text-blue-300 mb-1">Prípad</div>
              <div className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                {caseData.level}
              </div>
            </div>
            <div>
              <div className="text-sm text-blue-300 mb-1">Stopy</div>
              <div className="text-2xl font-bold text-green-400">
                {foundClues.length} / {caseData.required}
              </div>
            </div>
            <div>
              <div className="text-sm text-blue-300 mb-1">Čas</div>
              <div className={`text-2xl font-bold ${timeLeft < 20 ? 'text-red-400' : 'text-blue-400'}`}>
                {timeLeft}s
              </div>
            </div>
          </div>

          <div className="border-t border-blue-500/30 pt-4">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                <Search className="h-6 w-6 text-blue-400" />
                {caseData.name}
              </h3>
              <p className="text-blue-300 text-sm">
                Nájdi všetky stopy na mieste činu!
              </p>
            </div>

            <div className="relative h-96 bg-slate-900/50 rounded-lg mb-4 overflow-hidden cursor-crosshair">
              <div className="absolute inset-0 flex items-center justify-center text-9xl opacity-20">
                {caseData.scene}
              </div>
              {hiddenClues.map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleClueClick(item.clue)}
                  className={`absolute text-4xl transition-all ${
                    foundClues.includes(item.clue)
                      ? 'opacity-30 scale-75'
                      : 'hover:scale-125 animate-pulse'
                  }`}
                  style={{
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                  }}
                >
                  {item.clue}
                </button>
              ))}
            </div>

            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-white font-semibold">Nájdené stopy:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {foundClues.map((clue, i) => (
                  <span key={i} className="text-3xl">{clue}</span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
