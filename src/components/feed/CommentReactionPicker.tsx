import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { Smile, X } from "lucide-react";
import { ReactionsDialog } from "@/components/wall/ReactionsDialog";

interface CommentReactionPickerProps {
  commentId: string;
}

const REACTIONS = [
  { type: "like", emoji: "👍", label: "Like" },
  { type: "love", emoji: "❤️", label: "Love" },
  { type: "laugh", emoji: "😂", label: "Laugh" },
  { type: "wow", emoji: "😮", label: "Wow" },
  { type: "sad", emoji: "😢", label: "Sad" },
  { type: "angry", emoji: "😠", label: "Angry" },
];

export const CommentReactionPicker = ({ commentId }: CommentReactionPickerProps) => {
  const [open, setOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [reactions, setReactions] = useState<any[]>([]);
  const [userReaction, setUserReaction] = useState<string | null>(null);

  useEffect(() => {
    fetchReactions();
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  }, [commentId]);

  const fetchReactions = async () => {
    const { data } = await supabase
      .from("comment_reactions")
      .select("*")
      .eq("comment_id", commentId);
    
    setReactions(data || []);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user && data) {
      const myReaction = data.find(r => r.user_id === user.id);
      setUserReaction(myReaction?.reaction_type || null);
    }
  };

  const handleReaction = async (type: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (userReaction === type) {
      // Remove reaction
      await supabase
        .from("comment_reactions")
        .delete()
        .eq("comment_id", commentId)
        .eq("user_id", user.id);
      setUserReaction(null);
    } else {
      // Upsert reaction
      await supabase.from("comment_reactions").upsert({
        comment_id: commentId,
        user_id: user.id,
        reaction_type: type,
      }, { onConflict: "comment_id,user_id" });
      setUserReaction(type);
    }
    
    fetchReactions();
    setOpen(false);
  };

  const counts: Record<string, number> = {};
  reactions.forEach(r => {
    counts[r.reaction_type] = (counts[r.reaction_type] || 0) + 1;
  });

  const totalReactions = reactions.length;
  const userReactionEmoji = REACTIONS.find(r => r.type === userReaction)?.emoji;

  return (
    <div className="flex items-center gap-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[10px]">
            {userReactionEmoji || <Smile className="h-3 w-3" />}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-1.5" align="start">
          <div className="flex gap-0.5">
            {REACTIONS.map((reaction) => (
              <button
                key={reaction.type}
                onClick={() => handleReaction(reaction.type)}
                className={`p-1 hover:bg-accent rounded transition-colors ${
                  userReaction === reaction.type ? "bg-primary/20 ring-1 ring-primary" : ""
                }`}
                title={reaction.label}
              >
                <span className="text-base">{reaction.emoji}</span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      
      {totalReactions > 0 && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setListOpen(true);
          }}
          className="flex gap-0.5 text-[10px] hover:bg-accent rounded px-1 py-0.5 transition-colors"
          aria-label="View who reacted"
        >
          {Object.entries(counts).slice(0, 3).map(([type, count]) => {
            const reaction = REACTIONS.find(r => r.type === type);
            if (!reaction) return null;
            return (
              <span key={type} className="flex items-center">
                {reaction.emoji}{count > 1 && count}
              </span>
            );
          })}
        </button>
      )}

      <ReactionsDialog
        open={listOpen}
        onOpenChange={setListOpen}
        reactions={reactions.map((r) => ({
          user_id: r.user_id,
          reaction_type: r.reaction_type,
        }))}
        reactionMeta={REACTIONS}
      />
    </div>
  );
};
