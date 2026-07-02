import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Heart, MessageCircle, Lock, Image as ImageIcon, ShieldAlert } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface ExclusivePost {
  id: string;
  title: string;
  content: string;
  media_urls: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  tier_ids: string[];
  is_adult_content: boolean;
}

interface ExclusivePostsListProps {
  creatorId: string;
  userTierId?: string | null;
  isSubscribed: boolean;
}

export function ExclusivePostsList({ creatorId, userTierId, isSubscribed }: ExclusivePostsListProps) {
  const [posts, setPosts] = useState<ExclusivePost[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPosts();
  }, [creatorId, userTierId]);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('creator_exclusive_posts')
        .select('*')
        .eq('creator_id', creatorId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPosts(data || []);
    } catch (error: any) {
      console.error('Error loading posts:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load exclusive posts",
      });
    } finally {
      setLoading(false);
    }
  };

  const canViewPost = (post: ExclusivePost) => {
    if (!isSubscribed || !userTierId) return false;
    if (!post.tier_ids || post.tier_ids.length === 0) return isSubscribed;
    return post.tier_ids.includes(userTierId);
  };

  const handleLike = async (postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('creator_post_likes')
        .insert({
          post_id: postId,
          user_id: user.id
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already Liked",
            description: "You've already liked this post",
          });
        } else {
          throw error;
        }
      } else {
        loadPosts();
        toast({
          title: "Liked!",
          description: "Post liked successfully",
        });
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  if (loading) {
    return (
    <>
      <FloatingHowItWorks title={"Exclusive Posts List - How it works"} steps={[{ title: 'Open', desc: 'Access the Exclusive Posts List section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Exclusive Posts List.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading exclusive content...</p>
      </div>
    </>
  );
  }

  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">No exclusive posts yet. Check back soon!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">Exclusive Content</h3>
      
      <div className="space-y-4">
        {posts.map((post) => {
          const canView = canViewPost(post);
          
          return (
            <Card key={post.id} className={!canView ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {post.title}
                      {!canView && <Lock className="h-4 w-4 text-muted-foreground" />}
                      {post.is_adult_content && (
                        <Badge variant="destructive" className="text-xs ml-2">
                          <ShieldAlert className="h-3 w-3 mr-1" />
                          18+
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </CardDescription>
                  </div>
                  {post.tier_ids && post.tier_ids.length > 0 && (
                    <Badge variant="secondary">Tier Exclusive</Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                {canView ? (
                  <>
                    {post.media_urls && post.media_urls.length > 0 && (
                      <div className="mb-4 rounded-lg overflow-hidden space-y-2">
                        {post.media_urls.map((url, index) => (
                          <img 
                            key={index}
                            src={url} 
                            alt={`${post.title} - ${index + 1}`}
                            className="w-full h-auto rounded"
                          />
                        ))}
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{post.content}</p>
                  </>
                ) : (
                  <div className="text-center py-8 space-y-3">
                    <Lock className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">
                      Subscribe to access this exclusive content
                    </p>
                  </div>
                )}
              </CardContent>

              {canView && (
                <CardFooter className="flex gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-2"
                  >
                    <Heart className="h-4 w-4" />
                    {post.likes_count || 0}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => {
                      const el = document.getElementById(`post-comments-${post.id}`);
                      if (el) {
                        el.scrollIntoView({ behavior: "smooth", block: "center" });
                      } else {
                        toast({
                          title: "💬 Comments",
                          description: `${post.comments_count || 0} comments on this post`,
                        });
                      }
                    }}>
                    <MessageCircle className="h-4 w-4" />
                    {post.comments_count || 0}
                  </Button>
                </CardFooter>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
