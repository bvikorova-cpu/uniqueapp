import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Flame, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  category?: string;
  categories?: string[];
}

interface RisingStar {
  id: string;
  user_id: string;
  title: string;
  media_url: string;
  category: string;
  votes_count: number;
  created_at: string;
  growth: number;
  profile?: { full_name?: string | null; avatar_url?: string | null };
}

export default function MegatalentRisingStars({ category, categories }: Props) {
  const [stars, setStars] = useState<RisingStar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const cats = categories?.length ? categories : category ? [category] : null;
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

        let q = supabase
          .from("talent_submissions")
          .select("id,user_id,title,media_url,category,votes_count,created_at")
          .gte("created_at", sevenDaysAgo)
          .order("votes_count", { ascending: false })
          .limit(5);
        if (cats) q = q.in("category", cats as any);

        const { data, error } = await q;
        if (error) throw error;

        const rows = (data || []) as any[];
        const uids = Array.from(new Set(rows.map((r) => r.user_id).filter(Boolean)));
        const pmap: Record<string, any> = {};
        if (uids.length) {
          const { data: profs } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url")
            .in("id", uids);
          (profs || []).forEach((p: any) => (pmap[p.id] = p));
        }

        const enriched: RisingStar[] = rows.map((r) => {
          const ageHours = Math.max(
            1,
            (Date.now() - new Date(r.created_at).getTime()) / (1000 * 60 * 60)
          );
          return {
            ...r,
            growth: Math.round(((r.votes_count || 0) / ageHours) * 24),
            profile: pmap[r.user_id],
          };
        });

        enriched.sort((a, b) => b.growth - a.growth);
        if (!cancelled) setStars(enriched);
      } catch (e) {
        console.error("RisingStars error", e);
        if (!cancelled) setStars([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return (
    <>
      <FloatingHowItWorks title={"Megatalent Rising Stars - How it works"} steps={[{ title: 'Open', desc: 'Access the Megatalent Rising Stars section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Megatalent Rising Stars.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => {
      cancelled = true;
    };
  }, [category, categories?.join(",")]);

  return (
    <Card className="backdrop-blur-xl bg-gradient-to-br from-card/90 to-card/60 border-primary/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-5 w-5 text-accent" />
          Rising Stars
          <Badge variant="secondary" className="ml-auto text-[10px]">
            <Sparkles className="h-3 w-3 mr-1" />
            Last 7 days
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : stars.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No rising stars yet — be the first to upload!
          </p>
        ) : (
          <div className="space-y-2">
            {stars.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3 p-2.5 rounded-xl border border-border/30 bg-muted/20 hover:bg-muted/40 transition-colors"
              >
                <div className="text-lg font-black text-accent w-6 text-center">
                  #{i + 1}
                </div>
                <img
                  src={s.media_url}
                  alt={s.title}
                  className="w-12 h-12 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{s.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {s.profile?.full_name || "Unknown"}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-accent shrink-0">
                  <Flame className="h-3.5 w-3.5" />
                  <span className="text-xs font-bold">+{s.growth}/d</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
