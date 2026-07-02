import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMentorPremium, useMentorCheckout, type MentorArea } from "@/hooks/useMentorRouter";
import { Crown, Check, Sparkles, Briefcase, Dumbbell, Brain, Heart } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const __HIW_MENTORPREMIUM_STEPS = [
  { title: 'Compare plans', desc: 'Monthly vs annual — annual saves the most.' },
  { title: 'Pay securely', desc: 'Stripe checkout completes in seconds.' },
  { title: 'Unlock everything', desc: 'Unlimited sessions, deeper analytics, priority voice.' },
  { title: 'Cancel anytime', desc: 'Manage or cancel from your account settings.' }
];
const __HIW_MENTORPREMIUM = { title: 'Mentor Premium', intro: 'Subscribe to unlock unlimited AI coaching.', steps: __HIW_MENTORPREMIUM_STEPS };


const AREAS: { id: MentorArea; title: string; icon: any; tagline: string; accent: string }[] = [
  { id: "career", title: "Career Coach", icon: Briefcase, tagline: "Promotions, interviews, leadership", accent: "from-blue-500/20 to-indigo-500/10" },
  { id: "fitness", title: "Fitness Coach", icon: Dumbbell, tagline: "Strength, energy, body goals", accent: "from-emerald-500/20 to-lime-500/10" },
  { id: "mindset", title: "Mindset Coach", icon: Brain, tagline: "Focus, confidence, resilience", accent: "from-purple-500/20 to-fuchsia-500/10" },
  { id: "relationships", title: "Relationships Coach", icon: Heart, tagline: "Connection, boundaries, love", accent: "from-rose-500/20 to-pink-500/10" },
];

const FEATURES = [
  "Conversation memory across sessions",
  "Named skill progress + practice loops",
  "Personality assessment + insights",
  "Role-play scenarios",
  "Anonymous 360° feedback",
  "Daily AI nudges",
  "SMART goals with milestones",
  "Reflection prompts by mood",
  "Habit tracking with freeze tokens",
  "4 coach personalities",
  "Session summaries",
  "Voice journaling with emotion detection",
  "21-day CBT programs",
  "Unlimited AI chat with context",
];

export default function MentorPremium() {
  const { data: sub } = useMentorPremium();
  const checkout = useMentorCheckout();
  const areas = sub?.areas ?? {};

  return (
    <>
      <Helmet><title>Personal Mentor Premium · Unique</title></Helmet>
      <div className="container mx-auto px-4 pt-20 pb-12 max-w-6xl">
        <div className="text-center mb-8">
          <Crown className="w-12 h-12 mx-auto text-primary mb-3" />
          <h1 className="text-4xl font-black mb-2">Personal Mentor Premium</h1>
          <p className="text-muted-foreground">Each coach is its own subscription — pick only the areas you need.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 mb-10">
          {AREAS.map((a) => {
            const status = areas[a.id];
            const active = !!status?.subscribed;
            return (
              <Card key={a.id} className={`backdrop-blur-xl bg-gradient-to-br ${a.accent} border-border/50 relative overflow-hidden`}>
      <FloatingHowItWorks title={__HIW_MENTORPREMIUM.title} intro={__HIW_MENTORPREMIUM.intro} steps={__HIW_MENTORPREMIUM.steps} />
                {active && (
                  <span className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    ✓ Active · {status?.plan}
                  </span>
                )}
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl bg-background/60 flex items-center justify-center">
                      <a.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-black text-lg">{a.title}</h2>
                      <p className="text-xs text-muted-foreground">{a.tagline}</p>
                    </div>
                  </div>

                  {active ? (
                    <p className="text-sm text-muted-foreground mb-3">
                      Renews {status?.current_period_end ? new Date(status.current_period_end).toLocaleDateString() : "—"}.
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground mb-3">
                      Unlock all 18 mentor tools for the <strong>{a.title.toLowerCase()}</strong>.
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      disabled={checkout.isPending || active}
                      onClick={() => checkout.mutate({ plan: "monthly", area: a.id })}
                    >
                      {active && status?.plan === "monthly" ? "Current" : (<><span className="font-bold">€14.99</span>&nbsp;/mo</>)}
                    </Button>
                    <Button
                      disabled={checkout.isPending || active}
                      onClick={() => checkout.mutate({ plan: "yearly", area: a.id })}
                      className="relative"
                    >
                      {active && status?.plan === "yearly" ? "Current" : (<><Sparkles className="w-3 h-3 mr-1" /><span className="font-bold">€149.90</span>&nbsp;/yr</>)}
                    </Button>
                  </div>
                  {!active && (
                    <p className="text-[10px] text-muted-foreground mt-2 text-center">Yearly saves ~17% (2 months free)</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="backdrop-blur-xl bg-card/80">
          <CardContent className="p-6">
            <h2 className="font-black mb-1">Each coach unlocks the full toolkit</h2>
            <p className="text-xs text-muted-foreground mb-4">Subscribing to a coach activates these 14+ features for that area only.</p>
            <ul className="grid sm:grid-cols-2 gap-2">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Link to="/ai-mentor/hub" className="text-sm text-primary hover:underline">← Back to Mentor Hub</Link>
        </div>
      </div>
    </>
  );
}
