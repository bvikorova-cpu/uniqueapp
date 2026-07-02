import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Activity, Gauge, Thermometer, Zap, TrendingUp, BarChart3 } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface TelemetryPoint {
  lap: number;
  speed: number;
  gForce: number;
  throttle: number;
  brake: number;
  tireTemp: number;
  engineTemp: number;
  fuelLevel: number;
  kers: number;
}

function generateLapData(laps: number): TelemetryPoint[] {
  return Array.from({ length: laps }, (_, i) => ({
    lap: i + 1,
    speed: 280 + Math.sin(i * 0.5) * 40 + Math.random() * 15,
    gForce: 2.5 + Math.sin(i * 0.7) * 1.5 + Math.random() * 0.5,
    throttle: 70 + Math.sin(i * 0.3) * 25 + Math.random() * 5,
    brake: 20 + Math.cos(i * 0.4) * 15 + Math.random() * 10,
    tireTemp: 85 + i * 0.8 + Math.random() * 5,
    engineTemp: 95 + Math.sin(i * 0.2) * 8 + Math.random() * 3,
    fuelLevel: 100 - i * (100 / laps) + Math.random() * 2,
    kers: 60 + Math.sin(i * 0.6) * 30 + Math.random() * 10,
  }));
}

function MiniChart({ data, dataKey, color, label, unit, max }: {
  data: TelemetryPoint[]; dataKey: keyof TelemetryPoint; color: string; label: string; unit: string; max: number;
}) {
  const values = data.map(d => d[dataKey] as number);
  const chartMax = max;
  const current = values[values.length - 1];
  const avg = values.reduce((a, b) => a + b, 0) / values.length;

  return (
    <>
      <FloatingHowItWorks title={"Telemetry - How it works"} steps={[{ title: 'Open', desc: 'Access the Telemetry section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Telemetry.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-3 bg-slate-950/50 border-cyan-500/10 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono text-cyan-400/50 uppercase tracking-wider">{label}</span>
        <span className="font-mono font-bold text-sm text-white">{current.toFixed(1)}{unit}</span>
      </div>
      <div className="flex items-end gap-px h-16">
        {values.slice(-30).map((v, i) => (
          <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${(v / chartMax) * 100}%` }}
            transition={{ delay: i * 0.02 }}
            className="flex-1 rounded-t-sm" style={{ backgroundColor: color, opacity: 0.3 + (i / 30) * 0.7 }} />
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[9px] font-mono text-cyan-400/30">AVG: {avg.toFixed(1)}{unit}</span>
        <span className="text-[9px] font-mono text-cyan-400/30">MAX: {Math.max(...values).toFixed(1)}{unit}</span>
      </div>
    </Card>
    </>
  );
}

export function Telemetry({ onBack }: { onBack: () => void }) {
  const [data, setData] = useState<TelemetryPoint[]>(() => generateLapData(25));
  const [isLive, setIsLive] = useState(true);
  const [selectedCar, setSelectedCar] = useState("phantom-x1");

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setData(prev => {
        const lastLap = prev[prev.length - 1].lap;
        const newPoint: TelemetryPoint = {
          lap: lastLap + 1,
          speed: 280 + Math.sin(lastLap * 0.5) * 40 + Math.random() * 15,
          gForce: 2.5 + Math.sin(lastLap * 0.7) * 1.5 + Math.random() * 0.5,
          throttle: 70 + Math.sin(lastLap * 0.3) * 25 + Math.random() * 5,
          brake: 20 + Math.cos(lastLap * 0.4) * 15 + Math.random() * 10,
          tireTemp: Math.min(120, 85 + lastLap * 0.5 + Math.random() * 5),
          engineTemp: 95 + Math.sin(lastLap * 0.2) * 8 + Math.random() * 3,
          fuelLevel: Math.max(5, 100 - lastLap * 2 + Math.random() * 2),
          kers: 60 + Math.sin(lastLap * 0.6) * 30 + Math.random() * 10,
        };
        return [...prev.slice(-50), newPoint];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isLive]);

  const latest = data[data.length - 1];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-cyan-400 hover:bg-cyan-950/30">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-mono font-bold text-white uppercase tracking-wider">Live Telemetry</h2>
            <p className="text-[10px] font-mono text-cyan-400/40 uppercase tracking-[0.3em]">Real-time performance data</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedCar} onValueChange={setSelectedCar}>
            <SelectTrigger className="w-40 bg-slate-900/50 border-cyan-500/30 text-white font-mono text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-950 border-cyan-500/30">
              <SelectItem value="phantom-x1">Phantom X1</SelectItem>
              <SelectItem value="firebird-r7">Firebird R7</SelectItem>
              <SelectItem value="dragon-mk3">Dragon MK3</SelectItem>
            </SelectContent>
          </Select>
          <Button variant={isLive ? "default" : "outline"} size="sm" onClick={() => setIsLive(!isLive)}
            className={isLive ? "bg-emerald-600 hover:bg-emerald-500 font-mono text-xs" : "border-cyan-500/30 text-cyan-300 font-mono text-xs"}>
            <Activity className={`h-3.5 w-3.5 mr-1.5 ${isLive ? "animate-pulse" : ""}`} />
            {isLive ? "LIVE" : "PAUSED"}
          </Button>
        </div>
      </div>

      {/* HUD Summary */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Speed", value: `${latest.speed.toFixed(0)}`, unit: "km/h", icon: Gauge, color: "text-cyan-400" },
          { label: "G-Force", value: `${latest.gForce.toFixed(1)}`, unit: "G", icon: Zap, color: "text-amber-400" },
          { label: "Tire Temp", value: `${latest.tireTemp.toFixed(0)}`, unit: "°C", icon: Thermometer, color: latest.tireTemp > 110 ? "text-red-400" : "text-emerald-400" },
          { label: "Fuel", value: `${latest.fuelLevel.toFixed(0)}`, unit: "%", icon: BarChart3, color: latest.fuelLevel < 20 ? "text-red-400" : "text-blue-400" },
        ].map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="p-3 rounded-xl bg-slate-900/60 border border-cyan-500/15 backdrop-blur-sm text-center">
            <item.icon className={`h-4 w-4 mx-auto mb-1 ${item.color}`} />
            <p className="font-mono font-bold text-lg text-white">{item.value}<span className="text-[10px] text-cyan-400/40 ml-0.5">{item.unit}</span></p>
            <p className="text-[9px] font-mono text-cyan-400/40 uppercase">{item.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <MiniChart data={data} dataKey="speed" color="#00e5ff" label="Speed" unit=" km/h" max={360} />
        <MiniChart data={data} dataKey="gForce" color="#ffc107" label="G-Force" unit=" G" max={6} />
        <MiniChart data={data} dataKey="throttle" color="#4caf50" label="Throttle" unit="%" max={100} />
        <MiniChart data={data} dataKey="brake" color="#f44336" label="Brake Pressure" unit="%" max={100} />
        <MiniChart data={data} dataKey="tireTemp" color="#ff9800" label="Tire Temperature" unit="°C" max={140} />
        <MiniChart data={data} dataKey="kers" color="#e040fb" label="KERS Energy" unit="%" max={100} />
      </div>

      {/* Scanline overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-10" style={{
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,229,255,0.05) 2px, rgba(0,229,255,0.05) 4px)',
      }} />
    </div>
  );
}
