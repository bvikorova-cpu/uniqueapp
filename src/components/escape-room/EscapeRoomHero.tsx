import { useState, useEffect } from "react";
import { Lock, Users, Trophy, Puzzle } from "lucide-react";
import heroVideo from "@/assets/escape-room-hero.mp4.asset.json";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const stats = [
  { label: "Escape Rooms", icon: Lock, end: 76 },
  { label: "Active Players", icon: Users, end: 12400 },
  { label: "Rooms Escaped", icon: Trophy, end: 89200 },
  { label: "Puzzles Solved", icon: Puzzle, end: 534000 },
];

export function EscapeRoomHero() {
  const [counts, setCounts] = useState(stats.map(() => 0));

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setCounts(stats.map(s => Math.floor(s.end * Math.min(step / steps, 1))));
      if (step >= steps) clearInterval(timer);
    }, interval);
    return (
    <>
      <FloatingHowItWorks title={"Escape Room Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Escape Room Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Escape Room Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => clearInterval(timer);
  }, []);

  const formatNum = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toString();

  return (
    <div className="relative rounded-2xl overflow-hidden mb-8 h-[340px] md:h-[400px]">
      <video
        autoPlay muted loop playsInline
        className="absolute inset-0 w-full h-full object-cover brightness-[1.3] saturate-[1.2]"
        src={heroVideo.url}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/50" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
        <div className="border-2 border-amber-400/40 bg-card/30 backdrop-blur-xl rounded-2xl px-6 py-4 mb-4 animate-pulse shadow-[0_0_40px_rgba(217,119,6,0.15)]">
          <h1 className="text-2xl md:text-4xl font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            Virtual <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">Escape Rooms</span>
          </h1>
        </div>
        <p className="text-white/90 font-semibold text-sm md:text-base max-w-xl drop-shadow-lg mb-6">
          Solve immersive puzzles, race against the clock & challenge your team
        </p>

        <div className="grid grid-cols-4 gap-2 md:gap-4 w-full max-w-2xl">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-card/20 backdrop-blur-lg border border-amber-400/20 rounded-xl p-2 md:p-3 text-center">
                <Icon className="w-4 h-4 md:w-5 md:h-5 text-amber-400 mx-auto mb-1" />
                <div className="text-lg md:text-xl font-black text-white">{formatNum(counts[i])}</div>
                <div className="text-[10px] md:text-xs text-white/70">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
