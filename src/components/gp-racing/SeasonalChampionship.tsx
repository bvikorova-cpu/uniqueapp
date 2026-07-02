import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Trophy, Flag, Calendar, Star, Crown, Medal, TrendingUp, ChevronRight } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const seasonRaces = [
  { id: 1, name: "Nebula Drift GP", date: "Mar 15", status: "completed", winner: "James K.", points: [25, 18, 15, 12, 10] },
  { id: 2, name: "Quantum Horizon GP", date: "Mar 22", status: "completed", winner: "Priya S.", points: [25, 18, 15, 12, 10] },
  { id: 3, name: "Asteroid Belt GP", date: "Mar 29", status: "live", winner: null, points: [25, 18, 15, 12, 10] },
  { id: 4, name: "Solar Flare GP", date: "Apr 5", status: "upcoming", winner: null, points: [25, 18, 15, 12, 10] },
  { id: 5, name: "Dark Matter GP", date: "Apr 12", status: "upcoming", winner: null, points: [25, 18, 15, 12, 10] },
  { id: 6, name: "Plasma Storm GP", date: "Apr 19", status: "upcoming", winner: null, points: [25, 18, 15, 12, 10] },
  { id: 7, name: "Cosmic Rift GP", date: "Apr 26", status: "upcoming", winner: null, points: [25, 18, 15, 12, 10] },
  { id: 8, name: "Supernova Finals", date: "May 3", status: "upcoming", winner: null, points: [50, 35, 25, 18, 12] },
];

const standings = [
  { pos: 1, name: "James K.", team: "Velocity Corp", points: 43, wins: 1, podiums: 2, color: "#00e5ff" },
  { pos: 2, name: "Priya S.", team: "Phoenix Racing", points: 40, wins: 1, podiums: 2, color: "#ff6b35" },
  { pos: 3, name: "Mei L.", team: "Dragon Motorsport", points: 33, wins: 0, podiums: 2, color: "#e040fb" },
  { pos: 4, name: "Carlos R.", team: "Thunder Racing", points: 27, wins: 0, podiums: 1, color: "#76ff03" },
  { pos: 5, name: "Sofia A.", team: "Nova Speed", points: 22, wins: 0, podiums: 1, color: "#ffd600" },
  { pos: 6, name: "Alex M.", team: "Quantum Motors", points: 18, wins: 0, podiums: 0, color: "#448aff" },
  { pos: 7, name: "Yuki T.", team: "Sakura Racing", points: 12, wins: 0, podiums: 0, color: "#ff80ab" },
  { pos: 8, name: "Omar H.", team: "Desert Storm", points: 8, wins: 0, podiums: 0, color: "#ffab40" },
];

const rewards = [
  { pos: "1st", prize: "5,000 Coins + Legendary Crate + Champion Title", icon: Crown },
  { pos: "2nd", prize: "3,000 Coins + Diamond Crate", icon: Medal },
  { pos: "3rd", prize: "1,500 Coins + Gold Crate", icon: Trophy },
  { pos: "4th-5th", prize: "500 Coins + Silver Crate", icon: Star },
];

