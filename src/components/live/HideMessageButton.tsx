import { EyeOff, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  messageId: string;
  isHidden: boolean;
  moderatorId: string;
}

export function HideMessageButton({ messageId, isHidden, moderatorId }: Props) {
  const qc = useQueryClient();
  const toggle = async () => {
    const { error } = await (supabase as any)
      .from("stream_messages")
      .update({
        is_hidden: !isHidden,
        hidden_by: !isHidden ? moderatorId : null,
        hidden_at: !isHidden ? new Date().toISOString() : null,
      })
      .eq("id", messageId);
    if (error) {
      toast.error("Failed to update");
      return;
    }
    toast.success(isHidden ? "Message restored" : "Message hidden");
    qc.invalidateQueries({ queryKey: ["stream-messages"] });
  };

  return (
    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={toggle} aria-label={isHidden ? "Unhide" : "Hide"}>
      {isHidden ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
    </Button>
  );
}
