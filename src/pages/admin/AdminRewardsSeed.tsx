import { useState } from "react";
import { Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Status = "idle" | "running" | "done" | "error";

const REWARD_ICONS = ["🎁", "⭐", "💎", "🔥", "🏆", "🎯", "🚀", "💰", "🎨", "👑"];

function pickIcon(i: number) {
  return REWARD_ICONS[i % REWARD_ICONS.length];
}

// ============ BATTLE PASS SEED ============
async function seedBattlePass() {
  const seasonNumber = 1;
  const startsAt = new Date();
  const endsAt = new Date();
  endsAt.setDate(endsAt.getDate() + 60);

  // upsert season
  const { data: season, error: sErr } = await supabase
    .from("battle_pass_seasons")
    .upsert(
      {
        name: `Season ${seasonNumber} — Genesis`,
        season_number: seasonNumber,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        premium_price_eur: 9.99,
        premium_price_xp: 5000,
        total_tiers: 50,
        xp_per_tier: 1000,
        is_active: true,
      },
      { onConflict: "season_number" }
    )
    .select()
    .single();

  if (sErr) {
    // fallback: maybe no unique on season_number — try insert/select
    const { data: existing } = await supabase
      .from("battle_pass_seasons")
      .select("*")
      .eq("season_number", seasonNumber)
      .maybeSingle();
    if (!existing) throw sErr;
    return await fillRewards(existing.id);
  }

  return await fillRewards(season.id);
}

async function fillRewards(seasonId: string) {
  // wipe old rewards for this season
  await supabase.from("battle_pass_rewards").delete().eq("season_id", seasonId);

  const rows: any[] = [];
  for (let tier = 1; tier <= 50; tier++) {
    const isMilestone = tier % 10 === 0;
    // free track
    rows.push({
      season_id: seasonId,
      tier,
      track: "free",
      reward_type: tier % 5 === 0 ? "badge" : "xp",
      reward_value: tier % 5 === 0 ? 1 : 50 + tier * 10,
      reward_label: tier % 5 === 0 ? `Free Badge T${tier}` : `${50 + tier * 10} XP`,
      reward_icon: pickIcon(tier),
    });
    // premium track
    rows.push({
      season_id: seasonId,
      tier,
      track: "premium",
      reward_type: isMilestone ? "cosmetic" : tier % 3 === 0 ? "credits" : "xp",
      reward_value: isMilestone ? 1 : tier % 3 === 0 ? 5 + tier : 100 + tier * 25,
      reward_label: isMilestone
        ? `Legendary Cosmetic T${tier}`
        : tier % 3 === 0
        ? `${5 + tier} Credits`
        : `${100 + tier * 25} XP`,
      reward_icon: isMilestone ? "👑" : pickIcon(tier + 3),
    });
  }
  const { error } = await supabase.from("battle_pass_rewards").insert(rows);
  if (error) throw error;
  return { seasonId, rewardCount: rows.length };
}

// ============ CALENDAR SEED ============
async function seedCalendar(monthsAhead: number) {
  const now = new Date();
  let totalRows = 0;

  for (let m = 0; m < monthsAhead; m++) {
    const target = new Date(now.getFullYear(), now.getMonth() + m, 1);
    const year = target.getFullYear();
    const month = target.getMonth() + 1;
    const monthKey = `${year}-${String(month).padStart(2, "0")}`;
    const daysInMonth = new Date(year, month, 0).getDate();

    // wipe + reseed for this month
    await supabase.from("login_calendar_templates").delete().eq("month_key", monthKey);

    const rows = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const isMilestone = day === 7 || day === 14 || day === 21 || day === 30;
      rows.push({
        month_key: monthKey,
        day_number: day,
        reward_type: isMilestone ? (day === 30 ? "premium" : "credits") : "xp",
        reward_value: isMilestone
          ? day === 30
            ? 1
            : 5 + Math.floor(day / 7) * 5
          : 25 + day * 5,
        reward_label: isMilestone
          ? day === 30
            ? "Premium Reward"
            : `${5 + Math.floor(day / 7) * 5} Credits`
          : `${25 + day * 5} XP`,
        reward_icon: isMilestone ? (day === 30 ? "👑" : "💰") : pickIcon(day),
        is_milestone: isMilestone,
      });
    }
    const { error } = await supabase.from("login_calendar_templates").insert(rows);
    if (error) throw error;
    totalRows += rows.length;
  }
  return { totalRows };
}

