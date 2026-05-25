import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import {
  MessageSquare, ThumbsUp, Reply, Send, TrendingUp, Users, Trash2, Search,
  BarChart3, Trophy, Swords, Sparkles, BookOpen, Flame, Hash, Pin, Bell
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { MegaforumHero } from "@/components/megaforum/MegaforumHero";
import { HowItWorksCard } from "@/components/megaforum/HowItWorksCard";
import { PaywallModal } from "@/components/megaforum/PaywallModal";
import { ForumPolls } from "@/components/megaforum/ForumPolls";
import { ReputationSystem } from "@/components/megaforum/ReputationSystem";
import { LiveDebateRooms } from "@/components/megaforum/LiveDebateRooms";
import { HotTopicsAI } from "@/components/megaforum/HotTopicsAI";
import { WeeklyChallenges } from "@/components/megaforum/WeeklyChallenges";
import { TagInput } from "@/components/megaforum/TagInput";
import { ThreadSubscription } from "@/components/megaforum/ThreadSubscription";
import { ForumNotifications } from "@/components/megaforum/ForumNotifications";
import ReactMarkdown from "react-markdown";
import { SEO } from "@/components/SEO";

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
  tags?: string[];
  is_pinned?: boolean;
  is_markdown?: boolean;
}

type ActiveView = "main" | "polls" | "reputation" | "debates" | "hot-topics" | "challenges";

const TOOLS = [
  { id: "polls" as ActiveView, label: "Polls & Surveys", icon: BarChart3, emoji: "📊", desc: "Create & vote on community polls", gradient: "from-blue-600 to-cyan-600" },
  { id: "reputation" as ActiveView, label: "Reputation & Karma", icon: Trophy, emoji: "🏆", desc: "Levels, badges & leaderboard", gradient: "from-amber-600 to-orange-600" },
  { id: "debates" as ActiveView, label: "Live Debate Rooms", icon: Swords, emoji: "⚔️", desc: "Real-time debates with voting", gradient: "from-rose-600 to-pink-600" },
  { id: "hot-topics" as ActiveView, label: "Hot Topics AI", icon: Sparkles, emoji: "🤖", desc: "AI trend suggestions & summaries", gradient: "from-purple-600 to-violet-600", premium: true },
  { id: "challenges" as ActiveView, label: "Weekly Challenges", icon: Flame, emoji: "🔥", desc: "Community challenges with karma", gradient: "from-orange-600 to-red-600" },
];

const categories = ["General", "Technology", "Sports", "Culture", "Music", "Film & TV", "Games", "Health", "Other"];

