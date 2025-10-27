import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import {
  Briefcase,
  Dumbbell,
  Brain,
  Heart,
  ArrowRight,
  Check,
} from "lucide-react";

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
    // Admin má vždy prístup ku všetkým mentor oblastiam
    if (isAdmin) {
      navigate(`/ai-mentor/${areaId}`);
      return;
    }

    // Check if user has subscription for this area
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
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Your{" "}
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Personal Mentor
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose your area of growth and get personalized guidance, daily check-ins, and long-term progress tracking
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {MENTOR_AREAS.map((area) => {
            const Icon = area.icon;
            const hasSubscription = isAdmin || subscriptions.some(s => s.mentor_area === area.id);
            
            return (
              <Card
                key={area.id}
                className={`relative overflow-hidden transition-all hover:scale-105 ${
                  hasSubscription ? 'ring-2 ring-primary' : ''
                }`}
              >
                {hasSubscription && (
                  <div className="absolute -top-3 -right-3">
                    <Badge className="bg-green-500 text-white">Active</Badge>
                  </div>
                )}

                <div className={`h-2 bg-gradient-to-r ${area.color}`} />
                
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full bg-gradient-to-r ${area.color}`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{area.name}</CardTitle>
                      <CardDescription>{area.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {area.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    onClick={() => handleSelectMentor(area.id)}
                  >
                    {hasSubscription ? (
                      <>
                        Start Session <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      "Subscribe to Access"
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>How it works</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-semibold mb-2">Choose Your Area</h3>
                <p className="text-sm text-muted-foreground">
                  Select the area you want to focus on
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="font-semibold mb-2">Daily Check-ins</h3>
                <p className="text-sm text-muted-foreground">
                  Track your progress with daily reflections
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="font-semibold mb-2">Get Guidance</h3>
                <p className="text-sm text-muted-foreground">
                  Receive personalized coaching
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIMentor;