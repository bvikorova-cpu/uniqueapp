import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Heart, MessageCircle, Share2, Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface RecipePost {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  likes: number;
  comments: number;
  author_name: string;
  created_at: string;
  hasLiked: boolean;
}

export default function MasterChefRecipeFeed() {
  const [posts, setPosts] = useState<RecipePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("masterchef_recipe_posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (data) {
        const userIds = [...new Set(data.map((p: any) => p.user_id))] as string[];
        const { data: profiles } = await (supabase as any).from("profiles_public").select("id, full_name").in("id", userIds);
        const profileMap = new Map((profiles || []).map(p => [p.id, p.full_name || "Chef"]));

        setPosts(data.map((p: any) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          image_url: p.image_url,
          likes: p.likes_count || 0,
          comments: p.comments_count || 0,
          author_name: profileMap.get(p.user_id) || "Chef",
          created_at: p.created_at,
          hasLiked: false,
        })));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const submitPost = async () => {
    if (!newTitle.trim()) return;
    try {
      setSubmitting(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }

      await (supabase as any).from("masterchef_recipe_posts").insert({
        user_id: session.user.id,
        title: newTitle.trim(),
        description: newDesc.trim(),
      });
      setNewTitle("");
      setNewDesc("");
      setShowForm(false);
      toast({ title: "Posted!", description: "Your recipe has been shared with the community" });
      loadPosts();
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to post recipe", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate("/masterchef-subscription")}>← Back</Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-2">
              Recipe Social Feed
            </h1>
            <p className="text-muted-foreground">Share and discover amazing recipes from the community</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> Share Recipe</Button>
        </div>

        {showForm && (
          <Card className="border-primary/30">
            <CardHeader><CardTitle>Share a Recipe</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Recipe title..." value={newTitle} onChange={e => setNewTitle(e.target.value)} />
              <textarea className="w-full min-h-[100px] rounded-lg border border-input bg-background p-3 text-sm placeholder:text-muted-foreground"
                placeholder="Describe your recipe, technique, or cooking tip..." value={newDesc} onChange={e => setNewDesc(e.target.value)} />
              <div className="flex gap-2">
                <Button onClick={submitPost} disabled={submitting || !newTitle.trim()}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null} Post Recipe
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>
        ) : posts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">No recipes shared yet. Be the first!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post, i) => (
              <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-lg">{post.title}</h3>
                        <p className="text-xs text-muted-foreground">by {post.author_name} • {new Date(post.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {post.description && <p className="text-sm text-muted-foreground mb-3">{post.description}</p>}
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <button className="flex items-center gap-1 hover:text-primary transition-colors"><Heart className="h-4 w-4" /> {post.likes}</button>
                      <button className="flex items-center gap-1 hover:text-primary transition-colors"><MessageCircle className="h-4 w-4" /> {post.comments}</button>
                      <button className="flex items-center gap-1 hover:text-primary transition-colors"><Share2 className="h-4 w-4" /> Share</button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
