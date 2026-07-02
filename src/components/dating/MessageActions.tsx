import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const EDIT_WINDOW_MS = 15 * 60 * 1000;

interface Props {
  messageId: string;
  currentContent: string;
  createdAt: string;
  onChanged: () => void;
}

export const MessageActions = ({ messageId, currentContent, createdAt, onChanged }: Props) => {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(currentContent);
  const withinWindow = Date.now() - new Date(createdAt).getTime() < EDIT_WINDOW_MS;

  const unsend = async () => {
    const { error } = await supabase
      .from("dating_messages")
      .update({ deleted_at: new Date().toISOString(), content: "" })
      .eq("id", messageId);
    if (error) toast({ title: "Could not unsend", description: error.message, variant: "destructive" });
    else { toast({ title: "Message unsent" }); onChanged(); }
  };

  const saveEdit = async () => {
    if (!draft.trim()) return;
    const { error } = await supabase
      .from("dating_messages")
      .update({ content: draft.trim(), edited_at: new Date().toISOString() })
      .eq("id", messageId);
    if (error) toast({ title: "Could not edit", description: error.message, variant: "destructive" });
    else { setEditing(false); onChanged(); }
  };

  return (
    <>
      <FloatingHowItWorks
        title={"Message Actions"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6 opacity-60 hover:opacity-100"><MoreVertical className="h-3 w-3" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-background z-50">
          <DropdownMenuItem disabled={!withinWindow} onClick={() => setEditing(true)}><Pencil className="h-3 w-3 mr-2" /> Edit {withinWindow ? "" : "(expired)"}</DropdownMenuItem>
          <DropdownMenuItem onClick={unsend} className="text-destructive"><Trash2 className="h-3 w-3 mr-2" /> Unsend</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit message</DialogTitle></DialogHeader>
          <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} maxLength={500} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            <Button onClick={saveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
