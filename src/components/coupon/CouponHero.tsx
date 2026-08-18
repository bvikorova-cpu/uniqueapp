import { motion } from "framer-motion";
import couponHeroAsset from "@/assets/coupon-hero.mp4.asset.json";

interface CouponHeroProps {
  couponCount?: number;
}

export const CouponHero = (_props: CouponHeroProps) => {
  return (
    <div className="mb-8">
      <div className="relative h-[280px] w-full overflow-hidden rounded-2xl sm:h-[340px]">
        <video autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" style={{ filter: "brightness(1.2) saturate(1.3)" }} src={couponHeroAsset.url} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-purple-900/20" />
        <div className="relative z-10 flex h-full flex-col justify-end p-4 sm:p-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-block max-w-[82%] rounded-2xl border border-white/20 bg-card/20 px-5 py-4 shadow-2xl backdrop-blur-md sm:max-w-xl sm:px-6 sm:py-5">
              <h1 className="text-3xl font-black leading-none text-white drop-shadow-lg sm:text-5xl">
                Coupon <span className="bg-gradient-to-r from-purple-400 to-amber-400 bg-clip-text text-transparent">Marketplace</span>
              </h1>
              <p className="mt-2 max-w-md text-sm font-semibold text-white/90 drop-shadow sm:text-lg">
                Buy &amp; sell coupons, gift cards &amp; vouchers at exclusive prices
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
