import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger } from "@/components/ui/accordion";
import { SEO } from "@/components/SEO";
import { toast } from "sonner";
import {
  ArrowLeft,
  Coins,
  Crown,
  Loader2,
  Lightbulb,
  Eye,
  Sparkles,
  RotateCcw,
  Trophy,
  Play,
  ShoppingBag,
  HelpCircle } from "lucide-react";
import heroAsset from "../../public/videos/wheel-fortune-hero.mp4.asset.json";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const VOWELS = ["A", "E", "I", "O", "U"];
const VOWEL_COST = 250;

interface GameState {
  game_id: string;
  category: string;
  hint: string | null;
  masked: string;
  guessed: string[];
  bank: number;
  strikes: number;
  spins: number;
  pending_value: number | null;
  last_spin: string | null;
  status: string;
  solution: string | null;
}

interface Wallet {
  spin_coins: number;
  total_won: number;
  games_won: number;
  credits: number;
}

interface LeaderRow {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  total_won: number;
  games_won: number;
}

/** Physical wheel layout — every value the server can roll appears here. */
const SEGMENTS: { key: string; label: string; tone: "a" | "b" | "bankrupt" | "lose" }[] = [
  { key: "500", label: "500", tone: "a" },
  { key: "bankrupt", label: "BANKRUPT", tone: "bankrupt" },
  { key: "300", label: "300", tone: "b" },
  { key: "800", label: "800", tone: "a" },
  { key: "lose_turn", label: "LOSE TURN", tone: "lose" },
  { key: "400", label: "400", tone: "b" },
  { key: "650", label: "650", tone: "a" },
  { key: "1000", label: "1000", tone: "b" },
  { key: "200", label: "200", tone: "a" },
  { key: "1500", label: "1500", tone: "b" },
  { key: "bankrupt", label: "BANKRUPT", tone: "bankrupt" },
  { key: "500", label: "500", tone: "a" },
  { key: "800", label: "800", tone: "b" },
  { key: "100", label: "100", tone: "a" },
  { key: "2500", label: "2500", tone: "b" },
  { key: "lose_turn", label: "LOSE TURN", tone: "lose" },
];

const SEG_ANGLE = 360 / SEGMENTS.length;
const SEG_COLOR: Record<string, string> = {
  a: "hsl(var(--primary))",
  b: "hsl(var(--accent))",
  bankrupt: "hsl(var(--destructive))",
  lose: "hsl(var(--muted-foreground) / 0.45)",
};
const WHEEL_GRADIENT = `conic-gradient(${SEGMENTS.map(
  (s, i) => `${SEG_COLOR[s.tone]} ${i * SEG_ANGLE}deg ${(i + 1) * SEG_ANGLE}deg`,
).join(", ")})`;
const SPIN_MS = 3800;


