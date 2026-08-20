import { motion } from "framer-motion";
import heroVideo from "@/assets/wall-hero.mp4.asset.json";

interface WallCinematicHeroProps {
  streak: number;
}

export default function WallCinematicHero({ streak }: WallCinematicHeroProps) {
  return (
    <div className="space-y-4 mb-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-2xl min-h-[240px] sm:min-h-[320px]"
      >
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, #7c3aed 0%, #a855f7 25%, #ec4899 60%, #f43f5e 100%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.35) 0%, transparent 35%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.25) 0%, transparent 40%)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a0f0a]/90 via-[#1a0f0a]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-pink-900/20" />
        </div>

        <div className="relative z-10 p-4 sm:p-6 lg:p-8 flex flex-col justify-end min-h-[240px] sm:min-h-[320px]">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="border-2 border-orange-400/30 bg-[#1a0f0a]/50 backdrop-blur-lg rounded-xl px-5 py-4 w-fit max-w-full"
          >
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black text-white drop-shadow-lg">
              🌐 SOCIAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-coral-400 to-teal-400">WALL</span>
            </h1>
            <p className="text-sm sm:text-base text-white/80 font-semibold mt-1 drop-shadow">
              Connect, share & grow with AI-powered social tools
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
