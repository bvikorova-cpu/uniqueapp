import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface BodyPart {
  id: string;
  name: string;
  nameEn: string;
  duration: number; // seconds
  instructions: string;
}

const bodyParts: BodyPart[] = [
  {
    id: "head",
    name: "Hlava a tvár",
    nameEn: "head",
    duration: 30,
    instructions: "Sústreďte sa na svoju hlavu a tvár. Uvoľnite napätie v čele, okolo očí a čeľuste.",
  },
  {
    id: "neck",
    name: "Krk a plecia",
    nameEn: "neck",
    duration: 30,
    instructions: "Vnímajte svoj krk a plecia. Nechajte napätie odplynúť z tejto oblasti.",
  },
  {
    id: "arms",
    name: "Ruky a ramená",
    nameEn: "arms",
    duration: 30,
    instructions: "Prejdite pozornosťou cez ramená, lakte až po prsty rúk. Uvoľnite každý sval.",
  },
  {
    id: "chest",
    name: "Hruď a brucho",
    nameEn: "chest",
    duration: 30,
    instructions: "Vnímajte svoje dýchanie v hrudi a bruchu. Každý nádech vás upokojuje.",
  },
  {
    id: "back",
    name: "Chrbát",
    nameEn: "back",
    duration: 30,
    instructions: "Prejdite pozornosťou po celom chrbtici. Uvoľnite napätie v dolnej časti chrbta.",
  },
  {
    id: "legs",
    name: "Nohy",
    nameEn: "legs",
    duration: 30,
    instructions: "Vnímajte svoje stehná, kolená a lýtka. Cítite, ako sa uvoľňujú.",
  },
  {
    id: "feet",
    name: "Chodidlá",
    nameEn: "feet",
    duration: 30,
    instructions: "Na záver sa sústreďte na chodidlá a prsty nôh. Cítite spojenie so zemou.",
  },
];

