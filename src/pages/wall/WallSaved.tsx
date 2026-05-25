import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Bookmark, Loader2, Heart, Library } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
      const { data: profiles } = await (supabase as any).from("profiles_public").select("id, full_name, avatar_url").in("id", userIds);
      const profilesMap = new Map<string, any>((profiles || []).map((p: any) => [p.id, p]));
      return posts.map(post => ({
        ...post,
        profiles: profilesMap.get(post.user_id) || { id: post.user_id, full_name: null, avatar_url: null }
      }));
    },
    enabled: !!user,
  });

  return (
    <div className="max-w-3xl mx-auto px-4 pt-6 pb-8 space-y-6">
      {/* Hero Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/15 via-primary/10 to-teal-500/5 border border-emerald-500/20 p-6 sm:p-8"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-500/15 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="relative flex items-center gap-4">
          <motion.div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/30" whileHover={{ rotate: 5, scale: 1.05 }}>
            <Bookmark className="h-7 w-7 text-white" />
          </motion.div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-foreground via-emerald-500 to-teal-500 bg-clip-text text-transparent">Saved Posts</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {savedPosts.length > 0 ? `${savedPosts.length} saved items in your collection` : "Your bookmarked content"}
            </p>
          </div>
          {savedPosts.length > 0 && (
            <Badge className="ml-auto bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1">
              <Library className="w-3 h-3" /> {savedPosts.length}
            </Badge>
          )}
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading saved posts...</p>
        </div>
      ) : savedPosts.length === 0 ? (
        <Card className="border-dashed border-2 border-primary/20 bg-gradient-to-br from-emerald-500/5 via-background to-teal-500/5 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
          <CardContent className="py-16 text-center relative">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mx-auto mb-5">
              <Heart className="h-10 w-10 text-emerald-500" />
            </motion.div>
            <h3 className="text-xl font-black mb-2">No saved posts yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">Save posts by clicking the bookmark icon to view them later</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {savedPosts.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, type: "spring", stiffness: 200 }}>
              <PostCard post={post} onDelete={refetch} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
