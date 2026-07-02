import { motion } from "framer-motion";
import { Trophy, Users, Zap } from "lucide-react";
import heroVideo from "@/assets/brand-battle-hero.mp4.asset.json";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  totalVotes?: number;
  totalSponsors?: number;
  liveNow?: number;
}

export const LuxuryArenaHero = ({ totalVotes = 0, totalSponsors = 0, liveNow = 0 }: Props) => {
  const stats = [
    { label: "Total Votes", value: totalVotes.toLocaleString(), icon: Zap },
    { label: "Active Brands", value: totalSponsors.toLocaleString(), icon: Users },
    { label: "Live Battles", value: liveNow.toString(), icon: Trophy },
  ];

  return (
    <>
      <FloatingHowItWorks title={"Luxury Arena Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Luxury Arena Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Luxury Arena Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="relative w-full h-[50vh] sm:h-[60vh] overflow-hidden bg-black rounded-2xl mb-8">
      <video
        src={heroVideo.url}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover brightness-[1.1] saturate-[1.2]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-background/40" />

      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
        >
          <p
            className="text-xs sm:text-sm font-semibold tracking-wider uppercase drop-shadow-md"
            style={{ color: "#fbbf24", textShadow: "0 0 20px rgba(251,191,36,0.6)" }}
          >
            ⚔️ Live Brand Arena
          </p>
          <h1
            className="text-4xl sm:text-6xl md:text-7xl font-black mt-1 drop-shadow-lg"
            style={{
              textShadow:
                "0 0 80px rgba(251,191,36,0.5), 0 4px 30px rgba(0,0,0,0.9), 0 0 120px rgba(168,85,247,0.3)",
              WebkitTextStroke: "2px rgba(251,191,36,0.4)",
            }}
          >
            <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Brand Battle
            </span>
          </h1>
          <p className="text-sm sm:text-lg text-white/80 mt-2 max-w-xl drop-shadow-md">
            Vote for your favorite brands, climb the leaderboard & win rewards
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="grid grid-cols-3 gap-2 sm:gap-4 mt-4 max-w-2xl"
        >
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 + i * 0.1, type: "spring" }}
              className="bg-black/40 backdrop-blur-xl rounded-xl p-2 sm:p-3 border border-white/10 text-center"
            >
              <s.icon className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400 mx-auto mb-1" />
              <p className="text-lg sm:text-2xl font-black text-white">{s.value}</p>
              <p className="text-[10px] sm:text-xs text-white/60">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
    </>
  );
};
