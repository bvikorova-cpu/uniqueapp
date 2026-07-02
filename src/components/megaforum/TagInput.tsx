import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
}

export const TagInput = ({ tags, onChange, maxTags = 5 }: TagInputProps) => {
  const [input, setInput] = useState("");

  const addTag = () => {
    const tag = input.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (tag && !tags.includes(tag) && tags.length < maxTags) {
      onChange([...tags, tag]);
      setInput("");
    }
  };

  return (
    <div className="space-y-2">
      <FloatingHowItWorks
        title={"Tag Input"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <div className="flex gap-1 flex-wrap">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-[10px] gap-1 pr-1">
            #{tag}
            <button onClick={() => onChange(tags.filter(t => t !== tag))} className="hover:text-destructive">
              <X className="h-2.5 w-2.5" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        placeholder={tags.length >= maxTags ? "Max tags reached" : "Add tag (press Enter)..."}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
        disabled={tags.length >= maxTags}
        className="text-xs h-8"
      />
    </div>
  );
};
