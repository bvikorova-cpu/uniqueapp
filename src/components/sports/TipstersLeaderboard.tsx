import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Users, Award, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getUserFriendlyErrorMessage } from "@/utils/errorHandler";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Tipster {
  id: string;
  display_name: string;
  avatar_url: string | null;
  sport_specialization: string;
  win_rate: number;
  total_predictions: number;
  correct_predictions: number;
  followers_count: number;
  total_earnings: number;
}

export function TipstersLeaderboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tipsters, setTipsters] = useState<Tipster[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [followingInProgress, setFollowingInProgress] = useState<string | null>(null);

  useEffect(() => {
    fetchTipsters();
    if (user) {
      fetchFollowing();
    }
  }, [user]);

  const fetchTipsters = async () => {
    try {
      const { data, error } = await supabase
        .from('sports_tipsters')
        .select('*')
        .eq('status', 'active')
        .order('win_rate', { ascending: false })
        .limit(10);

      if (error) throw error;
      setTipsters(data || []);
    } catch (error: any) {
      console.error('Error fetching tipsters:', error);
      toast({
        title: "Error",
        description: getUserFriendlyErrorMessage(error, "Failed to load tipsters"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowing = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('sports_tipster_followers')
        .select('tipster_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setFollowing(new Set(data?.map(f => f.tipster_id) || []));
    } catch (error) {
      console.error('Error fetching following:', error);
    }
  };

  const handleFollowToggle = async (tipsterId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      setFollowingInProgress(tipsterId);
      const isFollowing = following.has(tipsterId);

      if (isFollowing) {
        const { error } = await supabase
          .from('sports_tipster_followers')
          .delete()
          .eq('user_id', user.id)
          .eq('tipster_id', tipsterId);

        if (error) throw error;
        
        setFollowing(prev => {
          const newSet = new Set(prev);
          newSet.delete(tipsterId);
          return newSet;
        });

        toast({
          title: "Unfollowed",
          description: "You have unfollowed this tipster",
        });
      } else {
        const { error } = await supabase
          .from('sports_tipster_followers')
          .insert({
            user_id: user.id,
            tipster_id: tipsterId,
          });

        if (error) throw error;
        
        setFollowing(prev => new Set(prev).add(tipsterId));

        toast({
          title: "Following",
          description: "You are now following this tipster",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: getUserFriendlyErrorMessage(error, "Failed to update follow status"),
        variant: "destructive",
      });
    } finally {
      setFollowingInProgress(null);
    }
  };

  if (loading) {
    return (
<div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (tipsters.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No tipsters available yet</p>
        </CardContent>
      </Card>
    );
  }

  const getBadge = (winRate: number) => {
    if (winRate >= 75) return { label: "Elite", class: "bg-gradient-to-r from-yellow-500 to-orange-500" };
    if (winRate >= 70) return { label: "Pro", class: "bg-gradient-to-r from-blue-500 to-cyan-500" };
    return { label: "Expert", class: "" };
  };

  return (
    <div className="grid gap-4">
      {tipsters.map((tipster, index) => {
        const badge = getBadge(tipster.win_rate);
        const isFollowing = following.has(tipster.id);
        const roi = ((tipster.total_earnings / Math.max(tipster.total_predictions, 1)) * 100).toFixed(1);

        return (
          <Card key={tipster.id} className="hover:shadow-lg transition-all">
            <FloatingHowItWorks title="TipstersLeaderboard — How it works" steps={[{title:"Open this section",desc:"Access TipstersLeaderboard from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-muted-foreground w-12">
                  #{index + 1}
                </div>
                <Avatar className="h-16 w-16">
                  <AvatarImage src={tipster.avatar_url || undefined} />
                  <AvatarFallback>{tipster.display_name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg">{tipster.display_name}</h3>
                    <Badge className={badge.class}>
                      {badge.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{tipster.sport_specialization} Specialist</p>
                </div>
                <div className="grid grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-500">{tipster.win_rate.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">Win Rate</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{tipster.total_predictions}</div>
                    <div className="text-xs text-muted-foreground">Tips</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">+{roi}%</div>
                    <div className="text-xs text-muted-foreground">ROI</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{tipster.followers_count}</div>
                    <div className="text-xs text-muted-foreground">Followers</div>
                  </div>
                </div>
                <Button
                  onClick={() => handleFollowToggle(tipster.id)}
                  disabled={followingInProgress === tipster.id}
                  variant={isFollowing ? "secondary" : "default"}
                >
                  {followingInProgress === tipster.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Users className="mr-2 h-4 w-4" />
                      {isFollowing ? "Following" : "Follow"}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
