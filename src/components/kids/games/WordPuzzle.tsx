import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface WordPuzzleProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

const words = [
  { word: "KITTEN", hint: "Has soft paws and meows" },
  { word: "SUNSHINE", hint: "Shines during the day in the sky" },
  { word: "FLOWER", hint: "Grows in the meadow with pretty colors" },
  { word: "STORYBOOK", hint: "We read tales and adventures in it" },
  { word: "STARLIGHT", hint: "Twinkles at night in the sky" },
];

export const WordPuzzle = ({ onComplete, onBack }: WordPuzzleProps) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [score, setScore] = useState(0);
  const maxWrong = 6;

  const currentWord = words[currentWordIndex].word;
  const currentHint = words[currentWordIndex].hint;
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  useEffect(() => {
    const allLettersGuessed = currentWord
      .split("")
      .every((letter) => guessedLetters.has(letter));

    if (allLettersGuessed && currentWord) {
      const wordScore = Math.max(50 - wrongGuesses * 5, 10);
      setScore(score + wordScore);
      toast.success(`Correct! +${wordScore} points`);

      setTimeout(() => {
        if (currentWordIndex < words.length - 1) {
          setCurrentWordIndex(currentWordIndex + 1);
          setGuessedLetters(new Set());
          setWrongGuesses(0);
        } else {
          onComplete(score + wordScore);
        }
      }, 1500);
    }
  }, [guessedLetters, currentWord]);

  const handleLetterClick = (letter: string) => {
    if (guessedLetters.has(letter)) return;

    const newGuessed = new Set(guessedLetters);
    newGuessed.add(letter);
    setGuessedLetters(newGuessed);

    if (!currentWord.includes(letter)) {
      const newWrong = wrongGuesses + 1;
      setWrongGuesses(newWrong);
      
      if (newWrong >= maxWrong) {
        toast.error("Game Over! Try again.");
        setTimeout(() => {
          setGuessedLetters(new Set());
          setWrongGuesses(0);
        }, 1500);
      }
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Word Puzzle - How it works"} steps={[{ title: 'Open', desc: 'Access the Word Puzzle section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Word Puzzle.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="min-h-screen bg-gradient-to-b from-red-100 via-pink-100 to-purple-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack} className="hover:bg-white/50">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex gap-6 text-lg font-bold">
            <span className="text-red-600">Wrong Guesses: {wrongGuesses}/{maxWrong}</span>
            <span className="text-green-600">Score: {score}</span>
          </div>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm border-4 border-white/50 shadow-2xl mb-6">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold text-red-600 text-center mb-4">
              Word Puzzle 🔤
            </h2>
            <p className="text-center text-gray-700 mb-6">
              Word {currentWordIndex + 1} of {words.length}
            </p>

            <div className="mb-8">
              <p className="text-xl text-center text-purple-600 font-semibold mb-6">
                💡 Hint: {currentHint}
              </p>

              <div className="flex justify-center gap-3 mb-8">
                {currentWord.split("").map((letter, index) => (
                  <div
                    key={index}
                    className="w-12 h-16 bg-white border-4 border-red-300 rounded-lg flex items-center justify-center text-3xl font-bold text-red-600"
                  >
                    {guessedLetters.has(letter) ? letter : "_"}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {alphabet.map((letter) => (
                <Button
                  key={letter}
                  onClick={() => handleLetterClick(letter)}
                  disabled={guessedLetters.has(letter)}
                  className={`h-12 text-lg font-bold ${
                    guessedLetters.has(letter)
                      ? currentWord.includes(letter)
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                      : "bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white"
                  }`}
                >
                  {letter}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
};
