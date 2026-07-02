import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Plus, Send, Loader2, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export const CrystalCommunityTool = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [posting, setPosting] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });

  const fetchPosts = async () => {
    const { data } = await (supabase as any).from("crystal_community_posts").select("*").order("created_at", { ascending: false }).limit(50);
    setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const createPost = async () => {
    if (!form.title.trim() || !form.content.trim()) { toast.error("Title and content are required"); return; }
    setPosting(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error("Please sign in to post"); setPosting(false); return; }
    const { error } = await (supabase as any).from("crystal_community_posts").insert({
      user_id: session.user.id,
      title: form.title,
      content: form.content,
    });
    if (error) toast.error("Failed to create post");
    else {
      toast.success("Post created! 🔮");
      setForm({ title: "", content: "" });
      setShowForm(false);
      fetchPosts();
    }
    setPosting(false);
  };

  const likePost = async (postId: string, currentLikes: number) => {
    await (supabase as any).from("crystal_community_posts").update({ likes_count: currentLikes + 1 }).eq("id", postId);
    fetchPosts();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <>
      <FloatingHowItWorks title={"Crystal Community Tool - How it works"} steps={[{ title: 'Open', desc: 'Access the Crystal Community Tool section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Crystal Community Tool.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-card/80 backdrop-blur-xl border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
            <MessageCircle className="w-5 h-5" /> Crystal Community
          </CardTitle>
          <Button size="sm" onClick={() => setShowForm(!showForm)} className="gap-1"><Plus className="w-3.5 h-3.5" /> Post</Button>
        </div>
        <p className="text-sm text-muted-foreground">Share experiences and connect with crystal healers</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Post title..." />
            <Textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Share your crystal experience..." rows={3} />
            <Button onClick={createPost} disabled={posting} className="w-full gap-2">
              {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Publish Post
            </Button>
          </div>
        )}
        {posts.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm text-muted-foreground">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {posts.map((post: any) => (
              <div key={post.id} className="p-4 rounded-xl bg-muted/20 border border-border/30 hover:border-primary/20 transition-all">
                <h4 className="font-bold text-sm mb-1">{post.title}</h4>
                <p className="text-xs text-muted-foreground whitespace-pre-line mb-2">{post.content}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</span>
                  <button onClick={() => likePost(post.id, post.likes_count)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                    <Heart className="w-3.5 h-3.5" /> {post.likes_count}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
};
