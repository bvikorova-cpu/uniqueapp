import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useBattleCoins, BATTLE_ENTRY_COINS, BATTLE_PRIZE_COINS, COINS_PER_CREDIT } from "@/hooks/useBattleCoins";
import BattleCoinsWallet from "@/components/battle-coins/BattleCoinsWallet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Dices, Swords, Trophy, Loader2, Flag, Users, HelpCircle } from "lucide-react";
import heroVideo from "@/assets/dice-duel-hero.mp4.asset.json";
import howItWorksImg from "@/assets/dice-duel-howto.jpg";

const COLS = 9;
const ROWS = 14;
const STAKE = BATTLE_ENTRY_COINS;
const PRIZE = BATTLE_PRIZE_COINS;

type Trail = [number, number][];

interface DiceMatch {
  id: string;
  player1_id: string;
  player2_id: string | null;
  status: "waiting" | "active" | "finished" | "abandoned";
  current_turn: string | null;
  p1_trail: Trail;
  p2_trail: Trail;
  last_roll: number | null;
  stake: number;
  winner_id: string | null;
  created_at: string;
  finished_at: string | null;
}

interface LeaderRow {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  points: number;
  wins: number;
  losses: number;
  matches: number;
  rank: number;
}

const DICE_FACES: Record<number, string> = { 1: "⚀", 2: "⚁", 3: "⚂", 4: "⚃", 5: "⚄", 6: "⚅" };
const DIR_LABELS: Record<number, string> = { 1: "↓ Down", 2: "↗ Up-right", 3: "↘ Down-right", 4: "← Left", 5: "↙ Down-left", 6: "↓ Down" };

