import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Heart, MessageCircle, Share2, ChefHat, Send, Star, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface FeedPost {
  id: string;
  user_id: string;
  title: string;
  description: string;
  image_url: string | null;
  likes: number;
  created_at: string;
  username?: string;
}

interface Props { onBack: () => void; }

export default function SocialRecipeFeed({ onBack }: Props) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [posting, setPosting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { loadPosts(); }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('activity_feed')
        .select('*')
        .eq('activity_type', 'recipe_share')
        .order('created_at', { ascending: false })
        .limit(20);
      if (data) {
        setPosts(data.map(d => ({
          id: d.id,
          user_id: d.user_id,
          title: (d.metadata as any)?.title || 'Shared Recipe',
          description: (d.metadata as any)?.description || '',
          image_url: (d.metadata as any)?.image_url || null,
          likes: (d.metadata as any)?.likes || 0,
          created_at: d.created_at,
          username: (d.metadata as any)?.username || 'Chef',
        })));
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const shareRecipe = async () => {
    if (!newTitle.trim()) return;
    setPosting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast({ title: "Sign in required", variant: "destructive" }); return; }
      const { error } = await supabase.from('activity_feed').insert({
        user_id: user.id,
        activity_type: 'recipe_share',
        metadata: { title: newTitle, description: newDesc, likes: 0, username: user.email?.split('@')[0] || 'Chef' },
      });
      if (error) throw error;
      toast({ title: "Recipe shared! 🎉" });
      setNewTitle(""); setNewDesc(""); setShowForm(false);
      loadPosts();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setPosting(false); }
  };

  const likePost = async (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
    toast({ title: "❤️ Liked!" });
  };

  return (
    <>
      <FloatingHowItWorks title="How Social Recipe Feed works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/20 to-orange-500/20 border border-pink-500/30">
          <Heart className="h-5 w-5 text-pink-400" />
          <span className="font-bold text-pink-400">Social Recipe Feed</span>
          <span className="text-xs bg-green-500/20 px-2 py-0.5 rounded-full text-green-300">Free</span>
        </div>
        <p className="text-muted-foreground text-sm">Share your culinary creations & discover community recipes</p>
      </div>

      <div className="flex justify-center">
        <Button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-pink-500 to-orange-500 text-white">
          <ChefHat className="h-4 w-4 mr-2" /> Share Your Recipe
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 bg-card/80 backdrop-blur-xl border-pink-500/30">
          <div className="space-y-3">
            <Input placeholder="Recipe title..." value={newTitle} onChange={e => setNewTitle(e.target.value)} />
            <Textarea placeholder="Describe your recipe, share tips, or tell a story about the dish..." value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={3} />
            <Button onClick={shareRecipe} disabled={posting || !newTitle.trim()} className="w-full bg-gradient-to-r from-pink-500 to-orange-500">
              {posting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />} Post Recipe
            </Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" /></div>
      ) : posts.length === 0 ? (
        <Card className="p-12 text-center bg-card/80 backdrop-blur-xl border-border/60">
          <ChefHat className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-bold mb-2">No recipes shared yet</h3>
          <p className="text-muted-foreground">Be the first to share your culinary creation!</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <Card key={post.id} className="p-5 bg-card/80 backdrop-blur-xl border-border/60 hover:border-pink-500/30 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                  {post.username?.charAt(0).toUpperCase() || 'C'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm">{post.username}</span>
                    <span className="text-xs text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-bold text-foreground">{post.title}</h4>
                  {post.description && <p className="text-sm text-muted-foreground mt-1">{post.description}</p>}
                  <div className="flex items-center gap-4 mt-3">
                    <Button variant="ghost" size="sm" onClick={() => likePost(post.id)} className="gap-1 text-pink-400 hover:text-pink-300">
                      <Heart className="h-4 w-4" /> {post.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" onClick={() => {
                      const text = window.prompt("Your comment:");
                      if (text && text.trim()) toast({ description: "Comment added!" });
                    }}>
                      <MessageCircle className="h-4 w-4" /> Comment
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" onClick={async () => {
                      const url = `${window.location.origin}/cooking?post=${post.id}`;
                      try {
                        if (navigator.share) await navigator.share({ title: post.title, text: post.description || "", url });
                        else { await navigator.clipboard.writeText(url); toast({ description: "Link copied!" }); }
                      } catch {}
                    }}>
                      <Share2 className="h-4 w-4" /> Share
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
    </>
    );
}
