import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMentorPremium, useMentorUnlock, MENTOR_UNLOCK_COST, MENTOR_UNLOCK_DAYS, type MentorArea } from "@/hooks/useMentorRouter";
import { useAICredits } from "@/hooks/useAICredits";
import { Crown, Check, Sparkles, Briefcase, Dumbbell, Brain, Heart } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const __HIW_MENTORPREMIUM_STEPS = [
  { title: 'Pick a coach', desc: 'Each coach area unlocks on its own.' },
  { title: 'Spend credits', desc: `${MENTOR_UNLOCK_COST} AI credits unlock one coach for ${MENTOR_UNLOCK_DAYS} days.` },
  { title: 'Unlock everything', desc: 'All mentor tools for that area, unlimited sessions.' },
  { title: 'No subscription', desc: 'Nothing renews automatically — unlock again when you want.' }
];
const __HIW_MENTORPREMIUM = { title: 'Mentor Premium', intro: 'Unlock AI coaching with your AI credits.', steps: __HIW_MENTORPREMIUM_STEPS };


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

const FEATURE_COUNT = FEATURES.length;

export default function MentorPremium() {
  const { data: sub } = useMentorPremium();
  const unlock = useMentorUnlock();
  const { credits } = useAICredits();
  const areas = sub?.areas ?? {};

  return (
    <>
      <Helmet><title>Personal Mentor Premium · Unique</title></Helmet>
      <div className="container mx-auto px-4 pt-20 pb-12 max-w-6xl">
        <div className="text-center mb-8">
          <Crown className="w-12 h-12 mx-auto text-primary mb-3" />
          <h1 className="text-4xl font-black mb-2">Personal Mentor Premium</h1>
          <p className="text-muted-foreground">Each coach unlocks separately with AI credits — pick only the areas you need.</p>
          <p className="text-sm text-foreground/90 font-medium mt-2">
            {MENTOR_UNLOCK_COST} credits · {MENTOR_UNLOCK_DAYS} days access · your balance: {credits.credits_remaining} credits
          </p>
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
                    ✓ Active
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
                      Active until {status?.current_period_end ? new Date(status.current_period_end).toLocaleDateString() : "—"}.
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground mb-3">
                      Unlock all {FEATURE_COUNT} mentor tools for the <strong>{a.title.toLowerCase()}</strong>.
                    </p>
                  )}

                  <Button
                    className="w-full"
                    disabled={unlock.isPending || active}
                    onClick={() => unlock.mutate({ area: a.id })}
                  >
                    {active ? "Unlocked" : (<><Sparkles className="w-3 h-3 mr-1" />Unlock for {MENTOR_UNLOCK_COST} credits</>)}
                  </Button>
                  {!active && (
                    <p className="text-[10px] text-muted-foreground mt-2 text-center">{MENTOR_UNLOCK_DAYS} days access · no auto-renewal</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="backdrop-blur-xl bg-card/80">
          <CardContent className="p-6">
            <h2 className="font-black mb-1">Each coach unlocks the full toolkit</h2>
            <p className="text-xs text-muted-foreground mb-4">Unlocking a coach activates these {FEATURE_COUNT} features for that area only.</p>
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
