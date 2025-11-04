import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Trophy, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  fact: string;
}

const questions: Question[] = [
  {
    id: 1,
    question: "What does 'Tyrannosaurus Rex' mean?",
    options: ["Lizard King", "Tyrant Lizard King", "Big Dinosaur", "Scary Beast"],
    correct: 1,
    fact: "T-Rex means 'Tyrant Lizard King' and lived 66 million years ago!"
  },
  {
    id: 2,
    question: "Which dinosaur had the longest neck?",
    options: ["Brachiosaurus", "Diplodocus", "T-Rex", "Stegosaurus"],
    correct: 1,
    fact: "Diplodocus had a neck up to 26 feet long - as tall as a house!"
  },
  {
    id: 3,
    question: "What did herbivore dinosaurs eat?",
    options: ["Meat", "Plants", "Fish", "Insects"],
    correct: 1,
    fact: "Herbivores ate plants, leaves, and vegetation. Some ate 1000 pounds of plants per day!"
  },
  {
    id: 4,
    question: "Which dinosaur had three horns?",
    options: ["Velociraptor", "Triceratops", "Pteranodon", "Spinosaurus"],
    correct: 1,
    fact: "Triceratops had three horns and a large frill to protect itself!"
  },
  {
    id: 5,
    question: "Were dinosaurs cold-blooded or warm-blooded?",
    options: ["Cold-blooded", "Warm-blooded", "Both", "Scientists still debate this"],
    correct: 3,
    fact: "Scientists are still debating whether dinosaurs were warm or cold-blooded!"
  }
];

const DinosaurQuiz = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFact, setShowFact] = useState(false);

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowFact(true);

    if (answerIndex === questions[currentQuestion].correct) {
      setScore(score + 1);
      toast.success("Correct! 🎉");
    } else {
      toast.error("Not quite! Try again next time!");
    }
  };

  const nextQuestion = () => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowFact(false);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setShowFact(false);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-lime-50 to-emerald-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/kids-channel')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Kids Channel
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-green-700 mb-2">
            🦕 Dinosaur Quiz 🦖
          </h1>
          <p className="text-xl text-gray-600">
            Test your dinosaur knowledge!
          </p>
        </div>

        {!showResult ? (
          <Card className="border-4 border-green-300 shadow-2xl">
            <CardHeader>
              <div className="flex justify-between items-center mb-4">
                <Badge className="bg-green-500 text-white text-lg px-4 py-2">
                  Question {currentQuestion + 1}/{questions.length}
                </Badge>
                <Badge className="bg-yellow-500 text-white text-lg px-4 py-2">
                  <Star className="w-4 h-4 mr-1 inline" />
                  Score: {score}
                </Badge>
              </div>
              <Progress value={progress} className="h-3" />
              <CardTitle className="text-2xl text-center mt-6">
                {questions[currentQuestion].question}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {questions[currentQuestion].options.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={selectedAnswer !== null}
                  variant={
                    selectedAnswer === null
                      ? "outline"
                      : index === questions[currentQuestion].correct
                      ? "default"
                      : selectedAnswer === index
                      ? "destructive"
                      : "outline"
                  }
                  className={`w-full h-auto py-6 text-lg ${
                    selectedAnswer === null
                      ? "hover:bg-green-100 border-2 border-green-300"
                      : index === questions[currentQuestion].correct
                      ? "bg-green-500 text-white"
                      : selectedAnswer === index
                      ? "bg-red-500 text-white"
                      : "opacity-50"
                  }`}
                >
                  {option}
                </Button>
              ))}

              {showFact && (
                <Card className="bg-blue-50 border-2 border-blue-300 mt-6">
                  <CardContent className="pt-6">
                    <p className="text-lg font-semibold text-blue-800">
                      💡 Fun Fact:
                    </p>
                    <p className="text-gray-700 mt-2">
                      {questions[currentQuestion].fact}
                    </p>
                    <Button
                      onClick={nextQuestion}
                      className="mt-4 w-full bg-green-500 hover:bg-green-600"
                    >
                      {currentQuestion + 1 < questions.length ? "Next Question" : "See Results"}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-4 border-green-300 shadow-2xl">
            <CardHeader>
              <div className="text-center">
                <Trophy className="w-24 h-24 mx-auto text-yellow-500 mb-4" />
                <CardTitle className="text-4xl text-green-700">
                  Quiz Complete!
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="text-center space-y-6">
              <div className="text-6xl font-bold text-green-600">
                {score}/{questions.length}
              </div>

              <div className="text-2xl text-gray-700">
                {score === questions.length
                  ? "Perfect! You're a Dinosaur Expert! 🦕"
                  : score >= questions.length / 2
                  ? "Great job! You know a lot about dinosaurs! 🦖"
                  : "Keep learning! Try again to improve! 📚"}
              </div>

              <div className="flex gap-4 justify-center">
                <Button
                  onClick={resetQuiz}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-6 text-lg"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => navigate('/kids-channel')}
                  variant="outline"
                  className="px-8 py-6 text-lg"
                >
                  Back to Kids Channel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DinosaurQuiz;
