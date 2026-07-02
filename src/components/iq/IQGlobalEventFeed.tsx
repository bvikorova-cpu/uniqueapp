import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Crown, Flame, Swords, Trophy, Zap } from "lucide-react";
import { Link } from "react-router-dom";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
type EventType = "duel_started" | "duel_won" | "tournament_won" | "tier_up" | "streak_milestone";

interface FeedEvent {
  id: string;
  type: EventType;
  userId?: string;
  userName?: string;
  detail?: string;
  ts: number;
}

const ICONS: Record<EventType, JSX.Element> = {
  duel_started: <Swords className="h-3.5 w-3.5 text-blue-500" />,
  duel_won: <Zap className="h-3.5 w-3.5 text-amber-500" />,
  tournament_won: <Trophy className="h-3.5 w-3.5 text-amber-500" />,
  tier_up: <Crown className="h-3.5 w-3.5 text-purple-500" />,
  streak_milestone: <Flame className="h-3.5 w-3.5 text-orange-500" />,
};

const VERBS: Record<EventType, string> = {
  duel_started: "started a duel",
  duel_won: "won a duel",
  tournament_won: "won a tournament match",
  tier_up: "reached a new tier",
  streak_milestone: "hit a streak milestone",
};

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

/**
 * Realtime cross-user IQ activity feed using Postgres changes.
 * Aggregates events from iq_duels (insert + finished updates),
 * iq_tournament_matches (winner_id update), iq_user_stats (tier change),
 * and iq_daily_streaks (milestone claims).
 */
export default function IQGlobalEventFeed() {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [nameMap, setNameMap] = useState<Record<string, string>>({});

  const resolveName = async (userId: string) => {
    if (!userId || nameMap[userId]) return nameMap[userId];
    const { data } = await supabase
      .from("profiles")
      .select("id,full_name")
      .eq("id", userId)
      .maybeSingle();
    const name = data?.full_name ?? "Player";
    setNameMap((m) => ({ ...m, [userId]: name }));
    return name;
  };

  const push = (e: Omit<FeedEvent, "id" | "ts">) => {
    setEvents((prev) =>
      [{ ...e, id: crypto.randomUUID(), ts: Date.now() }, ...prev].slice(0, 25),
    );
  };

  useEffect(() => {
    let mounted = true;

    // Seed with a few recent finished duels
    (async () => {
      const { data } = await supabase
        .from("iq_duels")
        .select("id,winner_id,host_id,opponent_id,status,created_at")
        .eq("status", "finished")
        .order("created_at", { ascending: false })
        .limit(5);
      if (!mounted || !data) return;
      for (const d of data) {
        if (!d.winner_id) continue;
        const name = await resolveName(d.winner_id);
        push({ type: "duel_won", userId: d.winner_id, userName: name });
      }
    })();

    const ch = supabase
      .channel("iq-global-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "iq_duels" }, async (p) => {
        const row = p.new as { host_id: string };
        const name = await resolveName(row.host_id);
        push({ type: "duel_started", userId: row.host_id, userName: name });
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "iq_duels" }, async (p) => {
        const row = p.new as { status: string; winner_id: string | null };
        if (row.status === "finished" && row.winner_id) {
          const name = await resolveName(row.winner_id);
          push({ type: "duel_won", userId: row.winner_id, userName: name });
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "iq_tournament_matches" }, async (p) => {
        const row = p.new as { winner_id: string | null };
        if (row.winner_id) {
          const name = await resolveName(row.winner_id);
          push({ type: "tournament_won", userId: row.winner_id, userName: name });
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "iq_user_stats" }, async (p) => {
        const oldRow = p.old as { tier?: string };
        const newRow = p.new as { tier?: string; user_id: string };
        if (oldRow.tier && newRow.tier && oldRow.tier !== newRow.tier) {
          const name = await resolveName(newRow.user_id);
          push({ type: "tier_up", userId: newRow.user_id, userName: name, detail: newRow.tier });
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "iq_daily_streaks" }, async (p) => {
        const row = p.new as { user_id: string; current_streak: number };
        if ([3, 7, 14, 30].includes(row.current_streak)) {
          const name = await resolveName(row.user_id);
          push({ type: "streak_milestone", userId: row.user_id, userName: name, detail: `${row.current_streak}d` });
        }
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <FloatingHowItWorks title="How IQGlobal Event Feed works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/5 border-purple-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <motion.span
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="inline-block h-2 w-2 rounded-full bg-red-500"
            />
            <Activity className="h-4 w-4" /> Live Activity
          </span>
          <Badge variant="outline" className="text-[10px]">{events.length} events</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-72 overflow-y-auto px-4 pb-4 space-y-1.5">
          {events.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">Waiting for activity…</p>
          ) : (
            <AnimatePresence initial={false}>
              {events.map((e) => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-xs p-2 rounded-md bg-muted/30 border border-border/30"
                >
                  {ICONS[e.type]}
                  <span className="flex-1 truncate">
                    {e.userId ? (
                      <Link to={`/iq-platform/profile/${e.userId}`} className="font-semibold hover:text-primary hover:underline">
                        {e.userName ?? "Player"}
                      </Link>
                    ) : (
                      <span className="font-semibold">{e.userName ?? "Player"}</span>
                    )}{" "}
                    <span className="text-muted-foreground">{VERBS[e.type]}</span>
                    {e.detail && <span className="ml-1 font-semibold text-primary">{e.detail}</span>}
                  </span>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">{timeAgo(e.ts)}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </CardContent>
    </Card>
    </>
    );
}
