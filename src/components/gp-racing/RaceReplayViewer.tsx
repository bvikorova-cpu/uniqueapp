import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward, Maximize2, Clock, Trophy, Flame, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const demoReplays = [
  { id: 1, name: "Nebula Drift Circuit — Grand Final", date: "2026-03-28", winner: "Phantom Racer", laps: 15, bestLap: "1:23.456", topSpeed: "347 km/h", positions: 8 },
  { id: 2, name: "Quantum Horizon Ring — Sprint", date: "2026-03-27", winner: "Thunder X", laps: 8, bestLap: "0:58.112", topSpeed: "312 km/h", positions: 6 },
  { id: 3, name: "Asteroid Belt Gauntlet — Rain Race", date: "2026-03-26", winner: "Neon Shadow", laps: 12, bestLap: "1:45.890", topSpeed: "289 km/h", positions: 10 },
  { id: 4, name: "Plasma Loop — Time Trial", date: "2026-03-25", winner: "CyberDrift", laps: 5, bestLap: "1:01.234", topSpeed: "355 km/h", positions: 4 },
];

export function RaceReplayViewer({ onBack }: { onBack: () => void }) {
  const [selectedReplay, setSelectedReplay] = useState<typeof demoReplays[0] | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  return (
    <>
      <FloatingHowItWorks title={"Race Replay Viewer - How it works"} steps={[{ title: 'Open', desc: 'Access the Race Replay Viewer section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Race Replay Viewer.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-cyan-400 hover:bg-cyan-950/30">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-mono font-bold text-white uppercase tracking-wider">Race Replay Viewer</h2>
          <p className="text-[10px] font-mono text-cyan-400/40 uppercase tracking-[0.3em]">Relive the action</p>
        </div>
      </div>

      {selectedReplay ? (
        <div className="space-y-4">
          {/* Replay viewport */}
          <Card className="relative overflow-hidden bg-slate-900/80 border-cyan-500/30 aspect-video">
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Simulated replay view with HUD */}
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 to-slate-950/80" />
              
              {/* HUD corners */}
              <div className="absolute top-3 left-3 w-8 h-8 border-l-2 border-t-2 border-cyan-400/50 rounded-tl" />
              <div className="absolute top-3 right-3 w-8 h-8 border-r-2 border-t-2 border-cyan-400/50 rounded-tr" />
              <div className="absolute bottom-16 left-3 w-8 h-8 border-l-2 border-b-2 border-cyan-400/50 rounded-bl" />
              <div className="absolute bottom-16 right-3 w-8 h-8 border-r-2 border-b-2 border-cyan-400/50 rounded-br" />

              {/* Scanlines */}
              <div className="absolute inset-0 pointer-events-none" style={{
                background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,229,255,0.02) 3px, rgba(0,229,255,0.02) 6px)',
              }} />

              {/* Center play icon */}
              {!isPlaying && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative z-10 w-20 h-20 rounded-full bg-cyan-500/20 border-2 border-cyan-400/50 flex items-center justify-center cursor-pointer hover:bg-cyan-500/30 transition-colors"
                  onClick={() => setIsPlaying(true)}
                >
                  <Play className="h-8 w-8 text-cyan-400 ml-1" />
                </motion.div>
              )}

              {/* Top HUD info */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-4 px-4 py-1.5 bg-slate-950/70 backdrop-blur-sm rounded-full border border-cyan-500/20">
                <span className="text-[10px] font-mono text-cyan-400 uppercase">Lap 7/{selectedReplay.laps}</span>
                <div className="w-px h-3 bg-cyan-500/30" />
                <span className="text-[10px] font-mono text-amber-400 uppercase">{selectedReplay.topSpeed}</span>
              </div>

              {/* Position overlay */}
              <div className="absolute top-4 left-4 px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-lg">
                <span className="text-amber-400 font-mono font-bold text-lg">P1</span>
              </div>

              {/* Animated race car positions */}
              <div className="absolute bottom-20 left-0 right-0 px-8">
                <div className="relative h-2 bg-cyan-950/50 rounded-full overflow-hidden">
                  {Array.from({ length: selectedReplay.positions }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute top-0 h-full w-3 rounded-full"
                      style={{ backgroundColor: i === 0 ? '#00e5ff' : `hsl(${i * 40}, 70%, 50%)` }}
                      animate={isPlaying ? {
                        left: [`${10 + i * 8}%`, `${90 - i * 5}%`, `${50 + Math.random() * 30}%`],
                      } : {}}
                      transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Controls bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-sm border-t border-cyan-500/20 p-3">
              <div className="flex items-center gap-3">
                <Button size="icon" variant="ghost" className="h-8 w-8 text-cyan-400 hover:bg-cyan-950/50" onClick={() => setIsPlaying(false)} title="Restart">
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-cyan-400 hover:bg-cyan-950/50"
                  onClick={() => setIsPlaying(!isPlaying)}>
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-cyan-400 hover:bg-cyan-950/50" onClick={() => setIsPlaying(true)} title="Skip forward">
                  <SkipForward className="h-4 w-4" />
                </Button>
                <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                    animate={isPlaying ? { width: ["0%", "100%"] } : {}}
                    transition={{ duration: 15, repeat: Infinity }}
                  />
                </div>
                <span className="text-[10px] font-mono text-cyan-400/60">
                  {isPlaying ? "PLAYING" : "PAUSED"}
                </span>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-cyan-400 hover:bg-cyan-950/50" onClick={async () => {
                  try {
                    const el = document.documentElement;
                    if (!document.fullscreenElement) await el.requestFullscreen();
                    else await document.exitFullscreen();
                  } catch {}
                }} title="Fullscreen">
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Race stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Winner", value: selectedReplay.winner, icon: Trophy, color: "text-amber-400" },
              { label: "Best Lap", value: selectedReplay.bestLap, icon: Clock, color: "text-cyan-400" },
              { label: "Top Speed", value: selectedReplay.topSpeed, icon: Flame, color: "text-orange-400" },
              { label: "Total Laps", value: `${selectedReplay.laps}`, icon: Play, color: "text-emerald-400" },
            ].map((stat, i) => (
              <Card key={i} className="p-3 bg-slate-900/60 border-cyan-500/15">
                <stat.icon className={`h-4 w-4 ${stat.color} mb-1`} />
                <p className="font-mono font-bold text-white text-sm">{stat.value}</p>
                <p className="text-[10px] font-mono text-cyan-400/40 uppercase">{stat.label}</p>
              </Card>
            ))}
          </div>

          <Button variant="outline" onClick={() => setSelectedReplay(null)}
            className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/30 font-mono text-xs uppercase">
            ← All Replays
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {demoReplays.map((replay, i) => (
            <motion.div key={replay.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="relative overflow-hidden bg-slate-900/60 border-cyan-500/20 backdrop-blur-sm group hover:border-cyan-400/40 transition-all cursor-pointer"
                onClick={() => setSelectedReplay(replay)}>
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-mono font-bold text-sm text-white">{replay.name}</h3>
                      <p className="text-[10px] font-mono text-cyan-400/40 mt-1">{replay.date}</p>
                    </div>
                    <Play className="h-5 w-5 text-cyan-400/40 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <div className="flex gap-3 text-[10px] font-mono text-cyan-400/50">
                    <span>🏆 {replay.winner}</span>
                    <span>⏱️ {replay.bestLap}</span>
                    <span>🏁 {replay.laps} laps</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
    </>
  );
}
