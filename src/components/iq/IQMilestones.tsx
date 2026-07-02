import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Calendar, Flame, Layers, Medal, Star, Trophy, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
type Milestones = {
  total_tests: number;
  first_test_at: string | null;
  best_iq: number;
  best_iq_at: string | null;
  first_120_at: string | null;
  first_130_at: string | null;
  first_140_at: string | null;
  longest_daily_streak: number;
  categories_tried: number;
};

const fmt = (s: string | null) => (s ? new Date(s).toLocaleDateString() : "—");

const IQMilestones = () => {
  const [data, setData] = useState<Milestones | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }
      const { data: rows } = await supabase.rpc("get_iq_milestones");
      setData((rows as Milestones[] | null)?.[0] ?? null);
      setLoading(false);
    })();
  }, []);

  if (loading || !data || data.total_tests === 0) return null;

  const items = [
    { icon: Star, label: "First Test", value: fmt(data.first_test_at), achieved: !!data.first_test_at, gradient: "from-blue-500 to-cyan-500" },
    { icon: Trophy, label: "Personal Best", value: data.best_iq ? `${data.best_iq} IQ` : "—", achieved: data.best_iq > 0, gradient: "from-yellow-500 to-amber-500" },
    { icon: Medal, label: "Reached 120", value: fmt(data.first_120_at), achieved: !!data.first_120_at, gradient: "from-emerald-500 to-teal-500" },
    { icon: Award, label: "Reached 130", value: fmt(data.first_130_at), achieved: !!data.first_130_at, gradient: "from-purple-500 to-violet-500" },
    { icon: Zap, label: "Reached 140", value: fmt(data.first_140_at), achieved: !!data.first_140_at, gradient: "from-pink-500 to-rose-500" },
    { icon: Flame, label: "Longest Streak", value: `${data.longest_daily_streak} days`, achieved: data.longest_daily_streak > 0, gradient: "from-orange-500 to-red-500" },
    { icon: Layers, label: "Categories Tried", value: `${data.categories_tried}`, achieved: data.categories_tried > 0, gradient: "from-indigo-500 to-blue-500" },
    { icon: Calendar, label: "Total Tests", value: `${data.total_tests}`, achieved: data.total_tests > 0, gradient: "from-fuchsia-500 to-pink-500" },
  ];

  return (
    <>
      <FloatingHowItWorks title="How IQMilestones works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" /> Milestones
          <Badge variant="outline" className="ml-auto text-xs">
            {items.filter(i => i.achieved).length}/{items.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {items.map((m, i) => {
            const Icon = m.icon;
            return (
              <div
                key={i}
                className={`relative rounded-lg p-3 border transition-all ${
                  m.achieved
                    ? "border-primary/30 bg-background/40"
                    : "border-border/30 bg-background/20 opacity-50 grayscale"
                }`}
              >
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${m.gradient} flex items-center justify-center mb-2`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-xs text-muted-foreground">{m.label}</div>
                <div className="text-sm font-semibold truncate">{m.value}</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
    </>
    );
};

export default IQMilestones;
