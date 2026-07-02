import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Quote, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const HandwritingTestimonials = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await (supabase as any)
        .from("handwriting_analyses")
        .select("id, created_at, analysis_type")
        .order("created_at", { ascending: false })
        .limit(3);
      setReviews(data || []);
      setLoading(false);
    };
    fetchReviews();
  }, []);

  if (loading) {
    return (
    <>
      <FloatingHowItWorks title={"Handwriting Testimonials - How it works"} steps={[{ title: 'Open', desc: 'Access the Handwriting Testimonials section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Handwriting Testimonials.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardContent className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    </>
  );
  }

  if (reviews.length === 0) {
    return (
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Quote className="w-4 h-4 text-primary" />
            Recent Analyses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground text-center py-4">
            No analyses yet. Be the first to try handwriting analysis!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Quote className="w-4 h-4 text-primary" />
          Recent Analyses
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {reviews.map((r: any, i: number) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="p-3 rounded-xl bg-muted/20 border border-border/30"
          >
            <div className="flex gap-0.5 mb-1.5">
              {Array.from({ length: 5 }).map((_, j) => (
                <Star key={j} className="w-3 h-3 fill-yellow-500 text-yellow-500" />
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {r.analysis_type || "Personal"} analysis completed
            </p>
            <p className="text-[10px] text-primary font-medium mt-1.5">
              {new Date(r.created_at).toLocaleDateString()}
            </p>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
};
