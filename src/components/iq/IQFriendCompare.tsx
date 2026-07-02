import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users2, Trophy, Brain, Activity, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
type Friend = { friend_id: string; display_name: string | null; avatar_url: string | null };
type Row = {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  country_code: string | null;
  best_iq: number;
  avg_iq: number;
  total_tests: number;
  tier: string;
  is_me: boolean;
};

const Stat = ({ icon: Icon, label, value, winner }: { icon: any; label: string; value: string | number; winner?: boolean }) => (
  <div className={`rounded-lg p-3 border text-center ${winner ? "border-yellow-500/60 bg-yellow-500/5" : "border-border/40 bg-background/30"}`}>
    <Icon className={`w-4 h-4 mx-auto mb-1 ${winner ? "text-yellow-500" : "text-muted-foreground"}`} />
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="text-lg font-bold">{value}</div>
    {winner && <Crown className="w-3 h-3 text-yellow-500 mx-auto mt-1" />}
  </div>
);

const PlayerCol = ({ row, wins }: { row: Row; wins: { best: boolean; avg: boolean; tests: boolean } }) => (
  <div className="flex-1 space-y-3">
    <div className="flex flex-col items-center gap-2">
      <Avatar className="w-16 h-16 border-2 border-primary/30">
        <AvatarImage src={row.avatar_url ?? undefined} />
        <AvatarFallback>{(row.display_name ?? "?").slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="text-center">
        <div className="font-semibold text-sm flex items-center gap-1 justify-center">
          {row.display_name ?? "Player"}
          {row.is_me && <Badge variant="outline" className="text-[10px]">You</Badge>}
        </div>
        <div className="text-xs text-muted-foreground">{row.tier} {row.country_code ? `· ${row.country_code}` : ""}</div>
      </div>
    </div>
    <div className="grid grid-cols-3 gap-2">
      <Stat icon={Trophy} label="Best" value={row.best_iq || "—"} winner={wins.best} />
      <Stat icon={Brain} label="Avg" value={Number(row.avg_iq).toFixed(0) || "—"} winner={wins.avg} />
      <Stat icon={Activity} label="Tests" value={row.total_tests} winner={wins.tests} />
    </div>
  </div>
);

const IQFriendCompare = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const uid = session.user.id;
      const { data: links } = await supabase
        .from("iq_friendships")
        .select("requester_id,addressee_id,status")
        .eq("status", "accepted")
        .or(`requester_id.eq.${uid},addressee_id.eq.${uid}`);
      const ids = (links ?? []).map(l => l.requester_id === uid ? l.addressee_id : l.requester_id);
      if (ids.length === 0) { setFriends([]); return; }
      const { data: profs } = await supabase
        .from("iq_public_profiles")
        .select("user_id,display_name,avatar_url")
        .in("user_id", ids);
      setFriends((profs ?? []).map(p => ({
        friend_id: p.user_id,
        display_name: p.display_name,
        avatar_url: p.avatar_url,
      })));
    })();
  }, []);

  useEffect(() => {
    if (!selected) { setRows([]); return; }
    setLoading(true);
    (async () => {
      const { data } = await supabase.rpc("get_iq_friend_comparison", { _friend_id: selected });
      setRows((data as Row[] | null) ?? []);
      setLoading(false);
    })();
  }, [selected]);

  const me = rows.find(r => r.is_me);
  const them = rows.find(r => !r.is_me);

  return (
    <>
      <FloatingHowItWorks title="How IQFriend Compare works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users2 className="w-5 h-5 text-primary" /> Friend Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {friends.length === 0 ? (
          <p className="text-sm text-muted-foreground">Add friends to compare your IQ stats.</p>
        ) : (
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger><SelectValue placeholder="Select a friend to compare" /></SelectTrigger>
            <SelectContent>
              {friends.map(f => (
                <SelectItem key={f.friend_id} value={f.friend_id}>
                  {f.display_name ?? "Player"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {loading && <p className="text-xs text-muted-foreground">Loading…</p>}

        {me && them && (
          <div className="flex flex-col md:flex-row gap-4 items-stretch">
            <PlayerCol row={me} wins={{
              best: me.best_iq > them.best_iq,
              avg: Number(me.avg_iq) > Number(them.avg_iq),
              tests: me.total_tests > them.total_tests,
            }} />
            <div className="flex md:flex-col items-center justify-center text-2xl font-bold text-muted-foreground">
              VS
            </div>
            <PlayerCol row={them} wins={{
              best: them.best_iq > me.best_iq,
              avg: Number(them.avg_iq) > Number(me.avg_iq),
              tests: them.total_tests > me.total_tests,
            }} />
          </div>
        )}
      </CardContent>
    </Card>
    </>
    );
};

export default IQFriendCompare;
