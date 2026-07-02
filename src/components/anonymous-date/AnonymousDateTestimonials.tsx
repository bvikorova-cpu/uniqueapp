import { Card } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const testimonials = [
  {
    name: "Anonymous M.",
    text: "We chatted for 7 days and fell in love with each other's personality before even seeing photos. Best dating experience ever!",
    rating: 5,
  },
  {
    name: "Anonymous K.",
    text: "The reveal moment was incredibly exciting. It felt like unwrapping a gift after building a real connection.",
    rating: 5,
  },
  {
    name: "Anonymous S.",
    text: "Finally a dating app that focuses on who you are, not how you look. Found my partner here!",
    rating: 5,
  },
];

export const AnonymousDateTestimonials = () => {
  return (
    <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50">
      <FloatingHowItWorks
        title={"Anonymous Date Testimonials"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
        <Quote className="h-4 w-4 text-pink-500" />
        Love Stories
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
