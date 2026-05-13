import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Check, X } from "lucide-react";
import { useModerationQueue } from "@/hooks/useModerationQueue";
import { ScrollArea } from "@/components/ui/scroll-area";

export const ModerationQueueDialog = ({ communityId }: { communityId?: string }) => {
  const { items, review } = useModerationQueue(communityId);
  const pending = items.filter((i: any) => i.status === "pending");

  const sevColor = (s?: string) =>
    s === "critical" ? "destructive" : s === "high" ? "destructive" : s === "medium" ? "default" : "secondary";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Moderation queue">
          <ShieldCheck className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Moderation queue ({pending.length})</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] space-y-2">
          {pending.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">All clear</p>}
          {pending.map((item: any) => (
            <div key={item.id} className="p-3 rounded-lg border border-border/40 mb-2 space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant={sevColor(item.ai_severity) as any}>
                  {item.ai_severity ?? "analyzing..."}
                </Badge>
                <span className="text-xs text-muted-foreground">{item.content_type}</span>
              </div>
              {item.ai_categories?.length ? (
                <div className="flex gap-1 flex-wrap">
                  {item.ai_categories.map((c: string) => <Badge key={c} variant="outline">{c}</Badge>)}
                </div>
              ) : null}
              <p className="text-sm">{item.ai_summary || item.reason}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => review({ id: item.id, status: "approved", action: "kept" })}>
                  <Check className="h-4 w-4 mr-1" /> Keep
                </Button>
                <Button size="sm" variant="destructive" onClick={() => review({ id: item.id, status: "rejected", action: "removed" })}>
                  <X className="h-4 w-4 mr-1" /> Remove
                </Button>
              </div>
            </div>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
