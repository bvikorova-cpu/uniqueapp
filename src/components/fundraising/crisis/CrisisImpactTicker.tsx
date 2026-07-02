import { motion } from "framer-motion";
import { Heart, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const mockDonations = [
  { donor: "A supporter", amount: 50, crisis: "Flood Relief — Manila" },
  { donor: "Anonymous", amount: 25, crisis: "Fire Recovery — Athens" },
  { donor: "A supporter", amount: 100, crisis: "Earthquake Aid — Istanbul" },
  { donor: "Anonymous", amount: 10, crisis: "Tornado Relief — Oklahoma" },
  { donor: "A supporter", amount: 75, crisis: "Wildfire Recovery — Lisbon" },
];

export function CrisisImpactTicker() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % mockDonations.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const donation = mockDonations[current];

  return (
    <section className="py-4">
      <motion.div
        className="max-w-2xl mx-auto rounded-2xl border border-destructive/20 bg-destructive/5 backdrop-blur-sm px-6 py-3 flex items-center justify-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <Zap className="w-4 h-4 text-destructive" />
        </motion.div>
        <motion.p
          key={current}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-sm text-foreground"
        >
          <span className="font-semibold">{donation.donor}</span> donated{" "}
          <span className="font-bold text-destructive">€{donation.amount}</span> to{" "}
          <span className="font-medium">{donation.crisis}</span>
        </motion.p>
        <Heart className="w-3 h-3 text-destructive fill-destructive" />
      </motion.div>
    </section>
  );
}