export function SeasonalChampionship({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<"standings" | "schedule" | "rewards">("standings");
  const completedRaces = seasonRaces.filter(r => r.status === "completed").length;
  const progress = (completedRaces / seasonRaces.length) * 100;

  return (
    <>
      <FloatingHowItWorks title={"Seasonal Championship - How it works"} steps={[{ title: 'Open', desc: 'Access the Seasonal Championship section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Seasonal Championship.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-cyan-400 hover:bg-cyan-950/30">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-mono font-bold text-white uppercase tracking-wider">Season Championship</h2>
          <p className="text-[10px] font-mono text-cyan-400/40 uppercase tracking-[0.3em]">Season 1 — Cosmic Series</p>
        </div>
      </div>

      {/* Season Progress */}
      <Card className="p-4 bg-slate-900/60 border-cyan-500/20 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono text-cyan-400/60 uppercase">Season Progress</span>
          <span className="text-xs font-mono text-cyan-300">Race {completedRaces}/{seasonRaces.length}</span>
        </div>
        <Progress value={progress} className="h-2 bg-slate-800" />
        <div className="flex justify-between mt-2">
          {seasonRaces.map((race, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${
              race.status === "completed" ? "bg-cyan-400" : race.status === "live" ? "bg-amber-400 animate-pulse" : "bg-slate-700"
            }`} />
          ))}
        </div>
      </Card>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        {[
          { key: "standings", label: "Standings", icon: Trophy },
          { key: "schedule", label: "Schedule", icon: Calendar },
          { key: "rewards", label: "Rewards", icon: Star },
        ].map(t => (
          <Button key={t.key} variant={tab === t.key ? "default" : "outline"} size="sm"
            onClick={() => setTab(t.key as any)}
            className={tab === t.key
              ? "bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-400/30 font-mono text-xs uppercase tracking-wider"
              : "border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/30 font-mono text-xs uppercase tracking-wider"
            }>
            <t.icon className="h-3.5 w-3.5 mr-1.5" /> {t.label}
          </Button>
        ))}
      </div>

      {/* Standings */}
      {tab === "standings" && (
        <div className="space-y-2">
          {standings.map((driver, i) => (
            <motion.div key={driver.pos} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-3 p-3 rounded-xl ${
                i === 0 ? "bg-gradient-to-r from-amber-950/40 to-slate-900/60 border border-amber-500/30" :
                i === 1 ? "bg-gradient-to-r from-gray-800/30 to-slate-900/60 border border-gray-400/20" :
                i === 2 ? "bg-gradient-to-r from-orange-950/30 to-slate-900/60 border border-orange-500/20" :
                "bg-slate-900/40 border border-cyan-500/10"
              } backdrop-blur-sm`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-sm ${
                i === 0 ? "bg-amber-500/20 text-amber-300" : i === 1 ? "bg-gray-500/20 text-gray-300" : i === 2 ? "bg-orange-500/20 text-orange-300" : "bg-slate-800 text-cyan-400/60"
              }`}>
                {driver.pos}
              </div>
              <div className="w-1 h-8 rounded-full" style={{ backgroundColor: driver.color }} />
              <div className="flex-1">
                <p className="font-mono font-bold text-sm text-white">{driver.name}</p>
                <p className="text-[10px] font-mono text-cyan-400/40">{driver.team}</p>
              </div>
              <div className="text-right flex items-center gap-4">
                <div>
                  <p className="text-[10px] font-mono text-cyan-400/40">W/P</p>
                  <p className="text-xs font-mono text-cyan-300">{driver.wins}/{driver.podiums}</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-cyan-400/40">PTS</p>
                  <p className="font-mono font-bold text-white">{driver.points}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Schedule */}
      {tab === "schedule" && (
        <div className="space-y-2">
          {seasonRaces.map((race, i) => (
            <motion.div key={race.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/40 border border-cyan-500/10 backdrop-blur-sm">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                race.status === "completed" ? "bg-cyan-500/20" : race.status === "live" ? "bg-amber-500/20 animate-pulse" : "bg-slate-800"
              }`}>
                <Flag className={`h-4 w-4 ${
                  race.status === "completed" ? "text-cyan-400" : race.status === "live" ? "text-amber-400" : "text-slate-600"
                }`} />
              </div>
              <div className="flex-1">
                <p className="font-mono font-bold text-sm text-white">{race.name}</p>
                <p className="text-[10px] font-mono text-cyan-400/40">{race.date}</p>
              </div>
              {race.status === "completed" && (
                <Badge className="bg-cyan-500/10 text-cyan-300 border-cyan-500/20 font-mono text-[10px]">
                  Winner: {race.winner}
                </Badge>
              )}
              {race.status === "live" && (
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 font-mono text-[10px] animate-pulse">
                  LIVE NOW
                </Badge>
              )}
              {race.status === "upcoming" && (
                <ChevronRight className="h-4 w-4 text-cyan-400/30" />
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Rewards */}
      {tab === "rewards" && (
        <div className="space-y-3">
          {rewards.map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-slate-900/60 to-slate-950/60 border border-cyan-500/15 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-500/20">
                <r.icon className="h-6 w-6 text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="font-mono font-bold text-white">{r.pos} Place</p>
                <p className="text-xs font-mono text-cyan-400/60 mt-0.5">{r.prize}</p>
              </div>
            </motion.div>
          ))}
          <Card className="p-4 bg-gradient-to-r from-violet-950/30 to-slate-900/60 border-violet-500/20 backdrop-blur-sm">
            <p className="text-xs font-mono text-violet-300/60 text-center">
              All participants receive a Season 1 Participation Badge and 100 bonus Coins
            </p>
          </Card>
        </div>
      )}
    </div>
    </>
  );
}
