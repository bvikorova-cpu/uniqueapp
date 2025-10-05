import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Clock, CheckCircle2, Circle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MorningMayhemGameProps {
  onBack: () => void;
}

const TASKS = [
  { id: 1, name: "Zobudiť sa", icon: "😴", time: 3 },
  { id: 2, name: "Umyť sa", icon: "🚿", time: 5 },
  { id: 3, name: "Obliecť sa", icon: "👕", time: 4 },
  { id: 4, name: "Učesať sa", icon: "💇", time: 3 },
  { id: 5, name: "Naraňajkovať", icon: "🍳", time: 6 },
  { id: 6, name: "Zjesť raňajky", icon: "🥐", time: 5 },
  { id: 7, name: "Umyť zuby", icon: "🦷", time: 3 },
  { id: 8, name: "Zbaliť tašku", icon: "🎒", time: 4 },
  { id: 9, name: "Obúť sa", icon: "👟", time: 2 },
  { id: 10, name: "Ísť do školy", icon: "🚌", time: 1 },
];

const TOTAL_TIME = 60; // 60 seconds

export const MorningMayhemGame = ({ onBack }: MorningMayhemGameProps) => {
  const { toast } = useToast();
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [currentTask, setCurrentTask] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameOver(true);
          if (completedTasks.length === TASKS.length) {
            setWon(true);
            toast({
              title: "🎉 Výhra!",
              description: "Stihol si všetko včas!",
            });
          } else {
            toast({
              title: "⏰ Čas vypršal!",
              description: `Dokončil si len ${completedTasks.length}/${TASKS.length} úloh.`,
              variant: "destructive",
            });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameOver, completedTasks.length, toast]);

  const startGame = () => {
    setGameStarted(true);
    setTimeLeft(TOTAL_TIME);
    setCompletedTasks([]);
    setCurrentTask(0);
    setGameOver(false);
    setWon(false);
  };

  const completeTask = (taskId: number) => {
    if (completedTasks.includes(taskId) || gameOver) return;

    const task = TASKS.find(t => t.id === taskId);
    if (!task) return;

    const newCompleted = [...completedTasks, taskId];
    setCompletedTasks(newCompleted);

    if (newCompleted.length === TASKS.length) {
      setGameOver(true);
      setWon(true);
      toast({
        title: "🎉 Gratulujem!",
        description: `Dokončil si všetko za ${TOTAL_TIME - timeLeft} sekúnd!`,
      });
    } else {
      toast({
        title: `✅ ${task.name}`,
        description: "Dokončené!",
      });
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setTimeLeft(TOTAL_TIME);
    setCompletedTasks([]);
    setCurrentTask(0);
    setGameOver(false);
    setWon(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-orange-300 to-red-300 pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Späť
          </Button>
          <h1 className="text-3xl font-bold text-white">⏰ Morning Mayhem</h1>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-lg">
            <Clock className="h-5 w-5 text-white" />
            <span className="text-white font-semibold text-xl">{timeLeft}s</span>
          </div>
        </div>

        {!gameStarted ? (
          <Card className="p-8 bg-white/95 backdrop-blur text-center">
            <h2 className="text-3xl font-bold mb-4">⏰ Ranný chaos!</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Musíš sa pripraviť do školy za 60 sekúnd!<br />
              Dokončí všetky úlohy včas a vyhraj!
            </p>
            <div className="mb-8">
              <h3 className="font-semibold mb-3">Úlohy na splnenie:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {TASKS.map((task) => (
                  <div key={task.id} className="flex items-center gap-2">
                    <span className="text-2xl">{task.icon}</span>
                    <span>{task.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={startGame} size="lg" className="text-xl px-8 py-6">
              🚀 Začať hru
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Progress Bar */}
            <Card className="p-4 bg-white/95 backdrop-blur">
              <div className="flex justify-between mb-2 text-sm">
                <span className="font-semibold">Pokrok:</span>
                <span className="font-bold">{completedTasks.length}/{TASKS.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${(completedTasks.length / TASKS.length) * 100}%` }}
                />
              </div>
            </Card>

            {/* Tasks Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {TASKS.map((task, index) => {
                const isCompleted = completedTasks.includes(task.id);
                const isNext = completedTasks.length === index;
                
                return (
                  <button
                    key={task.id}
                    onClick={() => completeTask(task.id)}
                    disabled={isCompleted || gameOver}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isCompleted
                        ? 'border-green-500 bg-green-50 opacity-75'
                        : isNext
                        ? 'border-yellow-500 bg-yellow-50 hover:scale-105 animate-pulse'
                        : 'border-gray-300 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-4xl mb-2">{task.icon}</div>
                    <p className="text-xs font-semibold mb-1">{task.name}</p>
                    <div className="flex items-center justify-center gap-1">
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Game Over Screen */}
            {gameOver && (
              <Card className="p-8 bg-white/95 backdrop-blur text-center">
                <div className="text-6xl mb-4">
                  {won ? "🎉" : "😓"}
                </div>
                <h2 className="text-3xl font-bold mb-2">
                  {won ? "Gratulujem!" : "Skús to znova!"}
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  {won
                    ? `Stihol si všetko za ${TOTAL_TIME - timeLeft} sekúnd!`
                    : `Dokončil si len ${completedTasks.length}/${TASKS.length} úloh.`}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={resetGame} size="lg">
                    🔄 Hrať znova
                  </Button>
                  <Button onClick={onBack} variant="secondary" size="lg">
                    Späť na hry
                  </Button>
                </div>
              </Card>
            )}

            {/* Tips */}
            {!gameOver && (
              <Card className="p-4 bg-white/95 backdrop-blur">
                <h3 className="font-semibold mb-2 text-sm">💡 Tip:</h3>
                <p className="text-xs text-muted-foreground">
                  Klikaj na úlohy rýchlo po sebe v správnom poradí!
                </p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};