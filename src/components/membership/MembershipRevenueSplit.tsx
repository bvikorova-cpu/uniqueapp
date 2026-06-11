import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Wallet } from "lucide-react";
import { CREATOR_SUBSCRIPTION_CREATOR_SHARE_PCT, CREATOR_SUBSCRIPTION_PLATFORM_FEE_PCT } from "@/lib/feeRates";

const exampleAmounts = [5, 10, 25];

export const MembershipRevenueSplit = () => {
  const creatorPct = CREATOR_SUBSCRIPTION_CREATOR_SHARE_PCT;
  const platformPct = CREATOR_SUBSCRIPTION_PLATFORM_FEE_PCT;

  return (
    <section aria-labelledby="revenue-split-heading" className="my-10">
      <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-primary/10 via-background to-accent/10 p-6 md:p-8 backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Transparent revenue split</span>
        </div>
        <h2 id="revenue-split-heading" className="text-2xl md:text-3xl font-black mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
          You keep {creatorPct}%. We take {platformPct}%.
        </h2>

        {/* Split bar */}
        <div className="mb-6">
          <div className="flex h-4 w-full overflow-hidden rounded-full border border-border/40">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${creatorPct}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-primary to-accent"
            />
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${platformPct}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-muted"
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span><span className="font-bold text-foreground">{creatorPct}%</span> Creator</span>
            <span><span className="font-bold text-foreground">{platformPct}%</span> Platform fee</span>
          </div>
        </div>

        {/* Per-price examples */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {exampleAmounts.map((gross) => {
            const fee = (gross * platformPct) / 100;
            const net = gross - fee;
            return (
              <div key={gross} className="rounded-2xl border border-border/40 bg-background/60 p-4">
                <div className="text-xs text-muted-foreground mb-1">Subscriber pays</div>
                <div className="text-xl font-black">€{gross.toFixed(2)}<span className="text-xs font-normal text-muted-foreground">/mo</span></div>
                <div className="mt-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Creator gets</span>
                    <span className="font-bold text-primary">€{net.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Platform fee</span>
                    <span className="text-foreground">−€{fee.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* What's included */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-3 rounded-2xl border border-border/40 bg-background/40 p-4">
            <ShieldCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold">What the {platformPct}% covers</div>
              <div className="text-muted-foreground">Stripe processing, hosting, content delivery, dispute & refund handling, fraud protection, and platform tooling.</div>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-border/40 bg-background/40 p-4">
            <Wallet className="h-5 w-5 text-accent mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold">How creators get paid</div>
              <div className="text-muted-foreground">{creatorPct}% is transferred to your connected Stripe account on every paid invoice. Withdraw anytime from your Creator dashboard.</div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Examples shown in EUR. Stripe payment processing fees are included in the {platformPct}% platform fee — no hidden surcharges.
        </p>
      </div>
    </section>
  );
};
