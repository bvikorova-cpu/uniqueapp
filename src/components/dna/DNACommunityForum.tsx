import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageSquare, Send, Heart, Clock, User, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: string;
  category: string;
  likes: number;
  replies: number;
  created_at: string;
}

export const DNACommunityForum = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "General" });
  const [posting, setPosting] = useState(false);
  const [filter, setFilter] = useState("All");

  const categories = ["All", "General", "Heritage", "Health", "Dating", "Research"];

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      // Load from activity_feed as forum posts for DNA community
      const { data } = await supabase
        .from("activity_feed")
        .select("id, activity_type, metadata, created_at, user_id")
        .eq("target_type", "dna_community")
        .order("created_at", { ascending: false })
        .limit(50);

      if (data?.length) {
        const userIds = [...new Set(data.map(d => d.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", userIds);
        const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

        const forumPosts: ForumPost[] = data.map(d => {
          const meta = (d.metadata || {}) as Record<string, any>;
          return {
            id: d.id,
            title: meta.title || "Untitled Post",
            content: meta.content || "",
            author: profileMap.get(d.user_id) || "User",
            category: meta.category || "General",
            likes: meta.likes || 0,
            replies: meta.replies || 0,
            created_at: d.created_at,
          };
        });
        setPosts(forumPosts);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast({ title: "Fill All Fields", description: "Title and content are required", variant: "destructive" });
      return;
    }

    try {
      setPosting(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Sign In Required", description: "Please sign in to post", variant: "destructive" });
        return;
      }

      const { error } = await supabase.from("activity_feed").insert({
        user_id: session.user.id,
        activity_type: "dna_community_post",
        target_type: "dna_community",
        metadata: {
          title: newPost.title,
          content: newPost.content,
          category: newPost.category,
          likes: 0,
          replies: 0,
        },
      });

      if (error) throw error;

      toast({ title: "Posted!", description: "Your post is now live in the DNA Community" });
      setNewPost({ title: "", content: "", category: "General" });
      setShowCreate(false);
      loadPosts();
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to create post", variant: "destructive" });
    } finally {
      setPosting(false);
    }
  };

  const filtered = filter === "All" ? posts : posts.filter(p => p.category === filter);

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <>
      <FloatingHowItWorks
        title='DNACommunity Forum'
        steps={[
          { title: 'Open the tool', desc: 'Launch the DNACommunity Forum panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <Card className="p-5 bg-gradient-to-br from-sky-500/10 to-cyan-500/10 border-sky-500/20">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-5 h-5 text-sky-500" />
              <span className="font-black text-sm">DNA Community Forum</span>
            </div>
            <p className="text-xs text-muted-foreground">Connect with genetic relatives and discuss heritage discoveries</p>
          </div>
          <Button size="sm" onClick={() => setShowCreate(!showCreate)} className="gap-1">
            <Plus className="w-3.5 h-3.5" /> New Post
          </Button>
        </div>
      </Card>

      {/* Create Post */}
      {showCreate && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
          <Card className="p-4 bg-card/80 backdrop-blur-xl border-primary/20">
            <h3 className="font-bold text-sm mb-3">Create Post</h3>
            <div className="space-y-3">
              <Input placeholder="Post title *" value={newPost.title} onChange={e => setNewPost({ ...newPost, title: e.target.value })} className="text-sm" />
              <Textarea placeholder="Share your thoughts..." value={newPost.content} onChange={e => setNewPost({ ...newPost, content: e.target.value })} rows={4} className="text-sm" />
              <div className="flex flex-wrap gap-2">
                {categories.filter(c => c !== "All").map(c => (
                  <Button key={c} size="sm" variant={newPost.category === c ? "default" : "outline"} onClick={() => setNewPost({ ...newPost, category: c })} className="text-xs h-7">
                    {c}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button onClick={createPost} disabled={posting} size="sm" className="gap-1">
                  {posting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />} Post
                </Button>
                <Button onClick={() => setShowCreate(false)} size="sm" variant="outline">Cancel</Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(c => (
          <Button key={c} size="sm" variant={filter === c ? "default" : "outline"} onClick={() => setFilter(c)} className="text-xs h-7">
            {c}
          </Button>
        ))}
      </div>

      {/* Posts */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center bg-card/80 backdrop-blur-xl border-border/50">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-bold text-lg mb-2">No Posts Yet</h3>
          <p className="text-sm text-muted-foreground">Be the first to start a discussion in the DNA Community!</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-all cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm mb-0.5 line-clamp-1">{post.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{post.content}</p>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span className="font-semibold">{post.author}</span>
                      <Badge variant="outline" className="text-[9px]">{post.category}</Badge>
                      <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {timeAgo(post.created_at)}</span>
                      <span className="flex items-center gap-0.5"><Heart className="w-2.5 h-2.5" /> {post.likes}</span>
                      <span className="flex items-center gap-0.5"><MessageSquare className="w-2.5 h-2.5" /> {post.replies}</span>
                    </div>
                  </div>
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
