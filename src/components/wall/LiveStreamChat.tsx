import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useLiveStreamChat } from "@/hooks/useLiveStreamChat";

export function LiveStreamChat({ livePostId }: { livePostId: string }) {
  const [text, setText] = useState("");
  const { messages, send } = useLiveStreamChat(livePostId);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const submit = () => { if (text.trim()) { send(text); setText(""); } };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-2 p-3">
        {messages.map((m) => (
          <div key={m.id} className="text-sm">
            <span className="font-medium text-primary mr-1">{m.user_id.slice(0, 6)}:</span>
            <span>{m.content}</span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="flex gap-2 p-2 border-t">
        <Input value={text} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="Say something…" />
        <Button size="icon" onClick={submit}><Send className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}
