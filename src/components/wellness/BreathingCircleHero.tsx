import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export function BreathingCircleHero() {
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");

  useEffect(() => {
    const cycle = () => {
      setPhase("inhale");
      setTimeout(() => setPhase("hold"), 4000);
      setTimeout(() => setPhase("exhale"), 7000);
    };
    cycle();
    const interval = setInterval(cycle, 11000);
    return () => clearInterval(interval);
  }, []);

  const scale = phase === "inhale" ? 1.3 : phase === "hold" ? 1.3 : 0.9;
  const label = phase === "inhale" ? "Breathe In" : phase === "hold" ? "Hold" : "Breathe Out";

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow rings */}
      <motion.div
        className="absolute w-44 h-44 rounded-full border border-primary/10"
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.1, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-56 h-56 rounded-full border border-accent/10"
        animate={{ scale: [1.1, 0.95, 1.1], opacity: [0.2, 0.05, 0.2] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Main breathing circle */}
      <motion.div
        className="relative w-36 h-36 rounded-full flex items-center justify-center"
        animate={{ scale }}
        transition={{ duration: phase === "inhale" ? 4 : phase === "hold" ? 3 : 4, ease: "easeInOut" }}
        style={{
          background: "radial-gradient(circle, hsla(270, 91%, 65%, 0.25), hsla(330, 100%, 60%, 0.1), transparent)",
          boxShadow: "0 0 60px hsla(270, 91%, 65%, 0.15), inset 0 0 30px hsla(270, 91%, 65%, 0.1)",
        }}
      >
        <div className="text-center">
          <motion.p
            key={phase}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-semibold text-primary"
          >
            {label}
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
