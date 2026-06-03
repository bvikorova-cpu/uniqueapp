import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Users, Heart, Send, Check, X } from "lucide-react";
import { toast } from "sonner";

const QUEST_TYPES = [
  { id: "post_streak", title: "Post 14 days in a row", target: 14, reward: 700 },
  { id: "ai_combo", title: "Use 30 AI tools together", target: 30, reward: 500 },
  { id: "xp_marathon", title: "Earn 5,000 XP combined", target: 5000, reward: 1000 },
];

export default function RewardsFriendQuests() {
  const { user } = useAuth();
  const [active, setActive] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [friendId, setFriendId] = useState("");
  const [questIdx, setQuestIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    const { data: q } = await supabase
      .from("friend_quests")
      .select("*")
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .eq("status", "active")
      .order("created_at", { ascending: false });
    const { data: inv } = await supabase
      .from("friend_quest_invites")
      .select("*")
      .eq("to_user", user.id)
      .eq("status", "pending");
    setActive(q || []);
    setInvites(inv || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user?.id]);

  const sendInvite = async () => {
    if (!user || !friendId.trim()) return;
    const { error } = await supabase.from("friend_quest_invites").insert({
      from_user: user.id,
      to_user: friendId.trim(),
      quest_type: QUEST_TYPES[questIdx].id,
    });
    if (error) return toast.error("Failed: " + error.message);
    toast.success("Invite sent!");
    setFriendId("");
  };

  const accept = async (inv: any) => {
    if (!user) return;
    const { data, error } = await supabase.rpc("accept_friend_quest_invite" as any, { _invite_id: inv.id });
    if (error) return toast.error(error.message);
    const res = data as any;
    if (!res?.ok) return toast.error(res?.error ?? "Failed to accept");
    toast.success("Quest started!");
    load();
  };

  const reject = async (inv: any) => {
    await supabase.from("friend_quest_invites").update({ status: "rejected", responded_at: new Date().toISOString() }).eq("id", inv.id);
    load();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" /> Invite a friend
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <select className="w-full rounded-lg bg-background border border-border p-2 text-sm" value={questIdx} onChange={e => setQuestIdx(+e.target.value)}>
            {QUEST_TYPES.map((q, i) => <option key={q.id} value={i}>{q.title} — {q.reward} XP</option>)}
          </select>
          <div className="flex gap-2">
            <Input placeholder="Friend's user ID" value={friendId} onChange={e => setFriendId(e.target.value)} />
            <Button onClick={sendInvite}>Invite</Button>
          </div>
        </CardContent>
      </Card>

      {invites.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Pending invites ({invites.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {invites.map(inv => {
              const qt = QUEST_TYPES.find(q => q.id === inv.quest_type);
              return (
                <div key={inv.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/40">
                  <Heart className="h-4 w-4 text-pink-400" />
                  <p className="flex-1 text-sm">{qt?.title || inv.quest_type}</p>
                  <Button size="sm" onClick={() => accept(inv)}><Check className="h-3 w-3" /></Button>
                  <Button size="sm" variant="outline" onClick={() => reject(inv)}><X className="h-3 w-3" /></Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Active quests</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="text-sm text-muted-foreground">Loading...</p> :
           active.length === 0 ? <p className="text-sm text-muted-foreground">No active quests. Invite a friend!</p> :
           <div className="space-y-3">
             {active.map(q => {
               const total = q.progress_a + q.progress_b;
               const pct = Math.min(100, (total / q.target_value) * 100);
               return (
                 <div key={q.id} className="p-3 rounded-lg border border-border/40">
                   <div className="flex items-center justify-between mb-2">
                     <p className="font-semibold text-sm">{q.title}</p>
                     <Badge variant="outline">{q.reward_xp} XP each</Badge>
                   </div>
                   <Progress value={pct} className="h-2" />
                   <p className="text-xs text-muted-foreground mt-1">{total} / {q.target_value}</p>
                 </div>
               );
             })}
           </div>}
        </CardContent>
      </Card>
    </div>
  );
}
