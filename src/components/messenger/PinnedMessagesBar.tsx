import { useMessagePins } from "@/hooks/useMessagePins";
import { Pin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export function PinnedMessagesBar({ conversationId }: { conversationId: string }) {
  const { data, unpin } = useMessagePins(conversationId);
  if (!data || data.length === 0) return null;
  const top = data[0] as any;

  return (
    <div className="flex items-center gap-2 border-b border-border/40 bg-primary/5 px-3 py-2">
      <FloatingHowItWorks
        title={"Pinned Messages Bar"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <Pin className="h-3.5 w-3.5 text-primary shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
          Pinned {data.length > 1 ? `(${data.length})` : ""}
        </p>
        <p className="truncate text-xs">{top.messages?.content ?? "Message"}</p>
      </div>
      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => unpin(top.id)}>
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}
