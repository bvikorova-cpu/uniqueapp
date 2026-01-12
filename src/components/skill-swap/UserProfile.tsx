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
  reviewer: {
    full_name: string;
  };
}

export const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
    getCurrentUser();
  }, [userId]);

  const getCurrentUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setCurrentUserId(session.user.id);
    }
  };

  const loadProfile = async () => {
    if (!userId || userId === 'undefined') {
      setLoading(false);
      return;
    }

    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      const { data: reviewsData, error: reviewsError } = await supabase
        .from('skill_swap_reviews')
        .select('*')
        .eq('reviewed_user_id', userId)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;
      
      // Fetch reviewer profiles separately
      const reviewerIds = reviewsData?.map(r => r.reviewer_id) || [];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', reviewerIds);
      
      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
      
      setReviews((reviewsData || []).map(r => ({
        ...r,
        reviewer: { full_name: profilesMap.get(r.reviewer_id)?.full_name || 'Anonymous' }
      })));
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const handleStartConversation = async () => {
    if (!currentUserId || !userId) {
      toast.error('Please sign in to start a conversation');
      navigate('/auth');
      return;
    }

    navigate('/skill-swap?tab=messages');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile || !userId || userId === 'undefined') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Profile not found</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Back to Wall
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Button variant="ghost" onClick={() => navigate('/skill-swap')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Skill Swap
        </Button>

        {/* Profile Header */}
        <Card className="p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <Avatar className="w-24 h-24">
              <AvatarFallback className="text-2xl">
                {profile.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{profile.full_name || 'User'}</h1>
              
              {profile.location && (
                <div className="flex items-center gap-2 text-muted-foreground mb-3">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.location}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold">{profile.rating_average.toFixed(1)}</span>
                  <span className="text-muted-foreground">({profile.total_reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  <span className="font-semibold">{profile.completed_exchanges}</span>
                  <span className="text-muted-foreground">completed exchanges</span>
                </div>
              </div>

              {profile.bio && (
                <p className="text-muted-foreground mb-4">{profile.bio}</p>
              )}

              {currentUserId !== userId && (
                <Button onClick={handleStartConversation}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Start Conversation
                </Button>
              )}

              {currentUserId === userId && (
                <Button onClick={() => navigate('/skill-swap/profile/edit')} variant="outline">
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Skills Offered */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Skills I Can Teach</h2>
            {profile.skills_offered && profile.skills_offered.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills_offered.map((skill, index) => (
                  <Badge key={index} variant="secondary">{skill}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No skills listed yet</p>
            )}
          </Card>

          {/* Skills Wanted */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Skills I Want to Learn</h2>
            {profile.skills_wanted && profile.skills_wanted.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills_wanted.map((skill, index) => (
                  <Badge key={index} variant="outline">{skill}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No skills listed yet</p>
            )}
          </Card>
        </div>

        {/* Reviews */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Reviews</h2>
          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id}>
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarFallback>
                        {review.reviewer.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{review.reviewer.full_name}</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      {review.comment && (
                        <p className="text-muted-foreground">{review.comment}</p>
                      )}
                    </div>
                  </div>
                  <Separator className="mt-6" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No reviews yet</p>
          )}
        </Card>
      </div>
    </div>
  );
};