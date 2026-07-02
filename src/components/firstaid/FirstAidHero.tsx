import { useState, useEffect } from "react";
import { Heart, Activity, Shield, Users } from "lucide-react";
import heroVideo from "@/assets/firstaid-hero.mp4.asset.json";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface FirstAidHeroProps {
  stats: Record<string, number>;
  loading: boolean;
}

export function FirstAidHero({ stats, loading }: FirstAidHeroProps) {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => { setIsVisible(true); }, []);

  const statItems = [
    { icon: Heart, label: "Guides Viewed", key: "guides" },
    { icon: Activity, label: "Quizzes Taken", key: "quizzes" },
    { icon: Shield, label: "Certifications", key: "certs" },
    { icon: Users, label: "Active Learners", key: "learners" },
  ];

  return (
    <>
      <FloatingHowItWorks title={"First Aid Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the First Aid Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in First Aid Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="relative w-full h-[420px] md:h-[500px] rounded-2xl overflow-hidden mb-8">
      <video
        autoPlay muted loop playsInline
        className="absolute inset-0 w-full h-full object-cover brightness-[1.15] saturate-[1.2]"
        src={heroVideo.url}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 to-transparent" />

      <div className={`relative z-10 flex flex-col items-center justify-center h-full text-center px-4 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/20 border border-red-400/30 backdrop-blur-md mb-4">
          <Heart className="w-4 h-4 text-red-400" />
          <span className="text-red-200 text-sm font-medium">Emergency Ready</span>
        </div>
        <h1
          className="text-4xl md:text-6xl font-black text-white mb-3"
          style={{
            WebkitTextStroke: "1.5px rgba(255,255,255,0.3)",
            textShadow: "0 0 40px rgba(220,38,38,0.5), 0 0 80px rgba(220,38,38,0.3), 0 4px 20px rgba(0,0,0,0.7)"
          }}
        >
          First Aid Hub
        </h1>
        <p className="text-white/80 text-lg max-w-xl mb-6" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}>
          Master life-saving skills with AI-powered training & instant emergency guides
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-2xl">
          {statItems.map((s) => {
            const Icon = s.icon;
            const val = loading ? "—" : (stats[s.key] || "—");
            return (
              <div key={s.key} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl py-3 px-2 text-center">
                <Icon className="w-5 h-5 text-red-400 mx-auto mb-1" />
                <p className="text-white text-xl font-bold">{val}</p>
                <p className="text-white/60 text-xs">{s.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
    </>
  );
}
