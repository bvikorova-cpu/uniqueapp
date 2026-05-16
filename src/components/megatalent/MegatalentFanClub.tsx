import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MegatalentFanClub = ({ category, categories }: { category?: string; categories?: string[] }) => {
  const [items, setItems] = useState<any[]>([]);
  const [joined, setJoined] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try { setJoined(JSON.parse(localStorage.getItem("mt_fanclubs") || "{}")); } catch {}
    const load = async () => {
      if (!categories?.length) return;
      const { data: subs } = await supabase
        .from("talent_submissions")
        .select("user_id, title, votes_count")
        .in("category", categories as any)
        .eq("is_active", true)
        .order("votes_count", { ascending: false })
        .limit(20);
      if (!subs?.length) return;
      const userIds = [...new Set(subs.map((s: any) => s.user_id))].slice(0, 6);
      const { data: profs } = await supabase
        .from("profiles").select("id, full_name, avatar_url").in("id", userIds);
      const merged = (profs || []).map((p: any) => {
        const fan = 1200 + Math.floor(Math.random() * 5000);
        return { id: p.id, name: p.full_name || "Talent", avatar: p.avatar_url, fans: fan };
      });
      setItems(merged);
    };
    load();
  }, [category]);

  const toggle = (id: string, name: string) => {
    setJoined(prev => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem("mt_fanclubs", JSON.stringify(next));
      toast.success(next[id] ? `Joined ${name}'s fan club ❤️` : `Left ${name}'s fan club`);
      return next;
    });
  };

  if (!items.length) return null;

  return (
    <Card className="overflow-hidden backdrop-blur-xl bg-card/70 border-border/30">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-5 w-5 text-pink-500" />
          <h3 className="text-lg font-bold">Fan Clubs</h3>
          <Badge variant="secondary" className="ml-auto">{Object.values(joined).filter(Boolean).length} joined</Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {items.map((t, i) => {
            const isJoined = !!joined[t.id];
            return (
              <motion.div key={t.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="rounded-xl border border-border/40 bg-background/40 p-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/15 overflow-hidden flex items-center justify-center text-lg">
                  {t.avatar ? <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" /> : "🎭"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{t.name}</div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1"><Heart className="h-3 w-3" /> {t.fans.toLocaleString()} fans</div>
                </div>
                <Button size="sm" variant={isJoined ? "secondary" : "default"} onClick={() => toggle(t.id, t.name)}>
                  {isJoined ? "Joined" : "Join"}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default MegatalentFanClub;
