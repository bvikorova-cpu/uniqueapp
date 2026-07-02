import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Target, Flame, Award, Users, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function CalorieQuests() {
  const { data: progress } = useQuery({
    queryKey: ['user-quest-progress'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase.from('user_quest_progress').select('*').eq('user_id', user.id).single();
      if (error && error.code !== 'PGRST116') {
        const { data: newProgress } = await supabase.from('user_quest_progress').insert({ user_id: user.id }).select().single();
        return newProgress;
      }
      return data;
    }
  });

  const { data: quests } = useQuery({
    queryKey: ['active-quests'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase.from('calorie_quests').select('*').eq('user_id', user.id).eq('status', 'active').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const { data: challenges } = useQuery({
    queryKey: ['active-challenges'],
    queryFn: async () => {
      const { data, error } = await supabase.from('quest_challenges').select('*').eq('status', 'open').order('start_date', { ascending: false }).limit(5);
      if (error) throw error;
      return data || [];
    }
  });

  const level = progress?.level || 1;
  const totalXP = progress?.total_xp || 0;
  const xpForNextLevel = level * 100;
  const currentLevelXP = totalXP % xpForNextLevel;
  const xpProgress = (currentLevelXP / xpForNextLevel) * 100;
  const displayQuests = quests && quests.length > 0 ? quests : [];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <FloatingHowItWorks title="CalorieQuests — How it works" steps={[{title:"Open this tool",desc:"Access CalorieQuests within the Health & Wellness section."},{title:"Configure",desc:"Adjust preferences, choose duration or select goals."},{title:"Start & interact",desc:"Begin the session, log data or run an AI analysis (some cost 3–5 credits)."},{title:"Review results",desc:"Check outcomes, save to history and track progress over time."}]} />
      {/* Level Card */}
      <Card className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 border-primary/20 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Zap className="h-6 w-6 text-yellow-500" /> Level {level}
              </CardTitle>
              <CardDescription>{totalXP} XP • {xpForNextLevel - currentLevelXP} XP to next level</CardDescription>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
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
        <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
                <Target className="h-5 w-5 text-primary" />
              </div>
              Daily Quests
            </CardTitle>
            <CardDescription>Complete quests to earn XP and level up</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {displayQuests.length > 0 ? displayQuests.map((quest) => {
              const prog = (quest.current_value / quest.target_value) * 100;
              return (
                <div key={quest.id} className="p-4 bg-muted/50 rounded-xl border border-border/40 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium capitalize">{quest.quest_type.replace(/_/g, ' ')}</p>
                      <p className="text-sm text-muted-foreground">{quest.current_value} / {quest.target_value}</p>
                    </div>
                    <Badge variant="secondary" className="gap-1"><Star className="h-3 w-3" />{quest.xp_reward} XP</Badge>
                  </div>
                  <Progress value={Math.min(prog, 100)} className="h-2" />
                </div>
              );
            }) : (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Start tracking meals to unlock quests!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Challenges */}
        <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                <Users className="h-5 w-5 text-purple-500" />
              </div>
              Community Challenges
            </CardTitle>
            <CardDescription>Compete with others for prizes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(challenges && challenges.length > 0 ? challenges : [
              { id: '1', title: '30-Day Fitness Challenge', description: 'Hit your calorie goals for 30 days', prize_pool: 500, participants_count: 128, entry_fee: 5 },
              { id: '2', title: 'Protein Power Week', description: 'Meet protein goals for 7 days straight', prize_pool: 200, participants_count: 45, entry_fee: 5 },
            ]).map((challenge: any) => (
              <div key={challenge.id} className="p-4 rounded-xl border border-border/40 bg-muted/30 space-y-2 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{challenge.title}</p>
                    <p className="text-xs text-muted-foreground">{challenge.description}</p>
                  </div>
                  <Badge className="gap-1 bg-gradient-to-r from-yellow-500 to-orange-500">
                    <Trophy className="h-3 w-3" /> €{challenge.prize_pool}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{challenge.participants_count} participants</span>
                  <span>Entry: €{challenge.entry_fee}</span>
                </div>
                <Button size="sm" className="w-full gap-1" onClick={() => {
                  const joined = JSON.parse(localStorage.getItem("nutrition_challenges_joined") || "[]");
                  if (joined.includes(challenge.id)) { toast.info("Already joined"); return; }
                  joined.push(challenge.id);
                  localStorage.setItem("nutrition_challenges_joined", JSON.stringify(joined));
                  toast.success(`Joined "${challenge.title}"! Entry: €${challenge.entry_fee}`);
                }}><Zap className="h-3 w-3" /> Join Challenge</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Hero Pass */}
      <Card className="bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 border-yellow-500/20 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" /> Hero Pass Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { icon: Flame, color: "text-orange-500", text: "2x XP on all quests" },
            { icon: Star, color: "text-yellow-500", text: "Exclusive custom avatars & skins" },
            { icon: Trophy, color: "text-purple-500", text: "Access to premium challenges" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <item.icon className={`h-4 w-4 ${item.color}`} />
              <span className="text-sm">{item.text}</span>
            </div>
          ))}
          <Button className="w-full mt-4 gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600" onClick={async () => {
            try {
              const { data: { session } } = await supabase.auth.getSession();
              if (!session) { toast.error("Please sign in first"); return; }
              const { data, error } = await supabase.functions.invoke("create-checkout", {
                body: { product_type: "hero_pass_subscription", plan_name: "Hero Pass", amount: 6.99, interval: "month" }
              });
              if (error) throw error;
              if (data?.url) window.open(data.url, "_blank");
            } catch (e: any) {
              toast.error(e.message || "Failed to start checkout");
            }
          }}>
            <Award className="h-4 w-4" /> Upgrade to Hero Pass (€6.99/month)
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
