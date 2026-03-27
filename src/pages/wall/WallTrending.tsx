import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Loader2, FlaskConical, Flame, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PostCard from "@/components/feed/PostCard";
import { motion } from "framer-motion";

const EDUCATIONAL_BOOST = 1.2;

const isEducationalPost = (post: any): boolean => {
  const content = (post.content || "").toLowerCase();
  return content.includes("#sciencelab") || content.includes("#science") || content.includes("#education") || content.includes("#learning") || content.includes("#tutorial");
};

export default function WallTrending() {
  const { data: trendingPosts = [], isLoading, refetch } = useQuery({
    queryKey: ["trending-posts"],
    queryFn: async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { data: posts } = await supabase.from("posts").select(`*, media (*)`).gte("created_at", sevenDaysAgo.toISOString()).order("likes_count", { ascending: false }).limit(20);
      if (!posts) return [];
      const userIds = Array.from(new Set(posts.map(p => p.user_id)));
      const { data: profiles } = await supabase.from("profiles").select("id, full_name, avatar_url").in("id", userIds);
      const profilesMap = new Map((profiles || []).map(p => [p.id, p]));
      return posts.map(post => {
        const baseScore = (post.likes_count || 0) + (post.comments_count || 0) * 2 + (post.shares_count || 0) * 3 + (post.reposts_count || 0) * 2;
        const isEducational = isEducationalPost(post);
        return {
          ...post,
          profiles: profilesMap.get(post.user_id) || { id: post.user_id, full_name: null, avatar_url: null },
          engagementScore: isEducational ? baseScore * EDUCATIONAL_BOOST : baseScore,
          isEducational
        };
      }).sort((a, b) => b.engagementScore - a.engagementScore);
    },
  });

  const rankIcons = [
    <Trophy className="w-4 h-4" />,
    <Flame className="w-4 h-4" />,
    <TrendingUp className="w-4 h-4" />,
  ];
  const rankColors = ["from-yellow-400 to-amber-500", "from-gray-300 to-gray-400", "from-amber-600 to-orange-600"];

  return (
    <div className="max-w-3xl mx-auto px-4 pt-6 pb-8 space-y-8">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg">
          <TrendingUp className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black">Trending</h1>
          <p className="text-sm text-muted-foreground">Most engaging posts this week</p>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : trendingPosts.length === 0 ? (
        <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
          <CardContent className="py-16 text-center">
            <TrendingUp className="h-10 w-10 mx-auto mb-3 text-primary opacity-50" />
            <p className="text-muted-foreground">No trending posts yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {trendingPosts.map((post, index) => (
            <motion.div key={post.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="relative">
              {/* Rank badge */}
              {index < 3 && (
                <div className={`absolute -left-2 top-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r ${rankColors[index]} text-white text-xs font-bold shadow-lg`}>
                  {rankIcons[index]}
                  #{index + 1}
                </div>
              )}
              {index >= 3 && (
                <div className="absolute -left-2 top-4 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground text-xs font-bold shadow">
                  {index + 1}
                </div>
              )}
              {post.isEducational && (
                <Badge className="absolute right-2 top-4 z-10 gap-1 bg-emerald-500/20 text-emerald-600 border-emerald-500/30 text-[10px]">
                  <FlaskConical className="h-3 w-3" /> +20% Boost
                </Badge>
              )}
              <div className="ml-6">
                <PostCard post={post} onDelete={refetch} />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