const DiceDuel = () => {
  const { user } = useAuth();
  const { coins, refresh } = useBattleCoins("dice_duel");
  const [match, setMatch] = useState<DiceMatch | null>(null);
  const [history, setHistory] = useState<DiceMatch[]>([]);
  const [searching, setSearching] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [animRoll, setAnimRoll] = useState<number | null>(null);
  const [leaders, setLeaders] = useState<LeaderRow[]>([]);
  const [lbLoading, setLbLoading] = useState(true);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isP1 = match?.player1_id === user?.id;
  const myTrail = match ? (isP1 ? match.p1_trail : match.p2_trail) : [];
  const oppTrail = match ? (isP1 ? match.p2_trail : match.p1_trail) : [];
  const myTurn = match?.status === "active" && match.current_turn === user?.id;
  const iWon = match?.status === "finished" && match.winner_id === user?.id;
  const iLost = match?.status === "finished" && match.winner_id && match.winner_id !== user?.id;

  const loadLeaderboard = useCallback(async () => {
    setLbLoading(true);
    try {
      const { data } = await supabase.functions.invoke("dice-duel-leaderboard", { body: {} });
      setLeaders((data?.leaderboard as LeaderRow[]) ?? []);
    } finally {
      setLbLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    if (!user) return;
    const { data } = await (supabase as any)
      .from("dice_duel_matches")
      .select("*")
      .eq("status", "finished")
      .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
      .order("finished_at", { ascending: false })
      .limit(20);
    setHistory((data as DiceMatch[]) ?? []);
  }, [user]);

  // Global leaderboard (visible to everyone, also signed out)
  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  // Resume any active/waiting match on load
  useEffect(() => {
    if (!user) return;
    loadHistory();
    (async () => {
      const { data } = await (supabase as any)
        .from("dice_duel_matches")
        .select("*")
        .in("status", ["waiting", "active"])
        .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) setMatch(data as DiceMatch);
    })();
  }, [user, loadHistory]);

  // Realtime updates for the current match
  useEffect(() => {
    if (!match?.id) return;
    const channel = supabase
      .channel(`dice-duel-${match.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "dice_duel_matches", filter: `id=eq.${match.id}` },
        (payload) => {
          const updated = payload.new as DiceMatch;
          setMatch(updated);
          if (updated.status === "finished") {
            refresh();
            loadHistory();
            loadLeaderboard();
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [match?.id, refresh, loadHistory, loadLeaderboard]);

  useEffect(() => () => {
    if (animRef.current) clearInterval(animRef.current);
  }, []);

  const findMatch = async () => {
    if (!user) return;
    if ((coins ?? 0) < STAKE) {
      toast.error(`You need ${STAKE} Battle Coins to play — exchange 1 AI credit for ${COINS_PER_CREDIT} coins below.`);
      return;
    }
    setSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke("dice-duel-matchmaking", { body: { action: "find" } });
      if (error) throw new Error(data?.error || error.message);
      if (data?.error) throw new Error(data.error);
      setMatch(data.match as DiceMatch);
      refresh();
      toast.success(data.joined ? "Opponent found — game on!" : "Waiting for an opponent…");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Matchmaking failed");
    } finally {
      setSearching(false);
    }
  };

  const cancelOrForfeit = async () => {
    if (!match) return;
    try {
      const { data, error } = await supabase.functions.invoke("dice-duel-forfeit", { body: { match_id: match.id } });
      if (error) throw new Error(data?.error || error.message);
      if (data?.error) throw new Error(data.error);
      toast.success(data.cancelled ? "Match cancelled, entry coins refunded" : "Match forfeited");
      if (data.cancelled) setMatch(null);
      refresh();
      loadHistory();
      loadLeaderboard();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    }
  };

  const roll = async () => {
    if (!match || !myTurn || rolling) return;
    setRolling(true);
    // Dice animation while the server rolls
    animRef.current = setInterval(() => setAnimRoll(1 + Math.floor(Math.random() * 6)), 90);
    try {
      const { data, error } = await supabase.functions.invoke("dice-duel-roll", { body: { match_id: match.id } });
      if (error) throw new Error(data?.error || error.message);
      if (data?.error) throw new Error(data.error);
      setMatch(data.match as DiceMatch);
      setAnimRoll(data.roll);
      if (data.won) toast.success("You reached the bottom — you win the pot!");
      else if (!data.moved) toast.info(`Rolled ${data.roll} — out of bounds, turn skipped`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Roll failed");
    } finally {
      setTimeout(() => {
        if (animRef.current) clearInterval(animRef.current);
        animRef.current = null;
        setRolling(false);
      }, 500);
    }
  };

  const wins = useMemo(() => history.filter((h) => h.winner_id === user?.id).length, [history, user]);

  const renderBoard = (m: DiceMatch) => {
    const cell = 34;
    const w = (COLS - 1) * cell + 40;
    const h = (ROWS - 1) * cell + 40;
    const pt = ([x, y]: [number, number]) => `${20 + x * cell},${20 + y * cell}`;
    const line = (t: Trail) => t.map(pt).join(" ");
    const last = (t: Trail) => t[t.length - 1];
    return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-sm mx-auto select-none">
        {/* finish row highlight */}
        <rect x="0" y={20 + (ROWS - 1) * cell - cell / 2} width={w} height={cell} rx="8" className="fill-primary/10" />
        {Array.from({ length: ROWS }).map((_, y) =>
          Array.from({ length: COLS }).map((__, x) => (
            <circle key={`${x}-${y}`} cx={20 + x * cell} cy={20 + y * cell} r="2.2" className="fill-muted-foreground/50" />
          ))
        )}
        {m.p2_trail.length > 1 && (
          <polyline points={line(m.p2_trail)} fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="stroke-blue-500" />
        )}
        {m.p1_trail.length > 1 && (
          <polyline points={line(m.p1_trail)} fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="stroke-red-500" />
        )}
        {m.p2_trail.length > 0 && m.player2_id && (
          <circle cx={20 + last(m.p2_trail)[0] * cell} cy={20 + last(m.p2_trail)[1] * cell} r="8" className="fill-blue-500 stroke-background" strokeWidth="3" />
        )}
        {m.p1_trail.length > 0 && (
          <circle cx={20 + last(m.p1_trail)[0] * cell} cy={20 + last(m.p1_trail)[1] * cell} r="8" className="fill-red-500 stroke-background" strokeWidth="3" />
        )}
      </svg>
    );
  };

  return (
    <main className="pb-16">
      <title>Dice Trail Duel — 1v1 Dice Race | Unique</title>
      <meta name="description" content="Realtime 1v1 dice trail race: roll the die, draw your line across the dot grid, first to the bottom wins the credit pot." />

      <div className="relative h-[46vh] min-h-[300px] w-full overflow-hidden pt-16 sm:pt-0">
        <video
          className="absolute inset-0 h-full w-full object-cover brightness-[1.1] saturate-[1.15]"
          autoPlay muted loop playsInline preload="metadata"
        >
          <source src={heroVideo.url} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/20" />
        <div className="relative z-10 flex h-full flex-col justify-end px-4 pb-5 sm:px-8 max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500 to-blue-600 text-white">
              <Dices className="h-6 w-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Dice Trail Duel</h1>
          </div>
          <p className="text-muted-foreground">
            Roll the die, draw your trail across the dot grid. First player to reach the bottom row wins {PRIZE} Battle Coins + XP.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-6 max-w-3xl">


      {!match && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Swords className="h-5 w-5" /> Find an opponent</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Entry stake</span>
              <Badge variant="secondary">{STAKE} coins</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Winner takes</span>
              <Badge>{PRIZE} coins + 10 XP</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Your coins</span>
              <Badge variant="outline">{coins ?? 0} coins</Badge>
            </div>
            <Button className="w-full" size="lg" onClick={findMatch} disabled={searching}>
              {searching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Users className="h-4 w-4 mr-2" />}
              {searching ? "Searching…" : "Find match"}
            </Button>
            {(coins ?? 0) < STAKE && (
              <p className="text-sm text-center text-muted-foreground">
                Not enough Battle Coins — exchange AI credits below (1 credit = {COINS_PER_CREDIT} coins).
              </p>
            )}
            <p className="text-xs text-center text-muted-foreground">
              Battle Coins are a game-only currency. They can never be converted back into AI credits or money.
            </p>
          </CardContent>
        </Card>
      )}

      {match?.status === "waiting" && (
        <Card>
          <CardContent className="py-10 text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="font-medium">Waiting for an opponent to join…</p>
            <p className="text-sm text-muted-foreground">Your {match.stake} Battle Coins are staked and will be refunded if you cancel.</p>
            <Button variant="outline" onClick={cancelOrForfeit}>Cancel & refund</Button>
          </CardContent>
        </Card>
      )}

      {match && (match.status === "active" || match.status === "finished") && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className={`inline-block h-3 w-3 rounded-full ${isP1 ? "bg-red-500" : "bg-blue-500"}`} /> You
                <span className="text-muted-foreground">vs</span>
                <span className={`inline-block h-3 w-3 rounded-full ${isP1 ? "bg-blue-500" : "bg-red-500"}`} /> Opponent
              </div>
              {match.status === "finished" && (
                <Badge variant={iWon ? "default" : "secondary"}>
                  {iWon ? <><Trophy className="h-3 w-3 mr-1" /> You won +{PRIZE} coins</> : iLost ? "You lost" : "Finished"}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderBoard(match)}

            <div className="flex items-center justify-center gap-4">
              <div className="text-5xl leading-none" aria-live="polite">
                {animRoll ? DICE_FACES[animRoll] : match.last_roll ? DICE_FACES[match.last_roll] : "🎲"}
              </div>
              {(animRoll ?? match.last_roll) && (
                <div className="text-sm text-muted-foreground">{DIR_LABELS[(animRoll ?? match.last_roll)!]}</div>
              )}
            </div>

            {match.status === "active" && (
              <>
                <p className="text-center text-sm font-medium">
                  {myTurn ? "Your turn — roll the die!" : "Opponent's turn…"}
                </p>
                <div className="flex gap-2">
                  <Button className="flex-1" size="lg" onClick={roll} disabled={!myTurn || rolling}>
                    {rolling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Dices className="h-4 w-4 mr-2" />}
                    Roll
                  </Button>
                  <Button variant="outline" size="lg" onClick={cancelOrForfeit}>
                    <Flag className="h-4 w-4 mr-2" /> Forfeit
                  </Button>
                </div>
              </>
            )}

            {match.status === "finished" && (
              <Button className="w-full" size="lg" onClick={() => { setMatch(null); }}>
                Play again
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" /> Online leaderboard
            <span className="ml-auto text-xs font-normal text-muted-foreground">1 win = 1 point</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {lbLoading ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : leaders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No finished duels yet — win the first one and top the board.</p>
          ) : (
            leaders.map((l) => (
              <div
                key={l.user_id}
                className={`flex items-center gap-3 text-sm border-b border-border last:border-0 pb-2 last:pb-0 ${l.user_id === user?.id ? "font-semibold" : ""}`}
              >
                <span className="w-6 text-center text-muted-foreground">{l.rank}</span>
                {l.avatar_url ? (
                  <img src={l.avatar_url} alt={l.display_name} loading="lazy" className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <span className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs">
                    {l.display_name.slice(0, 1).toUpperCase()}
                  </span>
                )}
                <span className="flex-1 truncate" translate="no">{l.display_name}</span>
                <span className="text-xs text-muted-foreground">{l.wins}W / {l.losses}L</span>
                <Badge variant={l.rank <= 3 ? "default" : "secondary"}>{l.points} pts</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {history.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              Recent matches
              <Badge variant="secondary">{wins}/{history.length} won</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {history.slice(0, 8).map((h) => (
              <div key={h.id} className="flex items-center justify-between text-sm border-b border-border last:border-0 pb-2 last:pb-0">
                <span className="text-muted-foreground">{new Date(h.finished_at ?? h.created_at).toLocaleDateString()}</span>
                <Badge variant={h.winner_id === user?.id ? "default" : "outline"}>
                  {h.winner_id === user?.id ? `Won +${PRIZE} coins` : `Lost −${h.stake} coins`}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="mt-6 space-y-6">
        <BattleCoinsWallet module="dice_duel" />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><HelpCircle className="h-4 w-4" /> How it works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <img
            src={howItWorksImg}
            alt="Dice Trail Duel game board — red and blue marker trails racing down a 9x14 grid of dots toward the bottom row, with a die beside the paper"
            loading="lazy"
            width={1200}
            height={800}
            className="rounded-xl w-full mb-2"
          />
          <p>Two players race across a dot grid. On your turn, roll the die — the server rolls fairly and your trail extends one step in the rolled direction:</p>
          <ul className="grid grid-cols-2 gap-1">
            {Object.entries(DIR_LABELS).map(([k, v]) => (
              <li key={k} className="flex items-center gap-2"><span className="text-lg">{DICE_FACES[Number(k)]}</span> {v}</li>
            ))}
          </ul>
          <p>If the direction would leave the grid, the turn is skipped. First player to reach the bottom row wins {PRIZE} Battle Coins + 10 XP (entry {STAKE} coins each, 1 AI credit = {COINS_PER_CREDIT} coins). Coins never convert back to credits or cash. If your opponent forfeits, you win instantly.</p>
        </CardContent>
      </Card>
      </div>
    </main>
  );
};

export default DiceDuel;