// ============ QUEST PATH SEED ============
const QUEST_NODES: Array<{ title: string; description: string; reward_type: string; reward_value: number; reward_label: string; icon: string; is_boss?: boolean }> = [
  { title: "Awakening", description: "Complete your first daily login", reward_type: "xp", reward_value: 100, reward_label: "100 XP", icon: "🌅" },
  { title: "First Steps", description: "Make your first post", reward_type: "xp", reward_value: 150, reward_label: "150 XP", icon: "👣" },
  { title: "Social Butterfly", description: "Add 3 friends", reward_type: "credits", reward_value: 5, reward_label: "5 Credits", icon: "🦋" },
  { title: "Explorer", description: "Visit 5 different hubs", reward_type: "xp", reward_value: 250, reward_label: "250 XP", icon: "🧭" },
  { title: "Boss: Trial of Consistency", description: "Maintain a 7-day login streak", reward_type: "credits", reward_value: 25, reward_label: "25 Credits + Badge", icon: "🔥", is_boss: true },
  { title: "Creator Spark", description: "Upload your first media", reward_type: "xp", reward_value: 300, reward_label: "300 XP", icon: "✨" },
  { title: "Engager", description: "Leave 10 comments", reward_type: "xp", reward_value: 350, reward_label: "350 XP", icon: "💬" },
  { title: "Tastemaker", description: "Receive 25 likes", reward_type: "credits", reward_value: 10, reward_label: "10 Credits", icon: "❤️" },
  { title: "Quest Hunter", description: "Complete 5 daily quests", reward_type: "xp", reward_value: 400, reward_label: "400 XP", icon: "🎯" },
  { title: "Boss: Trial of Influence", description: "Reach 100 followers", reward_type: "cosmetic", reward_value: 1, reward_label: "Avatar Frame + 50 Credits", icon: "👹", is_boss: true },
  { title: "Marketplace Initiate", description: "Make your first marketplace transaction", reward_type: "xp", reward_value: 500, reward_label: "500 XP", icon: "🛒" },
  { title: "Guild Member", description: "Join or create a guild", reward_type: "credits", reward_value: 15, reward_label: "15 Credits", icon: "🛡️" },
  { title: "Champion", description: "Reach Silver league", reward_type: "xp", reward_value: 600, reward_label: "600 XP", icon: "🥈" },
  { title: "Helper", description: "Refer a friend who joins", reward_type: "credits", reward_value: 20, reward_label: "20 Credits", icon: "🤝" },
  { title: "Boss: Trial of Mastery", description: "Win a tournament or challenge", reward_type: "cosmetic", reward_value: 1, reward_label: "Legendary Theme + 100 Credits", icon: "🐉", is_boss: true },
  { title: "Veteran", description: "Maintain a 30-day streak", reward_type: "xp", reward_value: 800, reward_label: "800 XP", icon: "🎖️" },
  { title: "Philanthropist", description: "Donate XP to a charity campaign", reward_type: "credits", reward_value: 30, reward_label: "30 Credits", icon: "💝" },
  { title: "Trendsetter", description: "Get a post with 100+ reactions", reward_type: "xp", reward_value: 1000, reward_label: "1000 XP", icon: "📈" },
  { title: "Pro Player", description: "Reach Gold league", reward_type: "credits", reward_value: 50, reward_label: "50 Credits", icon: "🥇" },
  { title: "Final Boss: Path of the Legend", description: "Complete all previous nodes", reward_type: "cosmetic", reward_value: 1, reward_label: "Mythic Crown + 200 Credits + Badge", icon: "👑", is_boss: true },
];

