import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Crown, Flame, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Tribe {
  id: string;
  brand_id: string;
  name: string;
  motto: string;
  member_count: number;
  weekly_score: number;
  brand?: { name: string; logo: string };
}

export const BrandTribes = () => {
  const [tribes, setTribes] = useState<Tribe[]>([]);
  const [myTribe, setMyTribe] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);

  const load = async () => {
    const { data: t } = await supabase
      .from("brand_tribes")
      .select("*, brand:brand_sponsors(name, logo)")
      .order("weekly_score", { ascending: false })
      .limit(10);
    if (t) setTribes(t as any);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: my } = await supabase.from("brand_tribe_members").select("tribe_id").eq("user_id", user.id).maybeSingle();
      setMyTribe(my?.tribe_id ?? null);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const join = async (tribe: Tribe) => {
    setJoining(tribe.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Sign in first"); return; }

      // Leave current tribe if any
      if (myTribe) await supabase.from("brand_tribe_members").delete().eq("user_id", user.id);

      const { error } = await supabase.from("brand_tribe_members").insert({
        tribe_id: tribe.id, user_id: user.id, rank: "recruit",
      });
      if (error) throw error;

      await supabase.from("brand_tribes").update({ member_count: tribe.member_count + 1 }).eq("id", tribe.id);
      toast.success(`Joined ${tribe.name}!`);
      load();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to join");
    } finally {
      setJoining(null);
    }
  };

  if (loading) return <div className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto text-amber-400" /></div>;

  return (
    <>
      <FloatingHowItWorks title={"Brand Tribes - How it works"} steps={[{ title: 'Open', desc: 'Access the Brand Tribes section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Brand Tribes.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="relative overflow-hidden border-amber-500/30 bg-gradient-to-br from-zinc-950 to-zinc-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(45_90%_55%/.08),transparent_70%)]" />
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 text-amber-100">
          <Users className="h-5 w-5 text-amber-400" />
          Brand Tribes
          <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-zinc-950 border-0">FAN CLUBS</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="relative space-y-2">
        {tribes.map((t, idx) => {
          const isMine = myTribe === t.id;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className={`relative rounded-xl border p-3 transition-all ${
                isMine ? "border-amber-400/60 bg-gradient-to-r from-amber-500/15 to-amber-500/5 shadow-lg shadow-amber-500/10" : "border-amber-500/15 bg-zinc-950/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center h-10 w-10 rounded-lg font-black text-zinc-950 ${
                  idx === 0 ? "bg-gradient-to-br from-amber-300 to-yellow-500" :
                  idx === 1 ? "bg-gradient-to-br from-zinc-300 to-zinc-500" :
                  idx === 2 ? "bg-gradient-to-br from-amber-700 to-amber-900 text-amber-100" :
                  "bg-zinc-800 text-amber-100/60"
                }`}>
                  {idx === 0 ? <Crown className="h-5 w-5" /> : `#${idx + 1}`}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-black text-amber-100 truncate">{t.name}</p>
                    {isMine && <Badge className="bg-amber-500 text-zinc-950 border-0 text-[10px]">MY TRIBE</Badge>}
                  </div>
                  <p className="text-[11px] text-amber-100/50 italic truncate">"{t.motto}"</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-xs text-amber-100/70">
                    <Users className="h-3 w-3" /> {t.member_count}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-orange-400 font-mono">
                    <Flame className="h-3 w-3" /> {t.weekly_score}
                  </div>
                </div>
                {!isMine && (
                  <Button
                    size="sm"
                    onClick={() => join(t)}
                    disabled={joining === t.id}
                    className="shrink-0 bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 hover:from-amber-600 border-0 text-xs"
                  >
                    {joining === t.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Join"}
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
    </>
  );
};
