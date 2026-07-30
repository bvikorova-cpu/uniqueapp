import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Activity, Bot, Swords, Sparkles, Heart, Clock, Flame, MessageCircle, TrendingUp, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { CloneChatDialog } from "./CloneChatDialog";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

type FeedKind = "battle" | "new" | "milestone" | "date";

interface FeedItem {
  id: string;
  kind: FeedKind;
  title: string;
  detail: string;
  time: string;
  highlight?: string;
}

interface TrendingClone {
  id: string;
  clone_name: string;
  subscription_tier: string;
  total_conversations: number;
  personality_data: any;
}

const FILTERS: { id: FeedKind | "all"; label: string; icon: any }[] = [
  { id: "all", label: "Everything", icon: Activity },
  { id: "battle", label: "Battles", icon: Swords },
  { id: "date", label: "Dates", icon: Heart },
  { id: "new", label: "New clones", icon: Sparkles },
  { id: "milestone", label: "Milestones", icon: Flame },
];

const KIND_STYLE: Record<FeedKind, { icon: any; className: string }> = {
  battle: { icon: Swords, className: "text-accent" },
  new: { icon: Sparkles, className: "text-primary" },
  milestone: { icon: Flame, className: "text-orange-500" },
  date: { icon: Heart, className: "text-pink-500" },
};

export function CloneSocialFeed() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [trending, setTrending] = useState<TrendingClone[]>([]);
  const [filter, setFilter] = useState<FeedKind | "all">("all");
  const [loading, setLoading] = useState(true);
  const [chatClone, setChatClone] = useState<TrendingClone | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const collected: FeedItem[] = [];

    const [battlesRes, clonesRes, datesRes] = await Promise.all([
      supabase
        .from("clone_battles")
        .select("id, topic, winner, user_clone_name, opponent_clone_name, user_score, opponent_score, created_at")
        .order("created_at", { ascending: false })
        .limit(15),
      (supabase as any)
        .from("public_clones")
        .select("id, clone_name, subscription_tier, total_conversations, personality_summary, tone, created_at")
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("clone_dating_sessions")
        .select("id, compatibility_score, status, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    (battlesRes.data ?? []).forEach((b: any) => {
      const winnerName = b.winner === "user" ? b.user_clone_name : b.opponent_clone_name;
      const loserName = b.winner === "user" ? b.opponent_clone_name : b.user_clone_name;
      collected.push({
        id: `battle-${b.id}`,
        kind: "battle",
        title: `${winnerName} defeated ${loserName}`,
        detail: b.topic ? `Debate: ${b.topic}` : "Personality duel in the arena",
        highlight: `${Math.max(b.user_score ?? 0, b.opponent_score ?? 0)}–${Math.min(b.user_score ?? 0, b.opponent_score ?? 0)}`,
        time: b.created_at,
      });
    });

    const clones = (clonesRes.data ?? []) as any[];
    clones.slice(0, 12).forEach((c) => {
      collected.push({
        id: `new-${c.id}`,
        kind: "new",
        title: `${c.clone_name} joined the network`,
        detail: c.personality_summary || (c.tone ? `Tone: ${c.tone}` : "A brand new AI personality"),
        time: c.created_at,
      });
      if ((c.total_conversations ?? 0) >= 10) {
        collected.push({
          id: `mile-${c.id}`,
          kind: "milestone",
          title: `${c.clone_name} passed ${c.total_conversations} conversations`,
          detail: "One of the most talked-to clones this week",
          highlight: `${c.total_conversations}`,
          time: c.created_at,
        });
      }
    });

    (datesRes.data ?? []).forEach((d: any) => {
      collected.push({
        id: `date-${d.id}`,
        kind: "date",
        title: d.compatibility_score != null ? `A speed date scored ${d.compatibility_score}% chemistry` : "Two clones went on a date",
        detail: d.status === "completed" ? "The transcript is in the Dating lab" : "The date is still running",
        highlight: d.compatibility_score != null ? `${d.compatibility_score}%` : undefined,
        time: d.created_at,
      });
    });

    collected.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    setItems(collected.slice(0, 40));
    setTrending(
      [...clones]
        .sort((a, b) => (b.total_conversations ?? 0) - (a.total_conversations ?? 0))
        .slice(0, 5)
        .map((c) => ({
          id: c.id,
          clone_name: c.clone_name,
          subscription_tier: c.subscription_tier,
          total_conversations: c.total_conversations ?? 0,
          personality_data: { personality: c.personality_summary, tone: c.tone },
        })),
    );
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Live updates whenever a new battle lands in the arena.
  useEffect(() => {
    const channel = supabase
      .channel("clone-network-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "clone_battles" }, () => { load(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  const visible = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.kind === filter)),
    [items, filter],
  );

  return (
    <>
      <FloatingHowItWorks
        title="Clone Network Feed - How it works"
        steps={[
          { title: "Watch the network", desc: "See live battles, dates, new clones and milestones from real users." },
          { title: "Filter", desc: "Switch between battles, dates, new clones and milestones." },
          { title: "Trending", desc: "The trending list ranks clones by how much people talk to them." },
          { title: "Jump in", desc: "Start a chat with any trending clone straight from the feed." },
        ]}
      />
      <div className="space-y-6">
        <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" /> Clone Network Feed
              </CardTitle>
              <CardDescription>Everything happening across the clone network, updated live.</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={load} aria-label="Refresh feed">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    filter === f.id ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <f.icon className="h-3 w-3" /> {f.label}
                </button>
              ))}
            </div>

            {visible.length === 0 ? (
              <div className="py-10 text-center">
                <Activity className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  {loading ? "Loading the network..." : "Nothing here yet — start a battle to open the feed."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {visible.map((item, i) => {
                    const style = KIND_STYLE[item.kind];
                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: Math.min(i * 0.03, 0.3) }}
                        className="flex items-start gap-3 rounded-xl border border-border/50 bg-background/50 p-3"
                      >
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <style.icon className={`h-4 w-4 ${style.className}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold">{item.title}</p>
                          <p className="truncate text-xs text-muted-foreground">{item.detail}</p>
                          <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(item.time), { addSuffix: true })}
                          </div>
                        </div>
                        {item.highlight && (
                          <Badge variant="outline" className="shrink-0">{item.highlight}</Badge>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>

        {trending.length > 0 && (
          <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-primary" /> Trending clones
              </CardTitle>
              <CardDescription>The most talked-to personalities right now.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {trending.map((c, i) => (
                <div key={c.id} className="flex items-center gap-3 rounded-lg border border-border/50 bg-background/50 p-2.5">
                  <span className="w-5 text-sm font-black text-muted-foreground">{i + 1}</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{c.clone_name}</p>
                    <p className="text-[10px] text-muted-foreground">{c.total_conversations} conversations</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => { setChatClone(c); setChatOpen(true); }}>
                    <MessageCircle className="mr-1 h-3 w-3" /> Chat
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <CloneChatDialog open={chatOpen} onOpenChange={setChatOpen} clone={chatClone as any} />
      </div>
    </>
  );
}
