import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Users, MessageCircle, Send, Loader2, ThumbsUp, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Post {
  id: string;
  prompt: string;
  generated_text: string | null;
  created_at: string;
  metadata: any;
}

export const PhobiaCommunity = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");

  const CATEGORIES = ["general", "success_story", "question", "tip", "support"];

  useEffect(() => { loadPosts(); }, []);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_generated_content")
        .select("id, prompt, generated_text, created_at, metadata")
        .eq("content_type", "social_post")
        .like("title", "phobia_community_%")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      setPosts(data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const createPost = async () => {
    if (!title.trim() || !content.trim()) { toast.error("Title and content are required"); return; }
    setPosting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in"); return; }
      const { error } = await supabase.from("ai_generated_content").insert({
        user_id: session.user.id,
        content_type: "social_post" as any,
        title: `phobia_community_${Date.now()}`,
        prompt: title,
        generated_text: content,
        metadata: { category, type: "phobia_community", likes: 0 },
        status: "completed" as any,
      });
      if (error) throw error;
      toast.success("Post shared with the community!");
      setTitle(""); setContent(""); setShowForm(false);
      loadPosts();
    } catch (e: any) { toast.error("Failed to post"); console.error(e); }
    finally { setPosting(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Phobia Community - How it works"} steps={[{ title: 'Open', desc: 'Access the Phobia Community section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Phobia Community.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-4">
      <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-cyan-400" />
            <h3 className="font-bold">Fear Support Community</h3>
          </div>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-1" /> New Post
          </Button>
        </div>
      </Card>

      {showForm && (
        <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50 space-y-3">
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Post title..." className="bg-muted/10 border-border/50" />
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`text-[11px] px-3 py-1 rounded-full border transition-colors ${category === c ? "bg-cyan-500/20 border-cyan-500/30 text-cyan-400" : "border-border/50 text-muted-foreground"}`}>
                {c.replace("_", " ")}
              </button>
            ))}
          </div>
          <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Share your experience, ask a question, or offer support..." rows={3} className="bg-muted/10 border-border/50" />
          <Button onClick={createPost} disabled={posting} className="w-full">
            {posting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            {posting ? "Posting..." : "Share"}
          </Button>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-cyan-400" /></div>
      ) : posts.length === 0 ? (
        <Card className="p-8 text-center bg-card/80 border-border/50">
          <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No community posts yet. Be the first to share!</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map(post => {
            const meta = post.metadata as any;
            return (
              <Card key={post.id} className="p-4 bg-card/80 backdrop-blur-xl border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-[10px] capitalize">{meta?.category || "general"}</Badge>
                  <span className="text-[10px] text-muted-foreground ml-auto">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </span>
                </div>
                <h4 className="font-bold text-sm mb-1">{post.prompt}</h4>
                <p className="text-xs text-muted-foreground line-clamp-3">{post.generated_text}</p>
                <div className="flex items-center gap-3 mt-3">
                  <button className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-cyan-400 transition-colors">
                    <ThumbsUp className="h-3 w-3" /> {meta?.likes || 0}
                  </button>
                  <button className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-cyan-400 transition-colors">
                    <MessageCircle className="h-3 w-3" /> Reply
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
    </>
  );
};
