import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Event, EventAttendee } from "@/types/database";
import { 
  ArrowLeft, 
  Calendar,
  MapPin,
  Clock,
  Users,
  Settings,
  Send
} from "lucide-react";
import { format } from "date-fns";

export default function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [commentContent, setCommentContent] = useState("");

  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: event } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const { data } = await supabase
        .from("events")
        .select("*, profiles(*)")
        .eq("id", eventId)
        .single();
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
        .single();
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
        .select("id, content, created_at, user_id, image_url, likes_count, comments_count, shares_count")
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
          content: commentContent,
          event_id: eventId,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-discussions"] });
      setCommentContent("");
      toast({ title: "Comment added!" });
    },
  });

  if (!event) return null;

  const isCreator = user?.id === event.creator_id;
  const goingCount = attendees.filter((a: any) => a.status === "going").length;
  const interestedCount = attendees.filter((a: any) => a.status === "interested").length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
      <Button
        variant="ghost"
        onClick={() => navigate("/wall/events")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Events
      </Button>

      <Card className="overflow-hidden">
        {event.cover_image && (
          <div className="h-64 bg-gradient-to-r from-primary/20 to-primary/10 relative">
            <img
              src={event.cover_image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{format(new Date(event.start_time), "PPPP 'at' p")}</span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{goingCount} going · {interestedCount} interested</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {!isCreator && (
                <>
                  <Button
                    variant={attendance?.status === "going" ? "default" : "outline"}
                    onClick={() => rsvpMutation.mutate("going")}
                  >
                    Going
                  </Button>
                  <Button
                    variant={attendance?.status === "interested" ? "default" : "outline"}
                    onClick={() => rsvpMutation.mutate("interested")}
                  >
                    Interested
                  </Button>
                </>
              )}
              {isCreator && (
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Event
                </Button>
              )}
            </div>
          </div>

          <Tabs defaultValue="about" className="w-full">
            <TabsList>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="discussion">Discussion</TabsTrigger>
              <TabsTrigger value="attendees">Attendees</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="mt-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Details</h3>
                {event.description && (
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {event.description}
                  </p>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="discussion" className="mt-6 space-y-4">
              <Card className="p-4">
                <div className="flex gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {user?.email?.[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-3">
                    <Textarea
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder="Write a comment..."
                      rows={2}
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={() => createDiscussionMutation.mutate()}
                        disabled={!commentContent.trim()}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="space-y-3">
                {discussions.map((post: any) => (
                  <Card key={post.id} className="p-4">
                    <div className="flex gap-3">
                      <Avatar>
                        <AvatarImage src={post.profiles?.avatar_url} />
                        <AvatarFallback>
                          {post.profiles?.display_name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {post.profiles?.display_name || "User"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(post.created_at), "PPp")}
                          </span>
                        </div>
                        <p className="mt-1 text-sm">{post.content}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="attendees" className="mt-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Going ({goingCount})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  {attendees
                    .filter((a: any) => a.status === "going")
                    .map((attendee: any) => (
                      <div key={attendee.id} className="flex items-center gap-3">
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
                      <div key={attendee.id} className="flex items-center gap-3">
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
          </Tabs>
        </div>
      </Card>
    </div>
  );
}
