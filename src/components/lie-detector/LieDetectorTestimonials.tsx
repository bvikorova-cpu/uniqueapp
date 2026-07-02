import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const testimonials = [
  {
    text: "Helped me catch inconsistencies in messages I would have never noticed. The psychological profiling is incredibly detailed.",
    author: "Sarah M.",
    rating: 5,
  },
  {
    text: "The thread analysis saved me from a scam. It detected manipulation patterns across 20+ messages instantly.",
    author: "David K.",
    rating: 5,
  },
  {
    text: "Fascinating tool for understanding communication styles. The emotional analysis is spot-on.",
    author: "Elena R.",
    rating: 4,
  },
];

export const LieDetectorTestimonials = () => {
  return (
    <>
      <FloatingHowItWorks title={"Lie Detector Testimonials - How it works"} steps={[{ title: 'Open', desc: 'Access the Lie Detector Testimonials section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Lie Detector Testimonials.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
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
    </>
  );
};
