import { motion } from "framer-motion";
import { Heart, MessageCircle, Users, Star, Share2, Zap } from "lucide-react";
import wallHeroVideo from "../../../public/videos/wall-social-hero.mp4.asset.json";


interface WallCinematicHeroProps {
  streak: number;
}

const socialFloaters = [
  { Icon: Heart, top: "12%", left: "8%", size: 28, delay: 0, duration: 5 },
  { Icon: MessageCircle, top: "20%", right: "12%", size: 32, delay: 0.5, duration: 6 },
  { Icon: Users, top: "55%", left: "5%", size: 36, delay: 1, duration: 7 },
  { Icon: Star, top: "8%", left: "55%", size: 22, delay: 1.5, duration: 5.5 },
  { Icon: Share2, top: "65%", right: "8%", size: 26, delay: 0.8, duration: 6.5 },
  { Icon: Zap, top: "35%", right: "25%", size: 24, delay: 1.2, duration: 5 },
];

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
          <video
            src={(wallHeroVideo as { url: string }).url}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 h-full w-full object-cover"
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

        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {socialFloaters.map(({ Icon, top, left, right, size, delay, duration }, i) => (
            <motion.div
              key={i}
              className="absolute text-white/20"
              style={{ top, left, right }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: [0.15, 0.35, 0.15],
                y: [0, -14, 0],
                rotate: [0, 8, -8, 0],
                scale: [1, 1.08, 1],
              }}
              transition={{
                delay,
                duration,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Icon width={size} height={size} />
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 p-4 sm:p-6 lg:p-8 flex flex-col justify-end min-h-[240px] sm:min-h-[320px]">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="border-2 border-white/20 bg-black/30 backdrop-blur-lg rounded-xl px-5 py-4 w-fit max-w-full"
          >
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black text-white drop-shadow-lg">
              🌐 SOCIAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-200 to-fuchsia-200">WALL</span>
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
