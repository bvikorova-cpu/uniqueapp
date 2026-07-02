import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Timer, Trophy, Flame, Medal, Users, Clock, Zap } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Tournament {
  id: string;
  name: string;
  room: string;
  entryFee: number;
  prizePool: number;
  participants: number;
  maxParticipants: number;
  startsIn: string;
  status: "upcoming" | "live" | "ended";
}

const tournaments: Tournament[] = [
  { id: "1", name: "Lightning Sprint #12", room: "Neon Crypt", entryFee: 5, prizePool: 150, participants: 28, maxParticipants: 32, startsIn: "2h 15m", status: "upcoming" },
  { id: "2", name: "Weekly Grand Prix", room: "Ancient Tomb", entryFee: 10, prizePool: 500, participants: 64, maxParticipants: 64, startsIn: "LIVE", status: "live" },
  { id: "3", name: "Midnight Blitz", room: "Haunted Asylum", entryFee: 3, prizePool: 80, participants: 16, maxParticipants: 16, startsIn: "5h 30m", status: "upcoming" },
];

const leaderboard = [
  { rank: 1, name: "SpeedPhantom", time: "12:34", room: "Neon Crypt", prize: "€75" },
  { rank: 2, name: "FlashEscape", time: "13:01", room: "Neon Crypt", prize: "€45" },
  { rank: 3, name: "QuickSolver", time: "13:28", room: "Neon Crypt", prize: "€30" },
  { rank: 4, name: "NightRunner", time: "14:15", room: "Neon Crypt", prize: "—" },
  { rank: 5, name: "PuzzleBolt", time: "14:52", room: "Neon Crypt", prize: "—" },
];

export function SpeedrunTournamentsView({ onBack }: { onBack: () => void }) {
  return (
    <>
      <FloatingHowItWorks title={"Speedrun Tournaments View - How it works"} steps={[{ title: 'Open', desc: 'Access the Speedrun Tournaments View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Speedrun Tournaments View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-900/30 via-orange-900/20 to-amber-900/30 p-6 border border-red-500/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-[50px]" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg">
              <Timer className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black">Speedrun Tournaments</h2>
              <p className="text-muted-foreground text-sm">Race against time. Compete for prizes. Prove you're the fastest.</p>
            </div>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active"><Flame className="w-4 h-4 mr-1" />Active Tournaments</TabsTrigger>
          <TabsTrigger value="leaderboard"><Medal className="w-4 h-4 mr-1" />Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4 space-y-3">
          {tournaments.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className={t.status === "live" ? "border-red-500/40 shadow-red-500/10 shadow-lg" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold">{t.name}</h4>
                      <Badge variant={t.status === "live" ? "destructive" : "secondary"} className="text-[10px]">
                        {t.status === "live" && <Flame className="w-2.5 h-2.5 mr-0.5" />}
                        {t.status === "live" ? "LIVE" : t.startsIn}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span className="font-bold text-yellow-400">€{t.prizePool}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Room: {t.room}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{t.participants}/{t.maxParticipants}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs">Entry: €{t.entryFee}</span>
                    <Button size="sm" onClick={() => toast.info("Joining tournament...")} disabled={t.status === "live" && t.participants >= t.maxParticipants}>
                      {t.status === "live" ? "Watch Live" : "Register"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500" />Lightning Sprint #11 Results</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leaderboard.map((entry, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className={`flex items-center justify-between p-3 rounded-lg ${i < 3 ? "bg-amber-500/5 border border-amber-500/10" : "bg-muted/30"}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${i === 0 ? "bg-yellow-500 text-black" : i === 1 ? "bg-gray-400 text-black" : i === 2 ? "bg-amber-700 text-white" : "bg-muted text-muted-foreground"}`}>
                        {entry.rank}
                      </span>
                      <span className="font-bold text-sm">{entry.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm flex items-center gap-1"><Clock className="w-3 h-3" />{entry.time}</span>
                      <span className="text-sm font-bold text-yellow-400 w-12 text-right">{entry.prize}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </>
  );
}
