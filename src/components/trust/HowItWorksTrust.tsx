import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Sparkles, Trophy, Coins, Lock, RefreshCw } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const STEPS = [
  { icon: Sparkles, title: "Sign up free", desc: "Get 10 free credits instantly. No credit card required." },
  { icon: Coins, title: "Vote, create & engage", desc: "Use credits to vote, comment, upload talents or play games." },
  { icon: Trophy, title: "Win real prizes", desc: "Top talents earn €5–€10,000 in quarterly cash prizes." },
];

const TRUST_BADGES = [
  { icon: ShieldCheck, label: "Refund guarantee", desc: "Unused credits refundable within 14 days" },
  { icon: Lock, label: "Secure payments", desc: "Stripe-powered, GDPR compliant" },
  { icon: RefreshCw, label: "Transparent payouts", desc: "Real-time leaderboard earnings" },
];

const FAQS = [
  {
    q: "How do I win money?",
    a: "Upload a talent clip, gather votes from the community, and rank in the top of your category. Prizes are paid out weekly via Stripe.",
  },
  {
    q: "Are credits real money?",
    a: "Credits unlock platform actions (voting, comments, uploads). You can also win cash prizes that are paid directly to your bank account.",
  },
  {
    q: "Can I get a refund?",
    a: "Yes — unused purchased credits are refundable within 14 days of purchase, no questions asked.",
  },
  {
    q: "Is my data safe?",
    a: "We are fully GDPR-compliant. Payments are processed by Stripe; we never store your card details. You can delete your account anytime.",
  },
  {
    q: "Who can join?",
    a: "Anyone 16 or older. Kids Channel is available for ages 6–12 with parental supervision.",
  },
];

export function HowItWorksTrust() {
  return (
    <>
      <FloatingHowItWorks title={"How It Works Trust - How it works"} steps={[{ title: 'Open', desc: 'Access the How It Works Trust section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in How It Works Trust.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <section className="py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* steps */}
        <div className="text-center space-y-2">
          <Badge variant="secondary" className="gap-1"><Sparkles className="h-3 w-3" /> How it works</Badge>
          <h2 className="text-3xl md:text-4xl font-bold">Win in 3 simple steps</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <Card className="h-full backdrop-blur-xl bg-card/60 border-primary/20">
                  <CardContent className="p-6 text-center space-y-3">
                    <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
                      <Icon className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Step {i + 1}</p>
                      <h3 className="font-bold text-lg">{s.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{s.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* trust */}
        <div className="grid md:grid-cols-3 gap-3 pt-2">
          {TRUST_BADGES.map((t) => {
            const Icon = t.icon;
            return (
              <div
                key={t.label}
                className="flex items-center gap-3 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-md"
              >
                <Icon className="h-5 w-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* faq */}
        <div className="pt-4">
          <h3 className="text-2xl font-bold mb-4 text-center">Frequently asked</h3>
          <Accordion type="single" collapsible className="max-w-2xl mx-auto">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />
    </section>
    </>
  );
}

export default HowItWorksTrust;
