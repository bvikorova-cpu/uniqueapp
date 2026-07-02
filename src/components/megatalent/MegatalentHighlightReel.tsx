import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Film, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  category?: string;
  categories?: string[];
}

export default function MegatalentHighlightReel({ category, categories }: Props) {
  const [items, setItems] = useState<any[]>([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const cats = categories?.length ? categories : category ? [category] : null;
        let q = supabase
          .from("talent_submissions")
          .select("id,title,media_url,media_type,votes_count,user_id")
          .order("votes_count", { ascending: false })
          .limit(3);
        if (cats) q = q.in("category", cats as any);
        const { data } = await q;
        if (!cancelled) setItems(data || []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return (
    <>
      <FloatingHowItWorks title={"Megatalent Highlight Reel - How it works"} steps={[{ title: 'Open', desc: 'Access the Megatalent Highlight Reel section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Megatalent Highlight Reel.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => { cancelled = true; };
  }, [category, categories?.join(",")]);

  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % items.length), 5000);
    return () => clearInterval(t);
  }, [items.length]);

  if (loading) return <Skeleton className="h-48 w-full rounded-xl" />;
  if (items.length === 0) return null;

  const cur = items[idx];

  return (
    <Card className="backdrop-blur-xl bg-card/80 border-border/30 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Film className="h-4 w-4 text-primary" />
          Highlight Reel
          <Badge variant="secondary" className="ml-auto text-[10px]">Top {items.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={cur.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative aspect-video"
          >
            {cur.media_type === "video" ? (
              <video src={cur.media_url} className="w-full h-full object-cover" muted loop autoPlay playsInline />
            ) : (
              <img src={cur.media_url} alt={cur.title} className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-white truncate">#{idx + 1} · {cur.title}</p>
                <Badge className="bg-accent text-white text-[10px] shrink-0">
                  {cur.votes_count} ❤
                </Badge>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        {items.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8 bg-black/40 hover:bg-black/60 text-white"
              onClick={() => setIdx((i) => (i - 1 + items.length) % items.length)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 bg-black/40 hover:bg-black/60 text-white"
              onClick={() => setIdx((i) => (i + 1) % items.length)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
