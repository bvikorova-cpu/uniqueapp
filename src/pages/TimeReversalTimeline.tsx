import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Clock, Heart, MessageCircle, Users, Sparkles, TrendingDown, Calendar, Maximize2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function TimeReversalTimeline() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [author, setAuthor] = useState<{ full_name: string | null; avatar_url: string | null } | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [likingIds, setLikingIds] = useState<Set<string>>(new Set());
  const [expandedPost, setExpandedPost] = useState<any | null>(null);

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast({
          title: "Login Required",
          description: "Please sign in to continue",
          variant: "destructive" });
        navigate("/auth");
        return;
      }

       await Promise.all([loadProfile(session.user.id), loadAuthor(session.user.id), loadPosts(session.user.id)]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("time_reversal_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.error("Error loading profile:", error);
      return;
    }

    if (!data) {
      // Create default profile
      const { data: newProfile, error: insertError } = await supabase
        .from("time_reversal_profiles")
        .insert({ user_id: userId,
          current_age: 80,
          starting_age: 80,
          target_age: 20,
          aging_speed: 1.0 })
        .select()
        .single();

      if (!insertError) {
        setProfile(newProfile);
      }
    } else {
      setProfile(data);
    }
  };

  const loadAuthor = async (userId: string) => {
    const { data, error } = await supabase.rpc("get_profiles_basic" as any, { _ids: [userId] });
    if (error) {
      console.error("Error loading timeline author:", error);
      return;
    }
    const row = ((data as any[]) || [])[0];
    if (row) setAuthor({ full_name: row.full_name || row.username, avatar_url: row.avatar_url });
  };

  const loadPosts = async (userId: string) => {
    const { data, error } = await supabase
      .from("time_reversal_posts")
      .select("*")
      .eq("user_id", userId)
      .like("image_url", "%/time-reversal/collage/%")
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error) {
      const rows = data || [];
      setPosts(rows);
      if (rows.length) {
        const { data: likes } = await supabase
          .from("time_reversal_likes")
          .select("post_id")
          .eq("user_id", userId)
          .in("post_id", rows.map((post: any) => post.id));
        setLikedIds(new Set((likes || []).map((like: any) => like.post_id)));
      }
    }
  };

  const handleLike = async (postId: string) => {
    if (likingIds.has(postId)) return;
    setLikingIds((prev) => new Set(prev).add(postId));
    const { data, error } = await supabase.rpc("toggle_time_reversal_like" as any, { _post_id: postId });
    setLikingIds((prev) => {
      const next = new Set(prev);
      next.delete(postId);
      return next;
    });
    if (error) {
      toast({ title: "Error", description: error.message || "Could not update the like", variant: "destructive" });
      return;
    }
    const result = data as any;
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (result?.liked) next.add(postId); else next.delete(postId);
      return next;
    });
    setPosts((prev) => prev.map((post) => post.id === postId ? { ...post, likes_count: result?.likes_count ?? post.likes_count } : post));
  };

  const calculateDaysToYoung = () => {
    if (!profile) return 0;
    const ageToTravel = profile.current_age - profile.target_age;
    return Math.ceil(ageToTravel / profile.aging_speed);
  };

  if (loading) {
    return (
      
    <>
      <FloatingHowItWorks title="Time Reversal Timeline" steps={[{ title: "Scroll history", desc: "Chronological view of all rewinds." }, { title: "Compare versions", desc: "Original vs alternate side-by-side." }, { title: "Bookmark moments", desc: "Save pivotal branches." }, { title: "Continue exploring", desc: "Rewind further from any point." }]} />
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your timeline...</p>
        </div>
      </div>
    </>
  );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-purple-500/5 to-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8 border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-blue-500/10">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-purple-500">
                  <AvatarImage src={profile?.profile_image_url} />
                  <AvatarFallback className="text-4xl">
                    {profile?.current_age ? Math.floor(profile.current_age) : 80}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                  Age {profile?.current_age ? Math.floor(profile.current_age) : 80}
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-black mb-2">Your Reverse Life</h1>
                <p className="text-muted-foreground mb-4">{profile?.bio || "Living life backwards..."}</p>
                
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{profile?.follower_count || 0}</div>
                    <div className="text-xs text-muted-foreground">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{calculateDaysToYoung()}</div>
                    <div className="text-xs text-muted-foreground">Days to Age {profile?.target_age || 20}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{profile?.aging_speed || 1}x</div>
                    <div className="text-xs text-muted-foreground">Aging Speed</div>
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                onClick={() => navigate("/time-reversal/dashboard")}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Time Powers (credits)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Button variant="outline" className="h-20 flex flex-col gap-1" onClick={() => navigate("/time-reversal/create-post")}>
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm">Create Post</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-1" onClick={() => navigate("/time-reversal/dashboard")}>
            <TrendingDown className="h-5 w-5" />
            <span className="text-sm">Age Progress</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-1" onClick={() => navigate("/discover-creators")}>
            <Users className="h-5 w-5" />
            <span className="text-sm">Followers</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-1" onClick={() => {
            document.querySelector('[data-timeline-feed]')?.scrollIntoView({ behavior: 'smooth' });
          }}>
            <Calendar className="h-5 w-5" />
            <span className="text-sm">Timeline</span>
          </Button>
        </div>

        {/* Timeline Feed */}
        <div className="space-y-6" data-timeline-feed>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="h-6 w-6 text-purple-600" />
            Your Reverse Timeline
          </h2>

          {posts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No posts yet. Start your reverse journey!</p>
                <Button onClick={() => navigate("/time-reversal/create-post")}>
                  Create Your First Post
                </Button>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      {author?.avatar_url && <AvatarImage src={author.avatar_url} alt={author.full_name || "Unique user"} />}
                      <AvatarFallback>{(author?.full_name?.[0] || "U").toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{author?.full_name || "Unique user"}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {post.image_url && (
                    <button
                      type="button"
                      onClick={() => setExpandedPost(post)}
                      className="group relative mb-4 block w-full overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      aria-label="Enlarge collage"
                    >
                      <img src={post.image_url} alt={`${author?.full_name || "Unique user"}'s age progression collage`} className="max-h-[32rem] w-full object-contain transition-transform duration-200 group-hover:scale-[1.01]" />
                      <span className="absolute bottom-2 right-2 grid h-9 w-9 place-items-center rounded-lg bg-background/90 text-foreground shadow-sm" aria-hidden="true">
                        <Maximize2 className="h-4 w-4" />
                      </span>
                    </button>
                  )}
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={likingIds.has(post.id)}
                      onClick={() => handleLike(post.id)}
                      aria-label={likedIds.has(post.id) ? "Unlike collage" : "Like collage"}
                      className={`px-2 ${likedIds.has(post.id) ? "text-destructive" : "hover:text-destructive"}`}
                    >
                      <Heart className="h-4 w-4" />
                      <span className="text-sm">{post.likes_count}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
      <Dialog open={Boolean(expandedPost)} onOpenChange={(open) => { if (!open) setExpandedPost(null); }}>
        <DialogContent className="h-[92dvh] w-[96vw] max-w-6xl border-0 bg-background/95 p-2 sm:p-4">
          <DialogTitle className="sr-only">Age progression collage</DialogTitle>
          <DialogDescription className="sr-only">Enlarged collage by {author?.full_name || "Unique user"}</DialogDescription>
          {expandedPost?.image_url && <img src={expandedPost.image_url} alt={`${author?.full_name || "Unique user"}'s enlarged age progression collage`} className="h-full w-full object-contain" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
