import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Heart, Image as ImageIcon, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface GalleryItem {
  id: string;
  image_url: string;
  prompt: string;
  title: string | null;
  style: string | null;
  tool_used: string | null;
  likes_count: number;
  user_id: string;
}

/**
 * Public AI gallery — top-liked recent creations.
 * Read-only; lives on the AI Credits store as social proof.
 */
export const AICommunityGalleryStrip = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("ai_community_gallery")
        .select("id, image_url, prompt, title, style, tool_used, likes_count, user_id")
        .eq("is_public", true)
        .order("likes_count", { ascending: false })
        .limit(8);
      if (!cancelled) {
        setItems((data ?? []) as GalleryItem[]);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <Card className="p-5 sm:p-6 bg-card/80 backdrop-blur-xl border-border/50">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="font-black text-lg">Made with credits</h3>
        <span className="ml-auto text-xs text-muted-foreground">Top community creations</span>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
            <ImageIcon className="h-6 w-6 text-primary" />
          </div>
          <p className="font-bold text-foreground">Be the first to share</p>
          <p className="text-sm text-muted-foreground max-w-xs mt-1">
            Generate something with AI Studio and publish it to the community gallery.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {items.map((it, i) => (
            <motion.div
              key={it.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="relative aspect-square rounded-xl overflow-hidden border border-border/50 group"
            >
              <img
                src={it.image_url}
                alt={it.title ?? it.prompt.slice(0, 60)}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <p className="text-[10px] text-white/90 line-clamp-2 font-medium">
                  {it.title ?? it.prompt}
                </p>
                <div className="flex items-center justify-between mt-1">
                  {it.style && (
                    <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-white/20 text-white font-bold backdrop-blur">
                      {it.style}
                    </span>
                  )}
                  <span className="text-[10px] text-white font-bold inline-flex items-center gap-1 ml-auto">
                    <Heart className="h-3 w-3 fill-pink-400 text-pink-400" />
                    {it.likes_count}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  );
};
