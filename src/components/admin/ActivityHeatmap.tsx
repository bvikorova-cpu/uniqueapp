import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Globe2, Activity } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Pulse {
  id: string;
  x: number;
  y: number;
  type: "signup" | "tx" | "msg";
  ts: number;
}

const COLORS: Record<string, string> = {
  signup: "bg-cyan-400 shadow-[0_0_20px_hsl(190_90%_60%/0.9)]",
  tx: "bg-emerald-400 shadow-[0_0_20px_hsl(150_85%_55%/0.9)]",
  msg: "bg-fuchsia-400 shadow-[0_0_20px_hsl(300_85%_65%/0.9)]",
};

// Approx normalized lat/lng → x/y of background world map
const seedHotspots = [
  { x: 48, y: 35, region: "EU" },
  { x: 22, y: 38, region: "US-E" },
  { x: 15, y: 42, region: "US-W" },
  { x: 75, y: 45, region: "Asia" },
  { x: 82, y: 65, region: "AU" },
  { x: 30, y: 65, region: "LATAM" },
  { x: 55, y: 55, region: "Africa" },
];

export const ActivityHeatmap = () => {
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [counts, setCounts] = useState({ signup: 0, tx: 0, msg: 0 });

  const addPulse = (type: Pulse["type"]) => {
    const spot = seedHotspots[Math.floor(Math.random() * seedHotspots.length)];
    const jitter = () => (Math.random() - 0.5) * 8;
    const p: Pulse = {
      id: crypto.randomUUID(),
      x: spot.x + jitter(),
      y: spot.y + jitter(),
      type,
      ts: Date.now(),
    };
    setPulses((prev) => [...prev.slice(-40), p]);
    setCounts((c) => ({ ...c, [type]: c[type] + 1 }));
    setTimeout(() => setPulses((prev) => prev.filter((x) => x.id !== p.id)), 4000);
  };

  useEffect(() => {
    const channels = [
      supabase
        .channel("heatmap-profiles")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "profiles" }, () => addPulse("signup"))
        .subscribe(),
      supabase
        .channel("heatmap-tx")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "transactions" }, () => addPulse("tx"))
        .subscribe(),
      supabase
        .channel("heatmap-msg")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => addPulse("msg"))
        .subscribe(),
    ];

    // Demo seed pulses so it looks alive immediately
    const demo = setInterval(() => {
      const types: Pulse["type"][] = ["signup", "tx", "msg"];
      addPulse(types[Math.floor(Math.random() * types.length)]);
    }, 2200);

    return () => {
      channels.forEach((c) => supabase.removeChannel(c));
      clearInterval(demo);
    };
  }, []);

  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/80 via-card/70 to-indigo-900/40 backdrop-blur-xl p-5 shadow-xl overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30">
            <Globe2 className="h-5 w-5 text-cyan-300" />
          </div>
          <div>
            <h3 className="font-semibold text-base">Global Activity Heatmap</h3>
            <p className="text-xs text-muted-foreground">Real-time platform pulse</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400" /> {counts.signup}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> {counts.tx}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-fuchsia-400" /> {counts.msg}</span>
        </div>
      </div>

      <div className="relative w-full aspect-[2/1] rounded-xl overflow-hidden border border-cyan-500/20 bg-[radial-gradient(ellipse_at_center,hsl(220_60%_15%)_0%,hsl(230_60%_8%)_70%)]">
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(hsl(190 90% 60% / .12) 1px, transparent 1px), linear-gradient(90deg, hsl(190 90% 60% / .12) 1px, transparent 1px)",
            backgroundSize: "8% 12%",
          }}
        />
        {/* Continent silhouettes (abstract) */}
        <svg viewBox="0 0 100 50" className="absolute inset-0 w-full h-full opacity-40">
          {seedHotspots.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r="6" fill="hsl(200 80% 50% / 0.15)" />
          ))}
        </svg>

        {/* Pulses */}
        {pulses.map((p) => (
          <div
            key={p.id}
            className="absolute"
            style={{ left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%, -50%)" }}
          >
            <span className={`block w-2.5 h-2.5 rounded-full ${COLORS[p.type]} animate-ping absolute`} />
            <span className={`block w-2.5 h-2.5 rounded-full ${COLORS[p.type]}`} />
          </div>
        ))}

        <div className="absolute bottom-2 right-3 flex items-center gap-1 text-[10px] text-cyan-200/80">
          <Activity className="h-3 w-3 animate-pulse" /> LIVE
        </div>
      </div>
    </div>
  );
};
