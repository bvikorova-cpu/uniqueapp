import { Card } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Elena M.",
    text: "The reading revealed I was a healer in ancient Egypt. It explained my unexplained fascination with herbs and natural medicine!",
    rating: 5,
  },
  {
    name: "Marco T.",
    text: "The soulmate connection reading blew my mind. My partner and I have been connected across three lifetimes!",
    rating: 5,
  },
  {
    name: "Sarah K.",
    text: "Finally understand why I've always been drawn to medieval history. The karmic lessons were eye-opening.",
    rating: 5,
  },
];

export const PastLifeTestimonials = () => {
  return (
    <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50">
      <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
        <Quote className="h-4 w-4 text-primary" />
        Explorer Stories
      </h3>
      <div className="space-y-3">
        {testimonials.map((t, i) => (
          <div key={i} className="p-3 rounded-lg bg-muted/20 border border-border/30">
            <div className="flex items-center gap-1 mb-1">
              {Array.from({ length: t.rating }).map((_, j) => (
                <Star key={j} className="h-3 w-3 fill-yellow-500 text-yellow-500" />
              ))}
            </div>
            <p className="text-xs text-muted-foreground italic leading-relaxed">"{t.text}"</p>
            <p className="text-[10px] font-medium mt-1 text-foreground/70">— {t.name}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};
