import { motion } from "framer-motion";
import { Zap, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

// Placeholder for real event data — this would come from backend
function getActiveEvent() {
  // Currently no active events — return null to hide the banner
  return null;
  // Example of an active event:
  // return { name: "Weekend XP Boost", multiplier: "2x", endsAt: new Date(Date.now() + 86400000) };
}

export default function XPMultiplierBanner() {
  const event = getActiveEvent();
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!event) return;
    const update = () => {
      const diff = event.endsAt.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("Ended"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${h}h ${m}m`);
    };
    update();
    const timer = setInterval(update, 60000);
    return (
    <>
      <FloatingHowItWorks title={"X P Multiplier Banner - How it works"} steps={[{ title: 'Open', desc: 'Access the X P Multiplier Banner section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in X P Multiplier Banner.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => clearInterval(timer);
  }, [event]);

  if (!event) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl bg-gradient-to-r from-orange-500/20 via-yellow-500/20 to-orange-500/20 border border-orange-500/30 p-3 sm:p-4 mb-6"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-yellow-500/5 animate-pulse" />
      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-500/20">
            <Zap className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <p className="font-bold text-sm sm:text-base">{event.name}</p>
            <p className="text-xs text-muted-foreground">All XP rewards are boosted!</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge className="bg-orange-500 text-white font-bold text-sm px-3">
            {event.multiplier}
          </Badge>
          <Badge variant="outline" className="gap-1 text-xs hidden sm:flex">
            <Clock className="h-3 w-3" />
            {timeLeft}
          </Badge>
        </div>
      </div>
    </motion.div>
  );
}
