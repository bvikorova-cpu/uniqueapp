import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface WordPuzzleProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

const words = [
  { word: "KOCKA", hint: "Má mäkké labky a mňauká" },
  { word: "SLNKO", hint: "Svieti cez deň na oblohe" },
  { word: "KVET", hint: "Rastie na lúke a má peknú farbu" },
  { word: "KNIHA", hint: "Čítame v nej príbehy" },
  { word: "HVIEZDA", hint: "Svieti v noci na oblohe" },
];

export const WordPuzzle = ({ onComplete, onBack }: WordPuzzleProps) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [score, setScore] = useState(0);
  const maxWrong = 6;

  const currentWord = words[currentWordIndex].word;
  const currentHint = words[currentWordIndex].hint;
  const alphabet = "AÁBCČDĎEÉFGHIÍJKLĹĽMNŇOÓÔPQRŔSŠTŤUÚVWXYÝZŽ".split("");

  useEffect(() => {
    const allLettersGuessed = currentWord
      .split("")
      .every((letter) => guessedLetters.has(letter));

    if (allLettersGuessed && currentWord) {
      const wordScore = Math.max(50 - wrongGuesses * 5, 10);
      setScore(score + wordScore);
      toast.success(`Správne! +${wordScore} bodov`);

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
        toast.error("Prehra! Skús znova.");
        setTimeout(() => {
          setGuessedLetters(new Set());
          setWrongGuesses(0);
        }, 1500);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-100 via-pink-100 to-purple-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack} className="hover:bg-white/50">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Späť
          </Button>
          <div className="flex gap-6 text-lg font-bold">
            <span className="text-red-600">Zlé pokusy: {wrongGuesses}/{maxWrong}</span>
            <span className="text-green-600">Skóre: {score}</span>
          </div>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm border-4 border-white/50 shadow-2xl mb-6">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold text-red-600 text-center mb-4">
              Word Puzzle 🔤
            </h2>
            <p className="text-center text-gray-700 mb-6">
              Slovo {currentWordIndex + 1} z {words.length}
            </p>

            <div className="mb-8">
              <p className="text-xl text-center text-purple-600 font-semibold mb-6">
                💡 Nápoveda: {currentHint}
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
  );
};
