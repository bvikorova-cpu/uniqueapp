import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, TrendingDown, Clock, Coins, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { addDays, format } from "date-fns";

const FUTURES_EMOTIONS = [
  { name: "Joy", trend: "+12%", color: "text-yellow-400", bg: "bg-yellow-500/10" },
  { name: "Love", trend: "+8%", color: "text-pink-400", bg: "bg-pink-500/10" },
  { name: "Motivation", trend: "-3%", color: "text-blue-400", bg: "bg-blue-500/10" },
  { name: "Peace", trend: "+5%", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { name: "Excitement", trend: "+15%", color: "text-orange-400", bg: "bg-orange-500/10" },
  { name: "Curiosity", trend: "-1%", color: "text-violet-400", bg: "bg-violet-500/10" },
];

interface Props { onBack: () => void; }

export function EmotionFutures({ onBack }: Props) {
  const { toast } = useToast();
  const [myBets, setMyBets] = useState<any[]>([]);
  const [placingBet, setPlacingBet] = useState<string | null>(null);

  useEffect(() => {
    fetchBets();
  }, []);

  const fetchBets = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await (supabase as any)
      .from("emotion_futures_bets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);
    if (data) setMyBets(data);
  };

  const placeBet = async (emotion: string, direction: "up" | "down") => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Sign in required", variant: "destructive" });
      return;
    }

    // Check credits
    const { data: credits } = await supabase
      .from("emotion_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!credits || credits.credits_remaining < 2) {
      toast({
        title: "Insufficient Credits",
        description: "Predictions cost 2 credits each. Purchase more credits first.",
        variant: "destructive",
      });
      return;
    }

    setPlacingBet(emotion);

    // Deduct credits
    await supabase.rpc("deduct_emotion_credits" as any, { p_user_id: user.id, p_amount: 2 });

    const resolutionDate = format(addDays(new Date(), 7), "yyyy-MM-dd");

    await (supabase as any).from("emotion_futures_bets").insert({
      user_id: user.id,
      emotion_type: emotion.toLowerCase(),
      direction,
      amount: 2,
      resolution_date: resolutionDate,
    });

    toast({
      title: "Prediction Placed! 📈",
      description: `You predicted ${emotion} will go ${direction} by ${resolutionDate}. 2 credits deducted.`,
    });

    setPlacingBet(null);
    fetchBets();
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Hub
      </Button>

      <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-cyan-500/5 to-violet-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-emerald-400" />
            Emotion Futures
          </CardTitle>
          <CardDescription>
            Predict which emotions will trend next week. Correct predictions earn 4x returns! Costs 2 credits per prediction.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FUTURES_EMOTIONS.map((emotion, i) => (
              <motion.div
                key={emotion.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`border-white/10 ${emotion.bg}`}>
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-semibold ${emotion.color}`}>{emotion.name}</h3>
                      <Badge variant="outline" className={`${emotion.trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                        {emotion.trend} this week
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Resolves: {format(addDays(new Date(), 7), "MMM d")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Coins className="h-3 w-3 text-pink-400" />
                        2 credits
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => placeBet(emotion.name, "up")}
                        disabled={placingBet === emotion.name}
                        className="border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400"
                      >
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Up
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => placeBet(emotion.name, "down")}
                        disabled={placingBet === emotion.name}
                        className="border-red-500/30 hover:bg-red-500/10 text-red-400"
                      >
                        <TrendingDown className="h-4 w-4 mr-1" />
                        Down
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* My Bets */}
      <Card className="border-white/10">
        <CardHeader>
          <CardTitle className="text-lg">My Predictions</CardTitle>
        </CardHeader>
        <CardContent>
          {myBets.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No predictions yet. Start predicting emotion trends!</p>
          ) : (
            <div className="space-y-2">
              {myBets.map((bet: any) => (
                <div key={bet.id} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/5">
                  <div className="flex items-center gap-3">
                    {bet.direction === "up" ? (
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    )}
                    <div>
                      <p className="text-sm font-medium capitalize">{bet.emotion_type} — {bet.direction}</p>
                      <p className="text-xs text-muted-foreground">Resolves: {bet.resolution_date}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={bet.resolved ? (bet.outcome === "won" ? "text-emerald-400" : "text-red-400") : "text-muted-foreground"}>
                    {bet.resolved ? (bet.outcome === "won" ? `+${bet.payout}` : "Lost") : "Pending"}
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
