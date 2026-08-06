import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Shuffle, Loader2, X, Check, RotateCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { safeInvoke } from "@/utils/safeInvoke";
import { useToast } from "@/hooks/use-toast";

const EMOTIONS = [
  { key: "joy", label: "Joy", emoji: "😄", tone: "from-yellow-400/20 to-orange-400/10" },
  { key: "love", label: "Love", emoji: "❤️", tone: "from-pink-400/20 to-rose-400/10" },
  { key: "motivation", label: "Motivation", emoji: "⚡", tone: "from-amber-400/20 to-lime-400/10" },
  { key: "peace", label: "Peace", emoji: "☮️", tone: "from-cyan-400/20 to-emerald-400/10" },
  { key: "excitement", label: "Excitement", emoji: "🎉", tone: "from-violet-400/20 to-fuchsia-400/10" },
  { key: "sadness", label: "Sadness", emoji: "💧", tone: "from-sky-400/20 to-blue-400/10" },
  { key: "anger", label: "Anger", emoji: "🔥", tone: "from-red-400/20 to-orange-500/10" },
  { key: "fear", label: "Fear", emoji: "🌫️", tone: "from-slate-400/20 to-zinc-400/10" },
];

const LINES: Record<string, string[]> = {
  joy: ["Had a really good day and wants to pass it on.", "Laughing too much to keep it all."],
  love: ["Feeling soft-hearted tonight.", "Has more warmth than they need right now."],
  motivation: ["Just finished a workout and is buzzing.", "On a streak and sharing the fire."],
  peace: ["Calm after a long walk.", "Quiet mind, happy to share it."],
  excitement: ["Something great just happened.", "Can't sit still — take some of this."],
  sadness: ["Wants to let a heavy mood go.", "Trading the blues away."],
  anger: ["Needs to hand off some heat.", "Frustrated and wants it gone."],
  fear: ["Nervous about tomorrow, wants a swap.", "Would rather feel something else."],
};

const COST = 1;

interface Props { onBack: () => void; }

interface Candidate {
  id: string;
  emotion: string;
  line: string;
  handle: string;
}

const meta = (key: string) => EMOTIONS.find((e) => e.key === key) ?? EMOTIONS[0];

function buildDeck(exclude: string): Candidate[] {
  const pool = EMOTIONS.filter((e) => e.key !== exclude);
  return Array.from({ length: 6 }, (_, i) => {
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const lines = LINES[pick.key] ?? ["Looking for a swap."];
    return {
      id: `${Date.now()}-${i}`,
      emotion: pick.key,
      line: lines[Math.floor(Math.random() * lines.length)],
      handle: `user${Math.floor(1000 + Math.random() * 8999)}`,
    };
  });
}

