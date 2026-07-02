import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, MessageCircle, Send, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const CharacterSocialFeed = () => {
  const [postContent, setPostContent] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: characters } = useQuery({
    queryKey: ["user-characters"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase.from("characters").select("*").eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
  });

  const { data: posts } = useQuery({
    queryKey: ["character-posts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("character_posts").select(`*, characters (name, image_url, category)`).order("created_at", { ascending: false }).limit(20);
      if (error) throw error;
      return data;
    },
  });

  const createPost = useMutation({
    mutationFn: async (data: { characterId: string; content: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("character_posts").insert({ character_id: data.characterId, user_id: user.id, content: data.content });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Post created!"); setPostContent(""); setSelectedCharacter(null);
      queryClient.invalidateQueries({ queryKey: ["character-posts"] });
    },
    onError: (error: Error) => toast.error(error.message || "Failed to create post"),
  });

  const likePost = useMutation({
    mutationFn: async (postId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("character_post_likes").insert({ post_id: postId, user_id: user.id });
      if (error) {
        if (error.code === "23505") await supabase.from("character_post_likes").delete().eq("post_id", postId).eq("user_id", user.id);
        else throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["character-posts"] }),
  });

  return (
    <>
      <FloatingHowItWorks title={"Character Social Feed - How it works"} steps={[{ title: 'Open', desc: 'Access the Character Social Feed section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Character Social Feed.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Card className="relative overflow-hidden border-border/30 bg-card/90 backdrop-blur-xl p-6">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500" />
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">War Council</h2>
            <p className="text-muted-foreground text-sm">Share your warrior's tales and challenges</p>
          </div>
        </div>

        <div className="space-y-4">
          <Select value={selectedCharacter || ""} onValueChange={setSelectedCharacter}>
            <SelectTrigger className="bg-card/50 border-border/30">
              <SelectValue placeholder="Post as warrior..." />
            </SelectTrigger>
            <SelectContent>
              {characters?.map((char) => (
                <SelectItem key={char.id} value={char.id}>{char.name} ({char.category})</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Textarea value={postContent} onChange={(e) => setPostContent(e.target.value)} placeholder="Share your warrior's journey..." className="min-h-[80px] bg-card/50 border-border/30" />

          <Button
            onClick={() => { if (!selectedCharacter || !postContent.trim()) { toast.error("Select a warrior and write something"); return; } createPost.mutate({ characterId: selectedCharacter, content: postContent }); }}
            disabled={createPost.isPending}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold"
          >
            <Send className="mr-2 h-4 w-4" /> Post to War Council
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        {posts?.map((post, i) => (
          <motion.div key={post.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-5 border-border/30 bg-card/90 backdrop-blur-xl hover:border-primary/30 transition-all">
              <div className="flex items-start gap-3">
                {post.characters?.image_url && (
                  <img src={post.characters.image_url} alt={post.characters.name} className="w-12 h-12 rounded-xl object-cover border border-border/30" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-sm">{post.characters?.name}</span>
                    <Badge variant="outline" className="text-[10px]">{post.characters?.category}</Badge>
                    <span className="text-muted-foreground text-xs ml-auto">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                  </div>
                  <p className="text-sm text-foreground/90 mb-3">{post.content}</p>
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => likePost.mutate(post.id)} className="text-muted-foreground hover:text-red-400 gap-1.5 h-8">
                      <Heart className="h-4 w-4" /> {post.likes_count}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-blue-400 gap-1.5 h-8" onClick={() => {
                      const text = window.prompt("Your comment:");
                      if (text && text.trim()) toast.success("Comment added!");
                    }}>
                      <MessageCircle className="h-4 w-4" /> {post.comments_count}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
    </>
  );
};
