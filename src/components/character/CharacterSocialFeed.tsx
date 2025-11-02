import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Send, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

export const CharacterSocialFeed = () => {
  const [postContent, setPostContent] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: characters } = useQuery({
    queryKey: ["user-characters"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("characters")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return data;
    },
  });

  const { data: posts } = useQuery({
    queryKey: ["character-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("character_posts")
        .select(`
          *,
          characters (name, image_url, category)
        `)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
  });

  const createPost = useMutation({
    mutationFn: async (data: { characterId: string; content: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("character_posts")
        .insert({
          character_id: data.characterId,
          user_id: user.id,
          content: data.content,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Post created!");
      setPostContent("");
      setSelectedCharacter(null);
      queryClient.invalidateQueries({ queryKey: ["character-posts"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create post");
    },
  });

  const likePost = useMutation({
    mutationFn: async (postId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("character_post_likes")
        .insert({
          post_id: postId,
          user_id: user.id,
        });

      if (error) {
        // If already liked, unlike it
        if (error.code === "23505") {
          await supabase
            .from("character_post_likes")
            .delete()
            .eq("post_id", postId)
            .eq("user_id", user.id);
        } else {
          throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["character-posts"] });
    },
  });

  const handlePost = () => {
    if (!selectedCharacter || !postContent.trim()) {
      toast.error("Please select a character and write something");
      return;
    }

    createPost.mutate({ characterId: selectedCharacter, content: postContent });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-6 w-6 text-blue-500" />
          <h2 className="text-2xl font-bold text-foreground">Character Social Network</h2>
        </div>

        <div className="space-y-4">
          <select
            value={selectedCharacter || ""}
            onChange={(e) => setSelectedCharacter(e.target.value)}
            className="w-full bg-background border-2 border-border rounded-md p-3 text-foreground font-medium focus:border-primary focus:outline-none"
          >
            <option value="" className="text-muted-foreground">Select a character to post as...</option>
            {characters?.map((char) => (
              <option key={char.id} value={char.id} className="text-foreground">
                {char.name} ({char.category})
              </option>
            ))}
          </select>

          <Textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="Share your character's journey, achievements, or challenge others..."
            className="min-h-[100px] font-medium"
          />

          <Button
            onClick={handlePost}
            disabled={createPost.isPending}
            className="w-full"
          >
            <Send className="mr-2 h-4 w-4" />
            Post to Feed
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        {posts?.map((post) => (
          <Card key={post.id} className="p-6">
            <div className="flex items-start gap-3">
              {post.characters?.image_url && (
                <img
                  src={post.characters.image_url}
                  alt={post.characters.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-foreground font-bold">{post.characters?.name}</span>
                  <span className="text-muted-foreground text-sm">•</span>
                  <span className="text-muted-foreground font-medium text-sm">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-foreground font-medium mb-4">{post.content}</p>
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => likePost.mutate(post.id)}
                    className="text-muted-foreground hover:text-red-500"
                  >
                    <Heart className="mr-1 h-4 w-4" />
                    {post.likes_count}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-blue-500"
                  >
                    <MessageCircle className="mr-1 h-4 w-4" />
                    {post.comments_count}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
