import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Fuel, CircleDot, Timer, Wrench, Zap, AlertTriangle, CheckCircle2 } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const tireCompounds = [
  { id: "soft", name: "Soft", color: "bg-red-500", durability: 25, grip: 95, speed: "+3%", laps: "8-12" },
  { id: "medium", name: "Medium", color: "bg-amber-500", durability: 55, grip: 75, speed: "Normal", laps: "15-22" },
  { id: "hard", name: "Hard", color: "bg-white", durability: 85, grip: 55, speed: "-2%", laps: "25-35" },
  { id: "wet", name: "Wet", color: "bg-blue-500", durability: 40, grip: 80, speed: "-5%", laps: "Rain only" },
  { id: "inter", name: "Inter", color: "bg-emerald-500", durability: 50, grip: 70, speed: "-3%", laps: "Light rain" },
];

const pitStopActions = [
  { id: "tires", name: "Tire Change", icon: CircleDot, duration: "2.4s", description: "Swap to selected compound" },
  { id: "fuel", name: "Refuel", icon: Fuel, duration: "3.1s", description: "Top up fuel reserves" },
  { id: "repair", name: "Quick Repair", icon: Wrench, duration: "4.8s", description: "Fix minor damage" },
  { id: "boost", name: "Install Boost", icon: Zap, duration: "5.5s", description: "Attach nitro canister" },
];

