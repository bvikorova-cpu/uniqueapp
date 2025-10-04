import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";

interface CourseTestProps {
  courseName: string;
  onTestPass: (userName: string) => void;
}

export const CourseTest = ({ courseName, onTestPass }: CourseTestProps) => {
  const [userName, setUserName] = useState("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const questions = [
    {
      question: "Ktorá téma sa zaoberá základnými pojmami?",
      options: ["Téma 1", "Téma 2", "Téma 3", "Téma 4"],
      correct: 1
    },
    {
      question: "Čo je hlavným cieľom témy 3?",
      options: ["Teória", "Praktické aplikácie", "História", "Zhrnutie"],
      correct: 1
    },
    {
      question: "V ktorej téme sa učíme o pokročilých technikách?",
      options: ["Téma 2", "Téma 3", "Téma 4", "Téma 5"],
      correct: 2
    },
    {
      question: "Čo je obsahom témy 5?",
      options: ["Úvod", "Riešenie problémov", "Záver", "Trendy"],
      correct: 1
    },
    {
      question: "Ktorá téma obsahuje prípadové štúdie?",
      options: ["Téma 5", "Téma 6", "Téma 7", "Téma 8"],
      correct: 1
    },
    {
      question: "O čom sa dozviete v téme 7?",
      options: ["Základy", "Nástroje", "Najlepšie postupy", "Trendy"],
      correct: 2
    },
    {
      question: "Ktorá téma predstavuje nástroje a zdroje?",
      options: ["Téma 6", "Téma 7", "Téma 8", "Téma 9"],
      correct: 2
    },
    {
      question: "Čo je obsahom témy 9?",
      options: ["Úvod", "Zhrnutie", "Trendy a budúcnosť", "Prípadové štúdie"],
      correct: 2
    },
    {
      question: "Koľko tém má celý kurz?",
      options: ["8", "9", "10", "11"],
      correct: 2
    },
    {
      question: "Čo nasleduje po úspešnom absolvovaní testu?",
      options: ["Nová téma", "Certifikát", "Ďalší test", "Ukončenie"],
      correct: 1
    }
  ];

  const handleSubmit = () => {
    if (!userName.trim()) {
      toast.error("Prosím, vyplňte svoje meno");
      return;
    }

    if (Object.keys(answers).length < questions.length) {
      toast.error("Prosím, odpovedzte na všetky otázky");
      return;
    }

    let correctCount = 0;
    questions.forEach((q, index) => {
      if (parseInt(answers[index]) === q.correct) {
        correctCount++;
      }
    });

    setScore(correctCount);
    setShowResults(true);

    if (correctCount >= 7) {
      toast.success("Gratulujeme! Test ste úspešne zvládli!");
      setTimeout(() => {
        onTestPass(userName);
      }, 2000);
    } else {
      toast.error("Bohužiaľ, test ste nezvládli. Skúste to znova!");
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setShowResults(false);
    setScore(0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Záverečný test - {courseName}</CardTitle>
        <CardDescription>
          Na úspešné absolvovanie potrebujete minimálne 7 správnych odpovedí z 10
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!showResults ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="userName">Vaše meno a priezvisko</Label>
              <Input
                id="userName"
                placeholder="Napr. Ján Novák"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>

            {questions.map((q, index) => (
              <div key={index} className="space-y-3">
                <Label className="text-base font-semibold">
                  {index + 1}. {q.question}
                </Label>
                <RadioGroup
                  value={answers[index]?.toString()}
                  onValueChange={(value) =>
                    setAnswers({ ...answers, [index]: value })
                  }
                >
                  {q.options.map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={optIndex.toString()}
                        id={`q${index}-opt${optIndex}`}
                      />
                      <Label
                        htmlFor={`q${index}-opt${optIndex}`}
                        className="cursor-pointer"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}

            <Button onClick={handleSubmit} className="w-full" size="lg">
              Odoslať test
            </Button>
          </>
        ) : (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              {score >= 7 ? (
                <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
              ) : (
                <XCircle className="h-20 w-20 text-destructive mx-auto" />
              )}
              <div>
                <h3 className="text-2xl font-bold">
                  Vaše skóre: {score}/10
                </h3>
                <p className="text-muted-foreground mt-2">
                  {score >= 7
                    ? "Úspešne ste zvládli test! Certifikát sa generuje..."
                    : "Bohužiaľ, test ste nezvládli. Skúste to prosím znova."}
                </p>
              </div>
            </div>

            {score < 7 && (
              <Button onClick={handleRetry} className="w-full" size="lg">
                Skúsiť znova
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
