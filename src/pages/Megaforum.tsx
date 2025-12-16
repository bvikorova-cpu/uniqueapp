import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { MessageSquare, ThumbsUp, Reply, Send, TrendingUp, Users, Trash2, Search } from "lucide-react";
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
  const [selectedCategory, setSelectedCategory] = useState("General");
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    "General",
    "Technology",
    "Sports",
    "Culture",
    "Music",
    "Film & TV",
    "Games",
    "Health",
    "Other"
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
        .order("created_at", { ascending: false });

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
    queryKey: ["commentProfiles", comments.map((c: any) => c.user_id)],
    queryFn: async () => {
      const userIds = [...new Set(comments.map((c: any) => c.user_id))];
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

  // Fetch liked comments
  const { data: likedComments = [] } = useQuery({
    queryKey: ["forumLikedComments", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("forum_comment_likes")
        .select("comment_id")
        .eq("user_id", user.id);

      if (error) throw error;
      return data.map(like => like.comment_id);
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
        title: "Post Created!",
        description: "Your post has been successfully added to the forum.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive",
      });
    },
  });

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
        title: "Comment Added",
        description: "Your comment has been successfully added",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add comment",
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
      queryClient.invalidateQueries({ queryKey: ["forumPosts"] });
      queryClient.invalidateQueries({ queryKey: ["forumLikedPosts"] });
    },
  });

  // Like/unlike comment mutation
  const likeCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      if (!user) throw new Error("Must be logged in");

      const isLiked = likedComments.includes(commentId);

      if (isLiked) {
        const { error } = await supabase
          .from("forum_comment_likes")
          .delete()
          .eq("comment_id", commentId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("forum_comment_likes")
          .insert([{ comment_id: commentId, user_id: user.id }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forumComments"] });
      queryClient.invalidateQueries({ queryKey: ["forumLikedComments"] });
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase
        .from("forum_posts")
        .delete()
        .eq("id", postId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forumPosts"] });
      toast({
        title: "Post Deleted",
        description: "Your post has been successfully deleted",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete post",
        variant: "destructive",
      });
    },
  });

  const handleCreatePost = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "You must be logged in to create a post",
        variant: "destructive",
      });
      return;
    }

    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both the title and content of the post.",
        variant: "destructive"
      });
      return;
    }

    createPostMutation.mutate();
  };

  const handleLike = (postId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "You must be logged in to like",
        variant: "destructive",
      });
      return;
    }

    likeMutation.mutate(postId);
  };

  const handleCommentLike = (commentId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "You must be logged in to like",
        variant: "destructive",
      });
      return;
    }

    likeCommentMutation.mutate(commentId);
  };

  const handleDeletePost = (postId: string) => {
    deletePostMutation.mutate(postId);
  };

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <Badge className="bg-gradient-primary text-white">
            <Users className="h-4 w-4 mr-1" />
            Open to Everyone
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Megaforum
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A community where everyone can participate. Discuss, share and inspire each other.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Categories & Stats */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
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
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Posts:</span>
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
                  Create New Post
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {categories.map((cat) => (
                      <Badge
                        key={cat}
                        variant={selectedCategory === cat ? "default" : "outline"}
                        className="cursor-pointer text-center justify-center"
                        onClick={() => setSelectedCategory(cat)}
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Input
                  placeholder="Post title..."
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                />
                <Textarea
                  placeholder="What would you like to share with the community?"
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
                  {createPostMutation.isPending ? "Publishing..." : "Publish Post"}
                </Button>
              </CardContent>
            </Card>

            {/* Forum Posts */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold">Latest Discussions</h2>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search posts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Badge variant="secondary">
                    {filteredPosts.length} posts
                  </Badge>
                </div>
              </div>

              {isLoading ? (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    Loading posts...
                  </CardContent>
                </Card>
              ) : filteredPosts.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    {searchQuery ? "No posts found." : "No posts yet. Be the first to add something!"}
                  </CardContent>
                </Card>
              ) : (
                filteredPosts.map((post) => {
                  const isLiked = likedPosts.includes(post.id);
                  const profile = profiles[post.user_id];
                  return (
                    <Card key={post.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="pt-6">
                          <div className="flex gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={profile?.avatar_url || undefined} />
                            <AvatarFallback className="bg-gradient-primary text-white">
                              {profile?.full_name?.[0]?.toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-lg">{post.title}</h3>
                                  <Badge variant="outline" className="text-xs">
                                    {post.category}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {profile?.full_name || "User"} • {getTimeSince(post.created_at)}
                                </p>
                              </div>
                              {user?.id === post.user_id && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Post?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. The post and all its comments will be permanently deleted.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => handleDeletePost(post.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>

                            <p className="text-foreground">{post.content}</p>

                            <div className="flex items-center gap-4 pt-2 border-t">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleLike(post.id)}
                                className={`hover:text-primary ${isLiked ? 'text-primary' : ''}`}
                                disabled={likeMutation.isPending}
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
                                    {post.replies_count} replies
                                  </Button>
                                </SheetTrigger>
                                <SheetContent side="bottom" className="h-[70vh]">
                                  <SheetHeader>
                                    <SheetTitle>Comments ({post.replies_count})</SheetTitle>
                                  </SheetHeader>
                                  <ScrollArea className="h-[calc(70vh-140px)] mt-4">
                                    <div className="space-y-4 pr-4">
                                      {comments.map((comment: any) => {
                                        const commentProfile = commentProfiles[comment.user_id];
                                        const isCommentLiked = likedComments.includes(comment.id);
                                        return (
                                          <div key={comment.id} className="flex gap-3">
                                            <Avatar className="h-8 w-8">
                                              <AvatarImage src={commentProfile?.avatar_url || undefined} />
                                              <AvatarFallback>{commentProfile?.full_name?.[0] || "U"}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                              <p className="text-sm font-semibold">{commentProfile?.full_name || "User"}</p>
                                              <p className="text-sm text-muted-foreground">{comment.content}</p>
                                              <div className="flex items-center gap-3 mt-1">
                                                <p className="text-xs text-muted-foreground">
                                                  {getTimeSince(comment.created_at)}
                                                </p>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => handleCommentLike(comment.id)}
                                                  className={`h-6 px-2 hover:text-primary ${isCommentLiked ? 'text-primary' : ''}`}
                                                  disabled={likeCommentMutation.isPending}
                                                >
                                                  <ThumbsUp className={`h-3 w-3 mr-1 ${isCommentLiked ? 'fill-current' : ''}`} />
                                                  {comment.likes_count || 0}
                                                </Button>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </ScrollArea>
                                  <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                                    <Input
                                      placeholder="Write a comment..."
                                      value={newComment}
                                      onChange={(e) => setNewComment(e.target.value)}
                                      onKeyPress={(e) => {
                                        if (e.key === 'Enter' && selectedPost) {
                                          addCommentMutation.mutate(selectedPost);
                                        }
                                      }}
                                    />
                                    <Button 
                                      onClick={() => selectedPost && addCommentMutation.mutate(selectedPost)}
                                      size="icon"
                                      disabled={!newComment.trim() || addCommentMutation.isPending}
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
