import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Sparkles, Loader2, Calendar, FileText, ChevronDown, ChevronUp } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface ActionPlan {
  id: string;
  title: string;
  plan_content: string;
  mentor_area: string;
  week_start: string;
  status: string;
  credits_used: number;
  created_at: string;
}

export function AIActionPlans() {
  const [plans, setPlans] = useState<ActionPlan[]>([]);
  const [generating, setGenerating] = useState(false);
  const [selectedArea, setSelectedArea] = useState("career");
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("mentor_action_plans")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);
    setPlans((data as ActionPlan[]) || []);
  };

  const generatePlan = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("mentor-ai-tools", {
        body: { action: "generate-action-plan", mentorArea: selectedArea },
      });
      if (error) throw error;
      toast({ title: "Action Plan Generated! 🎯", description: `${data.title} — 5 credits used` });
      await loadPlans();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to generate", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How AIAction Plans works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" /> AI Weekly Action Plans
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Select value={selectedArea} onValueChange={setSelectedArea}>
            <SelectTrigger className="flex-1 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="career">Career</SelectItem>
              <SelectItem value="fitness">Fitness</SelectItem>
              <SelectItem value="mindset">Mindset</SelectItem>
              <SelectItem value="relationships">Relationships</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={generatePlan} disabled={generating} size="sm" className="gap-1.5">
            {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            Generate — 5 CR
          </Button>
        </div>

        {plans.length === 0 ? (
          <div className="text-center py-6">
            <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No action plans yet</p>
            <p className="text-xs text-muted-foreground">Generate your first personalized weekly plan!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {plans.map((plan) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-border/30 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
                  className="w-full flex items-center justify-between p-3 hover:bg-muted/20 transition-colors text-left"
                >
                  <div>
                    <p className="text-sm font-medium">{plan.title}</p>
                    <p className="text-xs text-muted-foreground">{new Date(plan.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs capitalize">{plan.mentor_area}</Badge>
                    {expandedPlan === plan.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </button>
                <AnimatePresence>
                  {expandedPlan === plan.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3 prose prose-sm dark:prose-invert max-w-none text-xs">
                        <ReactMarkdown>{plan.plan_content}</ReactMarkdown>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
    </>
    );
}
