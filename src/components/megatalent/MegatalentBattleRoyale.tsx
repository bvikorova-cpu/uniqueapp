import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Swords, Trophy, Loader2, Crown, ChevronRight, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";

type Tournament = {
  id: string;
  category: string;
  status: "signup" | "active" | "completed";
  current_round: number;
  max_participants: number;
  champion_participant_id: string | null;
};

type Participant = {
  id: string;
  submission_id: string;
  user_id: string;
  seed: number | null;
  eliminated_round: number | null;
};

type Match = {
  id: string;
  round: number;
  slot: number;
  participant_a_id: string | null;
  participant_b_id: string | null;
  votes_a: number;
  votes_b: number;
  winner_id: string | null;
  status: "pending" | "open" | "closed";
  ends_at: string | null;
};

type SubmissionLite = {
  id: string;
  title: string;
  media_url: string;
  media_type: string;
  user_id: string;
};

type ProfileLite = { id: string; full_name: string | null; avatar_url: string | null };

const MegatalentBattleRoyale = ({ category, categories }: { category?: string; categories?: string[] }) => {
  const [loading, setLoading] = useState(true);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, SubmissionLite>>({});
  const [profiles, setProfiles] = useState<Record<string, ProfileLite>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [myVotes, setMyVotes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [advancing, setAdvancing] = useState(false);

  const cat = category;

  const load = useCallback(async () => {
    if (!cat) return;
    setLoading(true);

    const { data: user } = await supabase.auth.getUser();
    setUserId(user.user?.id ?? null);

    const { data: tours } = await supabase
      .from("battle_royale_tournaments")
      .select("*")
      .eq("category", cat)
      .in("status", ["signup", "active"])
      .order("created_at", { ascending: false })
      .limit(1);

    const tour = (tours?.[0] as Tournament) || null;
    setTournament(tour);

    if (!tour) {
      setParticipants([]); setMatches([]); setSubmissions({}); setProfiles({});
      setLoading(false);
      return;
    }

    const [{ data: parts }, { data: ms }] = await Promise.all([
      supabase.from("battle_royale_participants").select("*").eq("tournament_id", tour.id),
      supabase.from("battle_royale_matches").select("*").eq("tournament_id", tour.id).order("round").order("slot"),
    ]);

    const partsArr = (parts as Participant[]) || [];
    const msArr = (ms as Match[]) || [];
    setParticipants(partsArr);
    setMatches(msArr);

    const subIds = partsArr.map(p => p.submission_id);
    if (subIds.length) {
      const { data: subs } = await supabase
        .from("talent_submissions")
        .select("id,title,media_url,media_type,user_id")
        .in("id", subIds);
      const sMap: Record<string, SubmissionLite> = {};
      (subs || []).forEach((s: any) => { sMap[s.id] = s; });
      setSubmissions(sMap);

      const userIds = [...new Set((subs || []).map((s: any) => s.user_id))];
      if (userIds.length) {
        const { data: profs } = await (supabase as any)
          .from("profiles_public").select("id,full_name,avatar_url").in("id", userIds);
        const pMap: Record<string, ProfileLite> = {};
        (profs || []).forEach((p: any) => { pMap[p.id] = p; });
        setProfiles(pMap);
      }
    }

    if (user.user?.id && msArr.length) {
      const { data: votes } = await supabase
        .from("battle_royale_votes")
        .select("match_id, voted_for_participant_id")
        .eq("user_id", user.user.id)
        .in("match_id", msArr.map(m => m.id));
      const vMap: Record<string, string> = {};
      (votes || []).forEach((v: any) => { vMap[v.match_id] = v.voted_for_participant_id; });
      setMyVotes(vMap);
    } else {
      setMyVotes({});
    }

    setLoading(false);
  }, [cat]);

  useEffect(() => { load(); }, [load]);

  const startTournament = async () => {
    if (!cat) return;
    setStarting(true);
    const { data, error } = await supabase.rpc("start_battle_royale", { _category: cat, _max: 16, _round_hours: 24 });
    setStarting(false);
    if (error) { toast.error("Failed to start", { description: error.message }); return; }
    toast.success("Battle Royale started!");
    await load();
  };

  const advanceRound = async () => {
    if (!tournament) return;
    setAdvancing(true);
    const { error } = await supabase.rpc("advance_battle_royale", { _tournament_id: tournament.id, _round_hours: 24 });
    setAdvancing(false);
    if (error) { toast.error("Failed to advance", { description: error.message }); return; }
    toast.success("Next round generated");
    await load();
  };

  const vote = async (match: Match, participantId: string) => {
    if (!userId) { toast.error("Login required to vote"); return; }
    if (myVotes[match.id]) { toast.info("You already voted in this match"); return; }
    setBusyId(match.id);
    const { error } = await supabase.from("battle_royale_votes").insert({
      match_id: match.id,
      user_id: userId,
      voted_for_participant_id: participantId,
    });
    setBusyId(null);
    if (error) { toast.error("Vote failed", { description: error.message }); return; }
    setMyVotes(prev => ({ ...prev, [match.id]: participantId }));
    setMatches(prev => prev.map(m => {
      if (m.id !== match.id) return m;
      if (participantId === m.participant_a_id) return { ...m, votes_a: m.votes_a + 1 };
      if (participantId === m.participant_b_id) return { ...m, votes_b: m.votes_b + 1 };
      return m;
    }));
  };

  const partyName = (pid: string | null) => {
    if (!pid) return "BYE";
    const p = participants.find(x => x.id === pid);
    if (!p) return "—";
    const sub = submissions[p.submission_id];
    const prof = sub ? profiles[sub.user_id] : null;
    return prof?.full_name || sub?.title || "Talent";
  };

  const partyThumb = (pid: string | null) => {
    if (!pid) return null;
    const p = participants.find(x => x.id === pid);
    if (!p) return null;
    return submissions[p.submission_id] || null;
  };

  const currentMatches = tournament ? matches.filter(m => m.round === tournament.current_round) : [];
  const allDecided = currentMatches.length > 0 && currentMatches.every(m =>
    m.winner_id || !m.participant_b_id || (m.ends_at && new Date(m.ends_at) < new Date())
  );
  const champion = tournament?.champion_participant_id ? participants.find(p => p.id === tournament.champion_participant_id) : null;

  return (
    <Card className="overflow-hidden backdrop-blur-xl bg-gradient-to-br from-destructive/10 via-primary/5 to-accent/10 border-border/30">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Swords className="h-5 w-5 text-destructive" />
          <h3 className="text-lg font-bold">Live Battle Royale</h3>
          {tournament && (
            <Badge variant={tournament.status === "active" ? "destructive" : "secondary"} className={tournament.status === "active" ? "ml-auto animate-pulse" : "ml-auto"}>
              {tournament.status === "active" ? `ROUND ${tournament.current_round} · LIVE` : tournament.status.toUpperCase()}
            </Badge>
          )}
          {cat && (
            <Link to={`/megatalent/battle-results/${cat}`} className="text-xs text-primary inline-flex items-center gap-1 hover:underline">
              Results <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading bracket…
          </div>
        ) : !tournament ? (
          <div className="text-center py-8 space-y-3">
            <p className="text-sm text-muted-foreground">No active tournament. Seed top 16 submissions to begin.</p>
            <Button onClick={startTournament} disabled={starting || !cat}>
              {starting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Starting…</> : "Start Battle Royale"}
            </Button>
          </div>
        ) : champion ? (
          <div className="text-center py-8 space-y-2">
            <Crown className="h-10 w-10 mx-auto text-yellow-500" />
            <div className="text-xl font-black">{partyName(champion.id)}</div>
            <div className="text-sm text-muted-foreground">Battle Royale Champion 🏆</div>
            <Button variant="secondary" onClick={startTournament} disabled={starting} className="mt-3">
              Start new tournament
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
              <span>{participants.length} fighters · {currentMatches.length} matches this round</span>
              {allDecided && (
                <Button size="sm" variant="default" onClick={advanceRound} disabled={advancing} className="gap-1">
                  {advancing ? <Loader2 className="h-3 w-3 animate-spin" /> : <ChevronRight className="h-3 w-3" />}
                  Next round
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <AnimatePresence>
                {currentMatches.map((m) => {
                  const myVote = myVotes[m.id];
                  const total = m.votes_a + m.votes_b;
                  const pctA = total ? Math.round((m.votes_a / total) * 100) : 50;
                  const pctB = 100 - pctA;
                  const aThumb = partyThumb(m.participant_a_id);
                  const bThumb = partyThumb(m.participant_b_id);
                  return (
                    <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="rounded-xl border border-border/40 bg-background/50 p-3">
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Match {m.slot + 1}</div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { side: "a" as const, pid: m.participant_a_id, thumb: aThumb, pct: pctA, votes: m.votes_a },
                          { side: "b" as const, pid: m.participant_b_id, thumb: bThumb, pct: pctB, votes: m.votes_b },
                        ].map(({ side, pid, thumb, pct, votes }) => {
                          const isWinner = m.winner_id && m.winner_id === pid;
                          const isMine = myVote && myVote === pid;
                          const disabled = !pid || !!myVote || m.status !== "open" || busyId === m.id;
                          return (
                            <button
                              key={side}
                              onClick={() => pid && vote(m, pid)}
                              disabled={disabled}
                              className={`relative overflow-hidden rounded-lg border text-left p-2 transition ${
                                isWinner ? "border-yellow-500 bg-yellow-500/10" :
                                isMine ? "border-primary bg-primary/10" :
                                "border-border/40 hover:border-primary/60"
                              } ${disabled && !isMine && !isWinner ? "opacity-60" : ""}`}
                            >
                              <div className="absolute inset-y-0 left-0 bg-primary/15 transition-all" style={{ width: `${pct}%` }} />
                              <div className="relative flex items-center gap-2">
                                <div className="h-10 w-10 rounded-md bg-muted overflow-hidden shrink-0">
                                  {thumb?.media_type === "video" ? (
                                    <video src={thumb.media_url} className="w-full h-full object-cover" muted playsInline />
                                  ) : thumb ? (
                                    <img src={thumb.media_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                                  ) : null}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-semibold truncate">{partyName(pid)}</div>
                                  <div className="text-[10px] text-muted-foreground">{votes} votes · {pct}%</div>
                                </div>
                                {isWinner && <Trophy className="h-4 w-4 text-yellow-500 shrink-0" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MegatalentBattleRoyale;
