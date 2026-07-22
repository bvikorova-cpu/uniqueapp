import { useState } from "react";
import { usePostReactions, ReactionType } from "@/hooks/usePostReactions";
import { Button } from "@/components/ui/button";
import { Popover,
  PopoverContent,
  PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ReactionsBarProps {
  postId: string;
  className?: string;
}

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: "like", emoji: "👍", label: "Like" },
  { type: "love", emoji: "❤️", label: "Love" },
  { type: "laugh", emoji: "😂", label: "Laugh" },
  { type: "wow", emoji: "😮", label: "Wow" },
  { type: "sad", emoji: "😢", label: "Sad" },
  { type: "angry", emoji: "😠", label: "Angry" },
  { type: "care", emoji: "🤗", label: "Care" },
];

export const ReactionsBar = ({ postId, className }: ReactionsBarProps) => {
  const [open, setOpen] = useState(false);
  const { reactions, addReaction, getReactionCounts } = usePostReactions(postId);
  const counts = getReactionCounts();

  const handleReaction = (type: ReactionType) => {
    addReaction({ postId, reactionType: type });
    setOpen(false);
  };

  const topReactions = Object.entries(counts)
    .filter(([_, count]) => count > 0)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 3);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm">
            React
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <div className="flex gap-2">
            {REACTIONS.map((reaction) => (
              <Button
                key={reaction.type}
                variant="ghost"
                size="sm"
                className="text-2xl hover:scale-125 transition-transform"
                onClick={() => handleReaction(reaction.type)}
                title={reaction.label}
              >
                {reaction.emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {topReactions.length > 0 && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          {topReactions.map(([type]) => {
            const reaction = REACTIONS.find((r) => r.type === type);
            return (
              <span key={type} className="text-base">
                {reaction?.emoji}
              </span>
            );
          })}
          <span className="ml-1">
            {Object.values(counts).reduce((a, b) => a + b, 0)}
          </span>
        </div>
      )}
    </div>
  );
};
