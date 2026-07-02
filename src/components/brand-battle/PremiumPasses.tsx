import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const FEATURES = [
  "Unlimited daily votes",
  "All AI Insights at 50% off",
  "Exclusive Voter Pass tournaments",
  "Animated golden username frame",
  "Priority chat & moderation tools",
  "Early access to new features",
  "Ambassador program eligibility",
  "No ads ever",
];

const MEGA_FEATURES = [
  "Homepage Hero Takeover (24h slots)",
  "AI Campaign Generator (unlimited)",
  "Dedicated Customer Success Manager",
  "Custom landing page + analytics",
  "Priority placement in all categories",
  "Press release distribution",
  "API access + white-label options",
  "Quarterly strategy session",
];

export const PremiumPasses = () => {
  const [loading, setLoading] = useState<string | null>(null);

  const subscribe = async (tier: "voter_pass" | "mega_sponsor") => {
    if (tier === "mega_sponsor") {
      // Enterprise tier — route to sales contact, not Stripe checkout
      window.location.href =
        "mailto:sales@unique-platform.com?subject=Mega%20Sponsor%20Inquiry%20-%20Brand%20Titan&body=Hi%2C%20I%27m%20interested%20in%20the%20Mega%20Sponsor%20package.%20Please%20contact%20me%20with%20more%20details.";
      toast.success("Opening email client to contact our sales team…");
      return;
    }
    setLoading(tier);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { plan: tier },
      });
      if (error) throw error;
      if ((data as any)?.url) window.open((data as any).url, "_blank");
      else toast.error("Checkout setup pending — Stripe price IDs need to be configured.");
    } catch (e: any) {
      toast.error(e.message ?? "Could not start checkout. Stripe products may need setup.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Premium Passes - How it works"} steps={[{ title: 'Open', desc: 'Access the Premium Passes section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Premium Passes.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Voter Pass */}
      <motion.div whileHover={{ y: -4 }}>
        <Card className="relative overflow-hidden border-amber-500/40 bg-gradient-to-br from-amber-950/30 via-zinc-950 to-zinc-950 h-full">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(45_95%_55%/.15),transparent_60%)]" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/20 rounded-full blur-3xl" />
          <CardHeader className="relative">
            <Badge className="w-fit bg-gradient-to-r from-amber-400 to-yellow-500 text-zinc-950 border-0 font-black">
              <Crown className="h-3 w-3 mr-1" /> VOTER PASS
            </Badge>
            <CardTitle className="text-3xl font-black text-amber-100 mt-2">Premium Voter</CardTitle>
            <p className="text-amber-100/70">Unlock the full battle experience</p>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-5xl font-black bg-gradient-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent">€9.99</span>
              <span className="text-amber-100/60">/mo</span>
            </div>
          </CardHeader>
          <CardContent className="relative space-y-2">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-2 text-sm text-amber-100/90"
              >
                <Check className="h-4 w-4 text-amber-400 shrink-0" />
                {f}
              </motion.div>
            ))}
            <Button
              disabled={loading === "voter_pass"}
              onClick={() => subscribe("voter_pass")}
              className="w-full mt-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-zinc-950 hover:from-amber-500 hover:to-yellow-600 border-0 font-black"
            >
              {loading === "voter_pass" ? "Loading…" : "Subscribe →"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Mega Sponsor */}
      <motion.div whileHover={{ y: -4 }}>
        <Card className="relative overflow-hidden border-violet-500/50 bg-gradient-to-br from-violet-950/30 via-zinc-950 to-fuchsia-950/20 h-full">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,hsl(280_90%_55%/.15),transparent_60%)]" />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-fuchsia-500/20 rounded-full blur-3xl" />
          <CardHeader className="relative">
            <Badge className="w-fit bg-gradient-to-r from-violet-400 to-fuchsia-500 text-white border-0 font-black">
              <Sparkles className="h-3 w-3 mr-1" /> MEGA SPONSOR
            </Badge>
            <CardTitle className="text-3xl font-black text-violet-100 mt-2">Brand Titan</CardTitle>
            <p className="text-violet-100/70">For category-defining brands</p>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-5xl font-black bg-gradient-to-r from-violet-300 to-fuchsia-400 bg-clip-text text-transparent">€10K+</span>
              <span className="text-violet-100/60">/mo</span>
            </div>
          </CardHeader>
          <CardContent className="relative space-y-2">
            {MEGA_FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-2 text-sm text-violet-100/90"
              >
                <Check className="h-4 w-4 text-fuchsia-400 shrink-0" />
                {f}
              </motion.div>
            ))}
            <Button
              disabled={loading === "mega_sponsor"}
              onClick={() => subscribe("mega_sponsor")}
              className="w-full mt-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-600 hover:to-fuchsia-600 border-0 font-black"
            >
              {loading === "mega_sponsor" ? "Loading…" : "Contact Sales →"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
    </>
  );
};
