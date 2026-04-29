import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Briefcase, Dumbbell, Brain, Heart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { MentorHero } from "@/components/mentor/MentorHero";
import { MentorCard } from "@/components/mentor/MentorCard";
import { TestimonialsCarousel } from "@/components/mentor/TestimonialsCarousel";
import { ComparisonTable } from "@/components/mentor/ComparisonTable";
import { SessionStreak } from "@/components/mentor/SessionStreak";
import { ProgressPreview } from "@/components/mentor/ProgressPreview";
import { AchievementBadges } from "@/components/mentor/AchievementBadges";
import { MoodTracker } from "@/components/mentor/MoodTracker";
import { AIActionPlans } from "@/components/mentor/AIActionPlans";
import { GamificationXP } from "@/components/mentor/GamificationXP";
import { VoiceCoaching } from "@/components/mentor/VoiceCoaching";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
const MENTOR_AREAS = [
  {
    id: "career",
    name: "Career Coach",
    icon: Briefcase,
    description: "Career planning, job search, professional growth, and work-life balance",
    color: "from-blue-500 to-blue-600",
    features: [
      "Career path planning",
      "Interview preparation",
      "Resume optimization",
      "Workplace challenges",
      "Professional development",
    ],
  },
  {
    id: "fitness",
    name: "Fitness Coach",
    icon: Dumbbell,
    description: "Workout planning, nutrition guidance, and healthy habits",
    color: "from-green-500 to-green-600",
    features: [
      "Personalized workout plans",
      "Nutrition guidance",
      "Habit building",
      "Progress tracking",
      "Injury prevention",
    ],
  },
  {
    id: "mindset",
    name: "Mindset Coach",
    icon: Brain,
    description: "Mental resilience, goal setting, and personal development",
    color: "from-purple-500 to-purple-600",
    features: [
      "Mental resilience",
      "Goal achievement",
      "Confidence building",
      "Stress management",
      "Positive thinking",
    ],
  },
  {
    id: "relationships",
    name: "Relationships Coach",
    icon: Heart,
    description: "Communication skills, healthy relationships, and emotional intelligence",
    color: "from-pink-500 to-pink-600",
    features: [
      "Communication skills",
      "Conflict resolution",
      "Emotional intelligence",
      "Healthy boundaries",
      "Connection building",
    ],
  },
];

const AIMentor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const [user, setUser] = useState<any>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setUser(user);
      await loadSubscriptions(user.id);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriptions = async (userId: string) => {
    const { data } = await supabase
      .from('mentor_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');
    setSubscriptions(data || []);
  };

  const handleSelectMentor = async (areaId: string) => {
    if (isAdmin) {
      navigate(`/ai-mentor/${areaId}`);
      return;
    }
    const hasSub = subscriptions.some(s => s.mentor_area === areaId);
    if (!hasSub) {
      toast({
        title: "Subscription required",
        description: "You need an active subscription to access this mentor area",
      });
      navigate('/subscription');
      return;
    }
    navigate(`/ai-mentor/${areaId}`);
  };

  if (loading || adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-2 sm:px-4">
        <MentorHero />

        <HeroRewardedAd sectionKey="page_aimentor" />

        {/* Engagement widgets row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <SessionStreak />
          <ProgressPreview />
          <AchievementBadges />
        </div>

        {/* Main content: Mentor cards + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MENTOR_AREAS.map((area, i) => {
                const hasSubscription = isAdmin || subscriptions.some(s => s.mentor_area === area.id);
                return (
                  <MentorCard
                    key={area.id}
                    area={area}
                    hasSubscription={hasSubscription}
                    isOnline={true}
                    onSelect={() => handleSelectMentor(area.id)}
                    index={i}
                  />
                );
              })}
            </div>

            {/* Voice Coaching */}
            <VoiceCoaching />

            {/* AI Action Plans */}
            <AIActionPlans />
          </div>

          <div className="space-y-4">
            <GamificationXP />
            <MoodTracker />
            <TestimonialsCarousel />
            <ComparisonTable />
          </div>
        </div>

        {/* How it works */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Choose Your Area", desc: "Select the area you want to focus on" },
              { step: "2", title: "Daily Check-ins", desc: "Track your progress with daily reflections" },
              { step: "3", title: "Get Guidance", desc: "Receive personalized AI coaching" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-primary">{item.step}</span>
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIMentor;
