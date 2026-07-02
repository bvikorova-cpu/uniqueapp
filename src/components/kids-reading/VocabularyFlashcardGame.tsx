import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface VocabWord {
  word: string;
  definition: string;
}

interface Props {
  vocabulary: VocabWord[];
  onComplete: (score: number) => void;
}

export const VocabularyFlashcardGame = ({ vocabulary, onComplete }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownWords, setKnownWords] = useState<string[]>([]);
  const [reviewWords, setReviewWords] = useState<string[]>([]);
  const [gameMode, setGameMode] = useState<"flashcard" | "match" | "complete">("flashcard");
  const [matchPairs, setMatchPairs] = useState<{ id: string; text: string; type: "word" | "def"; matched: boolean; selected: boolean }[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [matchScore, setMatchScore] = useState(0);

  const currentWord = vocabulary[currentIndex];

  const handleKnown = () => {
    setKnownWords((prev) => [...prev, currentWord.word]);
    nextCard();
  };

  const handleReview = () => {
    setReviewWords((prev) => [...prev, currentWord.word]);
    nextCard();
  };

  const nextCard = () => {
    setIsFlipped(false);
    if (currentIndex < vocabulary.length - 1) {
      setTimeout(() => setCurrentIndex((prev) => prev + 1), 200);
    } else {
      // Start matching game
      setupMatchGame();
    }
  };

  const setupMatchGame = () => {
    const shuffledWords = vocabulary
      .slice(0, Math.min(4, vocabulary.length))
      .flatMap((v) => [
        { id: `w-${v.word}`, text: v.word, type: "word" as const, matched: false, selected: false },
        { id: `d-${v.word}`, text: v.definition, type: "def" as const, matched: false, selected: false },
      ])
      .sort(() => Math.random() - 0.5);
    setMatchPairs(shuffledWords);
    setGameMode("match");
  };

  const handleMatchClick = (id: string) => {
    const clicked = matchPairs.find((p) => p.id === id);
    if (!clicked || clicked.matched) return;

    if (!selectedMatch) {
      setSelectedMatch(id);
      setMatchPairs((prev) => prev.map((p) => (p.id === id ? { ...p, selected: true } : p)));
    } else {
      const first = matchPairs.find((p) => p.id === selectedMatch)!;
      const second = clicked;

      const firstWord = first.type === "word" ? first.text : second.text;
      const secondWord = second.type === "word" ? second.text : first.text;
      const firstDef = first.type === "def" ? first.text : second.text;
      const secondDef = second.type === "def" ? second.text : first.text;

      const matchingVocab = vocabulary.find((v) => v.word === firstWord || v.word === secondWord);
      const isMatch =
        matchingVocab &&
        ((first.type !== second.type) &&
          (matchingVocab.word === firstWord && matchingVocab.definition === secondDef) ||
          (matchingVocab.word === secondWord && matchingVocab.definition === firstDef));

      if (isMatch && first.type !== second.type) {
        setMatchPairs((prev) =>
          prev.map((p) =>
            p.id === selectedMatch || p.id === id
              ? { ...p, matched: true, selected: false }
              : p
          )
        );
        setMatchScore((prev) => prev + 1);
        toast.success("Match! 🎉");
      } else {
        setMatchPairs((prev) =>
          prev.map((p) => ({ ...p, selected: false }))
        );
        toast.error("Try again!");
      }
      setSelectedMatch(null);
    }
  };

  useEffect(() => {
    if (gameMode === "match" && matchPairs.length > 0 && matchPairs.every((p) => p.matched)) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setGameMode("complete");
      onComplete(knownWords.length + matchScore);
    }
  }, [matchPairs, gameMode]);

  if (gameMode === "complete") {
    return (
    <>
      <FloatingHowItWorks title={"Vocabulary Flashcard Game - How it works"} steps={[{ title: 'Open', desc: 'Access the Vocabulary Flashcard Game section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Vocabulary Flashcard Game.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10">
        <CardContent className="pt-6 text-center space-y-4">
          <motion.div
            className="text-6xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: 2 }}
          >
            🏆
          </motion.div>
          <h3 className="text-xl font-black">Vocabulary Master!</h3>
          <p className="text-muted-foreground">
            You learned {knownWords.length} words and matched {matchScore} pairs!
          </p>
          <div className="flex gap-2 justify-center">
            <div className="px-3 py-1.5 rounded-full bg-green-500/20 text-green-700 text-sm font-bold">
              ✅ Known: {knownWords.length}
            </div>
            <div className="px-3 py-1.5 rounded-full bg-orange-500/20 text-orange-700 text-sm font-bold">
              🔄 Review: {reviewWords.length}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
  }

  if (gameMode === "match") {
    return (
      <Card className="border-2 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            🃏 Match the Words!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {matchPairs.map((pair) => (
              <motion.button
                key={pair.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleMatchClick(pair.id)}
                disabled={pair.matched}
                className={`p-3 rounded-xl border-2 text-xs text-left transition-all ${
                  pair.matched
                    ? "bg-green-500/20 border-green-500/30 opacity-60"
                    : pair.selected
                    ? "border-primary bg-primary/10 shadow-lg"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {pair.matched ? "✅ " : ""}{pair.text}
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-lg">🃏 Flashcards</span>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1}/{vocabulary.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="cursor-pointer"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className="min-h-[140px] flex items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20">
            <AnimatePresence mode="wait">
              <motion.div
                key={isFlipped ? "def" : "word"}
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-center"
              >
                {isFlipped ? (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Definition</div>
                    <p className="text-sm">{currentWord.definition}</p>
                  </div>
                ) : (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Tap to reveal</div>
                    <p className="text-2xl font-black">{currentWord.word}</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-2"
          >
            <Button onClick={handleKnown} className="gap-1" variant="outline">
              ✅ I Know It
            </Button>
            <Button onClick={handleReview} className="gap-1" variant="outline">
              🔄 Review Later
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
