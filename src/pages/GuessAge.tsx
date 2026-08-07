import { useCallback, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Cake, Loader2, Upload, Trophy, Target, Gem, CheckCircle2, XCircle, RefreshCw,
} from "lucide-react";

type DeckCard = { userId: string; photoUrl: string; displayName: string; guessesCount: number };
type MyState = {
  profile: { realAge: number; displayName: string | null; isActive: boolean; photoUrl: string | null } | null;
  score: { points: number; correctGuesses: number; totalGuesses: number };
  received: { total: number; correct: number };
};
type LeaderRow = { user_id: string; points: number; correct_guesses: number; total_guesses: number; display_name: string; avatar_url: string | null };

const GuessAge = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [authed, setAuthed] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [deck, setDeck] = useState<DeckCard[]>([]);
  const [index, setIndex] = useState(0);
  const [guess, setGuess] = useState("");
  const [busy, setBusy] = useState(false);
  const [loadingDeck, setLoadingDeck] = useState(true);
  const [result, setResult] = useState<{ correct: boolean; realAge: number; guessedAge: number; points: number } | null>(null);
  const [state, setState] = useState<MyState | null>(null);
  const [leaders, setLeaders] = useState<LeaderRow[]>([]);

  // Join form
  const [myAge, setMyAge] = useState("");
  const [nickname, setNickname] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session);
      setUserId(data.session?.user.id ?? null);
    });
  }, []);

  const call = useCallback(async <T,>(body: Record<string, unknown>): Promise<T> => {
    const { data, error } = await supabase.functions.invoke("kids-router", { body });
    if (error) throw new Error((data as { error?: string })?.error || error.message);
    if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
    return data as T;
  }, []);

  const loadDeck = useCallback(async () => {
    setLoadingDeck(true);
    try {
      const res = await call<{ deck: DeckCard[] }>({ action: "guessage.deck", limit: 15 });
      setDeck(res.deck ?? []);
      setIndex(0);
      setResult(null);
    } catch {
      setDeck([]);
    } finally {
      setLoadingDeck(false);
    }
  }, [call]);

  const loadState = useCallback(async () => {
    try {
      const res = await call<MyState>({ action: "guessage.my_state" });
      setState(res);
      if (res.profile) {
        setMyAge(String(res.profile.realAge));
        setNickname(res.profile.displayName ?? "");
      }
    } catch {
      /* ignore */
    }
  }, [call]);

  const loadLeaders = useCallback(async () => {
    const { data } = await supabase.rpc("get_guess_age_leaderboard", { _limit: 20 });
    setLeaders((data as LeaderRow[]) ?? []);
  }, []);

  useEffect(() => {
    if (!authed) return;
    loadDeck();
    loadState();
    loadLeaders();
  }, [authed, loadDeck, loadState, loadLeaders]);

  const handleError = (e: unknown) => {
    const msg = e instanceof Error ? e.message : "Something went wrong";
    if (/insufficient credits/i.test(msg)) {
      toast({ title: "Not enough credits", description: "Each guess costs 1 credit.", variant: "destructive" });
      navigate("/ai-credits-store");
      return;
    }
    toast({ title: "Failed", description: msg, variant: "destructive" });
  };

  const submitGuess = async () => {
    const card = deck[index];
    const value = Number(guess);
    if (!card) return;
    if (!Number.isInteger(value) || value < 1 || value > 120) {
      toast({ title: "Enter a valid age", description: "Between 1 and 120.", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      const res = await call<{ correct: boolean; realAge: number; guessedAge: number; points: number }>({
        action: "guessage.guess",
        profileUserId: card.userId,
        guessedAge: value,
      });
      setResult(res);
      setGuess("");
      loadState();
      loadLeaders();
      window.dispatchEvent(new Event("ai-credits-updated"));
    } catch (e) {
      handleError(e);
    } finally {
      setBusy(false);
    }
  };

  const next = () => {
    setResult(null);
    setGuess("");
    if (index + 1 >= deck.length) loadDeck();
    else setIndex((i) => i + 1);
  };

  const joinGame = async (file?: File | null) => {
    const age = Number(myAge);
    if (!Number.isInteger(age) || age < 13 || age > 120) {
      toast({ title: "Enter your real age", description: "Must be 13 or older.", variant: "destructive" });
      return;
    }
    if (!file && !state?.profile) {
      fileRef.current?.click();
      return;
    }
    setUploading(true);
    try {
      const { data: session } = await supabase.auth.getUser();
      const uid = session.user?.id;
      if (!uid) throw new Error("Login required");

      let path: string | null = null;
      if (file) {
        path = `${uid}/selfie-${Date.now()}.jpg`;
        const { error: upErr } = await supabase.storage
          .from("guess-age-photos")
          .upload(path, file, { upsert: true, contentType: file.type || "image/jpeg" });
        if (upErr) throw new Error(upErr.message);
      }

      const displayName = nickname.trim().slice(0, 30) || null;

      if (path) {
        const { error } = await supabase
          .from("guess_age_profiles")
          .upsert(
            { user_id: uid, real_age: age, display_name: displayName, photo_path: path, is_active: true },
            { onConflict: "user_id" },
          );
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase
          .from("guess_age_profiles")
          .update({ real_age: age, display_name: displayName, is_active: true })
          .eq("user_id", uid);
        if (error) throw new Error(error.message);
      }


      toast({ title: "You're in the game!", description: "Other players can now guess your age." });
      loadState();
    } catch (e) {
      handleError(e);
    } finally {
      setUploading(false);
    }
  };

  if (authed === null) return null;

  if (!authed) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-3xl text-center space-y-6">
          <Badge className="bg-gradient-to-r from-primary to-accent text-white">Sign in required</Badge>
          <h1 className="text-3xl md:text-5xl font-black">Guess My Age</h1>
          <p className="text-muted-foreground">Log in to guess other players' ages and collect points.</p>
          <Button size="lg" onClick={() => navigate("/auth")}>Go to login</Button>
        </div>
      </div>
    );
  }

  const card = deck[index];

  return (
    <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-16">
      <Helmet>
        <title>Guess My Age — Photo Guessing Game</title>
        <meta
          name="description"
          content="Guess other players' real age from their selfie for 1 credit. Correct guess earns 10 points, a wrong one 2 points. Climb the leaderboard."
        />
      </Helmet>

      <div className="container mx-auto px-3 sm:px-4 max-w-4xl">
        <div className="text-center mb-6">
          <Badge className="bg-gradient-to-r from-primary to-accent text-white mb-3">
            <Cake className="w-3 h-3 mr-1" /> 1 credit per guess
          </Badge>
          <h1 className="text-2xl sm:text-4xl font-black">Guess My Age</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Real players, real ages. Guess within ±2 years to score 10 points — a miss still gives you 2.
          </p>
        </div>

        <Tabs defaultValue="play" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="play" className="text-xs"><Target className="w-3 h-3 mr-1" />Play</TabsTrigger>
            <TabsTrigger value="me" className="text-xs"><Upload className="w-3 h-3 mr-1" />My photo</TabsTrigger>
            <TabsTrigger value="ranks" className="text-xs"><Trophy className="w-3 h-3 mr-1" />Leaderboard</TabsTrigger>
          </TabsList>

          {/* ------------------------------------------------ Play */}
          <TabsContent value="play">
            {loadingDeck ? (
              <Card className="p-10 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </Card>
            ) : !card ? (
              <Card className="p-8 text-center space-y-3">
                <p className="font-semibold">No new players right now</p>
                <p className="text-sm text-muted-foreground">
                  You've guessed everyone available. Check back later or add your own photo to attract players.
                </p>
                <Button variant="outline" onClick={loadDeck}>
                  <RefreshCw className="w-4 h-4 mr-2" />Refresh
                </Button>
              </Card>
            ) : (
              <Card className="overflow-hidden border-2 border-primary/30">
                <div className="relative bg-muted">
                  <img
                    src={card.photoUrl}
                    alt={`Selfie of ${card.displayName}`}
                    className="w-full max-h-[460px] object-cover"
                  />
                  <Badge className="absolute top-3 left-3 bg-black/60 text-white border-0">
                    {card.displayName}
                  </Badge>
                  <Badge variant="secondary" className="absolute top-3 right-3">
                    {card.guessesCount} guesses
                  </Badge>
                </div>

                <div className="p-4 space-y-3">
                  {result ? (
                    <div className="space-y-3 text-center">
                      <div className={`flex items-center justify-center gap-2 font-black text-lg ${result.correct ? "text-green-600" : "text-red-500"}`}>
                        {result.correct ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        {result.correct ? "Correct!" : "Not quite"}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        You guessed <span className="font-bold text-foreground">{result.guessedAge}</span> — real age is{" "}
                        <span className="font-bold text-foreground">{result.realAge}</span>.
                      </p>
                      <Badge className="bg-gradient-to-r from-primary to-accent text-white">
                        +{result.points} points
                      </Badge>
                      <Button className="w-full" onClick={next}>Next player</Button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-semibold">How old is this person?</p>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          min={1}
                          max={120}
                          placeholder="Your guess"
                          value={guess}
                          onChange={(e) => setGuess(e.target.value)}
                        />
                        <Button onClick={submitGuess} disabled={busy}>
                          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guess (1)"}
                        </Button>
                      </div>
                      <div className="flex justify-between items-center">
                        <Button size="sm" variant="ghost" onClick={next}>Skip</Button>
                        <Button size="sm" variant="outline" onClick={() => navigate("/ai-credits-store")}>
                          <Gem className="w-3.5 h-3.5 mr-1.5" />Buy credits
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            )}

            {state && (
              <div className="grid grid-cols-3 gap-2 mt-4">
                <Card className="p-3 text-center">
                  <p className="text-xl font-black">{state.score.points}</p>
                  <p className="text-[11px] text-muted-foreground">Points</p>
                </Card>
                <Card className="p-3 text-center">
                  <p className="text-xl font-black">{state.score.correctGuesses}</p>
                  <p className="text-[11px] text-muted-foreground">Correct</p>
                </Card>
                <Card className="p-3 text-center">
                  <p className="text-xl font-black">{state.score.totalGuesses}</p>
                  <p className="text-[11px] text-muted-foreground">Guesses</p>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* ------------------------------------------------ My photo */}
          <TabsContent value="me">
            <Card className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                <h2 className="font-black">Add your selfie to the game</h2>
              </div>
              <p className="text-xs text-muted-foreground">
                Your real age stays private — players only see whether their guess was right. Free to join.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr] gap-4">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="relative aspect-square w-full rounded-xl border-2 border-dashed border-primary/40 overflow-hidden flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground hover:border-primary transition"
                >
                  {state?.profile?.photoUrl ? (
                    <img src={state.profile.photoUrl} alt="Your selfie" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6" />
                      <span>Upload selfie</span>
                    </>
                  )}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => joinGame(e.target.files?.[0])}
                />

                <div className="space-y-3">
                  <Input
                    type="number"
                    min={13}
                    max={120}
                    placeholder="Your real age"
                    value={myAge}
                    onChange={(e) => setMyAge(e.target.value)}
                  />
                  <Input
                    placeholder="Nickname shown to players (optional)"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    maxLength={30}
                  />
                  <Button onClick={() => joinGame(null)} disabled={uploading} className="w-full sm:w-auto">
                    {uploading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>
                    ) : state?.profile ? "Save changes" : "Join the game"}
                  </Button>
                </div>
              </div>

              {state?.profile && (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Card className="p-3 text-center">
                    <p className="text-xl font-black">{state.received.total}</p>
                    <p className="text-[11px] text-muted-foreground">Guesses on your photo</p>
                  </Card>
                  <Card className="p-3 text-center">
                    <p className="text-xl font-black">{state.received.correct}</p>
                    <p className="text-[11px] text-muted-foreground">Guessed right</p>
                  </Card>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* ------------------------------------------------ Leaderboard */}
          <TabsContent value="ranks">
            <Card className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-primary" />
                <h2 className="font-black">Top guessers</h2>
              </div>
              {leaders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No scores yet — be the first to play.</p>
              ) : (
                <ul className="divide-y">
                  {leaders.map((row, i) => (
                    <li
                      key={row.user_id}
                      className={`flex items-center gap-3 py-2.5 ${row.user_id === userId ? "font-bold" : ""}`}
                    >
                      <span className="w-6 text-sm text-muted-foreground">{i + 1}</span>
                      {row.avatar_url ? (
                        <img src={row.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-muted" />
                      )}
                      <span className="flex-1 truncate text-sm">{row.display_name}</span>
                      <span className="text-xs text-muted-foreground">{row.correct_guesses}/{row.total_guesses}</span>
                      <Badge variant="secondary">{row.points} pts</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GuessAge;
