import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const testimonials = [
  { name: "Sarah M.", avatar: "👩", rating: 5, text: "My kids absolutely love the bedtime stories! The AI creates personalized adventures that make reading time magical." },
  { name: "David K.", avatar: "👨", rating: 5, text: "The homework helper alone is worth the subscription. My daughter's grades improved significantly!" },
  { name: "Elena P.", avatar: "👩‍🦱", rating: 5, text: "We tried the free version first and upgraded within a day. The Science Lab is incredible for curious minds." },
  { name: "Marcus T.", avatar: "👨‍🦲", rating: 4, text: "Great value for 3 kids. The parental dashboard gives me peace of mind about what they're learning." },
  { name: "Lisa R.", avatar: "👩‍🦰", rating: 5, text: "The Drawing Buddy feature turned my shy kid into a confident little artist. Absolutely worth every cent!" },
];

export function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent(p => (p + 1) % testimonials.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const t = testimonials[current];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8">
        What <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Parents</span> Say
      </h2>

      <div className="relative h-48 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 flex flex-col justify-between"
          >
            <p className="text-muted-foreground italic text-sm leading-relaxed">"{t.text}"</p>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{t.avatar}</span>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < t.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`} />
                    ))}
                  </div>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">Verified Parent</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-primary w-6" : "bg-muted-foreground/30"}`}
          />
        ))}
      </div>
    </div>
  );
}
