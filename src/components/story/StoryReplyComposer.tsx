import { useState } from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStoryReplies } from "@/hooks/useStoryReplies";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
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
    <>
      <FloatingHowItWorks title="How Story Reply Composer works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
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
    </>
    );
};
