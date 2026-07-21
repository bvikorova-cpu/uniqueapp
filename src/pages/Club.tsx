import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Crown,
  Sparkles,
  Heart,
  Gift,
  ShieldCheck,
  Zap,
  Users,
  BadgeCheck,
  CreditCard,
  Truck,
  Percent,
  ArrowRight,
  Loader2,
  Trophy,
  HandHeart,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useClubMembership } from "@/hooks/useClubMembership";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Helmet } from "react-helmet-async";

const PERKS = [
  { icon: Percent, title: "-15% everywhere on Unique", desc: "Auto-applied to every AI credit pack, Verified badge, Fan Club, Bazaar fee, job listing, concert, course, PPV, and gift." },
  { icon: Zap, title: "+50 AI credits every month", desc: "Free credits topped up automatically on each renewal — burn them on any Unique AI tool." },
  { icon: Crown, title: "Gold Unique Club ring", desc: "Your avatar gets a glowing gold ring everywhere on the platform. Everyone sees you're part of the club." },
  { icon: Sparkles, title: "Priority access to new modules", desc: "You get every new Unique module 7 days before the public launch." },
  { icon: Gift, title: "Member-only monthly drop", desc: "One exclusive perk every single month — extra wheel spin, free coloring pack, private livestream, and more." },
  { icon: Users, title: "Refer-a-friend €5 credit", desc: "Every friend who joins the club with your link earns you €5 in Unique credits. Forever." },
  { icon: Trophy, title: "Founding-1000 bonus", desc: "The first 1,000 members keep a permanent 2× vote weight in Megatalent and a lifetime Founding badge." },
  { icon: ShieldCheck, title: "Physical NFC card", desc: "Laser-engraved plastic card with your member number and NFC that opens your Unique profile when tapped." },
];

function useGoodFund() {
  const [total, setTotal] = useState<number>(0);
  const [members, setMembers] = useState<number>(0);
  useEffect(() => {
    supabase.rpc("get_club_good_fund_total").then(({ data }) => {
      const row = Array.isArray(data) ? data[0] : (data as any);
      if (row) {
        setTotal(Number(row.total_eur ?? 0));
        setMembers(Number(row.member_count ?? 0));
      }
    });
  }, []);
  return { total, members };
}

function useFoundingProgress() {
  const [taken, setTaken] = useState(0);
  useEffect(() => {
    supabase.rpc("get_club_founding_progress").then(({ data }) => {
      const row = Array.isArray(data) ? data[0] : (data as any);
      if (row) setTaken(Number(row.founding_taken ?? 0));
    });
  }, []);
  return { taken, total: 1000 };
}

