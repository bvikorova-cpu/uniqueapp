import { useEffect, useState, useCallback } from "react";
import { Heart, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { canonicalUrl } from "@/lib/canonicalUrl";
import { shareLink } from "@/lib/shareLink";

import { toast } from "sonner";

interface Props {
  storyId: string;
  authorId: string;
}

export const StoryInteractions = ({ storyId }: Props) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const loadLikes = useCallback(async () => {
    const { data } = await (supabase as any)
      .from("story_reactions")
      .select("user_id")
      .eq("story_id", storyId)
      .eq("reaction", "like");
    const rows = (data || []) as { user_id: string }[];
    setLikeCount(rows.length);
    setLiked(!!user && rows.some((r) => r.user_id === user.id));
  }, [storyId, user]);

  useEffect(() => { loadLikes(); }, [loadLikes]);

  const toggleLike = async () => {
    if (!user) { toast.error("Sign in to like stories"); return; }
    if (liked) {
      setLiked(false); setLikeCount((c) => Math.max(0, c - 1));
      const { error } = await (supabase as any)
        .from("story_reactions").delete()
        .eq("story_id", storyId).eq("user_id", user.id).eq("reaction", "like");
      if (error) { toast.error("Could not remove like"); loadLikes(); }
    } else {
      setLiked(true); setLikeCount((c) => c + 1);
      const { error } = await (supabase as any)
        .from("story_reactions")
        .insert({ story_id: storyId, user_id: user.id, reaction: "like" });
      if (error) { toast.error("Could not like story"); loadLikes(); }
    }
  };

  const share = async () => {
    const url = canonicalUrl(`/wall?story=${storyId}`);
    const result = await shareLink({ title: "Story on Unique", text: "Check out this story on Unique", url });
    if (result === "copied") toast.success("Link copied to clipboard");
    else if (result === "failed") toast.error("Could not share this story");
  };


  return (
    <div onClick={(e) => e.stopPropagation()} className="w-full">
      <div className="flex items-center gap-4">
        <button onClick={toggleLike} className="flex items-center gap-1.5 text-white" aria-label="Like story">
          <Heart className={`w-6 h-6 ${liked ? "fill-red-500 text-red-500" : ""}`} />
          <span className="text-sm">{likeCount}</span>
        </button>
        <button onClick={share} className="flex items-center gap-1.5 text-white" aria-label="Share story">
          <Share2 className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
