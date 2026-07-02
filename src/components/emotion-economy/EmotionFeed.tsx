import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Heart, MessageCircle, Eye, Sparkles, RefreshCw, Coins, AlertCircle, ArrowLeft } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface EmotionCredits {
  credits_remaining: number;
  total_credits_purchased: number;
  total_credits_used: number;
}

export function EmotionFeed({ onBack }: { onBack?: () => void }) {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [credits, setCredits] = useState<EmotionCredits | null>(null);
  const [isLoadingCredits, setIsLoadingCredits] = useState(true);

  useEffect(() => {
    fetchPosts();
    fetchCredits();
    
    // Handle payment callback
    const payment = searchParams.get('payment');
    const creditsParam = searchParams.get('credits');
    
    if (payment === 'success' && creditsParam) {
      handlePaymentSuccess(parseInt(creditsParam, 10));
    }
  }, [searchParams]);

  const handlePaymentSuccess = async (creditsToAdd: number) => {
    try {
      const { error } = await supabase.functions.invoke('verify-emotion-credits-payment', {
        body: { credits: creditsToAdd }
      });

      if (error) throw error;

      toast({
        title: "Credits Added! 🎉",
        description: `${creditsToAdd} AI analysis credits have been added to your account`
      });

      await fetchCredits();
      
      // Clear URL params
      window.history.replaceState({}, '', '/emotion-economy');
    } catch (error) {
      console.error('Error verifying payment:', error);
    }
  };

  const fetchCredits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoadingCredits(false);
        return;
      }

      const { data, error } = await supabase
        .from('emotion_credits')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setCredits(data);
      } else {
        // No free credits - users must purchase
        setCredits({ credits_remaining: 0, total_credits_purchased: 0, total_credits_used: 0 });
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setIsLoadingCredits(false);
    }
  };

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
    await fetchCredits();
    setIsRefreshing(false);
    toast({
      title: "Feed Refreshed",
      description: "Latest posts loaded"
    });
  };

  const handleBuyCredits = async (packageId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to purchase credits",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-emotion-credits-payment', {
        body: { packageId }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      toast({
        title: "Error",
        description: "Failed to initiate payment",
        variant: "destructive"
      });
    }
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

      // Toggle like: try insert; if conflict, delete
      const { error: insertError } = await supabase
        .from('emotion_post_likes')
        .insert({ post_id: postId, user_id: user.id });

      if (insertError) {
        // Likely already liked → unlike
        const { error: delError } = await supabase
          .from('emotion_post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        if (delError) throw delError;
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: Math.max((p.likes_count || 1) - 1, 0) } : p));
      } else {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: (p.likes_count || 0) + 1 } : p));
        toast({ title: "Liked! ❤️" });
      }
    } catch (error) {
      console.error('Error liking post:', error);
      toast({ title: "Error", description: "Failed to like post", variant: "destructive" });
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

      // Call AI emotion analysis
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-emotion', {
        body: { content }
      });

      if (analysisError) {
        if (analysisData?.needs_purchase) {
          toast({
            title: "No Credits Remaining",
            description: "Please purchase more AI analysis credits to continue",
            variant: "destructive"
          });
          return;
        }
        throw analysisError;
      }

      // Create post with AI-detected emotions
      const { error } = await supabase
        .from('emotion_posts')
        .insert({
          user_id: user.id,
          content: content,
          ai_detected_emotions: analysisData.emotions,
          emotion_reward: analysisData.emotion_reward
        });

      if (error) throw error;

      // Update local credits
      if (analysisData.credits_remaining !== undefined) {
        setCredits(prev => prev ? { ...prev, credits_remaining: analysisData.credits_remaining } : null);
      }

      toast({
        title: "Post Created! 💚",
        description: `AI detected: ${analysisData.emotions.dominant_emotion}. 1 credit used.`
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
      <FloatingHowItWorks
        title={"Emotion Feed"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      {onBack && (
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Hub
        </Button>
      )}
      {/* AI Credits Status */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              AI Analysis Credits
            </CardTitle>
            <Badge variant={credits && credits.credits_remaining > 0 ? "default" : "destructive"}>
              {isLoadingCredits ? "..." : credits?.credits_remaining ?? 0} credits
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {credits && credits.credits_remaining < 5 && (
            <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 mb-3">
              <AlertCircle className="h-4 w-4" />
              Low credits! Buy more to continue AI emotion analysis.
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleBuyCredits('10')}>
              10 Credits - €2.99
            </Button>
            <Button variant="default" size="sm" className="flex-1" onClick={() => handleBuyCredits('50')}>
              50 Credits - €9.99
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleBuyCredits('100')}>
              100 Credits - €14.99
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Share Your Emotions</CardTitle>
          <CardDescription>
            AI will analyze and detect real emotions from your text (uses 1 credit)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="What's on your mind? Share joy, motivation, or anything else..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
          />
          <div className="flex items-center justify-end">
            <Button 
              onClick={handlePost} 
              disabled={isPosting || (credits?.credits_remaining ?? 0) < 1}
            >
              {isPosting ? "Analyzing..." : "Post (1 credit)"}
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
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      {post.ai_detected_emotions && (
                        <>
                          {post.ai_detected_emotions.dominant_emotion && (
                            <Badge className="bg-primary/20 text-primary">
                              {post.ai_detected_emotions.dominant_emotion}
                            </Badge>
                          )}
                          {Object.entries(post.ai_detected_emotions)
                            .filter(([key]) => !['dominant_emotion', 'emotional_summary'].includes(key))
                            .filter(([_, value]) => typeof value === 'number' && (value as number) > 30)
                            .slice(0, 4)
                            .map(([emotion, value]) => (
                              <Badge key={emotion} variant="outline" className="gap-1 text-xs">
                                <Heart className="h-3 w-3" />
                                {emotion}: {value as number}
                              </Badge>
                            ))}
                        </>
                      )}
                    </div>
                    {post.ai_detected_emotions?.emotional_summary && (
                      <p className="text-xs text-muted-foreground italic mb-3">
                        AI Summary: {post.ai_detected_emotions.emotional_summary}
                      </p>
                    )}
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
