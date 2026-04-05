import { useEffect, useState } from "react";
import { Users, Zap, TrendingUp, DollarSign } from "lucide-react";
import heroVideo from "@/assets/influ-king-hero.mp4.asset.json";

const stats = [
  { label: "Influencers", icon: Users, key: "influencers" },
  { label: "Content", icon: Zap, key: "content" },
  { label: "Engagement", icon: TrendingUp, key: "engagement" },
  { label: "Earnings", icon: DollarSign, key: "earnings" },
];

export function InfluKingHero() {
  const [liveStats, setLiveStats] = useState({ influencers: 0, content: 0, engagement: 0, earnings: 0 });

  useEffect(() => {
    setLiveStats({ influencers: 1842, content: 24560, engagement: 89400, earnings: 156200 });
    const interval = setInterval(() => {
      setLiveStats({
        influencers: Math.floor(Math.random() * 200) + 1800,
        content: Math.floor(Math.random() * 2000) + 24000,
        engagement: Math.floor(Math.random() * 5000) + 87000,
        earnings: Math.floor(Math.random() * 10000) + 150000,
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[420px] rounded-2xl overflow-hidden mb-8">
      <video
        autoPlay loop muted playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "brightness(1.4) saturate(1.3) contrast(1.1)" }}
      >
        <source src={heroVideo.url} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-cyan-500/5 to-transparent" />

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <div className="border-2 border-cyan-400/50 bg-cyan-950/40 backdrop-blur-lg rounded-2xl px-8 py-5 mb-4 shadow-[0_0_40px_rgba(0,255,255,0.2)] animate-pulse-slow">
          <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
            ⚡ INFLU-KING ⚡
          </h1>
        </div>
        <p className="text-lg md:text-xl font-bold text-white max-w-2xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
          AI-Powered Virtual Influencer Agency — Create, Monetize, Dominate
        </p>
      </div>

      <div className="absolute bottom-4 left-4 right-4 grid grid-cols-4 gap-2">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const val = liveStats[stat.key as keyof typeof liveStats];
          return (
            <div key={stat.key} className="bg-cyan-950/40 backdrop-blur-md border border-cyan-400/40 rounded-xl p-3 text-center">
              <Icon className="h-4 w-4 text-cyan-300 mx-auto mb-1" />
              <p className="text-lg font-bold text-white drop-shadow-md">
                {stat.key === "earnings" ? `€${(val / 1000).toFixed(0)}K` : val.toLocaleString()}
              </p>
              <p className="text-xs text-white/80 font-medium">{stat.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
