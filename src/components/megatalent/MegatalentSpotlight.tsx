import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Heart, Eye, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Props {
  category?: string;
  categories?: string[];
}

export default function MegatalentSpotlight({ category, categories }: Props) {
  const [item, setItem] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const cats = categories?.length ? categories : category ? [category] : null;
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

        let q = supabase
          .from("talent_submissions")
          .select("id,user_id,title,description,media_url,media_type,votes_count,category,created_at")
          .gte("created_at", sevenDaysAgo)
          .order("votes_count", { ascending: false })
          .limit(1);
        if (cats) q = q.in("category", cats as any);

        const { data } = await q;
        const top = (data || [])[0];
        if (!top) {
          if (!cancelled) setItem(null);
          return;
        }

        const { data: prof } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .eq("id", top.user_id)
          .maybeSingle();

        if (!cancelled) {
          setItem(top);
          setProfile(prof);
        }
      } catch (e) {
        console.error("Spotlight error", e);
        if (!cancelled) setItem(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [category, categories?.join(",")]);

  if (loading) {
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  if (!item) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="overflow-hidden backdrop-blur-xl bg-gradient-to-br from-primary/20 via-card/80 to-accent/20 border-primary/40 relative">
        <div className="absolute top-3 left-3 z-10">
          <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground gap-1.5 px-3 py-1">
            <Sparkles className="h-3.5 w-3.5" />
            Spotlight of the Week
          </Badge>
        </div>

        <div className="relative aspect-video w-full overflow-hidden">
          {item.media_type === "video" ? (
            <video src={item.media_url} className="w-full h-full object-cover" muted loop autoPlay playsInline />
          ) : (
            <img src={item.media_url} alt={item.title} className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>

        <CardContent className="relative -mt-16 z-10 space-y-3 pt-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-lg border-2 border-background shadow-lg overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                profile?.full_name?.[0] || "U"
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">{profile?.full_name || "Unknown talent"}</p>
              <p className="text-xs text-muted-foreground">Featured this week</p>
            </div>
            <Trophy className="h-6 w-6 text-yellow-500" />
          </div>

          <div>
            <h3 className="font-bold text-lg leading-tight">{item.title}</h3>
            {item.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
            )}
          </div>

          <div className="flex items-center gap-4 pt-2 border-t border-border/30">
            <div className="flex items-center gap-1.5">
              <Heart className="h-4 w-4 text-red-500 fill-red-500" />
              <span className="text-sm font-bold">{(item.votes_count || 0).toLocaleString()}</span>
            </div>
            <Badge variant="outline" className="text-[10px]">
              {item.category}
            </Badge>
            <Button size="sm" variant="default" className="ml-auto h-8">
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              View
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
