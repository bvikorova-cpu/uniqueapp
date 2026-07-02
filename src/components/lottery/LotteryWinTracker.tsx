import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Search, CheckCircle, TrendingUp, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface LotteryWinTrackerProps {
  onBack: () => void;
}

export function LotteryWinTracker({ onBack }: LotteryWinTrackerProps) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalGenerations, setTotalGenerations] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }

      const { data, count } = await (supabase as any)
        .from("lottery_generations")
        .select("*", { count: "exact" })
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      setResults(data || []);
      setTotalGenerations(count || 0);
      setLoading(false);
    };
    fetchData();
  }, []);

  const STATS = [
    { label: "Total Generated", value: totalGenerations.toString(), icon: Search, color: "text-blue-400" },
    { label: "Lotteries Played", value: results.length > 0 ? [...new Set(results.map((r: any) => r.lottery_type))].length.toString() : "0", icon: CheckCircle, color: "text-emerald-400" },
    { label: "Latest", value: results[0]?.lottery_type || "—", icon: Trophy, color: "text-yellow-400" },
    { label: "Status", value: results.length > 0 ? "Active" : "New", icon: TrendingUp, color: "text-violet-400" },
  ];

  if (loading) {
    return (
      <>
        <FloatingHowItWorks
          title='Lottery Win Tracker'
          steps={[
          { title: 'Open the tool', desc: 'Launch the Lottery Win Tracker panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
        />
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
            Win Tracker
          </h2>
          <p className="text-sm text-muted-foreground">Track your generated numbers and results</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STATS.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="bg-card/80 backdrop-blur-xl border-border/50">
              <CardContent className="pt-4 pb-4 text-center">
                <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                <p className="text-xl font-black">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="bg-card/80 backdrop-blur-xl border-border/50">
        <CardHeader>
          <CardTitle className="font-black flex items-center gap-2">
            <Search className="h-5 w-5 text-emerald-400" />
            Your Generated Numbers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {results.length === 0 ? (
            <div className="text-center py-8">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm text-muted-foreground">No generations yet. Use the AI generator to create your first numbers!</p>
            </div>
          ) : (
            results.map((result: any, i: number) => (
              <motion.div key={result.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }} className="p-4 rounded-xl bg-muted/30 border border-border/30">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold text-sm">{result.lottery_type || "Lottery"}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(result.created_at).toLocaleDateString()}</p>
                  </div>
                  <Badge className="bg-primary/20 text-primary border-primary/30">Generated</Badge>
                </div>
                {result.numbers && (
                  <div className="flex flex-wrap gap-1.5">
                    {(Array.isArray(result.numbers) ? result.numbers : []).map((num: number, idx: number) => (
                      <div key={idx} className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-black text-primary">
                        {num}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
