import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ArrowLeft, Shuffle, Loader2, Swords, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { safeInvoke } from "@/utils/safeInvoke";
import { useToast } from "@/hooks/use-toast";

const EMOTIONS = [
  { key: "joy", label: "Joy", emoji: "😄" },
  { key: "love", label: "Love", emoji: "❤️" },
  { key: "motivation", label: "Motivation", emoji: "⚡" },
  { key: "peace", label: "Peace", emoji: "☮️" },
  { key: "excitement", label: "Excitement", emoji: "🎉" },
  { key: "sadness", label: "Sadness", emoji: "💧" },
  { key: "anger", label: "Anger", emoji: "🔥" },
  { key: "fear", label: "Fear", emoji: "🌫️" },
];

const AMOUNT = 10;
const COST = 1;

interface Props { onBack: () => void; }

export function EmotionExchange({ onBack }: Props) {
  const { toast } = useToast();
  const [offer, setOffer] = useState<string | null>(null);
  const [want, setWant] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState<any>(null);
  const [pending, setPending] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [lastResult, setLastResult] = useState<any>(null);

  useEffect(() => {
    void refresh();
  }, []);

  const refresh = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [w, q, m] = await Promise.all([
      (supabase as any).from("emotion_wallets").select("*").eq("user_id", user.id).maybeSingle(),
      (supabase as any).from("emotion_exchange_queue").select("*").eq("user_id", user.id).eq("status", "pending").maybeSingle(),
      (supabase as any).from("emotion_exchange_matches").select("*").order("created_at", { ascending: false }).limit(8),
    ]);
    setWallet(w.data ?? null);
    setPending(q.data ?? null);
    setMatches(m.data ?? []);
  };

  const balanceOf = (key: string) => Number(wallet?.[`${key}_balance`]) || 0;

  const handleJoin = async () => {
    if (!offer || !want || offer === want || loading) return;
    setLoading(true);
    setLastResult(null);
    const { data, error } = await safeInvoke<any>("emotion-exchange-match", {
      body: { action: "join", offer_emotion: offer, want_emotion: want },
    });
    setLoading(false);

    if (error || !data || data.error) {
      const msg = error || data?.error || "Try again";
      toast({
        title: msg.toLowerCase().includes("credit") ? "Insufficient credits" : "Exchange failed",
        description: msg.toLowerCase().includes("credit")
          ? `You need ${COST} AI credit to enter the exchange.`
          : msg,
        variant: "destructive",
      });
      return;
    }

    window.dispatchEvent(new Event("ai-credits-updated"));
    setLastResult(data);
    await refresh();

    if (data.status === "matched") {
      toast({
        title: "🤝 Matched!",
        description: `You gave ${AMOUNT} ${data.gave?.emotion} and received ${AMOUNT} ${data.received?.emotion} from @user${data.opponent_short}.`,
      });
    } else {
      toast({
        title: "Waiting for an opponent",
        description: "You're in the exchange pool — you'll be swapped as soon as someone matches your offer.",
      });
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    await safeInvoke("emotion-exchange-match", { body: { action: "cancel" } });
    setLoading(false);
    await refresh();
    toast({ title: "Offer cancelled" });
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
            Get randomly matched with another user and swap {AMOUNT} emotion units. Entry costs {COST} credit.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {pending ? (
            <div className="rounded-xl border border-cyan-500/20 bg-background/40 p-4 space-y-3">
              <p className="text-sm font-medium">You're in the pool</p>
              <p className="text-xs text-muted-foreground">
                Offering {pending.offer_amount} {pending.offer_emotion} → looking for {pending.want_emotion}.
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={refresh} disabled={loading}>Refresh</Button>
                <Button size="sm" variant="ghost" onClick={handleCancel} disabled={loading} className="gap-1">
                  <X className="h-4 w-4" /> Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <p className="text-sm font-medium mb-3">You give ({AMOUNT} units):</p>
                <div className="grid grid-cols-4 gap-2">
                  {EMOTIONS.map((e) => (
                    <motion.button
                      key={e.key}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setOffer(e.key)}
                      disabled={balanceOf(e.key) < AMOUNT}
                      className={`p-2.5 rounded-xl border text-center transition-all disabled:opacity-40 ${
                        offer === e.key
                          ? "border-cyan-500 bg-cyan-500/20"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <span className="text-xl block">{e.emoji}</span>
                      <span className="text-[10px] font-medium block">{e.label}</span>
                      <span className="text-[10px] text-muted-foreground">{balanceOf(e.key)}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-3">You want ({AMOUNT} units):</p>
                <div className="grid grid-cols-4 gap-2">
                  {EMOTIONS.map((e) => (
                    <motion.button
                      key={e.key}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setWant(e.key)}
                      disabled={offer === e.key}
                      className={`p-2.5 rounded-xl border text-center transition-all disabled:opacity-40 ${
                        want === e.key
                          ? "border-pink-500 bg-pink-500/20"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <span className="text-xl block">{e.emoji}</span>
                      <span className="text-[10px] font-medium block">{e.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleJoin}
                disabled={loading || !offer || !want || offer === want}
                className="w-full gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Swords className="h-4 w-4" />}
                {loading ? "Finding an opponent..." : `Find random match (${COST} credit)`}
              </Button>
            </>
          )}

          {lastResult?.status === "matched" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm"
            >
              Swapped with <span className="font-medium">@user{lastResult.opponent_short}</span>: gave{" "}
              {lastResult.gave?.amount} {lastResult.gave?.emotion}, received {lastResult.received?.amount}{" "}
              {lastResult.received?.emotion}.
            </motion.div>
          )}

          {matches.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Your recent swaps</p>
              {matches.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-2.5 text-xs">
                  <span>
                    {m.emotion_a} × {m.amount_a} ⇄ {m.emotion_b} × {m.amount_b}
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
