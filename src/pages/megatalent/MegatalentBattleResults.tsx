import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Crown, Loader2, Swords, Trophy, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Tournament = {
  id: string;
  category: string;
  status: "signup" | "active" | "completed";
  current_round: number;
  max_participants: number;
  champion_participant_id: string | null;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
};

type Participant = { id: string; submission_id: string; user_id: string; seed: number | null; eliminated_round: number | null };
type Match = {
  id: string; round: number; slot: number;
  participant_a_id: string | null; participant_b_id: string | null;
  votes_a: number; votes_b: number; winner_id: string | null;
  status: "pending" | "open" | "closed"; ends_at: string | null;
};
type Submission = { id: string; title: string; media_url: string; media_type: string; user_id: string };
type Profile = { id: string; full_name: string | null; avatar_url: string | null };

const roundLabel = (round: number, totalRounds: number) => {
  const fromEnd = totalRounds - round;
  if (fromEnd === 0) return "Final";
  if (fromEnd === 1) return "Semi Finals";
  if (fromEnd === 2) return "Quarter Finals";
  return `Round ${round}`;
};

const MegatalentBattleResults = () => {
  const { tournamentId, category } = useParams<{ tournamentId?: string; category?: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selected, setSelected] = useState<Tournament | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [subs, setSubs] = useState<Record<string, Submission>>({});
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let query = supabase.from("battle_royale_tournaments").select("*").order("created_at", { ascending: false });
      if (category) query = query.eq("category", category);
      const { data: tours } = await query.limit(20);
      const list = (tours as Tournament[]) || [];
      setTournaments(list);

      const pick = tournamentId
        ? list.find(t => t.id === tournamentId) || null
        : list.find(t => t.status === "completed") || list[0] || null;
      setSelected(pick);

      if (pick) {
        const [{ data: ps }, { data: ms }] = await Promise.all([
          supabase.from("battle_royale_participants").select("*").eq("tournament_id", pick.id),
          supabase.from("battle_royale_matches").select("*").eq("tournament_id", pick.id).order("round").order("slot"),
        ]);
        const partsArr = (ps as Participant[]) || [];
        const msArr = (ms as Match[]) || [];
        setParticipants(partsArr);
        setMatches(msArr);

        const subIds = partsArr.map(p => p.submission_id);
        if (subIds.length) {
          const { data: subsData } = await supabase
            .from("talent_submissions").select("id,title,media_url,media_type,user_id").in("id", subIds);
          const sMap: Record<string, Submission> = {};
          (subsData || []).forEach((s: any) => { sMap[s.id] = s; });
          setSubs(sMap);

          const userIds = [...new Set((subsData || []).map((s: any) => s.user_id))];
          if (userIds.length) {
            const { data: profs } = await supabase.from("profiles").select("id,full_name,avatar_url").in("id", userIds);
            const pMap: Record<string, Profile> = {};
            (profs || []).forEach((p: any) => { pMap[p.id] = p; });
            setProfiles(pMap);
          }
        }
      } else {
        setParticipants([]); setMatches([]); setSubs({}); setProfiles({});
      }
      setLoading(false);
    };
    load();
  }, [tournamentId, category]);

  const totalRounds = useMemo(() => matches.reduce((m, x) => Math.max(m, x.round), 0), [matches]);
  const roundsMap = useMemo(() => {
    const m = new Map<number, Match[]>();
    matches.forEach(x => { if (!m.has(x.round)) m.set(x.round, []); m.get(x.round)!.push(x); });
    return m;
  }, [matches]);

  const partyName = (pid: string | null) => {
    if (!pid) return "BYE";
    const p = participants.find(x => x.id === pid); if (!p) return "—";
    const s = subs[p.submission_id]; const pr = s ? profiles[s.user_id] : null;
    return pr?.full_name || s?.title || "Talent";
  };
  const partyThumb = (pid: string | null) => {
    if (!pid) return null;
    const p = participants.find(x => x.id === pid); if (!p) return null;
    return subs[p.submission_id] || null;
  };

  const champion = selected?.champion_participant_id
    ? participants.find(p => p.id === selected.champion_participant_id) : null;
  const championSub = champion ? subs[champion.submission_id] : null;
  const championProfile = championSub ? profiles[championSub.user_id] : null;

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-br from-destructive/15 via-primary/10 to-accent/10 border border-border/30 p-6 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Swords className="h-5 w-5 text-destructive" />
            <Badge className="bg-destructive/20 text-destructive border-destructive/30">Battle Royale</Badge>
            {selected && (
              <Badge variant={selected.status === "completed" ? "secondary" : "destructive"} className="ml-auto">
                {selected.status.toUpperCase()}
              </Badge>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Bracket Results {selected?.category ? `· ${selected.category}` : ""}
          </h1>
          {selected && (
            <p className="text-muted-foreground text-sm mt-1">
              {participants.length} fighters · {totalRounds} rounds · started {selected.starts_at ? new Date(selected.starts_at).toLocaleDateString() : "—"}
              {selected.ends_at ? ` · ended ${new Date(selected.ends_at).toLocaleDateString()}` : ""}
            </p>
          )}
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading bracket…
          </div>
        ) : !selected ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">No tournaments yet.</CardContent></Card>
        ) : (
          <>
            {champion && (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="rounded-2xl border border-yellow-500/40 bg-gradient-to-br from-yellow-500/15 to-amber-500/5 p-6 mb-6 text-center">
                <Crown className="h-12 w-12 mx-auto text-yellow-500 mb-2" />
                <div className="text-xs uppercase tracking-widest text-yellow-600/80 mb-1">Champion</div>
                <div className="text-3xl font-black">{championProfile?.full_name || championSub?.title || "Talent"}</div>
                {championSub && (
                  <div className="mt-4 mx-auto max-w-xs aspect-video rounded-xl overflow-hidden border border-yellow-500/30">
                    {championSub.media_type === "video" ? (
                      <video src={championSub.media_url} className="w-full h-full object-cover" controls />
                    ) : (
                      <img src={championSub.media_url} alt={championSub.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                )}
              </motion.div>
            )}

            <Card className="overflow-hidden mb-6">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="h-4 w-4 text-primary" />
                  <h2 className="font-bold">Bracket Tree</h2>
                </div>
                <div className="overflow-x-auto">
                  <div className="flex gap-6 min-w-max pb-2">
                    {Array.from(roundsMap.keys()).sort((a, b) => a - b).map((round) => {
                      const rms = roundsMap.get(round)!;
                      return (
                        <div key={round} className="flex flex-col justify-around gap-4 min-w-[220px]">
                          <div className="text-[10px] uppercase tracking-wide text-muted-foreground text-center sticky top-0">
                            {roundLabel(round, totalRounds)}
                          </div>
                          {rms.map(m => {
                            const total = m.votes_a + m.votes_b;
                            const pctA = total ? Math.round((m.votes_a / total) * 100) : 50;
                            return (
                              <div key={m.id} className="rounded-lg border border-border/40 bg-background/40 overflow-hidden text-xs">
                                {[
                                  { pid: m.participant_a_id, votes: m.votes_a, pct: pctA },
                                  { pid: m.participant_b_id, votes: m.votes_b, pct: 100 - pctA },
                                ].map((side, idx) => {
                                  const isWinner = m.winner_id && m.winner_id === side.pid;
                                  return (
                                    <div key={idx} className={`relative px-2 py-1.5 flex items-center gap-2 ${idx === 0 ? "border-b border-border/40" : ""} ${isWinner ? "bg-yellow-500/10" : ""}`}>
                                      <div className="absolute inset-y-0 left-0 bg-primary/10" style={{ width: `${side.pct}%` }} />
                                      <div className="relative flex items-center gap-2 w-full">
                                        <span className={`flex-1 truncate ${isWinner ? "font-bold" : ""}`}>{partyName(side.pid)}</span>
                                        <span className="text-muted-foreground tabular-nums">{side.votes}</span>
                                        {isWinner && <Trophy className="h-3 w-3 text-yellow-500" />}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden mb-6">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <History className="h-4 w-4 text-primary" />
                  <h2 className="font-bold">Round History</h2>
                </div>
                <div className="space-y-4">
                  {Array.from(roundsMap.keys()).sort((a, b) => a - b).map(round => {
                    const rms = roundsMap.get(round)!;
                    return (
                      <div key={round}>
                        <div className="text-sm font-semibold mb-2">{roundLabel(round, totalRounds)}</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {rms.map(m => {
                            const aThumb = partyThumb(m.participant_a_id);
                            const bThumb = partyThumb(m.participant_b_id);
                            const aWin = m.winner_id === m.participant_a_id;
                            const bWin = m.winner_id === m.participant_b_id;
                            return (
                              <div key={m.id} className="rounded-lg border border-border/40 bg-background/40 p-2 flex items-center gap-2 text-xs">
                                <div className="h-8 w-8 rounded bg-muted overflow-hidden shrink-0">
                                  {aThumb?.media_type === "video" ? <video src={aThumb.media_url} className="w-full h-full object-cover" muted /> : aThumb && <img src={aThumb.media_url} alt="" className="w-full h-full object-cover" />}
                                </div>
                                <span className={`flex-1 truncate ${aWin ? "font-bold" : "text-muted-foreground"}`}>{partyName(m.participant_a_id)}</span>
                                <span className="tabular-nums">{m.votes_a}–{m.votes_b}</span>
                                <span className={`flex-1 truncate text-right ${bWin ? "font-bold" : "text-muted-foreground"}`}>{partyName(m.participant_b_id)}</span>
                                <div className="h-8 w-8 rounded bg-muted overflow-hidden shrink-0">
                                  {bThumb?.media_type === "video" ? <video src={bThumb.media_url} className="w-full h-full object-cover" muted /> : bThumb && <img src={bThumb.media_url} alt="" className="w-full h-full object-cover" />}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {tournaments.length > 1 && (
              <Card>
                <CardContent className="p-5">
                  <h2 className="font-bold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Other tournaments</h2>
                  <div className="flex flex-wrap gap-2">
                    {tournaments.filter(t => t.id !== selected.id).map(t => (
                      <Link key={t.id} to={`/megatalent/battle-results/id/${t.id}`}>
                        <Badge variant="secondary" className="cursor-pointer hover:bg-primary/20">
                          {t.category} · {new Date(t.created_at).toLocaleDateString()} · {t.status}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MegatalentBattleResults;
