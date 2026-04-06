import { motion } from "framer-motion";
import { Wallet, Gavel, TrendingUp, Shield } from "lucide-react";
import { AuctionWithdrawalRequest } from "@/components/auction/AuctionWithdrawalRequest";
import heroVideo from "@/assets/auction-hero.mp4.asset.json";

export default function AuctionDashboard() {
  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl">
        {/* Mini Cinematic Hero */}
        <div className="relative rounded-2xl overflow-hidden mb-8 h-[200px] md:h-[240px]">
          <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" style={{ filter: "brightness(1.2) saturate(1.1)" }}>
            <source src={heroVideo.url} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/15 via-transparent to-yellow-500/10" />

          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="border-2 border-amber-400/30 bg-card/40 backdrop-blur-lg rounded-2xl px-6 md:px-10 py-3 mb-3 shadow-2xl">
              <h1 className="text-2xl md:text-4xl font-black text-white drop-shadow-lg">
                Seller <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">Dashboard</span>
              </h1>
            </motion.div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="text-white/90 font-semibold text-sm max-w-md drop-shadow-md">
              Manage your earnings and withdrawal requests
            </motion.p>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { icon: Wallet, label: "Withdrawals", color: "text-amber-400" },
            { icon: Gavel, label: "Sales", color: "text-yellow-400" },
            { icon: TrendingUp, label: "Earnings", color: "text-orange-400" },
            { icon: Shield, label: "Escrow", color: "text-amber-300" },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-card/80 backdrop-blur-sm border border-amber-500/20 rounded-xl p-3 text-center">
              <item.icon className={`w-5 h-5 ${item.color} mx-auto mb-1`} />
              <div className="text-[10px] text-muted-foreground">{item.label}</div>
            </motion.div>
          ))}
        </div>

        <AuctionWithdrawalRequest />
      </div>
    </div>
  );
}
