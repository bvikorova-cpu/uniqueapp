import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, TrendingDown, Minus, Loader2, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Insight {
  id: string;
  week_start: string;
  metrics: Record<string, number>;
  prev_metrics: Record<string, number>;
  ai_summary: string;
  tips: { title: string; action: string }[];
  seen_at: string | null;
}

const ACTION_LABELS: Record<string, string> = {
  bio_coach: "Open Bio Coach",
  add_photo: "Add photo",
  send_openers: "Send openers",
  update_prompts: "Update prompts",
  try_video: "Record video",
};

interface Props { onAction?: (action: string) => void; }

export const WeeklyInsightsCard = ({ onAction }: Props) => {
  const { toast } = useToast();
  const [data, setData] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("dating-weekly-insights", { body: {} });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setData(data);
      if (data?.id && !data.seen_at) {
        supabase.from("dating_weekly_insights").update({ seen_at: new Date().toISOString() }).eq("id", data.id);
      }
    } catch (e: any) {
      toast({ title: "Insights failed", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <Card className="border-primary/20">
      <FloatingHowItWorks
        title={"Weekly Insights Card"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />
<CardContent className="py-8 flex justify-center">
      <Loader2 className="w-5 h-5 animate-spin text-primary" />
    </CardContent></Card>
  );
  if (!data) return null;

  const delta = (k: string) => {
    const cur = data.metrics[k] || 0; const prev = data.prev_metrics[k] || 0;
    if (prev === 0) return cur > 0 ? 100 : 0;
    return Math.round(((cur - prev) / prev) * 100);
  };

  const Metric = ({ label, k }: { label: string; k: string }) => {
    const d = delta(k);
    const Icon = d > 0 ? TrendingUp : d < 0 ? TrendingDown : Minus;
    const color = d > 0 ? "text-emerald-500" : d < 0 ? "text-rose-500" : "text-muted-foreground";
    return (
      <div className="bg-muted/40 rounded-lg p-3">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-semibold">{data.metrics[k] || 0}</p>
        <p className={`text-xs flex items-center gap-1 ${color}`}><Icon className="w-3 h-3" />{d > 0 ? "+" : ""}{d}%</p>
      </div>
    );
  };

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /> Weekly Insights</span>
          <Badge variant="outline" className="gap-1 text-xs"><Calendar className="w-3 h-3" />{data.week_start}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed italic">"{data.ai_summary}"</p>
        <div className="grid grid-cols-4 gap-2">
          <Metric label="Likes" k="likes" />
          <Metric label="Matches" k="matches" />
          <Metric label="Messages" k="messages" />
          <Metric label="Swipes" k="swipes" />
        </div>
        {data.tips?.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tips for next week</p>
            {data.tips.map((t, i) => (
              <div key={i} className="flex items-center justify-between gap-2 p-2 rounded-md bg-background/60 border border-border/50">
                <span className="text-sm">{t.title}</span>
                <Button size="sm" variant="outline" onClick={() => onAction?.(t.action)}>
                  {ACTION_LABELS[t.action] || "Open"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
