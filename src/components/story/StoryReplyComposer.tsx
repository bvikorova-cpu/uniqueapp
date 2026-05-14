import { useState } from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStoryReplies } from "@/hooks/useStoryReplies";

interface Props {
  storyId: string;
  recipientId: string;
}

export const StoryReplyComposer = ({ storyId, recipientId }: Props) => {
  const [text, setText] = useState("");
  const { sendReply } = useStoryReplies(storyId);

  const handleSend = () => {
    if (!text.trim()) return;
    sendReply({ recipientId, content: text.trim() });
    setText("");
  };

  return (
    <div className="flex gap-2 items-center bg-background/40 backdrop-blur-md border border-white/10 rounded-full px-3 py-1.5">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder="Reply to story..."
        className="border-0 bg-transparent focus-visible:ring-0 text-sm"
      />
      <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={handleSend}>
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};
