import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft, Swords, Trophy, ListOrdered, Users, Layers, EyeOff, Timer,
  Share2, TrendingUp, UserPlus, UsersRound, Code2, Sparkles, Map as MapIcon,
  PieChart, LineChart, MessageCircle, Building2, Brain, Gem,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { brandArenaCall } from "@/hooks/useBrandArenaRouter";
import { useBrandBattleCredits } from "@/hooks/useBrandBattleCredits";
import { handleEdgeError } from "@/lib/handleEdgeError";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

type Feature = {
  id: string;
  title: string;
  desc: string;
  icon: any;
  credits?: number;
  ai?: boolean;
};

const FEATURES: Feature[] = [
  { id: "swipe", title: "Swipe-to-Vote", desc: "Tinder-style head-to-head voting", icon: Swords },
  { id: "brackets", title: "Tournament Brackets", desc: "16/32/64-brand single elimination", icon: Trophy },
  { id: "tier", title: "Tier List Builder", desc: "Drag brands into S/A/B/C/D/F", icon: ListOrdered },
  { id: "multi", title: "Multi-Way Battles", desc: "3, 4 or 6 brand polls", icon: Users },
  { id: "category", title: "Category Battles", desc: "Best in a category (coffee, sneakers…)", icon: Layers },
  { id: "blind", title: "Blind Battles", desc: "Brands without logos — pure vibes", icon: EyeOff },
  { id: "flash", title: "Flash Battles", desc: "60-second timed showdowns", icon: Timer },
  { id: "share", title: "Share-to-Vote", desc: "Unlock extra votes via social shares", icon: Share2 },
  { id: "predictions", title: "Predictions Market", desc: "Stake credits on weekly winners", icon: TrendingUp },
  { id: "duels", title: "Friend Duels", desc: "Private 1v1 voting links", icon: UserPlus },
  { id: "team", title: "Team Battles", desc: "Collective scores, team leaderboard", icon: UsersRound },
  { id: "embed", title: "Embeddable Battles", desc: "Drop a battle into any site", icon: Code2 },
  { id: "ai.battlePost", title: "AI Battle Post", desc: "Auto-generate IG carousel", icon: Sparkles, credits: 4, ai: true },
  { id: "ai.sentimentHeatmap", title: "Sentiment Heatmap", desc: "Regional sentiment map (AI)", icon: MapIcon, credits: 3, ai: true },
  { id: "ai.demoBreakdown", title: "Demographic Breakdown", desc: "Age / gender / region of voters", icon: PieChart, credits: 3, ai: true },
  { id: "ai.trendTimeline", title: "Trend Timeline", desc: "12-month sentiment trend", icon: LineChart, credits: 3, ai: true },
  { id: "reasons", title: "Vote Reason Tags", desc: "Tell us why you voted", icon: MessageCircle },
  { id: "profiles", title: "Public Brand Profiles", desc: "/brand/{slug} stats pages", icon: Building2 },
  { id: "ai.brandAnalyzer", title: "AI Brand Analyzer", desc: "Full SWOT + sentiment", icon: Brain, credits: 5, ai: true },
  { id: "ai.battlePredictor", title: "AI Battle Predictor", desc: "Who will win?", icon: Gem, credits: 3, ai: true },
];

