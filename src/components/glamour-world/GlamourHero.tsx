import { useEffect, useState } from "react";
import { Crown, Sparkles, Heart, Star } from "lucide-react";
import heroVideo from "@/assets/glamour-world-hero.mp4.asset.json";

const stats = [
  { label: "Creations", icon: Sparkles, key: "creations" },
  { label: "Outfits", icon: Crown, key: "outfits" },
  { label: "Stories", icon: Heart, key: "stories" },
  { label: "Pets", icon: Star, key: "pets" },
];

export function GlamourHero() {
  const [liveStats, setLiveStats] = useState({ creations: 0, outfits: 0, stories: 0, pets: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats({
        creations: Math.floor(Math.random() * 500) + 1200,
        outfits: Math.floor(Math.random() * 300) + 800,
        stories: Math.floor(Math.random() * 200) + 400,
        pets: Math.floor(Math.random() * 150) + 350,
      });
    }, 3000);
    setLiveStats({ creations: 1456, outfits: 923, stories: 512, pets: 387 });
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[420px] rounded-2xl overflow-hidden mb-8">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "brightness(1.4) saturate(1.3)" }}
      >
        <source src={heroVideo.url} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-pink-500/10 to-purple-500/10" />

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <div className="border-2 border-pink-400/40 bg-card/40 backdrop-blur-lg rounded-2xl px-8 py-4 mb-4">
          <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-lg">
            ✨ Glamour World ✨
          </h1>
        </div>
        <p className="text-lg md:text-xl font-semibold text-white/90 max-w-2xl drop-shadow-md">
          Your magical kingdom of fashion, creativity & endless fun
        </p>
      </div>

      <div className="absolute bottom-4 left-4 right-4 grid grid-cols-4 gap-2">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.key}
              className="bg-card/30 backdrop-blur-md border border-pink-400/30 rounded-xl p-3 text-center"
            >
              <Icon className="h-4 w-4 text-pink-300 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">
                {liveStats[stat.key as keyof typeof liveStats].toLocaleString()}
              </p>
              <p className="text-xs text-white/70">{stat.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
