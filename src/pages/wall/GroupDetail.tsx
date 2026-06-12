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
import { 
  ArrowLeft, 
  Users, 
  Settings, 
  Image as ImageIcon,
  Send,
  UserPlus,
  Shield,
  Camera,
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Globe,
  Lock,
  Sparkles,
  Calendar,
  ImagePlus,
  Video,
  Smile,
  MapPin,
  Bell,
  BellOff,
  Crown,
  Star
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
  DialogFooter,
} from "@/components/ui/dialog";
import { WallPostActions } from "@/components/wall/WallPostActions";
import { GroupRulesEditor } from "@/components/groups/GroupRulesEditor";
import { GroupInsightsPanel } from "@/components/groups/GroupInsightsPanel";

export default function GroupDetail() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [postContent, setPostContent] = useState("");
  const [postImage, setPostImage] = useState<string | undefined>();
  const [postLocation, setPostLocation] = useState<string | undefined>();
  const [postFeeling, setPostFeeling] = useState<string | undefined>();
  const [isEditingCover, setIsEditingCover] = useState(false);
  const [newCoverImage, setNewCoverImage] = useState<string | undefined>();
  const [inviteEmail, setInviteEmail] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [notifyEnabled, setNotifyEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(`group-notify-${groupId}`) !== "off";
  });
  const [themeColor, setThemeColor] = useState<string>(() => {
    if (typeof window === "undefined") return "violet";
    return localStorage.getItem(`group-theme-${groupId}`) ?? "violet";
  });
  const [achievementsEnabled, setAchievementsEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(`group-achievements-${groupId}`) === "on";
  });
  const [anonymousEnabled, setAnonymousEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(`group-anonymous-${groupId}`) === "on";
  });
  const [showThemeDialog, setShowThemeDialog] = useState(false);

  const toggleNotifications = () => {
    const next = !notifyEnabled;
    setNotifyEnabled(next);
    localStorage.setItem(`group-notify-${groupId}`, next ? "on" : "off");
    toast({
      title: next ? "Notifications enabled" : "Notifications muted",
      description: next
        ? "You'll be notified about new posts in this group."
        : "You won't receive notifications from this group.",
    });
  };

  const handleInvite = () => {
    const email = inviteEmail.trim();
    if (!email) {
      toast({ title: "Enter an email", variant: "destructive" });
      return;
    }
    const subject = encodeURIComponent(
      `Join "${group?.name ?? "our group"}" on Unique`,
    );
    const body = encodeURIComponent(
      `Hi! I'd like to invite you to join "${group?.name ?? "our group"}" on Unique.\n\n${window.location.href}`,
    );
    window.location.href = `mailto:${encodeURIComponent(email)}?subject=${subject}&body=${body}`;
    setInviteEmail("");
    toast({
      title: "Invite ready",
      description: `Email draft opened for ${email}.`,
    });
  };

  const themeOptions = [
    { id: "violet", label: "Violet", class: "bg-violet-500" },
    { id: "rose", label: "Rose", class: "bg-rose-500" },
    { id: "emerald", label: "Emerald", class: "bg-emerald-500" },
    { id: "amber", label: "Amber", class: "bg-amber-500" },
    { id: "sky", label: "Sky", class: "bg-sky-500" },
  ];

  const applyTheme = (id: string) => {
    setThemeColor(id);
    localStorage.setItem(`group-theme-${groupId}`, id);
    toast({
      title: "Theme updated",
      description: `Group theme set to ${id}.`,
    });
  };

  const toggleAchievements = () => {
    const next = !achievementsEnabled;
    setAchievementsEnabled(next);
    localStorage.setItem(`group-achievements-${groupId}`, next ? "on" : "off");
    toast({
      title: next ? "Achievements enabled" : "Achievements disabled",
      description: next
        ? "Members can now earn badges for activity."
        : "Achievements are turned off for this group.",
    });
  };

  const toggleAnonymous = () => {
    const next = !anonymousEnabled;
    setAnonymousEnabled(next);
    localStorage.setItem(`group-anonymous-${groupId}`, next ? "on" : "off");
    toast({
      title: next ? "Anonymous posts enabled" : "Anonymous posts disabled",
      description: next
        ? "Members can now post anonymously."
        : "All posts will show authors.",
    });
  };

  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: group, isLoading: isLoadingGroup } = useQuery({
    queryKey: ["group", groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("groups")
        .select("*")
        .eq("id", groupId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!groupId,
  });

  const { data: membership } = useQuery({
    queryKey: ["group-membership", groupId, user?.id],
    queryFn: async () => {
      if (!user || !groupId) return null;
      const { data } = await supabase
        .from("group_members")
        .select("*")
        .eq("group_id", groupId)
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user && !!groupId,
  });

  const { data: members = [] } = useQuery({
    queryKey: ["group-members", groupId],
    queryFn: async () => {
      const { data } = await supabase
        .from("group_members")
        .select(`
          *,
          profiles:user_id (
            id,
            display_name,
            avatar_url
          )
        `)
        .eq("group_id", groupId)
        .order("joined_at", { ascending: false });
      return data || [];
    },
    enabled: !!groupId,
  });

  const { data: posts = [] } = useQuery({
    queryKey: ["group-posts", groupId],
    queryFn: async () => {
      const { data } = await (supabase
        .from("posts") as any)
        .select(`
          *,
          profiles:user_id (
            id,
            display_name,
            avatar_url
          )
        `)
        .eq("group_id", groupId)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!groupId,
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      if (!user || !groupId) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("group_members")
        .upsert(
          { group_id: groupId, user_id: user.id, role: "member" },
          { onConflict: "group_id,user_id", ignoreDuplicates: true }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-membership"] });
      queryClient.invalidateQueries({ queryKey: ["group-members"] });
      toast({ title: "Joined group!" });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: async () => {
      if (!user || !groupId) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("group_id", groupId)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-membership"] });
      queryClient.invalidateQueries({ queryKey: ["group-members"] });
      toast({ title: "Left group" });
      navigate("/wall/groups");
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async () => {
      if (!user || !groupId || !postContent.trim()) throw new Error("Invalid data");
      const { error } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          content: postContent,
          group_id: groupId,
          image_url: postImage || null,
        } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-posts"] });
      setPostContent("");
      setPostImage(undefined);
      toast({ title: "Post created!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateCoverMutation = useMutation({
    mutationFn: async (coverImage: string) => {
      const { error } = await supabase
        .from("groups")
        .update({ cover_image: coverImage })
        .eq("id", groupId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      setIsEditingCover(false);
      setNewCoverImage(undefined);
      toast({ title: "Cover image updated!" });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("group_id", groupId)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-members"] });
      toast({ title: "Member removed" });
    },
  });

  const makeAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("group_members")
        .update({ role: "admin" })
        .eq("group_id", groupId)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-members"] });
      toast({ title: "Member promoted to admin!" });
    },
  });

  const setRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: "admin" | "moderator" | "member" }) => {
      const { error } = await supabase
        .from("group_members")
        .update({ role })
        .eq("group_id", groupId)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ["group-members"] });
      toast({ title: `Role set to ${vars.role}` });
    },
  });

  // Loading state
  if (isLoadingGroup) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  // Group not found
  if (!group) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-black mb-4">Group not found</h1>
        <Button onClick={() => navigate("/wall/groups")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Groups
        </Button>
      </div>
    );
  }

  const isAdmin = membership?.role === "admin";
  const isStaff = isAdmin || membership?.role === "moderator";
  const isMember = !!membership;
  const memberCount = members.length;
  const adminCount = members.filter((m: any) => m.role === "admin").length;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Cover Section */}
      <div className="relative">
        {/* Back Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate("/wall/groups")}
          className="absolute top-4 left-4 z-20 shadow-lg"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div 
          className="h-40 md:h-56 bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 relative group"
          style={group.cover_image ? { 
            backgroundImage: `url(${group.cover_image})`, 
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          } : {}}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          
          {isAdmin && (
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
                    folder="groups"
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

      {/* Group Info Card */}
      <div className="max-w-2xl mx-auto px-4 -mt-12 relative z-10">
        <Card className="p-5 text-center">
          {/* Centered Avatar */}
          <div className="flex justify-center -mt-14 mb-3">
            <Avatar className="h-20 w-20 border-4 border-background shadow-xl">
              <AvatarImage src={group.cover_image} />
              <AvatarFallback className="text-2xl bg-primary/20 text-primary">
                {group.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Group Name & Privacy */}
          <h1 className="text-xl font-bold flex items-center justify-center gap-2">
            {group.name}
            {group.is_private ? (
              <Lock className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Globe className="h-4 w-4 text-muted-foreground" />
            )}
          </h1>

          {/* Members & Admins */}
          <div className="flex items-center justify-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {memberCount} members
            </span>
            <span className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              {adminCount} admins
            </span>
            <Badge variant={group.is_private ? "secondary" : "outline"} className="text-xs">
              {group.is_private ? "Private" : "Public"}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-2 mt-4">
            {!isMember ? (
              <Button onClick={() => joinMutation.mutate()} size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Join Group
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={toggleNotifications}
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
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => {
                        if (window.confirm("Leave this group? You'll lose access to member-only posts.")) {
                          leaveMutation.mutate();
                        }
                      }}
                    >
                      Leave Group
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
              <p className="text-xl font-bold text-primary">{memberCount}</p>
              <p className="text-xs text-muted-foreground">Members</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-primary">
                {format(new Date(group.created_at), "yyyy")}
              </p>
              <p className="text-xs text-muted-foreground">Created</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full grid grid-cols-4 md:grid-cols-5 gap-1 h-auto p-1 mb-4">
            <TabsTrigger value="posts" className="text-xs">Posts</TabsTrigger>
            <TabsTrigger value="members" className="text-xs">Members</TabsTrigger>
            <TabsTrigger value="media" className="text-xs">Media</TabsTrigger>
            <TabsTrigger value="about" className="text-xs">About</TabsTrigger>
            {isStaff && <TabsTrigger value="admin" className="text-xs">Admin</TabsTrigger>}
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-6">
            {/* Create Post - Only for members */}
            {isMember && (
              <Card className="p-4 overflow-hidden">
                <div className="flex gap-3">
                  <Avatar className="shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user?.email?.[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0 space-y-3">
                    <Textarea
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="What's on your mind?"
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
                        {["😊 Happy", "😢 Sad", "😍 In Love", "🤔 Thoughtful", "😎 Cool", "🎉 Celebrating", "😴 Tired", "🔥 Motivated", "💪 Strong", "🙏 Grateful", "😋 Hungry", "🥳 Excited"].map((feeling) => (
                          <Button
                            key={feeling}
                            size="sm"
                            variant="ghost"
                            className="text-sm"
                            onClick={() => {
                              setPostFeeling(feeling);
                              setShowEmojiPicker(false);
                            }}
                          >
                            {feeling}
                          </Button>
                        ))}
                      </div>
                    )}

                    {/* Post Image Preview */}
                    {postImage && (
                      <div className="relative">
                        <img src={postImage} alt="Post" className="rounded-lg max-h-48 object-cover w-full" />
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

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-purple-500 hover:bg-purple-50"
                          onClick={() => {
                            const name = prompt("Enter username to tag:");
                            if (name) {
                              setPostContent(prev => prev + ` @${name} `);
                              toast({ title: "Tagged!", description: `@${name} added to your post` });
                            }
                          }}
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </div>

                      <Button
                        onClick={() => {
                          createPostMutation.mutate();
                          setPostLocation(undefined);
                          setPostFeeling(undefined);
                        }}
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

            {/* Posts Feed */}
            {posts.length === 0 ? (
              <Card className="p-12 text-center">
                <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                <p className="text-muted-foreground">
                  {isMember ? "Be the first to post something!" : "Join the group to see and create posts."}
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {posts.map((post: any) => (
                  <Card key={post.id} className="p-4">
                    <div className="flex gap-3">
                      <Avatar>
                        <AvatarImage src={post.profiles?.avatar_url} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {post.profiles?.display_name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-semibold">
                              {post.profiles?.display_name || "User"}
                            </span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {format(new Date(post.created_at), "PPp")}
                            </span>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  const url = `${window.location.origin}/post/${post.id}`;
                                  navigator.clipboard.writeText(url);
                                  toast({ title: "Link copied", description: "Post link copied to clipboard." });
                                }}
                              >
                                <Share2 className="h-4 w-4 mr-2" />
                                Copy link
                              </DropdownMenuItem>
                              {post.user_id === user?.id && (
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={async () => {
                                    const { error } = await supabase
                                      .from("posts")
                                      .delete()
                                      .eq("id", post.id);
                                    if (error) {
                                      toast({ title: "Error", description: error.message, variant: "destructive" });
                                    } else {
                                      toast({ title: "Deleted", description: "Post removed." });
                                      queryClient.invalidateQueries({ queryKey: ["group-posts", groupId] });
                                    }
                                  }}
                                >
                                  Delete post
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <p className="mt-2 whitespace-pre-wrap">{post.content}</p>
                        
                        {post.image_url && (
                          <img 
                            src={post.image_url} 
                            alt="Post" 
                            className="mt-3 rounded-lg max-h-96 object-cover w-full"
                          />
                        )}
                        
                        {/* Post Actions */}
                        <WallPostActions
                          postId={post.id}
                          initialLikesCount={post.likes_count || 0}
                          initialCommentsCount={post.comments_count || 0}
                          initialRepostsCount={post.reposts_count || 0}
                          variant="labeled"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-4">
            {/* Invite Section - Only for admins */}
            {isAdmin && (
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Invite Members
                </h3>
                <div className="flex gap-2">
                  <Input
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter email or username..."
                    className="flex-1"
                  />
                  <Button onClick={handleInvite}>
                    <Send className="h-4 w-4 mr-2" />
                    Invite
                  </Button>
                </div>
              </Card>
            )}

            {/* Admins Section */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Crown className="h-4 w-4 text-yellow-500" />
                Admins ({adminCount})
              </h3>
              <div className="grid gap-2">
                {members.filter((m: any) => m.role === "admin").map((member: any) => (
                  <Card key={member.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.profiles?.avatar_url} />
                          <AvatarFallback className="bg-yellow-500/10 text-yellow-600">
                            {member.profiles?.display_name?.[0] || "A"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold flex items-center gap-2">
                            {member.profiles?.display_name || "Admin"}
                            <Shield className="h-3 w-3 text-yellow-500" />
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Joined {format(new Date(member.joined_at), "PP")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Members Section */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Members ({members.filter((m: any) => m.role === "member").length})
              </h3>
              <div className="grid gap-2">
                {members.filter((m: any) => m.role === "member").map((member: any) => (
                  <Card key={member.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.profiles?.avatar_url} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {member.profiles?.display_name?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">
                            {member.profiles?.display_name || "User"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Joined {format(new Date(member.joined_at), "PP")}
                          </p>
                        </div>
                      </div>
                      {isAdmin && member.user_id !== user?.id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setRoleMutation.mutate({ userId: member.user_id, role: "admin" })}>
                              <Shield className="h-4 w-4 mr-2" />
                              Make Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setRoleMutation.mutate({ userId: member.user_id, role: "moderator" })}>
                              <Shield className="h-4 w-4 mr-2 opacity-60" />
                              Make Moderator
                            </DropdownMenuItem>
                            {member.role !== "member" && (
                              <DropdownMenuItem onClick={() => setRoleMutation.mutate({ userId: member.user_id, role: "member" })}>
                                Demote to Member
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => removeMemberMutation.mutate(member.user_id)}
                            >
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media">
            <Card className="p-12 text-center">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Media Gallery</h3>
              <p className="text-muted-foreground">
                Photos and videos shared in this group will appear here.
              </p>
            </Card>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about">
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">About this group</h3>
                <p className="text-muted-foreground">
                  {group.description || "No description provided."}
                </p>
              </div>
              
              <div className="grid gap-4">
                <div className="flex items-center gap-3">
                  {group.is_private ? (
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Globe className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">{group.is_private ? "Private" : "Public"}</p>
                    <p className="text-sm text-muted-foreground">
                      {group.is_private 
                        ? "Only members can see posts and who's in the group."
                        : "Anyone can see posts and who's in the group."}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Created</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(group.created_at), "PPPP")}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{memberCount} Members</p>
                    <p className="text-sm text-muted-foreground">
                      {adminCount} admins · {memberCount - adminCount} members
                    </p>
                  </div>
                </div>
              </div>
            </Card>
            <div className="mt-4">
              <GroupRulesEditor groupId={groupId!} isStaff={false} />
            </div>
          </TabsContent>

          {/* Admin Tab */}
          {isStaff && (
            <TabsContent value="admin" className="space-y-4">
              <GroupRulesEditor groupId={groupId!} isStaff={isStaff} />
              {isAdmin && <GroupInsightsPanel groupId={groupId!} />}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Group Settings
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">🎨 Unique Feature: Group Themes</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Customize your group's look with unique themes and colors!
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {themeOptions.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => applyTheme(opt.id)}
                          className={`h-8 w-8 rounded-full ${opt.class} ring-2 transition-all ${
                            themeColor === opt.id
                              ? "ring-foreground scale-110"
                              : "ring-transparent hover:ring-border"
                          }`}
                          aria-label={`Use ${opt.label} theme`}
                          title={opt.label}
                        />
                      ))}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowThemeDialog(true)}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Preview Theme
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">🏆 Unique Feature: Group Achievements</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Enable achievements and badges for active members!
                    </p>
                    <Button
                      variant={achievementsEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={toggleAchievements}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      {achievementsEnabled ? "Achievements: On" : "Enable Achievements"}
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">🎭 Unique Feature: Anonymous Mode</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Allow members to post anonymously for sensitive topics!
                    </p>
                    <Button
                      variant={anonymousEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={toggleAnonymous}
                    >
                      {anonymousEnabled ? "Anonymous: On" : "Enable Anonymous Posts"}
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}