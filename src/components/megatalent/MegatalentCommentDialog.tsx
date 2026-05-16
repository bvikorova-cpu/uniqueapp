import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface Props {
  openId: string | null;
  comments: Record<string, any[]>;
  commentText: string;
  onCommentTextChange: (v: string) => void;
  onClose: () => void;
  onSubmit: (id: string) => void;
}

const MegatalentCommentDialog = ({ openId, comments, commentText, onCommentTextChange, onClose, onSubmit }: Props) => (
  <Dialog open={!!openId} onOpenChange={(open) => { if (!open) onClose(); }}>
    <DialogContent className="max-w-lg max-h-[80vh]">
      <DialogHeader><DialogTitle>Comments</DialogTitle></DialogHeader>
      <ScrollArea className="h-[400px] pr-4">
        {openId && comments[openId]?.length > 0 ? (
          <div className="space-y-4">
            {comments[openId].map((comment: any) => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center text-black text-sm font-semibold shrink-0">{comment.profiles?.full_name?.[0] || 'U'}</div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{comment.profiles?.full_name || 'User'}</p>
                  <p className="text-sm text-muted-foreground mt-1">{comment.comment_text}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(comment.created_at).toLocaleDateString('en-US')}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">No comments yet</p>
        )}
      </ScrollArea>
      <div className="flex gap-2 mt-4">
        <Input placeholder="Add a comment..." value={commentText} onChange={(e) => onCommentTextChange(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey && openId) { e.preventDefault(); onSubmit(openId); } }} />
        <Button size="sm" className="bg-yellow-500 text-black" onClick={() => openId && onSubmit(openId)}><Send className="h-4 w-4" /></Button>
      </div>
    </DialogContent>
  </Dialog>
);

export default MegatalentCommentDialog;
