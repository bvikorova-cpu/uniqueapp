import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface MemoryMatchProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface CardType {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const emojis = ["🦁", "🐘", "🐼", "🦊", "🐸", "🐙", "🦋", "🐝"];

export const MemoryMatch = ({ onComplete, onBack }: MemoryMatchProps) => {
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const gameEmojis = [...emojis, ...emojis];
    const shuffled = gameEmojis
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffled);
    setFlippedIndices([]);
    setMoves(0);
    setMatches(0);
  };

  const handleCardClick = (index: number) => {
    if (
      flippedIndices.length === 2 ||
      cards[index].isFlipped ||
      cards[index].isMatched
    ) {
      return;
    }

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      const [first, second] = newFlipped;

      if (cards[first].emoji === cards[second].emoji) {
        setTimeout(() => {
          const updatedCards = [...cards];
          updatedCards[first].isMatched = true;
          updatedCards[second].isMatched = true;
          setCards(updatedCards);
          setFlippedIndices([]);
          
          const newMatches = matches + 1;
          setMatches(newMatches);
          
          if (newMatches === emojis.length) {
            const score = Math.max(100 - moves * 5, 10);
            setTimeout(() => onComplete(score), 500);
          }
        }, 600);
      } else {
        setTimeout(() => {
          const updatedCards = [...cards];
          updatedCards[first].isFlipped = false;
          updatedCards[second].isFlipped = false;
          setCards(updatedCards);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Memory Match - How it works"} steps={[{ title: 'Open', desc: 'Access the Memory Match section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Memory Match.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="min-h-screen bg-gradient-to-b from-red-100 via-pink-100 to-purple-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack} className="hover:bg-white/50">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex gap-6 text-lg font-bold">
            <span className="text-red-600">Moves: {moves}</span>
            <span className="text-green-600">Pairs: {matches}/{emojis.length}</span>
          </div>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm border-4 border-white/50 shadow-2xl mb-6">
          <CardContent className="p-6">
            <h2 className="text-3xl font-bold text-red-600 text-center mb-4">
              Memory Match 🎴
            </h2>
            <p className="text-center text-gray-700 mb-6">
              Find all the pairs! Click on cards and remember where the matching images are.
            </p>

            <div className="grid grid-cols-4 gap-4">
              {cards.map((card, index) => (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(index)}
                  className={`aspect-square rounded-xl cursor-pointer transition-all duration-300 ${
                    card.isMatched
                      ? "bg-green-200 scale-95 opacity-50"
                      : card.isFlipped
                      ? "bg-white scale-105"
                      : "bg-gradient-to-br from-red-400 to-pink-400 hover:scale-105"
                  } flex items-center justify-center text-5xl shadow-lg`}
                >
                  {(card.isFlipped || card.isMatched) ? card.emoji : "❓"}
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <Button
                onClick={initializeGame}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                New Game
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
};
