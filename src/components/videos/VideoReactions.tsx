import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { Smile } from "lucide-react";

interface VideoReactionsProps {
  videoId: string;
  onUpdate?: () => void;
}

const reactions = [
  { type: "like", emoji: "👍", label: "Like" },
  { type: "love", emoji: "❤️", label: "Love" },
  { type: "haha", emoji: "😂", label: "Haha" },
  { type: "wow", emoji: "😮", label: "Wow" },
  { type: "sad", emoji: "😢", label: "Sad" },
  { type: "angry", emoji: "😠", label: "Angry" },
];

export function VideoReactions({ videoId, onUpdate }: VideoReactionsProps) {
  const [currentReaction, setCurrentReaction] = useState<string | null>(null);
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchReactions();
    checkUserReaction();
  }, [videoId]);

  const fetchReactions = async () => {
    const { data } = await supabase
      .from("video_reactions")
      .select("reaction_type")
      .eq("video_id", videoId);

    if (data) {
      const counts: Record<string, number> = {};
      data.forEach((r) => {
        counts[r.reaction_type] = (counts[r.reaction_type] || 0) + 1;
      });
      setReactionCounts(counts);
    }
  };

  const checkUserReaction = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("video_reactions")
      .select("reaction_type")
      .eq("video_id", videoId)
      .eq("user_id", user.id)
      .maybeSingle();

    setCurrentReaction(data?.reaction_type || null);
  };

  const handleReaction = async (reactionType: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Please log in to react", variant: "destructive" });
      return;
    }

    if (currentReaction === reactionType) {
      // Remove reaction
      await supabase
        .from("video_reactions")
        .delete()
        .eq("video_id", videoId)
        .eq("user_id", user.id);
      setCurrentReaction(null);
      toast({ title: "Reaction removed" });
    } else {
      // Add or update reaction
      await supabase.from("video_reactions").upsert({
        video_id: videoId,
        user_id: user.id,
        reaction_type: reactionType,
      }, {
        onConflict: 'video_id,user_id'
      });
      setCurrentReaction(reactionType);
      toast({ title: "Reacted!" });
    }
    
    fetchReactions();
    onUpdate?.();
  };

  const totalReactions = Object.values(reactionCounts).reduce((a, b) => a + b, 0);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Smile className="h-4 w-4 mr-2" />
          {currentReaction
            ? reactions.find((r) => r.type === currentReaction)?.emoji
            : "React"}
          {totalReactions > 0 && ` (${totalReactions})`}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <div className="flex gap-2">
          {reactions.map((reaction) => (
            <Button
              key={reaction.type}
              variant={currentReaction === reaction.type ? "default" : "ghost"}
              size="sm"
              onClick={() => handleReaction(reaction.type)}
              className="relative"
            >
              <span className="text-2xl">{reaction.emoji}</span>
              {reactionCounts[reaction.type] > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {reactionCounts[reaction.type]}
                </span>
              )}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
