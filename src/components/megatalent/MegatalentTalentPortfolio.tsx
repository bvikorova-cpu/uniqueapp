import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const MegatalentTalentPortfolio = ({ category, categories }: { category?: string; categories?: string[] }) => {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!categories?.length) return;
      const { data } = await supabase
        .from("talent_submissions")
        .select("id, title, media_url, media_type, votes_count, user_id")
        .in("category", categories as any)
        .eq("is_active", true)
        .order("votes_count", { ascending: false })
        .limit(6);
      setItems(data || []);
    };
    load();
  }, [category, categories]);

  if (!items.length) return null;

  return (
    <Card className="overflow-hidden backdrop-blur-xl bg-card/70 border-border/30">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold">Featured Portfolios</h3>
          <Badge variant="secondary" className="ml-auto">Top creators</Badge>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {items.map((it, i) => (
            <motion.div key={it.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
              className="relative aspect-square rounded-lg overflow-hidden bg-muted group">
              {it.media_type === "video" ? (
                <video src={it.media_url} className="w-full h-full object-cover" muted playsInline />
              ) : (
                <img src={it.media_url} alt={it.title} className="w-full h-full object-cover" loading="lazy" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-2">
                <span className="text-white text-[11px] font-semibold line-clamp-2">{it.title}</span>
              </div>
              <Badge className="absolute top-1 right-1 text-[10px] px-1.5 py-0">♥ {it.votes_count || 0}</Badge>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MegatalentTalentPortfolio;
