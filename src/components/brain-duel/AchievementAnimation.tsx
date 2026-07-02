import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface AchievementPopup {
  id: string;
  achievement_name: string;
  achievement_icon: string;
  achievement_code: string;
}

export const AchievementAnimation = () => {
  const [popup, setPopup] = useState<AchievementPopup | null>(null);

  useEffect(() => {
    const checkUnshown = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("brain_duel_achievement_unlocks")
        .select("*")
        .eq("user_id", user.id)
        .eq("animation_shown", false)
        .order("unlocked_at", { ascending: true })
        .limit(1);

      if (data && data.length > 0) {
        setPopup(data[0]);
        // Mark as shown
        await supabase
          .from("brain_duel_achievement_unlocks")
          .update({ animation_shown: true })
          .eq("id", data[0].id);

        setTimeout(() => setPopup(null), 5000);
      }
    };

    checkUnshown();
    const interval = setInterval(checkUnshown, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {popup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
        >
          {/* Backdrop glow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Achievement card */}
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0, y: -100 }}
            transition={{ type: "spring", damping: 12, stiffness: 200 }}
            className="relative z-10 pointer-events-auto"
          >
            <div className="relative">
              {/* Glow ring */}
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.2, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -inset-8 rounded-full bg-gradient-to-r from-primary via-violet-500 to-cyan-500 blur-2xl"
              />

              <div className="relative bg-card/95 backdrop-blur-xl border-2 border-primary/50 rounded-3xl p-8 text-center shadow-2xl shadow-primary/20 min-w-[280px]">
                {/* Icon */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  {popup.achievement_icon}
                </motion.div>

                {/* Title */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xs font-bold text-primary uppercase tracking-wider mb-2"
                >
                  🎉 Achievement Unlocked!
                </motion.p>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-xl font-black bg-gradient-to-r from-primary via-violet-400 to-cyan-400 bg-clip-text text-transparent"
                >
                  {popup.achievement_name}
                </motion.h2>

                {/* Sparkle particles */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      x: Math.cos((i / 6) * Math.PI * 2) * 80,
                      y: Math.sin((i / 6) * Math.PI * 2) * 80,
                    }}
                    transition={{ duration: 1.5, delay: 0.2 + i * 0.1, repeat: Infinity, repeatDelay: 1 }}
                    className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-primary"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
