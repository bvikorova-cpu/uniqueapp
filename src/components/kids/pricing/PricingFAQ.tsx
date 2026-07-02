import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const faqs = [
  { q: "Is the content safe for children?", a: "Absolutely! All AI-generated content passes through our child-safety filters. We comply with COPPA regulations and never show ads or inappropriate material." },
  { q: "Can I cancel anytime?", a: "Yes! No contracts, no hidden fees. Cancel anytime from your account settings and keep access until the end of your billing period." },
  { q: "How many kids can use one account?", a: "Gold Pass supports up to 5 individual child profiles, each with their own progress tracking, avatar, and personalized experience." },
  { q: "What age range is this for?", a: "Our content is designed for children ages 3-12, with difficulty levels that automatically adapt to each child's age and learning progress." },
  { q: "Is there a money-back guarantee?", a: "Yes! We offer a full 14-day money-back guarantee. If you or your kids aren't happy, we'll refund you — no questions asked." },
  { q: "Do I need to supervise my child?", a: "Our platform is designed for independent use with parental controls. The dashboard lets you monitor activity, set time limits, and review content." },
];

export function PricingFAQ() {
  return (
    <>
      <FloatingHowItWorks title={"Pricing F A Q - How it works"} steps={[{ title: 'Open', desc: 'Access the Pricing F A Q section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Pricing F A Q.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="flex items-center justify-center gap-2 mb-8">
        <HelpCircle className="h-6 w-6 text-primary" />
        <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
      </div>

      <Accordion type="single" collapsible className="space-y-2">
        {faqs.map((faq, i) => (
          <AccordionItem
            key={i}
            value={`faq-${i}`}
            className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm px-5 overflow-hidden"
          >
            <AccordionTrigger className="text-sm font-semibold hover:no-underline py-4">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground pb-4">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </motion.div>
    </>
  );
}
