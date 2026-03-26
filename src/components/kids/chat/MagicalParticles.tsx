import { motion } from "framer-motion";
import { useMemo } from "react";

interface MagicalParticlesProps {
  characterColor?: string;
  count?: number;
}

const PARTICLE_EMOJIS = ["✨", "⭐", "🌟", "💫", "🎀", "🦋", "🌈", "💖"];

export function MagicalParticles({ count = 12 }: MagicalParticlesProps) {
  const particles = useMemo(() => 
    Array.from({ length: count }, (_, i) => ({
      id: i,
      emoji: PARTICLE_EMOJIS[i % PARTICLE_EMOJIS.length],
      x: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 4 + Math.random() * 6,
      size: 10 + Math.random() * 14,
    })),
  [count]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{ left: `${p.x}%`, fontSize: p.size }}
          initial={{ y: "110vh", opacity: 0 }}
          animate={{
            y: "-10vh",
            opacity: [0, 0.7, 0.7, 0],
            x: [0, Math.random() * 40 - 20, Math.random() * 40 - 20, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {p.emoji}
        </motion.div>
      ))}
    </div>
  );
}
