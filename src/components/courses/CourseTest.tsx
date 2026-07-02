import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";
import type { Topic } from "@/data/courseContent";
import { generateCourseTest, type TestQuestion } from "@/utils/generateCourseTest";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface CourseTestProps {
  courseName: string;
  topics: Topic[];
  onTestPass: (userName: string) => void;
}

export const CourseTest = ({ courseName, topics, onTestPass }: CourseTestProps) => {
  const [userName, setUserName] = useState("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);

  // Generate test questions from course content
  useEffect(() => {
    const generatedQuestions = generateCourseTest(topics);
    setQuestions(generatedQuestions);
  }, [topics]);

  const handleSubmit = () => {
    if (!userName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (Object.keys(answers).length < questions.length) {
      toast.error("Please answer all questions");
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
      toast.success("Congratulations! You passed the test!");
      setTimeout(() => {
        onTestPass(userName);
      }, 2000);
    } else {
      toast.error("Unfortunately, you did not pass. Try again!");
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setShowResults(false);
    setScore(0);
  };

  return (
    <>
      <FloatingHowItWorks title="How Course Test works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Final Test - {courseName}</CardTitle>
        <CardDescription>
          You need at least 7 correct answers out of 10 to pass
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {questions.length === 0 ? (
          <div className="text-center text-muted-foreground">Generating test...</div>
        ) : !showResults ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="userName">Your full name</Label>
              <Input
                id="userName"
                placeholder="e.g. John Smith"
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
              Submit test
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
                  Your score: {score}/10
                </h3>
                <p className="text-muted-foreground mt-2">
                  {score >= 7
                    ? "You passed the test! Certificate is being generated..."
                    : "Unfortunately, you did not pass. Please try again."}
                </p>
              </div>
            </div>

            {score < 7 && (
              <Button onClick={handleRetry} className="w-full" size="lg">
                Try again
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
    </>
    );
};
