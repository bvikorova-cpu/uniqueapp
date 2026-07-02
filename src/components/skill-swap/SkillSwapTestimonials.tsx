import { Card } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const testimonials = [
  {
    name: "Sarah M.",
    text: "I taught yoga and learned web development in return. No money exchanged — just pure skill sharing!",
    rating: 5,
  },
  {
    name: "David K.",
    text: "Found an amazing guitar teacher who wanted to learn cooking. We've been swapping for 3 months!",
    rating: 5,
  },
  {
    name: "Maria L.",
    text: "The matching algorithm found me the perfect partner. We both got exactly what we needed.",
    rating: 5,
  },
];

export const SkillSwapTestimonials = () => {
  return (
    <>
      <FloatingHowItWorks title={"Skill Swap Testimonials - How it works"} steps={[{ title: 'Open', desc: 'Access the Skill Swap Testimonials section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Skill Swap Testimonials.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50">
      <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
        <Quote className="h-4 w-4 text-primary" />
        Success Stories
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
    </>
  );
};
