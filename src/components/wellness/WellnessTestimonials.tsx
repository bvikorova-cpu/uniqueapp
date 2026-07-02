import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const testimonials = [
  {
    name: "Anna S.",
    area: "Breathing Exercises",
    avatar: "🧘‍♀️",
    rating: 5,
    text: "The 4-7-8 breathing technique completely transformed how I handle anxiety. I use it every night before sleep.",
  },
  {
    name: "James R.",
    area: "AI Coach",
    avatar: "💆",
    rating: 5,
    text: "Having a 24/7 mindfulness coach is incredible. It helped me through some of my toughest days.",
  },
  {
    name: "Lisa M.",
    area: "Nature Sounds",
    avatar: "🌿",
    rating: 5,
    text: "The rain and ocean sounds help me fall asleep in minutes. My insomnia is basically gone now.",
  },
  {
    name: "Tom K.",
    area: "Gratitude Journal",
    avatar: "📖",
    rating: 5,
    text: "Writing gratitude entries daily with AI insights has genuinely shifted my perspective on life.",
  },
];

export const WellnessTestimonials = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return (
    <>
      <FloatingHowItWorks title={"Wellness Testimonials - How it works"} steps={[{ title: 'Open', desc: 'Access the Wellness Testimonials section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Wellness Testimonials.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => clearInterval(timer);
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
