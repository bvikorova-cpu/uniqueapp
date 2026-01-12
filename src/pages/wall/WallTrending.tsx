import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { TrendingUp, Loader2, BookOpen, FlaskConical } from "lucide-react";
import PostCard from "@/components/feed/PostCard";
import { Badge } from "@/components/ui/badge";

// Educational content boost factor (20% bonus)
const EDUCATIONAL_BOOST = 1.2;

// Check if post is educational (from Science Lab or tagged as educational)
const isEducationalPost = (post: any): boolean => {
  const content = (post.content || "").toLowerCase();
  const isFromScienceLab = content.includes("#sciencelab") || 
                           content.includes("#science") ||
                           content.includes("#education") ||
                           content.includes("#learning") ||
                           content.includes("#tutorial");
  return isFromScienceLab;
};

export default function WallTrending() {
  const { data: trendingPosts = [], isLoading, refetch } = useQuery({
    queryKey: ["trending-posts"],
    queryFn: async () => {
      // Get posts from last 7 days ordered by engagement
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: posts } = await supabase
        .from("posts")
        .select(`
          *,
          media (*)
        `)
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("likes_count", { ascending: false })
        .limit(20);

      if (!posts) return [];

      // Get unique user IDs
      const userIds = Array.from(new Set(posts.map(p => p.user_id)));

      // Batch fetch all profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      const profilesMap = new Map(
        (profiles || []).map(p => [p.id, p])
      );

      // Calculate engagement score with educational boost
      const postsWithEngagement = posts.map(post => {
        const baseScore = (post.likes_count || 0) + 
                         (post.comments_count || 0) * 2 + 
                         (post.shares_count || 0) * 3 +
                         (post.reposts_count || 0) * 2;
        
        const isEducational = isEducationalPost(post);
        const engagementScore = isEducational ? baseScore * EDUCATIONAL_BOOST : baseScore;
        
        return {
          ...post,
          profiles: profilesMap.get(post.user_id) || {
            id: post.user_id,
            full_name: null,
            avatar_url: null
          },
          engagementScore,
          isEducational
        };
      });

      return postsWithEngagement.sort((a, b) => b.engagementScore - a.engagementScore);
    },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">Trending</h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : trendingPosts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No trending posts yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {trendingPosts.map((post, index) => (
              <div key={post.id} className="relative">
                <div className="flex items-center gap-2 absolute -left-4 top-4 z-10">
                  {index < 3 && (
                    <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                      {index + 1}
                    </div>
                  )}
                  {post.isEducational && (
                    <Badge variant="secondary" className="gap-1 bg-emerald-500/20 text-emerald-600 border-emerald-500/30">
                      <FlaskConical className="h-3 w-3" />
                      +20% Boost
                    </Badge>
                  )}
                </div>
                <PostCard
                  post={post}
                  onDelete={refetch}
                />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
