import { motion } from "framer-motion";
import { Hourglass, Sparkles, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface LimitedEditionBannerProps {
  title: string;
  subtitle: string;
  emoji: string;
  totalSupply: number;
  remaining: number;
  endsAt?: string;
  onView?: () => void;
}

/** Scarcity-driven limited collectibles banner. */
export const LimitedEditionBanner = ({
  title, subtitle, emoji, totalSupply, remaining, endsAt, onView,
}: LimitedEditionBannerProps) => {
  const sold = totalSupply - remaining;
  const pct = Math.min(100, (sold / totalSupply) * 100);

  return (
    <>
<motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="relative overflow-hidden rounded-2xl border border-fuchsia-500/40 bg-gradient-to-br from-fuchsia-950/60 via-purple-950/40 to-rose-950/60 p-6"
    >
      <div className="absolute -top-24 -right-24 h-60 w-60 rounded-full bg-fuchsia-500/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 h-60 w-60 rounded-full bg-rose-500/20 blur-3xl pointer-events-none" />

      <div className="relative grid grid-cols-1 sm:grid-cols-[auto,1fr,auto] gap-5 items-center">
        <div className="text-7xl drop-shadow-[0_2px_8px_rgba(255,0,255,0.4)]">{emoji}</div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-gradient-to-r from-fuchsia-500 to-rose-500 text-white border-0 uppercase tracking-wider text-[10px] font-black">
              <Flame className="h-3 w-3 mr-1" /> Limited Edition
            </Badge>
            {endsAt && (
              <Badge variant="outline" className="border-fuchsia-400/40 text-fuchsia-200 text-[10px]">
                <Hourglass className="h-3 w-3 mr-1" /> Ends {endsAt}
              </Badge>
            )}
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white drop-shadow-lg">{title}</h3>
          <p className="text-sm text-white/80 mb-3">{subtitle}</p>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-fuchsia-300">{remaining} of {totalSupply} left</span>
              <span className="text-white/60">{Math.round(pct)}% claimed</span>
            </div>
            <Progress value={pct} className="h-2 bg-white/10" />
          </div>
        </div>

        <Button
          onClick={onView}
          className="bg-gradient-to-r from-fuchsia-500 to-rose-500 hover:opacity-90 text-white font-bold shadow-lg shadow-fuchsia-500/40 self-end sm:self-center"
        >
          <Sparkles className="mr-2 h-4 w-4" /> View collection
        </Button>
      </div>
    </motion.div>
    </>
  );
};
