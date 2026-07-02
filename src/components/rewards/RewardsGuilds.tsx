import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, Crown, Plus, Users, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { HowItWorksButton } from "@/components/common/HowItWorksButton";

const EMBLEMS = ["⚔️", "🛡️", "🐉", "🦅", "🔥", "⚡", "🌙", "👑", "💎", "🏆"];

export default function RewardsGuilds() {
  const { user } = useAuth();
  const [myGuild, setMyGuild] = useState<any>(null);
  const [topGuilds, setTopGuilds] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [emblem, setEmblem] = useState("⚔️");
  const [creating, setCreating] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data: mem } = await supabase
      .from("guild_members")
      .select("*, guild:guilds(*)")
      .eq("user_id", user.id)
      .maybeSingle();
    setMyGuild(mem);

    const { data: top } = await supabase
      .from("guilds")
      .select("*")
      .order("total_xp", { ascending: false })
      .limit(20);
    setTopGuilds(top || []);
  };

  useEffect(() => { load(); }, [user?.id]);

  const create = async () => {
    if (!user || !name.trim() || creating) return;
    setCreating(true);
    try {
      const { data, error } = await supabase.rpc("create_guild" as any, {
        _name: name.trim(),
        _description: desc || null,
        _emblem: emblem,
      });
      if (error) return toast.error(error.message);
      const res = data as any;
      if (!res?.ok) return toast.error(res?.error ?? "Failed to create");
      toast.success("Guild created!");
      setOpen(false); setName(""); setDesc("");
      await load();
    } finally {
      setCreating(false);
    }
  };

  const join = async (guildId: string) => {
    if (!user || joiningId || myGuild) return;
    setJoiningId(guildId);
    try {
      const { data, error } = await supabase.rpc("join_guild" as any, { _guild_id: guildId });
      if (error) return toast.error(error.message);
      const res = data as any;
      if (!res?.ok) return toast.error(res?.error ?? "Failed to join");
      toast.success("Joined!");
      await load();
    } finally {
      setJoiningId(null);
    }
  };

  const leave = async () => {
    if (!user || !myGuild || leaving) return;
    if (!confirm("Leave this guild?")) return;
    setLeaving(true);
    try {
      const { data, error } = await supabase.rpc("leave_guild" as any, {});
      if (error) return toast.error(error.message);
      const res = data as any;
      if (!res?.ok) return toast.error(res?.error ?? "Failed to leave");
      toast.success("Left guild");
      setMyGuild(null);
      await load();
    } finally {
      setLeaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end"><HowItWorksButton variant="compact" title="Guilds" intro="Team up with other players to earn shared XP, climb leaderboards and unlock guild rewards." steps={[
        { title: "Join or create", desc: "Browse the top guilds below and join one, or create your own with a name and emblem." },
        { title: "Contribute XP", desc: "Every XP you earn on the platform also counts toward your guild's total this week." },
        { title: "Guild perks", desc: "Higher guild ranks unlock member-only cosmetics, credit bonuses and exclusive badges." },
        { title: "Leadership", desc: "Guild leaders can rename the guild, promote officers and remove inactive members." },
      ]} /></div>
      {myGuild?.guild ? (
        <Card className="border-primary/30 overflow-hidden">
          <div className="p-6" style={{ background: `linear-gradient(135deg, ${myGuild.guild.banner_color}, ${myGuild.guild.banner_color}80)` }}>
            <div className="flex items-center gap-4 text-white">
              <div className="text-5xl">{myGuild.guild.emblem}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">{myGuild.guild.name}</h2>
                  <Badge variant="secondary">Lvl {myGuild.guild.level}</Badge>
                </div>
                <p className="text-sm opacity-90">{myGuild.guild.description}</p>
                <div className="flex gap-3 mt-2 text-sm">
                  <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {myGuild.guild.member_count}</span>
                  <span className="flex items-center gap-1"><TrendingUp className="h-4 w-4" /> {myGuild.guild.total_xp.toLocaleString()} XP</span>
                  {myGuild.role === "leader" && <span className="flex items-center gap-1"><Crown className="h-4 w-4" /> Leader</span>}
                </div>
              </div>
            </div>
          </div>
          <CardContent className="pt-4">
            <Progress value={(myGuild.guild.total_xp % 10000) / 100} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">{(myGuild.guild.total_xp % 10000)} / 10,000 to next guild level</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={leave} disabled={leaving}>{leaving ? "Leaving..." : "Leave guild"}</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> No guild yet</span>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Create</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Create your guild</DialogTitle></DialogHeader>
                  <Input placeholder="Guild name" value={name} onChange={e => setName(e.target.value)} />
                  <Textarea placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} />
                  <div className="flex gap-2 flex-wrap">
                    {EMBLEMS.map(e => (
                      <button key={e} onClick={() => setEmblem(e)} className={`text-2xl p-2 rounded ${emblem === e ? "bg-primary/20 ring-2 ring-primary" : "bg-muted"}`}>{e}</button>
                    ))}
                  </div>
                  <Button onClick={create} disabled={!name.trim() || creating}>{creating ? "Creating..." : "Create guild"}</Button>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">Join a guild below or create your own.</p></CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-sm">Top guilds</CardTitle></CardHeader>
        <CardContent className="space-y-1">
          {topGuilds.map((g, i) => (
            <div key={g.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40">
              <span className="w-6 text-center font-bold text-sm">{i + 1}</span>
              <span className="text-2xl">{g.emblem}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{g.name}</p>
                <p className="text-xs text-muted-foreground">{g.member_count}/{g.max_members} · Lvl {g.level} · {g.total_xp.toLocaleString()} XP</p>
              </div>
              {!myGuild && g.is_open && g.member_count < g.max_members && (
                <Button size="sm" variant="outline" onClick={() => join(g.id)} disabled={joiningId === g.id}>{joiningId === g.id ? "Joining..." : "Join"}</Button>
              )}
            </div>
          ))}
          {topGuilds.length === 0 && <p className="text-sm text-muted-foreground">No guilds yet — be the first to create one!</p>}
        </CardContent>
      </Card>
    </div>
  );
}
