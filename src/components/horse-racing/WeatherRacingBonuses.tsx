import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cloud, Sun, CloudRain, Snowflake, Wind, Thermometer, Eye, Zap, Shield, Flame, Heart, Info } from "lucide-react";
import { useUserHorses } from "@/hooks/useHorseRacing";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface WeatherCondition {
  id: string;
  name: string;
  icon: string;
  description: string;
  effects: { breed: string; bonus: string; multiplier: number }[];
  trackEffect: string;
  color: string;
  bgClass: string;
}

const WEATHER_CONDITIONS: WeatherCondition[] = [
  {
    id: "sunny",
    name: "Sunny & Clear",
    icon: "☀️",
    description: "Perfect racing conditions with dry track and high visibility",
    effects: [
      { breed: "thoroughbred", bonus: "+10% Speed", multiplier: 1.1 },
      { breed: "arabian", bonus: "+15% Stamina", multiplier: 1.15 },
      { breed: "quarter", bonus: "+5% Acceleration", multiplier: 1.05 },
    ],
    trackEffect: "Fast Track — All horses gain +3 base speed",
    color: "text-amber-400",
    bgClass: "from-amber-950/30 to-orange-950/20",
  },
  {
    id: "rainy",
    name: "Heavy Rain",
    icon: "🌧️",
    description: "Wet and slippery track with reduced visibility",
    effects: [
      { breed: "mustang", bonus: "+20% Stamina", multiplier: 1.2 },
      { breed: "thoroughbred", bonus: "-5% Speed", multiplier: 0.95 },
      { breed: "quarter", bonus: "+10% Temperament", multiplier: 1.1 },
    ],
    trackEffect: "Muddy Track — Stamina matters more, speed reduced",
    color: "text-blue-400",
    bgClass: "from-blue-950/30 to-slate-950/20",
  },
  {
    id: "snowy",
    name: "Snow & Ice",
    icon: "❄️",
    description: "Frozen track with challenging conditions",
    effects: [
      { breed: "mustang", bonus: "+25% All Stats", multiplier: 1.25 },
      { breed: "arabian", bonus: "-10% Stamina", multiplier: 0.9 },
      { breed: "thoroughbred", bonus: "-5% Acceleration", multiplier: 0.95 },
    ],
    trackEffect: "Frozen Track — Wild horses excel, others struggle",
    color: "text-cyan-400",
    bgClass: "from-cyan-950/30 to-blue-950/20",
  },
  {
    id: "windy",
    name: "Strong Winds",
    icon: "💨",
    description: "Powerful headwinds and crosswinds affect racing",
    effects: [
      { breed: "arabian", bonus: "+15% Speed", multiplier: 1.15 },
      { breed: "quarter", bonus: "+10% Acceleration", multiplier: 1.1 },
      { breed: "thoroughbred", bonus: "+5% Stamina", multiplier: 1.05 },
    ],
    trackEffect: "Wind Tunnel — Lighter breeds gain an advantage",
    color: "text-emerald-400",
    bgClass: "from-emerald-950/30 to-green-950/20",
  },
  {
    id: "foggy",
    name: "Dense Fog",
    icon: "🌫️",
    description: "Low visibility creates unpredictable race dynamics",
    effects: [
      { breed: "quarter", bonus: "+15% Temperament", multiplier: 1.15 },
      { breed: "mustang", bonus: "+10% Acceleration", multiplier: 1.1 },
      { breed: "arabian", bonus: "+5% Speed", multiplier: 1.05 },
    ],
    trackEffect: "Fog Track — Temperament becomes critical for steady racing",
    color: "text-gray-400",
    bgClass: "from-gray-900/30 to-slate-950/20",
  },
  {
    id: "storm",
    name: "Thunderstorm",
    icon: "⛈️",
    description: "Extreme conditions with lightning and heavy rain",
    effects: [
      { breed: "mustang", bonus: "+30% All Stats", multiplier: 1.3 },
      { breed: "thoroughbred", bonus: "-10% All Stats", multiplier: 0.9 },
      { breed: "quarter", bonus: "+15% Temperament", multiplier: 1.15 },
    ],
    trackEffect: "Storm Track — Only the bravest horses thrive",
    color: "text-violet-400",
    bgClass: "from-violet-950/30 to-purple-950/20",
  },
];

