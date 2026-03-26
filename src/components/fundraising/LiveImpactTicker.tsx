import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

const donations = [
  { name: "Anna K.", amount: "€25", category: "Pet Rescue", time: "2 min ago" },
  { name: "Marco B.", amount: "€50", category: "Medical", time: "5 min ago" },
  { name: "Sophie L.", amount: "€10", category: "Student Support", time: "8 min ago" },
  { name: "David M.", amount: "€100", category: "Crisis Relief", time: "12 min ago" },
  { name: "Elena V.", amount: "€15", category: "Dream Maker", time: "15 min ago" },
  { name: "Tom R.", amount: "€75", category: "Community Hero", time: "18 min ago" },
  { name: "Lisa N.", amount: "€30", category: "Talent Sponsor", time: "22 min ago" },
  { name: "Jan P.", amount: "€20", category: "Pet Rescue", time: "25 min ago" },
];

export const LiveImpactTicker = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % donations.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const donation = donations[currentIndex];

  return (
    <div className="py-4 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="flex-shrink-0">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center"
            >
              <Heart className="h-4 w-4 text-red-500 fill-red-500" />
            </motion.div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex-1 min-w-0"
            >
              <p className="text-sm truncate">
                <span className="font-semibold text-foreground">{donation.name}</span>
                <span className="text-muted-foreground"> donated </span>
                <span className="font-bold text-primary">{donation.amount}</span>
                <span className="text-muted-foreground"> to </span>
                <span className="font-medium text-foreground">{donation.category}</span>
              </p>
              <p className="text-xs text-muted-foreground">{donation.time}</p>
            </motion.div>
          </AnimatePresence>
          <div className="flex-shrink-0">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
