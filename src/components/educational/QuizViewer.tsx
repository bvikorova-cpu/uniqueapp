import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, XCircle, CheckCircle, ArrowRight } from "lucide-react";
import { QuizQuestion } from "@/data/educationalContent";
import confetti from "canvas-confetti";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface QuizViewerProps {
  questions: QuizQuestion[];
  onQuizComplete: (score: number) => void;
  onBack: () => void;
}

export const QuizViewer = ({
  questions,
  onQuizComplete,
  onBack,
}: QuizViewerProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestion === questions.length - 1;
  const isCorrect = selectedAnswer === question.correctAnswer;

  const handleAnswerSelect = (answer: string) => {
    if (showExplanation) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;
    
    setShowExplanation(true);
    if (isCorrect) {
      setScore(score + 1);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      const finalScore = Math.round((score / questions.length) * 100);
      onQuizComplete(finalScore);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How Quiz Viewer works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <div className="space-y-6 animate-fade-in">
      <Button
        variant="ghost"
        onClick={onBack}
        className="hover:bg-white/50"
      >
        Back
      </Button>

      <Card className="bg-gradient-to-br from-white to-purple-50 border-4 border-purple-200">
        <CardContent className="p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-purple-600">
                Question {currentQuestion + 1} of {questions.length}
              </h3>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="text-sm font-bold text-gray-700">Score: {score}/{questions.length}</span>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card className="bg-white border-2 border-purple-200 mb-6">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-purple-600 mb-6 text-center">
                {question.question}
              </h2>

              <div className="grid gap-3">
                {question.options.map((option, index) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrectAnswer = option === question.correctAnswer;
                  const showCorrect = showExplanation && isCorrectAnswer;
                  const showIncorrect = showExplanation && isSelected && !isCorrect;

                  return (
                    <Button
                      key={index}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={showExplanation}
                      variant="outline"
                      className={`
                        h-auto p-4 text-lg transition-all
                        ${isSelected && !showExplanation ? 'border-purple-500 bg-purple-100' : ''}
                        ${showCorrect ? 'border-green-500 bg-green-100' : ''}
                        ${showIncorrect ? 'border-red-500 bg-red-100' : ''}
                      `}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-semibold">{option}</span>
                        {showCorrect && <CheckCircle className="h-6 w-6 text-green-600" />}
                        {showIncorrect && <XCircle className="h-6 w-6 text-red-600" />}
                      </div>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {showExplanation && (
            <Card className={`border-2 mb-6 animate-fade-in ${
              isCorrect ? 'bg-green-50 border-green-300' : 'bg-blue-50 border-blue-300'
            }`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                  ) : (
                    <CheckCircle className="h-6 w-6 text-blue-600 flex-shrink-0" />
                  )}
                  <div>
                    <h4 className={`font-bold mb-2 ${
                      isCorrect ? 'text-green-700' : 'text-blue-700'
                    }`}>
                      {isCorrect ? '🎉 Correct!' : '📚 Learn More'}
                    </h4>
                    <p className={isCorrect ? 'text-green-800' : 'text-blue-800'}>
                      {question.explanation}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-center">
            {!showExplanation ? (
              <Button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-12 py-6 text-xl"
              >
                Submit Answer
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-12 py-6 text-xl"
              >
                {isLastQuestion ? (
                  <>
                    <Trophy className="mr-2 h-6 w-6" />
                    Finish Quiz!
                  </>
                ) : (
                  <>
                    <ArrowRight className="mr-2 h-6 w-6" />
                    Next Question
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
    </>
    );
};
