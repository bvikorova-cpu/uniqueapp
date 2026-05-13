import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Info, ThumbsUp, ThumbsDown, Plus } from "lucide-react";
import { usePostNotes } from "@/hooks/usePostNotes";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export const PostNotes = ({ postId }: { postId: string }) => {
  const { notes, addNote, vote } = usePostNotes(postId);
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [body, setBody] = useState("");

  const approved = notes.filter((n: any) => n.status === "approved");

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs">
          <Info className="h-3.5 w-3.5 mr-1" />
          Community notes {approved.length ? `(${approved.length})` : ""}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 mt-2">
        {approved.map((n: any) => (
          <div key={n.id} className="p-3 rounded-lg bg-muted/30 border border-border/40 space-y-2">
            <p className="text-sm">{n.body}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => vote({ noteId: n.id, isHelpful: true })}>
                <ThumbsUp className="h-3.5 w-3.5 mr-1" /> {n.helpful_count}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => vote({ noteId: n.id, isHelpful: false })}>
                <ThumbsDown className="h-3.5 w-3.5 mr-1" /> {n.not_helpful_count}
              </Button>
            </div>
          </div>
        ))}
        {!adding ? (
          <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add a note
          </Button>
        ) : (
          <div className="space-y-2">
            <Textarea
              placeholder="Add context, source, correction..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => { addNote(body); setBody(""); setAdding(false); }} disabled={!body.trim()}>
                Submit
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};
