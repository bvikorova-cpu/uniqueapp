import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Award, Star, Shield, Heart, BookOpen, Gamepad2, MessageSquare, Lock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const allBadges = [
  {
    id: "first-steps",
    name: "First Steps",
    description: "Complete your first course lesson",
    icon: Star,
    color: "text-amber-500",
    requirement: { type: "courses", count: 1 }
  },
  {
    id: "safety-scholar",
    name: "Safety Scholar",
    description: "Complete all three safety courses",
    icon: BookOpen,
    color: "text-blue-500",
    requirement: { type: "courses", count: 6 }
  },
  {
    id: "brave-writer",
    name: "Brave Writer",
    description: "Share your first story",
    icon: Heart,
    color: "text-pink-500",
    requirement: { type: "stories", count: 1 }
  },
  {
    id: "supporter",
    name: "Kind Supporter",
    description: "Support 5 stories from others",
    icon: Heart,
    color: "text-red-500",
    requirement: { type: "supports", count: 5 }
  },
  {
    id: "journal-keeper",
    name: "Journal Keeper",
    description: "Make 10 journal entries",
    icon: Shield,
    color: "text-green-500",
    requirement: { type: "journal", count: 10 }
  },
  {
    id: "scenario-master",
    name: "Scenario Master",
    description: "Complete all role-play scenarios",
    icon: Gamepad2,
    color: "text-purple-500",
    requirement: { type: "scenarios", count: 3 }
  },
  {
    id: "encourager",
    name: "The Encourager",
    description: "Post 10 messages on the support wall",
    icon: MessageSquare,
    color: "text-cyan-500",
    requirement: { type: "wall", count: 10 }
  },
  {
    id: "champion",
    name: "Safety Champion",
    description: "Earn all other badges",
    icon: Trophy,
    color: "text-amber-600",
    requirement: { type: "badges", count: 6 }
  }
];

const SafetyBadges = () => {
  const { data: earnedBadges } = useQuery({
    queryKey: ["safety-badges"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("safety_badges_earned")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return data;
    }
  });

  const { data: progress } = useQuery({
    queryKey: ["safety-progress-stats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { courses: 0, stories: 0, supports: 0, journal: 0, wall: 0 };

      // Get course progress
      const { data: courseData } = await supabase
        .from("safety_course_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("completed", true);

      // Get stories count
      const { count: storiesCount } = await supabase
        .from("safety_stories")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Get supports count
      const { count: supportsCount } = await supabase
        .from("safety_story_supports")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Get journal entries count
      const { count: journalCount } = await supabase
        .from("safety_journal_entries")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Get wall messages count
      const { count: wallCount } = await supabase
        .from("safety_support_wall")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      return {
        courses: courseData?.length || 0,
        stories: storiesCount || 0,
        supports: supportsCount || 0,
        journal: journalCount || 0,
        wall: wallCount || 0
      };
    }
  });

  const isBadgeEarned = (badgeId: string) => {
    return earnedBadges?.some((b: any) => b.badge_id === badgeId);
  };

  const getBadgeProgress = (badge: typeof allBadges[0]) => {
    if (!progress) return 0;
    
    let current = 0;
    switch (badge.requirement.type) {
      case "courses": current = progress.courses; break;
      case "stories": current = progress.stories; break;
      case "supports": current = progress.supports; break;
      case "journal": current = progress.journal; break;
      case "wall": current = progress.wall; break;
      case "badges": current = earnedBadges?.length || 0; break;
    }
    
    return Math.min((current / badge.requirement.count) * 100, 100);
  };

  const totalEarned = earnedBadges?.length || 0;
  const totalBadges = allBadges.length;

  return (
    <>
      <FloatingHowItWorks title={"Safety Badges - How it works"} steps={[{ title: 'Open', desc: 'Access the Safety Badges section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Safety Badges.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Your Achievements
          </CardTitle>
          <CardDescription>
            Earn badges by participating in courses, sharing stories, and supporting others.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-amber-500">{totalEarned}</div>
              <div className="text-sm text-muted-foreground">Badges Earned</div>
            </div>
            <div className="flex-1">
              <Progress value={(totalEarned / totalBadges) * 100} className="h-3" />
              <p className="text-sm text-muted-foreground mt-1">{totalEarned} of {totalBadges} badges</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {allBadges.map((badge) => {
          const Icon = badge.icon;
          const earned = isBadgeEarned(badge.id);
          const badgeProgress = getBadgeProgress(badge);
          
          return (
            <Card 
              key={badge.id} 
              className={`transition-all ${earned ? "border-amber-500/50 bg-amber-500/5" : "opacity-75"}`}
            >
              <CardContent className="pt-6 text-center">
                <div className={`relative inline-flex items-center justify-center w-16 h-16 rounded-full ${
                  earned ? "bg-amber-500/20" : "bg-muted"
                } mb-4`}>
                  {earned ? (
                    <Icon className={`h-8 w-8 ${badge.color}`} />
                  ) : (
                    <Lock className="h-8 w-8 text-muted-foreground" />
                  )}
                  {earned && (
                    <div className="absolute -top-1 -right-1">
                      <Award className="h-5 w-5 text-amber-500 fill-amber-500" />
                    </div>
                  )}
                </div>
                <h3 className="font-semibold">{badge.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{badge.description}</p>
                
                {!earned && (
                  <div className="space-y-1">
                    <Progress value={badgeProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground">{Math.round(badgeProgress)}% complete</p>
                  </div>
                )}
                
                {earned && (
                  <Badge variant="outline" className="text-amber-500 border-amber-500">
                    <Star className="h-3 w-3 mr-1 fill-amber-500" />
                    Earned!
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Motivation */}
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">
            Every badge represents progress in your safety journey. Keep learning, keep growing, keep supporting others! 🌟
          </p>
        </CardContent>
      </Card>
    </div>
    </>
  );
};

export default SafetyBadges;
