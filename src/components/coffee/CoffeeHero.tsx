import { useLiveStats } from "@/hooks/useLiveStats";
import coffeeHeroAsset from "@/assets/coffee-hero.mp4.asset.json";
import { Coffee, MapPin, Star, Users } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const statQueries = [
  { key: "cafes", table: "coffee_cafes" },
  { key: "checkins", table: "coffee_checkins" },
  { key: "reviews", table: "coffee_reviews" },
  { key: "matches", table: "coffee_matches" },
];

const statConfig = [
  { key: "cafes", label: "Cafes", icon: MapPin },
  { key: "checkins", label: "Check-ins", icon: Coffee },
  { key: "reviews", label: "Reviews", icon: Star },
  { key: "matches", label: "Buddies", icon: Users },
];

export const CoffeeHero = () => {
  const { stats, loading } = useLiveStats(statQueries);

  return (
    <>
      <FloatingHowItWorks title={"Coffee Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Coffee Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Coffee Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="relative w-full h-[340px] sm:h-[420px] overflow-hidden rounded-2xl mb-8">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "brightness(0.55) saturate(1.3) contrast(1.1)" }}
        src={coffeeHeroAsset.url}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border-2 border-amber-500/60 bg-black/40 backdrop-blur-md mb-4 animate-pulse">
          <Coffee className="h-5 w-5 text-amber-400" />
          <span
            className="text-2xl sm:text-4xl font-black tracking-tight text-white"
            style={{
              WebkitTextStroke: "1.5px rgba(180,120,60,0.5)",
              textShadow: "0 0 30px rgba(180,120,60,0.4), 0 2px 10px rgba(0,0,0,0.6)",
            }}
          >
            Coffee Community
          </span>
        </div>
        <p
          className="text-sm sm:text-base text-white/90 max-w-lg mb-6"
          style={{ textShadow: "0 1px 6px rgba(0,0,0,0.7)" }}
        >
          Discover cafes, connect with coffee lovers, and share your passion for the perfect brew
        </p>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="grid grid-cols-4 gap-2 sm:gap-4 px-3 sm:px-6 pb-4">
          {statConfig.map((s) => {
            const Icon = s.icon;
            const val = stats[s.key];
            return (
              <div
                key={s.key}
                className="flex flex-col items-center p-2 sm:p-3 rounded-xl bg-black/50 backdrop-blur-xl border border-amber-500/20"
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400 mb-1" />
                <span className="text-lg sm:text-2xl font-black text-white">
                  {loading ? "—" : val || "—"}
                </span>
                <span className="text-[10px] sm:text-xs text-amber-200/70">{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
    </>
  );
};
