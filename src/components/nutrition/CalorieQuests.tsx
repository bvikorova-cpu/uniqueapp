import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Target, Flame, Award, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function CalorieQuests() {
  // Fetch user progress
  const { data: progress } = useQuery({
    queryKey: ['user-quest-progress'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_quest_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // Create if doesn't exist
        const { data: newProgress } = await supabase
          .from('user_quest_progress')
          .insert({ user_id: user.id })
          .select()
          .single();
        return newProgress;
      }

      return data;
    }
  });

  // Fetch active quests
  const { data: quests } = useQuery({
    queryKey: ['active-quests'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('calorie_quests')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Fetch active challenges
  const { data: challenges } = useQuery({
    queryKey: ['active-challenges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quest_challenges')
        .select('*')
        .eq('status', 'open')
        .order('start_date', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    }
  });

  const level = progress?.level || 1;
  const totalXP = progress?.total_xp || 0;
  const xpForNextLevel = level * 100;
  const currentLevelXP = totalXP % xpForNextLevel;
  const xpProgress = (currentLevelXP / xpForNextLevel) * 100;

  const sampleQuests = [
    {
      id: '1',
      quest_type: 'daily_calories',
      target_value: 2000,
      current_value: 1200,
      xp_reward: 50,
      status: 'active'
    },
    {
      id: '2',
      quest_type: 'protein_goal',
      target_value: 150,
      current_value: 89,
      xp_reward: 75,
      status: 'active'
    },
    {
      id: '3',
      quest_type: 'meal_tracking',
      target_value: 5,
      current_value: 3,
      xp_reward: 100,
      status: 'active'
    }
  ];

  const displayQuests = quests && quests.length > 0 ? quests : sampleQuests;

  return (
    <div className="space-y-6">
      {/* User Progress Card */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Level {level}</CardTitle>
              <CardDescription>
                {totalXP} XP • {xpForNextLevel - currentLevelXP} XP to next level
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={xpProgress} className="h-3" />
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Daily Quests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Daily Quests
            </CardTitle>
            <CardDescription>
              Complete quests to earn XP and level up
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {displayQuests.map((quest) => {
              const progress = (quest.current_value / quest.target_value) * 100;
              return (
                <div key={quest.id} className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium capitalize">
                        {quest.quest_type.replace(/_/g, ' ')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {quest.current_value} / {quest.target_value}
                      </p>
                    </div>
                    <Badge variant="secondary" className="gap-1">
                      <Star className="h-3 w-3" />
                      {quest.xp_reward} XP
                    </Badge>
                  </div>
                  <Progress value={Math.min(progress, 100)} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Challenges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Community Challenges
            </CardTitle>
            <CardDescription>
              Compete with others for prizes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {challenges && challenges.length > 0 ? (
              challenges.map((challenge) => (
                <div key={challenge.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{challenge.title}</p>
                      <p className="text-sm text-muted-foreground">{challenge.description}</p>
                    </div>
                    <Badge variant="default" className="gap-1">
                      <Trophy className="h-3 w-3" />
                      ${challenge.prize_pool}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {challenge.participants_count} participants
                    </span>
                    <span className="text-muted-foreground">
                      Entry: ${challenge.entry_fee}
                    </span>
                  </div>
                  <Button size="sm" className="w-full">Join Challenge</Button>
                </div>
              ))
            ) : (
              <>
                <div className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">30-Day Fitness Challenge</p>
                      <p className="text-sm text-muted-foreground">Hit your calorie goals for 30 days</p>
                    </div>
                    <Badge variant="default" className="gap-1">
                      <Trophy className="h-3 w-3" />
                      $500
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">128 participants</span>
                    <span className="text-muted-foreground">Entry: $5</span>
                  </div>
                  <Button size="sm" className="w-full">Join Challenge</Button>
                </div>

                <div className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">Protein Power Week</p>
                      <p className="text-sm text-muted-foreground">Meet protein goals for 7 days straight</p>
                    </div>
                    <Badge variant="default" className="gap-1">
                      <Trophy className="h-3 w-3" />
                      $200
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">45 participants</span>
                    <span className="text-muted-foreground">Entry: $5</span>
                  </div>
                  <Button size="sm" className="w-full">Join Challenge</Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Premium Features */}
      <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Hero Pass Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-sm">2x XP on all quests</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-sm">Exclusive custom avatars & skins</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-purple-500" />
            <span className="text-sm">Access to premium challenges</span>
          </div>
          <Button variant="default" className="w-full mt-4">
            Upgrade to Hero Pass ($6.99/month)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