export function PitStrategyPlanner({ onBack }: { onBack: () => void }) {
  const [raceLaps, setRaceLaps] = useState(25);
  const [selectedCompound, setSelectedCompound] = useState("medium");
  const [pitStops, setPitStops] = useState<{ lap: number; actions: string[]; compound: string }[]>([
    { lap: 8, actions: ["tires"], compound: "medium" },
    { lap: 18, actions: ["tires", "fuel"], compound: "hard" },
  ]);
  const [newPitLap, setNewPitLap] = useState("");
  const [selectedActions, setSelectedActions] = useState<string[]>(["tires"]);

  const addPitStop = () => {
    const lap = parseInt(newPitLap);
    if (isNaN(lap) || lap < 1 || lap > raceLaps) return;
    setPitStops(prev => [...prev, { lap, actions: selectedActions, compound: selectedCompound }].sort((a, b) => a.lap - b.lap));
    setNewPitLap("");
    setSelectedActions(["tires"]);
  };

  const removePitStop = (index: number) => {
    setPitStops(prev => prev.filter((_, i) => i !== index));
  };

  const totalPitTime = pitStops.reduce((total, stop) => {
    return total + stop.actions.reduce((t, action) => {
      const a = pitStopActions.find(p => p.id === action);
      return t + (a ? parseFloat(a.duration) : 0);
    }, 0);
  }, 0);

  return (
    <>
      <FloatingHowItWorks title={"Pit Strategy Planner - How it works"} steps={[{ title: 'Open', desc: 'Access the Pit Strategy Planner section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Pit Strategy Planner.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-cyan-400 hover:bg-cyan-950/30">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-mono font-bold text-white uppercase tracking-wider">Pit Strategy Planner</h2>
          <p className="text-[10px] font-mono text-cyan-400/40 uppercase tracking-[0.3em]">Plan your race stops</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Race timeline */}
        <Card className="lg:col-span-2 relative overflow-hidden bg-slate-900/60 border-cyan-500/15 p-4">
          <h3 className="font-mono font-bold text-sm text-cyan-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Timer className="h-4 w-4" /> Race Timeline — {raceLaps} Laps
          </h3>

          {/* Visual timeline */}
          <div className="relative mb-6">
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden relative">
              {/* Lap markers */}
              {Array.from({ length: raceLaps }).map((_, i) => (
                <div key={i} className="absolute top-0 bottom-0 w-px bg-cyan-500/10"
                  style={{ left: `${(i / raceLaps) * 100}%` }} />
              ))}
              {/* Tire compound segments */}
              {pitStops.map((stop, i) => {
                const startLap = i === 0 ? 0 : pitStops[i - 1].lap;
                const compound = i === 0 ? "medium" : pitStops[i - 1].compound;
                const tire = tireCompounds.find(t => t.id === compound);
                const startPct = (startLap / raceLaps) * 100;
                const widthPct = ((stop.lap - startLap) / raceLaps) * 100;
                return (
                  <div key={i} className={`absolute top-0 bottom-0 ${tire?.color || 'bg-cyan-500'} opacity-40`}
                    style={{ left: `${startPct}%`, width: `${widthPct}%` }} />
                );
              })}
              {/* Final segment */}
              {pitStops.length > 0 && (() => {
                const lastStop = pitStops[pitStops.length - 1];
                const tire = tireCompounds.find(t => t.id === lastStop.compound);
                const startPct = (lastStop.lap / raceLaps) * 100;
                const widthPct = 100 - startPct;
                return (
                  <div className={`absolute top-0 bottom-0 ${tire?.color || 'bg-cyan-500'} opacity-40`}
                    style={{ left: `${startPct}%`, width: `${widthPct}%` }} />
                );
              })()}
            </div>
            {/* Pit stop markers */}
            {pitStops.map((stop, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 w-5 h-5 rounded-full bg-amber-500 border-2 border-slate-950 cursor-pointer flex items-center justify-center hover:scale-125 transition-transform"
                style={{ left: `calc(${(stop.lap / raceLaps) * 100}% - 10px)` }}
                onClick={() => removePitStop(i)}
              >
                <span className="text-[8px] font-mono font-bold text-slate-950">{stop.lap}</span>
              </motion.div>
            ))}
          </div>

          {/* Pit stops list */}
          <div className="space-y-2 mb-4">
            {pitStops.map((stop, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-950/50 border border-cyan-500/10"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                  <span className="text-xs font-mono font-bold text-amber-400">P{i + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="font-mono text-sm text-white">Lap {stop.lap}</p>
                  <p className="text-[10px] font-mono text-cyan-400/50">
                    {stop.actions.map(a => pitStopActions.find(p => p.id === a)?.name).join(" + ")} → {stop.compound} tires
                  </p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => removePitStop(i)}
                  className="text-red-400/60 hover:text-red-400 hover:bg-red-950/30 text-xs font-mono">
                  Remove
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Add pit stop */}
          <div className="flex flex-wrap gap-2 items-end">
            <div>
              <label className="text-[10px] font-mono text-cyan-400/40 uppercase block mb-1">Lap</label>
              <input type="number" min={1} max={raceLaps} value={newPitLap} onChange={e => setNewPitLap(e.target.value)}
                className="w-20 h-9 rounded-lg bg-slate-950/50 border border-cyan-500/20 text-white font-mono text-sm px-2 text-center" />
            </div>
            <div>
              <label className="text-[10px] font-mono text-cyan-400/40 uppercase block mb-1">Compound</label>
              <select value={selectedCompound} onChange={e => setSelectedCompound(e.target.value)}
                className="h-9 rounded-lg bg-slate-950/50 border border-cyan-500/20 text-white font-mono text-sm px-2">
                {tireCompounds.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <Button onClick={addPitStop}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border border-cyan-400/20 font-mono text-xs uppercase">
              Add Stop
            </Button>
          </div>
        </Card>

        {/* Strategy stats */}
        <div className="space-y-4">
          {/* Summary */}
          <Card className="p-4 bg-slate-900/60 border-cyan-500/15">
            <h3 className="font-mono font-bold text-sm text-cyan-300 uppercase tracking-wider mb-3">Strategy Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-cyan-400/50">Pit Stops</span>
                <span className="font-mono font-bold text-white">{pitStops.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-cyan-400/50">Total Pit Time</span>
                <span className="font-mono font-bold text-amber-400">{totalPitTime.toFixed(1)}s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-cyan-400/50">Strategy Type</span>
                <span className="font-mono font-bold text-cyan-300">
                  {pitStops.length <= 1 ? "Aggressive" : pitStops.length === 2 ? "Balanced" : "Conservative"}
                </span>
              </div>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/20 flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
              <p className="text-[10px] font-mono text-emerald-300/70">
                Strategy validated. Tire compounds and fuel levels are within race regulations.
              </p>
            </div>
          </Card>

          {/* Tire compounds ref */}
          <Card className="p-4 bg-slate-900/60 border-cyan-500/15">
            <h3 className="font-mono font-bold text-sm text-cyan-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <CircleDot className="h-4 w-4" /> Tire Compounds
            </h3>
            <div className="space-y-2">
              {tireCompounds.map(tire => (
                <div key={tire.id} className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/40">
                  <div className={`w-4 h-4 rounded-full ${tire.color}`} />
                  <div className="flex-1">
                    <p className="text-xs font-mono text-white">{tire.name}</p>
                    <p className="text-[9px] font-mono text-cyan-400/40">{tire.laps} laps • Grip: {tire.grip}%</p>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400/50">{tire.speed}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Pit stop actions */}
          <Card className="p-4 bg-slate-900/60 border-cyan-500/15">
            <h3 className="font-mono font-bold text-sm text-cyan-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Wrench className="h-4 w-4" /> Actions
            </h3>
            <div className="space-y-2">
              {pitStopActions.map(action => (
                <label key={action.id} className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/40 cursor-pointer">
                  <input type="checkbox" checked={selectedActions.includes(action.id)}
                    onChange={() => setSelectedActions(prev =>
                      prev.includes(action.id) ? prev.filter(a => a !== action.id) : [...prev, action.id]
                    )}
                    className="rounded border-cyan-500/30" />
                  <action.icon className="h-4 w-4 text-cyan-400/60" />
                  <div className="flex-1">
                    <p className="text-xs font-mono text-white">{action.name}</p>
                    <p className="text-[9px] font-mono text-cyan-400/40">{action.description}</p>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400">{action.duration}</span>
                </label>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
    </>
  );
}
