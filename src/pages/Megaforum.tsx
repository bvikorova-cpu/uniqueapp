import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, ThumbsUp, Reply, Send, TrendingUp, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface ForumPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  likes_count: number;
  replies_count: number;
  created_at: string;
}

const Megaforum = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Všeobecné");
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");

  const categories = [
    "Všeobecné",
    "Technológie",
    "Šport",
    "Kultúra",
    "Hudba",
    "Film & TV",
    "Hry",
    "Iné"
  ];

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

  // Fetch forum posts
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["forumPosts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_posts")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false});

      if (error) throw error;
      return data as ForumPost[];
    },
  });

  // Fetch profiles for posts
  const { data: profiles = {} } = useQuery({
    queryKey: ["forumProfiles", posts.map(p => p.user_id)],
    queryFn: async () => {
      const userIds = [...new Set(posts.map(p => p.user_id))];
      if (userIds.length === 0) return {};
      
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      if (error) throw error;
      
      const profileMap: Record<string, Profile> = {};
      data?.forEach(profile => {
        profileMap[profile.id] = profile;
      });
      return profileMap;
    },
    enabled: posts.length > 0,
  });

  // Fetch comments for selected post
  const { data: comments = [] } = useQuery({
    queryKey: ["forumComments", selectedPost],
    queryFn: async () => {
      if (!selectedPost) return [];
      
      const { data, error } = await supabase
        .from("forum_comments")
        .select("*")
        .eq("post_id", selectedPost)
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!selectedPost,
  });

  // Fetch comment profiles
  const { data: commentProfiles = {} } = useQuery({
    queryKey: ["commentProfiles", comments.map(c => c.user_id)],
    queryFn: async () => {
      const userIds = [...new Set(comments.map(c => c.user_id))];
      if (userIds.length === 0) return {};
      
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      if (error) throw error;
      const profileMap: Record<string, Profile> = {};
      data?.forEach(profile => {
        profileMap[profile.id] = profile;
      });
      return profileMap;
    },
    enabled: comments.length > 0,
  });

  // Fetch liked posts
  const { data: likedPosts = [] } = useQuery({
    queryKey: ["forumLikedPosts", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("forum_post_likes")
        .select("post_id")
        .eq("user_id", user.id);

      if (error) throw error;
      return data.map(like => like.post_id);
    },
    enabled: !!user,
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase.from("forum_posts").insert([{
        user_id: user.id,
        title: newPostTitle,
        content: newPostContent,
        category: selectedCategory,
      }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forumPosts"] });
      setNewPostTitle("");
      setNewPostContent("");
      toast({
        title: "Príspevok vytvorený!",
        description: "Váš príspevok bol úspešne pridaný do fóra.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Chyba",
        description: error.message || "Nepodarilo sa vytvoriť príspevok",
        variant: "destructive",
      });
    },
  });

  // Like/unlike mutation
  const likeMutation = useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error("Must be logged in");

      const isLiked = likedPosts.includes(postId);

      if (isLiked) {
        const { error } = await supabase
          .from("forum_post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("forum_post_likes")
          .insert([{ post_id: postId, user_id: user.id }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forumLikedPosts"] });
      queryClient.invalidateQueries({ queryKey: ["forumPosts"] });
    },
  });

  const handleCreatePost = () => {
    if (!user) {
      toast({
        title: "Prihlásenie potrebné",
        description: "Pre pridávanie príspevkov sa musíte prihlásiť.",
        variant: "destructive"
      });
      return;
    }

    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast({
        title: "Chyba",
        description: "Vyplňte prosím názov aj obsah príspevku.",
        variant: "destructive"
      });
      return;
    }

    createPostMutation.mutate();
  };

  const handleLike = (postId: string) => {
    if (!user) {
      toast({
        title: "Prihlásenie potrebné",
        description: "Pre označenie príspevku sa musíte prihlásiť.",
        variant: "destructive"
      });
      return;
    }

    likeMutation.mutate(postId);
  };

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase.from("forum_comments").insert([{
        post_id: postId,
        user_id: user.id,
        content: newComment,
      }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forumComments"] });
      queryClient.invalidateQueries({ queryKey: ["forumPosts"] });
      setNewComment("");
      toast({
        title: "Komentár pridaný",
        description: "Váš komentár bol úspešne pridaný",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Chyba",
        description: error.message || "Nepodarilo sa pridať komentár",
        variant: "destructive",
      });
    },
  });

  const handleAddComment = (postId: string) => {
    if (!user) {
      toast({
        title: "Prihlásenie potrebné",
        description: "Pre komentovanie sa musíte prihlásiť",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: "Chyba",
        description: "Komentár nemôže byť prázdny",
        variant: "destructive",
      });
      return;
    }

    addCommentMutation.mutate(postId);
  };


  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInMs = now.getTime() - postTime.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    
    if (diffInMins < 60) return `pred ${diffInMins} minútami`;
    const diffInHours = Math.floor(diffInMins / 60);
    if (diffInHours < 24) return `pred ${diffInHours} hodinami`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `pred ${diffInDays} dňami`;
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <Badge className="bg-gradient-primary text-white">
            <Users className="h-4 w-4 mr-1" />
            Otvorené pre všetkých
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Megafórum
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Komunita kde sa môže zapojiť každý. Diskutujte, zdieľajte a inšpirujte sa navzájom.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Categories & Stats */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Kategórie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Štatistiky
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Príspevky:</span>
                    <span className="font-semibold">{posts.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`font-semibold ${user ? 'text-green-500' : 'text-muted-foreground'}`}>
                      {user ? "Prihlásený" : "Neprihlásený"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Create New Post */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Vytvoriť nový príspevok
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!user && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-sm">
                    Pre pridávanie príspevkov sa musíte <a href="/auth" className="font-semibold underline">prihlásiť</a>.
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Kategória</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <Badge
                        key={cat}
                        variant={selectedCategory === cat ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setSelectedCategory(cat)}
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Input
                  placeholder="Názov príspevku..."
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  disabled={!user || createPostMutation.isPending}
                />
                <Textarea
                  placeholder="Čo chcete zdieľať s komunitou?"
                  className="min-h-32"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  disabled={!user || createPostMutation.isPending}
                />
                <Button 
                  variant="hero" 
                  className="w-full"
                  onClick={handleCreatePost}
                  disabled={!user || createPostMutation.isPending}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {createPostMutation.isPending ? "Zverejňujem..." : "Zverejniť príspevok"}
                </Button>
              </CardContent>
            </Card>

            {/* Forum Posts */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Najnovšie diskusie</h2>
                <Badge variant="secondary">
                  {posts.length} príspevkov
                </Badge>
              </div>

              {isLoading ? (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    Načítavam príspevky...
                  </CardContent>
                </Card>
              ) : posts.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    Zatiaľ nie sú žiadne príspevky. Buďte prvý kto niečo pridá!
                  </CardContent>
                </Card>
              ) : (
                posts.map((post) => {
                  const isLiked = likedPosts.includes(post.id);
                  const profile = profiles[post.user_id];
                  return (
                    <Card key={post.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={profile?.avatar_url || undefined} />
                            <AvatarFallback className="bg-gradient-primary text-white">
                              {profile?.full_name?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-lg">{post.title}</h3>
                                  <Badge variant="outline" className="text-xs">
                                    {post.category}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {profile?.full_name || "Používateľ"} • {getTimeAgo(post.created_at)}
                                </p>
                              </div>
                            </div>

                            <p className="text-foreground">{post.content}</p>

                            <div className="flex items-center gap-4 pt-2 border-t">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLike(post.id)}
                              className={`hover:text-primary ${isLiked ? 'text-primary' : ''}`}
                            >
                              <ThumbsUp className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                              {post.likes_count}
                            </Button>
                            
                            <Sheet>
                              <SheetTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setSelectedPost(post.id)}
                                >
                                  <Reply className="h-4 w-4 mr-1" />
                                  {post.replies_count} odpovedí
                                </Button>
                              </SheetTrigger>
                              <SheetContent side="bottom" className="h-[70vh]">
                                <SheetHeader>
                                  <SheetTitle>Komentáre ({post.replies_count})</SheetTitle>
                                </SheetHeader>
                                <ScrollArea className="h-[calc(70vh-140px)] mt-4">
                                  <div className="space-y-4 pr-4">
                                    {comments.map((comment) => {
                                      const commentProfile = commentProfiles[comment.user_id];
                                      return (
                                        <div key={comment.id} className="flex gap-3">
                                          <Avatar className="h-8 w-8">
                                            <AvatarImage src={commentProfile?.avatar_url || undefined} />
                                            <AvatarFallback>
                                              {commentProfile?.full_name?.[0]?.toUpperCase() || "U"}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div className="flex-1">
                                            <p className="text-sm font-semibold">
                                              {commentProfile?.full_name || "Používateľ"}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                              {comment.content}
                                            </p>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </ScrollArea>
                                <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                                  <Input
                                    placeholder="Napíš komentár..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                                  />
                                  <Button 
                                    onClick={() => handleAddComment(post.id)} 
                                    size="icon"
                                    disabled={addCommentMutation.isPending}
                                  >
                                    <Send className="h-4 w-4" />
                                  </Button>
                                </div>
                              </SheetContent>
                            </Sheet>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Megaforum;