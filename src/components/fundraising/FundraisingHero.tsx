import { motion } from "framer-motion";
import { Heart, Sparkles, TrendingUp, Users, Play, Pause, Volume2, VolumeX, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import heroVideo from "@/assets/fundraising-hub-hero.mp4.asset.json";
import { supabase } from "@/integrations/supabase/client";

interface FundraisingHeroProps {
  onMyCampaigns: () => void;
  onExplore: () => void;
}

const AnimatedCounter = ({ target, prefix = "", suffix = "" }: { target: number; prefix?: string; suffix?: string }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    const duration = 1600; const steps = 50; const inc = target / steps; let cur = 0;
    const t = setInterval(() => {
      cur += inc;
      if (cur >= target) { setCount(target); clearInterval(t); }
      else setCount(Math.floor(cur));
    }, duration / steps);
    return () => clearInterval(t);
  }, [target]);
  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

export function FundraisingHero({ onMyCampaigns, onExplore }: FundraisingHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [stats, setStats] = useState({ campaigns: 0, donors: 0, raised: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (videoRef.current) videoRef.current.play().catch(() => setIsPlaying(false));
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const tables = ["medical_campaigns", "crisis_campaigns", "pet_rescue_campaigns", "student_campaigns", "dream_campaigns", "hero_campaigns", "talent_campaigns"];
        let totalCampaigns = 0;
        let totalRaised = 0;
        for (const t of tables) {
          const { count } = await supabase.from(t as any).select("*", { count: "exact", head: true }).eq("status", "active");
          totalCampaigns += count || 0;
          const { data } = await supabase.from(t as any).select("current_amount");
          if (data) totalRaised += (data as any[]).reduce((s, r) => s + (Number(r.current_amount) || 0), 0);
        }
        const { count: donorsCount } = await supabase.from("campaign_donations" as any).select("*", { count: "exact", head: true }).eq("status", "completed");
        if (!mounted) return;
        setStats({ campaigns: totalCampaigns, donors: donorsCount || 0, raised: Math.round(totalRaised) });
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const togglePlay = () => { if (!videoRef.current) return; if (isPlaying) videoRef.current.pause(); else videoRef.current.play(); setIsPlaying(!isPlaying); };
  const toggleMute = () => { if (!videoRef.current) return; videoRef.current.muted = !isMuted; setIsMuted(!isMuted); };

  const heroStats = [
    { icon: Heart, label: "Active Campaigns", value: stats.campaigns, prefix: "", suffix: "" },
    { icon: Users, label: "Donors", value: stats.donors, prefix: "", suffix: "" },
    { icon: TrendingUp, label: "Raised", value: stats.raised, prefix: "€", suffix: "" },
  ];

  return (
    <div className="relative min-h-[640px] sm:h-[78vh] sm:min-h-[560px] w-full overflow-hidden rounded-3xl border border-amber-500/20 mb-8 shadow-[0_0_80px_-20px_rgba(251,191,36,0.4)]">
      {/* Black fallback + video */}
      <div className="absolute inset-0 bg-black" />
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover brightness-[1.1] saturate-[1.15]"
        autoPlay muted loop playsInline
      >
        <source src={heroVideo.url} type="video/mp4" />
      </video>

      {/* Premium gradient overlay - darker for legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/55 to-black/90" />
      <div className="absolute inset-0 bg-gradient-to-r from-amber-950/20 via-transparent to-purple-950/25" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end pt-20 pb-10 px-6 sm:px-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-4 mt-4">
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-black/80 backdrop-blur-xl text-white text-sm font-semibold border border-amber-400/60 shadow-[0_0_40px_rgba(251,191,36,0.45)]">
            <Heart className="w-4 h-4 text-rose-400" fill="currentColor" />
            <span className="text-amber-100">Premium Fundraising Hub</span>
            <Sparkles className="w-4 h-4 text-amber-300" />
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-black text-center mb-4 text-white"
          style={{
            textShadow: "0 2px 4px rgba(0,0,0,0.95), 0 4px 24px rgba(0,0,0,0.85), 0 0 60px rgba(251,191,36,0.35)",
          }}
        >
          Change a Life.
          <br />
          <span
            className="text-amber-300"
            style={{ textShadow: "0 0 20px rgba(251,191,36,0.6), 0 2px 8px rgba(0,0,0,0.9)" }}
          >
            Today.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-white text-center mb-6 max-w-3xl mx-auto font-semibold"
          style={{ textShadow: "0 2px 6px rgba(0,0,0,0.95), 0 1px 2px rgba(0,0,0,1)" }}
        >
          Transparent, verified campaigns. AI-powered storytelling. Match donations & milestone celebrations — fundraising done beautifully.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="flex justify-center gap-3 flex-wrap mb-7"
        >
          <Button
            size="lg"
            onClick={onExplore}
            className="bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-600 hover:via-rose-600 hover:to-purple-700 text-white font-bold border-0 shadow-[0_0_30px_rgba(251,191,36,0.4)]"
          >
            <Heart className="mr-2 h-4 w-4" fill="currentColor" /> Explore Causes
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={onMyCampaigns}
            className="bg-black/40 backdrop-blur-xl border-amber-400/40 text-white hover:bg-black/60 hover:border-amber-400/60"
          >
            <Sparkles className="mr-2 h-4 w-4" /> My Campaigns
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-3 max-w-3xl mx-auto w-full"
        >
          {heroStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45 + i * 0.05 }}
              className="bg-black/50 backdrop-blur-xl rounded-2xl p-3 sm:p-4 text-center border border-amber-400/20 hover:border-amber-400/40 transition-all hover:scale-105"
            >
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <stat.icon className="w-4 h-4 text-amber-300" />
                <span className="text-lg sm:text-2xl font-black text-white">
                  {loading ? "..." : <AnimatedCounter target={stat.value} prefix={stat.prefix} suffix={stat.suffix} />}
                </span>
              </div>
              <span className="text-[10px] sm:text-xs text-amber-100/70 font-medium uppercase tracking-wider">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust badge */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-2 mt-4 text-xs text-amber-100/70"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Stripe-secured · GDPR compliant · 100% verified</span>
        </motion.div>
      </div>

      {/* Video controls */}
      <div className="absolute bottom-4 right-4 flex gap-2 z-20">
        <Button variant="ghost" size="icon" className="bg-black/50 backdrop-blur-xl hover:bg-black/70 border border-amber-400/30 text-white" onClick={togglePlay}>
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" className="bg-black/50 backdrop-blur-xl hover:bg-black/70 border border-amber-400/30 text-white" onClick={toggleMute}>
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
