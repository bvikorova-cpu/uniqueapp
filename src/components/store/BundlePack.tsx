import { motion } from "framer-motion";
import { Gift, Sparkles, Check, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export interface BundleItem {
  emoji: string;
  name: string;
}

interface BundlePackProps {
  tier: "starter" | "pro" | "legendary";
  name: string;
  description: string;
  items: BundleItem[];
  originalPrice: number;
  bundlePrice: number;
  onBuy: () => void;
  disabled?: boolean;
  popular?: boolean;
}

const TIER_STYLES: Record<string, { gradient: string; glow: string; ring: string; badge: string; text: string }> = {
  starter: {
    gradient: "from-blue-500/15 via-cyan-500/10 to-blue-500/15",
    glow: "bg-blue-500/30",
    ring: "border-blue-500/40",
    badge: "from-blue-500 to-cyan-500",
    text: "text-blue-300",
  },
  pro: {
    gradient: "from-purple-500/20 via-pink-500/15 to-purple-500/20",
    glow: "bg-purple-500/40",
    ring: "border-purple-500/50",
    badge: "from-purple-500 to-pink-500",
    text: "text-purple-300",
  },
  legendary: {
    gradient: "from-amber-500/20 via-orange-500/15 to-amber-500/20",
    glow: "bg-amber-500/40",
    ring: "border-amber-500/50",
    badge: "from-amber-500 to-orange-500",
    text: "text-amber-300",
  },
};

/** Bundle pack — boost AOV with curated 3-5 item kits. */
export const BundlePack = ({
  tier, name, description, items, originalPrice, bundlePrice, onBuy, disabled, popular,
}: BundlePackProps) => {
  const s = TIER_STYLES[tier];
  const savings = originalPrice - bundlePrice;
  const savingsPct = Math.round((savings / originalPrice) * 100);

  return (
    <>
      <FloatingHowItWorks title="How Bundle Pack works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className={`relative overflow-hidden rounded-2xl border-2 ${s.ring} bg-gradient-to-br ${s.gradient} backdrop-blur-xl p-6 ${popular ? "ring-2 ring-amber-400/40 shadow-xl shadow-amber-500/20" : ""}`}
    >
      <div className={`absolute -top-16 -right-16 h-40 w-40 rounded-full ${s.glow} blur-3xl pointer-events-none`} />
      {popular && (
        <div className="absolute -top-px left-1/2 -translate-x-1/2 px-4 py-1 rounded-b-xl bg-gradient-to-r from-amber-400 to-orange-500 text-black text-[10px] font-black uppercase tracking-wider shadow-lg">
          ⭐ Most popular
        </div>
      )}

      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <Gift className={`h-5 w-5 ${s.text}`} />
          <Badge className={`bg-gradient-to-r ${s.badge} text-white border-0 uppercase tracking-wider text-[10px] font-black`}>
            {tier}
          </Badge>
        </div>
        <h3 className="text-2xl font-black mb-1">{name}</h3>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>

        <div className="space-y-1.5 mb-5 p-3 rounded-xl bg-background/40 border border-border/40">
          {items.map((it) => (
            <div key={it.name} className="flex items-center gap-2 text-sm">
              <Check className={`h-3.5 w-3.5 ${s.text} shrink-0`} strokeWidth={3} />
              <span className="text-lg">{it.emoji}</span>
              <span className="font-medium truncate">{it.name}</span>
            </div>
          ))}
        </div>

        <div className="flex items-baseline gap-2 mb-4">
          <span className={`text-4xl font-black ${s.text}`}>{bundlePrice}</span>
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="text-base line-through text-muted-foreground">{originalPrice}</span>
          <Badge variant="outline" className="ml-auto text-xs font-black border-emerald-500/50 text-emerald-400">
            Save {savingsPct}%
          </Badge>
        </div>

        <Button
          onClick={onBuy}
          disabled={disabled}
          className={`w-full bg-gradient-to-r ${s.badge} hover:opacity-90 text-white font-bold shadow-lg`}
          size="lg"
        >
          <Crown className="mr-2 h-4 w-4" /> Unlock bundle
        </Button>
      </div>
    </motion.div>
    </>
    );
};
