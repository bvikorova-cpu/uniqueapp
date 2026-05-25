import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Radio, Loader2 } from "lucide-react";
import IQSpectatorView from "./IQSpectatorView";

interface ActiveDuel {
  id: string;
  host_id: string;
  opponent_id: string | null;
  host_score: number;
  opponent_score: number;
  mode: string;
  started_at: string | null;
  questions: unknown;
}

interface ProfileLite {
  id: string;
  full_name: string | null;
}

/**
 * Public lobby of currently-running IQ duels.
 * Anyone can click "Watch" to join a live spectator view (read-only + chat).
 */
export default function IQLiveSpectatorLobby() {
  const [duels, setDuels] = useState<ActiveDuel[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [watching, setWatching] = useState<string | null>(null);
  const [me, setMe] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data.user;
      if (!u) return;
      const { data: prof } = await supabase
        .from("profiles_public" as any).select("full_name")
        .eq("id", u.id)
        .maybeSingle();
      setMe({ id: u.id, name: prof?.full_name ?? "Spectator" });
    });
  }, []);

  const load = async () => {
    const { data } = await supabase
      .from("iq_duels")
      .select("id,host_id,opponent_id,host_score,opponent_score,mode,started_at,questions")
      .eq("status", "active")
      .order("started_at", { ascending: false })
      .limit(20);
    const list = (data ?? []) as ActiveDuel[];
    setDuels(list);
    const ids = Array.from(new Set(list.flatMap((d) => [d.host_id, d.opponent_id]).filter(Boolean) as string[]));
    if (ids.length) {
      const { data: profs } = await (supabase as any).from("profiles_public").select("id,full_name").in("id", ids);
      const map: Record<string, string> = {};
      for (const p of (profs ?? []) as ProfileLite[]) map[p.id] = p.full_name ?? "Player";
      setProfiles(map);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("iq-duels-lobby")
      .on("postgres_changes", { event: "*", schema: "public", table: "iq_duels" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  return (
    <div className="mb-8">
      <h2 className="text-xl sm:text-2xl font-black mb-4 flex items-center gap-2">
        <Radio className="h-5 w-5 text-red-500 animate-pulse" /> Live Now — Spectate Duels
      </h2>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : duels.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            No live duels right now. Check back soon — or start one yourself!
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence>
            {duels.map((d) => {
              const total = Array.isArray(d.questions) ? (d.questions as unknown[]).length : 0;
              return (
                <motion.div
                  key={d.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20 hover:shadow-lg transition-all">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="capitalize text-[10px]">{d.mode}</Badge>
                        <span className="text-[10px] text-red-500 font-semibold flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm font-bold">
                        <span className="truncate flex-1">{profiles[d.host_id] ?? "Player"}</span>
                        <span className="px-2 text-base">
                          {d.host_score} <span className="text-muted-foreground">vs</span> {d.opponent_score}
                        </span>
                        <span className="truncate flex-1 text-right">{(d.opponent_id && profiles[d.opponent_id]) || "—"}</span>
                      </div>
                      {total > 0 && (
                        <div className="text-[10px] text-center text-muted-foreground">{total} questions</div>
                      )}
                      <Button
                        size="sm"
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                        disabled={!me}
                        onClick={() => setWatching(d.id)}
                      >
                        <Eye className="h-3 w-3 mr-1" /> Watch live
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {watching && me && (
        <IQSpectatorView
          duelId={watching}
          myUserId={me.id}
          myName={me.name}
          onClose={() => setWatching(null)}
        />
      )}
    </div>
  );
}
