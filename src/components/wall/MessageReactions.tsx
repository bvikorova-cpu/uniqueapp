import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Smile } from "lucide-react";
import type { MessageReaction } from "@/hooks/useMessageReactions";

const QUICK = ["❤️", "😂", "😮", "😢", "👍", "🔥"];

interface Props {
  messageId: string;
  reactions: MessageReaction[];
  currentUserId?: string;
  onToggle: (messageId: string, emoji: string) => void;
  align?: "start" | "end";
}

export const MessageReactions = ({ messageId, reactions, currentUserId, onToggle, align = "start" }: Props) => {
  const counts = reactions.reduce<Record<string, { count: number; mine: boolean }>>((acc, r) => {
    acc[r.reaction] ||= { count: 0, mine: false };
    acc[r.reaction].count += 1;
    if (r.user_id === currentUserId) acc[r.reaction].mine = true;
    return acc;
  }, {});

  return (
    <div className="flex items-center gap-1 mt-1">
      {Object.entries(counts).map(([emoji, { count, mine }]) => (
        <button
          key={emoji}
          onClick={() => onToggle(messageId, emoji)}
          className={`text-xs rounded-full px-1.5 py-0.5 border transition-colors ${
            mine ? "bg-primary/20 border-primary/40" : "bg-muted border-transparent hover:bg-muted/80"
          }`}
        >
          {emoji} {count}
        </button>
      ))}
      <Popover>
        <PopoverTrigger asChild>
          <button className="text-muted-foreground hover:text-foreground p-0.5 opacity-60 hover:opacity-100">
            <Smile className="h-3.5 w-3.5" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-1.5" side="top" align={align}>
          <div className="flex gap-1">
            {QUICK.map((e) => (
              <button
                key={e}
                onClick={() => onToggle(messageId, e)}
                className="text-lg hover:bg-muted rounded p-1"
              >
                {e}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
