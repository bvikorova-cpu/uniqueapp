import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, Loader2, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function SocialReverseFeed({ onBack }: Props) {
  const { toast } = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  useEffect(() => { loadPosts(); }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("time_reversal_posts")
        .select("*")
        .like("image_url", "%/time-reversal/collage/%")
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;

      const rows = data || [];
      const userIds = [...new Set(rows.map((p: any) => p.user_id).filter(Boolean))];

      let authors: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
      if (userIds.length) {
        const { data: profs } = await supabase
          .from("public_profiles")
          .select("id, full_name, avatar_url")
          .in("id", userIds);
        (profs || []).forEach((p: any) => {
          authors[p.id] = { full_name: p.full_name, avatar_url: p.avatar_url };
        });
      }

      setPosts(rows.map((p: any) => ({ ...p, author: authors[p.user_id] })));

      const { data: { session } } = await supabase.auth.getSession();
      if (session && rows.length) {
        const { data: likes } = await supabase
          .from("time_reversal_likes")
          .select("post_id")
          .eq("user_id", session.user.id)
          .in("post_id", rows.map((p: any) => p.id));
        setLikedIds(new Set((likes || []).map((l: any) => l.post_id)));
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Could not load the feed", variant: "destructive" });
    }
    finally { setLoading(false); }
  };

  const handleLike = async (postId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast({ title: "Login required", variant: "destructive" }); return; }

    const { data, error } = await supabase.rpc("toggle_time_reversal_like" as any, { _post_id: postId });
    if (error) { toast({ title: "Error", description: "Could not update the like", variant: "destructive" }); return; }

    const res = data as any;
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (res?.liked) next.add(postId); else next.delete(postId);
      return next;
    });
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, likes_count: res?.likes_count ?? p.likes_count } : p)));
  };

  return (
    <>
      <FloatingHowItWorks
        title='Social Reverse Feed'
        steps={[
          { title: 'Create a collage', desc: 'Generate a complete age progression in Time-Lapse Creator.' },
          { title: 'Automatic publishing', desc: 'The finished collage appears here automatically.' },
          { title: 'Browse journeys', desc: 'View age-progression collages created by the community.' },
          { title: 'Like a collage', desc: 'Tap the heart once to like or unlike a journey.' }
        ]}
      />
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Social Reverse Feed</h2>
          <p className="text-sm text-muted-foreground">Community Time-Lapse collages — like your favourites</p>
        </div>
      </div>

      {/* Feed */}
      {loading ? (
        <div className="py-12 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-400" /></div>
      ) : posts.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No collages yet. Create one in Time-Lapse Creator.</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className={`${post.is_paradox ? "border-purple-500/50" : "border-border/40"} hover:border-purple-500/30 transition-all`}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-10 w-10 border-2 border-purple-500/30">
                    {post.author?.avatar_url && <AvatarImage src={post.author.avatar_url} alt={post.author?.full_name || "User"} />}
                    <AvatarFallback className="text-xs font-bold bg-purple-500/20">
                      {(post.author?.full_name?.[0] || "U").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm truncate">{post.author?.full_name || "Time Traveler"}</span>
                      <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-400">Age {Math.floor(post.age_at_post)}</Badge>
                      {post.is_paradox && <Badge className="text-[10px] bg-purple-500/20 text-purple-400 border-purple-500/30">Paradox</Badge>}
                      <TrendingDown className="h-3 w-3 text-purple-400" />
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <p className="text-sm mb-3">{post.content}</p>
                {post.image_url && <img src={post.image_url} alt="Post" loading="lazy" className="rounded-xl w-full mb-3 max-h-80 object-cover" />}
                <div className="flex items-center gap-4 text-muted-foreground">
                  <button onClick={() => handleLike(post.id)} className={`flex items-center gap-1 transition-colors text-sm ${likedIds.has(post.id) ? "text-red-500" : "hover:text-red-400"}`}>
                    <Heart className={`h-4 w-4 ${likedIds.has(post.id) ? "fill-current" : ""}`} /> {post.likes_count || 0}
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
