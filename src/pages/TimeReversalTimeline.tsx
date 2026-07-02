import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Heart, MessageCircle, Users, Sparkles, TrendingDown, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function TimeReversalTimeline() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Login Required",
          description: "Please sign in to continue",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      await loadProfile(session.user.id);
      await loadPosts();
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
        .insert({
          user_id: userId,
          current_age: 80,
          starting_age: 80,
          target_age: 20,
          aging_speed: 1.0,
        })
        .select()
        .single();

      if (!insertError) {
        setProfile(newProfile);
      }
    } else {
      setProfile(data);
    }
  };

  const loadPosts = async () => {
    const { data, error } = await supabase
      .from("time_reversal_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error) {
      setPosts(data || []);
    }
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
                onClick={() => navigate("/time-reversal-subscription")}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Upgrade Features
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
          <Button variant="outline" className="h-20 flex flex-col gap-1" onClick={() => navigate("/time-reversal-subscription")}>
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
              <Card key={post.id} className={post.is_paradox ? "border-purple-500" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{Math.floor(post.age_at_post)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">Age {Math.floor(post.age_at_post)}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(post.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    {post.is_paradox && (
                      <div className="px-3 py-1 bg-purple-500/20 text-purple-600 rounded-full text-xs font-semibold">
                        Time Paradox
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{post.content}</p>
                  {post.image_url && (
                    <img 
                      src={post.image_url} 
                      alt="Post" 
                      className="rounded-lg w-full mb-4"
                    />
                  )}
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                      <Heart className="h-4 w-4" />
                      <span className="text-sm">{post.likes_count}</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm">{post.comments_count}</span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
