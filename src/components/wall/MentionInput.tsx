import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMentions } from "@/hooks/useMentions";

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const MentionInput = ({ value, onChange, placeholder }: MentionInputProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [mentionQuery, setMentionQuery] = useState("");
  const { searchUsers } = useMentions();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const loadSuggestions = async () => {
      if (mentionQuery.length > 0) {
        const users = await searchUsers(mentionQuery);
        setSuggestions(users || []);
      }
    };
    loadSuggestions();
  }, [mentionQuery]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Check for @ mentions
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = newValue.substring(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setMentionQuery("");
    }
  };

  const selectMention = (username: string) => {
    const cursorPosition = textareaRef.current?.selectionStart || 0;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const textAfterCursor = value.substring(cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      const newText = 
        textBeforeCursor.substring(0, mentionMatch.index) +
        `@${username} ` +
        textAfterCursor;
      onChange(newText);
    }

    setShowSuggestions(false);
    setMentionQuery("");
  };

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={3}
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-popover border rounded-lg shadow-lg max-h-48 overflow-auto">
          {suggestions.map((user) => (
            <button
              key={user.id}
              className="w-full flex items-center gap-2 p-2 hover:bg-accent text-left"
              onClick={() => selectMention(user.username || user.full_name)}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback>{user.full_name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{user.full_name}</p>
                {user.username && (
                  <p className="text-xs text-muted-foreground">@{user.username}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
