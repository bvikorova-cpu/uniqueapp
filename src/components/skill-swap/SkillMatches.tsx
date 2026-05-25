import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Sparkles, X, MessageSquare, Award, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface SkillMatch {
  id: string;
  matched_user_id: string;
  matching_skills: string[];
  match_score: number;
  status: string;
  matched_profile?: {
    full_name: string;
    rating_average: number;
    total_reviews: number;
    completed_exchanges: number;
    skills_offered: string[];
    skills_wanted: string[];
  };
}

export const SkillMatches = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<SkillMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => { loadMatches(); }, []);

  const loadMatches = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }
      setCurrentUserId(session.user.id);
      const { data: matchesData, error } = await supabase
        .from('skill_matches').select('*').eq('user_id', session.user.id).eq('status', 'pending')
        .order('match_score', { ascending: false }).limit(10);
      if (error) throw error;
      const matchedUserIds = matchesData?.map(m => m.matched_user_id) || [];
      const { data: profilesData } = await (supabase as any)
        .from('profiles_public').select('id, full_name, rating_average, total_reviews, completed_exchanges, skills_offered, skills_wanted')
        .in('id', matchedUserIds);
      const profilesMap = new Map<string, any>((profilesData || []).map((p: any) => [p.id, p]));
      setMatches((matchesData || []).map((match: any) => ({ ...match, matched_profile: profilesMap.get(match.matched_user_id) })));
    } catch (error) { console.error('Error loading matches:', error); toast.error('Failed to load skill matches'); }
    finally { setLoading(false); }
  };

  const handleConnect = async (matchId: string, matchedUserId: string) => {
    try {
      await supabase.from('skill_matches').update({ status: 'contacted' }).eq('id', matchId);
      navigate(`/skill-swap/profile/${matchedUserId}`);
    } catch (error) { console.error('Error updating match:', error); toast.error('Failed to connect'); }
  };

  const handleIgnore = async (matchId: string) => {
    try {
      await supabase.from('skill_matches').update({ status: 'ignored' }).eq('id', matchId);
      setMatches(matches.filter(m => m.id !== matchId));
      toast.success('Match dismissed');
    } catch (error) { console.error('Error ignoring match:', error); toast.error('Failed to dismiss match'); }
  };

  const handleStartConversation = async (matchedUserId: string) => {
    if (!currentUserId) return;
    try {
      const { data: existingConv } = await supabase
        .from('skill_swap_conversations').select('id')
        .or(`and(user1_id.eq.${currentUserId},user2_id.eq.${matchedUserId}),and(user1_id.eq.${matchedUserId},user2_id.eq.${currentUserId})`)
        .maybeSingle();
      if (!existingConv) {
        await supabase.from('skill_swap_conversations').insert([{ user1_id: currentUserId, user2_id: matchedUserId }]);
      }
      toast.success("Conversation started!");
    } catch (error) { console.error('Error starting conversation:', error); toast.error('Failed to start conversation'); }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  if (matches.length === 0) {
    return (
      <Card className="p-12 text-center bg-card/80 backdrop-blur-xl border-border/50">
        <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-black mb-2">No Matches Yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Update your profile with skills you can teach and want to learn to find perfect exchange partners!
        </p>
        <Button onClick={() => navigate('/skill-swap/profile/edit')}>Update Skills</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
          Suggested Matches
        </h2>
        <Badge variant="secondary" className="text-[10px]">{matches.length}</Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {matches.map((match, i) => (
          <motion.div key={match.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-5 relative bg-card/80 backdrop-blur-xl border-border/50 hover:border-primary/30 hover:shadow-lg transition-all">
              <button onClick={() => handleIgnore(match.id)} className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors">
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-start gap-4 mb-4">
                <Avatar className="w-14 h-14 border-2 border-primary/20">
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">
                    {match.matched_profile?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <button onClick={() => navigate(`/skill-swap/profile/${match.matched_user_id}`)} className="text-sm font-bold hover:text-primary transition-colors text-left">
                    {match.matched_profile?.full_name || 'User'}
                  </button>
                  {match.matched_profile && (
                    <div className="flex items-center gap-2 text-[10px] mt-1">
                      <div className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{match.matched_profile.rating_average.toFixed(1)}</span>
                        <span className="text-muted-foreground">({match.matched_profile.total_reviews})</span>
                      </div>
                      <span className="text-muted-foreground">•</span>
                      <div className="flex items-center gap-0.5 text-muted-foreground">
                        <Award className="w-3 h-3 text-primary" />
                        {match.matched_profile.completed_exchanges} swaps
                      </div>
                    </div>
                  )}
                </div>
                <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                  {match.match_score} match{match.match_score !== 1 ? 'es' : ''}
                </Badge>
              </div>

              <div className="mb-4">
                <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Matching Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {match.matching_skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">{skill}</Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => handleStartConversation(match.matched_user_id)} className="flex-1" size="sm">
                  <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Start Chat
                </Button>
                <Button onClick={() => handleConnect(match.id, match.matched_user_id)} variant="outline" size="sm">View Profile</Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
