import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, MessageCircle, Share, Send, Upload, Loader2, TrendingDown, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function SocialReverseFeed({ onBack }: Props) {
  const { toast } = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  useEffect(() => { loadPosts(); }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from("time_reversal_posts").select("*").order("created_at", { ascending: false }).limit(30);
      setPosts(data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handlePost = async () => {
    if (!newPost.trim()) return;
    setPosting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast({ title: "Login required", variant: "destructive" }); return; }

      let imageUrl = null;
      if (selectedImage) {
        const ext = selectedImage.name.split(".").pop();
        const path = `time-reversal/feed/${session.user.id}/${Date.now()}.${ext}`;
        await supabase.storage.from("media").upload(path, selectedImage);
        const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);
        imageUrl = publicUrl;
      }

      const { data: profile } = await supabase.from("time_reversal_profiles").select("current_age").eq("user_id", session.user.id).maybeSingle();

      await supabase.from("time_reversal_posts").insert({
        user_id: session.user.id,
        content: newPost,
        image_url: imageUrl,
        age_at_post: profile?.current_age || 80,
        post_type: "social",
        likes_count: 0,
        comments_count: 0,
      } as any);

      setNewPost("");
      setSelectedImage(null);
      toast({ title: "Posted! 🔄", description: "Your reverse journey update is live." });
      loadPosts();
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to post", variant: "destructive" });
    } finally { setPosting(false); }
  };

  const handleLike = async (postId: string, currentLikes: number) => {
    await supabase.from("time_reversal_posts").update({ likes_count: currentLikes + 1 }).eq("id", postId);
    loadPosts();
  };

  return (
    <>
      <FloatingHowItWorks
        title='Social Reverse Feed'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Social Reverse Feed panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Social Reverse Feed</h2>
          <p className="text-sm text-muted-foreground">Share your daily 'younger self' updates</p>
        </div>
      </div>

      {/* Create Post */}
      <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-background">
        <CardContent className="pt-6 space-y-4">
          <Textarea value={newPost} onChange={(e) => setNewPost(e.target.value)} placeholder="Share your reverse aging journey today..." className="min-h-[80px] resize-none" />
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <input type="file" accept="image/*" onChange={(e) => setSelectedImage(e.target.files?.[0] || null)} className="hidden" id="feed-image" />
              <Button variant="ghost" size="sm" onClick={() => document.getElementById("feed-image")?.click()}>
                <Image className="h-4 w-4 mr-1" /> {selectedImage ? "Photo Added ✓" : "Add Photo"}
              </Button>
            </div>
            <Button onClick={handlePost} disabled={posting || !newPost.trim()} size="sm" className="bg-gradient-to-r from-purple-600 to-violet-600">
              {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4 mr-1" /> Post</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feed */}
      {loading ? (
        <div className="py-12 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-400" /></div>
      ) : posts.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No posts yet. Be the first to share!</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className={`${post.is_paradox ? "border-purple-500/50" : "border-border/40"} hover:border-purple-500/30 transition-all`}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-10 w-10 border-2 border-purple-500/30">
                    <AvatarFallback className="text-xs font-bold bg-purple-500/20">{Math.floor(post.age_at_post)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">Age {Math.floor(post.age_at_post)}</span>
                      {post.is_paradox && <Badge className="text-[10px] bg-purple-500/20 text-purple-400 border-purple-500/30">Paradox</Badge>}
                      <TrendingDown className="h-3 w-3 text-purple-400" />
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <p className="text-sm mb-3">{post.content}</p>
                {post.image_url && <img src={post.image_url} alt="Post" className="rounded-xl w-full mb-3 max-h-80 object-cover" />}
                <div className="flex items-center gap-4 text-muted-foreground">
                  <button onClick={() => handleLike(post.id, post.likes_count || 0)} className="flex items-center gap-1 hover:text-red-400 transition-colors text-sm">
                    <Heart className="h-4 w-4" /> {post.likes_count || 0}
                  </button>
                  <button className="flex items-center gap-1 hover:text-blue-400 transition-colors text-sm">
                    <MessageCircle className="h-4 w-4" /> {post.comments_count || 0}
                  </button>
                  <button className="flex items-center gap-1 hover:text-purple-400 transition-colors text-sm">
                    <Share className="h-4 w-4" /> Share
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
    </>
  );
}
