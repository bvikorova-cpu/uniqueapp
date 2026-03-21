import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, ArrowLeft, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const categoryConfig: Record<string, { title: string; icon: string; categories: string[] }> = {
  art: {
    title: "Art & Creativity",
    icon: "🎨",
    categories: ["drawing", "painting", "digital_art", "sculpture", "photography", "handmade", "makeup_art", "tattoo"]
  },
  music: {
    title: "Music",
    icon: "🎤",
    categories: ["singing", "instrument", "music_production", "beatbox", "rap"]
  },
  dance: {
    title: "Dance & Movement",
    icon: "💃",
    categories: ["dance", "breakdance", "gymnastics", "parkour"]
  },
  sports: {
    title: "Sports & Fitness",
    icon: "💪",
    categories: ["training", "yoga", "martial_arts", "extreme_sport", "sport_trick"]
  },
  entertainment: {
    title: "Entertainment",
    icon: "😂",
    categories: ["funny_video", "standup", "impressions", "magic", "pranks"]
  },
  education: {
    title: "Education",
    icon: "💡",
    categories: ["life_advice", "tutorial", "cooking", "diy", "science"]
  },
  photography: {
    title: "Photography",
    icon: "📸",
    categories: ["photography"]
  },
  cooking: {
    title: "Cooking & Baking",
    icon: "👨‍🍳",
    categories: ["cooking"]
  },
  digital_art: {
    title: "Digital Art",
    icon: "💻",
    categories: ["digital_art"]
  },
  makeup_art: {
    title: "Makeup Art",
    icon: "💄",
    categories: ["makeup_art"]
  }
};

const MegatalentCategory = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedSubmissions, setLikedSubmissions] = useState<Set<string>>(new Set());
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [expandedMedia, setExpandedMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);

  const config = category ? categoryConfig[category] : null;

  useEffect(() => {
    if (!config) {
      navigate("/megatalent");
      return;
    }
    fetchSubmissions();
    fetchUserVotes();
  }, [category]);

  const fetchSubmissions = async () => {
    if (!config) return;
    
    try {
      setLoading(true);
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('talent_submissions')
        .select('*')
        .in('category', config.categories as any)
        .eq('is_active', true)
        .order('votes_count', { ascending: false })
        .limit(50);

      if (submissionsError) throw submissionsError;

      if (submissionsData && submissionsData.length > 0) {
        const userIds = [...new Set(submissionsData.map(s => s.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);

        const submissionIds = submissionsData.map(s => s.id);
        const { data: commentsData } = await supabase
          .from('talent_comments')
          .select('submission_id')
          .in('submission_id', submissionIds);

        const counts: Record<string, number> = {};
        commentsData?.forEach(comment => {
          counts[comment.submission_id] = (counts[comment.submission_id] || 0) + 1;
        });
        setCommentCounts(counts);

        const enrichedSubmissions = submissionsData.map(submission => ({
          ...submission,
          profiles: profilesData?.find(p => p.id === submission.user_id)
        }));

        setSubmissions(enrichedSubmissions);
      } else {
        setSubmissions([]);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserVotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('talent_votes')
        .select('submission_id')
        .eq('user_id', user.id);

      if (data) {
        setLikedSubmissions(new Set(data.map(v => v.submission_id)));
      }
    } catch (error) {
      console.error('Error fetching user votes:', error);
    }
  };

  const handleVote = async (submissionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Login required",
          description: "Please log in to vote",
          variant: "destructive",
        });
        return;
      }

      const isLiked = likedSubmissions.has(submissionId);

      if (isLiked) {
        const { error } = await supabase
          .from('talent_votes')
          .delete()
          .eq('submission_id', submissionId)
          .eq('user_id', user.id);

        if (error) throw error;

        setLikedSubmissions(prev => {
          const newSet = new Set(prev);
          newSet.delete(submissionId);
          return newSet;
        });

        setSubmissions(prev => prev.map(s => 
          s.id === submissionId 
            ? { ...s, votes_count: (s.votes_count || 0) - 1 }
            : s
        ));
      } else {
        const { error } = await supabase
          .from('talent_votes')
          .insert({
            submission_id: submissionId,
            user_id: user.id,
          });

        if (error) throw error;

        setLikedSubmissions(prev => new Set(prev).add(submissionId));

        setSubmissions(prev => prev.map(s => 
          s.id === submissionId 
            ? { ...s, votes_count: (s.votes_count || 0) + 1 }
            : s
        ));
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Error",
        description: "Failed to vote",
        variant: "destructive",
      });
    }
  };

  if (!config) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/megatalent")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Megatalent
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            {config.icon} {config.title}
          </h1>
          <p className="text-xl text-muted-foreground">
            Discover amazing talents in {config.title.toLowerCase()}
          </p>
          <Badge variant="secondary" className="mt-4 text-lg px-6 py-2">
            {submissions.length} Submissions
          </Badge>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-accent" />
                <CardContent className="p-4">
                  <div className="h-4 bg-accent rounded mb-2" />
                  <div className="h-3 bg-accent rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-muted-foreground">No submissions yet in this category</p>
            <p className="text-muted-foreground mt-2">Be the first to submit!</p>
            <Button onClick={() => navigate("/megatalent")} className="mt-6">
              Submit Your Talent
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {submissions.map((submission) => (
              <Card key={submission.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
                <div 
                  className="relative aspect-video bg-accent cursor-pointer overflow-hidden"
                  onClick={() => setExpandedMedia({ url: submission.media_url, type: submission.media_type })}
                >
                  {submission.media_type === 'video' ? (
                    <div className="relative w-full h-full">
                      <video
                        src={submission.media_url}
                        className="w-full h-full object-cover"
                        playsInline
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                        <Play className="w-16 h-16 text-white" />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={submission.media_url}
                      alt={submission.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  )}
                </div>

                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    {submission.profiles?.avatar_url && (
                      <img
                        src={submission.profiles.avatar_url}
                        alt={submission.profiles.full_name}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-1">{submission.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {submission.profiles?.full_name || 'Anonymous'}
                      </p>
                    </div>
                  </div>

                  {submission.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {submission.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote(submission.id)}
                      className={likedSubmissions.has(submission.id) ? "text-red-500" : ""}
                    >
                      <Heart
                        className={`w-5 h-5 mr-1 ${likedSubmissions.has(submission.id) ? "fill-current" : ""}`}
                      />
                      {submission.votes_count || 0}
                    </Button>

                    <Button variant="ghost" size="sm">
                      <MessageCircle className="w-5 h-5 mr-1" />
                      {commentCounts[submission.id] || 0}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!expandedMedia} onOpenChange={() => setExpandedMedia(null)}>
        <DialogContent className="max-w-4xl w-full p-0">
          {expandedMedia?.type === 'video' ? (
            <video
              src={expandedMedia.url}
              controls
              autoPlay
              className="w-full h-auto max-h-[80vh]"
            />
          ) : (
            <img
              src={expandedMedia?.url}
              alt="Expanded view"
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MegatalentCategory;
