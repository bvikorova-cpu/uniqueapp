import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CoverImageUpload } from "@/components/shared/CoverImageUpload";
import type { Page, PageFollower } from "@/types/database";
import { PageReviews } from "@/components/pages/PageReviews";
import { 
  ArrowLeft, 
  Settings, 
  Image as ImageIcon,
  Send,
  Heart,
  MessageCircle,
  Share2,
  Users,
  Globe,
  Camera,
  MoreHorizontal,
  Bell,
  BellOff,
  ImagePlus,
  Video,
  Smile,
  MapPin,
  Star,
  BookOpen
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { WallPostActions } from "@/components/wall/WallPostActions";

const EMOJIS = ["😊", "😂", "❤️", "🔥", "👍", "🎉", "😍", "🤔", "😢", "😎", "🙏", "💪"];

export default function PageDetail() {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [postContent, setPostContent] = useState("");
  const [postImage, setPostImage] = useState<string | undefined>();
  const [postLocation, setPostLocation] = useState<string | undefined>();
  const [postFeeling, setPostFeeling] = useState<string | undefined>();
  const [isEditingCover, setIsEditingCover] = useState(false);
  const [newCoverImage, setNewCoverImage] = useState<string | undefined>();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [notifyEnabled, setNotifyEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(`page-notify-${pageId}`) !== "off";
  });

  const togglePageNotifications = () => {
    const next = !notifyEnabled;
    setNotifyEnabled(next);
    localStorage.setItem(`page-notify-${pageId}`, next ? "on" : "off");
    toast({
      title: next ? "Notifications enabled" : "Notifications muted",
      description: next
        ? "You'll be notified about new posts from this page."
        : "You won't receive notifications from this page.",
    });
  };

  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: page, isLoading: isLoadingPage } = useQuery({
    queryKey: ["page", pageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("id", pageId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!pageId,
  });

  const { data: isFollowing } = useQuery({
    queryKey: ["page-following", pageId, user?.id],
    queryFn: async () => {
      if (!user || !pageId) return false;
      const { data } = await supabase
        .from("page_followers")
        .select("*")
        .eq("page_id", pageId)
        .eq("user_id", user.id)
        .single();
      return !!data;
    },
    enabled: !!user && !!pageId,
  });

  const { data: followers = [] } = useQuery({
    queryKey: ["page-followers", pageId],
    queryFn: async () => {
      const { data } = await supabase
        .from("page_followers")
        .select(`
          *,
          profiles:user_id (
            id,
            display_name,
            avatar_url
          )
        `)
        .eq("page_id", pageId)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!pageId,
  });

  const { data: posts = [] } = useQuery({
    queryKey: ["page-posts", pageId],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("posts") as any)
        .select(`
          *,
          profiles:user_id (
            id,
            display_name,
            avatar_url
          )
        `)
        .eq("page_id", pageId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!pageId,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!user || !pageId) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("page_followers")
        .upsert(
          {
            page_id: pageId,
            user_id: user.id,
          },
          {
            onConflict: "page_id,user_id",
            ignoreDuplicates: true,
          }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page-following"] });
      queryClient.invalidateQueries({ queryKey: ["page-followers"] });
      toast({ title: "Following page!" });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async () => {
      if (!user || !pageId) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("page_followers")
        .delete()
        .eq("page_id", pageId)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page-following"] });
      queryClient.invalidateQueries({ queryKey: ["page-followers"] });
      toast({ title: "Unfollowed page" });
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async () => {
      if (!user || !pageId || !postContent.trim()) throw new Error("Invalid data");
      const { error } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          content: postContent + (postFeeling ? ` ${postFeeling}` : "") + (postLocation ? ` 📍 ${postLocation}` : ""),
          page_id: pageId,
          image_url: postImage || null,
        } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page-posts"] });
      setPostContent("");
      setPostImage(undefined);
      setPostLocation(undefined);
      setPostFeeling(undefined);
      toast({ title: "Post created!" });
    },
  });

  const updateCoverMutation = useMutation({
    mutationFn: async (coverImage: string) => {
      const { error } = await supabase
        .from("pages")
        .update({ cover_image_url: coverImage })
        .eq("id", pageId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page", pageId] });
      setIsEditingCover(false);
      setNewCoverImage(undefined);
      toast({ title: "Cover image updated!" });
    },
  });

  const updatePageMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("pages")
        .update({ 
          name: editName,
          description: editDescription,
          category: editCategory
        })
        .eq("id", pageId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page", pageId] });
      setShowSettingsDialog(false);
      toast({ title: "Page updated!" });
    },
  });

  const deletePageMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("pages")
        .delete()
        .eq("id", pageId);
      if (error) throw error;
    },
    onSuccess: () => {
      navigate("/wall/pages");
      toast({ title: "Page deleted!" });
    },
  });

  const openSettings = () => {
    setEditName(page?.name || "");
    setEditDescription(page?.description || "");
    setEditCategory(page?.category || "");
    setShowSettingsDialog(true);
  };

  // Loading state
  if (isLoadingPage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  // Page not found
  if (!page) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-black mb-4">Page not found</h1>
        <Button onClick={() => navigate("/wall/pages")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Pages
        </Button>
      </div>
    );
  }

  const isOwner = user?.id === page.user_id;
  const followerCount = followers.length;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Cover Section */}
      <div className="relative">
        {/* Back Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate("/wall/pages")}
          className="absolute top-4 left-4 z-20 shadow-lg"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div 
          className="h-40 md:h-56 bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 relative group"
          style={page.cover_image_url ? { 
            backgroundImage: `url(${page.cover_image_url})`, 
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          } : {}}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          
          {isOwner && (
            <Dialog open={isEditingCover} onOpenChange={setIsEditingCover}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Edit Cover
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Cover Image</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <CoverImageUpload
                    value={newCoverImage}
                    onChange={setNewCoverImage}
                    folder="pages"
                  />
                  <Button 
                    onClick={() => newCoverImage && updateCoverMutation.mutate(newCoverImage)}
                    disabled={!newCoverImage}
                    className="w-full"
                  >
                    Save Cover
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Page Info Card */}
      <div className="max-w-2xl mx-auto px-4 -mt-12 relative z-10">
        <Card className="p-5 text-center">
          {/* Centered Avatar */}
          <div className="flex justify-center -mt-14 mb-3">
            <Avatar className="h-20 w-20 border-4 border-background shadow-xl">
              <AvatarImage src={page.avatar_url} />
              <AvatarFallback className="text-2xl bg-primary/20 text-primary">
                {page.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Page Name & Category */}
          <h1 className="text-xl font-bold flex items-center justify-center gap-2">
            {page.name}
            <Globe className="h-4 w-4 text-muted-foreground" />
          </h1>

          {/* Category & Followers */}
          <div className="flex items-center justify-center gap-4 mt-2 text-sm text-muted-foreground">
            {page.category && (
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {page.category}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {followerCount} followers
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-2 mt-4">
            {!isOwner ? (
              <>
                {!isFollowing ? (
                  <Button onClick={() => followMutation.mutate()} size="sm">
                    <Star className="h-4 w-4 mr-2" />
                    Follow
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => unfollowMutation.mutate()} size="sm">
                    Following
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={togglePageNotifications}
                  title={notifyEnabled ? "Mute notifications" : "Enable notifications"}
                >
                  {notifyEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={togglePageNotifications}
                  title={notifyEnabled ? "Mute notifications" : "Enable notifications"}
                >
                  {notifyEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-9 w-9">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={openSettings}>
                      <Settings className="h-4 w-4 mr-2" />
                      Page Settings
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>

          {/* Quick Stats */}
          <div className="flex justify-center gap-8 mt-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-xl font-bold text-primary">{posts.length}</p>
              <p className="text-xs text-muted-foreground">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-primary">{followerCount}</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-primary">
                {format(new Date(page.created_at), "yyyy")}
              </p>
              <p className="text-xs text-muted-foreground">Created</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full grid grid-cols-5 mb-4">
            <TabsTrigger value="posts" className="text-xs">Posts</TabsTrigger>
            <TabsTrigger value="reviews" className="text-xs">Reviews</TabsTrigger>
            <TabsTrigger value="followers" className="text-xs">Followers</TabsTrigger>
            <TabsTrigger value="media" className="text-xs">Media</TabsTrigger>
            <TabsTrigger value="about" className="text-xs">About</TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="mt-4">
            <PageReviews pageId={pageId!} />
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-6">
            {/* Create Post - Only for owner */}
            {isOwner && (
              <Card className="p-4 overflow-hidden">
                <div className="flex gap-3">
                  <Avatar className="shrink-0">
                    <AvatarImage src={page.avatar_url} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {page.name[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0 space-y-3">
                    <Textarea
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="Share something with your followers..."
                      rows={2}
                      className="resize-none w-full"
                    />

                    {/* Location / Feeling badges */}
                    {(postLocation || postFeeling) && (
                      <div className="flex flex-wrap gap-2">
                        {postLocation && (
                          <Badge variant="secondary" className="gap-1">
                            <MapPin className="h-3 w-3" />
                            {postLocation}
                            <button onClick={() => setPostLocation(undefined)} className="ml-1 hover:text-destructive">×</button>
                          </Badge>
                        )}
                        {postFeeling && (
                          <Badge variant="secondary" className="gap-1">
                            {postFeeling}
                            <button onClick={() => setPostFeeling(undefined)} className="ml-1 hover:text-destructive">×</button>
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Location Input */}
                    {showLocationInput && (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter location..."
                          className="flex-1"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              setPostLocation((e.target as HTMLInputElement).value);
                              setShowLocationInput(false);
                            }
                          }}
                        />
                        <Button size="sm" variant="ghost" onClick={() => setShowLocationInput(false)}>
                          Cancel
                        </Button>
                      </div>
                    )}

                    {/* Emoji Picker */}
                    {showEmojiPicker && (
                      <div className="flex flex-wrap gap-2 p-2 bg-muted/50 rounded-lg">
                        {EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => {
                              setPostFeeling(emoji);
                              setShowEmojiPicker(false);
                            }}
                            className="text-xl hover:scale-125 transition-transform"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Image Preview */}
                    {postImage && (
                      <div className="relative">
                        <img src={postImage} alt="Post" className="rounded-lg max-h-48 object-cover" />
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-2 right-2 h-6 w-6"
                          onClick={() => setPostImage(undefined)}
                        >
                          ×
                        </Button>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      {/* Icon-only action buttons */}
                      <div className="flex gap-0.5">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:bg-green-50">
                              <ImagePlus className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Photo</DialogTitle>
                            </DialogHeader>
                            <CoverImageUpload value={postImage} onChange={setPostImage} folder="posts" />
                          </DialogContent>
                        </Dialog>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50">
                              <Video className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Video</DialogTitle>
                            </DialogHeader>
                            <Input
                              type="file"
                              accept="video/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                  const path = `wall-videos/${Date.now()}-${file.name}`;
                                  const { error } = await supabase.storage.from("user-uploads").upload(path, file);
                                  if (error) throw error;
                                  const { data: urlData } = supabase.storage.from("user-uploads").getPublicUrl(path);
                                  setPostContent(prev => prev + `\n${urlData.publicUrl}`);
                                  toast({ title: "Video uploaded!" });
                                } catch (err: any) {
                                  toast({ title: "Upload failed", description: err.message, variant: "destructive" });
                                }
                              }}
                            />
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 text-yellow-500 hover:bg-yellow-50 ${showEmojiPicker ? "bg-yellow-100" : ""}`}
                          onClick={() => {
                            setShowEmojiPicker(!showEmojiPicker);
                            setShowLocationInput(false);
                          }}
                        >
                          <Smile className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 text-blue-500 hover:bg-blue-50 ${showLocationInput ? "bg-blue-100" : ""}`}
                          onClick={() => {
                            setShowLocationInput(!showLocationInput);
                            setShowEmojiPicker(false);
                          }}
                        >
                          <MapPin className="h-4 w-4" />
                        </Button>
                      </div>

                      <Button
                        onClick={() => createPostMutation.mutate()}
                        disabled={!postContent.trim()}
                        size="sm"
                        className="shrink-0"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Posts List */}
            <div className="space-y-4">
              {posts.length === 0 && (
                <Card className="p-8 text-center text-muted-foreground">
                  No posts yet
                </Card>
              )}
              {posts.map((post: any) => (
                <Card key={post.id} className="p-4">
                  <div className="flex gap-3">
                    <Avatar className="shrink-0">
                      <AvatarImage src={page.avatar_url} />
                      <AvatarFallback>
                        {page.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{page.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(post.created_at), "PPp")}
                        </span>
                      </div>
                      <p className="mt-2 break-words">{post.content}</p>
                      
                      {post.image_url && (
                        <img src={post.image_url} alt="Post" className="mt-3 rounded-lg max-h-64 object-cover" />
                      )}
                      
                      <WallPostActions
                        postId={post.id}
                        initialLikesCount={post.likes_count || 0}
                        initialCommentsCount={post.comments_count || 0}
                        initialRepostsCount={post.reposts_count || 0}
                        variant="compact"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Followers Tab */}
          <TabsContent value="followers" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Followers ({followerCount})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {followers.map((follower: any) => (
                  <div key={follower.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <Avatar>
                      <AvatarImage src={follower.profiles?.avatar_url} />
                      <AvatarFallback>
                        {follower.profiles?.display_name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {follower.profiles?.display_name || "User"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Media</h3>
              <div className="grid grid-cols-3 gap-2">
                {posts.filter((p: any) => p.image_url).map((post: any) => (
                  <div key={post.id} className="aspect-square rounded-lg overflow-hidden">
                    <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              {posts.filter((p: any) => p.image_url).length === 0 && (
                <p className="text-center text-muted-foreground">No media yet</p>
              )}
            </Card>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">About</h3>
              <div className="space-y-3">
                {page.description && (
                  <div>
                    <p className="text-sm font-medium">Description</p>
                    <p className="text-sm text-muted-foreground">{page.description}</p>
                  </div>
                )}
                {page.category && (
                  <div>
                    <p className="text-sm font-medium">Category</p>
                    <p className="text-sm text-muted-foreground">{page.category}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(page.created_at), "PPP")}
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Page Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Page Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Page Name</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter page name..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Enter description..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Input
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                placeholder="Enter category..."
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={() => updatePageMutation.mutate()}
                disabled={!editName.trim()}
                className="flex-1"
              >
                Save Changes
              </Button>
              <Button 
                variant="destructive"
                onClick={() => {
                  if (confirm("Are you sure you want to delete this page?")) {
                    deletePageMutation.mutate();
                  }
                }}
              >
                Delete Page
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
