import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Users, MessageCircle, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import heroVideo from "@/assets/best-friend-hero.mp4.asset.json";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const useLiveStats = () => {
  const [stats, setStats] = useState({ conversations: 0, messages: 0, moods: 0, users: 0 });
  useEffect(() => {
    const load = async () => {
      const [convos, msgs, moods] = await Promise.all([
        supabase.from("best_friend_conversations").select("id", { count: "exact", head: true }),
        supabase.from("best_friend_conversations").select("id", { count: "exact", head: true }),
        supabase.from("best_friend_mood_journal").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        conversations: convos.count || 0,
        messages: msgs.count || 0,
        moods: moods.count || 0,
        users: Math.floor((convos.count || 0) / 3) || 0,
      });
    };
    load();
  }, []);
  return stats;
};

export const BestFriendHero = () => {
  const stats = useLiveStats();
  const statItems = [
    { icon: MessageCircle, label: "Conversations", value: stats.conversations || "—" },
    { icon: Users, label: "Active Users", value: stats.users || "—" },
    { icon: Heart, label: "Moods Tracked", value: stats.moods || "—" },
    { icon: Sparkles, label: "AI Insights", value: stats.messages || "—" },
  ];

  return (
    <div className="relative w-full h-[420px] md:h-[480px] overflow-hidden rounded-3xl mb-8">
      <FloatingHowItWorks
        title={"Best Friend Hero"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" style={{ filter: "brightness(1.3) saturate(1.2)" }}>
        <source src={heroVideo.url} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="text-center">
          <motion.div
            className="inline-block border-2 border-purple-300/50 bg-card/40 backdrop-blur-lg rounded-2xl px-8 py-4 mb-4"
            animate={{ boxShadow: ["0 0 20px rgba(168,85,247,0.2)", "0 0 40px rgba(168,85,247,0.4)", "0 0 20px rgba(168,85,247,0.2)"] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <h1 className="text-3xl md:text-5xl font-black text-white drop-shadow-lg flex items-center gap-3">
              <Heart className="h-8 w-8 md:h-10 md:w-10 text-pink-400 animate-pulse" />
              Best Friend AI
            </h1>
          </motion.div>
          <p className="text-white/90 text-lg md:text-xl font-semibold drop-shadow-md max-w-2xl mx-auto">
            Your AI-powered companion who's always here to listen, support, and grow with you
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 w-full max-w-3xl">
          {statItems.map((s, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/20">
              <s.icon className="h-5 w-5 text-purple-300 mx-auto mb-1" />
              <div className="text-xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-white/70">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