export function BodyScanMeditation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(bodyParts[0].duration);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const currentPart = bodyParts[currentPartIndex];
  const totalDuration = bodyParts.reduce((acc, part) => acc + part.duration, 0);
  const progress = (totalElapsed / totalDuration) * 100;

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'sk-SK';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startMeditation = () => {
    setIsPlaying(true);
    speak(currentPart.instructions);
  };

  const pauseMeditation = () => {
    setIsPlaying(false);
    window.speechSynthesis.cancel();
  };

  const resetMeditation = () => {
    setIsPlaying(false);
    setCurrentPartIndex(0);
    setTimeLeft(bodyParts[0].duration);
    setTotalElapsed(0);
    window.speechSynthesis.cancel();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Move to next part
            const nextIndex = currentPartIndex + 1;
            if (nextIndex < bodyParts.length) {
              setCurrentPartIndex(nextIndex);
              speak(bodyParts[nextIndex].instructions);
              return bodyParts[nextIndex].duration;
            } else {
              // Meditation complete
              setIsPlaying(false);
              speak("Meditácia body scan je dokončená. Pomaly otvorte oči a vráťte sa do prítomnosti.");
              return 0;
            }
          }
          return prev - 1;
        });
        setTotalElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, currentPartIndex]);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-2">Body Scan Meditácia</h2>
        <p className="text-muted-foreground mb-6">
          Postupne sa sústreďte na jednotlivé časti tela a uvoľnite napätie
        </p>

        {/* Body Visualization */}
        <div className="relative mx-auto w-full max-w-md aspect-[3/4] mb-6">
          <svg
            viewBox="0 0 200 300"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Head */}
            <ellipse
              cx="100"
              cy="30"
              rx="20"
              ry="25"
              className={`transition-all duration-500 ${
                currentPart.nameEn === "head"
                  ? "fill-primary/60 stroke-primary"
                  : "fill-muted stroke-muted-foreground/30"
              }`}
              strokeWidth="2"
            />
            
            {/* Neck */}
            <rect
              x="90"
              y="50"
              width="20"
              height="15"
              className={`transition-all duration-500 ${
                currentPart.nameEn === "neck"
                  ? "fill-primary/60 stroke-primary"
                  : "fill-muted stroke-muted-foreground/30"
              }`}
              strokeWidth="2"
            />

            {/* Chest */}
            <ellipse
              cx="100"
              cy="95"
              rx="35"
              ry="40"
              className={`transition-all duration-500 ${
                currentPart.nameEn === "chest"
                  ? "fill-primary/60 stroke-primary"
                  : "fill-muted stroke-muted-foreground/30"
              }`}
              strokeWidth="2"
            />

            {/* Arms */}
            <ellipse
              cx="60"
              cy="95"
              rx="12"
              ry="50"
              className={`transition-all duration-500 ${
                currentPart.nameEn === "arms"
                  ? "fill-primary/60 stroke-primary"
                  : "fill-muted stroke-muted-foreground/30"
              }`}
              strokeWidth="2"
            />
            <ellipse
              cx="140"
              cy="95"
              rx="12"
              ry="50"
              className={`transition-all duration-500 ${
                currentPart.nameEn === "arms"
                  ? "fill-primary/60 stroke-primary"
                  : "fill-muted stroke-muted-foreground/30"
              }`}
              strokeWidth="2"
            />

            {/* Back (shown as outline behind) */}
            <ellipse
              cx="100"
              cy="110"
              rx="30"
              ry="35"
              className={`transition-all duration-500 ${
                currentPart.nameEn === "back"
                  ? "fill-primary/40 stroke-primary"
                  : "fill-transparent stroke-muted-foreground/20"
              }`}
              strokeWidth="2"
              strokeDasharray="5,5"
            />

            {/* Legs */}
            <ellipse
              cx="80"
              cy="190"
              rx="15"
              ry="70"
              className={`transition-all duration-500 ${
                currentPart.nameEn === "legs"
                  ? "fill-primary/60 stroke-primary"
                  : "fill-muted stroke-muted-foreground/30"
              }`}
              strokeWidth="2"
            />
            <ellipse
              cx="120"
              cy="190"
              rx="15"
              ry="70"
              className={`transition-all duration-500 ${
                currentPart.nameEn === "legs"
                  ? "fill-primary/60 stroke-primary"
                  : "fill-muted stroke-muted-foreground/30"
              }`}
              strokeWidth="2"
            />

            {/* Feet */}
            <ellipse
              cx="75"
              cy="270"
              rx="18"
              ry="12"
              className={`transition-all duration-500 ${
                currentPart.nameEn === "feet"
                  ? "fill-primary/60 stroke-primary"
                  : "fill-muted stroke-muted-foreground/30"
              }`}
              strokeWidth="2"
            />
            <ellipse
              cx="125"
              cy="270"
              rx="18"
              ry="12"
              className={`transition-all duration-500 ${
                currentPart.nameEn === "feet"
                  ? "fill-primary/60 stroke-primary"
                  : "fill-muted stroke-muted-foreground/30"
              }`}
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* Current Part Info */}
        <div className="text-center mb-4">
          <h3 className="text-xl font-semibold mb-2">{currentPart.name}</h3>
          <p className="text-muted-foreground mb-4">{currentPart.instructions}</p>
          <div className="text-3xl font-bold text-primary">
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground text-center mt-2">
            Časť {currentPartIndex + 1} z {bodyParts.length}
          </p>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={isPlaying ? pauseMeditation : startMeditation}
            size="lg"
            className="gap-2"
          >
            {isPlaying ? (
              <>
                <Pause className="w-5 h-5" />
                Pozastaviť
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                {currentPartIndex === 0 && totalElapsed === 0 ? "Začať" : "Pokračovať"}
              </>
            )}
          </Button>
          <Button onClick={resetMeditation} variant="outline" size="lg" className="gap-2">
            <RotateCcw className="w-5 h-5" />
            Reset
          </Button>
        </div>
      </Card>

      {/* Body Parts List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Časti tela</h3>
        <div className="space-y-2">
          {bodyParts.map((part, index) => (
            <div
              key={part.id}
              className={`p-3 rounded-lg transition-all ${
                index === currentPartIndex
                  ? "bg-primary/10 border-2 border-primary"
                  : "bg-muted/50"
              } ${index < currentPartIndex ? "opacity-60" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{part.name}</span>
                <span className="text-sm text-muted-foreground">{part.duration}s</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
