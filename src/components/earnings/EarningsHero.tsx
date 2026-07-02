import { motion } from "framer-motion";
import { Coins, TrendingUp, Wallet, Banknote } from "lucide-react";
import heroVideo from "@/assets/earnings-hero.mp4.asset.json";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface EarningsHeroProps {
  title?: string;
  subtitle?: string;
  totalEarnings: number;
  available: number;
  pending: number;
  paidOut: number;
  badge?: string;
}

/**
 * Cinematic Earnings hero — Golden coins / cash flow theme.
 * Shared across /earnings + influencer/instructor/masterchef/comedian/course/escape-room.
 */
export const EarningsHero = ({
  title = "My Earnings",
  subtitle = "Track every euro you make — payouts, forecasts, milestones.",
  totalEarnings,
  available,
  pending,
  paidOut,
  badge = "Treasury Vault",
}: EarningsHeroProps) => {
  const fmt = (n: number) =>
    n > 0 ? `€${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}` : "—";

  const stats = [
    { icon: Coins, label: "Lifetime", value: fmt(totalEarnings), color: "amber" },
    { icon: Wallet, label: "Available", value: fmt(available), color: "emerald" },
    { icon: TrendingUp, label: "Pending", value: fmt(pending), color: "yellow" },
    { icon: Banknote, label: "Paid out", value: fmt(paidOut), color: "blue" },
  ];

  return (
    <>
      <FloatingHowItWorks title={"Earnings Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Earnings Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Earnings Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="relative w-full h-[360px] sm:h-[440px] rounded-3xl overflow-hidden mb-8">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "brightness(0.85) saturate(1.25)" }}
        src={heroVideo.url}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/25 via-transparent to-yellow-500/15" />

      <div className="relative z-10 h-full flex flex-col justify-end p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/30 to-yellow-500/30 border border-amber-400/40 backdrop-blur-xl text-amber-100 text-xs font-bold tracking-wider uppercase">
            <Coins className="h-3.5 w-3.5" /> {badge}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight text-white drop-shadow-2xl">
            {title.split(" ").slice(0, -1).join(" ")}{" "}
            <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent">
              {title.split(" ").slice(-1)}
            </span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm sm:text-base text-white/90 drop-shadow-lg font-medium">
            {subtitle}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 max-w-3xl">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black/70 border-2 border-amber-400/40 backdrop-blur-xl shadow-xl shadow-black/40"
              >
                <s.icon className="h-5 w-5 text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] shrink-0" />
                <div className="min-w-0">
                  <p className="text-base sm:text-lg font-black text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] truncate">
                    {s.value}
                  </p>
                  <p className="text-[9px] sm:text-[10px] uppercase tracking-wider font-bold text-amber-100 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                    {s.label}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
    </>
  );
};
