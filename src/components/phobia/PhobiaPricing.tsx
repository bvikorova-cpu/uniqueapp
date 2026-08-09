import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAICredits } from "@/hooks/useAICredits";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const ACTION_COSTS = [
  { label: "AI Phobia Detection", cost: 3, desc: "Analyse your description and create a phobia profile" },
  { label: "AI Cure Plan", cost: 3, desc: "Multi-session desensitisation programme" },
  { label: "AI Therapist Chat", cost: 3, desc: "Guided therapy conversation" },
  { label: "Exposure Session", cost: 2, desc: "Progressive exposure simulation" },
];

export function PhobiaPricing() {
  const navigate = useNavigate();
  const { totalBalance, loading } = useAICredits();

  if (loading) return null;

  return (
    <>
      <FloatingHowItWorks
        title={"Phobia Credits - How it works"}
        steps={[
          { title: "Check balance", desc: "See your platform AI credit balance at the top." },
          { title: "Review costs", desc: "Every phobia tool has a fixed credit price — no subscription." },
          { title: "Top up", desc: "Buy credits in the unified AI Credits store whenever you need them." },
          { title: "Use tools", desc: "Credits are deducted only after a successful AI result." },
        ]}
      />
      <div className="space-y-8">
        <Card className="bg-card/80 backdrop-blur-xl border-border/50">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Your AI credits</p>
                  <p className="text-2xl sm:text-3xl font-black">
                    {totalBalance}{" "}
                    <span className="text-sm font-normal text-muted-foreground">credits</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">Credit based — no subscription</Badge>
                <Button size="sm" onClick={() => navigate("/ai-credits")} className="gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> Top up
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          <h3 className="text-lg font-black mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Credit costs
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ACTION_COSTS.map((a, i) => (
              <motion.div
                key={a.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card className="bg-card/80 backdrop-blur-xl border-border/50 h-full">
                  <CardContent className="p-5 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-sm">{a.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{a.desc}</p>
                    </div>
                    <Badge className="bg-primary/15 text-primary border-primary/30 shrink-0">
                      {a.cost} cr
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <Card className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/30">
          <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />
          <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xl font-black">Need more credits?</h3>
              <p className="text-sm text-muted-foreground">
                Phobia Network uses the same AI credits as the rest of the platform — buy once, use anywhere.
              </p>
            </div>
            <Button onClick={() => navigate("/ai-credits")} className="gap-1.5 shrink-0">
              <CreditCard className="h-4 w-4" /> Open AI Credits store
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
