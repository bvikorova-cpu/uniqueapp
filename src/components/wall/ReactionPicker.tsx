import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useReactions } from "@/hooks/useReactions";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";
import { ReactionsDialog } from "@/components/wall/ReactionsDialog";

interface ReactionPickerProps {
  postId: string;
}

const REACTIONS = [
  { type: "like", emoji: "👍", label: "Like" },
  { type: "love", emoji: "❤️", label: "Love" },
  { type: "laugh", emoji: "😂", label: "Laugh" },
  { type: "wow", emoji: "😮", label: "Wow" },
  { type: "sad", emoji: "😢", label: "Sad" },
  { type: "angry", emoji: "😠", label: "Angry" },
];

export const ReactionPicker = ({ postId }: ReactionPickerProps) => {
  const [open, setOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { reactions, getReactionCounts, toggleReaction } = useReactions(postId);
  const counts = getReactionCounts();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  }, []);

  // Find user's current reaction
  const userReaction = reactions.find((r) => r.user_id === currentUserId);
  const userReactionType = userReaction?.reaction_type;
  const userReactionEmoji = REACTIONS.find((r) => r.type === userReactionType)?.emoji;

  const handleReaction = (type: string) => {
    toggleReaction(type);
    setOpen(false);
  };

  const handleRemoveReaction = () => {
    if (userReactionType) {
      toggleReaction(userReactionType);
      setOpen(false);
    }
  };

  const totalReactions = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={userReactionType ? "text-primary" : ""}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-xl mr-2">{userReactionEmoji || "👍"}</span>
            {userReactionType ? "Reacted" : "React"}
            {totalReactions > 0 && (
              <span
                role="button"
                tabIndex={0}
                className="ml-2 text-muted-foreground hover:underline cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setListOpen(true);
                }}
              >
                ({totalReactions})
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-2"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex flex-col gap-2">
            <div className="flex gap-1">
              {REACTIONS.map((reaction) => (
                <button
                  key={reaction.type}
                  type="button"
                  onClick={(e) => { e.preventDefault(); handleReaction(reaction.type); }}
                  className={`p-2 hover:bg-accent rounded-lg transition-colors relative group ${
                    userReactionType === reaction.type 
                      ? "bg-primary/20 ring-2 ring-primary" 
                      : ""
                  }`}
                  title={userReactionType === reaction.type ? `Remove ${reaction.label}` : reaction.label}
                >
                  <span className="text-2xl">{reaction.emoji}</span>
                  {counts[reaction.type] > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {counts[reaction.type]}
                    </span>
                  )}
                </button>
              ))}
            </div>
            {userReactionType && (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); handleRemoveReaction(); }}
                className="flex items-center justify-center gap-1 text-sm text-destructive hover:bg-destructive/10 rounded-lg p-2 transition-colors"
              >
                <X className="h-4 w-4" />
                Remove reaction
              </button>
            )}
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Display reaction breakdown only when multiple different reaction types exist */}
      {Object.values(counts).filter((c) => c > 0).length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setListOpen(true);
          }}
          className="flex gap-1 hover:bg-accent rounded-md px-2 py-1 transition-colors"
          aria-label="View who reacted"
        >
          {Object.entries(counts).map(([type, count]) => {
            const reaction = REACTIONS.find((r) => r.type === type);
            if (!reaction || count === 0) return null;
            return (
              <span key={type} className="text-sm flex items-center">
                {reaction.emoji} {count}
              </span>
            );
          })}
        </button>
      )}

      <ReactionsDialog
        open={listOpen}
        onOpenChange={setListOpen}
        reactions={reactions.map((r: any) => ({
          user_id: r.user_id,
          reaction_type: r.reaction_type,
        }))}
        reactionMeta={REACTIONS}
      />
    </div>
  );
};
