import { useEffect, useState } from "react";
import { Users, Zap, TrendingUp, DollarSign } from "lucide-react";
import heroVideo from "@/assets/influ-king-hero.mp4.asset.json";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

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
    <div className="relative w-full h-[480px] md:h-[420px] rounded-2xl overflow-hidden mb-8">
      <video
        autoPlay loop muted playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "brightness(1.4) saturate(1.3) contrast(1.1)" }}
      >
        <source src={heroVideo.url} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3 pb-28 md:pb-24">
        <div className="border-2 border-cyan-400/70 bg-black/60 backdrop-blur-xl rounded-2xl px-5 md:px-10 py-4 md:py-6 mb-3 shadow-[0_0_60px_rgba(0,255,255,0.35),inset_0_0_30px_rgba(0,255,255,0.1)]">
          <h1 className="text-3xl md:text-6xl font-black text-white tracking-wider whitespace-nowrap drop-shadow-[0_0_20px_rgba(0,255,255,0.6)]" style={{ textShadow: '0 0 30px rgba(0,255,255,0.5), 0 0 60px rgba(0,255,255,0.3), 0 2px 4px rgba(0,0,0,0.8)' }}>
            ⚡ VIRTUAL INFLU-KING ⚡
          </h1>
        </div>
        <p className="text-sm md:text-xl font-bold text-white max-w-2xl bg-black/40 backdrop-blur-sm rounded-xl px-4 md:px-6 py-2" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
          AI-Powered Virtual Influencer Agency
        </p>
      </div>

      <div className="absolute bottom-3 left-3 right-3 grid grid-cols-4 gap-1.5 md:gap-2">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const val = liveStats[stat.key as keyof typeof liveStats];
          return (
            <div key={stat.key} className="bg-cyan-950/50 backdrop-blur-md border border-cyan-400/40 rounded-xl p-2 md:p-3 text-center">
              <Icon className="h-3.5 w-3.5 md:h-4 md:w-4 text-cyan-300 mx-auto mb-0.5" />
              <p className="text-sm md:text-lg font-bold text-white drop-shadow-md leading-tight">
                {stat.key === "earnings" ? `€${(val / 1000).toFixed(0)}K` : val.toLocaleString()}
              </p>
              <p className="text-[10px] md:text-xs text-white/80 font-medium truncate">{stat.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
