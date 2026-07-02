import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Star, MapPin, Award, ArrowLeft, MessageSquare, TrendingUp, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingParticles } from "@/components/wellness/FloatingParticles";
import heroVideo from "@/assets/skill-swap-hero.mp4.asset.json";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

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
      const { data: profileData, error } = await (supabase as any).from('profiles_public').select('*').eq('id', userId).single();
      if (error) throw error;
      setProfile(profileData);
      const { data: reviewsData } = await supabase.from('skill_swap_reviews').select('*').eq('reviewed_user_id', userId).order('created_at', { ascending: false });
      const reviewerIds = reviewsData?.map(r => r.reviewer_id) || [];
      const { data: profilesData } = await (supabase as any).from('profiles_public').select('id, full_name').in('id', reviewerIds);
      const profilesMap = new Map<string, any>(profilesData?.map((p: any) => [p.id, p]) || []);
      setReviews((reviewsData || []).map(r => ({ ...r, reviewer: { full_name: profilesMap.get(r.reviewer_id)?.full_name || 'Anonymous' } })));
    } catch (error) { console.error('Error loading profile:', error); toast.error('Error loading profile'); }
    finally { setLoading(false); }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
  }

  if (!profile || !userId || userId === 'undefined') {
    return (
    <>
      <FloatingHowItWorks title={"User Profile - How it works"} steps={[{ title: 'Open', desc: 'Access the User Profile section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in User Profile.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center bg-card/80 backdrop-blur-xl border-border/50">
          <p className="text-muted-foreground">Profile not found</p>
          <Button onClick={() => navigate('/skill-swap')} className="mt-4">Back to Skill Swap</Button>
        </Card>
      </div>
    </>
  );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingParticles />
      <div className="container mx-auto px-4 py-6 sm:py-10 max-w-5xl relative z-10">
        {/* Mini Hero Banner */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative rounded-2xl overflow-hidden mb-8">
          <div className="absolute inset-0">
            <video autoPlay loop muted playsInline className="w-full h-full object-cover" style={{ filter: "brightness(0.7) saturate(1.2)" }}>
              <source src={heroVideo.url} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/60" />
          </div>
          <div className="relative z-10 p-6 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Avatar className="w-20 h-20 border-3 border-white/30 shadow-xl">
              <AvatarFallback className="text-2xl bg-amber-500/20 text-white font-black">{profile.full_name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Button variant="ghost" size="sm" onClick={() => navigate('/skill-swap')} className="mb-2 text-white/70 hover:text-white hover:bg-white/10 -ml-3">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <h1 className="text-2xl sm:text-3xl font-black text-white mb-1" style={{ textShadow: "0 2px 15px rgba(251,146,60,0.3)" }}>
                {profile.full_name || 'User'}
              </h1>
              {profile.location && (
                <div className="flex items-center gap-1.5 text-sm text-white/70">
                  <MapPin className="w-3.5 h-3.5" /><span>{profile.location}</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <div className="text-center p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
                <Star className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                <p className="text-xl font-black text-white">{profile.rating_average.toFixed(1)}</p>
                <p className="text-[10px] text-white/60">{profile.total_reviews} reviews</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
                <Award className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <p className="text-xl font-black text-white">{profile.completed_exchanges}</p>
                <p className="text-[10px] text-white/60">exchanges</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bio */}
        {profile.bio && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="p-5 bg-card/80 backdrop-blur-xl border-border/50 mb-6">
              <h2 className="text-sm font-black mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" /> About
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>
            </Card>
          </motion.div>
        )}

        {/* Skills Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="p-5 bg-card/80 backdrop-blur-xl border-border/50 h-full">
              <h2 className="text-sm font-black mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" /> Skills I Can Teach
              </h2>
              {profile.skills_offered?.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills_offered.map((skill, i) => (
                    <Badge key={i} className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20">{skill}</Badge>
                  ))}
                </div>
              ) : <p className="text-xs text-muted-foreground">No skills listed yet</p>}
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="p-5 bg-card/80 backdrop-blur-xl border-border/50 h-full">
              <h2 className="text-sm font-black mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-500" /> Skills I Want to Learn
              </h2>
              {profile.skills_wanted?.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills_wanted.map((skill, i) => (
                    <Badge key={i} variant="outline" className="text-xs border-amber-500/30 text-amber-600 dark:text-amber-400">{skill}</Badge>
                  ))}
                </div>
              ) : <p className="text-xs text-muted-foreground">No skills listed yet</p>}
            </Card>
          </motion.div>
        </div>

        {/* Action Button */}
        {currentUserId !== userId ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="mb-6">
            <Button onClick={() => navigate('/skill-swap?tab=messages')} size="lg" className="w-full sm:w-auto gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg">
              <MessageSquare className="w-5 h-5" /> Start Conversation
            </Button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="mb-6">
            <Button onClick={() => navigate('/skill-swap/profile/edit')} variant="outline" className="gap-2">Edit Profile</Button>
          </motion.div>
        )}

        {/* Reviews */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-5 sm:p-6 bg-card/80 backdrop-blur-xl border-border/50">
            <h2 className="text-sm font-black mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" /> Reviews ({reviews.length})
            </h2>
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
