import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MegatalentPredictions = ({ category, categories }: { category?: string; categories?: string[] }) => {
  const key = `mt_predict_${category || "global"}`;
  const [picks, setPicks] = useState<string[]>([]);
  const [pick, setPick] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    try { setPicks(JSON.parse(localStorage.getItem(key + "_history") || "[]")); } catch {}
    setPick(localStorage.getItem(key) || null);
    const load = async () => {
      if (!categories?.length) return;
      const { data } = await supabase
        .from("talent_submissions")
        .select("id, title, media_url, media_type, votes_count, user_id")
        .in("category", categories as any)
        .eq("is_active", true)
        .order("votes_count", { ascending: false })
        .limit(8);
      setItems(data || []);
    };
    load();
  }, [category]);

  const choose = (id: string, title: string) => {
    setPick(id);
    localStorage.setItem(key, id);
    const hist = [...picks, title].slice(-5);
    setPicks(hist);
    localStorage.setItem(key + "_history", JSON.stringify(hist));
    toast.success("Prediction locked", { description: `${title} — +10 XP if they win the next round` });
  };

  if (!items.length) return null;

  return (
    <Card className="overflow-hidden backdrop-blur-xl bg-card/70 border-border/30">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-5 w-5 text-accent" />
          <h3 className="text-lg font-bold">Predict the Winner</h3>
          <Badge variant="secondary" className="ml-auto gap-1"><Sparkles className="h-3 w-3" /> +10 XP</Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-3">Lock your pick for the next round and earn XP if you're right.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {items.map((it, i) => {
            const selected = pick === it.id;
            return (
              <motion.button key={it.id} whileHover={{ y: -2 }} onClick={() => choose(it.id, it.title)}
                className={`relative rounded-lg overflow-hidden aspect-square border-2 transition ${selected ? "border-primary ring-2 ring-primary/40" : "border-border/40"}`}>
                {it.media_type === "video" ? (
                  <video src={it.media_url} className="w-full h-full object-cover" muted playsInline />
                ) : (
                  <img src={it.media_url} alt={it.title} className="w-full h-full object-cover" loading="lazy" />
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5">
                  <div className="text-white text-[10px] font-semibold truncate">{it.title}</div>
                </div>
                {selected && <Badge className="absolute top-1 right-1 text-[10px] px-1.5 py-0">PICKED</Badge>}
              </motion.button>
            );
          })}
        </div>
        {picks.length > 0 && (
          <div className="mt-3 text-[11px] text-muted-foreground">Recent picks: {picks.join(" · ")}</div>
        )}
      </CardContent>
    </Card>
  );
};

export default MegatalentPredictions;
