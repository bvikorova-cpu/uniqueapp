import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { useHashtags } from "@/hooks/useHashtags";
import { Hash } from "lucide-react";

interface HashtagInputProps {
  text: string;
  onHashtagsChange?: (hashtags: string[]) => void;
}

export const HashtagInput = ({ text, onHashtagsChange }: HashtagInputProps) => {
  const { extractHashtags } = useHashtags();
  const [hashtags, setHashtags] = useState<string[]>([]);

  useEffect(() => {
    const tags = extractHashtags(text);
    setHashtags(tags);
    onHashtagsChange?.(tags);
  }, [text]);

  if (hashtags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {hashtags.map((tag, index) => (
        <Badge key={index} variant="secondary" className="gap-1">
          <Hash className="w-3 h-3" />
          {tag}
        </Badge>
      ))}
    </div>
  );
};
