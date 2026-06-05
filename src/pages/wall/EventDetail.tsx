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
import { AddToCalendarButtons } from "@/components/events/AddToCalendarButtons";
import { RsvpControls } from "@/components/events/RsvpControls";
import { TicketQRCard } from "@/components/events/TicketQRCard";
import { useEventTickets } from "@/hooks/useEventTickets";
import type { Event, EventAttendee } from "@/types/database";
import { 
  ArrowLeft, 
  Calendar,
  MapPin,
  Clock,
  Users,
  Settings,
  Send,
  Heart,
  MessageCircle,
  Share2,
  Camera,
  MoreHorizontal,
  Bell,
  BellOff,
  ImagePlus,
  Video,
  Smile,
  Check,
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
} from "@/components/ui/dialog";
import { WallPostActions } from "@/components/wall/WallPostActions";

const EMOJIS = ["😊", "😂", "❤️", "🔥", "👍", "🎉", "😍", "🤔", "😢", "😎", "🙏", "💪"];

export default function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [commentContent, setCommentContent] = useState("");
  const [postImage, setPostImage] = useState<string | undefined>();
  const [postLocation, setPostLocation] = useState<string | undefined>();
  const [postFeeling, setPostFeeling] = useState<string | undefined>();
  const [isEditingCover, setIsEditingCover] = useState(false);
  const [newCoverImage, setNewCoverImage] = useState<string | undefined>();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [notifyEnabled, setNotifyEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(`event-notify-${eventId}`) !== "off";
  });

  const toggleEventNotifications = () => {
    const next = !notifyEnabled;
    setNotifyEnabled(next);
    localStorage.setItem(`event-notify-${eventId}`, next ? "on" : "off");
    toast({
      title: next ? "Notifications enabled" : "Notifications muted",
      description: next
        ? "You'll be notified about updates to this event."
        : "You won't receive updates from this event.",
    });
  };

  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: event, isLoading: isLoadingEvent } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });

  const { data: attendance } = useQuery({
    queryKey: ["event-attendance", eventId, user?.id],
    queryFn: async () => {
      if (!user || !eventId) return null;
      const { data } = await supabase
        .from("event_attendees")
        .select("*")
        .eq("event_id", eventId)
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user && !!eventId,
  });

  const { data: attendees = [] } = useQuery({
    queryKey: ["event-attendees", eventId],
    queryFn: async () => {
      const { data } = await supabase
        .from("event_attendees")
        .select(`
          *,
          profiles:user_id (
            id,
            display_name,
            avatar_url
          )
        `)
        .eq("event_id", eventId)
        .order("joined_at", { ascending: false });
      return data || [];
    },
    enabled: !!eventId,
  });

  const { data: discussions = [] } = useQuery({
    queryKey: ["event-discussions", eventId],
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
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!eventId,
  });

  const rsvpMutation = useMutation({
    mutationFn: async (status: string) => {
      if (!user || !eventId) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("event_attendees")
        .upsert({
          event_id: eventId,
          user_id: user.id,
          status,
        }, {
          onConflict: "event_id,user_id"
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-attendance"] });
      queryClient.invalidateQueries({ queryKey: ["event-attendees"] });
      toast({ title: "RSVP updated!" });
    },
  });

  const createDiscussionMutation = useMutation({
    mutationFn: async () => {
      if (!user || !eventId || !commentContent.trim()) throw new Error("Invalid data");
      const { error } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          content: commentContent + (postFeeling ? ` ${postFeeling}` : "") + (postLocation ? ` 📍 ${postLocation}` : ""),
          event_id: eventId,
          image_url: postImage || null,
        } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-discussions"] });
      setCommentContent("");
      setPostImage(undefined);
      setPostLocation(undefined);
      setPostFeeling(undefined);
      toast({ title: "Comment added!" });
    },
  });

  const updateCoverMutation = useMutation({
    mutationFn: async (coverImage: string) => {
      const { error } = await supabase
        .from("events")
        .update({ cover_image: coverImage })
        .eq("id", eventId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      setIsEditingCover(false);
      setNewCoverImage(undefined);
      toast({ title: "Cover image updated!" });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("events")
        .update({ 
          title: editTitle,
          description: editDescription,
          location: editLocation
        })
        .eq("id", eventId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      setShowSettingsDialog(false);
      toast({ title: "Event updated!" });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);
      if (error) throw error;
    },
    onSuccess: () => {
      navigate("/wall/events");
      toast({ title: "Event deleted!" });
    },
  });

  const openSettings = () => {
    setEditTitle(event?.title || "");
    setEditDescription(event?.description || "");
    setEditLocation(event?.location || "");
    setShowSettingsDialog(true);
  };

  // Loading state
  if (isLoadingEvent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  // Event not found
  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-black mb-4">Event not found</h1>
        <Button onClick={() => navigate("/wall/events")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>
      </div>
    );
  }

  const isCreator = user?.id === event.creator_id;
  const goingCount = attendees.filter((a: any) => a.status === "going").length;
  const interestedCount = attendees.filter((a: any) => a.status === "interested").length;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Cover Section */}
      <div className="relative">
        {/* Back Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate("/wall/events")}
          className="absolute top-4 left-4 z-20 shadow-lg"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div 
          className="h-40 md:h-56 bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 relative group"
          style={event.cover_image ? { 
            backgroundImage: `url(${event.cover_image})`, 
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          } : {}}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          
          {isCreator && (
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
                    folder="events"
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

      {/* Event Info Card */}
      <div className="max-w-2xl mx-auto px-4 -mt-12 relative z-10">
        <Card className="p-5 text-center">
          {/* Centered Calendar Icon */}
          <div className="flex justify-center -mt-14 mb-3">
            <div className="h-20 w-20 border-4 border-background shadow-xl rounded-xl bg-primary flex items-center justify-center">
              <Calendar className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>

          {/* Event Title */}
          <h1 className="text-xl font-bold">{event.title}</h1>

          {/* Date & Location */}
          <div className="flex flex-col items-center gap-1 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {format(new Date(event.start_time), "PPPP 'at' p")}
            </span>
            {event.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {event.location}
              </span>
            )}
          </div>

          {/* Attendees Count */}
          <div className="flex items-center justify-center gap-4 mt-3 text-sm text-muted-foreground">
            <Badge variant="secondary" className="gap-1">
              <Check className="h-3 w-3" />
              {goingCount} going
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Star className="h-3 w-3" />
              {interestedCount} interested
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-2 mt-4">
            {!isCreator ? (
              <>
                <Button
                  variant={attendance?.status === "going" ? "default" : "outline"}
                  onClick={() => rsvpMutation.mutate("going")}
                  size="sm"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Going
                </Button>
                <Button
                  variant={attendance?.status === "interested" ? "default" : "outline"}
                  onClick={() => rsvpMutation.mutate("interested")}
                  size="sm"
                >
                  <Star className="h-4 w-4 mr-1" />
                  Interested
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={toggleEventNotifications}
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
                  onClick={toggleEventNotifications}
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
                      Edit Event
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>

          {/* Add to Calendar */}
          {event && (
            <div className="flex justify-center mt-3">
              <AddToCalendarButtons
                event={{
                  uid: event.id,
                  title: event.title,
                  description: event.description || undefined,
                  location: event.location || undefined,
                  startsAt: new Date(event.start_time),
                  endsAt: new Date(event.end_time || event.start_time),
                  url: typeof window !== "undefined" ? window.location.href : undefined,
                }}
              />
            </div>
          )}

          {/* Quick Stats */}
          <div className="flex justify-center gap-8 mt-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-xl font-bold text-primary">{discussions.length}</p>
              <p className="text-xs text-muted-foreground">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-primary">{goingCount + interestedCount}</p>
              <p className="text-xs text-muted-foreground">Responses</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-primary">
                {format(new Date(event.start_time), "d")}
              </p>
              <p className="text-xs text-muted-foreground">{format(new Date(event.start_time), "MMM")}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* RSVP + Tickets */}
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Your RSVP</h3>
          <RsvpControls eventId={event.id} capacity={(event as any).capacity || undefined} />
          <UserTicketsBlock eventId={event.id} userId={user?.id} eventTitle={event.title} />
        </Card>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <Tabs defaultValue="discussion" className="w-full">
          <TabsList className="w-full grid grid-cols-4 mb-4">
            <TabsTrigger value="discussion" className="text-xs">Discussion</TabsTrigger>
            <TabsTrigger value="attendees" className="text-xs">Attendees</TabsTrigger>
            <TabsTrigger value="media" className="text-xs">Media</TabsTrigger>
            <TabsTrigger value="about" className="text-xs">About</TabsTrigger>
          </TabsList>

          {/* Discussion Tab */}
          <TabsContent value="discussion" className="space-y-6">
            {/* Create Post */}
            <Card className="p-4 overflow-hidden">
              <div className="flex gap-3">
                <Avatar className="shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user?.email?.[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0 space-y-3">
                  <Textarea
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="Write something about this event..."
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
                                setCommentContent(prev => prev + `\n${urlData.publicUrl}`);
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
                      onClick={() => createDiscussionMutation.mutate()}
                      disabled={!commentContent.trim()}
                      size="sm"
                      className="shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Discussion List */}
            <div className="space-y-4">
              {discussions.length === 0 && (
                <Card className="p-8 text-center text-muted-foreground">
                  No discussion yet. Be the first to comment!
                </Card>
              )}
              {discussions.map((post: any) => (
                <Card key={post.id} className="p-4">
                  <div className="flex gap-3">
                    <Avatar className="shrink-0">
                      <AvatarImage src={post.profiles?.avatar_url} />
                      <AvatarFallback>
                        {post.profiles?.display_name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {post.profiles?.display_name || "User"}
                        </span>
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

          {/* Attendees Tab */}
          <TabsContent value="attendees" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Going ({goingCount})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {attendees
                  .filter((a: any) => a.status === "going")
                  .map((attendee: any) => (
                    <div key={attendee.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                      <Avatar>
                        <AvatarImage src={attendee.profiles?.avatar_url} />
                        <AvatarFallback>
                          {attendee.profiles?.display_name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {attendee.profiles?.display_name || "User"}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>

              <h3 className="text-lg font-semibold mb-4">
                Interested ({interestedCount})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {attendees
                  .filter((a: any) => a.status === "interested")
                  .map((attendee: any) => (
                    <div key={attendee.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                      <Avatar>
                        <AvatarImage src={attendee.profiles?.avatar_url} />
                        <AvatarFallback>
                          {attendee.profiles?.display_name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {attendee.profiles?.display_name || "User"}
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
                {discussions.filter((p: any) => p.image_url).map((post: any) => (
                  <div key={post.id} className="aspect-square rounded-lg overflow-hidden">
                    <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              {discussions.filter((p: any) => p.image_url).length === 0 && (
                <p className="text-center text-muted-foreground">No media yet</p>
              )}
            </Card>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Event Details</h3>
              <div className="space-y-4">
                {event.description && (
                  <div>
                    <p className="text-sm font-medium">Description</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {event.description}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">Date & Time</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.start_time), "PPPP 'at' p")}
                  </p>
                  {event.end_time && (
                    <p className="text-sm text-muted-foreground">
                      to {format(new Date(event.end_time), "PPPP 'at' p")}
                    </p>
                  )}
                </div>
                {event.location && (
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{event.location}</p>
                  </div>
                )}
                {event.max_attendees && (
                  <div>
                    <p className="text-sm font-medium">Max Attendees</p>
                    <p className="text-sm text-muted-foreground">{event.max_attendees}</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Event Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Event Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Event Title</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter event title..."
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
              <label className="text-sm font-medium">Location</label>
              <Input
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                placeholder="Enter location..."
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={() => updateEventMutation.mutate()}
                disabled={!editTitle.trim()}
                className="flex-1"
              >
                Save Changes
              </Button>
              <Button 
                variant="destructive"
                onClick={() => {
                  if (confirm("Are you sure you want to delete this event?")) {
                    deleteEventMutation.mutate();
                  }
                }}
              >
                Delete Event
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const UserTicketsBlock = ({ eventId, userId, eventTitle }: { eventId: string; userId?: string; eventTitle: string }) => {
  const { tickets } = useEventTickets(eventId, userId);
  if (!userId || tickets.length === 0) return null;
  return (
    <div className="space-y-3 pt-2 border-t">
      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Your Tickets</h4>
      {tickets.map((t) => (
        <TicketQRCard key={t.id} ticket={t} eventTitle={eventTitle} />
      ))}
    </div>
  );
};
