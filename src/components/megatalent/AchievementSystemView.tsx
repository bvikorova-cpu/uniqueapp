import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Award, Trophy, Star, Target, Flame, Heart, Upload, MessageCircle, Crown, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const ACHIEVEMENTS = [
  { id: "first_upload", name: "First Upload", description: "Submit your first talent entry", icon: Upload, requirement: "1 submission", color: "text-green-500" },
  { id: "popular_5", name: "Rising Star", description: "Get 5 votes on a single submission", icon: Star, requirement: "5 votes", color: "text-yellow-500" },
  { id: "popular_25", name: "Fan Favorite", description: "Get 25 votes on a single submission", icon: Heart, requirement: "25 votes", color: "text-red-500" },
  { id: "popular_100", name: "Viral Sensation", description: "Get 100 votes on a single submission", icon: Flame, requirement: "100 votes", color: "text-orange-500" },
  { id: "multi_category", name: "Versatile Talent", description: "Submit in 3 different categories", icon: Target, requirement: "3 categories", color: "text-blue-500" },
  { id: "commenter", name: "Community Builder", description: "Leave 10 comments on other submissions", icon: MessageCircle, requirement: "10 comments", color: "text-purple-500" },
  { id: "five_uploads", name: "Dedicated Creator", description: "Submit 5 talent entries", icon: Upload, requirement: "5 submissions", color: "text-cyan-500" },
  { id: "ten_uploads", name: "Prolific Artist", description: "Submit 10 talent entries", icon: Crown, requirement: "10 submissions", color: "text-amber-500" },
  { id: "top_voter", name: "Talent Scout", description: "Vote on 20 different submissions", icon: Heart, requirement: "20 votes cast", color: "text-pink-500" },
  { id: "total_100_votes", name: "Century Club", description: "Accumulate 100 total votes across all submissions", icon: Trophy, requirement: "100 total votes", color: "text-yellow-600" },
  { id: "total_500_votes", name: "Hall of Fame", description: "Accumulate 500 total votes across all submissions", icon: Award, requirement: "500 total votes", color: "text-yellow-400" },
  { id: "total_1000_votes", name: "Legend", description: "Accumulate 1000 total votes", icon: Crown, requirement: "1000 total votes", color: "text-yellow-300" },
];

export const AchievementSystemView = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [submissionsRes, votesGivenRes, commentsRes] = await Promise.all([
        supabase.from("talent_submissions").select("id, votes_count, category").eq("user_id", user.id).eq("is_active", true),
        supabase.from("talent_votes").select("id").eq("user_id", user.id),
        supabase.from("talent_comments").select("id").eq("user_id", user.id),
      ]);

      const submissions = submissionsRes.data || [];
      const totalSubmissions = submissions.length;
      const maxVotes = Math.max(0, ...submissions.map(s => s.votes_count || 0));
      const totalVotes = submissions.reduce((sum, s) => sum + (s.votes_count || 0), 0);
      const uniqueCategories = new Set(submissions.map(s => s.category)).size;
      const votesGiven = votesGivenRes.data?.length || 0;
      const commentsGiven = commentsRes.data?.length || 0;

      const unlocked = new Set<string>();
      if (totalSubmissions >= 1) unlocked.add("first_upload");
      if (totalSubmissions >= 5) unlocked.add("five_uploads");
      if (totalSubmissions >= 10) unlocked.add("ten_uploads");
      if (maxVotes >= 5) unlocked.add("popular_5");
      if (maxVotes >= 25) unlocked.add("popular_25");
      if (maxVotes >= 100) unlocked.add("popular_100");
      if (uniqueCategories >= 3) unlocked.add("multi_category");
      if (commentsGiven >= 10) unlocked.add("commenter");
      if (votesGiven >= 20) unlocked.add("top_voter");
      if (totalVotes >= 100) unlocked.add("total_100_votes");
      if (totalVotes >= 500) unlocked.add("total_500_votes");
      if (totalVotes >= 1000) unlocked.add("total_1000_votes");

      setUnlockedIds(unlocked);
      setStats({ totalSubmissions, maxVotes, totalVotes, uniqueCategories, votesGiven, commentsGiven });
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const unlockedCount = unlockedIds.size;
  const totalCount = ACHIEVEMENTS.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  return (
    <>
      <FloatingHowItWorks title={"Achievement System View - How it works"} steps={[{ title: 'Open', desc: 'Access the Achievement System View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Achievement System View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center mx-auto mb-4">
            <Award className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 bg-clip-text text-transparent">Achievement System</h2>
          <p className="text-muted-foreground mt-2">Track your milestones and unlock badges</p>
        </div>
      </motion.div>

      <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border-yellow-500/20">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">Progress</p>
          <div className="text-4xl font-black text-yellow-500 mb-2">{unlockedCount}/{totalCount}</div>
          <Progress value={progressPercent} className="h-3 mb-2" />
          <p className="text-xs text-muted-foreground">{progressPercent}% complete</p>
        </CardContent>
      </Card>

      {stats && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Submissions", value: stats.totalSubmissions },
            { label: "Total Votes", value: stats.totalVotes },
            { label: "Votes Given", value: stats.votesGiven },
          ].map((s, i) => (
            <Card key={i} className="bg-card/80 backdrop-blur-xl border-border/30">
              <CardContent className="p-3 text-center">
                <p className="text-xl font-black">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {ACHIEVEMENTS.map((ach, i) => {
          const unlocked = unlockedIds.has(ach.id);
          return (
            <motion.div key={ach.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className={`bg-card/80 backdrop-blur-xl ${unlocked ? "border-yellow-500/30" : "border-border/20 opacity-60"}`}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${unlocked ? "bg-yellow-500/10" : "bg-muted/30"}`}>
                    {unlocked ? <ach.icon className={`h-5 w-5 ${ach.color}`} /> : <Lock className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{ach.name}</p>
                    <p className="text-xs text-muted-foreground">{ach.description}</p>
                  </div>
                  <Badge variant={unlocked ? "default" : "outline"} className={unlocked ? "bg-yellow-500 text-black text-[10px]" : "text-[10px]"}>
                    {unlocked ? "Unlocked ✓" : ach.requirement}
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
    </>
  );
};