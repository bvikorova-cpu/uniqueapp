import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Trophy, Zap, Cloud, Droplet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Track {
  id: number;
  name: string;
  country: string;
  emoji: string;
  laps: number;
  difficulty: string;
}

const tracks: Track[] = [
  { id: 1, name: "Monaco", country: "Monaco", emoji: "🇲🇨", laps: 5, difficulty: "Hard" },
  { id: 2, name: "Silverstone", country: "UK", emoji: "🇬🇧", laps: 4, difficulty: "Medium" },
  { id: 3, name: "Monza", country: "Italy", emoji: "🇮🇹", laps: 4, difficulty: "Easy" },
  { id: 4, name: "Suzuka", country: "Japan", emoji: "🇯🇵", laps: 5, difficulty: "Hard" }
];

const weatherConditions = ["Sunny ☀️", "Cloudy ☁️", "Rainy 🌧️"];
const teams = ["Red Bull", "Ferrari", "Mercedes", "McLaren"];

const Formula1Racing = () => {
  const navigate = useNavigate();
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isRacing, setIsRacing] = useState(false);
  const [currentLap, setCurrentLap] = useState(0);
  const [position, setPosition] = useState(1);
  const [fuel, setFuel] = useState(100);
  const [tires, setTires] = useState(100);
  const [weather, setWeather] = useState("Sunny ☀️");
  const [totalWins, setTotalWins] = useState(0);
  const [selectedTeam, setSelectedTeam] = useState("Red Bull");

  useEffect(() => {
    if (isRacing && currentLap < (selectedTrack?.laps || 0)) {
      const lapTimer = setTimeout(() => {
        setCurrentLap(currentLap + 1);
        setFuel(fuel - 15);
        setTires(tires - 10);
        
        // Random position changes
        const newPosition = Math.max(1, Math.min(4, position + (Math.random() > 0.5 ? -1 : 1)));
        setPosition(newPosition);
        
        toast.success(`Lap ${currentLap + 1} completed! Position: ${newPosition}`);
      }, 3000);
      
      return () => clearTimeout(lapTimer);
    } else if (isRacing && currentLap >= (selectedTrack?.laps || 0)) {
      finishRace();
    }
  }, [isRacing, currentLap]);

  const startRace = (track: Track) => {
    setSelectedTrack(track);
    setIsRacing(true);
    setCurrentLap(0);
    setPosition(Math.floor(Math.random() * 4) + 1);
    setFuel(100);
    setTires(100);
    setWeather(weatherConditions[Math.floor(Math.random() * weatherConditions.length)]);
    toast.success(`Race started at ${track.name}! 🏁`);
  };

  const pitStop = () => {
    if (fuel < 50 || tires < 50) {
      setFuel(100);
      setTires(100);
      toast.success("Pit stop complete! Refueled and new tires! 🔧");
    } else {
      toast.error("You don't need a pit stop yet!");
    }
  };

  const finishRace = () => {
    setIsRacing(false);
    
    if (position === 1) {
      setTotalWins(totalWins + 1);
      toast.success("🏆 You won the race! Congratulations!");
    } else if (position <= 3) {
      toast.success(`🥈 Finished in position ${position}! Great job!`);
    } else {
      toast.info(`Finished in position ${position}. Better luck next time!`);
    }
  };

  const progressPercentage = selectedTrack 
    ? (currentLap / selectedTrack.laps) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-gray-50 to-black/5 p-4">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/kids-channel')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Kids Channel
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-red-700 mb-2">
            🏎️ Formula 1 Grand Prix 🏁
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Race to victory on world-famous tracks!
          </p>

          <div className="flex justify-center gap-4 flex-wrap">
            <Badge className="bg-red-600 text-white text-xl px-6 py-3">
              <Trophy className="w-5 h-5 mr-2 inline" />
              {totalWins} Wins
            </Badge>
            <Badge className="bg-blue-600 text-white text-xl px-6 py-3">
              Team: {selectedTeam}
            </Badge>
          </div>
        </div>

        {/* Team Selection */}
        {!isRacing && (
          <Card className="border-4 border-gray-300 shadow-xl mb-6">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-800">Select Your Team</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {teams.map((team) => (
                  <Button
                    key={team}
                    onClick={() => {
                      setSelectedTeam(team);
                      toast.success(`Joined ${team} team!`);
                    }}
                    variant={selectedTeam === team ? "default" : "outline"}
                    className={`py-6 ${
                      selectedTeam === team 
                        ? "bg-red-600 hover:bg-red-700 text-white" 
                        : "border-2"
                    }`}
                  >
                    {team}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {isRacing && selectedTrack ? (
          <Card className="border-4 border-red-600 shadow-2xl">
            <CardHeader>
              <div className="text-center">
                <div className="text-6xl mb-4">{selectedTrack.emoji}</div>
                <CardTitle className="text-3xl text-red-700">
                  {selectedTrack.name} Grand Prix
                </CardTitle>
                <p className="text-xl text-gray-600 mt-2">{weather}</p>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Race Progress */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-lg font-bold">
                    Lap {currentLap}/{selectedTrack.laps}
                  </span>
                  <Badge className="bg-red-600 text-white text-lg">
                    Position: {position}/4
                  </Badge>
                </div>
                <Progress value={progressPercentage} className="h-4" />
              </div>

              {/* Telemetry */}
              <div className="grid grid-cols-2 gap-4">
                <Card className={`${fuel < 30 ? "bg-red-100 border-red-400" : "bg-green-100 border-green-400"} border-2`}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Zap className={`w-12 h-12 mx-auto mb-2 ${fuel < 30 ? "text-red-600" : "text-green-600"}`} />
                      <p className="text-sm text-gray-600">Fuel</p>
                      <p className="text-3xl font-bold">{fuel}%</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className={`${tires < 30 ? "bg-red-100 border-red-400" : "bg-blue-100 border-blue-400"} border-2`}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-5xl mb-2">🏎️</div>
                      <p className="text-sm text-gray-600">Tires</p>
                      <p className="text-3xl font-bold">{tires}%</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Button
                onClick={pitStop}
                disabled={fuel >= 50 && tires >= 50}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-6 text-xl"
              >
                Pit Stop 🔧
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tracks.map((track) => (
              <Card
                key={track.id}
                className="border-4 border-red-300 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <CardHeader>
                  <div className="text-center">
                    <div className="text-6xl mb-4">{track.emoji}</div>
                    <CardTitle className="text-2xl text-red-700">
                      {track.name}
                    </CardTitle>
                    <p className="text-gray-600">{track.country}</p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <Badge className={
                      track.difficulty === "Easy" ? "bg-green-500" :
                      track.difficulty === "Medium" ? "bg-yellow-500" :
                      "bg-red-500"
                    }>
                      {track.difficulty}
                    </Badge>
                    <Badge className="bg-blue-500">
                      {track.laps} Laps
                    </Badge>
                  </div>

                  <Button
                    onClick={() => startRace(track)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg"
                  >
                    Start Race! 🏁
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Formula1Racing;
