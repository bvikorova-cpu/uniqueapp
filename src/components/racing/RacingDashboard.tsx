import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { 
  Trophy, 
  Flag, 
  Timer, 
  Users, 
  Play,
  Pause,
  RotateCcw,
  Car
} from "lucide-react";

interface Driver {
  position: number;
  name: string;
  team: string;
  avatar?: string;
  gap: string;
  lapTime: string;
  status: "racing" | "pit" | "retired";
}

interface RaceReplay {
  id: string;
  title: string;
  date: string;
  duration: string;
  thumbnail?: string;
}

const defaultDrivers: Driver[] = [
  { position: 1, name: "Max V.", team: "Red Bull", gap: "Leader", lapTime: "1:32.456", status: "racing" },
  { position: 2, name: "Lewis H.", team: "Mercedes", gap: "+2.341", lapTime: "1:32.891", status: "racing" },
  { position: 3, name: "Charles L.", team: "Ferrari", gap: "+5.672", lapTime: "1:33.102", status: "racing" },
  { position: 4, name: "Lando N.", team: "McLaren", gap: "+8.445", lapTime: "1:33.445", status: "pit" },
  { position: 5, name: "Carlos S.", team: "Ferrari", gap: "+12.890", lapTime: "1:33.667", status: "racing" },
  { position: 6, name: "George R.", team: "Mercedes", gap: "+15.234", lapTime: "1:33.890", status: "racing" },
];

const defaultReplays: RaceReplay[] = [
  { id: "1", title: "Monako GP 2024", date: "26.05.2024", duration: "1:45:32" },
  { id: "2", title: "Silverstone GP 2024", date: "07.07.2024", duration: "1:38:45" },
  { id: "3", title: "Spa GP 2024", date: "28.07.2024", duration: "1:42:18" },
];

const teamColors: Record<string, string> = {
  "Red Bull": "bg-blue-600",
  "Mercedes": "bg-teal-500",
  "Ferrari": "bg-red-600",
  "McLaren": "bg-orange-500",
};

export const RacingDashboard = () => {
  const [isLive, setIsLive] = useState(true);
  const [activeTab, setActiveTab] = useState("leaderboard");

  return (
    <div className="space-y-6">
      {/* Race Status */}
      <Card className="bg-gradient-to-r from-red-500/10 to-transparent border-red-500/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Flag className="h-6 w-6 text-red-500" />
              <div>
                <h2 className="text-xl font-bold">Abu Dhabi GP</h2>
                <p className="text-sm text-muted-foreground">Okruh Yas Marina</p>
              </div>
            </div>
            <Badge variant={isLive ? "destructive" : "secondary"} className="animate-pulse">
              {isLive ? "LIVE" : "Ukončené"}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-muted/50 rounded-lg">
              <Timer className="h-5 w-5 mx-auto mb-1" />
              <p className="text-lg font-bold">Kolo 45/58</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <Car className="h-5 w-5 mx-auto mb-1" />
              <p className="text-lg font-bold">20 jazdcov</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <Users className="h-5 w-5 mx-auto mb-1" />
              <p className="text-lg font-bold">125k divákov</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="leaderboard">
            <Trophy className="h-4 w-4 mr-2" />
            Poradie
          </TabsTrigger>
          <TabsTrigger value="replays">
            <Play className="h-4 w-4 mr-2" />
            Záznamy
          </TabsTrigger>
          <TabsTrigger value="teams">
            <Users className="h-4 w-4 mr-2" />
            Tímy
          </TabsTrigger>
        </TabsList>

        {/* Live Leaderboard */}
        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle>Live poradie</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {defaultDrivers.map((driver, index) => (
                <motion.div
                  key={driver.position}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    driver.status === "pit" ? "bg-yellow-500/10" : "bg-muted/50"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold">
                    {driver.position}
                  </div>
                  <div className={`w-1 h-8 rounded-full ${teamColors[driver.team] || "bg-gray-500"}`} />
                  <div className="flex-1">
                    <p className="font-semibold">{driver.name}</p>
                    <p className="text-xs text-muted-foreground">{driver.team}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm">{driver.gap}</p>
                    <p className="text-xs text-muted-foreground">{driver.lapTime}</p>
                  </div>
                  {driver.status === "pit" && (
                    <Badge variant="outline" className="text-yellow-500">PIT</Badge>
                  )}
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Replays */}
        <TabsContent value="replays">
          <Card>
            <CardHeader>
              <CardTitle>Záznamy pretekov</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {defaultReplays.map((replay) => (
                <div
                  key={replay.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                >
                  <div className="w-24 h-14 rounded bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                    <Play className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{replay.title}</p>
                    <p className="text-sm text-muted-foreground">{replay.date}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">{replay.duration}</Badge>
                  </div>
                </div>
              ))}

              <div className="flex justify-center gap-2 pt-4">
                <Button variant="outline" size="icon" onClick={() => console.info("[Coming soon] This action")}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button size="icon" onClick={() => console.info("[Coming soon] This action")}>
                  <Play className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => console.info("[Coming soon] This action")}>
                  <Pause className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Teams */}
        <TabsContent value="teams">
          <Card>
            <CardHeader>
              <CardTitle>Fantasy tímy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Vytvorte si vlastný fantasy tím a súťažte s priateľmi!
              </p>
              <Button className="w-full" onClick={() => console.info("[Coming soon] Vytvoriť tím")}>Vytvoriť tím</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RacingDashboard;
