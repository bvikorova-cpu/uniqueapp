import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Crown, Loader2, Swords, Trophy, History, Share2, AlertCircle, RefreshCw, ImageOff, Inbox } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

const MediaThumb = ({ sub, className }: { sub: Submission | null; className: string }) => {
  const [broken, setBroken] = useState(false);
  if (!sub || !sub.media_url || broken) {
    return (
      <div className={`${className} flex items-center justify-center bg-muted text-muted-foreground`}>
        <ImageOff className="h-3.5 w-3.5" />
      </div>
    );
  }
  if (sub.media_type === "video") {
    return <video src={sub.media_url} className={`${className} object-cover`} muted playsInline onError={() => setBroken(true)} />;
  }
  return <img src={sub.media_url} alt={sub.title || ""} className={`${className} object-cover`} loading="lazy" onError={() => setBroken(true)} />;
};

const MegatalentBattleResults = () => {
  const { tournamentId, category } = useParams<{ tournamentId?: string; category?: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selected, setSelected] = useState<Tournament | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [subs, setSubs] = useState<Record<string, Submission>>({});
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const selectedIdRef = useRef<string | null>(null);

  const fetchTournaments = useCallback(async () => {
    let query = supabase.from("battle_royale_tournaments").select("*").order("created_at", { ascending: false });
    if (category) query = query.eq("category", category);
    const { data, error: e } = await query.limit(50);
    if (e) throw e;
    return (data as Tournament[]) || [];
  }, [category]);

  const fetchTournamentDetails = useCallback(async (t: Tournament) => {
    const [pr, mr] = await Promise.all([
      supabase.from("battle_royale_participants").select("*").eq("tournament_id", t.id),
      supabase.from("battle_royale_matches").select("*").eq("tournament_id", t.id).order("round").order("slot"),
    ]);
    if (pr.error) throw pr.error;
    if (mr.error) throw mr.error;
    const partsArr = (pr.data as Participant[]) || [];
    const msArr = (mr.data as Match[]) || [];

    let sMap: Record<string, Submission> = {};
    let pMap: Record<string, Profile> = {};
    const subIds = partsArr.map(p => p.submission_id);
    if (subIds.length) {
      const { data: subsData, error: se } = await supabase
        .from("talent_submissions").select("id,title,media_url,media_type,user_id").in("id", subIds);
      if (se) throw se;
      (subsData || []).forEach((s: any) => { sMap[s.id] = s; });

      const userIds = [...new Set((subsData || []).map((s: any) => s.user_id))];
      if (userIds.length) {
        const { data: profs, error: pe } = await supabase.from("profiles").select("id,full_name,avatar_url").in("id", userIds);
        if (pe) throw pe;
        (profs || []).forEach((p: any) => { pMap[p.id] = p; });
      }
    }
    return { participants: partsArr, matches: msArr, subs: sMap, profiles: pMap };
  }, []);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    setError(null);
    try {
      const list = await fetchTournaments();
      setTournaments(list);

      const pickedId = selectedIdRef.current || tournamentId;
      const pick = pickedId
        ? list.find(t => t.id === pickedId) || null
        : list.find(t => t.status === "completed") || list.find(t => t.status === "active") || list[0] || null;

      if (!pick) {
        setSelected(null);
        setParticipants([]); setMatches([]); setSubs({}); setProfiles({});
        return;
      }

      selectedIdRef.current = pick.id;
      setSelected(pick);
      const details = await fetchTournamentDetails(pick);
      setParticipants(details.participants);
      setMatches(details.matches);
      setSubs(details.subs);
      setProfiles(details.profiles);
      setLastUpdated(new Date());
    } catch (e: any) {
      console.error("Battle results load failed", e);
      setError(e?.message || "Failed to load tournament data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchTournaments, fetchTournamentDetails, tournamentId]);

  // Initial + when route params change
  useEffect(() => {
    selectedIdRef.current = tournamentId || null;
    load(false);
  }, [tournamentId, category, load]);

  // Auto-refresh while a tournament is active (every 8s)
  useEffect(() => {
    if (!selected || selected.status !== "active") return;
    const t = setInterval(() => load(true), 8000);
    return () => clearInterval(t);
  }, [selected, load]);

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

  const onSelectTournament = (id: string) => {
    selectedIdRef.current = id;
    navigate(`/megatalent/battle-results/id/${id}`);
  };

  const handleShare = async () => {
    if (!selected) return;
    const url = `${window.location.origin}/megatalent/battle-results/id/${selected.id}`;
    const champName = championProfile?.full_name || championSub?.title || null;
    const title = `Battle Royale · ${selected.category}`;
    const text = champName
      ? `🏆 ${champName} just won the ${selected.category} Battle Royale on Unique! See the full bracket:`
      : `⚔️ Live ${selected.category} Battle Royale on Unique — round ${selected.current_round}. Watch the bracket:`;
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
      } else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        toast.success("Link copied to clipboard");
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        try {
          await navigator.clipboard.writeText(`${text} ${url}`);
          toast.success("Link copied to clipboard");
        } catch {
          toast.error("Couldn't share — try copying the URL manually");
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-br from-destructive/15 via-primary/10 to-accent/10 border border-border/30 p-6 mb-6">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Swords className="h-5 w-5 text-destructive" />
            <Badge className="bg-destructive/20 text-destructive border-destructive/30">Battle Royale</Badge>
            {selected && (
              <Badge variant={selected.status === "completed" ? "secondary" : "destructive"} className={selected.status === "active" ? "animate-pulse" : ""}>
                {selected.status.toUpperCase()}
              </Badge>
            )}
            {refreshing && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1" onClick={() => load(true)} disabled={loading || refreshing}>
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} /> Refresh
              </Button>
              <Button variant="default" size="sm" className="gap-1" onClick={handleShare} disabled={!selected}>
                <Share2 className="h-3.5 w-3.5" /> Share
              </Button>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Bracket Results {selected?.category ? `· ${selected.category}` : ""}
          </h1>
          {selected && (
            <p className="text-muted-foreground text-sm mt-1">
              {participants.length} fighters · {totalRounds} rounds · started {selected.starts_at ? new Date(selected.starts_at).toLocaleDateString() : "—"}
              {selected.ends_at ? ` · ended ${new Date(selected.ends_at).toLocaleDateString()}` : ""}
              {lastUpdated && <> · updated {lastUpdated.toLocaleTimeString()}</>}
            </p>
          )}

          {/* Tournament selector */}
          {tournaments.length > 0 && (
            <div className="mt-4 max-w-md">
              <Select value={selected?.id} onValueChange={onSelectTournament}>
                <SelectTrigger className="bg-background/60">
                  <SelectValue placeholder="Pick a tournament…" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50 max-h-72">
                  {tournaments.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      <span className="text-xs">
                        {t.category} · {new Date(t.created_at).toLocaleDateString()} · {t.status}
                        {t.status === "active" ? ` · R${t.current_round}` : ""}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </motion.div>

        {/* States */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading bracket…
          </div>
        ) : error ? (
          <Card className="border-destructive/40 bg-destructive/5">
            <CardContent className="p-8 text-center space-y-3">
              <AlertCircle className="h-10 w-10 mx-auto text-destructive" />
              <div className="font-semibold">Couldn't load tournament data</div>
              <p className="text-sm text-muted-foreground max-w-md mx-auto break-words">{error}</p>
              <Button onClick={() => load(false)} className="gap-1"><RefreshCw className="h-4 w-4" /> Try again</Button>
            </CardContent>
          </Card>
        ) : !selected ? (
          <Card>
            <CardContent className="p-10 text-center space-y-3">
              <Inbox className="h-10 w-10 mx-auto text-muted-foreground/60" />
              <div className="font-semibold">No tournaments yet</div>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {category
                  ? `No Battle Royale has been started for "${category}" yet.`
                  : "No Battle Royale has been started yet."} Start one from the category page.
              </p>
              <Button onClick={() => navigate("/megatalent")}>Go to MegaTalent</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {champion && (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="rounded-2xl border border-yellow-500/40 bg-gradient-to-br from-yellow-500/15 to-amber-500/5 p-6 mb-6 text-center">
                <Crown className="h-12 w-12 mx-auto text-yellow-500 mb-2" />
                <div className="text-xs uppercase tracking-widest text-yellow-600/80 mb-1">Champion</div>
                <div className="text-3xl font-black">{championProfile?.full_name || championSub?.title || "Talent"}</div>
                <div className="mt-4 mx-auto max-w-xs aspect-video rounded-xl overflow-hidden border border-yellow-500/30">
                  {championSub && championSub.media_url ? (
                    championSub.media_type === "video" ? (
                      <video src={championSub.media_url} className="w-full h-full object-cover" controls />
                    ) : (
                      <img src={championSub.media_url} alt={championSub.title} className="w-full h-full object-cover" />
                    )
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-muted text-muted-foreground gap-1">
                      <ImageOff className="h-6 w-6" />
                      <span className="text-xs">Media unavailable</span>
                    </div>
                  )}
                </div>
                <Button onClick={handleShare} className="mt-4 gap-1" size="sm" variant="secondary">
                  <Share2 className="h-3.5 w-3.5" /> Share champion
                </Button>
              </motion.div>
            )}

            <Card className="overflow-hidden mb-6">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="h-4 w-4 text-primary" />
                  <h2 className="font-bold">Bracket Tree</h2>
                </div>
                {matches.length === 0 ? (
                  <div className="py-10 text-center text-muted-foreground text-sm space-y-2">
                    <Swords className="h-8 w-8 mx-auto opacity-50" />
                    <div className="font-medium">No matches yet</div>
                    <p className="text-xs max-w-xs mx-auto">
                      {selected.status === "signup"
                        ? "Tournament is in signup phase — matches appear when the first round begins."
                        : "Matches haven't been generated yet. They'll appear here automatically."}
                    </p>
                  </div>
                ) : (
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
                )}
              </CardContent>
            </Card>

            <Card className="overflow-hidden mb-6">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <History className="h-4 w-4 text-primary" />
                  <h2 className="font-bold">Round History</h2>
                </div>
                {matches.length === 0 ? (
                  <div className="py-6 text-center text-muted-foreground text-sm">No rounds played yet.</div>
                ) : (
                  <div className="space-y-4">
                    {Array.from(roundsMap.keys()).sort((a, b) => a - b).map(round => {
                      const rms = roundsMap.get(round)!;
                      return (
                        <div key={round}>
                          <div className="text-sm font-semibold mb-2">{roundLabel(round, totalRounds)}</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {rms.map(m => {
                              const aWin = m.winner_id === m.participant_a_id;
                              const bWin = m.winner_id === m.participant_b_id;
                              return (
                                <div key={m.id} className="rounded-lg border border-border/40 bg-background/40 p-2 flex items-center gap-2 text-xs">
                                  <MediaThumb sub={partyThumb(m.participant_a_id)} className="h-8 w-8 rounded shrink-0" />
                                  <span className={`flex-1 truncate ${aWin ? "font-bold" : "text-muted-foreground"}`}>{partyName(m.participant_a_id)}</span>
                                  <span className="tabular-nums">{m.votes_a}–{m.votes_b}</span>
                                  <span className={`flex-1 truncate text-right ${bWin ? "font-bold" : "text-muted-foreground"}`}>{partyName(m.participant_b_id)}</span>
                                  <MediaThumb sub={partyThumb(m.participant_b_id)} className="h-8 w-8 rounded shrink-0" />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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