export const WeatherRacingBonuses = () => {
  const { horses } = useUserHorses();
  const [selectedWeather, setSelectedWeather] = useState<string>("sunny");
  
  const currentWeather = WEATHER_CONDITIONS.find(w => w.id === selectedWeather)!;

  const getHorseWeatherBonus = (breed: string) => {
    const effect = currentWeather.effects.find(e => e.breed === breed);
    return effect || null;
  };

  return (
    <>
      <FloatingHowItWorks title={"Weather Racing Bonuses - How it works"} steps={[{ title: 'Open', desc: 'Access the Weather Racing Bonuses section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Weather Racing Bonuses.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black font-mono flex items-center gap-2 text-white">
          <Cloud className="h-6 w-6 text-amber-400" /> Weather Racing Bonuses
        </h2>
        <p className="text-amber-400/50 font-mono text-sm">Different weather conditions affect breeds differently</p>
      </div>

      {/* Weather Selector */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {WEATHER_CONDITIONS.map((w) => (
          <Button key={w.id} variant="outline" size="sm"
            onClick={() => setSelectedWeather(w.id)}
            className={`flex-col h-auto py-3 font-mono text-[10px] ${
              selectedWeather === w.id
                ? "bg-gradient-to-b from-amber-600/20 to-red-600/10 border-amber-400/40 text-amber-300"
                : "bg-slate-800/40 border-amber-500/10 text-amber-400/50"
            }`}
          >
            <span className="text-xl mb-1">{w.icon}</span>
            <span className="truncate w-full text-center">{w.name.split(" ")[0]}</span>
          </Button>
        ))}
      </div>

      {/* Current Weather Card */}
      <motion.div key={selectedWeather} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className={`p-5 bg-gradient-to-br ${currentWeather.bgClass} border-amber-500/15 backdrop-blur-sm`}>
          <div className="flex items-start gap-4 mb-4">
            <span className="text-5xl">{currentWeather.icon}</span>
            <div>
              <h3 className={`text-xl font-black font-mono ${currentWeather.color}`}>{currentWeather.name}</h3>
              <p className="text-xs font-mono text-amber-400/40 mt-1">{currentWeather.description}</p>
            </div>
          </div>

          {/* Track Effect */}
          <div className="p-3 rounded-lg bg-slate-950/40 border border-amber-500/10 mb-4">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-amber-400 shrink-0" />
              <p className="text-xs font-mono text-amber-300">{currentWeather.trackEffect}</p>
            </div>
          </div>

          {/* Breed Effects */}
          <h4 className="text-xs font-mono text-amber-400/60 uppercase tracking-wider mb-2">Breed Modifiers</h4>
          <div className="space-y-2">
            {currentWeather.effects.map((effect, i) => (
              <motion.div
                key={effect.breed}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  effect.multiplier >= 1 
                    ? "bg-emerald-950/20 border-emerald-500/15" 
                    : "bg-red-950/20 border-red-500/15"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm capitalize font-mono font-bold text-white">{effect.breed}</span>
                </div>
                <Badge className={`font-mono text-[10px] ${
                  effect.multiplier >= 1 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                }`}>
                  {effect.bonus}
                </Badge>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Your Horses in This Weather */}
      {horses && horses.length > 0 && (
        <div>
          <h3 className="font-mono text-sm text-amber-400/60 uppercase tracking-wider mb-3">
            Your Horses in {currentWeather.name}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {horses.map((horse, i) => {
              const bonus = getHorseWeatherBonus(horse.breed);
              return (
                <motion.div
                  key={horse.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="p-3 bg-slate-900/40 border-amber-500/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg border border-white/10" style={{ backgroundColor: horse.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-mono font-bold text-white text-sm truncate">{horse.name}</p>
                        <p className="text-[10px] font-mono text-amber-400/40 capitalize">{horse.breed}</p>
                      </div>
                      {bonus ? (
                        <Badge className={`font-mono text-[10px] ${
                          bonus.multiplier >= 1 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                        }`}>
                          {bonus.bonus}
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-500/20 text-gray-400 font-mono text-[10px]">No Effect</Badge>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      <Card className="p-4 bg-slate-900/40 border-amber-500/10">
        <h3 className="font-bold font-mono text-sm text-amber-300 mb-2">🌤️ Weather System Info</h3>
        <ul className="text-xs text-amber-400/50 font-mono space-y-1">
          <li>• Weather changes randomly for each race event</li>
          <li>• Build a diverse stable to handle all weather conditions</li>
          <li>• Mustangs excel in extreme weather (snow, storms)</li>
          <li>• Thoroughbreds perform best in clear, sunny conditions</li>
          <li>• Arabians are wind specialists with strong stamina</li>
        </ul>
      </Card>
    </div>
    </>
  );
};
