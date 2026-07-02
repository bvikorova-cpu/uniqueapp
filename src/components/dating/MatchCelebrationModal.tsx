import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  X,
  Sparkles,
  MessageCircle,
  Users,
  Search,
  Lightbulb,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props {
  open: boolean;
  myPhoto?: string | null;
  myName?: string;
  theirPhoto?: string | null;
  theirName?: string;
  location?: string | null;
  onStartChat: () => void;
  onFindAnother: () => void;
  onViewMatches: () => void;
  onBrowseHub: () => void;
}

export const MatchCelebrationModal = ({
  open,
  myPhoto,
  myName,
  theirPhoto,
  theirName,
  location,
  onStartChat,
  onFindAnother,
  onViewMatches,
  onBrowseHub,
}: Props) => {
  return (
    <AnimatePresence>
      <FloatingHowItWorks
        title={"Match Celebration Modal"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          style={{
            background:
              "radial-gradient(ellipse at center, hsl(330 100% 25% / 0.95) 0%, hsl(270 91% 12% / 0.98) 70%, hsl(270 91% 6% / 1) 100%)",
          }}
        >
          {/* Floating hearts background */}
          {Array.from({ length: 18 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute pointer-events-none"
              initial={{
                x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 800),
                y: (typeof window !== "undefined" ? window.innerHeight : 600) + 50,
                opacity: 0,
                scale: 0.5 + Math.random() * 0.8,
              }}
              animate={{
                y: -100,
                opacity: [0, 0.7, 0.7, 0],
                rotate: Math.random() * 360,
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                delay: Math.random() * 2,
                repeat: Infinity,
                ease: "easeOut",
              }}
            >
              <Heart className="text-pink-400 fill-pink-400" size={16 + Math.random() * 24} />
            </motion.div>
          ))}

          {/* Sparkles */}
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.div
              key={`sp-${i}`}
              className="absolute pointer-events-none"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
              transition={{ duration: 2, delay: Math.random() * 2, repeat: Infinity }}
            >
              <Sparkles className="text-yellow-300" size={20} />
            </motion.div>
          ))}

          <button
            onClick={onBrowseHub}
            className="absolute top-6 right-6 z-10 rounded-full p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm transition"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          <div className="relative z-10 flex flex-col items-center px-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Title */}
            <motion.h1
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: -4 }}
              transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
              className="text-5xl md:text-6xl font-bold text-white mb-2 text-center"
              style={{
                fontFamily: "'Lobster Two', cursive",
                textShadow: "0 4px 30px hsl(330 100% 50% / 0.6)",
                background: "linear-gradient(135deg, #fff 20%, #ffd1e8 50%, #fff 80%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              It's a Match!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white/80 text-base mb-8 text-center"
            >
              You matched with <span className="font-semibold text-white">{theirName}</span>
              {location && <> at <span className="font-semibold text-white">{location}</span></>}
            </motion.p>

            {/* Avatars */}
            <div className="relative flex items-center justify-center mb-8 h-36">
              <motion.div
                initial={{ x: -120, opacity: 0, rotate: -20 }}
                animate={{ x: -40, opacity: 1, rotate: -8 }}
                transition={{ type: "spring", stiffness: 100, damping: 14, delay: 0.3 }}
                className="absolute"
              >
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500">
                  {myPhoto ? (
                    <img src={myPhoto} alt={myName || "You"} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-2xl md:text-3xl font-bold">
                      {myName?.[0] || "?"}
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ x: 120, opacity: 0, rotate: 20 }}
                animate={{ x: 40, opacity: 1, rotate: 8 }}
                transition={{ type: "spring", stiffness: 100, damping: 14, delay: 0.3 }}
                className="absolute"
              >
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gradient-to-br from-pink-500 to-rose-500">
                  {theirPhoto ? (
                    <img src={theirPhoto} alt={theirName || "Them"} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-2xl md:text-3xl font-bold">
                      {theirName?.[0] || "?"}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Heart in center */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.4, 1] }}
                transition={{ delay: 0.8, duration: 0.6, type: "spring" }}
                className="relative z-10"
              >
                <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-full p-3 md:p-4 shadow-[0_0_40px_hsl(330_100%_60%/0.8)]">
                  <Heart className="h-6 w-6 md:h-8 md:w-8 text-white fill-white" />
                </div>
              </motion.div>
            </div>

            {/* 24h Banner */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="w-full p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 mb-5"
            >
              <div className="p-2 rounded-full bg-pink-500/20">
                <Timer className="h-5 w-5 text-pink-400" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-white">24-Hour Anonymous Window</p>
                <p className="text-xs text-white/60">Your match expires in 24 hours. Make it count!</p>
              </div>
            </motion.div>

            {/* Primary CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="w-full"
            >
              <Button
                onClick={onStartChat}
                size="lg"
                className="w-full h-14 text-base font-bold rounded-full border-0 text-white shadow-xl hover:scale-[1.02] transition-transform"
                style={{
                  background: "linear-gradient(135deg, hsl(330 100% 55%), hsl(20 100% 60%))",
                  boxShadow: "0 10px 40px hsl(330 100% 50% / 0.5)",
                }}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Start Chatting
              </Button>
            </motion.div>

            {/* What's Next section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.15 }}
              className="w-full mt-6"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 text-center mb-3">
                What&apos;s Next?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onViewMatches}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
                >
                  <div className="p-2.5 rounded-xl bg-primary/20 group-hover:bg-primary/30 transition">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-white">View Matches</span>
                  <span className="text-[10px] text-white/50">All conversations</span>
                </button>

                <button
                  onClick={onFindAnother}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
                >
                  <div className="p-2.5 rounded-xl bg-pink-500/20 group-hover:bg-pink-500/30 transition">
                    <Search className="h-5 w-5 text-pink-400" />
                  </div>
                  <span className="text-sm font-semibold text-white">Find Another</span>
                  <span className="text-[10px] text-white/50">New match</span>
                </button>

                <button
                  onClick={onBrowseHub}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
                >
                  <div className="p-2.5 rounded-xl bg-cyan-500/20 group-hover:bg-cyan-500/30 transition">
                    <Sparkles className="h-5 w-5 text-cyan-400" />
                  </div>
                  <span className="text-sm font-semibold text-white">AI Icebreaker</span>
                  <span className="text-[10px] text-white/50">Break the ice</span>
                </button>

                <button
                  onClick={onBrowseHub}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
                >
                  <div className="p-2.5 rounded-xl bg-amber-500/20 group-hover:bg-amber-500/30 transition">
                    <Lightbulb className="h-5 w-5 text-amber-400" />
                  </div>
                  <span className="text-sm font-semibold text-white">Date Ideas</span>
                  <span className="text-[10px] text-white/50">Plan together</span>
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
