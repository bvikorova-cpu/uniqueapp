import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Sparkles, X, MessageSquare, Award } from "lucide-react";
import { toast } from "sonner";

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

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      setCurrentUserId(session.user.id);

      const { data: matchesData, error } = await supabase
        .from('skill_matches')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'pending')
        .order('match_score', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Fetch profiles for matched users
      const matchedUserIds = matchesData?.map(m => m.matched_user_id) || [];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, rating_average, total_reviews, completed_exchanges, skills_offered, skills_wanted')
        .in('id', matchedUserIds);

      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

      const matchesWithProfiles = (matchesData || []).map(match => ({
        ...match,
        matched_profile: profilesMap.get(match.matched_user_id)
      }));

      setMatches(matchesWithProfiles);
    } catch (error) {
      console.error('Error loading matches:', error);
      toast.error('Failed to load skill matches');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (matchId: string, matchedUserId: string) => {
    try {
      await supabase
        .from('skill_matches')
        .update({ status: 'contacted' })
        .eq('id', matchId);

      navigate(`/skill-swap/profile/${matchedUserId}`);
    } catch (error) {
      console.error('Error updating match:', error);
      toast.error('Failed to connect');
    }
  };

  const handleIgnore = async (matchId: string) => {
    try {
      await supabase
        .from('skill_matches')
        .update({ status: 'ignored' })
        .eq('id', matchId);

      setMatches(matches.filter(m => m.id !== matchId));
      toast.success('Match dismissed');
    } catch (error) {
      console.error('Error ignoring match:', error);
      toast.error('Failed to dismiss match');
    }
  };

  const handleStartConversation = async (matchedUserId: string) => {
    if (!currentUserId) return;

    try {
      // Check if conversation already exists
      const { data: existingConv } = await supabase
        .from('skill_swap_conversations')
        .select('id')
        .or(`and(user1_id.eq.${currentUserId},user2_id.eq.${matchedUserId}),and(user1_id.eq.${matchedUserId},user2_id.eq.${currentUserId})`)
        .maybeSingle();

      if (!existingConv) {
        await supabase.from('skill_swap_conversations').insert([
          {
            user1_id: currentUserId,
            user2_id: matchedUserId,
          },
        ]);
      }

      toast.success("Conversation started!");
      navigate('/skill-swap?tab=messages');
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Failed to start conversation');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Matches Yet</h3>
        <p className="text-muted-foreground mb-4">
          Update your profile with skills you can teach and want to learn to find perfect exchange partners!
        </p>
        <Button onClick={() => navigate('/skill-swap/profile/edit')}>
          Update Skills
        </Button>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Suggested Matches</h2>
        <Badge variant="secondary">{matches.length}</Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {matches.map((match) => (
          <Card key={match.id} className="p-6 relative hover:shadow-lg transition-shadow">
            <button
              onClick={() => handleIgnore(match.id)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4 mb-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="text-lg">
                  {match.matched_profile?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <button
                  onClick={() => navigate(`/skill-swap/profile/${match.matched_user_id}`)}
                  className="text-lg font-semibold hover:text-primary transition-colors text-left"
                >
                  {match.matched_profile?.full_name || 'User'}
                </button>

                {match.matched_profile && (
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{match.matched_profile.rating_average.toFixed(1)}</span>
                      <span className="text-muted-foreground">({match.matched_profile.total_reviews})</span>
                    </div>
                    <span className="text-muted-foreground">•</span>
                    <div className="flex items-center gap-1">
                      <Award className="w-3 h-3 text-primary" />
                      <span className="text-muted-foreground">
                        {match.matched_profile.completed_exchanges} exchanges
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <Badge className="bg-primary/10 text-primary border-primary/20">
                {match.match_score} skill{match.match_score !== 1 ? 's' : ''} match
              </Badge>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Matching Skills:</h4>
              <div className="flex flex-wrap gap-2">
                {match.matching_skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleStartConversation(match.matched_user_id)}
                className="flex-1"
                size="sm"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Start Conversation
              </Button>
              <Button
                onClick={() => handleConnect(match.id, match.matched_user_id)}
                variant="outline"
                size="sm"
              >
                View Profile
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};