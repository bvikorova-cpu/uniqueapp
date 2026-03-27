import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Bookmark, Loader2, Heart } from "lucide-react";
import PostCard from "@/components/feed/PostCard";
import { motion } from "framer-motion";

export default function WallSaved() {
  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => { const { data: { user } } = await supabase.auth.getUser(); return user; },
  });

  const { data: savedPosts = [], isLoading, refetch } = useQuery({
    queryKey: ["saved-posts", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data: savedData } = await supabase.from("saved_posts").select("post_id").eq("user_id", user.id).order("created_at", { ascending: false });
      if (!savedData || savedData.length === 0) return [];
      const postIds = savedData.map(s => s.post_id);
      const { data: posts } = await supabase.from("posts").select(`*, media (*)`).in("id", postIds);
      if (!posts) return [];
      const userIds = Array.from(new Set(posts.map(p => p.user_id)));
      const { data: profiles } = await supabase.from("profiles").select("id, full_name, avatar_url").in("id", userIds);
      const profilesMap = new Map((profiles || []).map(p => [p.id, p]));
      return posts.map(post => ({
        ...post,
        profiles: profilesMap.get(post.user_id) || { id: post.user_id, full_name: null, avatar_url: null }
      }));
    },
    enabled: !!user,
  });

  return (
    <div className="max-w-3xl mx-auto px-4 pt-6 pb-8 space-y-8">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg">
          <Bookmark className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black">Saved Posts</h1>
          <p className="text-sm text-muted-foreground">
            {savedPosts.length > 0 ? `${savedPosts.length} saved items` : "Your bookmarked content"}
          </p>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : savedPosts.length === 0 ? (
        <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold mb-2">No saved posts yet</h3>
            <p className="text-sm text-muted-foreground">Save posts to view them later</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {savedPosts.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <PostCard post={post} onDelete={refetch} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
