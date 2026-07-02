import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Trophy,
  Flag,
  Timer,
  Users,
  Play,
  Pause,
  RotateCcw,
  Car,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

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
  const { user } = useAuth();
  const [isLive] = useState(true);
  const [activeTab, setActiveTab] = useState("leaderboard");

  // Replay player
  const [replayIdx, setReplayIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progressSec, setProgressSec] = useState(0);
  const intervalRef = useRef<number | null>(null);

  // Fantasy team dialog
  const [teamDialog, setTeamDialog] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [creating, setCreating] = useState(false);
  const [myTeams, setMyTeams] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("f1_fantasy_teams")
      .select("id, team_name, total_points")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setMyTeams(data || []));
  }, [user]);

  const parseDuration = (d: string) => {
    const [h, m, s] = d.split(":").map(Number);
    return h * 3600 + m * 60 + s;
  };
  const formatProgress = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const currentReplay = defaultReplays[replayIdx];
  const totalSec = parseDuration(currentReplay.duration);

  useEffect(() => {
    if (!playing) {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = window.setInterval(() => {
      setProgressSec((p) => {
        if (p >= totalSec) {
          setPlaying(false);
          return totalSec;
        }
        return p + 30; // 30s per tick = 30x speed
      });
    }, 500);
    return (
    <>
      <FloatingHowItWorks title={"Racing Dashboard - How it works"} steps={[{ title: 'Open', desc: 'Access the Racing Dashboard section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Racing Dashboard.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [playing, totalSec]);

  const handlePlay = () => {
    if (progressSec >= totalSec) setProgressSec(0);
    setPlaying(true);
    toast.success(`Playing: ${currentReplay.title}`);
  };
  const handlePause = () => {
    setPlaying(false);
    toast.info("Paused");
  };
  const handleRewind = () => {
    setProgressSec(0);
    toast.info("Rewound to start");
  };
  const selectReplay = (idx: number) => {
    setReplayIdx(idx);
    setProgressSec(0);
    setPlaying(false);
  };

  const createTeam = async () => {
    if (!user) {
      toast.error("Please sign in to create a fantasy team");
      return;
    }
    if (!teamName.trim()) {
      toast.error("Team name is required");
      return;
    }
    setCreating(true);
    try {
      const { data, error } = await supabase
        .from("f1_fantasy_teams")
        .insert({ user_id: user.id, team_name: teamName.trim() })
        .select()
        .single();
      if (error) throw error;
      setMyTeams((prev) => [data, ...prev]);
      setTeamName("");
      setTeamDialog(false);
      toast.success(`Team "${data.team_name}" created!`);
    } catch (err: any) {
      toast.error(err.message || "Could not create team");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
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
              {isLive ? "LIVE" : "Finished"}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-muted/50 rounded-lg"><Timer className="h-5 w-5 mx-auto mb-1" /><p className="text-lg font-bold">Kolo 45/58</p></div>
            <div className="p-3 bg-muted/50 rounded-lg"><Car className="h-5 w-5 mx-auto mb-1" /><p className="text-lg font-bold">20 jazdcov</p></div>
            <div className="p-3 bg-muted/50 rounded-lg"><Users className="h-5 w-5 mx-auto mb-1" /><p className="text-lg font-bold">125k viewers</p></div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="leaderboard"><Trophy className="h-4 w-4 mr-2" />Poradie</TabsTrigger>
          <TabsTrigger value="replays"><Play className="h-4 w-4 mr-2" />Replays</TabsTrigger>
          <TabsTrigger value="teams"><Users className="h-4 w-4 mr-2" />Teams</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard">
          <Card>
            <CardHeader><CardTitle>Live poradie</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {defaultDrivers.map((driver, index) => (
                <motion.div key={driver.position} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-3 p-3 rounded-lg ${driver.status === "pit" ? "bg-yellow-500/10" : "bg-muted/50"}`}>
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold">{driver.position}</div>
                  <div className={`w-1 h-8 rounded-full ${teamColors[driver.team] || "bg-gray-500"}`} />
                  <div className="flex-1">
                    <p className="font-semibold">{driver.name}</p>
                    <p className="text-xs text-muted-foreground">{driver.team}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm">{driver.gap}</p>
                    <p className="text-xs text-muted-foreground">{driver.lapTime}</p>
                  </div>
                  {driver.status === "pit" && <Badge variant="outline" className="text-yellow-500">PIT</Badge>}
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="replays">
          <Card>
            <CardHeader><CardTitle>Race replays</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {defaultReplays.map((replay, idx) => (
                <div key={replay.id} onClick={() => selectReplay(idx)}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-colors cursor-pointer ${idx === replayIdx ? "bg-primary/10 border border-primary/30" : "bg-muted/50 hover:bg-muted"}`}>
                  <div className="w-24 h-14 rounded bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                    <Play className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{replay.title}</p>
                    <p className="text-sm text-muted-foreground">{replay.date}</p>
                  </div>
                  <Badge variant="secondary">{replay.duration}</Badge>
                </div>
              ))}

              <div className="pt-4 space-y-3">
                <div className="text-center text-xs text-muted-foreground">
                  <p className="font-semibold">{currentReplay.title}</p>
                  <p>{formatProgress(progressSec)} / {currentReplay.duration}</p>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all"
                    style={{ width: `${Math.min(100, (progressSec / totalSec) * 100)}%` }} />
                </div>
                <div className="flex justify-center gap-2">
                  <Button variant="outline" size="icon" onClick={handleRewind} aria-label="Rewind">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  {playing ? (
                    <Button size="icon" onClick={handlePause} aria-label="Pause"><Pause className="h-4 w-4" /></Button>
                  ) : (
                    <Button size="icon" onClick={handlePlay} aria-label="Play"><Play className="h-4 w-4" /></Button>
                  )}
                  <Button variant="outline" size="icon" onClick={handlePause} disabled={!playing} aria-label="Stop">
                    <Pause className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams">
          <Card>
            <CardHeader><CardTitle>Fantasy teams</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {myTeams.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Create your own fantasy team and compete with friends!
                </p>
              ) : (
                <div className="space-y-2">
                  {myTeams.map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Trophy className="h-4 w-4 text-amber-400" />
                        <span className="font-semibold">{t.team_name}</span>
                      </div>
                      <Badge variant="secondary">{t.total_points || 0} pts</Badge>
                    </div>
                  ))}
                </div>
              )}
              <Button className="w-full" onClick={() => setTeamDialog(true)}>Create team</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={teamDialog} onOpenChange={setTeamDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create fantasy team</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Label>Team name</Label>
            <Input value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Speed Demons" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTeamDialog(false)}>Cancel</Button>
            <Button onClick={createTeam} disabled={creating}>
              {creating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RacingDashboard;
