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
import type { Group, GroupMember } from "@/types/database";
import { 
  ArrowLeft, 
  Users, 
  Settings, 
  Image as ImageIcon,
  Send,
  UserPlus,
  Shield
} from "lucide-react";
import { format } from "date-fns";

export default function GroupDetail() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [postContent, setPostContent] = useState("");

  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: group } = useQuery({
    queryKey: ["group", groupId],
    queryFn: async () => {
      const { data } = await supabase
        .from("groups")
        .select("*, profiles(*)")
        .eq("id", groupId)
        .single();
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
        .single();
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
      const { data, error } = await (supabase
        .from("posts") as any)
        .select("id, content, created_at, user_id, image_url, likes_count, comments_count, shares_count")
        .eq("group_id", groupId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!groupId,
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      if (!user || !groupId) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("group_members")
        .upsert(
          {
            group_id: groupId,
            user_id: user.id,
            role: "member",
          },
          {
            onConflict: "group_id,user_id",
            ignoreDuplicates: true,
          }
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
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-posts"] });
      setPostContent("");
      toast({ title: "Post created!" });
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
      toast({ title: "Member promoted to admin" });
    },
  });

  if (!group) return null;

  const isAdmin = membership?.role === "admin";
  const isMember = !!membership;

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
      <Button
        variant="ghost"
        onClick={() => navigate("/wall/groups")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Groups
      </Button>

      <Card className="overflow-hidden">
        {group.cover_image && (
          <div className="h-48 bg-gradient-to-r from-primary/20 to-primary/10 relative">
            <img
              src={group.cover_image}
              alt={group.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={group.cover_image} />
                <AvatarFallback className="text-2xl">{group.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">{group.name}</h1>
                <p className="text-muted-foreground">
                  {group.is_private ? "Private" : "Public"} Group · {members.length} members
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {!isMember ? (
                <Button onClick={() => joinMutation.mutate()}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Join Group
                </Button>
              ) : (
                <>
                  {isAdmin && (
                    <Button variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => leaveMutation.mutate()}>
                    Leave Group
                  </Button>
                </>
              )}
            </div>
          </div>

          {group.description && (
            <p className="text-muted-foreground mb-6">{group.description}</p>
          )}

          <Tabs defaultValue="posts" className="w-full">
            <TabsList>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              {isAdmin && <TabsTrigger value="admin">Admin</TabsTrigger>}
            </TabsList>

            <TabsContent value="posts" className="mt-6 space-y-4">
              {isMember && (
                <Card className="p-4">
                  <div className="flex gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {user?.email?.[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3">
                      <Textarea
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        placeholder="What's on your mind?"
                        rows={3}
                      />
                      <div className="flex justify-between items-center">
                        <Button variant="ghost" size="sm">
                          <ImageIcon className="h-4 w-4 mr-2" />
                          Photo
                        </Button>
                        <Button
                          onClick={() => createPostMutation.mutate()}
                          disabled={!postContent.trim()}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Post
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              <div className="space-y-4">
                {posts.map((post: any) => (
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
                        <p className="mt-2">{post.content}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="members" className="mt-6">
              <div className="space-y-3">
                {members.map((member: any) => (
                  <Card key={member.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.profiles?.avatar_url} />
                          <AvatarFallback>
                            {member.profiles?.display_name?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">
                            {member.profiles?.display_name || "User"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {member.role === "admin" && (
                              <span className="flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                Admin
                              </span>
                            )}
                            {member.role === "member" && "Member"}
                          </p>
                        </div>
                      </div>
                      {isAdmin && member.user_id !== user?.id && (
                        <div className="flex gap-2">
                          {member.role === "member" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => makeAdminMutation.mutate(member.user_id)}
                            >
                              Make Admin
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeMemberMutation.mutate(member.user_id)}
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {isAdmin && (
              <TabsContent value="admin" className="mt-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Group Settings</h3>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Admin controls coming soon...
                    </p>
                  </div>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </Card>
    </div>
  );
}
