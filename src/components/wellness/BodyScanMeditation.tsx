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
    name: "Head & Face",
    nameEn: "head",
    duration: 30,
    instructions: "Focus on your head and face. Release tension in your forehead, around your eyes, and jaw.",
  },
  {
    id: "neck",
    name: "Neck & Shoulders",
    nameEn: "neck",
    duration: 30,
    instructions: "Notice your neck and shoulders. Let the tension flow away from this area.",
  },
  {
    id: "arms",
    name: "Arms & Hands",
    nameEn: "arms",
    duration: 30,
    instructions: "Move your attention through your shoulders, elbows, down to your fingertips. Release each muscle.",
  },
  {
    id: "chest",
    name: "Chest & Abdomen",
    nameEn: "chest",
    duration: 30,
    instructions: "Notice your breathing in your chest and abdomen. Each breath calms you.",
  },
  {
    id: "back",
    name: "Back",
    nameEn: "back",
    duration: 30,
    instructions: "Move your attention along your entire spine. Release tension in your lower back.",
  },
  {
    id: "legs",
    name: "Legs",
    nameEn: "legs",
    duration: 30,
    instructions: "Notice your thighs, knees, and calves. Feel them relaxing.",
  },
  {
    id: "feet",
    name: "Feet",
    nameEn: "feet",
    duration: 30,
    instructions: "Finally, focus on your feet and toes. Feel your connection to the ground.",
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
      utterance.lang = 'en-US';
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
              speak("Body scan meditation is complete. Slowly open your eyes and return to the present moment.");
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
        <h2 className="text-2xl font-bold mb-2">Body Scan Meditation</h2>
        <p className="text-muted-foreground mb-6">
          Progressively focus on each body part and release tension
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
            Part {currentPartIndex + 1} of {bodyParts.length}
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
                Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                {currentPartIndex === 0 && totalElapsed === 0 ? "Start" : "Continue"}
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
        <h3 className="text-lg font-semibold mb-4">Body Parts</h3>
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
