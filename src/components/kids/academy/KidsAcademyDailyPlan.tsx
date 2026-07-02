import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Loader2, Flame, Trophy, Lightbulb, Coins } from "lucide-react";
import { toast } from "sonner";
import { kidsHubCall, useKidsAcademyCredits, useKidsAcademyXP, useKidsFamilyLeaderboard, KIDS_HUB_COSTS } from "@/hooks/useKidsAcademyHub";
import { useKidsChildren } from "@/hooks/useKidsRouter";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export function KidsAcademyDailyPlan() {
  const { activeChild, activeId } = useKidsChildren();
  const { balance, purchase, refresh: refreshCredits } = useKidsAcademyCredits();
  const { data: xp } = useKidsAcademyXP(activeId);
  const { data: leaderboard } = useKidsFamilyLeaderboard();
  const [plan, setPlan] = useState<any>(null);
  const [recs, setRecs] = useState<any>(null);
  const [digest, setDigest] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const ensureCredits = async (need: number) => {
    if (balance < need) {
      toast.error(`Need ${need} credits (have ${balance}). Opening checkout...`);
      const url = await purchase(50);
      if (url) window.location.href = url;
      return false;
    }
    return true;
  };

  const generatePlan = async () => {
    if (!activeId) return toast.error("Pick a child first");
    if (!(await ensureCredits(KIDS_HUB_COSTS.dailyPlan))) return;
    setLoading("plan");
    try {
      const res = await kidsHubCall<{ plan: any }>("hub.dailyPlan", { child_id: activeId, age: activeChild?.age ?? 8 });
      setPlan(res.plan);
      refreshCredits();
    } catch (e: any) { toast.error(e.message); }
    setLoading(null);
  };

  const toggleItem = async (itemId: string) => {
    if (!activeId || !plan) return;
    const res = await kidsHubCall<{ completed_items: string[] }>("hub.completeItem", { child_id: activeId, item_id: itemId });
    setPlan({ ...plan, completed_items: res.completed_items });
    // award XP
    const item = plan.plan_json?.items?.find((i: any) => i.id === itemId);
    if (item) {
      await kidsHubCall("hub.logActivity", { child_id: activeId, section: item.section, action: "plan.complete", xp: item.xp ?? 10 });
      toast.success(`+${item.xp ?? 10} XP!`);
    }
  };

  const getRecs = async () => {
    if (!activeId) return;
    if (!(await ensureCredits(KIDS_HUB_COSTS.recommendations))) return;
    setLoading("recs");
    try {
      const res = await kidsHubCall<any>("hub.recommendations", { child_id: activeId });
      setRecs(res);
      refreshCredits();
    } catch (e: any) { toast.error(e.message); }
    setLoading(null);
  };

  const getDigest = async () => {
    if (!(await ensureCredits(KIDS_HUB_COSTS.parentDigest))) return;
    setLoading("digest");
    try {
      const res = await kidsHubCall<any>("hub.parentDigest");
      setDigest(res.digest);
      refreshCredits();
    } catch (e: any) { toast.error(e.message); }
    setLoading(null);
  };

  const items = plan?.plan_json?.items ?? [];
  const done: string[] = plan?.completed_items ?? [];

  return (
    <>
      <FloatingHowItWorks title={"Kids Academy Daily Plan - How it works"} steps={[{ title: 'Open', desc: 'Access the Kids Academy Daily Plan section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Kids Academy Daily Plan.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-4">
      {/* XP + Streak + Credits header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-primary/20 to-accent/10">
          <CardContent className="p-4 text-center">
            <Trophy className="w-5 h-5 mx-auto mb-1 text-primary" />
            <div className="text-2xl font-bold">{xp?.total_xp ?? 0}</div>
            <div className="text-xs text-muted-foreground">Total XP</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Sparkles className="w-5 h-5 mx-auto mb-1 text-accent" />
            <div className="text-2xl font-bold">Lv {xp?.level ?? 1}</div>
            <div className="text-xs text-muted-foreground">Level</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="w-5 h-5 mx-auto mb-1 text-orange-500" />
            <div className="text-2xl font-bold">{xp?.current_streak ?? 0}</div>
            <div className="text-xs text-muted-foreground">Day streak</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Coins className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
            <div className="text-2xl font-bold">{balance}</div>
            <div className="text-xs text-muted-foreground">Hub credits</div>
          </CardContent>
        </Card>
      </div>

      {/* Daily plan */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" /> Today's AI plan
          </CardTitle>
          <Button size="sm" onClick={generatePlan} disabled={loading === "plan" || !activeId}>
            {loading === "plan" ? <Loader2 className="w-4 h-4 animate-spin" /> : `Generate (${KIDS_HUB_COSTS.dailyPlan})`}
          </Button>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No plan yet. Generate one for {activeChild?.name ?? "your child"}.</p>
          ) : (
            <ul className="space-y-2">
              {items.map((it: any) => (
                <li key={it.id} className="flex items-center gap-3 p-2 rounded border bg-card/50">
                  <Checkbox checked={done.includes(it.id)} onCheckedChange={() => !done.includes(it.id) && toggleItem(it.id)} />
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${done.includes(it.id) ? "line-through text-muted-foreground" : ""}`}>{it.title}</div>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">{it.section}</Badge>
                      <Badge variant="outline" className="text-xs">{it.duration_min}min · +{it.xp} XP</Badge>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2"><Lightbulb className="w-5 h-5 text-yellow-500" /> Smart recommendations</CardTitle>
          <Button size="sm" variant="outline" onClick={getRecs} disabled={loading === "recs" || !activeId}>
            {loading === "recs" ? <Loader2 className="w-4 h-4 animate-spin" /> : `Suggest (${KIDS_HUB_COSTS.recommendations})`}
          </Button>
        </CardHeader>
        <CardContent>
          {recs?.recommendations?.length ? (
            <ul className="space-y-2">
              {recs.recommendations.map((r: any, i: number) => (
                <li key={i} className="p-2 rounded border bg-card/50">
                  <div className="text-sm font-medium">{r.title}</div>
                  <div className="text-xs text-muted-foreground">{r.reason}</div>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">{r.section}</Badge>
                    <Badge variant="outline" className="text-xs">+{r.expected_xp ?? 0} XP</Badge>
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-muted-foreground">AI looks at recent activity and suggests next best steps.</p>}
        </CardContent>
      </Card>

      {/* Family leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-500" /> Family leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          {leaderboard?.length ? (
            <ul className="space-y-1">
              {leaderboard.map((row: any, i: number) => (
                <li key={row.child_id} className="flex items-center justify-between text-sm p-2 rounded bg-card/50">
                  <span>#{i + 1} · Child {row.child_id.slice(0, 6)}</span>
                  <span className="flex gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary">{row.total_xp} XP</Badge>
                    <Badge variant="outline">Lv {row.level}</Badge>
                    <Badge variant="outline" className="text-orange-500">🔥 {row.current_streak}</Badge>
                  </span>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-muted-foreground">No activity yet across children.</p>}
        </CardContent>
      </Card>

      {/* Parent weekly digest */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Parent weekly digest</CardTitle>
          <Button size="sm" variant="outline" onClick={getDigest} disabled={loading === "digest"}>
            {loading === "digest" ? <Loader2 className="w-4 h-4 animate-spin" /> : `Generate (${KIDS_HUB_COSTS.parentDigest})`}
          </Button>
        </CardHeader>
        <CardContent>
          {digest ? (
            <div className="space-y-2 text-sm">
              <p className="font-medium">{digest.summary}</p>
              {digest.highlights?.length > 0 && <div><span className="font-semibold">✨ Highlights:</span> {digest.highlights.join(", ")}</div>}
              {digest.concerns?.length > 0 && <div><span className="font-semibold">⚠ Concerns:</span> {digest.concerns.join(", ")}</div>}
              {digest.suggestions?.length > 0 && <div><span className="font-semibold">💡 Try next:</span> {digest.suggestions.join(", ")}</div>}
            </div>
          ) : <p className="text-sm text-muted-foreground">AI summary of the past week across all children.</p>}
        </CardContent>
      </Card>
    </div>
    </>
  );
}