async function seedQuestPath() {
  const seasonNumber = Math.floor(Date.now() / 1000);
  const startsAt = new Date();
  const endsAt = new Date();
  endsAt.setDate(endsAt.getDate() + 90);

  // deactivate previous active paths
  await supabase.from("quest_paths").update({ is_active: false }).eq("is_active", true);

  const { data: path, error: pErr } = await supabase
    .from("quest_paths")
    .insert({
      name: "Path of the Legend — Season 1",
      season_number: seasonNumber,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      is_active: true,
    })
    .select()
    .single();
  if (pErr) throw pErr;

  const rows = QUEST_NODES.map((n, i) => ({
    path_id: path.id,
    node_index: i,
    title: n.title,
    description: n.description,
    icon: n.icon,
    required_xp: i * 100,
    reward_type: n.reward_type,
    reward_value: n.reward_value,
    reward_label: n.reward_label,
    is_boss: n.is_boss || false,
  }));

  const { error: nErr } = await supabase.from("quest_nodes").insert(rows);
  if (nErr) throw nErr;

  return { pathId: path.id, nodeCount: rows.length, bossCount: rows.filter((r) => r.is_boss).length };
}

// ============ LEAGUE SEED ============
async function seedLeague() {
  const startsAt = new Date();
  const endsAt = new Date();
  endsAt.setDate(endsAt.getDate() + 7);

  // deactivate previous active seasons
  await supabase.from("league_seasons").update({ is_active: false }).eq("is_active", true);

  const { data, error } = await supabase
    .from("league_seasons")
    .insert({
      season_number: Math.floor(Date.now() / 1000),
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      is_active: true,
    })
    .select()
    .single();
  if (error) throw error;
  return { seasonId: data.id };
}

