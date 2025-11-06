import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Circle } from "lucide-react";

const STEPS = [
  { count: 5, prompt: "Name 5 things you can see around you" },
  { count: 4, prompt: "Name 4 things you can touch" },
  { count: 3, prompt: "Name 3 things you can hear" },
  { count: 2, prompt: "Name 2 things you can smell" },
  { count: 1, prompt: "Name 1 thing you can taste" },
];

export function GroundingExercise() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[][]>(STEPS.map(() => []));
  const [currentInput, setCurrentInput] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  const step = STEPS[currentStep];
  const currentAnswers = answers[currentStep];

  const handleAddAnswer = () => {
    if (!currentInput.trim()) return;

    const newAnswers = [...answers];
    newAnswers[currentStep] = [...currentAnswers, currentInput];
    setAnswers(newAnswers);
    setCurrentInput("");

    if (newAnswers[currentStep].length === step.count) {
      if (currentStep < STEPS.length - 1) {
        setTimeout(() => setCurrentStep(currentStep + 1), 500);
      } else {
        setIsComplete(true);
      }
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers(STEPS.map(() => []));
    setCurrentInput("");
    setIsComplete(false);
  };

  if (isComplete) {
    return (
      <Card className="mt-4">
        <CardContent className="pt-6 text-center">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h3 className="text-2xl font-bold mb-2">Well Done!</h3>
          <p className="text-muted-foreground mb-6">
            You've completed the 5-4-3-2-1 grounding exercise. Take a moment to notice how you feel.
          </p>
          <Button onClick={handleReset}>Start Again</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>5-4-3-2-1 Grounding Exercise</CardTitle>
        <CardDescription>
          A mindfulness technique to bring you into the present moment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2 justify-center">
          {STEPS.map((_, idx) => (
            <div key={idx}>
              {idx < currentStep ? (
                <CheckCircle2 className="w-6 h-6 text-primary" />
              ) : idx === currentStep ? (
                <Circle className="w-6 h-6 text-primary fill-primary" />
              ) : (
                <Circle className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>

        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">{step.prompt}</h3>
          <p className="text-sm text-muted-foreground">
            {currentAnswers.length} of {step.count} answers
          </p>
        </div>

        {currentAnswers.length > 0 && (
          <div className="space-y-2">
            {currentAnswers.map((answer, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-3 bg-muted rounded-lg"
              >
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm">{answer}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Input
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddAnswer()}
            placeholder="Type your answer..."
            disabled={currentAnswers.length >= step.count}
          />
          <Button
            onClick={handleAddAnswer}
            disabled={!currentInput.trim() || currentAnswers.length >= step.count}
          >
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
