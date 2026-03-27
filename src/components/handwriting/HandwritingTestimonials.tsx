import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    text: "The personality analysis from my handwriting was incredibly accurate. It described traits I've spent years in therapy discovering.",
    author: "Maria L.",
    rating: 5,
  },
  {
    text: "Used the business analysis for our hiring process — the insights about candidates' work styles were invaluable.",
    author: "James W.",
    rating: 5,
  },
  {
    text: "My relationship analysis revealed communication patterns I hadn't noticed. It's been a game-changer for my partnership.",
    author: "Sophie T.",
    rating: 4,
  },
];

export const HandwritingTestimonials = () => {
  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Quote className="w-4 h-4 text-primary" />
          What Users Say
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="p-3 rounded-xl bg-muted/20 border border-border/30"
          >
            <div className="flex gap-0.5 mb-1.5">
              {Array.from({ length: t.rating }).map((_, j) => (
                <Star key={j} className="w-3 h-3 fill-yellow-500 text-yellow-500" />
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed italic">"{t.text}"</p>
            <p className="text-[10px] text-primary font-medium mt-1.5">— {t.author}</p>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
};
