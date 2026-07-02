import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
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
    <>
      <FloatingHowItWorks title="How Testimonials Carousel works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden relative">
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primary/5 to-transparent rounded-tr-full" />
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <Quote className="w-4 h-4 text-white" />
            </div>
            What Users Say
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative min-h-[130px]">
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
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl shadow-inner">
                    {testimonials[current].avatar}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{testimonials[current].name}</p>
                    <p className="text-[11px] text-primary font-medium">{testimonials[current].area}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {Array.from({ length: testimonials[current].rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic leading-relaxed pl-1 border-l-2 border-primary/30">
                  "{testimonials[current].text}"
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between mt-4">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrent(prev => prev === 0 ? testimonials.length - 1 : prev - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === current ? "bg-primary w-6" : "bg-muted-foreground/20 w-2 hover:bg-muted-foreground/40"
                  }`}
                />
              ))}
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrent(prev => (prev + 1) % testimonials.length)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
    </>
    );
};
