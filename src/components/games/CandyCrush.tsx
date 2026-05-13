import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Trophy, Star, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CANDIES = ["🍬", "🍭", "🍫", "🍩", "🍪", "🎂"];
const GRID_SIZE = 8;
const LEVELS = [
  { level: 1, target: 100, moves: 20 },
  { level: 2, target: 200, moves: 25 },
  { level: 3, target: 300, moves: 25 },
  { level: 4, target: 400, moves: 30 },
  { level: 5, target: 500, moves: 30 },
  { level: 6, target: 600, moves: 35 },
  { level: 7, target: 700, moves: 35 },
  { level: 8, target: 800, moves: 40 },
  { level: 9, target: 900, moves: 40 },
  { level: 10, target: 1000, moves: 45 },
];

interface CandyCrushProps {
  onBack: () => void;
}

export const CandyCrush = ({ onBack }: CandyCrushProps) => {
  const { toast } = useToast();
  const [currentLevel, setCurrentLevel] = useState(0);
  const [grid, setGrid] = useState<string[][]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(LEVELS[0].moves);
  const [selected, setSelected] = useState<[number, number] | null>(null);

  useEffect(() => {
    initializeGrid();
  }, [currentLevel]);

  const initializeGrid = () => {
    const newGrid: string[][] = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      newGrid[i] = [];
      for (let j = 0; j < GRID_SIZE; j++) {
        newGrid[i][j] = CANDIES[Math.floor(Math.random() * CANDIES.length)];
      }
    }
    setGrid(newGrid);
    setScore(0);
    setMoves(LEVELS[currentLevel].moves);
    setSelected(null);
  };

  const handleCandyClick = (row: number, col: number) => {
    if (!selected) {
      setSelected([row, col]);
      return;
    }

    const [selectedRow, selectedCol] = selected;
    const isAdjacent =
      (Math.abs(row - selectedRow) === 1 && col === selectedCol) ||
      (Math.abs(col - selectedCol) === 1 && row === selectedRow);

    if (!isAdjacent) {
      setSelected([row, col]);
      return;
    }

    // Swap candies
    const newGrid = [...grid];
    const temp = newGrid[row][col];
    newGrid[row][col] = newGrid[selectedRow][selectedCol];
    newGrid[selectedRow][selectedCol] = temp;

    setGrid(newGrid);
    setSelected(null);
    setMoves((m) => m - 1);

    setTimeout(() => {
      checkMatches();
    }, 300);
  };

  const checkMatches = () => {
    const newGrid = [...grid];
    let foundMatch = false;
    let points = 0;

    // Check horizontal matches
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE - 2; j++) {
        if (
          newGrid[i][j] === newGrid[i][j + 1] &&
          newGrid[i][j] === newGrid[i][j + 2]
        ) {
          newGrid[i][j] = "";
          newGrid[i][j + 1] = "";
          newGrid[i][j + 2] = "";
          foundMatch = true;
          points += 30;
        }
      }
    }

    // Check vertical matches
    for (let i = 0; i < GRID_SIZE - 2; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (
          newGrid[i][j] === newGrid[i + 1][j] &&
          newGrid[i][j] === newGrid[i + 2][j] &&
          newGrid[i][j] !== ""
        ) {
          newGrid[i][j] = "";
          newGrid[i + 1][j] = "";
          newGrid[i + 2][j] = "";
          foundMatch = true;
          points += 30;
        }
      }
    }

    if (foundMatch) {
      setScore((s) => s + points);
      setGrid(newGrid);
      setTimeout(() => {
        fillEmptySpaces();
      }, 300);
    } else {
      checkGameOver();
    }
  };

  const fillEmptySpaces = () => {
    const newGrid = [...grid];

    for (let j = 0; j < GRID_SIZE; j++) {
      for (let i = GRID_SIZE - 1; i >= 0; i--) {
        if (newGrid[i][j] === "") {
          for (let k = i - 1; k >= 0; k--) {
            if (newGrid[k][j] !== "") {
              newGrid[i][j] = newGrid[k][j];
              newGrid[k][j] = "";
              break;
            }
          }
          if (newGrid[i][j] === "") {
            newGrid[i][j] = CANDIES[Math.floor(Math.random() * CANDIES.length)];
          }
        }
      }
    }

    setGrid(newGrid);
    setTimeout(() => {
      checkMatches();
    }, 300);
  };

  const checkGameOver = () => {
    const levelData = LEVELS[currentLevel];

    if (score >= levelData.target) {
      toast({
        title: "🎉 Level completed!",
        description: `You scored ${score} points!`,
      });

      if (currentLevel < LEVELS.length - 1) {
        setTimeout(() => {
          setCurrentLevel(currentLevel + 1);
        }, 1500);
      } else {
        toast({
          title: "🏆 Gratulujeme!",
          description: "You have completed all levels!",
        });
      }
    } else if (moves === 0) {
      toast({
        title: "Koniec hry",
        description: "You ran out of moves. Try again!",
        variant: "destructive",
      });
    }
  };

  const levelData = LEVELS[currentLevel];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 to-purple-600 pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={initializeGrid} variant="secondary">
            <RotateCcw className="h-4 w-4 mr-2" />
            Restart
          </Button>
        </div>

        <Card className="p-6 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Level</div>
              <div className="text-2xl font-bold flex items-center justify-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                {levelData.level}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Score</div>
              <div className="text-2xl font-bold">{score} / {levelData.target}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Moves</div>
              <div className="text-2xl font-bold">{moves}</div>
            </div>
          </div>
        </Card>

        <div className="bg-white rounded-lg p-4 shadow-elegant">
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
            {grid.map((row, i) =>
              row.map((candy, j) => (
                <button
                  key={`${i}-${j}`}
                  onClick={() => handleCandyClick(i, j)}
                  className={`aspect-square text-3xl bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg hover:scale-110 transition-all ${
                    selected && selected[0] === i && selected[1] === j
                      ? "ring-4 ring-yellow-400 scale-110"
                      : ""
                  }`}
                >
                  {candy}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
