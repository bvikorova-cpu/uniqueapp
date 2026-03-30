import { motion } from "framer-motion";
import { Sparkles, FileText, Image as ImageIcon, Users } from "lucide-react";
import { useLiveStats } from "@/hooks/useLiveStats";
import heroVideo from "@/assets/content-studio-hero.mp4.asset.json";

const ContentStudioHero = () => {
  const stats = useLiveStats([
    { label: "Content Created", table: "ai_generated_content", icon: FileText },
    { label: "Images Generated", table: "ai_generated_content", icon: ImageIcon, column: "generated_image_url" },
    { label: "Active Creators", table: "ai_credits", icon: Users },
    { label: "Templates Used", table: "ai_generated_content", icon: Sparkles },
  ]);

  const statItems = [
    { label: "Content Created", value: stats.stats["ai_generated_content"] || 0, icon: FileText },
    { label: "Images", value: stats.stats["ai_generated_content_generated_image_url"] || 0, icon: ImageIcon },
    { label: "Creators", value: stats.stats["ai_credits"] || 0, icon: Users },
    { label: "Templates", value: stats.stats["ai_generated_content_2"] || 0, icon: Sparkles },
  ];

  return (
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
            style={{
              WebkitTextStroke: "1.5px rgba(255,255,255,0.3)",
              textShadow: "0 4px 30px rgba(139,92,246,0.5)",
            }}
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
                <Icon className="h-5 w-5 text-purple-400 mx-auto mb-1" />
                <div className="text-xl md:text-2xl font-black text-white">
                  {stat.value || "—"}
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
  );
};

export default ContentStudioHero;
