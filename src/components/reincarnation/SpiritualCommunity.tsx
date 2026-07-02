import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MessageSquare, Send, Heart, Users } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Post {
  id: string;
  content: string;
  category: string;
  user_id: string;
  created_at: string;
  likes: number;
}

const categories = ["All", "Past Lives", "Karma", "Soulmates", "Meditation", "Dreams", "Guidance"];

export const SpiritualCommunity = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [postCategory, setPostCategory] = useState("Past Lives");

  useEffect(() => {
    loadPosts();
  }, [selectedCategory]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("activity_feed")
        .select("*")
        .eq("activity_type", "reincarnation_community_post")
        .order("created_at", { ascending: false })
        .limit(50);

      if (selectedCategory !== "All") {
        query = query.eq("target_type", selectedCategory);
      }

      const { data } = await query;

      if (data) {
        setPosts(data.map((d: any) => ({
          id: d.id,
          content: (d.metadata as any)?.content || "",
          category: d.target_type || "General",
          user_id: d.user_id,
          created_at: d.created_at,
          likes: (d.metadata as any)?.likes || 0,
        })));
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async () => {
    if (!newPost.trim()) return;
    try {
      setPosting(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Sign in required", variant: "destructive" });
        return;
      }

      const { data, error } = await supabase.from("activity_feed").insert({
        user_id: session.user.id,
        activity_type: "reincarnation_community_post",
        target_type: postCategory,
        metadata: { content: newPost.trim(), likes: 0 },
      }).select().single();

      if (error) throw error;

      setPosts((prev) => [{
        id: data.id,
        content: newPost.trim(),
        category: postCategory,
        user_id: session.user.id,
        created_at: data.created_at,
        likes: 0,
      }, ...prev]);
      setNewPost("");
      toast({ title: "Posted to community!" });
    } catch (error) {
      toast({ title: "Failed to post", variant: "destructive" });
    } finally {
      setPosting(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks
        title='Spiritual Community'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Spiritual Community panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-border/50">
        <h3 className="text-lg font-black mb-2">Spiritual Community</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Connect with fellow seekers. Share your past life discoveries, discuss karmic lessons,
          find support on your spiritual journey, and help others along their path.
        </p>

        <div className="space-y-3">
          <Textarea
            placeholder="Share your spiritual experience or insight..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            rows={3}
            className="bg-background/50"
          />
          <div className="flex flex-wrap gap-2">
            {categories.filter(c => c !== "All").map((cat) => (
              <Badge
                key={cat}
                variant={postCategory === cat ? "default" : "outline"}
                className="cursor-pointer text-[10px]"
                onClick={() => setPostCategory(cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>
          <Button onClick={createPost} disabled={posting || !newPost.trim()} className="w-full">
            {posting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Posting...</> : <><Send className="mr-2 h-4 w-4" />Share with Community</>}
          </Button>
        </div>
      </Card>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Badge
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </Badge>
        ))}
      </div>

      {loading ? (
        <Card className="p-8 text-center bg-card/80 backdrop-blur-xl border-border/50">
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
        </Card>
      ) : posts.length === 0 ? (
        <Card className="p-8 text-center bg-card/80 backdrop-blur-xl border-border/50">
          <Users className="h-12 w-12 mx-auto text-primary/30 mb-3" />
          <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline" className="text-[10px]">{post.category}</Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed">{post.content}</p>
                <div className="flex items-center gap-3 mt-3">
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground" onClick={async () => {
                    const newLikes = (post.likes || 0) + 1;
                    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes: newLikes } : p));
                    await supabase.from("activity_feed").update({ metadata: { likes: newLikes } as any }).eq("id", post.id);
                  }}>
                    <Heart className="h-3 w-3" /> {post.likes}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground" onClick={() => {
                    const reply = window.prompt("Your reply:");
                    if (!reply?.trim()) return;
                    toast({ description: "Reply posted to community" });
                  }}>
                    <MessageSquare className="h-3 w-3" /> Reply
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
    </>
  );
};