export default function AdminRewardsSeed() {
  const [bpStatus, setBpStatus] = useState<Status>("idle");
  const [bpResult, setBpResult] = useState<string>("");
  const [calStatus, setCalStatus] = useState<Status>("idle");
  const [calResult, setCalResult] = useState<string>("");
  const [lgStatus, setLgStatus] = useState<Status>("idle");
  const [lgResult, setLgResult] = useState<string>("");
  const [qpStatus, setQpStatus] = useState<Status>("idle");
  const [qpResult, setQpResult] = useState<string>("");

  const runQp = async () => {
    setQpStatus("running");
    try {
      const r = await seedQuestPath();
      setQpResult(`Vytvorená cesta s ${r.nodeCount} uzlami (${r.bossCount} boss misií).`);
      setQpStatus("done");
      toast.success("Quest Path naplnený");
    } catch (e: any) {
      setQpResult(e.message || "Chyba");
      setQpStatus("error");
      toast.error("Quest Path zlyhal: " + e.message);
    }
  };

  const runBp = async () => {
    setBpStatus("running");
    try {
      const r = await seedBattlePass();
      setBpResult(`Vytvorených ${r.rewardCount} odmien (50 tierov × 2 tracky).`);
      setBpStatus("done");
      toast.success("Battle Pass naplnený");
    } catch (e: any) {
      setBpResult(e.message || "Chyba");
      setBpStatus("error");
      toast.error("Battle Pass zlyhal: " + e.message);
    }
  };

  const runCal = async (months: number) => {
    setCalStatus("running");
    try {
      const r = await seedCalendar(months);
      setCalResult(`Vytvorených ${r.totalRows} dní cez ${months} mesiacov.`);
      setCalStatus("done");
      toast.success("Kalendár naplnený");
    } catch (e: any) {
      setCalResult(e.message || "Chyba");
      setCalStatus("error");
      toast.error("Kalendár zlyhal: " + e.message);
    }
  };

  const runLg = async () => {
    setLgStatus("running");
    try {
      const r = await seedLeague();
      setLgResult(`Nová liga: ${r.seasonId.slice(0, 8)}…`);
      setLgStatus("done");
      toast.success("Liga vytvorená");
    } catch (e: any) {
      setLgResult(e.message || "Chyba");
      setLgStatus("error");
      toast.error("Liga zlyhala: " + e.message);
    }
  };

  const StatusIcon = ({ s }: { s: Status }) => {
    if (s === "running") return <Loader2 className="w-4 h-4 animate-spin" />;
    if (s === "done") return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (s === "error") return <AlertCircle className="w-4 h-4 text-red-500" />;
    return null;
  };

  return (
    <AdminGuard>
      <AdminPageShell>
        <AdminPageHeader
          title="Rewards Seed"
          subtitle="Naplň Battle Pass, Daily Login Calendar a Leagues testovacími dátami."
          icon={Sparkles}
          badge="Admin"
          breadcrumbs={[{ label: "Rewards Seed" }]}
        />

        <AdminGlassCard className="p-4 sm:p-6">
          <Tabs defaultValue="bp" className="w-full">
            <TabsList className="grid grid-cols-4 max-w-2xl">
              <TabsTrigger value="bp">Battle Pass</TabsTrigger>
              <TabsTrigger value="cal">Calendar</TabsTrigger>
              <TabsTrigger value="lg">League</TabsTrigger>
              <TabsTrigger value="qp">Quest Path</TabsTrigger>
            </TabsList>

            <TabsContent value="bp" className="mt-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Battle Pass — Season 1 Genesis</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Vytvorí 60-dňovú sezónu s 50 tiermi × 2 tracky (free + premium) = 100 odmien.
                  Mix XP, kreditov, badge a kosmetiky. Premium = 9.99 € alebo 5000 XP.
                </p>
                <Button onClick={runBp} disabled={bpStatus === "running"} className="gap-2">
                  <StatusIcon s={bpStatus} />
                  {bpStatus === "done" ? "Spustiť znova" : "Naplniť Battle Pass"}
                </Button>
                {bpResult && <p className="text-sm mt-3 text-muted-foreground">{bpResult}</p>}
              </div>
            </TabsContent>

            <TabsContent value="cal" className="mt-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Daily Login Calendar</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Naplní šablóny pre aktuálny + ďalšie mesiace. Dni 7/14/21 = milestone (kredity),
                  deň 30 = premium reward, ostatné = stúpajúce XP.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={() => runCal(1)} disabled={calStatus === "running"} variant="outline" className="gap-2">
                    <StatusIcon s={calStatus} /> Tento mesiac
                  </Button>
                  <Button onClick={() => runCal(3)} disabled={calStatus === "running"} className="gap-2">
                    <StatusIcon s={calStatus} /> 3 mesiace
                  </Button>
                  <Button onClick={() => runCal(12)} disabled={calStatus === "running"} variant="secondary" className="gap-2">
                    <StatusIcon s={calStatus} /> Celý rok
                  </Button>
                </div>
                {calResult && <p className="text-sm mt-3 text-muted-foreground">{calResult}</p>}
              </div>
            </TabsContent>

            <TabsContent value="lg" className="mt-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">League Season</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Vytvorí novú 7-dňovú aktívnu ligu a deaktivuje predchádzajúce.
                </p>
                <Button onClick={runLg} disabled={lgStatus === "running"} className="gap-2">
                  <StatusIcon s={lgStatus} />
                  Štart novej ligy
                </Button>
                {lgResult && <p className="text-sm mt-3 text-muted-foreground">{lgResult}</p>}
              </div>
            </TabsContent>

            <TabsContent value="qp" className="mt-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Quest Path — Path of the Legend</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Vytvorí 90-dňovú aktívnu cestu s 20 uzlami vrátane 4 boss misií
                  (Trial of Consistency, Influence, Mastery, Path of the Legend).
                  Predchádzajúce aktívne cesty sa deaktivujú.
                </p>
                <Button onClick={runQp} disabled={qpStatus === "running"} className="gap-2">
                  <StatusIcon s={qpStatus} />
                  {qpStatus === "done" ? "Spustiť znova" : "Naplniť Quest Path"}
                </Button>
                {qpResult && <p className="text-sm mt-3 text-muted-foreground">{qpResult}</p>}
              </div>
            </TabsContent>
          </Tabs>
        </AdminGlassCard>
      </AdminPageShell>
    </AdminGuard>
  );
}
