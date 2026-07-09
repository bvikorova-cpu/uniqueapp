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
import { HowItWorksButton } from "@/components/common/HowItWorksButton";

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
  const [sending, setSending] = useState(false);
  const [busyInviteId, setBusyInviteId] = useState<string | null>(null);

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
    if (!user || !friendId.trim() || sending) return;
    const target = friendId.trim();
    if (target === user.id) {
      toast.error("You can't invite yourself");
      return;
    }
    setSending(true);
    try {
      // Prevent duplicate pending invite for same friend + quest type
      const { data: existing } = await supabase
        .from("friend_quest_invites")
        .select("id")
        .eq("from_user", user.id)
        .eq("to_user", target)
        .eq("quest_type", QUEST_TYPES[questIdx].id)
        .eq("status", "pending")
        .maybeSingle();
      if (existing) {
        toast.error("You already have a pending invite for this friend & quest");
        return;
      }
      const { error } = await supabase.from("friend_quest_invites").insert({
        from_user: user.id,
        to_user: target,
        quest_type: QUEST_TYPES[questIdx].id,
      });
      if (error) return toast.error("Failed: " + error.message);
      toast.success("Invite sent!");
      setFriendId("");
    } finally {
      setSending(false);
    }
  };


  const accept = async (inv: any) => {
    if (!user || busyInviteId) return;
    if (inv.to_user !== user.id) return toast.error("Not authorized for this invite");
    setBusyInviteId(inv.id);
    setInvites(prev => prev.filter(i => i.id !== inv.id));
    try {
      const { data, error } = await supabase.rpc("accept_friend_quest_invite" as any, { _invite_id: inv.id });
      if (error) { toast.error(error.message); await load(); return; }
      const res = data as any;
      if (!res?.ok) { toast.error(res?.error ?? "Failed to accept"); await load(); return; }
      toast.success("Quest started!");
      await load();
    } finally {
      setBusyInviteId(null);
    }
  };

  const reject = async (inv: any) => {
    if (!user || busyInviteId) return;
    if (inv.to_user !== user.id) return toast.error("Not authorized");
    setBusyInviteId(inv.id);
    setInvites(prev => prev.filter(i => i.id !== inv.id));
    try {
      await supabase.from("friend_quest_invites")
        .update({ status: "rejected", responded_at: new Date().toISOString() })
        .eq("id", inv.id)
        .eq("to_user", user.id)
        .eq("status", "pending");
      await load();
    } finally {
      setBusyInviteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end"><HowItWorksButton variant="compact" title="Friend Quests" intro="Team up with a friend for shared quests that reward both of you." steps={[
        { title: "Invite a friend", desc: "Pick a quest type and enter your friend's username or email to send an invite." },
        { title: "Both must accept", desc: "The friend receives a notification. Once they accept, the quest starts for both accounts." },
        { title: "Progress together", desc: "Both players contribute to the objective. The bar fills as either of you completes actions." },
        { title: "Split rewards", desc: "When the quest completes, XP and credits are awarded to both players automatically." },
      ]} /></div>
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
            <Input placeholder="Friend's user ID" value={friendId} onChange={e => setFriendId(e.target.value)} disabled={sending} />
            <Button onClick={sendInvite} disabled={sending || !friendId.trim()}>{sending ? "Sending..." : "Invite"}</Button>
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
                  <Button size="sm" onClick={() => accept(inv)} disabled={busyInviteId === inv.id}><Check className="h-3 w-3" /></Button>
                  <Button size="sm" variant="outline" onClick={() => reject(inv)} disabled={busyInviteId === inv.id}><X className="h-3 w-3" /></Button>
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
