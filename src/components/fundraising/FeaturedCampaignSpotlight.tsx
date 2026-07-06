import { motion } from "framer-motion";
import { Clock, Heart, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Featured {
  id: string;
  title: string;
  description?: string;
  category: string;
  goal: number;
  raised: number;
  image_url?: string;
}

export function FeaturedCampaignSpotlight() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState<Featured | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.rpc("get_featured_campaign" as any);
      if (cancelled) return;
      if (data && typeof data === "object" && (data as any).id) {
        setFeatured(data as Featured);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const pct = featured ? Math.min(100, (Number(featured.raised) / Math.max(1, Number(featured.goal))) * 100) : 0;

  return (
    <>
      <FloatingHowItWorks title={"Featured Campaign Spotlight - How it works"} steps={[{ title: 'Auto-picked', desc: 'The most-funded active campaign across all 7 categories is highlighted.' }, { title: 'Refreshes daily', desc: 'New leaders bubble up as donations come in.' }, { title: 'One-tap donate', desc: 'Opens the campaign detail with Stripe checkout.' }, { title: 'Get featured yourself', desc: 'Start a campaign, raise fast, land here.' }]} />
      <section className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Star className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Featured Campaign</h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 shadow-lg overflow-hidden"
        >
          {loading ? (
            <div className="h-40 animate-pulse bg-muted/30 rounded-xl" />
          ) : !featured ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-1">Your Campaign Could Be Here</h3>
                <p className="text-muted-foreground">Be the first to launch — the top-raising campaign gets automatically featured here.</p>
              </div>
              <Button className="w-full sm:w-auto" onClick={() => navigate("/fundraising?tool=create-campaign")}>
                <Star className="mr-2 h-4 w-4" /> Start Your Campaign
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-3 flex justify-end sm:absolute sm:top-4 sm:right-4 sm:mb-0">
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-primary/10 text-primary border border-primary/20 uppercase">
                  {featured.category}
                </span>
              </div>
              <div className="space-y-4">
                {featured.image_url && (
                  <img src={featured.image_url} alt={featured.title} className="w-full h-48 object-cover rounded-xl" loading="lazy" />
                )}
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-1">{featured.title}</h3>
                  {featured.description && (
                    <p className="text-muted-foreground line-clamp-2">{featured.description}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Goal progress</span>
                    <span className="font-bold text-foreground">{pct.toFixed(0)}%</span>
                  </div>
                  <Progress value={pct} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>€{Number(featured.raised).toFixed(0)} raised</span>
                    <span>Goal: €{Number(featured.goal).toFixed(0)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                  <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /><span>Active now</span></div>
                  <div className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /><span>Verified</span></div>
                  <div className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /><span>Top raiser</span></div>
                </div>

                <Button className="w-full sm:w-auto" onClick={() => navigate(`/fundraising/${featured.category}/${featured.id}`)}>
                  <Heart className="mr-2 h-4 w-4" /> Donate Now
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </section>
    </>
  );
}
