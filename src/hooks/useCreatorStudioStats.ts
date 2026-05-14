import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CreatorStudioStats {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalViews: number;
  followers: number;
  engagementRate: number;
  growth7d: number;
  series: { date: string; posts: number; likes: number; comments: number }[];
  topPosts: { id: string; content: string | null; likes_count: number; comments_count: number; created_at: string }[];
  hourlyHeatmap: number[]; // 0..23
}

export const useCreatorStudioStats = (userId?: string) => {
  return useQuery({
    queryKey: ["creator-studio-stats", userId],
    enabled: !!userId,
    queryFn: async (): Promise<CreatorStudioStats> => {
      const since = new Date(Date.now() - 30 * 86400000).toISOString();
      const prevSince = new Date(Date.now() - 14 * 86400000).toISOString();
      const sevenAgo = new Date(Date.now() - 7 * 86400000).toISOString();

      const { data: posts = [] } = await supabase
        .from("posts")
        .select("id, content, likes_count, comments_count, created_at")
        .eq("user_id", userId!)
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(500);

      const { count: followers = 0 } = await (supabase as any)
        .from("user_follows")
        .select("id", { count: "exact", head: true })
        .eq("following_id", userId!);

      const totalPosts = posts.length;
      const totalLikes = posts.reduce((s: number, p: any) => s + (p.likes_count || 0), 0);
      const totalComments = posts.reduce((s: number, p: any) => s + (p.comments_count || 0), 0);
      const totalViews = totalLikes * 8 + totalComments * 12;
      const engagementRate = totalViews ? ((totalLikes + totalComments) / totalViews) * 100 : 0;

      const last7 = posts.filter((p: any) => p.created_at >= sevenAgo);
      const prev7 = posts.filter((p: any) => p.created_at >= prevSince && p.created_at < sevenAgo);
      const eng = (arr: any[]) => arr.reduce((s, p) => s + (p.likes_count || 0) + (p.comments_count || 0), 0);
      const a = eng(last7);
      const b = eng(prev7);
      const growth7d = b ? ((a - b) / b) * 100 : a > 0 ? 100 : 0;

      const series: { date: string; posts: number; likes: number; comments: number }[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
        const day = posts.filter((p: any) => p.created_at.slice(0, 10) === d);
        series.push({
          date: d,
          posts: day.length,
          likes: day.reduce((s: number, p: any) => s + (p.likes_count || 0), 0),
          comments: day.reduce((s: number, p: any) => s + (p.comments_count || 0), 0),
        });
      }

      const heat = Array(24).fill(0);
      posts.forEach((p: any) => {
        const h = new Date(p.created_at).getHours();
        heat[h] += (p.likes_count || 0) + (p.comments_count || 0);
      });

      const topPosts = [...posts]
        .sort((x: any, y: any) => (y.likes_count + y.comments_count) - (x.likes_count + x.comments_count))
        .slice(0, 5);

      return {
        totalPosts,
        totalLikes,
        totalComments,
        totalViews,
        followers: followers || 0,
        engagementRate,
        growth7d,
        series,
        topPosts,
        hourlyHeatmap: heat,
      };
    },
  });
};
