import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Gem, Users, Clock, Flame, Sparkles } from "lucide-react";
import heroVideo from "@/assets/future-face-hero-v2.mp4.asset.json";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const stats = [
  { label: "Faces Generated", value: "2.4M+", icon: Sparkles },
  { label: "Active Users", value: "180K+", icon: Users },
  { label: "Avg Age Span", value: "30 Years", icon: Clock },
  { label: "Your Streak", value: "0 Days", icon: Flame },
];

export default function FutureFaceHero() {
  return (
    <>
      <FloatingHowItWorks title={"Future Face Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Future Face Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Future Face Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="relative w-full mb-8">
      {/* Video */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden">
        <video
          src={heroVideo.url}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        {/* Subtle vignette only at the bottom so the video stays visible */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />

        {/* Top: badge + title (compact, doesn't cover video) */}
        <div className="absolute top-3 left-3 right-3 flex flex-col items-center text-center">
          <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 mb-2">
            <Gem className="h-3 w-3 mr-1" />
            Crystal Future Technology
          </Badge>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl sm:text-3xl md:text-5xl font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
          >
            Future <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Face</span>
          </motion.h1>
        </div>

        {/* Bottom: subtitle */}
        <p className="absolute bottom-3 left-3 right-3 text-center text-white/90 text-xs sm:text-base font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
          AI-powered age progression with crystal clarity.
        </p>
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
    </>
  );
}
