import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Heart, Clock, Users, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";

export const FeaturedCampaignSpotlight = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 3, hours: 14, mins: 22 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, mins } = prev;
        mins -= 1;
        if (mins < 0) { mins = 59; hours -= 1; }
        if (hours < 0) { hours = 23; days -= 1; }
        if (days < 0) return { days: 0, hours: 0, mins: 0 };
        return { days, hours, mins };
      });
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const raised = 7420;
  const goal = 10000;
  const progress = (raised / goal) * 100;

  return (
    <section className="py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-black text-center mb-6">
          <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">🔥 Featured Campaign</span>
        </h2>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-lg"
        >
          {/* Urgency gradient bar */}
          <div className="h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500" />
          
          <div className="p-5">
            <div className="flex items-start justify-between mb-3">
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-red-500/10 text-red-600 px-2 py-1 rounded-full">
                <Clock className="h-3 w-3" /> URGENT
              </span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">🏥 Medical</span>
            </div>

            <h3 className="text-xl font-bold mb-2">Help Baby Emma's Heart Surgery</h3>
            <p className="text-sm text-muted-foreground mb-4">
              6-month-old Emma needs urgent heart surgery. Her family cannot afford the medical costs. Every euro counts.
            </p>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-bold text-primary">€{raised.toLocaleString()}</span>
                <span className="text-muted-foreground">of €{goal.toLocaleString()}</span>
              </div>
              <Progress value={progress} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{Math.round(progress)}% funded</span>
                <span>6% platform fee</span>
              </div>
            </div>

            {/* Timer + stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center bg-muted/50 rounded-lg py-2">
                <div className="text-lg font-black text-foreground">{timeLeft.days}d {timeLeft.hours}h</div>
                <div className="text-xs text-muted-foreground">Time Left</div>
              </div>
              <div className="text-center bg-muted/50 rounded-lg py-2">
                <div className="text-lg font-black text-foreground">384</div>
                <div className="text-xs text-muted-foreground">Donors</div>
              </div>
              <div className="text-center bg-muted/50 rounded-lg py-2">
                <div className="text-lg font-black text-foreground">€19</div>
                <div className="text-xs text-muted-foreground">Avg. Donation</div>
              </div>
            </div>

            {/* Donor avatars */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex -space-x-2">
                {["A", "M", "S", "D", "E"].map((letter, i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[10px] font-bold text-white border-2 border-card">
                    {letter}
                  </div>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">+379 supporters</span>
            </div>

            <Button className="w-full" size="lg">
              <Heart className="mr-2 h-4 w-4" /> Donate Now
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
