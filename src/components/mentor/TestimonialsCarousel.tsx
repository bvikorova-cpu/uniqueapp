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
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Quote className="w-4 h-4 text-primary" />
            </div>
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
                  <div className="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center text-2xl">
                    {testimonials[current].avatar}
                  </div>
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
                <p className="text-sm text-muted-foreground italic leading-relaxed">
                  "{testimonials[current].text}"
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-center gap-2 mt-4">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all ${
                  i === current ? "bg-primary w-6" : "bg-muted-foreground/20 w-2"
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
