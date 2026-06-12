import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Loader2, FlaskConical, Flame, Trophy, Medal, Zap } from "lucide-react";
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
      const { data: profiles } = await (supabase as any).from("public_profiles").select("id, full_name, avatar_url").in("id", userIds);
      const profilesMap = new Map<string, any>((profiles || []).map((p: any) => [p.id, p]));
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
    <Medal className="w-4 h-4" />,
    <Flame className="w-4 h-4" />,
  ];
  const rankColors = [
    "from-yellow-400 via-amber-500 to-orange-500",
    "from-gray-300 via-gray-400 to-slate-500",
    "from-amber-600 via-orange-500 to-red-500",
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 pt-6 pb-8 space-y-6">
      {/* Hero Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500/15 via-primary/10 to-yellow-500/5 border border-orange-500/20 p-6 sm:p-8"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-orange-500/15 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="relative flex items-center gap-4">
          <motion.div 
            className="p-4 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-xl shadow-orange-500/30"
            whileHover={{ rotate: 5, scale: 1.05 }}
            animate={{ rotate: [0, -3, 3, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
          >
            <TrendingUp className="h-7 w-7 text-white" />
          </motion.div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-foreground via-orange-500 to-red-500 bg-clip-text text-transparent">
              Trending
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Most engaging posts this week</p>
          </div>
          {trendingPosts.length > 0 && (
            <Badge className="ml-auto bg-orange-500/10 text-orange-600 border-orange-500/20 gap-1">
              <Zap className="w-3 h-3" /> {trendingPosts.length} posts
            </Badge>
          )}
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading trending content...</p>
        </div>
      ) : trendingPosts.length === 0 ? (
        <Card className="border-dashed border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl" />
          <CardContent className="py-16 text-center relative">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center mx-auto mb-5">
              <TrendingUp className="h-10 w-10 text-orange-500" />
            </motion.div>
            <h3 className="text-xl font-black mb-2">No trending posts yet</h3>
            <p className="text-sm text-muted-foreground">Posts with high engagement will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {trendingPosts.map((post, index) => (
            <motion.div 
              key={post.id} 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: index * 0.06, type: "spring", stiffness: 200 }} 
              className="relative"
            >
              {/* Rank badge */}
              {index < 3 && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1, type: "spring" }}
                  className={`absolute -left-2 top-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r ${rankColors[index]} text-white text-xs font-black shadow-xl`}
                >
                  {rankIcons[index]}
                  #{index + 1}
                </motion.div>
              )}
              {index >= 3 && (
                <div className="absolute -left-2 top-4 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-muted border border-border text-muted-foreground text-xs font-black shadow">
                  {index + 1}
                </div>
              )}
              {post.isEducational && (
                <Badge className="absolute right-2 top-4 z-10 gap-1 bg-emerald-500/20 text-emerald-600 border-emerald-500/30 text-[10px] shadow-lg">
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
