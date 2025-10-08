import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Crown, Users, Heart, Eye, TrendingUp, Camera, Plus, CheckCircle, Star, Upload, ExternalLink } from "lucide-react";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface InfluencerProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio: string | null;
  profile_photo_url: string | null;
  cover_photo_url: string | null;
  category: string;
  social_links: any;
  followers_count: number;
  total_likes: number;
  total_views: number;
  is_verified: boolean;
  created_at: string;
}

interface InfluencerPost {
  id: string;
  influencer_id: string;
  title: string | null;
  content: string | null;
  media_url: string | null;
  media_type: string | null;
  likes_count: number;
  views_count: number;
  created_at: string;
}

const CATEGORIES = [
  "Fashion & Beauty",
  "Gaming",
  "Fitness & Health",
  "Travel",
  "Food & Cooking",
  "Technology",
  "Music",
  "Comedy",
  "Education",
  "Lifestyle",
  "Business",
  "Art & Design",
];

const InfluKing = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [selectedInfluencer, setSelectedInfluencer] = useState<InfluencerProfile | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPostDialog, setShowPostDialog] = useState(false);

  const [newProfile, setNewProfile] = useState({
    display_name: "",
    bio: "",
    category: CATEGORIES[0],
    profile_photo_url: "",
    cover_photo_url: "",
    instagram: "",
    tiktok: "",
    youtube: "",
    twitter: "",
  });

  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    media_url: "",
    media_type: "image",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user's influencer profile
  const { data: myProfile } = useQuery({
    queryKey: ["myInfluencerProfile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("influencer_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      return data as InfluencerProfile | null;
    },
    enabled: !!user,
  });

  // Fetch top influencers
  const { data: topInfluencers = [], isLoading } = useQuery({
    queryKey: ["topInfluencers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("influencer_profiles")
        .select("*")
        .eq("is_active", true)
        .order("followers_count", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as InfluencerProfile[];
    },
  });

  // Fetch influencer posts
  const { data: influencerPosts = [] } = useQuery({
    queryKey: ["influencerPosts", selectedInfluencer?.id],
    queryFn: async () => {
      if (!selectedInfluencer) return [];
      const { data, error } = await supabase
        .from("influencer_posts")
        .select("*")
        .eq("influencer_id", selectedInfluencer.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as InfluencerPost[];
    },
    enabled: !!selectedInfluencer,
  });

  // Check if following
  const { data: isFollowing } = useQuery({
    queryKey: ["isFollowing", selectedInfluencer?.id, user?.id],
    queryFn: async () => {
      if (!user || !selectedInfluencer) return false;
      const { data } = await supabase
        .from("influencer_followers")
        .select("id")
        .eq("influencer_id", selectedInfluencer.id)
        .eq("follower_id", user.id)
        .maybeSingle();
      
      return !!data;
    },
    enabled: !!user && !!selectedInfluencer,
  });

  // Create profile mutation
  const createProfileMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase.from("influencer_profiles").insert([{
        user_id: user.id,
        display_name: newProfile.display_name,
        bio: newProfile.bio,
        category: newProfile.category,
        profile_photo_url: newProfile.profile_photo_url || null,
        cover_photo_url: newProfile.cover_photo_url || null,
        social_links: {
          instagram: newProfile.instagram || null,
          tiktok: newProfile.tiktok || null,
          youtube: newProfile.youtube || null,
          twitter: newProfile.twitter || null,
        },
      }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myInfluencerProfile"] });
      queryClient.invalidateQueries({ queryKey: ["topInfluencers"] });
      setShowCreateDialog(false);
      toast({
        title: "✅ Profil vytvorený",
        description: "Tvoj influencer profil bol úspešne vytvorený!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Chyba",
        description: error.message || "Nepodarilo sa vytvoriť profil",
        variant: "destructive",
      });
    },
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async () => {
      if (!myProfile) throw new Error("Need influencer profile");

      const { error } = await supabase.from("influencer_posts").insert([{
        influencer_id: myProfile.id,
        title: newPost.title || null,
        content: newPost.content || null,
        media_url: newPost.media_url || null,
        media_type: newPost.media_type,
      }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["influencerPosts"] });
      setShowPostDialog(false);
      setNewPost({ title: "", content: "", media_url: "", media_type: "image" });
      toast({
        title: "✅ Príspevok pridaný",
        description: "Tvoj príspevok bol úspešne zverejnený!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Chyba",
        description: error.message || "Nepodarilo sa pridať príspevok",
        variant: "destructive",
      });
    },
  });

  // Follow/unfollow mutation
  const followMutation = useMutation({
    mutationFn: async (follow: boolean) => {
      if (!user || !selectedInfluencer) throw new Error("Must be logged in");

      if (follow) {
        const { error } = await supabase.from("influencer_followers").insert([{
          influencer_id: selectedInfluencer.id,
          follower_id: user.id,
        }]);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("influencer_followers")
          .delete()
          .eq("influencer_id", selectedInfluencer.id)
          .eq("follower_id", user.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isFollowing"] });
      queryClient.invalidateQueries({ queryKey: ["topInfluencers"] });
      toast({
        title: isFollowing ? "❌ Už nesleduješ" : "✅ Sledovanie",
        description: isFollowing ? "Prestali ste sledovať influencera" : "Teraz sledujete tohto influencera",
      });
    },
  });

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error("Must be logged in");

      // Check if already liked
      const { data: existing } = await supabase
        .from("influencer_post_likes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        // Unlike
        const { error } = await supabase
          .from("influencer_post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase.from("influencer_post_likes").insert([{
          post_id: postId,
          user_id: user.id,
        }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["influencerPosts"] });
      queryClient.invalidateQueries({ queryKey: ["topInfluencers"] });
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Prihlásenie potrebné</CardTitle>
            <CardDescription>
              Pre prístup k Influ-King sa musíte prihlásiť
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => window.location.href = "/auth"}>
              Prihlásiť sa
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="h-12 w-12 text-yellow-500" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Influ-King
            </h1>
            <Crown className="h-12 w-12 text-yellow-500" />
          </div>
          <p className="text-muted-foreground text-lg mb-6">
            Staň sa TOP influencerom vo svete!
          </p>

          {myProfile ? (
            <div className="flex items-center justify-center gap-4">
              <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
                <DialogTrigger asChild>
                  <Button size="lg">
                    <Plus className="h-5 w-5 mr-2" />
                    Pridať príspevok
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Nový príspevok</DialogTitle>
                    <DialogDescription>
                      Zverejni nový obsah pre svojich followerov
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="post-title">Nadpis</Label>
                      <Input
                        id="post-title"
                        value={newPost.title}
                        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                        placeholder="Zadaj nadpis..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="post-content">Obsah</Label>
                      <Textarea
                        id="post-content"
                        value={newPost.content}
                        onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                        placeholder="Napíš niečo zaujímavé..."
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label htmlFor="post-media">URL média (foto/video)</Label>
                      <Input
                        id="post-media"
                        value={newPost.media_url}
                        onChange={(e) => setNewPost({ ...newPost, media_url: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => createPostMutation.mutate()}
                      disabled={createPostMutation.isPending}
                    >
                      {createPostMutation.isPending ? "Pridávam..." : "Zverejniť"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" onClick={() => setSelectedInfluencer(myProfile)}>
                Môj profil
              </Button>
            </div>
          ) : (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="lg">
                  <Star className="h-5 w-5 mr-2" />
                  Staň sa influencerom
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Vytvor si influencer profil</DialogTitle>
                  <DialogDescription>
                    Začni svoju cestu k sláve!
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Meno / Nick *</Label>
                    <Input
                      id="name"
                      value={newProfile.display_name}
                      onChange={(e) => setNewProfile({ ...newProfile, display_name: e.target.value })}
                      placeholder="napr. @influencer_king"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio">O mne</Label>
                    <Textarea
                      id="bio"
                      value={newProfile.bio}
                      onChange={(e) => setNewProfile({ ...newProfile, bio: e.target.value })}
                      placeholder="Napíš niečo o sebe..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Kategória *</Label>
                    <select
                      id="category"
                      value={newProfile.category}
                      onChange={(e) => setNewProfile({ ...newProfile, category: e.target.value })}
                      className="w-full p-2 border rounded-md"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="profile-photo">URL profilovej fotky</Label>
                    <Input
                      id="profile-photo"
                      value={newProfile.profile_photo_url}
                      onChange={(e) => setNewProfile({ ...newProfile, profile_photo_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="cover-photo">URL cover fotky</Label>
                    <Input
                      id="cover-photo"
                      value={newProfile.cover_photo_url}
                      onChange={(e) => setNewProfile({ ...newProfile, cover_photo_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        value={newProfile.instagram}
                        onChange={(e) => setNewProfile({ ...newProfile, instagram: e.target.value })}
                        placeholder="@username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tiktok">TikTok</Label>
                      <Input
                        id="tiktok"
                        value={newProfile.tiktok}
                        onChange={(e) => setNewProfile({ ...newProfile, tiktok: e.target.value })}
                        placeholder="@username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="youtube">YouTube</Label>
                      <Input
                        id="youtube"
                        value={newProfile.youtube}
                        onChange={(e) => setNewProfile({ ...newProfile, youtube: e.target.value })}
                        placeholder="@channel"
                      />
                    </div>
                    <div>
                      <Label htmlFor="twitter">Twitter/X</Label>
                      <Input
                        id="twitter"
                        value={newProfile.twitter}
                        onChange={(e) => setNewProfile({ ...newProfile, twitter: e.target.value })}
                        placeholder="@username"
                      />
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => createProfileMutation.mutate()}
                    disabled={createProfileMutation.isPending}
                  >
                    {createProfileMutation.isPending ? "Vytváram..." : "Vytvoriť profil"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Influencer Detail Dialog */}
        <Dialog open={!!selectedInfluencer} onOpenChange={() => setSelectedInfluencer(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedInfluencer && (
              <>
                {/* Cover Photo */}
                {selectedInfluencer.cover_photo_url && (
                  <div className="h-48 -mt-6 -mx-6 mb-4 rounded-t-lg overflow-hidden">
                    <img
                      src={selectedInfluencer.cover_photo_url}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex items-start gap-6">
                  <Avatar className="h-24 w-24 border-4 border-background">
                    <AvatarImage src={selectedInfluencer.profile_photo_url || undefined} />
                    <AvatarFallback>{selectedInfluencer.display_name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-2xl font-bold">{selectedInfluencer.display_name}</h2>
                      {selectedInfluencer.is_verified && (
                        <CheckCircle className="h-6 w-6 text-blue-500 fill-blue-500" />
                      )}
                    </div>
                    <Badge className="mb-3 bg-black text-white hover:bg-black/90">{selectedInfluencer.category}</Badge>
                    <p className="text-muted-foreground mb-4">{selectedInfluencer.bio}</p>
                    
                    <div className="flex items-center gap-6 mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <span className="font-bold">{selectedInfluencer.followers_count.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground">followers</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-muted-foreground" />
                        <span className="font-bold">{selectedInfluencer.total_likes.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground">likes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-muted-foreground" />
                        <span className="font-bold">{selectedInfluencer.total_views.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground">views</span>
                      </div>
                    </div>

                    {selectedInfluencer.user_id !== user?.id && (
                      <Button
                        onClick={() => followMutation.mutate(!isFollowing)}
                        disabled={followMutation.isPending}
                        variant={isFollowing ? "outline" : "default"}
                      >
                        {isFollowing ? "Už sledujem" : "Sledovať"}
                      </Button>
                    )}

                    {/* Social Links */}
                    {selectedInfluencer.social_links && (
                      <div className="flex items-center gap-3 mt-4">
                        {selectedInfluencer.social_links.instagram && (
                          <a
                            href={`https://instagram.com/${selectedInfluencer.social_links.instagram}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary"
                          >
                            <ExternalLink className="h-5 w-5" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Posts */}
                <div className="mt-6">
                  <h3 className="text-xl font-bold mb-4">Príspevky</h3>
                  {influencerPosts.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Zatiaľ žiadne príspevky</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {influencerPosts.map((post) => (
                        <Card key={post.id}>
                          {post.media_url && (
                            <div className="aspect-video overflow-hidden rounded-t-lg">
                              {post.media_type === "video" ? (
                                <video src={post.media_url} controls className="w-full h-full object-cover" />
                              ) : (
                                <img src={post.media_url} alt={post.title || ""} className="w-full h-full object-cover" />
                              )}
                            </div>
                          )}
                          <CardContent className="pt-4">
                            {post.title && <h4 className="font-bold mb-2">{post.title}</h4>}
                            {post.content && <p className="text-sm text-muted-foreground mb-3">{post.content}</p>}
                            <div className="flex items-center justify-between">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => likePostMutation.mutate(post.id)}
                                disabled={likePostMutation.isPending}
                              >
                                <Heart className="h-4 w-4 mr-1" />
                                {post.likes_count}
                              </Button>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Eye className="h-4 w-4" />
                                {post.views_count}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Top Influencers Leaderboard */}
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-yellow-500" />
                TOP Influenceri
              </CardTitle>
              <CardDescription>
                Rebríček najlepších influencerov podľa počtu followerov
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Načítavam...</p>
                </div>
              ) : topInfluencers.length === 0 ? (
                <div className="text-center py-12">
                  <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Zatiaľ tu nie sú žiadni influenceri</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topInfluencers.map((influencer, index) => (
                    <div
                      key={influencer.id}
                      onClick={() => setSelectedInfluencer(influencer)}
                      className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all hover:bg-accent ${
                        index < 3 ? "bg-gradient-to-r from-yellow-500/10 to-transparent" : ""
                      }`}
                    >
                      <div className="flex items-center justify-center w-12 h-12">
                        {index === 0 && <Crown className="h-8 w-8 text-yellow-500" />}
                        {index === 1 && <Crown className="h-7 w-7 text-gray-400" />}
                        {index === 2 && <Crown className="h-6 w-6 text-orange-600" />}
                        {index > 2 && (
                          <span className="text-2xl font-bold text-muted-foreground">#{index + 1}</span>
                        )}
                      </div>
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={influencer.profile_photo_url || undefined} />
                        <AvatarFallback>{influencer.display_name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold">{influencer.display_name}</h3>
                          {influencer.is_verified && (
                            <CheckCircle className="h-5 w-5 text-blue-500 fill-blue-500" />
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {influencer.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-bold">{influencer.followers_count.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4 text-muted-foreground" />
                          <span className="font-bold">{influencer.total_likes.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <span className="font-bold">{influencer.total_views.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InfluKing;
