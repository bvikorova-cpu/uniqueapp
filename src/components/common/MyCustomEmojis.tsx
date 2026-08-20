import { useAuth } from "@/contexts/AuthContext";
import { useCustomEmojis } from "@/hooks/useCustomEmojis";

interface MyCustomEmojisProps {
  onSelect: (emoji: string) => void;
  /** Tailwind size class for the emoji buttons */
  className?: string;
}

/**
 * Row of the user's own custom emojis (created in the Emoji Creator).
 * Renders nothing when the user has no custom emojis.
 */
export const MyCustomEmojis = ({ onSelect, className = "" }: MyCustomEmojisProps) => {
  const { user } = useAuth();
  const { emojis } = useCustomEmojis(user?.id);

  if (!emojis.length) return null;

  return (
    <div className={`mb-2 ${className}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
        My emojis
      </p>
      <div className="flex flex-wrap gap-1">
        {emojis.map((e) => (
          <button
            key={e.id}
            type="button"
            title={e.name}
            onClick={() => onSelect(e.emoji)}
            className="text-2xl leading-none p-1 rounded-lg hover:bg-muted transition-colors"
          >
            {e.emoji}
          </button>
        ))}
      </div>
    </div>
  );
};
