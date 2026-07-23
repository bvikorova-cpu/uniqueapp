import { Link } from "react-router-dom";
import { Crown, ArrowRight, HandHeart } from "lucide-react";

export function ClubHomepageBanner() {
  return (
    <div
      className="mx-auto max-w-6xl px-4 my-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <Link
        to="/club"
        className="group relative block overflow-hidden rounded-3xl border-2 border-amber-500/40 bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 p-1 shadow-2xl transition-transform hover:scale-[1.01]"
      >
        <div className="relative rounded-[calc(1.5rem-4px)] bg-gradient-to-br from-purple-900/95 via-pink-900/95 to-amber-900/95 p-5 md:p-6">
          <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
            <div className="shrink-0 flex items-center justify-center h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-gradient-to-br from-amber-400 to-pink-500 shadow-lg">
              <Crown className="h-8 w-8 md:h-9 md:w-9 text-white drop-shadow" />
            </div>
            <div className="flex-1 min-w-0 text-white">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] md:text-xs uppercase tracking-widest font-bold text-amber-300">
                  NEW · Limited founding spots
                </span>
              </div>
              <h3 className="text-lg md:text-2xl font-black leading-tight">
                Join the Unique VIP Club — from €20
              </h3>
              <p className="text-xs md:text-sm text-white/80 mt-1 flex items-center gap-1.5">
                <HandHeart className="h-3.5 w-3.5 text-pink-300 shrink-0" />
                15% off everything, 50 free AI credits/month, and 10% supports good causes.
              </p>
            </div>
            <div className="shrink-0 w-full md:w-auto">
              <div className="inline-flex items-center gap-2 rounded-full bg-white text-purple-700 font-bold px-5 py-2.5 text-sm shadow-lg group-hover:bg-amber-300 transition-colors">
                Get my card <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
