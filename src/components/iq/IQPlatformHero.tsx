import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Flame, GraduationCap } from "lucide-react";
import heroVideo from "@/assets/iq-platform-hero.mp4.asset.json";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface IQPlatformHeroProps {
  streak: number;
}

export default function IQPlatformHero({ streak }: IQPlatformHeroProps) {

  return (
    <div className="space-y-4 mb-8">
      {/* Video Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-2xl min-h-[260px] sm:min-h-[340px]"
      >
        <div className="absolute inset-0 z-0">
          <video
            src={heroVideo.url}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ filter: "brightness(0.65) saturate(1.2)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/95 via-[#0a1628]/60 to-[#0a1628]/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 via-transparent to-indigo-900/30" />
        </div>

        <div className="relative z-10 p-4 sm:p-6 lg:p-8 flex flex-col justify-end min-h-[260px] sm:min-h-[340px]">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}>
              <Badge className="bg-blue-500/90 text-white font-bold border-blue-400/50 shadow-lg shadow-blue-500/20">
                <GraduationCap className="h-3 w-3 mr-1" /> Academic Premium
              </Badge>
            </motion.div>
            {streak > 1 && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}>
                <Badge className="bg-orange-500/90 text-white border-orange-400/50">
                  <Flame className="h-3 w-3 mr-1" /> {streak} Day Streak
                </Badge>
              </motion.div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="border-2 border-blue-400/30 bg-[#0a1628]/50 backdrop-blur-lg rounded-xl px-5 py-4 w-fit max-w-full"
          >
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black text-white drop-shadow-lg">
              🧠 IQ <span className="text-blue-400">PLATFORM</span>
            </h1>
            <p className="text-sm sm:text-base text-white/80 font-semibold mt-1 drop-shadow">
              Test your intelligence and train your brain with AI-powered tools
            </p>
          </motion.div>
        </div>
      </motion.div>

    </div>
  );
}
