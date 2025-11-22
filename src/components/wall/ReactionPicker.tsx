import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useReactions } from "@/hooks/useReactions";

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
  const { getReactionCounts, toggleReaction } = useReactions(postId);
  const counts = getReactionCounts();

  const handleReaction = (type: string) => {
    toggleReaction(type);
    setOpen(false);
  };

  const totalReactions = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm">
            <span className="text-xl mr-2">👍</span>
            React
            {totalReactions > 0 && (
              <span className="ml-2 text-muted-foreground">({totalReactions})</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <div className="flex gap-1">
            {REACTIONS.map((reaction) => (
              <button
                key={reaction.type}
                onClick={() => handleReaction(reaction.type)}
                className="p-2 hover:bg-accent rounded-lg transition-colors relative group"
                title={reaction.label}
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
        </PopoverContent>
      </Popover>
      
      {/* Display reaction summary */}
      {totalReactions > 0 && (
        <div className="flex gap-1">
          {Object.entries(counts).map(([type, count]) => {
            const reaction = REACTIONS.find((r) => r.type === type);
            if (!reaction || count === 0) return null;
            return (
              <span key={type} className="text-sm flex items-center">
                {reaction.emoji} {count}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};
