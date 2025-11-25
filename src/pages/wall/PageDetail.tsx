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
import { 
  ArrowLeft, 
  Settings, 
  Image as ImageIcon,
  Send,
  Heart,
  MessageCircle,
  Share2
} from "lucide-react";
import { format } from "date-fns";

export default function PageDetail() {
  const { pageId } = useParams();
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

  const { data: page } = useQuery({
    queryKey: ["page", pageId],
    queryFn: async () => {
      const { data } = await supabase
        .from("pages")
        .select("*, profiles(*)")
        .eq("id", pageId)
        .single();
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

  const { data: posts = [] } = useQuery({
    queryKey: ["page-posts", pageId],
    queryFn: async () => {
      const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("page_id", pageId)
        .order("created_at", { ascending: false });
      return (data || []) as any[];
    },
    enabled: !!pageId,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!user || !pageId) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("page_followers")
        .insert({
          page_id: pageId,
          user_id: user.id,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page-following"] });
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
          content: postContent,
          page_id: pageId,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page-posts"] });
      setPostContent("");
      toast({ title: "Post created!" });
    },
  });

  if (!page) return null;

  const isOwner = user?.id === page.user_id;

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
      <Button
        variant="ghost"
        onClick={() => navigate("/wall/pages")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Pages
      </Button>

      <Card className="overflow-hidden">
        {page.cover_image_url && (
          <div className="h-48 bg-gradient-to-r from-primary/20 to-primary/10 relative">
            <img
              src={page.cover_image_url}
              alt={page.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 rounded-md">
                <AvatarImage src={page.avatar_url} />
                <AvatarFallback className="rounded-md text-2xl">{page.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">{page.name}</h1>
                {page.category && (
                  <p className="text-sm text-muted-foreground">{page.category}</p>
                )}
                <p className="text-muted-foreground">
                  {page.follower_count || 0} followers
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {!isOwner && (
                <>
                  {!isFollowing ? (
                    <Button onClick={() => followMutation.mutate()}>
                      Follow
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={() => unfollowMutation.mutate()}>
                      Following
                    </Button>
                  )}
                </>
              )}
              {isOwner && (
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              )}
            </div>
          </div>

          {page.description && (
            <p className="text-muted-foreground mb-6">{page.description}</p>
          )}

          <Tabs defaultValue="posts" className="w-full">
            <TabsList>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="mt-6 space-y-4">
              {isOwner && (
                <Card className="p-4">
                  <div className="flex gap-3">
                    <Avatar className="rounded-md">
                      <AvatarImage src={page.avatar_url} />
                      <AvatarFallback className="rounded-md">
                        {page.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3">
                      <Textarea
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        placeholder="Share something with your followers..."
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
                      <Avatar className="rounded-md">
                        <AvatarImage src={page.avatar_url} />
                        <AvatarFallback className="rounded-md">
                          {page.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{page.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(post.created_at), "PPp")}
                          </span>
                        </div>
                        <p className="mt-2">{post.content}</p>
                        
                        <div className="flex items-center gap-4 mt-4 pt-3 border-t">
                          <Button variant="ghost" size="sm">
                            <Heart className="h-4 w-4 mr-2" />
                            Like
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Comment
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="about" className="mt-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">About</h3>
                <div className="space-y-3">
                  {page.description && (
                    <p className="text-sm">{page.description}</p>
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
      </Card>
    </div>
  );
}
