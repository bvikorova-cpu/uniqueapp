import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
interface ConfettiBurstProps {
  trigger: number; // increment to retrigger
}

/** Lightweight confetti burst on purchase — pure CSS particles, no deps. */
export const ConfettiBurst = ({ trigger }: ConfettiBurstProps) => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (trigger > 0) {
      setActive(true);
      const t = setTimeout(() => setActive(false), 1800);
      return () => clearTimeout(t);
    }
  }, [trigger]);

  if (!active) return null;

  const particles = Array.from({ length: 60 });
  const colors = ["#fbbf24", "#a855f7", "#ec4899", "#10b981", "#3b82f6", "#f97316"];

  return (
    <>
<div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      <AnimatePresence>
        {particles.map((_, i) => {
          const angle = (i / particles.length) * Math.PI * 2;
          const distance = 200 + Math.random() * 300;
          const x = Math.cos(angle) * distance;
          const y = Math.sin(angle) * distance + Math.random() * 200;
          const color = colors[i % colors.length];
          const size = 6 + Math.random() * 8;
          return (
            <motion.div
              key={i}
              initial={{ x: "50vw", y: "50vh", opacity: 1, scale: 0 }}
              animate={{
                x: `calc(50vw + ${x}px)`,
                y: `calc(50vh + ${y}px)`,
                opacity: 0,
                scale: 1,
                rotate: Math.random() * 720,
              }}
              transition={{ duration: 1.4 + Math.random() * 0.4, ease: "easeOut" }}
              style={{
                position: "absolute",
                width: size,
                height: size,
                background: color,
                borderRadius: i % 3 === 0 ? "50%" : "2px",
              }}
            />
          );
        })}
      </AnimatePresence>
    </div>
    </>
    );
};
