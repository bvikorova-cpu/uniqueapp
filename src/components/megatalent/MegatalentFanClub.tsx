import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Heart, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

type Row = { talent_user_id: string; member_count: number; name: string; avatar: string | null };

const MegatalentFanClub = ({ userId }: { userId: string | null }) => {
  const [items, setItems] = useState<Row[]>([]);
  const [joined, setJoined] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    // Top talents — derived from memberships, then enrich with profile.
    // Also include top talent_submissions creators with 0 fans so the list isn't empty when DB is fresh.
    const [{ data: top }, { data: topSubs }] = await Promise.all([
      supabase.from("fan_club_top_talents").select("*").order("member_count", { ascending: false }).limit(12),
      supabase.from("talent_submissions").select("user_id").eq("is_active", true).order("votes_count", { ascending: false }).limit(12),
    ]);

    const counts: Record<string, number> = {};
    (top || []).forEach((r: any) => { counts[r.talent_user_id] = r.member_count; });

    const uniqueIds = new Set<string>();
    (top || []).forEach((r: any) => uniqueIds.add(r.talent_user_id));
    (topSubs || []).forEach((s: any) => uniqueIds.add(s.user_id));
    const idList = [...uniqueIds].slice(0, 12);
    if (!idList.length) { setItems([]); setLoading(false); return; }

    const { data: profs } = await (supabase as any).from("profiles_public").select("id,full_name,avatar_url").in("id", idList);
    const profMap: Record<string, any> = {};
    (profs || []).forEach((p: any) => { profMap[p.id] = p; });

    const rows: Row[] = idList.map(id => ({
      talent_user_id: id,
      member_count: counts[id] || 0,
      name: profMap[id]?.full_name || "Talent",
      avatar: profMap[id]?.avatar_url || null,
    })).sort((a, b) => b.member_count - a.member_count);

    setItems(rows);

    if (userId) {
      const { data: mine } = await supabase
        .from("fan_club_memberships").select("talent_user_id").eq("fan_user_id", userId);
      setJoined(new Set((mine || []).map((m: any) => m.talent_user_id)));
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [userId]);

  const toggle = async (talentId: string, name: string) => {
    if (!userId) { toast.error("Login required"); return; }
    if (talentId === userId) { toast.error("You can't join your own fan club"); return; }
    setBusy(talentId);
    const isJoined = joined.has(talentId);
    if (isJoined) {
      const { error } = await supabase.from("fan_club_memberships")
        .delete().eq("fan_user_id", userId).eq("talent_user_id", talentId);
      setBusy(null);
      if (error) { toast.error(error.message); return; }
      setJoined(prev => { const n = new Set(prev); n.delete(talentId); return n; });
      setItems(prev => prev.map(r => r.talent_user_id === talentId ? { ...r, member_count: Math.max(0, r.member_count - 1) } : r));
      toast.success(`Left ${name}'s fan club`);
    } else {
      const { error } = await supabase.from("fan_club_memberships")
        .insert({ fan_user_id: userId, talent_user_id: talentId });
      setBusy(null);
      if (error) { toast.error(error.message); return; }
      setJoined(prev => new Set(prev).add(talentId));
      setItems(prev => prev.map(r => r.talent_user_id === talentId ? { ...r, member_count: r.member_count + 1 } : r));
      toast.success(`Joined ${name}'s fan club ❤️`);
    }
  };

  if (loading) return (
    <Card><CardContent className="p-5 flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" /> Loading fan clubs…
    </CardContent></Card>
  );
  if (!items.length) return null;

  return (
    <>
      <FloatingHowItWorks title={"Megatalent Fan Club - How it works"} steps={[{ title: 'Open', desc: 'Access the Megatalent Fan Club section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Megatalent Fan Club.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="overflow-hidden backdrop-blur-xl bg-card/70 border-border/30">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-5 w-5 text-pink-500" />
          <h3 className="text-lg font-bold">Top Fan Clubs</h3>
          <Badge variant="secondary" className="ml-auto">{joined.size} joined</Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {items.map((t, i) => {
            const isJoined = joined.has(t.talent_user_id);
            return (
              <motion.div key={t.talent_user_id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="rounded-xl border border-border/40 bg-background/40 p-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/15 overflow-hidden flex items-center justify-center text-lg">
                  {t.avatar ? <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" /> : "🎭"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{t.name}</div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1"><Heart className="h-3 w-3" /> {t.member_count.toLocaleString()} fans</div>
                </div>
                <Button size="sm" variant={isJoined ? "secondary" : "default"} disabled={busy === t.talent_user_id || !userId} onClick={() => toggle(t.talent_user_id, t.name)}>
                  {busy === t.talent_user_id ? <Loader2 className="h-3 w-3 animate-spin" /> : isJoined ? "Joined" : "Join"}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
    </>
  );
};

export default MegatalentFanClub;
