import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Brain, Trophy, Users, Flame, Zap, GraduationCap } from "lucide-react";
import heroVideo from "@/assets/iq-platform-hero.mp4.asset.json";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

function getWeeklyTimeLeft() {
  const now = new Date();
  const endOfWeek = new Date(now);
  endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
  endOfWeek.setHours(23, 59, 59, 999);
  const diff = endOfWeek.getTime() - now.getTime();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  return { days, hours };
}

interface IQPlatformHeroProps {
  totalTests: number;
  totalUsers: number;
  userIQ: number | null;
  streak: number;
}

export default function IQPlatformHero({ totalTests, totalUsers, userIQ, streak }: IQPlatformHeroProps) {
  const [timeLeft, setTimeLeft] = useState(getWeeklyTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getWeeklyTimeLeft()), 60000);
    return (
    <>
      <FloatingHowItWorks title={"I Q Platform Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the I Q Platform Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in I Q Platform Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => clearInterval(timer);
  }, []);

  const statCards = [
    { value: userIQ ? `${userIQ}` : "—", label: "Your IQ", icon: Brain, accent: "from-blue-500/20 to-cyan-500/10", iconColor: "text-blue-400" },
    { value: `${timeLeft.days}d ${timeLeft.hours}h`, label: "Tournament Ends", icon: Trophy, accent: "from-amber-500/20 to-yellow-500/10", iconColor: "text-amber-400" },
    { value: totalUsers > 0 ? totalUsers.toLocaleString() : "—", label: "Active Users", icon: Users, accent: "from-emerald-500/20 to-green-500/10", iconColor: "text-emerald-400" },
    { value: totalTests > 0 ? totalTests.toLocaleString() : "—", label: "Tests Taken", icon: Zap, accent: "from-purple-500/20 to-violet-500/10", iconColor: "text-purple-400" },
  ];

  return (
    <div className="space-y-4 mb-8">
      {/* Video Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-2xl min-h-[260px] sm:min-h-[340px]"
      >
        <div className="absolute inset-0 z-0">
          <video
            src={heroVideo.url}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ filter: "brightness(0.65) saturate(1.2)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/95 via-[#0a1628]/60 to-[#0a1628]/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 via-transparent to-indigo-900/30" />
        </div>

        <div className="relative z-10 p-4 sm:p-6 lg:p-8 flex flex-col justify-end min-h-[260px] sm:min-h-[340px]">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}>
              <Badge className="bg-blue-500/90 text-white font-bold border-blue-400/50 shadow-lg shadow-blue-500/20">
                <GraduationCap className="h-3 w-3 mr-1" /> Academic Premium
              </Badge>
            </motion.div>
            {streak > 0 && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}>
                <Badge className="bg-orange-500/90 text-white border-orange-400/50">
                  <Flame className="h-3 w-3 mr-1" /> {streak} Day Streak
                </Badge>
              </motion.div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="border-2 border-blue-400/30 bg-[#0a1628]/50 backdrop-blur-lg rounded-xl px-5 py-4 w-fit max-w-full"
          >
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black text-white drop-shadow-lg">
              🧠 IQ <span className="text-blue-400">PLATFORM</span>
            </h1>
            <p className="text-sm sm:text-base text-white/80 font-semibold mt-1 drop-shadow">
              Test your intelligence, train your brain, compete in leagues & climb the ranks
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Stat Cards Below Video */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i + 0.4 }}
            className={`rounded-xl bg-gradient-to-br ${item.accent} bg-card/80 backdrop-blur-md border border-border/30 p-3 sm:p-4 text-center`}
          >
            <item.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${item.iconColor} mx-auto mb-1`} />
            <p className="text-lg sm:text-2xl font-black">{item.value}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">{item.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
