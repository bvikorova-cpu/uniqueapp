import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Pencil, Trash2, Check, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Props {
  table: "eco_submissions" | "healthy_submissions";
  submissionId: string;
  description: string;
  /** Called after a successful edit or delete so the parent can refresh. */
  onChanged: () => void;
}

/** Owner-only inline edit (description) + delete for a challenge submission. */
export function ChallengeSubmissionActions({ table, submissionId, description, onChanged }: Props) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(description);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    const next = text.trim();
    if (next.length < 10) {
      toast({ title: "Description too short", description: "Please use at least 10 characters.", variant: "destructive" });
      return;
    }
    setBusy(true);
    const { error } = await (supabase as any).from(table).update({ description: next }).eq("id", submissionId);
    setBusy(false);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Post updated" });
    setEditing(false);
    onChanged();
  };

  const remove = async () => {
    setBusy(true);
    const { error } = await (supabase as any).from(table).delete().eq("id", submissionId);
    setBusy(false);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Post deleted" });
    onChanged();
  };

  if (editing) {
    return (
      <div className="mt-3 space-y-2">
        <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={500} />
        <div className="flex gap-2">
          <Button size="sm" onClick={save} disabled={busy}>
            <Check className="w-4 h-4 mr-1" /> Save
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setText(description); }} disabled={busy}>
            <X className="w-4 h-4 mr-1" /> Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 mt-2">
      <Button size="sm" variant="outline" onClick={() => { setText(description); setEditing(true); }}>
        <Pencil className="w-4 h-4 mr-1" /> Edit
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
            <Trash2 className="w-4 h-4 mr-1" /> Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes your submission, its votes and comments. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={remove} disabled={busy}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
