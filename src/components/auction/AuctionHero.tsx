import { motion } from "framer-motion";
import { Gavel, Users, TrendingUp, Clock } from "lucide-react";
import heroVideo from "@/assets/auction-hero.mp4.asset.json";
import { useLiveStats } from "@/hooks/useLiveStats";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const AuctionHero = () => {
  const { stats } = useLiveStats([
    { key: "auctions", table: "auction_items" },
    { key: "bids", table: "auction_bids" },
    { key: "escrows", table: "auction_escrow" },
  ]);

  const statItems = [
    { icon: Gavel, label: "Total Auctions", value: stats.auctions || 0 },
    { icon: TrendingUp, label: "Bids Placed", value: stats.bids || 0 },
    { icon: Users, label: "Escrow Deals", value: stats.escrows || 0 },
    { icon: Clock, label: "Categories", value: 8 },
  ];

  return (
    <>
      <FloatingHowItWorks title={"Auction Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Auction Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Auction Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="relative rounded-2xl overflow-hidden mb-8 h-[340px] md:h-[380px]">
      <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" style={{ filter: "brightness(1.3) saturate(1.2)" }}>
        <source src={heroVideo.url} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/15 via-transparent to-yellow-500/10" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="border-2 border-amber-400/30 bg-card/40 backdrop-blur-lg rounded-2xl px-6 md:px-10 py-4 mb-4 shadow-2xl">
          <h1 className="text-3xl md:text-5xl font-black text-white drop-shadow-lg">
            Auction <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">House</span>
          </h1>
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="text-white/90 font-semibold text-sm md:text-base max-w-xl drop-shadow-md">
          Premium Bidding Platform — Buy, Sell & Win Exclusive Deals
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="grid grid-cols-4 gap-2 md:gap-4 mt-6 w-full max-w-2xl">
          {statItems.map((s, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-md rounded-xl p-2 md:p-3 border border-amber-400/20">
              <s.icon className="w-4 h-4 md:w-5 md:h-5 text-amber-300 mx-auto mb-1" />
              <div className="text-white font-bold text-sm md:text-lg">{(s.value || 0) > 0 ? s.value.toLocaleString() : "—"}</div>
              <div className="text-white/60 text-[10px] md:text-xs">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
    </>
  );
};
