import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Swords, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface FriendRow {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: string;
}

export default function IQFriends() {
  const [uid, setUid] = useState<string | null>(null);
  const [rows, setRows] = useState<FriendRow[]>([]);
  const [target, setTarget] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    setUid(session.user.id);
    const { data } = await supabase
      .from("iq_friendships")
      .select("id,requester_id,addressee_id,status")
      .or(`requester_id.eq.${session.user.id},addressee_id.eq.${session.user.id}`)
      .order("created_at", { ascending: false });
    setRows((data ?? []) as FriendRow[]);
  };

  useEffect(() => { load(); }, []);

  const sendRequest = async () => {
    if (!target.trim() || !uid) return;
    setBusy(true);
    const { error } = await supabase.from("iq_friendships").insert({
      requester_id: uid,
      addressee_id: target.trim(),
      status: "pending",
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Friend request sent");
      setTarget("");
      load();
    }
  };

  const accept = async (id: string) => {
    const { data, error } = await supabase.rpc("accept_iq_friend", { _friendship_id: id });
    if (error || !data) toast.error("Could not accept");
    else { toast.success("Friend added"); load(); }
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("iq_friendships").delete().eq("id", id);
    if (error) toast.error(error.message);
    else load();
  };

  const challenge = async (friendId: string) => {
    if (!uid) return;
    const { error } = await supabase.from("iq_friend_challenges").insert({
      challenger_id: uid,
      opponent_id: friendId,
      question_count: 10,
      stake_credits: 0,
      status: "pending",
    });
    if (error) toast.error(error.message);
    else toast.success("1v1 challenge sent");
  };

  const incoming = rows.filter(r => r.status === "pending" && r.addressee_id === uid);
  const outgoing = rows.filter(r => r.status === "pending" && r.requester_id === uid);
  const friends  = rows.filter(r => r.status === "accepted");

  return (
    <>
      <FloatingHowItWorks title="How IQFriends works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20 mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" /> IQ Friends & 1v1
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Friend's user ID"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
          <Button onClick={sendRequest} disabled={busy}>
            <UserPlus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>

        {incoming.length > 0 && (
          <div>
            <p className="text-xs uppercase text-muted-foreground mb-2">Incoming requests</p>
            <div className="space-y-2">
              {incoming.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-2 rounded-md bg-muted/40">
                  <span className="text-xs font-mono truncate">{r.requester_id}</span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="default" onClick={() => accept(r.id)}>
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(r.id)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {friends.length > 0 ? (
          <div>
            <p className="text-xs uppercase text-muted-foreground mb-2">
              Friends <Badge variant="secondary">{friends.length}</Badge>
            </p>
            <div className="space-y-2">
              {friends.map((r) => {
                const friendId = r.requester_id === uid ? r.addressee_id : r.requester_id;
                return (
                  <div key={r.id} className="flex items-center justify-between p-2 rounded-md bg-muted/40">
                    <span className="text-xs font-mono truncate">{friendId}</span>
                    <div className="flex gap-1">
                      <Button size="sm" variant="default" onClick={() => challenge(friendId)}>
                        <Swords className="h-3 w-3 mr-1" /> Duel
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => remove(r.id)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-2">
            No friends yet. Send a request using a user ID.
          </p>
        )}

        {outgoing.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {outgoing.length} pending outgoing request(s)
          </p>
        )}
      </CardContent>
    </Card>
    </>
    );
}
