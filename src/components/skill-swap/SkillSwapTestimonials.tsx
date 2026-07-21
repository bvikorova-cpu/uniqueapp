import { Card } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

type Testimonial = { name: string; text: string; rating: number };

export const SkillSwapTestimonials = () => {
  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ["skill-swap-testimonials"],
    queryFn: async (): Promise<Testimonial[]> => {
      const { data } = await supabase
        .from("bazaar_seller_ratings")
        .select("rating, comment, reviewer_id")
        .not("comment", "is", null)
        .gte("rating", 4)
        .order("created_at", { ascending: false })
        .limit(3);
      const rows = (data ?? []) as Array<{ rating: number; comment: string | null; reviewer_id: string }>;
      return rows
        .filter((r) => (r.comment ?? "").trim().length > 0)
        .map((r) => ({
          name: `User ${r.reviewer_id.slice(0, 4).toUpperCase()}`,
          text: r.comment as string,
          rating: r.rating,
        }));
    },
    staleTime: 5 * 60_000,
  });

  return (
    <>
      <FloatingHowItWorks
        title={"Skill Swap Testimonials - How it works"}
        steps={[
          { title: "Open", desc: "Access the Skill Swap Testimonials section from its module." },
          { title: "Explore", desc: "Review real member ratings and comments." },
          { title: "Interact", desc: "Leave your own review after completing a swap." },
          { title: "Review", desc: "Ratings update in real time from the community." },
        ]}
      />
      <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50">
        <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
          <Quote className="h-4 w-4 text-primary" />
          Community Reviews
        </h3>
        <div className="space-y-3">
          {isLoading ? (
            <p className="text-xs text-muted-foreground text-center py-4">Loading reviews…</p>
          ) : testimonials.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No reviews yet — be the first to share your swap experience.
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
    </>
  );
};
