import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarRange, TrendingUp, TrendingDown, Brain, Clock, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
type Recap = {
  tests_this_week: number;
  tests_last_week: number;
  avg_iq_this_week: number;
  best_iq_this_week: number;
  iq_delta: number;
  top_category: string | null;
  total_time_seconds: number;
  week_start: string;
};

const fmtTime = (s: number) => {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
};

const IQWeeklyRecap = () => {
  const [data, setData] = useState<Recap | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }
      const { data: rows } = await supabase.rpc("get_iq_weekly_recap");
      setData((rows as Recap[] | null)?.[0] ?? null);
      setLoading(false);
    })();
  }, []);

  if (loading) return null;
  if (!data) return null;

  const delta = Number(data.iq_delta) || 0;
  const positive = delta >= 0;
  const testDelta = data.tests_this_week - data.tests_last_week;

  return (
    <>
      <FloatingHowItWorks title="How IQWeekly Recap works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-gradient-to-br from-primary/10 via-card/50 to-accent/10 backdrop-blur border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarRange className="w-5 h-5 text-primary" /> Weekly Recap
          <Badge variant="outline" className="ml-auto text-xs">
            Week of {new Date(data.week_start).toLocaleDateString()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-lg bg-background/40 border border-border/40 p-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground"><Brain className="w-3 h-3" /> Tests</div>
            <div className="text-2xl font-bold">{data.tests_this_week}</div>
            <div className={`text-xs ${testDelta >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
              {testDelta >= 0 ? "+" : ""}{testDelta} vs last week
            </div>
          </div>
          <div className="rounded-lg bg-background/40 border border-border/40 p-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">Avg IQ</div>
            <div className="text-2xl font-bold">{data.avg_iq_this_week}</div>
            <div className={`flex items-center gap-1 text-xs ${positive ? "text-emerald-500" : "text-rose-500"}`}>
              {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {positive ? "+" : ""}{delta}
            </div>
          </div>
          <div className="rounded-lg bg-background/40 border border-border/40 p-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground"><Trophy className="w-3 h-3" /> Best</div>
            <div className="text-2xl font-bold">{data.best_iq_this_week || "—"}</div>
            <div className="text-xs text-muted-foreground">peak this week</div>
          </div>
          <div className="rounded-lg bg-background/40 border border-border/40 p-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="w-3 h-3" /> Time</div>
            <div className="text-2xl font-bold">{fmtTime(data.total_time_seconds)}</div>
            <div className="text-xs text-muted-foreground">trained</div>
          </div>
        </div>
        {data.top_category && (
          <div className="mt-4 text-sm">
            <span className="text-muted-foreground">Strongest category this week: </span>
            <span className="font-semibold capitalize">{data.top_category}</span>
          </div>
        )}
      </CardContent>
    </Card>
    </>
    );
};

export default IQWeeklyRecap;
