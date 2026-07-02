import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const TESTIMONIALS = [
  {
    name: "Maria K.",
    role: "Bazaar seller, Germany",
    avatar: "🌸",
    text: "Switched to Premium and my listings tripled overnight. Zero commission means I keep every euro I earn.",
    rating: 5,
    plan: "Premium",
  },
  {
    name: "Lukas B.",
    role: "AI Creator, Germany",
    avatar: "⚡",
    text: "Unlimited AI generations on Business changed everything. I built 12 monetized projects in 3 months.",
    rating: 5,
    plan: "Business",
  },
  {
    name: "Sofia R.",
    role: "Mom of two, Spain",
    avatar: "💜",
    text: "Kids Academy alone is worth the Premium price. My children learn AND I earn from my own bazaar shop.",
    rating: 5,
    plan: "Premium",
  },
  {
    name: "James T.",
    role: "Pro auctioneer, UK",
    avatar: "🏆",
    text: "The analytics dashboard alone made me close 40% more auctions. Best €15/month I spend.",
    rating: 5,
    plan: "Premium",
  },
  {
    name: "Aiko M.",
    role: "Studio owner, Japan",
    avatar: "🎨",
    text: "Custom branding + API access lets us white-label for clients. Unique = our entire backend now.",
    rating: 5,
    plan: "Business",
  },
  {
    name: "Pavol N.",
    role: "Hobbyist → Full-time",
    avatar: "🚀",
    text: "Started Basic, hit Premium in a month, now on Business with 8 income streams. Surreal.",
    rating: 5,
    plan: "Business",
  },
];

export const SubscriptionTestimonials = () => {
  return (
    <>
      <FloatingHowItWorks title={"Subscription Testimonials - How it works"} steps={[{ title: 'Open', desc: 'Access the Subscription Testimonials section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Subscription Testimonials.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mt-20 max-w-6xl mx-auto"
    >
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
          ))}
          <span className="ml-2 text-sm font-semibold">4.9 from 12,400+ reviews</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black">Loved by creators worldwide</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {TESTIMONIALS.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="relative p-6 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-xl hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all"
          >
            <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/10" />
            <div className="flex items-center gap-3 mb-3">
              <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-xl">
                {t.avatar}
              </div>
              <div>
                <div className="font-bold text-sm">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-foreground/90 mb-3">"{t.text}"</p>
            <div className="flex items-center justify-between">
              <div className="flex gap-0.5">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-primary/10 text-primary">
                {t.plan}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
    </>
  );
};
