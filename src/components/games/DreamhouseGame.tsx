import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Home, Sparkles, Heart, Star, Cookie, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DreamhouseGameProps {
  onBack: () => void;
}

const ROOMS = [
  { name: "Obývačka", icon: "🛋️", activities: ["Pozerať film", "Počúvať hudbu", "Čítať"] },
  { name: "Kuchyňa", icon: "🍳", activities: ["Piecť koláč", "Variť večeru", "Robiť smoothie"] },
  { name: "Spálňa", icon: "🛏️", activities: ["Obliekať sa", "Spať", "Čítať časopis"] },
  { name: "Kúpeľňa", icon: "🛁", activities: ["Kúpať sa", "Líčiť sa", "Česať vlasy"] },
  { name: "Záhrada", icon: "🌸", activities: ["Zalievať kvety", "Pikniky", "Hrať sa"] },
  { name: "Garáž", icon: "🚗", activities: ["Jazdiť autom", "Upratovať", "Opraviť"] },
];

const ACHIEVEMENTS = [
  { name: "Domáca hviezda", count: 10, icon: "⭐" },
  { name: "Kuchárka", count: 20, icon: "👩‍🍳" },
  { name: "Módna ikona", count: 30, icon: "👗" },
  { name: "Záhradníčka", count: 40, icon: "🌺" },
];

export const DreamhouseGame = ({ onBack }: DreamhouseGameProps) => {
  const { toast } = useToast();
  const [selectedRoom, setSelectedRoom] = useState(ROOMS[0]);
  const [completedActivities, setCompletedActivities] = useState<string[]>([]);
  const [points, setPoints] = useState(0);

  const completeActivity = (activity: string) => {
    if (completedActivities.includes(activity)) {
      toast({
        title: "✅ Už si to urobila!",
        description: "Skús inú aktivitu.",
      });
      return;
    }

    const newCompleted = [...completedActivities, activity];
    setCompletedActivities(newCompleted);
    setPoints(points + 10);

    const messages = [
      "Úžasné! 💖",
      "Perfektné! ✨",
      "Skvelá práca! 🌟",
      "Pokračuj! 🎉",
    ];

    toast({
      title: messages[Math.floor(Math.random() * messages.length)],
      description: `${activity} - +10 bodov!`,
    });

    // Check achievements
    const achievementThresholds = [10, 20, 30, 40];
    if (achievementThresholds.includes(newCompleted.length)) {
      const achievement = ACHIEVEMENTS.find(a => a.count === newCompleted.length);
      if (achievement) {
        setTimeout(() => {
          toast({
            title: `🏆 Nový úspech!`,
            description: `${achievement.icon} ${achievement.name}`,
          });
        }, 1000);
      }
    }
  };

  const resetGame = () => {
    setCompletedActivities([]);
    setPoints(0);
    setSelectedRoom(ROOMS[0]);
    
    toast({
      title: "🔄 Nový deň!",
      description: "Hra bola resetovaná",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-300 via-purple-300 to-blue-300 pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Späť
          </Button>
          <h1 className="text-3xl font-bold text-white">🏠 Barbie Dreamhouse Adventures</h1>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-lg">
            <Star className="h-5 w-5 text-yellow-300" />
            <span className="text-white font-semibold">{points} bodov</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main House View */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-white/95 backdrop-blur">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">🏡 Dreamhouse</h2>
                <p className="text-muted-foreground">Vyber miestnosť a vykonávaj aktivity!</p>
              </div>

              {/* Rooms Grid */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {ROOMS.map((room) => (
                  <button
                    key={room.name}
                    onClick={() => setSelectedRoom(room)}
                    className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                      selectedRoom.name === room.name
                        ? 'border-pink-500 bg-pink-50 scale-105 shadow-lg'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    <div className="text-4xl mb-2">{room.icon}</div>
                    <p className="text-sm font-semibold">{room.name}</p>
                  </button>
                ))}
              </div>

              {/* Current Room Activities */}
              <Card className="p-6 bg-gradient-to-br from-pink-50 to-purple-50">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-3xl">{selectedRoom.icon}</span>
                  {selectedRoom.name}
                </h3>

                <div className="space-y-3">
                  {selectedRoom.activities.map((activity) => {
                    const isCompleted = completedActivities.includes(activity);
                    return (
                      <button
                        key={activity}
                        onClick={() => completeActivity(activity)}
                        disabled={isCompleted}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          isCompleted
                            ? 'border-green-500 bg-green-50 opacity-75'
                            : 'border-pink-300 bg-white hover:bg-pink-50 hover:scale-102 hover:border-pink-500'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{activity}</span>
                          {isCompleted ? (
                            <span className="text-green-500 text-xl">✓</span>
                          ) : (
                            <Sparkles className="h-5 w-5 text-pink-500" />
                          )}
                        </div>
                        {!isCompleted && (
                          <p className="text-xs text-muted-foreground mt-1">+10 bodov</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </Card>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Progress */}
            <Card className="p-4 bg-white/95 backdrop-blur">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Home className="h-4 w-4 text-pink-500" />
                Pokrok
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Dokončené aktivity:</span>
                  <span className="font-bold">{completedActivities.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-pink-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(completedActivities.length / 18) * 100}%` }}
                  />
                </div>
              </div>
            </Card>

            {/* Achievements */}
            <Card className="p-4 bg-white/95 backdrop-blur">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                Úspechy
              </h3>
              <div className="space-y-2">
                {ACHIEVEMENTS.map((achievement) => {
                  const unlocked = completedActivities.length >= achievement.count;
                  return (
                    <div
                      key={achievement.name}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        unlocked
                          ? 'border-yellow-500 bg-yellow-50'
                          : 'border-gray-300 bg-gray-50 opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{achievement.icon}</span>
                        <div className="flex-1">
                          <p className="text-xs font-semibold">{achievement.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {achievement.count} aktivít
                          </p>
                        </div>
                        {unlocked && <span className="text-yellow-500">✓</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Actions */}
            <Card className="p-4 bg-white/95 backdrop-blur">
              <Button onClick={resetGame} className="w-full" variant="secondary">
                🔄 Nový deň
              </Button>
            </Card>

            {/* Tips */}
            <Card className="p-4 bg-white/95 backdrop-blur">
              <h3 className="font-semibold mb-2 text-sm">Tipy:</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>✨ Dokončuj aktivity v každej miestnosti</li>
                <li>🏆 Odomkni všetky úspechy</li>
                <li>💖 Získaj 180 bodov pre plný dom!</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};