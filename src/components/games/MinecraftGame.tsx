import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Star, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BLOCKS = {
  dirt: "🟫",
  grass: "🟩",
  stone: "⬜",
  wood: "🟧",
  water: "🟦",
  empty: "⬛",
};

const LEVELS = [
  { level: 1, name: "First House", target: 5, gridSize: 6 },
  { level: 2, name: "Garden", target: 8, gridSize: 7 },
  { level: 3, name: "Tower", target: 12, gridSize: 8 },
  { level: 4, name: "Most", target: 15, gridSize: 8 },
  { level: 5, name: "Hrad", target: 20, gridSize: 9 },
  { level: 6, name: "Mesto", target: 25, gridSize: 10 },
  { level: 7, name: "Ostrov", target: 30, gridSize: 10 },
  { level: 8, name: "Fortress", target: 35, gridSize: 11 },
  { level: 9, name: "Palace", target: 40, gridSize: 12 },
  { level: 10, name: "Empire", target: 50, gridSize: 12 },
];

interface MinecraftGameProps {
  onBack: () => void;
}

export const MinecraftGame = ({ onBack }: MinecraftGameProps) => {
  const { toast } = useToast();
  const [currentLevel, setCurrentLevel] = useState(0);
  const [selectedBlock, setSelectedBlock] = useState<keyof typeof BLOCKS>("grass");
  const [grid, setGrid] = useState<string[][]>(() => 
    Array(LEVELS[0].gridSize).fill(null).map(() => 
      Array(LEVELS[0].gridSize).fill(BLOCKS.empty)
    )
  );
  const [blocksPlaced, setBlocksPlaced] = useState(0);

  const levelData = LEVELS[currentLevel];

  const handleCellClick = (row: number, col: number) => {
    const newGrid = [...grid];
    if (newGrid[row][col] === BLOCKS.empty) {
      newGrid[row][col] = BLOCKS[selectedBlock];
      setGrid(newGrid);
      setBlocksPlaced(blocksPlaced + 1);

      if (blocksPlaced + 1 >= levelData.target) {
        toast({
          title: "🎉 Level Completed!",
          description: `Postavil si ${levelData.name}!`,
        });

        setTimeout(() => {
          if (currentLevel < LEVELS.length - 1) {
            nextLevel();
          } else {
            toast({
              title: "🏆 Master Builder!",
              description: "You have completed all levels!",
            });
          }
        }, 1500);
      }
    } else {
      newGrid[row][col] = BLOCKS.empty;
      setGrid(newGrid);
      setBlocksPlaced(Math.max(0, blocksPlaced - 1));
    }
  };

  const nextLevel = () => {
    const newLevel = currentLevel + 1;
    setCurrentLevel(newLevel);
    setBlocksPlaced(0);
    setGrid(
      Array(LEVELS[newLevel].gridSize).fill(null).map(() => 
        Array(LEVELS[newLevel].gridSize).fill(BLOCKS.empty)
      )
    );
  };

  const resetLevel = () => {
    setBlocksPlaced(0);
    setGrid(
      Array(levelData.gridSize).fill(null).map(() => 
        Array(levelData.gridSize).fill(BLOCKS.empty)
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-emerald-700 pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={resetLevel} variant="secondary">
            Clear
          </Button>
        </div>

        <Card className="p-6 mb-6 bg-white/95 backdrop-blur">
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Level</div>
              <div className="text-2xl font-bold flex items-center justify-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                {levelData.level}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Task</div>
              <div className="text-lg font-bold">{levelData.name}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Bloky</div>
              <div className="text-2xl font-bold">
                {blocksPlaced} / {levelData.target}
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground mb-3 text-center">
              Pick a block and click on the grid to build
            </p>
            <div className="flex justify-center gap-2 mb-6">
              {Object.entries(BLOCKS)
                .filter(([key]) => key !== "empty")
                .map(([key, emoji]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedBlock(key as keyof typeof BLOCKS)}
                    className={`text-4xl p-3 bg-white rounded-lg hover:scale-110 transition-all ${
                      selectedBlock === key ? "ring-4 ring-green-500 scale-110" : ""
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
            </div>

            <div 
              className="bg-black/20 rounded-lg p-2 mx-auto w-fit"
              style={{ 
                display: 'grid',
                gridTemplateColumns: `repeat(${levelData.gridSize}, 1fr)`,
                gap: '2px'
              }}
            >
              {grid.map((row, i) =>
                row.map((cell, j) => (
                  <button
                    key={`${i}-${j}`}
                    onClick={() => handleCellClick(i, j)}
                    className="aspect-square text-2xl bg-sky-200 hover:bg-sky-300 transition-colors rounded w-10 h-10 sm:w-12 sm:h-12"
                  >
                    {cell}
                  </button>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
