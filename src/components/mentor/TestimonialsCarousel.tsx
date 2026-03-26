import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const testimonials = [
  {
    name: "Sarah K.",
    area: "Career Coach",
    avatar: "👩‍💼",
    rating: 5,
    text: "The career mentor helped me land my dream job in 3 months. The daily check-ins kept me accountable.",
  },
  {
    name: "Mike R.",
    area: "Fitness Coach",
    avatar: "💪",
    rating: 5,
    text: "Lost 15kg in 4 months following personalized workout plans. Best investment in my health!",
  },
  {
    name: "Emily L.",
    area: "Mindset Coach",
    avatar: "🧘‍♀️",
    rating: 5,
    text: "Completely changed how I handle stress. The mindset techniques are genuinely life-changing.",
  },
  {
    name: "David T.",
    area: "Relationships Coach",
    avatar: "❤️",
    rating: 5,
    text: "Improved communication with my partner significantly. We're stronger than ever now.",
  },
];

export const TestimonialsCarousel = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Quote className="w-5 h-5 text-primary" />
            What Users Say
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative min-h-[120px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{testimonials[current].avatar}</span>
                  <div>
                    <p className="font-semibold text-sm">{testimonials[current].name}</p>
                    <p className="text-[11px] text-muted-foreground">{testimonials[current].area}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {Array.from({ length: testimonials[current].rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic">
                  "{testimonials[current].text}"
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === current ? "bg-primary w-6" : "bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