export default function WheelOfFortune() {
  const navigate = useNavigate();
  const [state, setState] = useState<GameState | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [leaders, setLeaders] = useState<LeaderRow[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [attempt, setAttempt] = useState("");
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const refreshWallet = useCallback(async () => {
    const { data } = await supabase.rpc("wheel_wallet" as never);
    if (data) setWallet(data as unknown as Wallet);
  }, []);

  const refreshLeaders = useCallback(async () => {
    const { data } = await supabase.rpc("wheel_leaderboard" as never);
    if (data) setLeaders(data as unknown as LeaderRow[]);
  }, []);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        navigate("/auth");
        return;
      }
      const { data } = await supabase.rpc("wheel_get_game" as never);
      const res = data as unknown as { ok: boolean; state: GameState | null } | null;
      if (res?.state) setState(res.state);
      void refreshWallet();
      void refreshLeaders();
    })();
  }, [navigate, refreshWallet, refreshLeaders]);

  const handle = async (
    key: string,
    fn: string,
    args?: Record<string, unknown>,
    onOk?: (payload: Record<string, unknown>) => void,
  ) => {
    setBusy(key);
    try {
      const { data, error } = await supabase.rpc(fn as never, (args ?? {}) as never);
      if (error) throw error;
      const res = (data ?? {}) as Record<string, unknown>;
      if (res.ok === false) {
        const code = String(res.error ?? "failed");
        const messages: Record<string, string> = {
          insufficient_credits: "Not enough AI credits. Top up in the AI Credits Store.",
          not_enough_coins: `You need ${VOWEL_COST} Spin Coins to buy a vowel.`,
          spin_first: "Spin the wheel before guessing a consonant.",
          already_spun: "You already have a spin value — guess a consonant.",
          already_guessed: "That letter was already used.",
          no_active_game: "Start a new puzzle first.",
          nothing_to_reveal: "Every letter is already revealed.",
          no_lost_game: "No lost round to revive." };
        toast.error(messages[code] ?? code.replace(/_/g, " "));
        if (code === "insufficient_credits") {
          navigate("/ai-credits-store");
        }
        return;
      }
      if (res.state) setState(res.state as unknown as GameState);
      onOk?.(res);
      void refreshWallet();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(null);
    }
  };

  const startGame = () =>
    handle("start", "wheel_start_game", undefined, () => {
      setAttempt("");
      toast.success("New puzzle — 1 credit spent. Good luck!");
    });

  const spin = async () => {
    if (spinning) return;
    setSpinning(true);
    setBusy("spin");
    try {
      const { data, error } = await supabase.rpc("wheel_spin" as never);
      if (error) throw error;
      const res = (data ?? {}) as Record<string, unknown>;
      if (res.ok === false) {
        toast.error(String(res.error ?? "failed").replace(/_/g, " "));
        return;
      }
      const outcome = String(res.outcome);
      const matches = SEGMENTS.map((s, i) => (s.key === outcome ? i : -1)).filter((i) => i >= 0);
      const idx = matches.length ? matches[Math.floor(Math.random() * matches.length)] : 0;

      // Land the chosen segment's centre under the top pointer, always spinning forward.
      setAngle((a) => {
        const target = 360 - (idx * SEG_ANGLE + SEG_ANGLE / 2);
        const base = Math.ceil((a + 1) / 360) * 360;
        return base + 360 * 4 + target;
      });
      await new Promise((r) => setTimeout(r, SPIN_MS + 150));

      if (res.state) setState(res.state as unknown as GameState);
      if (outcome === "bankrupt") toast.error("Bankrupt! Your round bank is gone.");
      else if (outcome === "lose_turn") toast("Lose a turn — spin again.");
      else toast.success(`${outcome} per letter — pick a consonant!`);
      void refreshWallet();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSpinning(false);
      setBusy(null);
    }
  };


  const guess = (letter: string) =>
    handle(`letter-${letter}`, "wheel_guess_letter", { _letter: letter }, (res) => {
      const hits = Number(res.hits ?? 0);
      const gain = Number(res.gain ?? 0);
      if (hits === 0) toast.error(`No ${letter} in this puzzle.`);
      else toast.success(`${hits}× ${letter}${gain ? ` — +${gain} SC to bank` : ""}`);
    });

  const solve = () => {
    if (!attempt.trim()) return;
    void handle("solve", "wheel_solve", { _attempt: attempt }, (res) => {
      if (res.correct) {
        toast.success(`Solved! +${res.payout} Spin Coins`);
        void refreshLeaders();
      } else {
        toast.error("Not the answer — that costs you a strike.");
      }
      setAttempt("");
    });
  };

  const active = state?.status === "active";
  const canGuessConsonant = active && state?.pending_value != null;
  const coins = wallet?.spin_coins ?? 0;

  const maskedLetters = useMemo(() => (state?.masked ?? "").split(""), [state?.masked]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Wheel of Fortune Puzzles | Unique"
        description="Spin the wheel, guess letters and solve word puzzles to win Spin Coins. Boosters, hints and a live leaderboard."
        canonical="/wheel-of-fortune"
      />

      {/* Hero */}
      <section className="relative h-[52vh] min-h-[360px] w-full overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          src={heroAsset.url}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        <div className="container relative z-10 mx-auto flex h-full max-w-5xl flex-col justify-end px-4 pb-8">
          <Button
            variant="ghost"
            size="sm"
            className="mb-auto mt-4 w-fit backdrop-blur-md"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Badge className="mb-3 w-fit gap-1 bg-primary/20 text-primary backdrop-blur-md">
            <Sparkles className="h-3 w-3" /> Word puzzle game show
          </Badge>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">Wheel of Fortune</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Spin for letter values, buy vowels and solve the hidden phrase. Every win pays out in
            Spin Coins — the in-game currency you spend right here.
          </p>
        </div>
      </section>

      <div className="container mx-auto max-w-5xl space-y-6 px-4 py-8">
        {/* Wallet */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Spin Coins", value: coins, icon: Coins },
            { label: "AI Credits", value: wallet?.credits ?? 0, icon: Sparkles },
            { label: "Total won", value: wallet?.total_won ?? 0, icon: Trophy },
            { label: "Puzzles solved", value: wallet?.games_won ?? 0, icon: Crown },
          ].map((s) => (
            <Card key={s.label} className="border-border/50 bg-card/60 backdrop-blur-xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <s.icon className="h-3.5 w-3.5 text-primary" /> {s.label}
                </div>
                <div className="mt-1 text-2xl font-bold">{s.value.toLocaleString()}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Board */}
        <Card className="overflow-hidden border-border/50 bg-card/60 backdrop-blur-xl">
          <CardContent className="p-5 sm:p-8">
            {!state || state.status !== "active" ? (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                {state?.solution && (
                  <div className="rounded-xl bg-muted/60 p-4">
                    <div className="text-xs uppercase text-muted-foreground">
                      {state.status === "solved" ? "You solved it" : "The answer was"}
                    </div>
                    <div className="mt-1 text-xl font-bold">{state.solution}</div>
                  </div>
                )}
                <p className="max-w-md text-muted-foreground">
                  Each puzzle round costs <strong>1 AI credit</strong>. Three strikes end the round.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button size="lg" onClick={startGame} disabled={busy === "start"}>
                    {busy === "start" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="mr-2 h-4 w-4" />
                    )}
                    Play a puzzle (1 credit)
                  </Button>
                  {state?.status === "lost" && (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => handle("revive", "wheel_second_chance")}
                      disabled={busy === "revive"}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" /> Second chance (3 credits)
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge variant="secondary">{state.category}</Badge>
                  <div className="flex items-center gap-3 text-sm">
                    <span>
                      Bank: <strong>{state.bank} SC</strong>
                    </span>
                    <span className="text-muted-foreground">
                      Strikes: <strong>{state.strikes}/3</strong>
                    </span>
                  </div>
                </div>

                {/* Puzzle tiles */}
                <div className="flex flex-wrap justify-center gap-1.5">
                  {maskedLetters.map((ch, i) =>
                    ch === " " ? (
                      <span key={i} className="w-3 sm:w-4" />
                    ) : (
                      <span
                        key={i}
                        className={`flex h-10 w-7 items-center justify-center rounded-md border text-base font-black sm:h-12 sm:w-9 sm:text-lg ${
                          ch === "_"
                            ? "border-border/60 bg-muted/40 text-transparent"
                            : "border-primary/40 bg-primary/15 text-foreground"
                        }`}
                      >
                        {ch === "_" ? "?" : ch}
                      </span>
                    ),
                  )}
                </div>

                {state.hint && (
                  <p
                    className={
                      state.category === "Riddles"
                        ? "rounded-xl border border-primary/30 bg-primary/10 p-3 text-center text-base font-semibold text-foreground"
                        : "text-center text-sm text-muted-foreground"
                    }
                  >
                    <Lightbulb className="mr-1 inline h-4 w-4 text-primary" />
                    {state.hint}
                  </p>
                )}


                {/* Wheel */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative h-64 w-64 sm:h-72 sm:w-72">
                    {/* pointer */}
                    <div
                      className="absolute left-1/2 top-0 z-20 h-0 w-0 -translate-x-1/2 -translate-y-1 border-l-[10px] border-r-[10px] border-t-[20px] border-l-transparent border-r-transparent border-t-foreground drop-shadow"
                      aria-hidden
                    />
                    <div
                      className="absolute inset-0 rounded-full border-[6px] border-primary/40 shadow-xl shadow-primary/20"
                      style={{
                        transform: `rotate(${angle}deg)`,
                        background: WHEEL_GRADIENT,
                        transition: `transform ${SPIN_MS}ms cubic-bezier(0.12, 0.72, 0.06, 1)`,
                      }}
                    >
                      {SEGMENTS.map((s, i) => (
                        <div
                          key={`${s.key}-${i}`}
                          className="absolute left-1/2 top-0 h-1/2 origin-bottom"
                          style={{ transform: `rotate(${i * SEG_ANGLE + SEG_ANGLE / 2}deg)` }}
                          aria-hidden
                        >
                          <span
                            className={`block -translate-x-1/2 pt-3 text-[10px] font-black tracking-tight sm:text-xs ${
                              s.tone === "lose" ? "text-foreground/80" : "text-white"
                            }`}
                            style={{ writingMode: "vertical-rl" }}
                          >
                            {s.label}
                          </span>
                        </div>
                      ))}
                      <div className="absolute inset-[26%] z-10 flex items-center justify-center rounded-full border-4 border-primary/30 bg-background text-center shadow-inner">
                        <span className="px-1 text-sm font-bold leading-tight">
                          {spinning
                            ? "…"
                            : state.pending_value
                              ? `${state.pending_value}`
                              : state.last_spin === "bankrupt"
                                ? "Bankrupt"
                                : state.last_spin === "lose_turn"
                                  ? "Lost turn"
                                  : "Spin"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={spin}
                    disabled={spinning || busy === "spin" || state.pending_value != null}
                  >
                    {spinning || busy === "spin" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RotateCcw className="mr-2 h-4 w-4" />
                    )}
                    Spin the wheel
                  </Button>
                </div>

                {/* Letters */}
                <div>
                  <div className="mb-2 text-center text-xs text-muted-foreground">
                    Consonants pay spin value × occurrences · Vowels cost {VOWEL_COST} SC
                  </div>
                  <div className="grid grid-cols-7 gap-1.5 sm:grid-cols-9">
                    {ALPHABET.map((letter) => {
                      const used = state.guessed.includes(letter);
                      const isVowel = VOWELS.includes(letter);
                      const disabled =
                        used ||
                        busy !== null ||
                        (isVowel ? coins < VOWEL_COST : !canGuessConsonant);
                      return (
                        <Button
                          key={letter}
                          size="sm"
                          variant={used ? "ghost" : isVowel ? "secondary" : "outline"}
                          className="h-9 px-0 font-bold"
                          disabled={disabled}
                          onClick={() => guess(letter)}
                        >
                          {busy === `letter-${letter}` ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            letter
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Solve */}
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    value={attempt}
                    onChange={(e) => setAttempt(e.target.value)}
                    placeholder="Type the full phrase to solve…"
                    onKeyDown={(e) => e.key === "Enter" && solve()}
                  />
                  <Button onClick={solve} disabled={busy === "solve" || !attempt.trim()}>
                    {busy === "solve" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Solve
                  </Button>
                </div>

                {/* Boosters */}
                <div className="grid gap-2 sm:grid-cols-3">
                  <Button
                    variant="outline"
                    onClick={() => handle("hint", "wheel_buy_hint")}
                    disabled={busy === "hint" || !!state.hint}
                  >
                    <Lightbulb className="mr-2 h-4 w-4" /> AI hint (2 cr)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handle("reveal", "wheel_reveal_letter")}
                    disabled={busy === "reveal"}
                  >
                    <Eye className="mr-2 h-4 w-4" /> Reveal a letter (3 cr)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      handle("coins", "wheel_buy_coins", { _credits: 1 }, () =>
                        toast.success("+500 Spin Coins"),
                      )
                    }
                    disabled={busy === "coins"}
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" /> 500 SC (1 cr)
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card className="border-border/50 bg-card/60 backdrop-blur-xl">
          <CardContent className="p-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <Trophy className="h-5 w-5 text-primary" /> Top puzzle solvers
            </h2>
            {leaders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No results yet — be the first.</p>
            ) : (
              <ol className="space-y-2">
                {leaders.map((row, i) => (
                  <li
                    key={row.user_id}
                    className="flex items-center gap-3 rounded-lg bg-muted/40 px-3 py-2"
                  >
                    <span className="w-5 text-sm font-bold text-muted-foreground">{i + 1}</span>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={row.avatar_url ?? undefined} alt={row.display_name} />
                      <AvatarFallback>{row.display_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="flex-1 truncate text-sm font-medium">{row.display_name}</span>
                    <span className="text-sm font-bold">{row.total_won.toLocaleString()} SC</span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        {/* How it works */}
        <Card className="border-border/50 bg-card/60 backdrop-blur-xl">
          <CardContent className="p-5">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
              <HelpCircle className="h-5 w-5 text-primary" /> How it works
            </h2>
            <Accordion type="single" collapsible>
              <AccordionItem value="basics">
                <AccordionTrigger>Playing a round</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Starting a puzzle costs 1 AI credit. You get a category and a hidden phrase. Spin
                  the wheel to set a letter value, then pick a consonant: each occurrence pays the
                  spin value into your round bank. Bankrupt clears the bank, Lose a turn simply ends
                  the spin. Three wrong guesses (or wrong solve attempts) end the round.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="coins">
                <AccordionTrigger>Spin Coins</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Solving the puzzle pays your round bank plus a difficulty bonus in Spin Coins (SC).
                  SC is an in-game currency: it can only be spent inside this section — on vowels
                  ({VOWEL_COST} SC each) and future cosmetics. It cannot be converted back into AI
                  credits, money, or transferred to other players.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="boosters">
                <AccordionTrigger>Boosters</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  AI hint (2 credits) shows a subtle clue without revealing the phrase. Reveal a
                  letter (3 credits) uncovers one random hidden letter for free. Coin pack (1 credit)
                  adds 500 SC. Second chance (3 credits) revives a lost round with one strike left.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="fairness">
                <AccordionTrigger>Anti-cheat</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  The solution never reaches your browser. Spins, letter checks and payouts all run
                  on the server, and every Spin Coin change is written to a personal ledger.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
