import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const FAQS = [
  {
    q: "Can I cancel anytime?",
    a: "Yes — cancel with one click. Your subscription stays active until the end of your paid period and you keep all your content."
  },
  {
    q: "Do unused AI generations roll over?",
    a: "Monthly AI quotas reset at the start of each billing cycle. Premium and Business plans include enough generations for most heavy users."
  },
  {
    q: "What payment methods do you accept?",
    a: "All major cards (Visa, Mastercard, Amex), Apple Pay, Google Pay, and SEPA in EU — securely processed through Stripe."
  },
  {
    q: "Can I switch plans later?",
    a: "Absolutely. Upgrade instantly with prorated billing, or downgrade at the end of your current period — no questions asked."
  },
  {
    q: "Is there a free trial?",
    a: "The Basic tier lets you try every hub with limited usage. Upgrade only when you're ready to go unlimited."
  },
  {
    q: "Do you offer refunds?",
    a: "Subscriptions are non-refundable, but you keep full access until your period ends. Contact support for billing issues."
  },
  {
    q: "What happens to my listings if I downgrade?",
    a: "All your existing listings stay live. Only new listings are limited to your tier's monthly quota."
  },
  {
    q: "Is my data secure?",
    a: "Bank-grade encryption, GDPR compliant, RLS-protected database. Your data is yours — export it anytime."
  },
];

export const SubscriptionFAQ = () => {
  return (
    <>
      <FloatingHowItWorks title={"Subscription F A Q - How it works"} steps={[{ title: 'Open', desc: 'Access the Subscription F A Q section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Subscription F A Q.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mt-20 max-w-3xl mx-auto"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 mb-3">
          <HelpCircle className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">FAQ</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black">Frequently asked questions</h2>
      </div>

      <Accordion type="single" collapsible className="space-y-3">
        {FAQS.map((item, i) => (
          <AccordionItem
            key={i}
            value={`item-${i}`}
            className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur-xl px-5 data-[state=open]:border-primary/40 data-[state=open]:bg-primary/5 transition-all"
          >
            <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">
              {item.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </motion.div>
    </>
  );
};