export default function Club() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { membership, isMember, isFounding, loading, startCheckout, openBillingPortal, refresh } =
    useClubMembership();
  const { total, members } = useGoodFund();
  const { taken, total: foundingTotal } = useFoundingProgress();
  const [buying, setBuying] = useState<"digital" | "physical" | null>(null);
  const [verifying, setVerifying] = useState(false);

  // Verify checkout after redirect
  useEffect(() => {
    const sid = searchParams.get("session_id");
    if (!sid) return;
    setVerifying(true);
    supabase.functions
      .invoke("verify-club-membership", { body: { sessionId: sid } })
      .then(({ data, error }) => {
        if (error) throw error;
        if ((data as any)?.status === "active") {
          toast({
            title: "🎉 Welcome to the Unique Club!",
            description: "Your card is active. Gold ring unlocked. 15% discount active platform-wide.",
          });
          refresh();
        }
      })
      .catch((e) =>
        toast({ title: "Verification error", description: e.message, variant: "destructive" })
      )
      .finally(() => setVerifying(false));
  }, [searchParams, toast, refresh]);

  async function handleBuy(tier: "digital" | "physical") {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) {
      navigate("/auth?redirect=/club");
      return;
    }
    setBuying(tier);
    try {
      await startCheckout(tier);
    } catch (e: any) {
      toast({ title: "Checkout failed", description: e.message, variant: "destructive" });
      setBuying(null);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-amber-50 dark:from-purple-950 dark:via-pink-950 dark:to-amber-950 pb-24">
      <Helmet>
        <title>Unique Club — Join the movement that supports good</title>
        <meta name="description" content="Get your Unique Club membership card. €20 digital or €30 physical, then just €1.50/month. 15% off everything, 50 free AI credits monthly, and 10% of every payment supports good causes." />
      </Helmet>

      {/* HERO */}
      <section className="relative overflow-hidden pt-16 pb-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-pink-500/20 border border-amber-500/40 rounded-full px-4 py-1.5 mb-6"
          >
            <Crown className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300">
              Unique Club · New
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black leading-tight"
          >
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 bg-clip-text text-transparent">
              Join the Club
            </span>
            <br />
            <span className="text-foreground">that supports good.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-2xl text-muted-foreground max-w-3xl mx-auto mt-6"
          >
            One card. Every perk on Unique. And <strong className="text-pink-600 dark:text-pink-400">10% of every payment</strong> goes to real people in real need.
          </motion.p>

          {/* Good fund live counter */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-10 inline-flex flex-col sm:flex-row items-center gap-6 bg-white/70 dark:bg-black/40 backdrop-blur-xl border border-pink-500/30 rounded-3xl px-8 py-6 shadow-xl"
          >
            <HandHeart className="h-12 w-12 text-pink-500 shrink-0" />
            <div className="text-left">
              <div className="text-4xl md:text-5xl font-black text-pink-600 dark:text-pink-400">
                €{total.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">
                already given to good causes by <strong>{members}</strong> members
              </div>
            </div>
          </motion.div>

          {/* Founding progress */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 max-w-lg mx-auto"
          >
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Trophy className="h-4 w-4" /> Founding 1,000
              </span>
              <span className="text-muted-foreground">
                {taken} / {foundingTotal} claimed
              </span>
            </div>
            <Progress value={(taken / foundingTotal) * 100} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              First 1,000 members get a lifetime Founding badge + permanent 2× Megatalent votes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* MY MEMBERSHIP (if member) */}
      {isMember && membership && (
        <section className="max-w-4xl mx-auto px-4 mb-10">
          <Card className="p-6 md:p-8 border-2 border-amber-500 bg-gradient-to-br from-amber-50 to-pink-50 dark:from-amber-950/40 dark:to-pink-950/40">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <Badge className="bg-amber-500 text-white mb-2">
                  <Crown className="h-3 w-3 mr-1" /> Active member
                </Badge>
                <h2 className="text-2xl font-black">
                  You are Member #{String(membership.member_number).padStart(4, "0")}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {membership.tier === "physical" ? "Physical NFC card" : "Digital card"}
                  {isFounding && " · 🏆 Founding member"}
                </p>
                {membership.current_period_end && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Renews {new Date(membership.current_period_end).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button onClick={() => navigate("/club/card")} className="bg-gradient-to-r from-amber-500 to-pink-500">
                  <CreditCard className="h-4 w-4 mr-2" /> View my card
                </Button>
                <Button variant="outline" onClick={openBillingPortal}>
                  Manage billing
                </Button>
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* PRICING */}
      {!isMember && (
        <section className="max-w-5xl mx-auto px-4 mb-16" id="pricing">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-10">
            Pick your card
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Digital */}
            <Card className="relative p-8 border-2 hover:border-purple-500 transition-all">
              <div className="text-center">
                <CreditCard className="h-12 w-12 mx-auto mb-3 text-purple-500" />
                <h3 className="text-2xl font-black">Digital Card</h3>
                <p className="text-sm text-muted-foreground mt-1">Instant. In-app. Beautiful.</p>
                <div className="my-6">
                  <div className="text-5xl font-black text-purple-600">€20</div>
                  <div className="text-sm text-muted-foreground">once, then €1.50/month</div>
                </div>
                <Button
                  className="w-full h-12 text-base bg-gradient-to-r from-purple-500 to-pink-500"
                  onClick={() => handleBuy("digital")}
                  disabled={!!buying || verifying}
                >
                  {buying === "digital" ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Get Digital Card <ArrowRight className="h-4 w-4 ml-2" /></>}
                </Button>
              </div>
            </Card>

            {/* Physical */}
            <Card className="relative p-8 border-2 border-amber-500 shadow-2xl">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white">
                🔥 Most Popular
              </Badge>
              <div className="text-center">
                <Truck className="h-12 w-12 mx-auto mb-3 text-amber-500" />
                <h3 className="text-2xl font-black">Physical Card</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Real plastic NFC card, mailed worldwide.
                </p>
                <div className="my-6">
                  <div className="text-5xl font-black text-amber-600">€30</div>
                  <div className="text-sm text-muted-foreground">once, then €1.50/month</div>
                </div>
                <Button
                  className="w-full h-12 text-base bg-gradient-to-r from-amber-500 via-pink-500 to-purple-500"
                  onClick={() => handleBuy("physical")}
                  disabled={!!buying || verifying}
                >
                  {buying === "physical" ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Order Physical Card <ArrowRight className="h-4 w-4 ml-2" /></>}
                </Button>
                <p className="text-xs text-muted-foreground mt-3">
                  Includes digital card + all perks.
                </p>
              </div>
            </Card>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Cancel any time from your billing portal. 10% of every payment goes to the Unique Good Fund.
          </p>
        </section>
      )}

      {/* PERKS */}
      <section className="max-w-6xl mx-auto px-4 mb-16">
        <h2 className="text-3xl md:text-4xl font-black text-center mb-4">
          What you unlock
        </h2>
        <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
          Every perk is real, active on day one, and yours for as long as you're a member.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PERKS.map((perk, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="p-5 h-full bg-white/60 dark:bg-black/30 backdrop-blur border-purple-500/20 hover:border-pink-500/50 transition-all hover:-translate-y-1">
                <perk.icon className="h-8 w-8 text-pink-500 mb-3" />
                <h3 className="font-bold mb-1">{perk.title}</h3>
                <p className="text-sm text-muted-foreground">{perk.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-4xl mx-auto px-4 mb-16">
        <Card className="p-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-pink-500" /> How it works
          </h2>
          <ol className="space-y-3 text-sm md:text-base">
            <li><strong>1.</strong> Pick Digital (€20) or Physical (€30). Pay once + €1.50/month.</li>
            <li><strong>2.</strong> Your gold ring, discount, and 50 monthly AI credits activate instantly.</li>
            <li><strong>3.</strong> Physical cardholders receive a laser-engraved NFC card in the mail.</li>
            <li><strong>4.</strong> Every month, €0.15 from your fee is added to the public Good Fund counter above.</li>
            <li><strong>5.</strong> Cancel any time via the billing portal — no strings attached.</li>
          </ol>
        </Card>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 mb-16">
        <h2 className="text-3xl font-black text-center mb-8">Frequently asked</h2>
        <Accordion type="single" collapsible className="space-y-2">
          <AccordionItem value="q1" className="border rounded-lg px-4">
            <AccordionTrigger>Where does the 10% actually go?</AccordionTrigger>
            <AccordionContent>
              10% of every payment (signup + monthly) is recorded in the public Good Fund ledger and paid out to verified crisis campaigns on Unique. The total on this page updates in real time.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q2" className="border rounded-lg px-4">
            <AccordionTrigger>Can I cancel?</AccordionTrigger>
            <AccordionContent>
              Yes, any time. Click "Manage billing" on your member card and cancel with one click. You keep member perks until the end of the current period.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q3" className="border rounded-lg px-4">
            <AccordionTrigger>How long until the physical card arrives?</AccordionTrigger>
            <AccordionContent>
              Cards are shipped in weekly batches. EU delivery: 5–10 business days. Worldwide: 10–21 business days. You'll see the digital version immediately.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q4" className="border rounded-lg px-4">
            <AccordionTrigger>What's the 15% discount for?</AccordionTrigger>
            <AccordionContent>
              It auto-applies at Stripe checkout for AI credits, Verified badges, Fan Club subscriptions, Bazaar fees, job listings, concerts, courses, PPV posts and platform gifts. Basically everything paid on Unique.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q5" className="border rounded-lg px-4">
            <AccordionTrigger>What if I lose the physical card?</AccordionTrigger>
            <AccordionContent>
              Order a replacement for €10 from your member page. Digital card is always available in-app.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* FINAL CTA */}
      {!isMember && (
        <section className="max-w-3xl mx-auto px-4 text-center">
          <Card className="p-8 bg-gradient-to-br from-purple-600 to-pink-600 text-white border-0 shadow-2xl">
            <BadgeCheck className="h-12 w-12 mx-auto mb-3" />
            <h3 className="text-3xl font-black mb-2">Ready to join?</h3>
            <p className="mb-6 opacity-90">
              Founding spots are filling fast. Get yours before they're gone.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => handleBuy("digital")}
                disabled={!!buying || verifying}
              >
                Digital · €20
              </Button>
              <Button
                size="lg"
                className="bg-amber-400 text-black hover:bg-amber-300"
                onClick={() => handleBuy("physical")}
                disabled={!!buying || verifying}
              >
                Physical · €30
              </Button>
            </div>
          </Card>
        </section>
      )}
    </div>
  );
}
