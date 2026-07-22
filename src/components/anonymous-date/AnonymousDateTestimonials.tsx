import { Card } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

type Testimonial = { name: string; text: string; rating: number };

export const AnonymousDateTestimonials = () => {
  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ["anon-date-testimonials"],
    queryFn: async (): Promise<Testimonial[]> => {
      // Pull real anonymous positive feedback from CSAT ratings tied to the dating flow.
      const { data } = await supabase
        .from("csat_ratings")
        .select("rating, comment")
        .gte("rating", 4)
        .not("comment", "is", null)
        .order("created_at", { ascending: false })
        .limit(3);
      const rows = (data ?? []) as Array<{ rating: number; comment: string | null }>;
      return rows
        .filter((r) => (r.comment ?? "").trim().length > 0)
        .map((r, i) => ({
          name: `Anonymous ${String.fromCharCode(65 + i)}.`,
          text: r.comment as string,
          rating: r.rating }));
    },
    staleTime: 5 * 60_000 });

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
        {isLoading ? (
          <p className="text-xs text-muted-foreground text-center py-4">Loading stories…</p>
        ) : testimonials.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            No stories yet — yours could be the first.
          </p>
        ) : (
          testimonials.map((t, i) => (
            <div key={i} className="p-3 rounded-lg bg-muted/20 border border-border/30">
              <div className="flex items-center gap-1 mb-1">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <p className="text-xs text-muted-foreground italic leading-relaxed">"{t.text}"</p>
              <p className="text-[10px] font-medium mt-1 text-foreground/70">— {t.name}</p>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
