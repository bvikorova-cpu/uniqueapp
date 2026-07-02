import { motion } from "framer-motion";
import { useMemo } from "react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export function NightSkyBackground() {
  const stars = useMemo(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 3,
      delay: Math.random() * 5,
      duration: 2 + Math.random() * 4,
    })),
  []);

  const shootingStars = useMemo(() =>
    Array.from({ length: 3 }, (_, i) => ({
      id: i,
      startX: 10 + Math.random() * 60,
      startY: 5 + Math.random() * 20,
      delay: 3 + i * 8,
    })),
  []);

  return (
    <>
      <FloatingHowItWorks title={"Night Sky Background - How it works"} steps={[{ title: 'Open', desc: 'Access the Night Sky Background section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Night Sky Background.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Twinkling stars */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: star.duration, delay: star.delay, repeat: Infinity }}
        />
      ))}

      {/* Shooting stars */}
      {shootingStars.map((s) => (
        <motion.div
          key={`shoot-${s.id}`}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{ left: `${s.startX}%`, top: `${s.startY}%` }}
          animate={{
            x: [0, 200],
            y: [0, 100],
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{ duration: 1.5, delay: s.delay, repeat: Infinity, repeatDelay: 12 }}
        >
          {/* Trail */}
          <div className="absolute top-0 right-0 w-16 h-0.5 bg-gradient-to-l from-white to-transparent -translate-x-full" />
        </motion.div>
      ))}

      {/* Floating moon */}
      <motion.div
        className="absolute top-16 right-[15%] text-7xl"
        animate={{ y: [0, -10, 0], rotate: [0, 3, -3, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        🌙
      </motion.div>
    </div>
    </>
  );
}
