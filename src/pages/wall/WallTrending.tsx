import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { TrendingUp, Loader2 } from "lucide-react";
import PostCard from "@/components/feed/PostCard";

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

      // Calculate engagement score and sort
      const postsWithEngagement = posts.map(post => ({
        ...post,
        profiles: profilesMap.get(post.user_id) || {
          id: post.user_id,
          full_name: null,
          avatar_url: null
        },
        engagementScore: (post.likes_count || 0) + 
                        (post.comments_count || 0) * 2 + 
                        (post.shares_count || 0) * 3 +
                        (post.reposts_count || 0) * 2
      }));

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
                {index < 3 && (
                  <div className="absolute -left-4 top-4 flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold z-10">
                    {index + 1}
                  </div>
                )}
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