export default function BrandArenaHub() {
  const navigate = useNavigate();
  const { data: credits, refetch } = useBrandBattleCredits();
  const [active, setActive] = useState<Feature | null>(null);
  const [input, setInput] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [output, setOutput] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState<string | null>(null);

  const loadRecords = (f: Feature) => {
    setRecordsLoading(true);
    setRecordsError(null);
    brandArenaCall("records.list", { kind: f.id, limit: 12 })
      .then((r: any) => setRecords(r.records ?? []))
      .catch((e: any) => setRecordsError(e?.message || "Failed to load recent items"))
      .finally(() => setRecordsLoading(false));
  };

  useEffect(() => {
    if (!active) return;
    setOutput(null);
    setRecords([]);
    setRecordsError(null);
    if (!active.ai && active.id !== "embed" && active.id !== "profiles") {
      loadRecords(active);
    }
  }, [active]);

  const run = async () => {
    if (!active) return;
    setBusy(true);
    try {
      if (active.ai) {
        const payload: any = {};
        Object.entries(input).forEach(([k, v]) => (payload[k] = v));
        const res = await brandArenaCall<any>(active.id, payload);
        setOutput(res);
        toast.success("Done!");
        refetch();
      } else if (active.id === "embed") {
        const code = `<iframe src="${window.location.origin}/brand-battle?embed=1" width="100%" height="600" frameborder="0"></iframe>`;
        await navigator.clipboard.writeText(code);
        setOutput({ code });
        toast.success("Embed code copied!");
      } else if (active.id === "profiles") {
        const slug = (input.slug || "").trim().toLowerCase();
        if (!slug) throw new Error("Enter a brand slug");
        navigate(`/brand/${slug}`);
      } else {
        const payload: any = {};
        Object.entries(input).forEach(([k, v]) => (payload[k] = v));
        await brandArenaCall("records.create", {
          kind: active.id,
          payload,
          is_public: true,
        });
        toast.success("Saved!");
        const r = await brandArenaCall<any>("records.list", { kind: active.id, limit: 12 });
        setRecords(r.records ?? []);
        setInput({});
      }
    } catch (err) {
      if (!handleEdgeError(err, { navigate, context: active.title })) {
        toast.error((err as Error).message);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="Arena Hub" intro="Central hub for all 20 Brand Arena features \u2014 sponsorship, campaigns, voting, and more." steps={[
    { title: "Explore modules", desc: "Scroll the grid to see all 20 arena features grouped by purpose." },
    { title: "Open a feature", desc: "Tap any card to jump into that tool (battles, tournaments, sponsors, appeals, analytics\u2026)." },
    { title: "Track credits", desc: "Your Brand Battle credit balance is shown at the top; top up when it runs low." },
    { title: "Follow the flow", desc: "Sponsors register \u2192 launch campaigns \u2192 users vote \u2192 winners get paid." },
    { title: "Need help?", desc: "Every sub-page has its own 'How it works' with detailed steps." }
  ]} />
      <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate("/brand-battle")}>
            <ArrowLeft className="h-4 w-4 mr-2" />Back to Brand Battle
          </Button>
          <Badge variant="outline" className="text-sm">
            {credits?.creditsBalance ?? 0} credits
          </Badge>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Brand Battle Arena Hub
          </h1>
          <p className="text-muted-foreground mt-2">20 next-gen features. AI tools cost credits.</p>
        </div>

        {!active && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <Card
                  className="cursor-pointer hover:border-primary/50 transition-all h-full"
                  onClick={() => setActive(f)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <f.icon className="h-6 w-6 text-primary" />
                      {f.ai && (
                        <Badge variant="secondary" className="text-xs">
                          {f.credits} CR
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-base mt-2">{f.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {active && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <active.icon className="h-6 w-6 text-primary" />
                  <CardTitle>{active.title}</CardTitle>
                  {active.ai && <Badge variant="secondary">{active.credits} credits</Badge>}
                </div>
                <Button variant="ghost" size="sm" onClick={() => setActive(null)}>
                  Close
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">{active.desc}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Inputs per feature */}
              {(active.id === "ai.brandAnalyzer" ||
                active.id === "ai.sentimentHeatmap" ||
                active.id === "ai.demoBreakdown" ||
                active.id === "ai.trendTimeline") && (
                <Input
                  placeholder="Brand name (e.g. Nike)"
                  value={input.brand ?? ""}
                  onChange={(e) => setInput({ ...input, brand: e.target.value })}
                />
              )}
              {(active.id === "ai.battlePredictor" || active.id === "ai.battlePost") && (
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Brand A"
                    value={input.brandA ?? ""}
                    onChange={(e) => setInput({ ...input, brandA: e.target.value })}
                  />
                  <Input
                    placeholder="Brand B"
                    value={input.brandB ?? ""}
                    onChange={(e) => setInput({ ...input, brandB: e.target.value })}
                  />
                  {active.id === "ai.battlePost" && (
                    <Input
                      className="col-span-2"
                      placeholder="Winner"
                      value={input.winner ?? ""}
                      onChange={(e) => setInput({ ...input, winner: e.target.value })}
                    />
                  )}
                </div>
              )}

              {active.id === "swipe" && (
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Brand A" value={input.a ?? ""} onChange={(e) => setInput({ ...input, a: e.target.value })} />
                  <Input placeholder="Brand B" value={input.b ?? ""} onChange={(e) => setInput({ ...input, b: e.target.value })} />
                  <Input className="col-span-2" placeholder="Your pick" value={input.pick ?? ""} onChange={(e) => setInput({ ...input, pick: e.target.value })} />
                </div>
              )}
              {active.id === "brackets" && (
                <>
                  <Input placeholder="Tournament name" value={input.name ?? ""} onChange={(e) => setInput({ ...input, name: e.target.value })} />
                  <Textarea placeholder="Brands (comma-separated, 16/32/64)" value={input.brands ?? ""} onChange={(e) => setInput({ ...input, brands: e.target.value })} />
                </>
              )}
              {active.id === "tier" && (
                <>
                  <Input placeholder="Title (e.g. Sneakers 2026)" value={input.title ?? ""} onChange={(e) => setInput({ ...input, title: e.target.value })} />
                  <Textarea placeholder='JSON tiers e.g. {"S":["Nike"],"A":["Adidas"]}' value={input.tiers ?? ""} onChange={(e) => setInput({ ...input, tiers: e.target.value })} />
                </>
              )}
              {(active.id === "multi" || active.id === "category" || active.id === "blind" || active.id === "flash") && (
                <>
                  <Input placeholder="Question / Category" value={input.q ?? ""} onChange={(e) => setInput({ ...input, q: e.target.value })} />
                  <Textarea placeholder="Brands (comma-separated)" value={input.brands ?? ""} onChange={(e) => setInput({ ...input, brands: e.target.value })} />
                </>
              )}
              {active.id === "share" && (
                <Input placeholder="Share platform (instagram/tiktok/x)" value={input.platform ?? ""} onChange={(e) => setInput({ ...input, platform: e.target.value })} />
              )}
              {active.id === "predictions" && (
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Brand" value={input.brand ?? ""} onChange={(e) => setInput({ ...input, brand: e.target.value })} />
                  <Input type="number" placeholder="Stake credits" value={input.stake ?? ""} onChange={(e) => setInput({ ...input, stake: e.target.value })} />
                </div>
              )}
              {active.id === "duels" && (
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Friend username" value={input.friend ?? ""} onChange={(e) => setInput({ ...input, friend: e.target.value })} />
                  <Input placeholder="Battle topic" value={input.topic ?? ""} onChange={(e) => setInput({ ...input, topic: e.target.value })} />
                </div>
              )}
              {active.id === "team" && (
                <>
                  <Input placeholder="Team name" value={input.team ?? ""} onChange={(e) => setInput({ ...input, team: e.target.value })} />
                  <Input placeholder="Brand you back" value={input.brand ?? ""} onChange={(e) => setInput({ ...input, brand: e.target.value })} />
                </>
              )}
              {active.id === "reasons" && (
                <>
                  <Input placeholder="Brand" value={input.brand ?? ""} onChange={(e) => setInput({ ...input, brand: e.target.value })} />
                  <Textarea placeholder="Why did you vote for this?" value={input.reason ?? ""} onChange={(e) => setInput({ ...input, reason: e.target.value })} />
                </>
              )}
              {active.id === "profiles" && (
                <Input placeholder="brand-slug (e.g. nike)" value={input.slug ?? ""} onChange={(e) => setInput({ ...input, slug: e.target.value })} />
              )}

              <Button onClick={run} disabled={busy} className="w-full">
                {busy ? "Working…" : active.ai ? `Run AI (${active.credits} credits)` : active.id === "embed" ? "Copy embed code" : active.id === "profiles" ? "Open profile" : "Submit"}
              </Button>

              {output && (
                <Card className="bg-muted/30">
                  <CardContent className="pt-4">
                    <pre className="text-xs overflow-auto whitespace-pre-wrap">
                      {typeof output === "string" ? output : JSON.stringify(output, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}

              {!active.ai && active.id !== "embed" && active.id !== "profiles" && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Recent</h3>
                  {recordsLoading && (
                    <div className="space-y-2">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  )}
                  {!recordsLoading && recordsError && (
                    <div className="text-xs p-3 bg-destructive/10 text-destructive rounded border border-destructive/30 flex items-center justify-between gap-2">
                      <span>{recordsError}</span>
                      <Button size="sm" variant="outline" onClick={() => loadRecords(active)}>
                        Retry
                      </Button>
                    </div>
                  )}
                  {!recordsLoading && !recordsError && records.length === 0 && (
                    <p className="text-xs text-muted-foreground">No records yet — be the first to submit.</p>
                  )}
                  {!recordsLoading && !recordsError && records.length > 0 && (
                    <div className="space-y-2">
                      {records.map((r) => (
                        <div key={r.id} className="text-xs p-2 bg-muted/30 rounded border border-border/30">
                          <pre className="whitespace-pre-wrap">{JSON.stringify(r.payload, null, 2)}</pre>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
    </>
  );
}
