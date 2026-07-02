import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Trash2, CornerDownRight } from "lucide-react";
import { useCouponComments, type CouponComment } from "@/hooks/useCouponComments";
import { formatDistanceToNow } from "date-fns";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { couponId: string; userId: string | null; }

export function CouponComments({ couponId, userId }: Props) {
  const { comments, post, remove } = useCouponComments(couponId, userId);
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const tree = (parentId: string | null): CouponComment[] => comments.filter(c => c.parent_id === parentId);

  const Node = ({ c, depth = 0 }: { c: CouponComment; depth?: number }) => (
    <div style={{ marginLeft: depth * 16 }} className="border-l-2 border-border/40 pl-3 py-2">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <p className={`text-sm ${c.is_deleted ? "italic text-muted-foreground" : ""}`}>{c.body}</p>
          <div className="flex gap-3 mt-1 text-[11px] text-muted-foreground">
            <span>{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</span>
            {!c.is_deleted && userId && <button className="hover:text-primary" onClick={() => setReplyTo(c.id)}>Reply</button>}
            {!c.is_deleted && userId === c.user_id && (
              <button className="hover:text-rose-500" onClick={() => remove(c.id)}><Trash2 className="w-3 h-3 inline" /></button>
            )}
          </div>
          {replyTo === c.id && (
            <div className="mt-2 flex gap-2">
              <Textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Reply…" className="min-h-[60px] text-sm" />
              <div className="flex flex-col gap-1">
                <Button size="sm" onClick={() => { post(body, c.id); setBody(""); setReplyTo(null); }}><CornerDownRight className="w-3 h-3" /></Button>
                <Button size="sm" variant="ghost" onClick={() => setReplyTo(null)}>×</Button>
              </div>
            </div>
          )}
        </div>
      </div>
      {tree(c.id).map(child => <Node key={child.id} c={child} depth={depth + 1} />)}
    </div>
  );

  return (
    <>
      <FloatingHowItWorks title={"Coupon Comments - How it works"} steps={[{ title: 'Open', desc: 'Access the Coupon Comments section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Coupon Comments.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-sm">Comments & Q&A ({comments.filter(c => !c.is_deleted).length})</h3>
        </div>
        {userId ? (
          <div className="flex gap-2">
            <Textarea value={replyTo ? "" : body} onChange={e => setBody(e.target.value)} placeholder="Ask a question or share your experience…" className="min-h-[60px] text-sm" />
            <Button onClick={() => { post(body); setBody(""); }}>Post</Button>
          </div>
        ) : <p className="text-xs text-muted-foreground">Login to post a comment.</p>}
        <div className="space-y-1 max-h-96 overflow-auto">
          {tree(null).length === 0 && <p className="text-xs text-muted-foreground">No comments yet — be first to ask.</p>}
          {tree(null).map(c => <Node key={c.id} c={c} />)}
        </div>
      </CardContent>
    </Card>
    </>
  );
}
