import { GraduationCap, Users, BookOpen, Award, Sparkles, Play, Star } from "lucide-react";
import heroVideo from "@/assets/education-hero.mp4.asset.json";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const stats = [
  { label: "Courses", icon: BookOpen, value: "1.8K+", color: "from-violet-500 to-purple-600" },
  { label: "Quiz Attempts", icon: Star, value: "—", color: "from-amber-500 to-orange-600" },
  { label: "Enrollments", icon: Award, value: "—", color: "from-emerald-500 to-teal-600" },
  { label: "AI Tutor", icon: GraduationCap, value: "24/7", color: "from-rose-500 to-pink-600" },
];

export function TutorialHero() {
  return (
    <>
      <FloatingHowItWorks title={"Tutorial Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Tutorial Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Tutorial Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-4 mb-8">
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center"
      >
        <div
          className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-gradient-to-r from-primary to-accent px-4 py-1.5 text-sm font-semibold shadow-lg shadow-primary/20 drop-shadow-sm"
          style={{ color: "hsl(var(--sidebar-primary-foreground))", WebkitTextFillColor: "hsl(var(--sidebar-primary-foreground))" }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span style={{ color: "hsl(var(--sidebar-primary-foreground))", WebkitTextFillColor: "hsl(var(--sidebar-primary-foreground))" }}>
            AI-Powered Learning Platform
          </span>
        </div>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center"
      >
        <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-violet-600 via-purple-500 to-rose-500 bg-clip-text text-transparent mb-2">
          Education Hub
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
          AI tutoring, quiz categories, daily challenges & learning streaks
        </p>
      </motion.div>

      {/* Video Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="relative w-full aspect-video max-h-[340px] rounded-2xl overflow-hidden shadow-2xl shadow-violet-500/10"
      >
        <video
          autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(1.1) saturate(1.2)" }}
        >
          <source src={heroVideo.url} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        
        {/* Floating sparkle accents */}
        <div className="absolute top-4 right-4 animate-pulse">
          <Sparkles className="w-5 h-5 text-amber-400/70" />
        </div>
        <div className="absolute bottom-4 left-4">
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/90 font-medium">Live Platform</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
            >
              <div className="bg-card border rounded-xl p-3 md:p-4 text-center hover:shadow-lg hover:border-violet-500/20 transition-all group">
                <div className={`w-9 h-9 mx-auto mb-2 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <p className="text-lg md:text-2xl font-black">{stat.value}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground font-medium">{stat.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
    </>
  );
}