const Megaforum = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>("main");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("General");
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [newPostTags, setNewPostTags] = useState<string[]>([]);
  const [useMarkdown, setUseMarkdown] = useState(false);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallAction, setPaywallAction] = useState<string>("interact");
  const requireAuth = (action: string): boolean => {
    if (!user) {
      setPaywallAction(action);
      setPaywallOpen(true);
      return false;
    }
    return true;
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["forumPosts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_posts").select("*").eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ForumPost[];
    },
  });

  const { data: profiles = {} } = useQuery({
    queryKey: ["forumProfiles", posts.map(p => p.user_id)],
    queryFn: async () => {
      const userIds = [...new Set(posts.map(p => p.user_id))];
      if (userIds.length === 0) return {};
      const { data, error } = await supabase.from("profiles_public" as any).select("id, full_name, avatar_url").in("id", userIds);
      if (error) throw error;
      const map: Record<string, Profile> = {};
      data?.forEach(p => { map[p.id] = p; });
      return map;
    },
    enabled: posts.length > 0,
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["forumComments", selectedPost],
    queryFn: async () => {
      if (!selectedPost) return [];
      const { data, error } = await supabase
        .from("forum_comments").select("*").eq("post_id", selectedPost).eq("is_active", true)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedPost,
  });

  const { data: commentProfiles = {} } = useQuery({
    queryKey: ["commentProfiles", comments.map((c: any) => c.user_id)],
    queryFn: async () => {
      const userIds = [...new Set(comments.map((c: any) => c.user_id))];
      if (userIds.length === 0) return {};
      const { data, error } = await supabase.from("profiles_public" as any).select("id, full_name, avatar_url").in("id", userIds);
      if (error) throw error;
      const map: Record<string, Profile> = {};
      data?.forEach(p => { map[p.id] = p; });
      return map;
    },
    enabled: comments.length > 0,
  });

  const { data: likedPosts = [] } = useQuery({
    queryKey: ["forumLikedPosts", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from("forum_post_likes").select("post_id").eq("user_id", user.id);
      if (error) throw error;
      return data.map(l => l.post_id);
    },
    enabled: !!user,
  });

  const { data: likedComments = [] } = useQuery({
    queryKey: ["forumLikedComments", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from("forum_comment_likes").select("comment_id").eq("user_id", user.id);
      if (error) throw error;
      return data.map(l => l.comment_id);
    },
    enabled: !!user,
  });

  const createPostMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");
      const { error } = await (supabase as any).from("forum_posts").insert([{
        user_id: user.id,
        title: newPostTitle,
        content: newPostContent,
        category: selectedCategory,
        tags: newPostTags,
        is_markdown: useMarkdown,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forumPosts"] });
      setNewPostTitle("");
      setNewPostContent("");
      setNewPostTags([]);
      toast({ title: "Post Created!", description: "Your post has been successfully added." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error("Must be logged in");
      const { error } = await supabase.from("forum_comments").insert([{
        post_id: postId, user_id: user.id, content: newComment,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forumComments"] });
      queryClient.invalidateQueries({ queryKey: ["forumPosts"] });
      setNewComment("");
      toast({ title: "Comment Added" });
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error("Must be logged in");
      const isLiked = likedPosts.includes(postId);
      if (isLiked) {
        await supabase.from("forum_post_likes").delete().eq("post_id", postId).eq("user_id", user.id);
      } else {
        await supabase.from("forum_post_likes").insert([{ post_id: postId, user_id: user.id }]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forumPosts"] });
      queryClient.invalidateQueries({ queryKey: ["forumLikedPosts"] });
    },
  });

  const likeCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      if (!user) throw new Error("Must be logged in");
      const isLiked = likedComments.includes(commentId);
      if (isLiked) {
        await supabase.from("forum_comment_likes").delete().eq("comment_id", commentId).eq("user_id", user.id);
      } else {
        await supabase.from("forum_comment_likes").insert([{ comment_id: commentId, user_id: user.id }]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forumComments"] });
      queryClient.invalidateQueries({ queryKey: ["forumLikedComments"] });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error("Must be logged in");
      await supabase.from("forum_posts").delete().eq("id", postId).eq("user_id", user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forumPosts"] });
      toast({ title: "Post Deleted" });
    },
  });

  const pinPostMutation = useMutation({
    mutationFn: async ({ postId, pin }: { postId: string; pin: boolean }) => {
      if (!user) throw new Error("Must be logged in");
      await (supabase as any).from("forum_posts").update({ is_pinned: pin }).eq("id", postId).eq("user_id", user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forumPosts"] });
      toast({ title: "Post updated" });
    },
  });

  const getTimeSince = (dateString: string) => {
    const diffInSeconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (diffInSeconds < 60) return "just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  // Get all tags from posts for filter
  const allTags = [...new Set(posts.flatMap(p => (p.tags || [])))];

  // Sort: pinned first, then by date. Filter by category, search, tag
  const filteredPosts = posts
    .filter(post =>
      (selectedCategory === "General" || post.category === selectedCategory) &&
      (post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       post.content.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (!filterTag || (post.tags || []).includes(filterTag))
    )
    .sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return 0;
    });

  // Render sub-views
  if (activeView === "polls") return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-5xl"><ForumPolls onBack={() => setActiveView("main")} /></div>
    </div>
  );
  if (activeView === "reputation") return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-5xl"><ReputationSystem onBack={() => setActiveView("main")} /></div>
    </div>
  );
  if (activeView === "debates") return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-5xl"><LiveDebateRooms onBack={() => setActiveView("main")} /></div>
    </div>
  );
  if (activeView === "hot-topics") return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-5xl"><HotTopicsAI onBack={() => setActiveView("main")} /></div>
    </div>
  );
  if (activeView === "challenges") return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-5xl"><WeeklyChallenges onBack={() => setActiveView("main")} /></div>
    </div>
  );

  return (
    <>
      <SEO
        title="Megaforum - Open community discussions"
        description="Join premium, member-only discussions across 9 categories. Live debates, polls, hot topics and weekly challenges on Unique Megaforum."
        canonical="/megaforum"
      />
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Hero */}
        <MegaforumHero
          totalPosts={posts.length}
          totalUsers={Object.keys(profiles).length}
          todayPosts={posts.filter(p => new Date(p.created_at).toDateString() === new Date().toDateString()).length}
          trendingTopics={new Set(posts.map(p => p.category)).size}
        />

        {/* How it works */}
        <HowItWorksCard />

        {/* Tools Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          {TOOLS.map((tool, i) => (
            <motion.button
              key={tool.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveView(tool.id)}
              className="relative p-4 rounded-xl bg-card/80 backdrop-blur-xl border border-border/50 hover:border-primary/30 transition-all text-left group"
            >
              {tool.premium && (
                <Badge className="absolute top-2 right-2 text-[8px] bg-amber-500/20 text-amber-400 border-amber-500/30">
                  💎 Premium
                </Badge>
              )}
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-2`}>
                <tool.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-sm">{tool.label}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">{tool.desc}</p>
            </motion.button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-card/80 backdrop-blur-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Tag Filter */}
            {allTags.length > 0 && (
              <Card className="bg-card/80 backdrop-blur-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Hash className="h-4 w-4" /> Tags
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-1">
                  {filterTag && (
                    <Badge variant="destructive" className="text-[10px] cursor-pointer" onClick={() => setFilterTag(null)}>
                      ✕ Clear
                    </Badge>
                  )}
                  {allTags.slice(0, 15).map((tag) => (
                    <Badge
                      key={tag}
                      variant={filterTag === tag ? "default" : "outline"}
                      className="text-[10px] cursor-pointer"
                      onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                    >
                      #{tag}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card className="bg-card/80 backdrop-blur-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-400" /> About
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Megaforum is a premium, members-only community. Create posts, start polls, debate topics, and earn karma.
                  AI features cost credits. Use Markdown for rich formatting!
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4">
            {/* Create Post */}
            <Card className="bg-card/80 backdrop-blur-xl border-primary/10">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                    {categories.map((cat) => (
                      <Badge
                        key={cat}
                        variant={selectedCategory === cat ? "default" : "outline"}
                        className="cursor-pointer text-[10px] whitespace-nowrap"
                        onClick={() => setSelectedCategory(cat)}
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                  {user && <ForumNotifications userId={user.id} onViewPost={(id) => setSelectedPost(id)} />}
                </div>
                <Input
                  placeholder="Post title..."
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  className="text-sm"
                />
                <div className="flex items-center gap-2">
                  <Button
                    variant={useMarkdown ? "default" : "outline"}
                    size="sm"
                    className="text-[10px] h-6"
                    onClick={() => setUseMarkdown(!useMarkdown)}
                  >
                    Markdown {useMarkdown ? "ON" : "OFF"}
                  </Button>
                  <span className="text-[10px] text-muted-foreground">
                    {useMarkdown ? "Use **bold**, *italic*, # headers, - lists" : "Plain text mode"}
                  </span>
                </div>
                <Textarea
                  placeholder={useMarkdown ? "Write in Markdown... **bold**, *italic*, # heading" : "Share something with the community..."}
                  className="min-h-20 text-sm font-mono"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                />
                <TagInput tags={newPostTags} onChange={setNewPostTags} />
                <Button
                  variant="hero"
                  className="w-full"
                  onClick={() => {
                    if (!requireAuth("publish a post")) return;
                    if (!newPostTitle.trim() || !newPostContent.trim()) { toast({ title: "Fill in all fields", variant: "destructive" }); return; }
                    createPostMutation.mutate();
                  }}
                  disabled={createPostMutation.isPending}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {createPostMutation.isPending ? "Publishing..." : "Publish Post"}
                </Button>
              </CardContent>
            </Card>

            {/* Search */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-sm"
                />
              </div>
              <Badge variant="secondary" className="whitespace-nowrap">{filteredPosts.length} posts</Badge>
            </div>

            {/* Posts */}
            {isLoading ? (
              <Card className="bg-card/80 backdrop-blur-xl">
                <CardContent className="pt-6 text-center text-muted-foreground">Loading posts...</CardContent>
              </Card>
            ) : filteredPosts.length === 0 ? (
              <Card className="bg-card/80 backdrop-blur-xl">
                <CardContent className="pt-6 text-center text-muted-foreground">
                  {searchQuery || filterTag ? "No posts found." : "No posts yet. Be the first!"}
                </CardContent>
              </Card>
            ) : (
              filteredPosts.map((post, idx) => {
                const isLiked = likedPosts.includes(post.id);
                const profile = profiles[post.user_id];
                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <Card className={`bg-card/80 backdrop-blur-xl hover:shadow-lg transition-all ${post.is_pinned ? "border-primary/30 ring-1 ring-primary/10" : "border-primary/5"}`}>
                      <CardContent className="pt-4">
                        <div className="flex gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={profile?.avatar_url || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xs">
                              {profile?.full_name?.[0]?.toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                  {post.is_pinned && (
                                    <Pin className="h-3.5 w-3.5 text-primary fill-current" />
                                  )}
                                  <h3 className="font-bold text-sm">{post.title}</h3>
                                  <Badge variant="outline" className="text-[10px]">{post.category}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {profile?.full_name || "User"} • {getTimeSince(post.created_at)}
                                </p>
                                {(post.tags || []).length > 0 && (
                                  <div className="flex gap-1 mt-1 flex-wrap">
                                    {(post.tags || []).map(tag => (
                                      <Badge
                                        key={tag}
                                        variant="secondary"
                                        className="text-[9px] cursor-pointer"
                                        onClick={() => setFilterTag(tag)}
                                      >
                                        #{tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                {user?.id === post.user_id && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0"
                                      onClick={() => pinPostMutation.mutate({ postId: post.id, pin: !post.is_pinned })}
                                      title={post.is_pinned ? "Unpin" : "Pin post"}
                                    >
                                      <Pin className={`h-3.5 w-3.5 ${post.is_pinned ? "text-primary fill-current" : ""}`} />
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="sm" className="text-destructive h-7 w-7 p-0">
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Delete Post?</AlertDialogTitle>
                                          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => deletePostMutation.mutate(post.id)} className="bg-destructive">Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </>
                                )}
                              </div>
                            </div>

                            {post.is_markdown ? (
                              <div className="text-sm text-foreground prose prose-sm prose-invert max-w-none">
                                <ReactMarkdown>{post.content}</ReactMarkdown>
                              </div>
                            ) : (
                              <p className="text-sm text-foreground">{post.content}</p>
                            )}

                            <div className="flex items-center gap-3 pt-2 border-t border-border/30">
                              <Button
                                variant="ghost" size="sm"
                                onClick={() => { if (!requireAuth("like this post")) return; likeMutation.mutate(post.id); }}
                                className={`h-7 text-xs hover:text-primary ${isLiked ? "text-primary" : ""}`}
                              >
                                <ThumbsUp className={`h-3.5 w-3.5 mr-1 ${isLiked ? "fill-current" : ""}`} />
                                {post.likes_count}
                              </Button>

                              <Sheet>
                                <SheetTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { if (!requireAuth("view & comment")) return; setSelectedPost(post.id); }}>
                                    <Reply className="h-3.5 w-3.5 mr-1" />
                                    {post.replies_count} replies
                                  </Button>
                                </SheetTrigger>
                                <SheetContent side="bottom" className="h-[70vh]">
                                  <SheetHeader>
                                    <SheetTitle>Comments ({post.replies_count})</SheetTitle>
                                  </SheetHeader>
                                  <ScrollArea className="h-[calc(70vh-140px)] mt-4">
                                    <div className="space-y-3 pr-4">
                                      {comments.map((comment: any) => {
                                        const cp = commentProfiles[comment.user_id];
                                        const isCommentLiked = likedComments.includes(comment.id);
                                        return (
                                          <div key={comment.id} className="flex gap-2">
                                            <Avatar className="h-7 w-7">
                                              <AvatarImage src={cp?.avatar_url || undefined} />
                                              <AvatarFallback className="text-[10px]">{cp?.full_name?.[0] || "U"}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                              <p className="text-xs font-semibold">{cp?.full_name || "User"}</p>
                                              <p className="text-xs text-muted-foreground">{comment.content}</p>
                                              <div className="flex items-center gap-2 mt-1">
                                                <p className="text-[10px] text-muted-foreground">{getTimeSince(comment.created_at)}</p>
                                                <Button
                                                  variant="ghost" size="sm"
                                                  onClick={() => { if (!user) return; likeCommentMutation.mutate(comment.id); }}
                                                  className={`h-5 px-1 text-[10px] ${isCommentLiked ? "text-primary" : ""}`}
                                                >
                                                  <ThumbsUp className={`h-2.5 w-2.5 mr-0.5 ${isCommentLiked ? "fill-current" : ""}`} />
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
                                      className="text-sm"
                                      onKeyDown={(e) => { if (e.key === "Enter" && selectedPost) addCommentMutation.mutate(selectedPost); }}
                                    />
                                    <Button
                                      size="icon"
                                      onClick={() => selectedPost && addCommentMutation.mutate(selectedPost)}
                                      disabled={!newComment.trim() || addCommentMutation.isPending}
                                    >
                                      <Send className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </SheetContent>
                              </Sheet>

                              <ThreadSubscription postId={post.id} userId={user?.id} />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
    <PaywallModal
      open={paywallOpen}
      onClose={() => setPaywallOpen(false)}
      action={paywallAction}
    />
    </>
  );
};

export default Megaforum;
