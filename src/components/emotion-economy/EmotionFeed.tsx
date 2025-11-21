import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Heart, MessageCircle, Eye, Sparkles, RefreshCw } from "lucide-react";

export function EmotionFeed() {
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('emotion_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPosts();
    setIsRefreshing(false);
    toast({
      title: "Feed Refreshed",
      description: "Latest posts loaded"
    });
  };

  const handleLike = async (postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to like posts",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Liked! ❤️",
        description: "You earned emotion rewards"
      });
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handlePost = async () => {
    if (!content.trim()) {
      toast({
        title: "Empty Post",
        description: "Please write something before posting",
        variant: "destructive"
      });
      return;
    }

    setIsPosting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to post",
          variant: "destructive"
        });
        return;
      }

      // Simulate AI emotion detection
      const detectedEmotions = {
        joy: Math.floor(Math.random() * 100),
        motivation: Math.floor(Math.random() * 100),
        love: Math.floor(Math.random() * 100)
      };

      const { error } = await supabase
        .from('emotion_posts')
        .insert({
          user_id: user.id,
          content: content,
          ai_detected_emotions: detectedEmotions,
          emotion_reward: { joy: 5, motivation: 3 }
        });

      if (error) throw error;

      toast({
        title: "Post Created! 💚",
        description: "AI detected your emotions and rewarded you"
      });

      setContent("");
      await fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive"
      });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Share Your Emotions</CardTitle>
          <CardDescription>
            AI will detect your emotions and reward you accordingly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="What's on your mind? Share joy, motivation, or anything else..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
          />
          <div className="flex items-center justify-between">
            <div className="flex gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span>AI will analyze your post</span>
            </div>
            <Button onClick={handlePost} disabled={isPosting}>
              {isPosting ? "Posting..." : "Post"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Posts</CardTitle>
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No posts yet. Be the first to share your emotions!</p>
              </div>
            ) : (
              posts.map((post) => (
                <Card key={post.id} className="border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="text-sm font-semibold mb-1">@user{post.user_id.substring(0, 6)}</p>
                        <p className="text-sm">{post.content}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mb-3 flex-wrap">
                      {post.ai_detected_emotions && Object.entries(post.ai_detected_emotions).map(([emotion, value]) => (
                        <Badge key={emotion} variant="outline" className="gap-1">
                          <Heart className="h-3 w-3" />
                          {emotion}: {value as number}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-6 text-sm text-muted-foreground">
                      <button 
                        className="flex items-center gap-1 hover:text-foreground transition-colors" 
                        onClick={() => handleLike(post.id)}
                      >
                        <Heart className="h-4 w-4" />
                        <span>{post.likes_count || 0}</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.comments_count || 0}</span>
                      </button>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{post.views_count || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}