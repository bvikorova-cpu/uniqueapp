import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Copy, Check, Loader2, Swords } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import IQDuelGame from "./IQDuelGame";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const modes = [
  { id: "quick", label: "Quick · 5Q" },
  { id: "standard", label: "Standard · 10Q" },
  { id: "ranked", label: "Ranked · 15Q" },
  { id: "blitz", label: "Blitz · 20Q" },
];

export default function IQFriendChallenge() {
  const [mode, setMode] = useState("standard");
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [code, setCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeDuelId, setActiveDuelId] = useState<string | null>(null);
  const [pendingDuelId, setPendingDuelId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  // Realtime: when opponent joins our waiting duel, auto-launch the game
  useEffect(() => {
    if (!pendingDuelId) return;
    const channel = supabase
      .channel(`iq-friend-${pendingDuelId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "iq_duels", filter: `id=eq.${pendingDuelId}` },
        (payload) => {
          const row = payload.new as { status?: string; opponent_id?: string | null };
          if (row.status === "active" && row.opponent_id) {
            toast({ title: "Opponent joined!", description: "Starting duel." });
            setActiveDuelId(pendingDuelId);
            setPendingDuelId(null);
            setCode("");
            setShareUrl("");
          }
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [pendingDuelId, toast]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    // Auto-pick up ?iq_invite=CODE from URL
    const url = new URL(window.location.href);
    const inv = url.searchParams.get("iq_invite");
    if (inv) setJoinCode(inv);
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    const { data, error } = await supabase.rpc("create_iq_friend_challenge", { _mode: mode });
    setCreating(false);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    const row = (data as { duel_id: string; invite_code: string }[])?.[0];
    if (!row) return;
    setCode(row.invite_code);
    setPendingDuelId(row.duel_id);
    const url = `${window.location.origin}${window.location.pathname}?iq_invite=${row.invite_code}`;
    setShareUrl(url);
    toast({ title: "Challenge ready", description: "Share the link with a friend." });
  };

  const handleCancelWaiting = () => {
    setPendingDuelId(null);
    setCode("");
    setShareUrl("");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setJoining(true);
    const { data, error } = await supabase.rpc("accept_iq_friend_challenge", { _code: joinCode.trim().toUpperCase() });
    setJoining(false);
    if (error) {
      toast({ title: "Cannot join", description: error.message.replace(/_/g, " "), variant: "destructive" });
      return;
    }
    const row = (data as { duel_id: string }[])?.[0];
    if (row?.duel_id) {
      setActiveDuelId(row.duel_id);
      toast({ title: "Joined!", description: "Starting duel." });
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How IQFriend Challenge works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <div className="mb-8">
      <h2 className="text-xl sm:text-2xl font-black mb-4">👥 Friend Challenge</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-pink-500/20 bg-gradient-to-br from-pink-500/5 to-purple-500/5">
          <CardHeader className="p-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Swords className="h-4 w-4 text-pink-500" /> Challenge a friend
            </CardTitle>
            <CardDescription className="text-xs">Generate a private invite link</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {modes.map((m) => <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button className="w-full bg-gradient-to-r from-pink-600 to-purple-600" onClick={handleCreate} disabled={creating}>
              {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Create invite link"}
            </Button>
            {code && (
              <div className="space-y-2">
                <Badge className="text-sm bg-pink-500/20 text-pink-500 border-pink-500/30">Code: {code}</Badge>
                <div className="flex gap-2">
                  <Input value={shareUrl} readOnly className="text-xs h-8" />
                  <Button size="sm" variant="outline" onClick={handleCopy}>
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-pink-500" />
                  <p className="text-[10px] text-muted-foreground flex-1">Waiting for opponent to join… duel auto-starts on accept.</p>
                  <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={handleCancelWaiting}>Cancel</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-indigo-500/5">
          <CardHeader className="p-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" /> Join with code
            </CardTitle>
            <CardDescription className="text-xs">Got an invite code? Paste it here</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            <Input
              placeholder="ABCD1234"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              maxLength={8}
              className="text-center font-mono tracking-widest"
            />
            <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600" onClick={handleJoin} disabled={joining || !joinCode}>
              {joining ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Join duel"}
            </Button>
          </CardContent>
        </Card>
      </div>
      {activeDuelId && userId && (
        <IQDuelGame duelId={activeDuelId} myUserId={userId} onClose={() => setActiveDuelId(null)} />
      )}
    </div>
    </>
    );
}
