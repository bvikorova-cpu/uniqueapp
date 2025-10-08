import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, ThumbsUp, Reply, Send, TrendingUp, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "@supabase/supabase-js";

interface ForumPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  likes_count: number;
  replies_count: number;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

const Megaforum = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Všeobecné");

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
        .select(`
          *,
          profiles!forum_posts_user_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ForumPost[];
    },
  });

  // Check user likes
  const { data: userLikes = [] } = useQuery({
    queryKey: ["userForumLikes", user?.id],
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

      const isLiked = userLikes.includes(postId);

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
      queryClient.invalidateQueries({ queryKey: ["forumPosts"] });
      queryClient.invalidateQueries({ queryKey: ["userForumLikes"] });
    },
  });

  const handleCreatePost = () => {
    if (!user) {
      toast({
        title: "Prihlásenie potrebné",
        description: "Pre vytvorenie príspevku sa musíte prihlásiť",
        variant: "destructive",
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
        description: "Pre like sa musíte prihlásiť",
        variant: "destructive",
      });
      return;
    }

    likeMutation.mutate(postId);
  };

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "pred chvíľou";
    if (seconds < 3600) return `pred ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `pred ${Math.floor(seconds / 3600)} h`;
    return `pred ${Math.floor(seconds / 86400)} d`;
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
                />
                <Textarea
                  placeholder="Čo chcete zdieľať s komunitou?"
                  className="min-h-32"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                />
                <Button 
                  variant="hero" 
                  className="w-full"
                  onClick={handleCreatePost}
                  disabled={createPostMutation.isPending}
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
                  <CardContent className="pt-6 text-center">
                    Načítavam príspevky...
                  </CardContent>
                </Card>
              ) : posts.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    Zatiaľ nie sú žiadne príspevky. Buďte prvý kto niečo zdieľa!
                  </CardContent>
                </Card>
              ) : (
                posts.map((post) => (
                  <Card key={post.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={post.profiles?.avatar_url || undefined} />
                          <AvatarFallback className="bg-gradient-primary text-white">
                            {post.profiles?.full_name?.[0]?.toUpperCase() || "U"}
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
                                {post.profiles?.full_name || "Používateľ"} • {getTimeSince(post.created_at)}
                              </p>
                            </div>
                          </div>

                          <p className="text-foreground">{post.content}</p>

                          <div className="flex items-center gap-4 pt-2 border-t">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLike(post.id)}
                              className={`hover:text-primary ${userLikes.includes(post.id) ? 'text-primary' : ''}`}
                            >
                              <ThumbsUp className={`h-4 w-4 mr-1 ${userLikes.includes(post.id) ? 'fill-current' : ''}`} />
                              {post.likes_count}
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Reply className="h-4 w-4 mr-1" />
                              {post.replies_count} odpovedí
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Megaforum;
