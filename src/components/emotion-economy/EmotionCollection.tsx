import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ArrowLeft, Library, Loader2, Plus, RefreshCw } from "lucide-react";
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

const BUY_COST = 2;
const BUY_AMOUNT = 10;

interface Props { onBack: () => void; }

export function EmotionCollection({ onBack }: Props) {
  const { toast } = useToast();
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await (supabase as any)
      .from("emotion_wallets")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    const next: Record<string, number> = {};
    for (const e of EMOTIONS) next[e.key] = Number(data?.[`${e.key}_balance`]) || 0;
    setBalances(next);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const total = Object.values(balances).reduce((a, b) => a + b, 0);
  const max = Math.max(1, ...Object.values(balances));

  const handleBuy = async (emotion: string) => {
    setBuying(emotion);
    const { data, error } = await safeInvoke<any>("verify-emotion-insurance", {
      body: { action: "collection_buy", emotion },
    });
    setBuying(null);

    if (error || !data || data.error) {
      const msg = error || data?.error || "Try again";
      toast({
        title: msg.toLowerCase().includes("credit") ? "Insufficient credits" : "Purchase failed",
        description: msg.toLowerCase().includes("credit")
          ? `You need ${BUY_COST} AI credits to add ${BUY_AMOUNT} units.`
          : msg,
        variant: "destructive",
      });
      return;
    }

    window.dispatchEvent(new Event("ai-credits-updated"));
    toast({ title: "Added to your collection", description: `+${BUY_AMOUNT} ${emotion} for ${BUY_COST} credits.` });
    void load();
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Hub
      </Button>

      <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-cyan-500/5 to-violet-500/5">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Library className="h-6 w-6 text-emerald-400" />
                My Emotion Collection
              </CardTitle>
              <CardDescription>
                See how much you have of each emotion. Want more of one? Add {BUY_AMOUNT} units for {BUY_COST} credits.
              </CardDescription>
            </div>
            <Button size="icon" variant="ghost" onClick={() => void load()} aria-label="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="text-sm text-muted-foreground">Total in collection</span>
                <Badge variant="outline" className="font-bold">{total}</Badge>
              </div>

              <div className="space-y-2">
                {EMOTIONS.map((e, i) => {
                  const value = balances[e.key] ?? 0;
                  return (
                    <motion.div
                      key={e.key}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.03 * i }}
                      className={`rounded-xl border border-white/10 bg-gradient-to-br ${e.tone} p-3`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl shrink-0">{e.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-bold truncate">{e.label}</p>
                            <span className="text-sm font-black tabular-nums">{value}</span>
                          </div>
                          <div className="mt-1.5 h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-foreground/40"
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.round((value / max) * 100)}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 shrink-0"
                          disabled={buying !== null}
                          onClick={() => void handleBuy(e.key)}
                        >
                          {buying === e.key ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Plus className="h-3.5 w-3.5" />
                          )}
                          <span className="text-xs">{BUY_AMOUNT}</span>
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
