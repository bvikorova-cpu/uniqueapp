import { motion } from "framer-motion";
import { Sparkles, FileText, Image as ImageIcon, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import heroVideo from "@/assets/content-studio-hero.mp4.asset.json";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const ContentStudioHero = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["content-studio-stats"],
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc("get_content_studio_stats");
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      const { data: authData } = await supabase.auth.getUser();
      const signedIn = !!authData?.user;
      return {
        signedIn,
        content: Number((signedIn ? row?.my_content : row?.content_created) ?? 0),
        generations: Number((signedIn ? row?.my_generations : row?.ai_generations) ?? 0),
        creators: Number(row?.active_creators ?? 0),
        uses: Number((signedIn ? row?.my_credits_used : row?.total_uses) ?? 0),
      };
    },
  });

  const fmt = (n?: number) => (isLoading ? "…" : (n ?? 0).toLocaleString());

  const mine = stats?.signedIn ?? false;
  const statItems = [
    { label: mine ? "Your Content" : "Content Created", value: fmt(stats?.content), icon: FileText },
    { label: mine ? "Your Generations" : "AI Generations", value: fmt(stats?.generations), icon: ImageIcon },
    { label: "Active Creators", value: fmt(stats?.creators), icon: Users },
    { label: mine ? "Your Credits Used" : "Credits Used", value: fmt(stats?.uses), icon: Sparkles },
  ];


  return (
    <>
      <FloatingHowItWorks title={"Content Studio Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Content Studio Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Content Studio Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="relative w-full h-[60vh] min-h-[400px] max-h-[600px] overflow-hidden rounded-2xl mb-8">
      <video
        src={heroVideo.url}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1
            className="text-4xl md:text-6xl font-black text-white mb-4"
            style={ {
              WebkitTextStroke: "1.5px rgba(255,255,255,0.3)",
              textShadow: "0 4px 30px rgba(139,92,246,0.5)" }}
          >
            Premium{" "}
            <span className="bg-gradient-to-r from-purple-400 via-primary to-pink-400 bg-clip-text text-transparent">
              Content Studio
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            AI-powered professional content generation for creators, marketers & professionals
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-8 w-full max-w-3xl"
        >
          {statItems.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-3 md:p-4 text-center"
              >
                <Icon className="h-5 w-5 text-primary mx-auto mb-1" />
                <div className="text-xl md:text-2xl font-black text-white">
                  {stat.value}
                </div>

                <div className="text-[10px] md:text-xs text-white/60 uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
    </>
  );
};

export default ContentStudioHero;
