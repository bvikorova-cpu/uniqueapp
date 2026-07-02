import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Target, Clock, Loader2, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface CategoryStat {
  category: string;
  avg_iq: number;
  tests: number;
  accuracy: number;
}

interface Insights {
  total_tests: number;
  avg_7d?: number;
  avg_30d?: number;
  trend_30d?: number;
  avg_seconds_per_question?: number;
  by_category?: CategoryStat[];
  recommended_focus?: string | null;
}

export default function IQPerformanceInsights() {
  const [data, setData] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.rpc("get_iq_performance_insights");
      setData((data as unknown as Insights) ?? null);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <>
        <FloatingHowItWorks title="How IQPerformance Insights works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
        <Card className="backdrop-blur-xl bg-card/80 border-primary/20 mb-8">
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </CardContent>
      </Card>
      </>
      );
  }

  if (!data || !data.total_tests) {
    return (
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20 mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" /> Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Take an IQ test to unlock personalized insights.
          </p>
        </CardContent>
      </Card>
    );
  }

  const trend = data.trend_30d ?? 0;
  const TrendIcon = trend >= 0 ? TrendingUp : TrendingDown;
  const trendColor = trend >= 0 ? "text-green-500" : "text-red-500";
  const maxIq = Math.max(...(data.by_category ?? []).map(c => c.avg_iq), 100);

  return (
    <Card className="backdrop-blur-xl bg-card/80 border-primary/20 mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" /> Performance Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 rounded-lg bg-muted/40 text-center">
            <p className="text-[10px] uppercase text-muted-foreground">Avg 7d</p>
            <p className="text-lg font-bold">{data.avg_7d ?? "—"}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/40 text-center">
            <p className="text-[10px] uppercase text-muted-foreground">30d trend</p>
            <p className={`text-lg font-bold flex items-center justify-center gap-1 ${trendColor}`}>
              <TrendIcon className="h-4 w-4" />
              {trend > 0 ? "+" : ""}{trend}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/40 text-center">
            <p className="text-[10px] uppercase text-muted-foreground flex items-center justify-center gap-1">
              <Clock className="h-3 w-3" /> sec/q
            </p>
            <p className="text-lg font-bold">{data.avg_seconds_per_question ?? "—"}</p>
          </div>
        </div>

        {data.recommended_focus && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <Lightbulb className="h-4 w-4 text-amber-500 shrink-0" />
            <p className="text-xs">
              Focus on <Badge variant="outline" className="ml-1 capitalize">{data.recommended_focus}</Badge>
              <span className="text-muted-foreground"> — your weakest category.</span>
            </p>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-xs uppercase text-muted-foreground">By category</p>
          {(data.by_category ?? []).map(c => (
            <div key={c.category} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="capitalize font-semibold">{c.category}</span>
                <span className="text-muted-foreground">
                  {c.tests} test{c.tests > 1 ? "s" : ""} · {c.accuracy}% acc · <b className="text-foreground">{c.avg_iq}</b>
                </span>
              </div>
              <Progress value={(c.avg_iq / maxIq) * 100} className="h-1.5" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
