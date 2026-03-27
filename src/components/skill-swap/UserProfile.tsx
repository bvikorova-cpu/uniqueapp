import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Star, MapPin, Award, ArrowLeft, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingParticles } from "@/components/wellness/FloatingParticles";

interface Profile {
  id: string;
  full_name: string;
  bio: string;
  skills_offered: string[];
  skills_wanted: string[];
  location: string;
  rating_average: number;
  total_reviews: number;
  completed_exchanges: number;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer: { full_name: string; };
}

export const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => { loadProfile(); getCurrentUser(); }, [userId]);

  const getCurrentUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) setCurrentUserId(session.user.id);
  };

  const loadProfile = async () => {
    if (!userId || userId === 'undefined') { setLoading(false); return; }
    try {
      const { data: profileData, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (error) throw error;
      setProfile(profileData);
      const { data: reviewsData } = await supabase.from('skill_swap_reviews').select('*').eq('reviewed_user_id', userId).order('created_at', { ascending: false });
      const reviewerIds = reviewsData?.map(r => r.reviewer_id) || [];
      const { data: profilesData } = await supabase.from('profiles').select('id, full_name').in('id', reviewerIds);
      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
      setReviews((reviewsData || []).map(r => ({ ...r, reviewer: { full_name: profilesMap.get(r.reviewer_id)?.full_name || 'Anonymous' } })));
    } catch (error) { console.error('Error loading profile:', error); toast.error('Error loading profile'); }
    finally { setLoading(false); }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  if (!profile || !userId || userId === 'undefined') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center bg-card/80 backdrop-blur-xl border-border/50">
          <p className="text-muted-foreground">Profile not found</p>
          <Button onClick={() => navigate('/skill-swap')} className="mt-4">Back to Skill Swap</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingParticles />
      <div className="container mx-auto px-4 py-6 sm:py-10 max-w-5xl relative z-10">
        <Button variant="ghost" size="sm" onClick={() => navigate('/skill-swap')} className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Skill Swap
        </Button>

        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="overflow-hidden bg-card/80 backdrop-blur-xl border-border/50 mb-6">
            <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />
            <div className="p-6 sm:p-8">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <Avatar className="w-20 h-20 border-2 border-primary/20">
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">{profile.full_name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-2">
                    {profile.full_name || 'User'}
                  </h1>
                  {profile.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4" /><span>{profile.location}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-bold">{profile.rating_average.toFixed(1)}</span>
                      <span className="text-muted-foreground text-xs">({profile.total_reviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Award className="w-4 h-4 text-primary" />
                      <span className="font-bold">{profile.completed_exchanges}</span>
                      <span className="text-muted-foreground text-xs">exchanges</span>
                    </div>
                  </div>
                  {profile.bio && <p className="text-sm text-muted-foreground mb-4">{profile.bio}</p>}
                  {currentUserId !== userId ? (
                    <Button onClick={() => navigate('/skill-swap?tab=messages')} className="gap-2">
                      <MessageSquare className="w-4 h-4" /> Start Conversation
                    </Button>
                  ) : (
                    <Button onClick={() => navigate('/skill-swap/profile/edit')} variant="outline">Edit Profile</Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="p-5 bg-card/80 backdrop-blur-xl border-border/50 h-full">
              <h2 className="text-sm font-black mb-3 flex items-center gap-2">🎓 Skills I Can Teach</h2>
              {profile.skills_offered?.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills_offered.map((skill, i) => (
                    <Badge key={i} variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">{skill}</Badge>
                  ))}
                </div>
              ) : <p className="text-xs text-muted-foreground">No skills listed yet</p>}
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="p-5 bg-card/80 backdrop-blur-xl border-border/50 h-full">
              <h2 className="text-sm font-black mb-3 flex items-center gap-2">📚 Skills I Want to Learn</h2>
              {profile.skills_wanted?.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills_wanted.map((skill, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{skill}</Badge>
                  ))}
                </div>
              ) : <p className="text-xs text-muted-foreground">No skills listed yet</p>}
            </Card>
          </motion.div>
        </div>

        {/* Reviews */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-5 sm:p-6 bg-card/80 backdrop-blur-xl border-border/50">
            <h2 className="text-sm font-black mb-4 flex items-center gap-2">⭐ Reviews ({reviews.length})</h2>
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id}>
                    <div className="flex items-start gap-3">
                      <Avatar className="w-9 h-9">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">{review.reviewer.full_name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm">{review.reviewer.full_name}</span>
                          <span className="text-[10px] text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-0.5 mb-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground/30'}`} />
                          ))}
                        </div>
                        {review.comment && <p className="text-xs text-muted-foreground">{review.comment}</p>}
                      </div>
                    </div>
                    <Separator className="mt-4 bg-border/30" />
                  </div>
                ))}
              </div>
            ) : <p className="text-xs text-muted-foreground text-center py-6">No reviews yet</p>}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
