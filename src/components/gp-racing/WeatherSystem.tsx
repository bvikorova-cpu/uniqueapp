import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Cloud, Sun, CloudRain, CloudSnow, Wind, Thermometer, Eye, Droplets } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const weatherTypes = [
  { 
    id: "clear", name: "Clear Sky", icon: Sun, color: "text-amber-400", bg: "from-amber-950/30 to-orange-950/20",
    effects: { grip: "+15%", visibility: "100%", topSpeed: "+5%", tire_wear: "Normal" },
    description: "Perfect racing conditions. Maximum visibility and optimal tire grip."
  },
  { 
    id: "rain", name: "Heavy Rain", icon: CloudRain, color: "text-blue-400", bg: "from-blue-950/30 to-slate-950/20",
    effects: { grip: "-30%", visibility: "60%", topSpeed: "-10%", tire_wear: "High" },
    description: "Reduced grip and visibility. Wet tires recommended. Aquaplaning risk!"
  },
  { 
    id: "fog", name: "Dense Fog", icon: Cloud, color: "text-gray-400", bg: "from-gray-800/30 to-slate-950/20",
    effects: { grip: "-5%", visibility: "30%", topSpeed: "-15%", tire_wear: "Normal" },
    description: "Extremely low visibility. Rely on instruments and track memory."
  },
  { 
    id: "storm", name: "Solar Storm", icon: CloudSnow, color: "text-violet-400", bg: "from-violet-950/30 to-purple-950/20",
    effects: { grip: "-20%", visibility: "45%", topSpeed: "+8%", tire_wear: "Extreme" },
    description: "Electromagnetic interference with HUD. Ion-charged track boosts speed but damages tires."
  },
  { 
    id: "wind", name: "Cross Winds", icon: Wind, color: "text-emerald-400", bg: "from-emerald-950/30 to-cyan-950/20",
    effects: { grip: "-10%", visibility: "85%", topSpeed: "-8%", tire_wear: "Low" },
    description: "Strong lateral winds affect aerodynamics. High downforce recommended."
  },
  { 
    id: "night", name: "Night Race", icon: Eye, color: "text-cyan-400", bg: "from-cyan-950/30 to-blue-950/20",
    effects: { grip: "+5%", visibility: "50%", topSpeed: "Normal", tire_wear: "Low" },
    description: "Cooler temperatures improve grip. Headlight visibility limited on tight corners."
  },
];

const activeCircuits = [
  { name: "Nebula Drift Circuit", weather: "rain", temp: "18°C", humidity: "89%", windSpeed: "45 km/h" },
  { name: "Quantum Horizon Ring", weather: "clear", temp: "28°C", humidity: "35%", windSpeed: "12 km/h" },
  { name: "Asteroid Belt Gauntlet", weather: "storm", temp: "42°C", humidity: "15%", windSpeed: "78 km/h" },
  { name: "Plasma Loop", weather: "night", temp: "14°C", humidity: "62%", windSpeed: "22 km/h" },
];

export function WeatherSystem({ onBack }: { onBack: () => void }) {
  const [selectedWeather, setSelectedWeather] = useState(weatherTypes[0]);
  const [animatedDrops, setAnimatedDrops] = useState<{ id: number; x: number; delay: number }[]>([]);

  useEffect(() => {
    if (selectedWeather.id === "rain" || selectedWeather.id === "storm") {
      setAnimatedDrops(Array.from({ length: 30 }, (_, i) => ({
        id: i, x: Math.random() * 100, delay: Math.random() * 2,
      })));
    } else {
      setAnimatedDrops([]);
    }
  }, [selectedWeather]);

  return (
    <>
      <FloatingHowItWorks title={"Weather System - How it works"} steps={[{ title: 'Open', desc: 'Access the Weather System section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Weather System.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-cyan-400 hover:bg-cyan-950/30">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-mono font-bold text-white uppercase tracking-wider">Weather System</h2>
          <p className="text-[10px] font-mono text-cyan-400/40 uppercase tracking-[0.3em]">Dynamic race conditions</p>
        </div>
      </div>

      {/* Weather preview */}
      <Card className={`relative overflow-hidden bg-gradient-to-br ${selectedWeather.bg} border-cyan-500/20 p-6 min-h-[200px]`}>
        {/* Rain particles */}
        {animatedDrops.map(drop => (
          <motion.div
            key={drop.id}
            className="absolute w-0.5 h-4 bg-blue-400/40 rounded-full"
            style={{ left: `${drop.x}%` }}
            animate={{ y: ["-20px", "220px"], opacity: [0, 1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: drop.delay }}
          />
        ))}

        {/* Scanlines */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,229,255,0.015) 3px, rgba(0,229,255,0.015) 6px)',
        }} />

        <div className="relative z-10 flex items-center gap-6">
          <div className="relative">
            <selectedWeather.icon className={`h-16 w-16 ${selectedWeather.color}`} />
            <div className={`absolute -inset-4 rounded-full blur-xl opacity-20 ${selectedWeather.color.replace('text-', 'bg-')}`} />
          </div>
          <div>
            <h3 className="text-2xl font-mono font-bold text-white">{selectedWeather.name}</h3>
            <p className="text-sm text-cyan-100/60 mt-1 max-w-md">{selectedWeather.description}</p>
          </div>
        </div>

        {/* Effects grid */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          {[
            { label: "Grip", value: selectedWeather.effects.grip, icon: Droplets },
            { label: "Visibility", value: selectedWeather.effects.visibility, icon: Eye },
            { label: "Top Speed", value: selectedWeather.effects.topSpeed, icon: Wind },
            { label: "Tire Wear", value: selectedWeather.effects.tire_wear, icon: Thermometer },
          ].map((effect, i) => (
            <div key={i} className="p-3 rounded-lg bg-slate-950/40 border border-cyan-500/10">
              <effect.icon className="h-4 w-4 text-cyan-400/60 mb-1" />
              <p className="font-mono font-bold text-white text-sm">{effect.value}</p>
              <p className="text-[10px] font-mono text-cyan-400/40 uppercase">{effect.label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Weather selector */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {weatherTypes.map((weather) => (
          <button
            key={weather.id}
            onClick={() => setSelectedWeather(weather)}
            className={`p-3 rounded-xl border text-center transition-all ${
              selectedWeather.id === weather.id
                ? 'border-cyan-400 bg-cyan-500/10 scale-105'
                : 'border-cyan-500/15 bg-slate-900/40 hover:border-cyan-500/30'
            }`}
          >
            <weather.icon className={`h-6 w-6 mx-auto mb-1 ${weather.color}`} />
            <p className="text-[10px] font-mono text-white uppercase">{weather.name}</p>
          </button>
        ))}
      </div>

      {/* Live circuit weather */}
      <Card className="p-4 bg-slate-900/60 border-cyan-500/15">
        <h3 className="font-mono font-bold text-sm text-cyan-300 uppercase tracking-wider mb-4">Live Circuit Conditions</h3>
        <div className="space-y-3">
          {activeCircuits.map((circuit, i) => {
            const weather = weatherTypes.find(w => w.id === circuit.weather) || weatherTypes[0];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-950/50 border border-cyan-500/10"
              >
                <weather.icon className={`h-5 w-5 ${weather.color} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="font-mono font-bold text-white text-sm truncate">{circuit.name}</p>
                  <p className="text-[10px] font-mono text-cyan-400/40">{weather.name}</p>
                </div>
                <div className="flex gap-3 shrink-0 text-[10px] font-mono text-cyan-400/50">
                  <span>{circuit.temp}</span>
                  <span>{circuit.windSpeed}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </div>
    </>
  );
}
