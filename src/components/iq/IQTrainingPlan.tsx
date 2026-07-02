import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface PlanItem {
  domain: string;
  score: number;
  recommendation: string;
}

const labelMap: Record<string, string> = {
  memory: "Memory", logic: "Logic", spatial: "Spatial",
  verbal: "Verbal", speed: "Speed", pattern: "Pattern", general: "General",
};

export default function IQTrainingPlan() {
  const [plan, setPlan] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase.rpc("get_iq_training_plan");
      setPlan((data ?? []) as PlanItem[]);
      setLoading(false);
    })();
  }, []);

  return (
    <>
      <FloatingHowItWorks title="How IQTraining Plan works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <div className="mb-8">
      <h2 className="text-xl sm:text-2xl font-black mb-4">🎯 Personalised Training Plan</h2>
      <Card className="bg-gradient-to-br from-violet-500/5 to-purple-500/5 border-violet-500/20">
        <CardHeader className="p-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-400" />
            Your weakest 3 areas — focus here
          </CardTitle>
          <CardDescription className="text-xs">Updated every test you complete</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2">
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto my-4" />
          ) : plan.length === 0 ? (
            <div className="text-center py-6">
              <Brain className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Take an IQ test to unlock your personalised plan.</p>
            </div>
          ) : (
            plan.map((item, i) => (
              <motion.div
                key={item.domain + i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/30"
              >
                <Badge variant="outline" className="shrink-0 text-[10px]">
                  {labelMap[item.domain] ?? item.domain}: {item.score}
                </Badge>
                <p className="text-xs text-foreground/80 flex-1">{item.recommendation}</p>
              </motion.div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
    </>
    );
}
