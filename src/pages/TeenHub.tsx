import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, ShieldCheck, Sparkles } from "lucide-react";
import { ParentalGate, useParentalGate } from "@/components/kids/ParentalGate";
import { useTeenCredits } from "@/hooks/useTeenCredits";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const MODULES = [
  { key: "homework_pro",    title: "Homework Pro",     emoji: "📘", cost: 4, path: "/teen-homework-pro",    desc: "Step-by-step problem solving" },
  { key: "essay_coach",     title: "Essay Coach",      emoji: "✍️", cost: 5, path: "/teen-essay-coach",     desc: "Feedback + revised opening" },
  { key: "mental_wellness", title: "Mental Wellness",  emoji: "🌱", cost: 3, path: "/teen-mental-wellness", desc: "Journaling & reframing" },
  { key: "study_planner",   title: "Study Planner",    emoji: "📅", cost: 3, path: "/teen-study-planner",   desc: "Weekly plans with Pomodoro" },
  { key: "skill_builder",   title: "Skill Builder",    emoji: "🚀", cost: 4, path: "/teen-skill-builder",   desc: "4-week skill roadmaps" },
  { key: "social_coach",    title: "Social Coach",     emoji: "💬", cost: 3, path: "/teen-social-coach",    desc: "Scripts for tough talks" },
  { key: "career",          title: "Career Counselor", emoji: "🎯", cost: 0, path: "/teen-career-counselor", desc: "Find your future path" },
];

export default function TeenHub() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isVerified, checkVerification } = useParentalGate("teen_parental_gate_verified");
  const { balance, isLoading, purchase, refresh } = useTeenCredits();

  // Handle Stripe success redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (params.get("payment") === "success" && sessionId) {
      supabase.functions
        .invoke("verify-credits-payment", { body: { session_id: sessionId } })
        .then(() => {
          toast.success("Credits added!");
          refresh();
          window.history.replaceState({}, "", "/teen-hub");
        });
    }
  }, [refresh]);

  // Track visit
  useEffect(() => {
    if (!user || !isVerified) return;
    supabase
      .from("teen_module_visits")
      .upsert(
        { user_id: user.id, module: "hub", visit_count: 1, last_visit: new Date().toISOString() },
        { onConflict: "user_id,module", ignoreDuplicates: false }
      )
      .then(() => {});
  }, [user, isVerified]);

  const handleBuy = async () => {
    const url = await purchase(20);
    if (url) window.location.href = url;
  };

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <ParentalGate
          isOpen
          onSuccess={() => checkVerification()}
          featureName="Teen Hub"
          storageKey="teen_parental_gate_verified"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-16 max-w-6xl">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-3">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium">Ages 13–17 · Parent-approved</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Teen Hub
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            AI tools built for high-schoolers — homework, essays, wellness,
            study plans, skills & social coaching.
          </p>
        </div>

        {/* Credit banner */}
        <Card className="mb-6 border-2 border-primary/30 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
          <CardContent className="py-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Coins className="w-6 h-6 text-primary" />
              <div>
                <p className="font-bold text-sm">
                  Teen Credits: {isLoading ? "…" : balance}
                </p>
                <p className="text-xs text-muted-foreground">
                  Shared across all Teen AI modules
                </p>
              </div>
            </div>
            <Button onClick={handleBuy} size="sm">
              <Sparkles className="w-4 h-4 mr-1" /> Buy 20 credits (€10)
            </Button>
          </CardContent>
        </Card>

        {/* Module grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map((m) => (
            <Card
              key={m.key}
              role="button"
              tabIndex={0}
              onClick={() => navigate(m.path)}
              onKeyDown={(e) => e.key === "Enter" && navigate(m.path)}
              className="cursor-pointer hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <span className="text-4xl">{m.emoji}</span>
                  {m.cost > 0 ? (
                    <Badge variant="secondary" className="gap-1">
                      <Coins className="w-3 h-3" /> {m.cost}
                    </Badge>
                  ) : (
                    <Badge variant="outline">Free</Badge>
                  )}
                </div>
                <CardTitle className="text-lg mt-2">{m.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{m.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mt-8 text-xs text-muted-foreground text-center max-w-xl mx-auto">
          Teen Hub follows our safety guidelines. Mental Wellness is not a
          substitute for medical or psychological care. If you're in crisis,
          contact a trusted adult or local helpline.
        </p>
      </main>
    </div>
  );
}
