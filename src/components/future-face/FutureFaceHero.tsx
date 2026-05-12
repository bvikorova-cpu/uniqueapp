import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Gem, Users, Clock, Flame, Sparkles } from "lucide-react";
import heroVideo from "@/assets/future-face-hero-v2.mp4.asset.json";

const stats = [
  { label: "Faces Generated", value: "2.4M+", icon: Sparkles },
  { label: "Active Users", value: "180K+", icon: Users },
  { label: "Avg Age Span", value: "30 Years", icon: Clock },
  { label: "Your Streak", value: "0 Days", icon: Flame },
];

export default function FutureFaceHero() {
  return (
    <div className="relative w-full mb-8">
      {/* Video */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden">
        <video
          src={heroVideo.url}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover brightness-[0.7] saturate-[1.2]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 mb-3">
            <Gem className="h-3 w-3 mr-1" />
            Crystal Future Technology
          </Badge>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-2 border-white/20 bg-black/40 backdrop-blur-lg rounded-2xl px-6 py-4 max-w-[90%] sm:max-w-[70%]"
          >
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-black text-white">
              Future <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Face</span>
            </h1>
          </motion.div>
          <p className="text-white/80 text-sm sm:text-lg mt-3 max-w-2xl font-semibold drop-shadow-lg">
            AI-powered age progression with crystal clarity. See your future through the lens of science.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card/60 backdrop-blur-md border border-cyan-500/20 rounded-xl p-3 text-center"
          >
            <s.icon className="h-4 w-4 mx-auto mb-1 text-cyan-400" />
            <p className="text-lg font-black">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
