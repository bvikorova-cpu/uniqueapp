import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, RotateCcw } from "lucide-react";

type Exercise = {
  name: string;
  description: string;
  phases: { name: string; duration: number }[];
};

const EXERCISES: Record<string, Exercise> = {
  "4-7-8": {
    name: "4-7-8 Breathing",
    description: "Calming technique to reduce anxiety and promote sleep",
    phases: [
      { name: "Inhale", duration: 4 },
      { name: "Hold", duration: 7 },
      { name: "Exhale", duration: 8 },
    ],
  },
  box: {
    name: "Box Breathing",
    description: "Equal breathing for focus and stress relief",
    phases: [
      { name: "Inhale", duration: 4 },
      { name: "Hold", duration: 4 },
      { name: "Exhale", duration: 4 },
      { name: "Hold", duration: 4 },
    ],
  },
};

export function BreathingExercises() {
  const [selectedExercise, setSelectedExercise] = useState<string>("4-7-8");
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [scale, setScale] = useState(1);

  const exercise = EXERCISES[selectedExercise];

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isActive && timeLeft === 0) {
      const nextPhase = (currentPhase + 1) % exercise.phases.length;
      setCurrentPhase(nextPhase);
      setTimeLeft(exercise.phases[nextPhase].duration);
    }
  }, [isActive, timeLeft, currentPhase, exercise.phases]);

  useEffect(() => {
    const phase = exercise.phases[currentPhase];
    if (phase.name.toLowerCase().includes("inhale")) {
      setScale(1.5);
    } else if (phase.name.toLowerCase().includes("exhale")) {
      setScale(0.7);
    } else {
      setScale(phase.name.toLowerCase().includes("hold") ? scale : 1);
    }
  }, [currentPhase, exercise.phases]);

  const handleStart = () => {
    setIsActive(true);
    setTimeLeft(exercise.phases[0].duration);
    setCurrentPhase(0);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setCurrentPhase(0);
    setTimeLeft(0);
    setScale(1);
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Breathing Exercises</CardTitle>
        <CardDescription>
          Follow the visual guide and breathe along
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedExercise} onValueChange={(v) => { setSelectedExercise(v); handleReset(); }}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="4-7-8">4-7-8 Technique</TabsTrigger>
            <TabsTrigger value="box">Box Breathing</TabsTrigger>
          </TabsList>

          {Object.entries(EXERCISES).map(([key, ex]) => (
            <TabsContent key={key} value={key} className="mt-6">
              <p className="text-sm text-muted-foreground mb-6">{ex.description}</p>

              <div className="flex flex-col items-center gap-6">
                <div
                  className="w-48 h-48 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center transition-transform duration-1000 ease-in-out"
                  style={{ transform: `scale(${scale})` }}
                >
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      {timeLeft || exercise.phases[0].duration}
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      {isActive ? exercise.phases[currentPhase].name : "Ready"}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!isActive ? (
                    <Button onClick={handleStart}>
                      <Play className="w-4 h-4 mr-2" />
                      Start
                    </Button>
                  ) : (
                    <Button onClick={handlePause} variant="secondary">
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </Button>
                  )}
                  <Button onClick={handleReset} variant="outline">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                    </Button>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