export function EmotionExchange({ onBack }: Props) {
  const { toast } = useToast();
  const [give, setGive] = useState<string | null>(null);
  const [deck, setDeck] = useState<Candidate[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [swipe, setSwipe] = useState<"left" | "right" | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    void refresh();
  }, []);

  const refresh = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await (supabase as any)
      .from("emotion_exchange_matches")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6);
    setHistory(data ?? []);
  };

  const startDeck = (emotion: string) => {
    setGive(emotion);
    setDeck(buildDeck(emotion));
    setIndex(0);
  };

  const current = deck[index];

  const next = () => {
    setSwipe(null);
    setIndex((i) => i + 1);
  };

  const handleSkip = () => {
    if (loading || !current) return;
    setSwipe("left");
    setTimeout(next, 220);
  };

  const handleAccept = async () => {
    if (loading || !current || !give) return;
    setLoading(true);
    const { data, error } = await safeInvoke<any>("verify-emotion-insurance", {
      body: { action: "exchange_match", offer_emotion: give, want_emotion: current.emotion },
    });
    setLoading(false);

    if (error || !data || data.error) {
      const msg = error || data?.error || "Try again";
      toast({
        title: msg.toLowerCase().includes("credit") ? "Insufficient credits" : "Swap failed",
        description: msg.toLowerCase().includes("credit")
          ? `You need ${COST} AI credit for a swap.`
          : msg,
        variant: "destructive",
      });
      return;
    }

    window.dispatchEvent(new Event("ai-credits-updated"));
    setSwipe("right");
    toast({
      title: data.status === "matched" ? "🤝 Swapped!" : "Offer sent",
      description: data.status === "matched"
        ? `You traded ${meta(give).label} for ${meta(current.emotion).label}.`
        : `Waiting for someone who wants your ${meta(give).label}.`,
    });
    setTimeout(next, 260);
    void refresh();
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Hub
      </Button>

      <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 via-violet-500/5 to-pink-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shuffle className="h-6 w-6 text-cyan-400" />
            Emotion Exchange
          </CardTitle>
          <CardDescription>
            Pick the emotion you want to trade away — AI shows you matching people. Tap ✓ to swap or ✕ to skip. Each
            swap costs {COST} credit.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!give ? (
            <div>
              <p className="text-sm font-medium mb-3">What do you want to trade away?</p>
              <div className="grid grid-cols-4 gap-2">
                {EMOTIONS.map((e) => (
                  <motion.button
                    key={e.key}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => startDeck(e.key)}
                    className="p-2.5 rounded-xl border border-white/10 bg-white/5 text-center transition-all hover:border-cyan-500/50"
                  >
                    <span className="text-xl block">{e.emoji}</span>
                    <span className="text-[10px] font-medium block">{e.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="gap-1">
                  Trading away {meta(give).emoji} {meta(give).label}
                </Badge>
                <Button size="sm" variant="ghost" onClick={() => setGive(null)} className="gap-1 text-xs">
                  <RotateCw className="h-3.5 w-3.5" /> Change
                </Button>
              </div>

              <div className="relative min-h-[300px]">
                <AnimatePresence mode="wait">
                  {current ? (
                    <motion.div
                      key={current.id}
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        x: swipe === "left" ? -320 : swipe === "right" ? 320 : 0,
                        rotate: swipe === "left" ? -12 : swipe === "right" ? 12 : 0,
                      }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                      className={`rounded-2xl border border-white/15 bg-gradient-to-br ${meta(current.emotion).tone} p-6 text-center backdrop-blur-sm`}
                    >
                      <span className="text-6xl block mb-3">{meta(current.emotion).emoji}</span>
                      <p className="text-lg font-bold">{meta(current.emotion).label}</p>
                      <p className="text-xs text-muted-foreground mb-3">@{current.handle}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{current.line}</p>
                      <p className="mt-4 text-xs font-medium">
                        {meta(give).emoji} {meta(give).label} ⇄ {meta(current.emotion).emoji}{" "}
                        {meta(current.emotion).label}
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center"
                    >
                      <p className="text-sm text-muted-foreground mb-4">No more matches in this batch.</p>
                      <Button onClick={() => startDeck(give)} className="gap-2">
                        <RotateCw className="h-4 w-4" /> Load new matches
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {current && (
                <div className="flex items-center justify-center gap-6">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleSkip}
                    disabled={loading}
                    className="h-14 w-14 rounded-full border-destructive/40 hover:bg-destructive/10"
                    aria-label="Skip"
                  >
                    <X className="h-6 w-6 text-destructive" />
                  </Button>
                  <Button
                    size="icon"
                    onClick={handleAccept}
                    disabled={loading}
                    className="h-14 w-14 rounded-full bg-emerald-500 hover:bg-emerald-600"
                    aria-label="Accept swap"
                  >
                    {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Check className="h-6 w-6" />}
                  </Button>
                </div>
              )}
            </>
          )}

          {history.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Your recent swaps</p>
              {history.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-2.5 text-xs">
                  <span>
                    {meta(m.emotion_a).emoji} {meta(m.emotion_a).label} ⇄ {meta(m.emotion_b).emoji}{" "}
                    {meta(m.emotion_b).label}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {new Date(m.created_at).toLocaleDateString()}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default EmotionExchange;
